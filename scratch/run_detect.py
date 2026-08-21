import json
from pathlib import Path
from graphify.detect import detect

result = detect(Path('.'))
Path('graphify-out/.graphify_detect.json').write_text(json.dumps(result, ensure_ascii=False), encoding='utf-8')
print("Detection complete.")
