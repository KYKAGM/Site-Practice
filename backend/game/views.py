from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .ai_hints import generate_hint
from .models import GameSession, KazakhWord
from .serializers import GuessSerializer, HintSerializer, StartGameSerializer


class StartView(APIView):
    """Start a new game session."""

    def post(self, request):
        serializer = StartGameSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        word_length = serializer.validated_data['word_length']
        word_obj = KazakhWord.objects.filter(length=word_length).order_by('?').first()
        if not word_obj:
            return Response(
                {'error': f'{word_length} әріптік сөз табылмады'},
                status=status.HTTP_404_NOT_FOUND
            )

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

        try:
            session = GameSession.objects.get(id=session_id)
        except GameSession.DoesNotExist:
            return Response(
                {'error': 'Ойын сессиясы табылмады'},
                status=status.HTTP_404_NOT_FOUND
            )

        if session.is_complete:
            return Response(
                {'error': 'Ойын аяқталған'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(guess) != session.word_length:
            return Response(
                {'error': 'Сөз ұзындығы дұрыс емес'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not KazakhWord.objects.filter(word=guess, length=session.word_length).exists():
            return Response(
                {'error': 'Сөз сөздікте табылмады'},
                status=status.HTTP_400_BAD_REQUEST
            )

        target = session.word
        result = self._check_guess(guess, target)

        guesses = session.guesses or []
        results = session.results or []
        guesses.append(guess)
        results.append(result)

        session.guesses = guesses
        session.results = results

        is_won = all(item == 'correct' for item in result)
        is_complete = is_won or len(guesses) >= 6

        session.is_won = is_won
        session.is_complete = is_complete
        session.save()

        return Response({
            'result': result,
            'is_complete': is_complete,
            'is_won': is_won,
            'guesses_left': 6 - len(guesses),
            'word': session.word if is_complete else None,
        })

    def _check_guess(self, guess, target):
        result = ['absent'] * len(guess)
        target_chars = list(target)
        guess_chars = list(guess)

        for index in range(len(guess_chars)):
            if guess_chars[index] == target_chars[index]:
                result[index] = 'correct'
                target_chars[index] = None
                guess_chars[index] = None

        for index in range(len(guess_chars)):
            if guess_chars[index] is None:
                continue
            if guess_chars[index] in target_chars:
                result[index] = 'present'
                target_chars[target_chars.index(guess_chars[index])] = None

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
                {'error': 'Ойын сессиясы табылмады'},
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

        try:
            hint_text = generate_hint(
                word=session.word,
                guesses=session.guesses or [],
                results=session.results or [],
                hint_number=session.hints_used + 1,
            )
        except Exception as exc:
            return Response(
                {'error': f'Кеңес жасау кезінде қате шықты: {str(exc)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        session.hints_used += 1
        session.save()

        return Response({
            'hint': hint_text,
            'hints_left': session.hints_left,
        })


class GiveUpView(APIView):
    """Finish the current game as a loss and reveal the answer."""

    def post(self, request):
        serializer = HintSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        session_id = serializer.validated_data['session_id']

        try:
            session = GameSession.objects.get(id=session_id)
        except GameSession.DoesNotExist:
            return Response(
                {'error': 'Ойын сессиясы табылмады'},
                status=status.HTTP_404_NOT_FOUND
            )

        if not session.is_complete:
            session.is_complete = True
            session.is_won = False
            session.save()

        return Response({
            'is_complete': True,
            'is_won': False,
            'word': session.word,
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
