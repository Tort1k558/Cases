import random
import json
import threading
import time
import datetime
import random
import requests

from urllib.parse import urlparse, parse_qs

from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import PasswordChangeForm
from django.http import JsonResponse
from django.conf import settings

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from .models import *
from .serializers import *

case_history_delay = 10


class UserLoginAPIView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({'error': 'Both username and password are required'}, 400)

        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            return Response({'message': 'Logged in successfully'}, 200)
        else:
            return Response({'error': 'Invalid credentials'}, 401)


class UserLogoutAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({'message': 'Logged out successfully'}, 200)


class TradeLinkAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        trade_link = str(request.data.get('trade_link'))
        if not trade_link:
            return Response({'error': 'Trade link are required'}, 400)

        user = request.user
        user.trade_link = trade_link
        user.save()

        return Response({'message': 'Trade link successfully installed'}, 200)


class ProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        case_history = CaseHistory.objects.filter(user=request.user).order_by('-opened_at')
        case_history_serializer = CaseHistoryWithUserInfoSerializer(case_history, many=True)
        user_serializer = UserSerializer(request.user)
        data = {
            **user_serializer.data,
            'case_history': case_history_serializer.data
        }

        return Response(data)


class SectionAPIView(APIView):
    def get(self, request):
        sections = Section.objects.all()
        serializer = SectionSerializer(sections, many=True)
        return Response({'sections': serializer.data}, 200)


class CaseAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, case_id):
        case = Case.objects.get(pk=case_id)
        serializer = CaseWithItemsSerializer(case)
        return Response(serializer.data, 200)

    def post(self, request, case_id):
        case = Case.objects.get(pk=case_id)

        user = request.user
        if user.balance < case.price:
            return Response({'error': "Insufficient funds on the balance sheet"}, 400)
        user.balance -= case.price
        user.save()

        items = list(case.items.all())
        if not items:
            return Response({'error': "There are no items in the case."}, 400)
        for item in items:
            if item.price == 0:
                return Response({'error': "Some no items available at the moment. Please try again later."}, 400)

        item_weights = [1 / (abs(case.price - item.price) + 1) for item in items]
        item = random.choices(items, weights=item_weights)[0]

        CaseHistory.objects.create(user=request.user, case=case, item=item)
        item_serializer = ItemSerializer(item)

        case_history = CaseHistory.objects.order_by('-opened_at')
        case_history_serializer = CaseHistorySerializer(case_history[:10], many=True)

        def send_delayed_notification(data):
            time.sleep(case_history_delay)
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                'case_updates',
                {
                    'type': 'case_opened',
                    'data': data
                }
            )

        thread = threading.Thread(target=send_delayed_notification, args=(case_history_serializer.data,))
        thread.start()

        return Response(item_serializer.data, 200)


class CaseHistoryAPIView(APIView):
    def get(self, request):
        case_history = CaseHistory.objects.filter(opened_at__second__gt=case_history_delay).order_by('-opened_at')
        serializer = CaseHistorySerializer(case_history[:10], many=True)
        return Response(serializer.data, 200)


class WithdrawItemAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        history_id = request.data.get('history_id')
        if not history_id:
            return Response({'error': 'History id are required'}, 400)

        history = CaseHistory.objects.get(pk=history_id)
        if history.withdrawn:
            return Response({'error': 'Item is already withdrawn'}, 400)

        item = history.item

        parsed_url = urlparse(request.user.trade_link)
        query_parameters = parse_qs(parsed_url.query)

        partner = query_parameters.get('partner', [None])[0]
        token = query_parameters.get('token', [None])[0]

        if partner is None or token is None:
            return Response({'error': 'Invalid trade link. Partner or token is missing.'},
                            400)

        url = (f"https://market.csgo.com/api/v2/buy-for?key={settings.MARKET_KEY}&hash_name="
               f"{item.name + ' (Factory New)'}&price={int(item.price * 100)}&partner={partner}&token={token}")

        response = requests.post(url)
        if response.status_code != 200:
            return Response({'error': 'Failed to withdraw item from CSGO Market'}, 500)

        data = response.json()
        success = data.get('success', False)
        if not success:
            error_message = data.get('error', 'Unknown error')
            return Response({'error': error_message}, 400)

        history.withdrawn = True
        history.save()
        return Response({'message': 'Item withdrawal request sent'}, 200)
