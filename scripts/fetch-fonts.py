"""Refresh full-character-set OFL fonts; requires fonttools[woff].
Downloads Google Fonts sources and losslessly compresses them to WOFF2.
"""
import concurrent.futures, hashlib, io, json, pathlib, re, urllib.request, urllib.parse
from fontTools.ttLib import TTFont
ROOT = pathlib.Path(__file__).resolve().parents[1]
FAMILIES = ['fraunces', 'dmsans', 'newsreader', 'manrope', 'instrumentserif', 'instrumentsans', 'alegreya', 'alegreyasans', 'sourceserif4', 'sourcesans3']

def fetch(slug):
    base = f'https://raw.githubusercontent.com/google/fonts/main/ofl/{slug}/'
    def read(name):
        return urllib.request.urlopen(base + urllib.parse.quote(name), timeout=60).read()
    metadata = read('METADATA.pb').decode()
    name = re.search(r'name: "(.*?)"', metadata)[1]
    license = read('OFL.txt')
    assert b'SIL OPEN FONT LICENSE' in license
    (ROOT / f'public/fonts/{slug}-OFL.txt').write_bytes(license)
    records = []
    blocks = re.findall(r'fonts \{(.*?)\n\}', metadata, re.S)
    for block in blocks:
        filename = re.search(r'filename: "(.*?)"', block)[1]
        style = re.search(r'style: "(.*?)"', block)[1]
        data = read(filename)
        font = TTFont(io.BytesIO(data))
        axes = {a.axisTag: (a.minValue, a.maxValue) for a in font['fvar'].axes} if 'fvar' in font else {}
        font.flavor = 'woff2'
        static_weight = re.search(r'weight: (\d+)', block)[1]
        suffix = '-' + static_weight if sum(f'style: "{style}"' in b for b in blocks) > 1 else ''
        target = f'{slug}-{style}{suffix}.woff2'
        font.save(ROOT / f'public/fonts/{target}')
        record = dict(family=name, file=target, license=f'{slug}-OFL.txt', style=style, source=base+urllib.parse.quote(filename), repository=re.search(r'repository_url: "(.*?)"', metadata)[1], sourceSha256=hashlib.sha256(data).hexdigest(), sha256=hashlib.sha256((ROOT / f'public/fonts/{target}').read_bytes()).hexdigest(), weight=' '.join(str(int(x)) for x in axes['wght']) if 'wght' in axes else re.search(r'weight: (\d+)', block)[1])
        records.append(record)
        print(name, style, record['weight'], (ROOT / f'public/fonts/{target}').stat().st_size, flush=True)
    return records

with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
    records = [record for family in pool.map(fetch, FAMILIES) for record in family]
manifest = ROOT / 'src/font-assets.json'
geist = [a for a in json.loads(manifest.read_text()) if a['family'] in ('Geist', 'Geist Pixel Square')]
manifest.write_text(json.dumps(records + geist, indent=2)+'\n')
