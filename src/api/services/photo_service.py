from io import BytesIO
from pathlib import Path
from uuid import uuid4
import warnings

from PIL import Image, ImageOps, UnidentifiedImageError

from src.api.errors import NotFoundError, ValidationError
from src.api.repositories import logement_repository, owner_repository
from src.api.services.owner_service import require_owner

URL_PREFIX = '/api/logements/photos/fichier/'
MAX_PHOTOS = 8
MAX_BYTES = 5 * 1024 * 1024


def remove_files(photos, folder):
    for photo in photos:
        url = photo['url']
        if url.startswith(URL_PREFIX):
            filename = url.removeprefix(URL_PREFIX)
            if Path(filename).name == filename:
                (Path(folder) / filename).unlink(missing_ok=True)


def upload(connection, listing_id, owner_id, file, folder):
    require_owner(connection, listing_id, owner_id)
    if file is None:
        raise ValidationError("Sélectionnez une photo.")
    data = file.read(MAX_BYTES + 1)
    if len(data) > MAX_BYTES:
        raise ValidationError("La photo ne doit pas dépasser 5 Mo.")
    try:
        with warnings.catch_warnings():
            warnings.simplefilter('error', Image.DecompressionBombWarning)
            with Image.open(BytesIO(data)) as source:
                if source.format not in ('JPEG', 'PNG', 'WEBP'):
                    raise ValidationError("Formats acceptés : JPEG, PNG et WebP.")
                if source.width * source.height > 20_000_000:
                    raise ValidationError("La photo ne doit pas dépasser 20 mégapixels.")
                photo = ImageOps.exif_transpose(source).convert('RGB')
                photo.thumbnail((2000, 2000))
    except (UnidentifiedImageError, OSError, ValueError,
            Image.DecompressionBombError, Image.DecompressionBombWarning):
        raise ValidationError("Le fichier n'est pas une image valide.") from None

    folder = Path(folder)
    folder.mkdir(parents=True, exist_ok=True)
    filename = f'{uuid4().hex}.jpg'
    path = folder / filename
    try:
        # Sérialise les ajouts pour respecter la limite même avec deux requêtes.
        connection.execute('BEGIN IMMEDIATE')
        require_owner(connection, listing_id, owner_id)
        if len(logement_repository.find_photos(connection, listing_id)) >= MAX_PHOTOS:
            raise ValidationError(f'Vous pouvez ajouter au maximum {MAX_PHOTOS} photos.')
        photo.save(path, 'JPEG', quality=85)
        owner_repository.add_photo(connection, listing_id, URL_PREFIX + filename)
        connection.commit()
    except Exception:
        connection.rollback()
        path.unlink(missing_ok=True)
        raise


def delete(connection, listing_id, photo_id, owner_id, folder):
    require_owner(connection, listing_id, owner_id)
    photo = next((item for item in logement_repository.find_photos(connection, listing_id)
                  if item['id'] == photo_id), None)
    if photo is None:
        raise NotFoundError("Cette photo n'existe pas.")
    with connection:
        owner_repository.delete_photo(connection, listing_id, photo_id)
    remove_files([photo], folder)
