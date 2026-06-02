import csv
import json
import os
import re

csv_path = r"C:\Users\User\Documents\Potato Mart\Architecture-Design\tickets.csv"
ts_path = r"C:\Users\User\Documents\Potato Mart\Architecture-Design\presentation-site\src\data\tickets.ts"

os.makedirs(os.path.dirname(ts_path), exist_ok=True)

tickets = []
with open(csv_path, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        # Determine phase from labels
        phase = 1
        labels = row.get('labels', '').split(',')
        for l in labels:
            if l.startswith('phase-'):
                phase = int(l.replace('phase-', ''))
                break
        
        # Determine if frontend or backend
        category = "backend"
        if "frontend" in labels: category = "frontend"
        
        tickets.append({
            "id": row.get('title', '').split(']')[0].strip('[') if ']' in row.get('title', '') else "",
            "title": row.get('title', ''),
            "description": row.get('body', ''),
            "status": row.get('status', 'Todo'),
            "category": category,
            "phase": phase,
            "labels": labels
        })

ts_content = f"""export interface Ticket {{
  id: string;
  title: string;
  description: string;
  status: string;
  category: 'frontend' | 'backend';
  phase: number;
  labels: string[];
}}

export const tickets: Ticket[] = {json.dumps(tickets, indent=2, ensure_ascii=False)};
"""

with open(ts_path, 'w', encoding='utf-8') as f:
    f.write(ts_content)

print(f"Generated {len(tickets)} tickets in {ts_path}")
