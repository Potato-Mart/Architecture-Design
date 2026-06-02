# -*- coding: utf-8 -*-
"""Parse the docs/ HTML files into TypeScript data files for the Vite + React
site (phases -> Phases pages, tickets -> Tickets pages).

Paths are resolved relative to this script, so it works regardless of where the
project lives on disk (the script sits in <project>/scripts/)."""
import os
import re
import json
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

    def parse_tickets(card):
        items = []
        for t in card.select(".ticket"):
            tid = text(t.select_one(".ticket-id")).strip("[]")
            title_el = t.select_one(".ticket-title")
            # title minus the id span
            tt = title_el.get_text(" ", strip=True)
            id_text = text(title_el.select_one(".ticket-id"))
            ticket_title = tt.replace(id_text, "", 1).strip()
            desc_el = t.select_one(".ticket-desc")
            tag = text(desc_el.select_one(".badge")) if desc_el else ""
            # description text after the badge
            desc = ""
            if desc_el:
                full = desc_el.get_text(" ", strip=True)
                desc = full.replace(tag, "", 1).strip()
            ac = []
            ac_el = t.select_one(".ticket-ac")
            if ac_el:
                ac = [li.get_text(" ", strip=True) for li in ac_el.select("ul.bullet-list li")]
            items.append({
                "id": tid,
                "title": ticket_title,
                "tag": tag,
                "description": desc,
                "acceptance": ac,
            })
        return items

    backend, frontend = [], []
    for card in soup.select(".card"):
        ctitle = card.select_one(".card-title")
        if not ctitle:
            continue
        head = text(ctitle)
        if "Backend Backlog" in head or "後端工程" in head:
            backend = parse_tickets(card)
        elif "Frontend Backlog" in head or "前端工程" in head:
            frontend = parse_tickets(card)

    return {
        "phase": phase_num,
        "slug": f"phase-{phase_num}",
        "title": title,
        "subtitle": subtitle,
        "intro": intro,
        "goals": sections["goal"] or [],
        "risks": sections["risk"] or [],
        "improvements": sections["improvement"] or [],
        "backend": backend,
        "frontend": frontend,
    }


phases = []
for i in range(1, 9):
    p = os.path.join(DOCS, f"phase{i}.html")
    phases.append(parse_phase(p, i))

# Flatten tickets for the Blog
tickets = []
for ph in phases:
    for t in ph["backend"]:
        tickets.append({**t, "category": "backend", "phase": ph["phase"], "phaseTitle": ph["title"]})
    for t in ph["frontend"]:
        tickets.append({**t, "category": "frontend", "phase": ph["phase"], "phaseTitle": ph["title"]})

# ---- write phases.ts ----
phases_ts = """// AUTO-GENERATED from Architecture-Design/docs/phase*.html. Do not edit by hand.
export interface PhaseTicket {
  id: string;
  title: string;
  tag: string;
  description: string;
  acceptance: string[];
}

export interface Phase {
  phase: number;
  slug: string;
  title: string;
  subtitle: string;
  intro: string;
  goals: string[];
  risks: string[];
  improvements: string[];
  backend: PhaseTicket[];
  frontend: PhaseTicket[];
}

export const phases: Phase[] = %s;
""" % json.dumps(phases, indent=2, ensure_ascii=False)

with open(os.path.join(OUT, "phases.ts"), "w", encoding="utf-8") as f:
    f.write(phases_ts)

# ---- write tickets.ts ----
tickets_ts = """// AUTO-GENERATED from Architecture-Design/docs/phase*.html. Do not edit by hand.
export interface Ticket {
  id: string;
  title: string;
  tag: string;
  description: string;
  acceptance: string[];
  category: 'backend' | 'frontend';
  phase: number;
  phaseTitle: string;
}

export const tickets: Ticket[] = %s;
""" % json.dumps(tickets, indent=2, ensure_ascii=False)

with open(os.path.join(OUT, "tickets.ts"), "w", encoding="utf-8") as f:
    f.write(tickets_ts)

print(f"Parsed {len(phases)} phases, {len(tickets)} tickets.")
for ph in phases:
    print(f"  Phase {ph['phase']}: {ph['title'][:30]} | goals={len(ph['goals'])} risks={len(ph['risks'])} imp={len(ph['improvements'])} BE={len(ph['backend'])} FE={len(ph['frontend'])}")
