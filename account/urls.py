from django.urls import path

from . import views

app_name = 'account'

urlpatterns = [
    path('signup/', views.signup, name='signup'),
    path('login/', views.signin, name='login'),
    path('logout/', views.logout, name='logout'),
    path('mypage/', views.mypage, name='mypage'),
    path('find-password/', views.find_password, name='find-password'),
    path('set-profile/', views.set_profile, name='set-profile'),
    path('validate_nickname/', views.validate_nickname, name='validate_nickname'),
]