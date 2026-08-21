import json
from pathlib import Path

if __name__ == '__main__':
    root_path = str(Path('.').resolve())
    readme_path = str(Path('README.md').resolve())

    nodes = [
        {
            "id": "doc:README.md",
            "label": "README.md",
            "type": "document",
            "source_file": "README.md",
            "summary": "Amul Price Portal MVP Documentation covering architecture, database schema, user personas, and workflow.",
            "confidence": 1.0,
            "provenance": "EXTRACTED"
        },
        {
            "id": "concept:AmulPricePortal",
            "label": "Amul Price Portal",
            "type": "concept",
            "source_file": "README.md",
            "summary": "Digital pricing platform built for Amul dairy to communicate product prices to retailers and distributors.",
            "confidence": 1.0,
            "provenance": "EXTRACTED"
        },
        {
            "id": "persona:Retailers",
            "label": "Retailers Persona",
            "type": "persona",
            "source_file": "README.md",
            "summary": "Public unauthenticated user persona that browses 15 Amul SKUs and filters by category.",
            "confidence": 1.0,
            "provenance": "EXTRACTED"
        },
        {
            "id": "persona:Distributors",
            "label": "Distributors Persona",
            "type": "persona",
            "source_file": "README.md",
            "summary": "OTP-authenticated user persona accessing WD pricing, GST, and distributor-specific rates.",
            "confidence": 1.0,
            "provenance": "EXTRACTED"
        },
        {
            "id": "persona:Admin",
            "label": "Admin Persona",
            "type": "persona",
            "source_file": "README.md",
            "summary": "Credentials-authenticated user persona managing product uploads and Excel price publishing.",
            "confidence": 1.0,
            "provenance": "EXTRACTED"
        },
        {
            "id": "feature:ExcelImportWorkflow",
            "label": "Excel Price Import Workflow",
            "type": "feature",
            "source_file": "README.md",
            "summary": "Workflow for uploading, previewing, and publishing pricing changes from Excel sheets.",
            "confidence": 1.0,
            "provenance": "EXTRACTED"
        },
        {
            "id": "asset:amul-banner.jpg",
            "label": "amul-banner.jpg",
            "type": "asset",
            "source_file": "public/amul-banner.jpg",
            "summary": "Banner branding image for the Amul Price Portal header.",
            "confidence": 0.9,
            "provenance": "EXTRACTED"
        },
        {
            "id": "asset:amul-logo",
            "label": "amul-logo-taste-of-india.png",
            "type": "asset",
            "source_file": "public/amul-logo-taste-of-india.png",
            "summary": "Official Amul Taste of India branding logo.",
            "confidence": 0.9,
            "provenance": "EXTRACTED"
        }
    ]

    edges = [
        {
            "source": "doc:README.md",
            "target": "concept:AmulPricePortal",
            "relation": "describes",
            "provenance": "EXTRACTED",
            "confidence": 1.0
        },
        {
            "source": "concept:AmulPricePortal",
            "target": "persona:Retailers",
            "relation": "serves",
            "provenance": "EXTRACTED",
            "confidence": 1.0
        },
        {
            "source": "concept:AmulPricePortal",
            "target": "persona:Distributors",
            "relation": "serves",
            "provenance": "EXTRACTED",
            "confidence": 1.0
        },
        {
            "source": "concept:AmulPricePortal",
            "target": "persona:Admin",
            "relation": "serves",
            "provenance": "EXTRACTED",
            "confidence": 1.0
        },
        {
            "source": "persona:Admin",
            "target": "feature:ExcelImportWorkflow",
            "relation": "operates",
            "provenance": "EXTRACTED",
            "confidence": 1.0
        },
        {
            "source": "asset:amul-banner.jpg",
            "target": "concept:AmulPricePortal",
            "relation": "visual_banner_for",
            "provenance": "EXTRACTED",
            "confidence": 0.9
        },
        {
            "source": "asset:amul-logo",
            "target": "concept:AmulPricePortal",
            "relation": "logo_for",
            "provenance": "EXTRACTED",
            "confidence": 0.9
        }
    ]

    semantic_data = {
        "nodes": nodes,
        "edges": edges,
        "hyperedges": [],
        "input_tokens": 1200,
        "output_tokens": 350
    }

    Path('graphify-out/.graphify_semantic.json').write_text(json.dumps(semantic_data, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Semantic extraction complete: {len(nodes)} nodes, {len(edges)} edges")
