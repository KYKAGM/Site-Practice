from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .ai_hints import generate_hint
from .context_embeddings import (
    build_context_ranking,
    cache_context_ranking,
    get_cached_context_ranking,
)
from .models import ContextGameSession, GameSession, KazakhWord
from .serializers import GuessSerializer, HintSerializer, StartGameSerializer


class StartView(APIView):
    """Start a new Wordle game session."""

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

        session = GameSession.objects.create(word=word_obj.word, word_length=word_length)

        return Response({
            'session_id': session.id,
            'word_length': word_length,
            'max_guesses': 6,
            'max_hints': 2,
        })


class GuessView(APIView):
    """Submit a Wordle guess for the current game."""

    def post(self, request):
        serializer = GuessSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        session_id = serializer.validated_data['session_id']
        guess = serializer.validated_data['guess'].lower().strip()

        try:
            session = GameSession.objects.get(id=session_id)
        except GameSession.DoesNotExist:
            return Response({'error': 'Ойын сессиясы табылмады'}, status=status.HTTP_404_NOT_FOUND)

        if session.is_complete:
            return Response({'error': 'Ойын аяқталған'}, status=status.HTTP_400_BAD_REQUEST)

        if len(guess) != session.word_length:
            return Response({'error': 'Сөз ұзындығы дұрыс емес'}, status=status.HTTP_400_BAD_REQUEST)

        if not KazakhWord.objects.filter(word=guess, length=session.word_length).exists():
            return Response({'error': 'Сөз сөздікте табылмады'}, status=status.HTTP_400_BAD_REQUEST)

        result = self._check_guess(guess, session.word)

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
    """Request an AI-generated Wordle hint."""

    def post(self, request):
        serializer = HintSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        session_id = serializer.validated_data['session_id']

        try:
            session = GameSession.objects.get(id=session_id)
        except GameSession.DoesNotExist:
            return Response({'error': 'Ойын сессиясы табылмады'}, status=status.HTTP_404_NOT_FOUND)

        if session.is_complete:
            return Response({'error': 'Ойын аяқталған'}, status=status.HTTP_400_BAD_REQUEST)

        if session.hints_used >= 2:
            return Response({'error': 'Кеңестер аяқталды'}, status=status.HTTP_400_BAD_REQUEST)

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
    """Finish the current Wordle game as a loss and reveal the answer."""

    def post(self, request):
        serializer = HintSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        session_id = serializer.validated_data['session_id']

        try:
            session = GameSession.objects.get(id=session_id)
        except GameSession.DoesNotExist:
            return Response({'error': 'Ойын сессиясы табылмады'}, status=status.HTTP_404_NOT_FOUND)

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


class ContextStartView(APIView):
    """Start a Contexto-like semantic ranking game."""

    def post(self, request):
        secret_word = KazakhWord.objects.exclude(embedding__isnull=True).exclude(embedding=[]).order_by('?').first()
        if not secret_word:
            return Response(
                {'error': 'Embedding дайын сөз табылмады'},
                status=status.HTTP_404_NOT_FOUND
            )

        session = ContextGameSession.objects.create(secret_word=secret_word)
        try:
            ranking = build_context_ranking(secret_word)
        except ValueError as exc:
            session.delete()
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        cache_context_ranking(session.id, ranking)

        return Response({
            'session_id': session.id,
            'total': ranking['total'],
        })


class ContextGuessView(APIView):
    """Submit a Context mode guess and return its semantic rank."""

    def post(self, request):
        session_id = request.data.get('session_id')
        word_text = str(request.data.get('word', '')).lower().strip()

        if not session_id or not word_text:
            return Response({'error': 'session_id және word қажет'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            session = ContextGameSession.objects.select_related('secret_word').get(id=session_id)
        except ContextGameSession.DoesNotExist:
            return Response({'error': 'Контекст сессиясы табылмады'}, status=status.HTTP_404_NOT_FOUND)

        try:
            guessed_word = KazakhWord.objects.get(word=word_text)
        except KazakhWord.DoesNotExist:
            return Response({'error': 'Сөз табылмады'}, status=status.HTTP_404_NOT_FOUND)

        if not guessed_word.embedding:
            return Response({'error': 'Бұл сөзге embedding дайын емес'}, status=status.HTTP_400_BAD_REQUEST)

        ranking = get_cached_context_ranking(session.id)
        if ranking is None:
            ranking = build_context_ranking(session.secret_word)
            cache_context_ranking(session.id, ranking)

        rank = ranking['ranks_by_word'].get(guessed_word.word)
        if rank is None:
            return Response({'error': 'Бұл сөз рейтингте жоқ'}, status=status.HTTP_400_BAD_REQUEST)

        solved = guessed_word.id == session.secret_word_id
        attempts = session.attempts or []
        attempts.append({
            'word': guessed_word.word,
            'rank': rank,
        })

        session.attempts = attempts
        session.solved = session.solved or solved
        session.save()

        return Response({
            'rank': rank,
            'total': ranking['total'],
            'solved': session.solved,
        })


class ContextGiveUpView(APIView):
    """Reveal the Context mode secret word."""

    def post(self, request):
        session_id = request.data.get('session_id')
        if not session_id:
            return Response({'error': 'session_id қажет'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            session = ContextGameSession.objects.select_related('secret_word').get(id=session_id)
        except ContextGameSession.DoesNotExist:
            return Response({'error': 'Контекст сессиясы табылмады'}, status=status.HTTP_404_NOT_FOUND)

        return Response({
            'word': session.secret_word.word,
            'solved': session.solved,
        })
