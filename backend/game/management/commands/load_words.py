"""
Management command to load Kazakh words from JSON files into the database.
Usage: python manage.py load_words
"""
import json
from pathlib import Path
from django.core.management.base import BaseCommand
from game.models import KazakhWord


class Command(BaseCommand):
    help = 'Load Kazakh words from JSON files into the database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear all existing words before loading',
        )

    def handle(self, *args, **options):
        data_dir = Path(__file__).resolve().parent.parent.parent / 'data'

        if options['clear']:
            count = KazakhWord.objects.count()
            KazakhWord.objects.all().delete()
            self.stdout.write(self.style.WARNING(f'Deleted {count} existing words'))

        total_loaded = 0
        total_skipped = 0

        for length in [4, 5, 6]:
            filepath = data_dir / f'words_{length}.json'
            if not filepath.exists():
                self.stdout.write(self.style.WARNING(f'File not found: {filepath}'))
                continue

            with open(filepath, 'r', encoding='utf-8') as f:
                words_data = json.load(f)

            loaded = 0
            skipped = 0

            for entry in words_data:
                if isinstance(entry, str):
                    word = entry.lower().strip()
                    definition = ''
                elif isinstance(entry, dict):
                    word = entry.get('word', '').lower().strip()
                    definition = entry.get('definition', '')
                else:
                    continue

                if not word or len(word) != length:
                    skipped += 1
                    continue

                _, created = KazakhWord.objects.get_or_create(
                    word=word,
                    defaults={
                        'length': length,
                        'definition': definition,
                    }
                )

                if created:
                    loaded += 1
                else:
                    skipped += 1

            total_loaded += loaded
            total_skipped += skipped
            self.stdout.write(
                self.style.SUCCESS(f'{length} әріп: {loaded} жүктелді, {skipped} өткізілді')
            )

        self.stdout.write(
            self.style.SUCCESS(f'\nБарлығы: {total_loaded} сөз жүктелді, {total_skipped} өткізілді')
        )
