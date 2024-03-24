from rest_framework import serializers
from allauth.socialaccount.models import SocialAccount
from .models import *


class UserSteamSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialAccount
        fields = ['extra_data']


class UserSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['username', 'email', 'balance', 'trade_link', 'avatar']

    def get_avatar(self, obj):
        social_account = obj.socialaccount_set.filter(provider='steam').first()
        if social_account:
            serializer = UserSteamSerializer(social_account)
            return serializer.data.get('extra_data', {}).get('avatarfull')
        else:
            return None


class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ['name', 'price', 'rarity', 'image']


class CaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Case
        fields = ['id', 'name', 'price', 'section', 'image']


class CaseWithItemsSerializer(serializers.ModelSerializer):
    items = ItemSerializer(many=True, read_only=True)

    class Meta:
        model = Case
        fields = ['id', 'name', 'price', 'items', 'section', 'image']


class SectionSerializer(serializers.ModelSerializer):
    cases = serializers.SerializerMethodField()

    def get_cases(self, obj):
        cases = Case.objects.filter(section=obj)
        serializer = CaseSerializer(cases, many=True)
        return serializer.data

    class Meta:
        model = Section
        fields = ['name', 'cases']


class CaseHistorySerializer(serializers.ModelSerializer):
    case = CaseSerializer()
    item = ItemSerializer()

    class Meta:
        model = CaseHistory
        fields = ['case', 'item', 'opened_at']


class CaseHistoryWithUserInfoSerializer(serializers.ModelSerializer):
    case = CaseSerializer()
    item = ItemSerializer()

    class Meta:
        model = CaseHistory
        fields = ['id', 'case', 'item', 'opened_at', 'withdrawn']
