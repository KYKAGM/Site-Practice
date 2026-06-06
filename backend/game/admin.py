"""
Django admin registration for game models.
"""
from django.contrib import admin
from .models import ContextGameSession, GameSession, KazakhWord


@admin.register(KazakhWord)
class KazakhWordAdmin(admin.ModelAdmin):
    list_display = ('word', 'length', 'has_embedding', 'definition')
    list_filter = ('length',)
    search_fields = ('word', 'definition')
    ordering = ('word',)

    @admin.display(boolean=True, description='Embedding')
    def has_embedding(self, obj):
        return bool(obj.embedding)


@admin.register(GameSession)
class GameSessionAdmin(admin.ModelAdmin):
    list_display = ('id', 'word', 'word_length', 'is_complete', 'is_won', 'hints_used', 'created_at')
    list_filter = ('is_complete', 'is_won', 'word_length')
    readonly_fields = ('session_key', 'created_at')
    ordering = ('-created_at',)


@admin.register(ContextGameSession)
class ContextGameSessionAdmin(admin.ModelAdmin):
    list_display = ('id', 'secret_word', 'solved', 'created_at')
    list_filter = ('solved',)
    search_fields = ('secret_word__word',)
    readonly_fields = ('created_at',)
    ordering = ('-created_at',)
