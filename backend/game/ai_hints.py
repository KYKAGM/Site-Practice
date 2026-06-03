"""
AI Hints module using Google Gemini API.
Generates contextual hints in Kazakh language without revealing the word.
"""
import os
from django.conf import settings


def generate_hint(word: str, guesses: list, results: list, hint_number: int) -> str:
    """
    Generate a hint using Google Gemini API.
    
    Args:
        word: The target word (hidden from player)
        guesses: List of previous guesses
        results: List of results for each guess
        hint_number: 1 or 2 (which hint this is)
    
    Returns:
        A hint string in Kazakh language
    """
    from google import genai

    api_key = settings.GEMINI_API_KEY
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not configured")

    client = genai.Client(api_key=api_key)

    # Build context about previous guesses
    guess_context = ""
    if guesses:
        guess_lines = []
        for g, r in zip(guesses, results):
            letters_info = []
            for letter, status in zip(g, r):
                if status == 'correct':
                    letters_info.append(f"'{letter}' ✅ дұрыс орында")
                elif status == 'present':
                    letters_info.append(f"'{letter}' 🟡 сөзде бар, бірақ басқа орында")
                else:
                    letters_info.append(f"'{letter}' ❌ сөзде жоқ")
            guess_lines.append(f"  Болжам '{g}': {', '.join(letters_info)}")
        guess_context = "Ойыншының алдыңғы болжамдары:\n" + "\n".join(guess_lines)

    # Build the prompt
    prompt = f"""Сен қазақ тілінің сөздік ойынында көмекші ретінде жұмыс істейсің.

Жасырын сөз: "{word}" ({len(word)} әріп)

{guess_context}

{"Бұл бірінші кеңес. Сөздің жалпы мағынасы туралы айт." if hint_number == 1 else "Бұл екінші (соңғы) кеңес. Нақтырақ кеңес бер, бірақ сөзді ашпа."}

ЕРЕЖЕЛЕР:
1. Тек қазақ тілінде жаз
2. 1-2 сөйлем ғана
3. Сөзді тікелей атама
4. Сөздің әріптерін тізбелеп айтпа
5. Сөздің мағынасы немесе қолданылу саласы туралы кеңес бер
6. Қысқа және нұсқа жауап бер"""

    response = client.models.generate_content(
        model='gemini-3.5-flash',
        contents=prompt,
    )

    return response.text.strip()
