"""Refresh Google-hosted WOFF2 declarations; no font binaries are retained.
Run manually with python3 scripts/refresh-google-fonts.py, then review/test the diff.
The fixed modern user agent requests variable WOFF2 and all Unicode subsets.
"""
import concurrent.futures
import json
from pathlib import Path
import re
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
SPECS = {
    'Fraunces': 'ital,opsz,wght,SOFT,WONK@0,9..144,100..900,0..100,0..1;1,9..144,100..900,0..100,0..1',
    'DM Sans': 'ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000',
    'Newsreader': 'ital,opsz,wght@0,6..72,200..800;1,6..72,200..800',
    'Manrope': 'wght@200..800',
    'Instrument Serif': 'ital@0;1',
    'Instrument Sans': 'ital,wght@0,400..700;1,400..700',
    'Alegreya': 'ital,wght@0,400..900;1,400..900',
    'Alegreya Sans': 'ital,wght@' + ';'.join(f'{i},{w}' for i in [0,1] for w in [100,300,400,500,700,800,900]),
    'Source Serif 4': 'ital,opsz,wght@0,8..60,200..900;1,8..60,200..900',
    'Source Sans 3': 'ital,wght@0,200..900;1,200..900',
    'Geist': 'ital,wght@0,100..900;1,100..900',
    'Geist Pixel': 'ELSH@1',
    'Geist Mono': 'wght@400..600',
}
USER_AGENT = 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'


def fetch(item):
    family, axes = item
    query = urllib.parse.urlencode({'family': f'{family}:{axes}', 'display': 'swap'})
    source = f'https://fonts.googleapis.com/css2?{query}'
    request = urllib.request.Request(source, headers={'User-Agent': USER_AGENT})
    css = urllib.request.urlopen(request, timeout=30).read().decode()
    records = []
    for block in re.findall(r'@font-face\s*\{([^}]+)\}', css):
        def prop(name):
            match = re.search(rf'{name}:\s*([^;]+);', block)
            if not match:
                raise ValueError(f'{family}: missing {name}')
            return match[1]
        url = re.fullmatch(r"url\((https://fonts\.gstatic\.com/[^)]+)\) format\('woff2'\)", prop('src'))
        if not url:
            raise ValueError(f'{family}: expected Google-hosted WOFF2')
        if prop('font-family').strip("'") != family:
            raise ValueError(f'{family}: unexpected font family')
        records.append({
            'family': 'Geist Pixel Square' if family == 'Geist Pixel' else family,
            'style': prop('font-style'), 'weight': prop('font-weight'),
            'url': url[1], 'unicodeRange': prop('unicode-range'),
        })
    if not records:
        raise ValueError(f'{family}: no faces returned')
    print(f'{family}: {len(records)} faces', flush=True)
    return {'source': source, 'faces': records}


if __name__ == '__main__':
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        families = list(pool.map(fetch, SPECS.items()))
    # Only replace the manifest after every family succeeds.
    (ROOT / 'src/google-fonts.json').write_text(json.dumps(families, indent=2) + '\n')
