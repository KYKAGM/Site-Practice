from django.conf import settings


def generate_hint(word: str, guesses: list, results: list, hint_number: int) -> str:
    """Generate a short Kazakh hint using Google Gemini API."""

    from google import genai

    api_key = settings.GEMINI_API_KEY
    if not api_key:
        raise ValueError('GEMINI_API_KEY is not configured')

    client = genai.Client(api_key=api_key)

    guess_context = ''
    if guesses:
        guess_lines = []
        for guess, result in zip(guesses, results):
            letters_info = []
            for letter, letter_status in zip(guess, result):
                if letter_status == 'correct':
                    letters_info.append(f"'{letter}' дұрыс орында")
                elif letter_status == 'present':
                    letters_info.append(f"'{letter}' сөзде бар, бірақ басқа орында")
                else:
                    letters_info.append(f"'{letter}' сөзде жоқ")
            guess_lines.append(f"  Болжам '{guess}': {', '.join(letters_info)}")
        guess_context = 'Ойыншының алдыңғы болжамдары:\n' + '\n'.join(guess_lines)

    hint_instruction = (
        'Бұл бірінші кеңес. Сөздің жалпы мағынасы туралы айт.'
        if hint_number == 1
        else 'Бұл екінші соңғы кеңес. Нақтырақ кеңес бер, бірақ сөзді ашпа.'
    )

    prompt = f"""Сен қазақ тіліндегі сөздік ойында көмекші ретінде жұмыс істейсің.

Жасырын сөз: "{word}" ({len(word)} әріп)

{guess_context}

{hint_instruction}

ЕРЕЖЕЛЕР:
1. Тек қазақ тілінде жаз.
2. 1-2 сөйлем ғана.
3. Сөзді тікелей атама.
4. Сөздің әріптерін тізбелеп айтпа.
5. Сөздің мағынасы немесе қолданылу саласы туралы кеңес бер.
6. Қысқа және нұсқа жауап бер."""

    response = client.models.generate_content(
        model='gemini-3.5-flash',
        contents=prompt,
    )

    return response.text.strip()
