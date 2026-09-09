"""Build a reproducible source ZIP from the site's allowlisted model files."""
import hashlib
import json
from pathlib import Path
import zipfile

root = Path(__file__).resolve().parents[1] / 'public' / 'meshfree'
manifest = json.loads((root / 'manifest.json').read_text(encoding='utf-8'))
files = [item for item in manifest['files'] if item['path'].startswith('/meshfree/model/')]
readme = root / 'model' / 'README.md'
files = [item for item in files if not item['path'].endswith('/README.md')]
files.append({'path': '/meshfree/model/README.md', 'bytes': readme.stat().st_size,
              'sha256': hashlib.sha256(readme.read_bytes()).hexdigest()})
target = root / 'model-source.zip'
with zipfile.ZipFile(target, 'w', compression=zipfile.ZIP_DEFLATED) as archive:
    for item in sorted(files, key=lambda item: item['path']):
        path = root / item['path'].removeprefix('/meshfree/')
        info = zipfile.ZipInfo(item['path'].removeprefix('/meshfree/model/'), (2026, 9, 10, 0, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        archive.writestr(info, path.read_bytes())
with zipfile.ZipFile(target) as archive:
    assert archive.testzip() is None
manifest['files'] = [item for item in manifest['files']
                     if not item['path'].startswith('/meshfree/model/') and item['path'] != '/meshfree/model-source.zip']
manifest['files'].extend(files)
manifest['files'].append({'path': '/meshfree/model-source.zip', 'bytes': target.stat().st_size,
                          'sha256': hashlib.sha256(target.read_bytes()).hexdigest()})
(root / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'Packaged and checked {len(files)} model files ({target.stat().st_size} bytes).')
