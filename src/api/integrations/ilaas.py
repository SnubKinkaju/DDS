"""Appel ILaaS compatible chat/completions, sans exposer la clé au navigateur."""
import json
from http.client import HTTPException
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from src.api.errors import ApiError


class IlaasUnavailable(ApiError):
    status_code = 503
    code = 'ilaas_unavailable'


class IlaasResponseError(ApiError):
    status_code = 502
    code = 'ilaas_invalid_response'


class IlaasTimeout(ApiError):
    status_code = 504
    code = 'ilaas_timeout'


def complete_json(system_prompt, description, config):
    key = (config.get('ILAAS_API_KEY') or '').strip()
    if not key or any(char.isspace() for char in key):
        raise IlaasUnavailable(
            "Le préremplissage IA n'est pas configuré. Vous pouvez remplir le formulaire à la main."
        )
    payload = {
        'model': config['ILAAS_MODEL'],
        'messages': [
            {'role': 'system', 'content': system_prompt},
            {'role': 'user', 'content': description},
        ],
        'temperature': 0,
        'stream': False,
        'max_tokens': 2500,
    }
    request = Request(
        f"{config['ILAAS_API_URL'].rstrip('/')}/chat/completions",
        data=json.dumps(payload, ensure_ascii=False).encode('utf-8'),
        headers={'Authorization': f'Bearer {key}', 'Content-Type': 'application/json'},
        method='POST',
    )
    try:
        with urlopen(request, timeout=45) as response:
            content = response.read(256 * 1024 + 1)
        if len(content) > 256 * 1024:
            raise ValueError('Réponse trop volumineuse')
        result = json.loads(content)
        choice = result['choices'][0]
        if choice.get('finish_reason') == 'length':
            raise ValueError('Réponse tronquée')
        text = choice['message']['content'].strip()
        # Certains modèles entourent leur JSON d'un bloc Markdown.
        if text.startswith('```'):
            lines = text.splitlines()
            if lines[0].strip().lower() not in ('```', '```json') or lines[-1].strip() != '```':
                raise ValueError('Bloc JSON incomplet')
            text = '\n'.join(lines[1:-1])
        return json.loads(text)
    except HTTPError as error:
        # Ne pas renvoyer le corps du fournisseur : il peut contenir des données internes.
        error.close()
        raise IlaasUnavailable(
            "Le service IA est indisponible. Réessayez plus tard ou complétez le formulaire à la main."
        ) from error
    except (OSError, URLError, HTTPException) as error:
        if isinstance(error, TimeoutError) or isinstance(getattr(error, 'reason', None), TimeoutError):
            raise IlaasTimeout("L'IA met trop de temps à répondre. Réessayez dans un instant.") from error
        raise IlaasUnavailable("Le service IA est injoignable. Réessayez plus tard.") from error
    except (ValueError, KeyError, IndexError, TypeError, AttributeError) as error:
        raise IlaasResponseError(
            "L'IA n'a pas renvoyé de JSON exploitable. Réessayez avec une description plus précise."
        ) from error
