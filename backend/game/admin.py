"""
Django admin registration for game models.
"""
from django.contrib import admin
from .models import KazakhWord, GameSession


@admin.register(KazakhWord)
class KazakhWordAdmin(admin.ModelAdmin):
    list_display = ('word', 'length', 'definition')
    list_filter = ('length',)
    search_fields = ('word', 'definition')
    ordering = ('word',)


@admin.register(GameSession)
class GameSessionAdmin(admin.ModelAdmin):
    list_display = ('id', 'word', 'word_length', 'is_complete', 'is_won', 'hints_used', 'created_at')
    list_filter = ('is_complete', 'is_won', 'word_length')
    readonly_fields = ('session_key', 'created_at')
    ordering = ('-created_at',)
