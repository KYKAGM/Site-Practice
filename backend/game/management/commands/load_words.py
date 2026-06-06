from pathlib import Path

from django.core.management.base import BaseCommand

from game.models import KazakhWord


class Command(BaseCommand):
    help = 'Load Kazakh words from words.txt into the database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear all existing words before loading',
        )

    def handle(self, *args, **options):
        project_root = Path(__file__).resolve().parents[4]
        words_file = project_root / 'words.txt'

        if options['clear']:
            count = KazakhWord.objects.count()
            KazakhWord.objects.all().delete()
            self.stdout.write(self.style.WARNING(f'Deleted {count} existing words'))

        if not words_file.exists():
            self.stdout.write(self.style.ERROR(f'File not found: {words_file}'))
            return

        allowed_lengths = set(range(2, 9))
        loaded = 0
        skipped = 0

        with open(words_file, 'r', encoding='utf-8') as file:
            for line in file:
                word = line.strip().lower()
                if not word:
                    continue

                if not word.isalpha():
                    skipped += 1
                    continue

                if len(word) not in allowed_lengths:
                    skipped += 1
                    continue

                _, created = KazakhWord.objects.get_or_create(
                    word=word,
                    defaults={'definition': ''},
                )

                if created:
                    loaded += 1
                else:
                    skipped += 1

        self.stdout.write(self.style.SUCCESS(
            f'{loaded} сөз жүктелді, {skipped} сөз өткізілді (2-8 әріптік сүзгі бойынша)'
        ))
