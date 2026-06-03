"""
DRF Serializers for the Kazakh Wordle game.
"""
from rest_framework import serializers


class StartGameSerializer(serializers.Serializer):
    """Serializer for starting a new game."""
    word_length = serializers.IntegerField(min_value=4, max_value=6)


class GuessSerializer(serializers.Serializer):
    """Serializer for submitting a guess."""
    session_id = serializers.IntegerField()
    guess = serializers.CharField(max_length=10)


class HintSerializer(serializers.Serializer):
    """Serializer for requesting a hint."""
    session_id = serializers.IntegerField()
