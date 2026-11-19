"""Conversion des textes libres (y compris historiques) vers XML 1.0."""
import re


_INCOMPATIBLES = re.compile(r'[\x00-\x08\x0b\x0c\x0e-\x1f\ud800-\udfff\ufffe\uffff]')


def xml_text(value):
    return _INCOMPATIBLES.sub('\ufffd', str(value))
