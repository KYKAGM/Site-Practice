"""
API views for the Kazakh Wordle game.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import KazakhWord, GameSession
from .serializers import StartGameSerializer, GuessSerializer, HintSerializer
from .ai_hints import generate_hint


class StartView(APIView):
    """Start a new game session."""

    def post(self, request):
        serializer = StartGameSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        word_length = serializer.validated_data['word_length']

        # Pick a random word of the given length
        word_obj = KazakhWord.objects.filter(length=word_length).order_by('?').first()
        if not word_obj:
            return Response(
                {'error': f'{word_length} әріпті сөз табылмады'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Create game session
        session = GameSession.objects.create(
            word=word_obj.word,
            word_length=word_length,
        )

        return Response({
            'session_id': session.id,
            'word_length': word_length,
            'max_guesses': 6,
            'max_hints': 2,
        })


class GuessView(APIView):
    """Submit a guess for the current game."""

    def post(self, request):
        serializer = GuessSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        session_id = serializer.validated_data['session_id']
        guess = serializer.validated_data['guess'].lower().strip()

        # Find session
        try:
            session = GameSession.objects.get(id=session_id)
        except GameSession.DoesNotExist:
            return Response(
                {'error': 'Сессия табылмады'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if game is already complete
        if session.is_complete:
            return Response(
                {'error': 'Ойын аяқталған'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check word length
        if len(guess) != session.word_length:
            return Response(
                {'error': 'Сөздің ұзындығы дұрыс емес'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate word exists in dictionary
        if not KazakhWord.objects.filter(word=guess, length=session.word_length).exists():
            return Response(
                {'error': 'Сөз сөздікте табылмады'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check each letter
        target = session.word
        result = self._check_guess(guess, target)

        # Update session
        guesses = session.guesses or []
        results = session.results or []
        guesses.append(guess)
        results.append(result)

        session.guesses = guesses
        session.results = results

        # Check win/loss
        is_won = all(r == 'correct' for r in result)
        is_complete = is_won or len(guesses) >= 6

        session.is_won = is_won
        session.is_complete = is_complete
        session.save()

        response_data = {
            'result': result,
            'is_complete': is_complete,
            'is_won': is_won,
            'guesses_left': 6 - len(guesses),
            'word': session.word if is_complete else None,
        }

        return Response(response_data)

    def _check_guess(self, guess, target):
        """
        Check each letter of the guess against the target word.
        Returns a list of statuses: 'correct', 'present', or 'absent'.
        
        Uses a two-pass algorithm:
        1. First pass: mark all correct positions
        2. Second pass: mark present/absent for remaining letters
        """
        result = ['absent'] * len(guess)
        target_chars = list(target)
        guess_chars = list(guess)

        # First pass: mark correct positions
        for i in range(len(guess_chars)):
            if guess_chars[i] == target_chars[i]:
                result[i] = 'correct'
                target_chars[i] = None  # Mark as used
                guess_chars[i] = None

        # Second pass: mark present letters
        for i in range(len(guess_chars)):
            if guess_chars[i] is None:
                continue
            if guess_chars[i] in target_chars:
                result[i] = 'present'
                # Remove first occurrence from target to prevent double counting
                target_chars[target_chars.index(guess_chars[i])] = None

        return result


class HintView(APIView):
    """Request an AI-generated hint."""

    def post(self, request):
        serializer = HintSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        session_id = serializer.validated_data['session_id']

        try:
            session = GameSession.objects.get(id=session_id)
        except GameSession.DoesNotExist:
            return Response(
                {'error': 'Сессия табылмады'},
                status=status.HTTP_404_NOT_FOUND
            )

        if session.is_complete:
            return Response(
                {'error': 'Ойын аяқталған'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if session.hints_used >= 2:
            return Response(
                {'error': 'Кеңестер аяқталды'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Generate hint using Gemini AI
        try:
            hint_text = generate_hint(
                word=session.word,
                guesses=session.guesses or [],
                results=session.results or [],
                hint_number=session.hints_used + 1,
            )
        except Exception as e:
            return Response(
                {'error': f'Кеңес генерациясында қате: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Update hints count
        session.hints_used += 1
        session.save()

        return Response({
            'hint': hint_text,
            'hints_left': session.hints_left,
        })


class ValidateView(APIView):
    """Check if a word exists in the dictionary."""

    def get(self, request):
        word = request.query_params.get('word', '').lower().strip()
        length = request.query_params.get('length', None)

        if not word:
            return Response({'valid': False})

        query = KazakhWord.objects.filter(word=word)
        if length:
            query = query.filter(length=int(length))

        return Response({'valid': query.exists()})
