"""
Models for the Kazakh Wordle game.
"""
import uuid
from django.db import models


class KazakhWord(models.Model):
    """A Kazakh word in the dictionary."""
    word = models.CharField(max_length=10, unique=True, db_index=True)
    length = models.IntegerField(db_index=True)
    definition = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['word']
        verbose_name = 'Қазақ сөзі'
        verbose_name_plural = 'Қазақ сөздері'

    def __str__(self):
        return f"{self.word} ({self.length} әріп)"

    def save(self, *args, **kwargs):
        self.length = len(self.word)
        super().save(*args, **kwargs)


class GameSession(models.Model):
    """A single game session."""
    session_key = models.CharField(max_length=64, unique=True, default=uuid.uuid4, db_index=True)
    word = models.CharField(max_length=10)
    word_length = models.IntegerField()
    guesses = models.JSONField(default=list)
    results = models.JSONField(default=list)
    hints_used = models.IntegerField(default=0)
    is_complete = models.BooleanField(default=False)
    is_won = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Ойын сессиясы'
        verbose_name_plural = 'Ойын сессиялары'

    def __str__(self):
        status = '✅' if self.is_won else ('❌' if self.is_complete else '🎮')
        return f"{status} Session {self.id} — {self.word_length} әріп"

    @property
    def guesses_left(self):
        return 6 - len(self.guesses)

    @property
    def hints_left(self):
        return max(0, 2 - self.hints_used)
