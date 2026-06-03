# -*- coding: utf-8 -*-
"""Parse docs/ HTML files into TypeScript phase metadata.

Ticket data is intentionally loaded from the backend API at runtime, so this
script does not generate ticket source files.
"""
import json
import os

from bs4 import BeautifulSoup

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS = os.path.join(ROOT, "docs")
OUT = os.path.join(ROOT, "src", "data")
os.makedirs(OUT, exist_ok=True)


def text(el):
    return el.get_text(" ", strip=True) if el else ""


def bullets(card_content):
    out = []
    for ul in card_content.select("ul.bullet-list"):
        for li in ul.find_all("li", recursive=False):
            out.append(li.get_text(" ", strip=True))
    return out


def parse_phase(path, phase_num):
    with open(path, encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), "html.parser")

    title = text(soup.select_one(".page-title"))
    subtitle = text(soup.select_one(".page-subtitle"))

    sections = {"goal": None, "risk": None, "improvement": None}
    intro = ""
    badge_map = {"階段任務": "goal", "潛在風險": "risk", "修復與改進": "improvement"}
    for card in soup.select(".grid-2 .card"):
        ctitle = card.select_one(".card-title")
        badge = text(ctitle.select_one(".badge")) if ctitle else ""
        key = badge_map.get(badge)
        if not key:
            continue
        content = card.select_one(".card-content")
        if key == "goal":
            p = content.find("p")
            if p:
                intro = p.get_text(" ", strip=True)
        sections[key] = bullets(content)

    return {
        "phase": phase_num,
        "slug": f"phase-{phase_num}",
        "title": title,
        "subtitle": subtitle,
        "intro": intro,
        "goals": sections["goal"] or [],
        "risks": sections["risk"] or [],
        "improvements": sections["improvement"] or [],
    }


phases = []
for i in range(1, 9):
    phases.append(parse_phase(os.path.join(DOCS, f"phase{i}.html"), i))

phases_ts = """// AUTO-GENERATED from Architecture-Design/docs/phase*.html. Ticket data is loaded from the API. Do not edit by hand.
export interface Phase {
  phase: number;
  slug: string;
  title: string;
  subtitle: string;
  intro: string;
  goals: string[];
  risks: string[];
  improvements: string[];
}

export const phases: Phase[] = %s;
""" % json.dumps(phases, indent=2, ensure_ascii=False)

with open(os.path.join(OUT, "phases.ts"), "w", encoding="utf-8") as f:
    f.write(phases_ts)

print(f"Parsed {len(phases)} phases.")
for ph in phases:
    print(
        f"  Phase {ph['phase']}: {ph['title'][:30]} | "
        f"goals={len(ph['goals'])} risks={len(ph['risks'])} "
        f"imp={len(ph['improvements'])}"
    )
