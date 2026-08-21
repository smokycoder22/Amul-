import sys, json
from pathlib import Path

if __name__ == '__main__':
    from graphify.build import build_from_json
    from graphify.cluster import score_all
    from graphify.analyze import god_nodes, surprising_connections, suggest_questions
    from graphify.report import generate

    extraction = json.loads(Path('graphify-out/.graphify_extract.json').read_text(encoding="utf-8"))
    detection  = json.loads(Path('graphify-out/.graphify_detect.json').read_text(encoding="utf-8"))
    analysis   = json.loads(Path('graphify-out/.graphify_analysis.json').read_text(encoding="utf-8"))

    G = build_from_json(extraction, root='.', directed=False)
    communities = {int(k): v for k, v in analysis['communities'].items()}
    cohesion = {int(k): v for k, v in analysis['cohesion'].items()}
    tokens = {'input': extraction.get('input_tokens', 0), 'output': extraction.get('output_tokens', 0)}

    labels = {
        0: "API Route Handlers",
        1: "Core Production Dependencies",
        2: "TypeScript Environment Configuration",
        3: "Package Manifest & Scripts",
        4: "Admin Views & Components",
        5: "Development & Linter Tooling",
        6: "Public & Distributor View Pages",
        7: "UI Component Config & Utilities",
        8: "Product Helper & Data Mapping",
        9: "Documentation, Assets & Domain Model",
        10: "Storage Bucket Setup Script",
        11: "Supabase Integration Verification",
        12: "End-to-End System Verification",
        13: "Root Layout & Font Configuration",
        14: "Product Category Migration Script",
        15: "Excel Sample Data Generator",
        16: "Database Connection Test Script",
        17: "Excel Parser Testing Utility",
        18: "Product Viewer Utility Script",
        19: "Authentication Test Suite",
        20: "Next.js Build Configuration",
        21: "Notifications System View",
        22: "Fallback Product Mock Data",
        23: "Middleware & Route Protection",
        24: "Database Schema Creation Script",
        25: "Database Health Check Script",
        26: "Admin Dashboard Redirect",
        27: "Distributor Login View",
        28: "Distributor Portal Redirect",
        29: "Product Catalog View",
        30: "Next.js Type Declarations",
        31: "PostCSS Styling Configuration",
        32: "Graphify Setup Script",
        33: "Graphify Detector Utility"
    }

    questions = suggest_questions(G, communities, labels)

    report = generate(G, communities, cohesion, labels, analysis['gods'], analysis['surprises'], detection, tokens, '.', suggested_questions=questions)
    Path('graphify-out/GRAPH_REPORT.md').write_text(report, encoding="utf-8")
    Path('graphify-out/.graphify_labels.json').write_text(json.dumps({str(k): v for k, v in labels.items()}, ensure_ascii=False), encoding="utf-8")
    print('Report updated with community labels')
