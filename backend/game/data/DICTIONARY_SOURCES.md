# Dictionary sources

This project keeps playable words in `words_4.json`, `words_5.json`, and `words_6.json`.

## qate.js reference

- Repository: https://github.com/jarjan/qate.js
- Author noted in source license: Zharzhan Kulmyrza
- License noted in source: MIT
- Project note: `qate.js` is a small Kazakh spellcheck prototype. The current game still validates guesses through the local `KazakhWord` database, because the repository does not expose a ready large word-list file in its top-level structure.

When adding more words later, keep entries lowercase and split them by length so `python manage.py load_words` can import them.
