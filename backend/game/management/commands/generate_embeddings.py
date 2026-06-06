from django.core.management.base import BaseCommand

from game.context_embeddings import generate_embeddings_for_words, sleep_between_embedding_batches
from game.models import KazakhWord


class Command(BaseCommand):
    help = 'Generate Gemini embeddings for KazakhWord rows without embeddings'

    def add_arguments(self, parser):
        parser.add_argument(
            '--batch-size',
            type=int,
            default=100,
            help='Number of words per Gemini embedding request',
        )
        parser.add_argument(
            '--limit',
            type=int,
            default=None,
            help='Optional maximum number of words to process',
        )

    def handle(self, *args, **options):
        batch_size = min(options['batch_size'], 100)
        limit = options['limit']
        queryset = KazakhWord.objects.filter(embedding__isnull=True).order_by('id')
        if limit:
            queryset = queryset[:limit]

        processed = 0

        while True:
            words = list(queryset[:batch_size])
            if not words:
                break

            embeddings = generate_embeddings_for_words([item.word for item in words])
            if len(embeddings) != len(words):
                raise ValueError('Gemini returned a different number of embeddings than requested')

            for word, embedding in zip(words, embeddings):
                word.embedding = embedding

            KazakhWord.objects.bulk_update(words, ['embedding'])
            processed += len(words)
            self.stdout.write(self.style.SUCCESS(f'{processed} embedding сақталды'))

            if len(words) == batch_size:
                sleep_between_embedding_batches()

            queryset = KazakhWord.objects.filter(embedding__isnull=True).order_by('id')
            if limit:
                remaining = max(limit - processed, 0)
                if remaining == 0:
                    break
                queryset = queryset[:remaining]

        self.stdout.write(self.style.SUCCESS(f'Дайын: {processed} сөзге embedding жасалды'))
