from django.contrib import admin
from django.urls import path, include
from main import views

from django.conf import settings
from django.conf.urls.static import static
from allauth.socialaccount.providers.steam.views import steam_login, steam_callback
from allauth.account.views import LogoutView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/case/<int:case_id>/', views.CaseAPIView.as_view()),
    path('api/sections/', views.SectionAPIView.as_view()),
    path('api/profile/', views.ProfileAPIView.as_view()),
    path('api/profile/steam/login/', steam_login),
    path('api/profile/steam/callback/', steam_callback),
    path('api/profile/steam/logout/', views.UserLogoutAPIView.as_view()),
    path('api/set-trade-link/', views.TradeLinkAPIView.as_view()),
    path('api/case-history/', views.CaseHistoryAPIView.as_view()),
    path('api/withdraw-item/', views.WithdrawItemAPIView.as_view())

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
