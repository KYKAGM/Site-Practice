"""
URL patterns for the game API.
"""
from django.urls import path
from . import views

urlpatterns = [
    path('start/', views.StartView.as_view(), name='game-start'),
    path('guess/', views.GuessView.as_view(), name='game-guess'),
    path('hint/', views.HintView.as_view(), name='game-hint'),
    path('give-up/', views.GiveUpView.as_view(), name='game-give-up'),
    path('validate-word/', views.ValidateView.as_view(), name='game-validate'),
    path('context/start/', views.ContextStartView.as_view(), name='context-start'),
    path('context/guess/', views.ContextGuessView.as_view(), name='context-guess'),
    path('context/give-up/', views.ContextGiveUpView.as_view(), name='context-give-up'),
]
