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
            help='Number of words per Gemini embedding request. Free tier counts batch items toward the 100 RPM quota.',
        )
        parser.add_argument(
            '--delay-seconds',
            type=int,
            default=65,
            help='Delay between batches. Use 65+ seconds for Gemini free tier 100 RPM with batch-size 100.',
        )
        parser.add_argument(
            '--limit',
            type=int,
            default=None,
            help='Optional maximum number of words to process',
        )

    def handle(self, *args, **options):
        batch_size = min(options['batch_size'], 100)
        delay_seconds = max(options['delay_seconds'], 0)
        limit = options['limit']
        processed = 0

        while True:
            queryset = KazakhWord.objects.filter(embedding__isnull=True).order_by('id')
            if limit:
                remaining = max(limit - processed, 0)
                if remaining == 0:
                    break
                queryset = queryset[:remaining]

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

            should_continue = len(words) == batch_size and (not limit or processed < limit)
            if should_continue and delay_seconds:
                self.stdout.write(f'{delay_seconds} сек күту: Gemini embedding quota 100 RPM')
                sleep_between_embedding_batches(delay_seconds)

        self.stdout.write(self.style.SUCCESS(f'Дайын: {processed} сөзге embedding жасалды'))
