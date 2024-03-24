import requests
import os
import aiohttp
import asyncio
import threading

from django.contrib import admin
from django.urls import path
from django.http import HttpResponseRedirect
from django.conf import settings
from django.core.files.base import ContentFile

from .models import *


class CaseHistoryInline(admin.TabularInline):
    model = CaseHistory


@admin.register(User)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['username', 'balance']
    inlines = [CaseHistoryInline]


def download_image(image_url, item):
    response = requests.get(image_url)
    if response.status_code == 200:
        image_content = response.content
        item.image.save(os.path.basename(image_url), ContentFile(image_content), save=True)


@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ['name', 'price', 'rarity']
    search_fields = ['name']

    def load_items(self, request):
        url = "https://bymykel.github.io/CSGO-API/api/en/skins.json"
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            threads = []
            for item_data in data:
                existing_item = Item.objects.filter(name=item_data['name']).first()
                if existing_item:
                    continue

                image_url = item_data['image']
                rarity_id = item_data['rarity']['id']
                rarity_mapping = {
                    'common': 1,
                    'uncommon': 2,
                    'rare': 3,
                    'mythical': 4,
                    'legendary': 5,
                    'ancient': 6,
                    'contraband': 7
                }
                rarity = 0
                for key, value in rarity_mapping.items():
                    if key.lower() in rarity_id.lower():
                        rarity = value
                        break

                item = Item.objects.create(
                    name=item_data['name'],
                    price=0.0,
                    rarity=rarity,
                )

                thread = threading.Thread(target=download_image, args=(image_url, item))
                thread.start()
                threads.append(thread)

            for thread in threads:
                thread.join()

        self.message_user(request, "Items successfully loaded")
        return HttpResponseRedirect("../")

    def update_item_prices(self, request):
        url = "https://market.csgo.com/api/v2/prices/RUB.json"
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            items_data = data.get("items", {})
            for item in Item.objects.all():
                market_hash_name = item.name
                market_hash_name_factory_new = market_hash_name + " (Factory New)"
                price = 0.0
                for item_data in items_data:
                    if market_hash_name_factory_new == item_data['market_hash_name']:
                        price = float(item_data['price'])
                    else:
                        if market_hash_name == item_data['market_hash_name']:
                            price = float(item_data['price'])
                item.price = price
                item.save()
        return HttpResponseRedirect("../")

    change_list_template = "admin/case_change_list.html"

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('import/', self.load_items),
            path('update-prices/', self.update_item_prices)
        ]
        return custom_urls + urls


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ['name', ]


class CaseItemInline(admin.TabularInline):
    model = CaseItem


@admin.register(Case)
class CaseAdmin(admin.ModelAdmin):
    list_display = ['name', 'price', 'section']
    inlines = [CaseItemInline]


@admin.register(CaseHistory)
class CaseHistoryAdmin(admin.ModelAdmin):
    list_display = ['user', 'case', 'item', 'opened_at']
