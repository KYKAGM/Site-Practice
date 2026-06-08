import math
import time

from django.conf import settings
from django.core.cache import cache

from .models import KazakhWord

EMBEDDING_MODEL = settings.GEMINI_EMBEDDING_MODEL
CONTEXT_CACHE_TIMEOUT = 60 * 60 * 6


def cosine_similarity(left, right):
    if not left or not right or len(left) != len(right):
        return -1.0

    dot = sum(a * b for a, b in zip(left, right))
    left_norm = math.sqrt(sum(a * a for a in left))
    right_norm = math.sqrt(sum(b * b for b in right))

    if left_norm == 0 or right_norm == 0:
        return -1.0

    return dot / (left_norm * right_norm)


def get_embedding_client():
    from google import genai

    if not settings.GEMINI_API_KEY:
        raise ValueError('GEMINI_API_KEY is not configured')

    return genai.Client(api_key=settings.GEMINI_API_KEY)


def extract_embedding_values(item):
    if hasattr(item, 'values'):
        return list(item.values)
    if isinstance(item, dict):
        values = item.get('values')
        if values is not None:
            return list(values)
    raise ValueError('Gemini embedding response has an unknown format')


def generate_embeddings_for_words(words):
    client = get_embedding_client()
    response = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=words,
    )

    embeddings = getattr(response, 'embeddings', None)
    if embeddings is None and isinstance(response, dict):
        embeddings = response.get('embeddings')
    if embeddings is None:
        raise ValueError('Gemini embedding response did not contain embeddings')

    return [extract_embedding_values(item) for item in embeddings]


def build_context_ranking(secret_word):
    if not secret_word.embedding:
        raise ValueError('Secret word does not have an embedding')

    words = KazakhWord.objects.exclude(embedding__isnull=True).exclude(embedding=[]).only('id', 'word', 'embedding')
    ranked = []

    for word in words.iterator(chunk_size=1000):
        similarity = cosine_similarity(secret_word.embedding, word.embedding)
        ranked.append({
            'id': word.id,
            'word': word.word,
            'similarity': similarity,
        })

    ranked.sort(key=lambda item: item['similarity'], reverse=True)

    ranks_by_word = {}
    for index, item in enumerate(ranked, start=1):
        ranks_by_word[item['word']] = index

    return {
        'total': len(ranked),
        'secret_word': secret_word.word,
        'ranks_by_word': ranks_by_word,
    }


def cache_context_ranking(session_id, ranking):
    cache.set(context_cache_key(session_id), ranking, CONTEXT_CACHE_TIMEOUT)


def get_cached_context_ranking(session_id):
    return cache.get(context_cache_key(session_id))


def context_cache_key(session_id):
    return f'context-ranking:{session_id}'


def sleep_between_embedding_batches(delay_seconds=65):
    time.sleep(delay_seconds)
