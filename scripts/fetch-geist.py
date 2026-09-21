"""Fetch the Geist pairing from the pinned official OFL release (no conversion)."""
import hashlib, json, pathlib, urllib.parse, urllib.request
ROOT = pathlib.Path(__file__).resolve().parents[1]
BASE = 'https://raw.githubusercontent.com/vercel/geist-font/7e42effb0dc80572e1912d419d940322b944fd96/'
records = []
license_data = urllib.request.urlopen(BASE + 'OFL.txt', timeout=30).read()
assert b'SIL OPEN FONT LICENSE' in license_data
(ROOT / 'public/fonts/geist-OFL.txt').write_bytes(license_data)
for family, source, filename, style, weight in [
    ('Geist', 'fonts/Geist/webfonts/Geist[wght].woff2', 'geist-normal.woff2', 'normal', '100 900'),
    ('Geist', 'fonts/Geist/webfonts/Geist-Italic[wght].woff2', 'geist-italic.woff2', 'italic', '100 900'),
    ('Geist Pixel Square', 'fonts/GeistPixel/webfonts/GeistPixel-Square.woff2', 'geist-pixel-square.woff2', 'normal', '400'),
]:
    url = BASE + urllib.parse.quote(source)
    data = urllib.request.urlopen(url, timeout=30).read()
    assert data[:4] == b'wOF2'
    (ROOT / 'public/fonts' / filename).write_bytes(data)
    checksum = hashlib.sha256(data).hexdigest()
    records.append(dict(family=family, file=filename, license='geist-OFL.txt', style=style, weight=weight,
                        source=url, repository='https://github.com/vercel/geist-font', sourceSha256=checksum, sha256=checksum))
manifest = ROOT / 'src/font-assets.json'
existing = json.loads(manifest.read_text())
manifest.write_text(json.dumps([a for a in existing if a['family'] not in ('Geist', 'Geist Pixel Square')] + records, indent=2) + '\n')
