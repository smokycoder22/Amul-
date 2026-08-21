import json
from pathlib import Path

if __name__ == '__main__':
    from graphify.export import to_html
    from graphify.build import build_from_json
    
    extraction = json.loads(Path('graphify-out/.graphify_extract.json').read_text(encoding="utf-8"))
    analysis = json.loads(Path('graphify-out/.graphify_analysis.json').read_text(encoding="utf-8"))
    labels = json.loads(Path('graphify-out/.graphify_labels.json').read_text(encoding="utf-8"))
    
    G = build_from_json(extraction, root='.', directed=False)
    communities = {int(k): v for k, v in analysis['communities'].items()}
    int_labels = {int(k): v for k, v in labels.items()}
    
    to_html(G, communities, 'graphify-out/graph.html', community_labels=int_labels)
    print('graph.html exported successfully')
