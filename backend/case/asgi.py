import os

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter
from channels.routing import URLRouter

from django.core.asgi import get_asgi_application
from django.urls import path, re_path

from main.consumers import CaseHistoryConsumer

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'case.settings')

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': AuthMiddlewareStack(
        URLRouter([
            re_path(r'^ws/', CaseHistoryConsumer.as_asgi())
        ])
    )
})
