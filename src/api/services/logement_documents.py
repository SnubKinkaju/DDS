"""Présentations HTML et texte du même document JSON de logement validé."""
from flask import render_template


def _euros(centimes):
    euros, reste = divmod(centimes, 100)
    entier = f'{euros:,}'.replace(',', ' ')
    return f'{entier},{reste:02d} €'


def render_logement(document, format_name):
    template = {'html': 'logement.html', 'txt': 'logement.txt'}[format_name]
    return render_template(
        template,
        logement=document,
        prix_nuit=_euros(document['prixNuitCentimes']),
    )
