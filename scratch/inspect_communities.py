import json
from pathlib import Path

if __name__ == '__main__':
    analysis = json.loads(Path('graphify-out/.graphify_analysis.json').read_text(encoding="utf-8"))
    extract = json.loads(Path('graphify-out/.graphify_extract.json').read_text(encoding="utf-8"))
    node_map = {n['id']: n.get('label', n['id']) for n in extract['nodes']}

    communities = analysis['communities']
    for cid, members in sorted(communities.items(), key=lambda x: int(x[0])):
        member_labels = [node_map.get(m, m) for m in members[:6]]
        print(f"Community {cid} ({len(members)} nodes): {', '.join(member_labels)}")
