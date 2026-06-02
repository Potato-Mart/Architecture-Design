import os
import csv
import re
from bs4 import BeautifulSoup

def extract_tickets():
    tickets = []
    docs_dir = r"C:\Users\User\Documents\Potato Mart\Architecture-Design\docs"
    
    for i in range(1, 9):
        file_path = os.path.join(docs_dir, f"phase{i}.html")
        if not os.path.exists(file_path):
            continue
            
        with open(file_path, 'r', encoding='utf-8') as f:
            soup = BeautifulSoup(f.read(), 'html.parser')
            
            ticket_divs = soup.find_all('div', class_='ticket')
            for ticket in ticket_divs:
                title_elem = ticket.find('div', class_='ticket-title')
                desc_elem = ticket.find('div', class_='ticket-desc')
                ac_elem = ticket.find('div', class_='ticket-ac')
                
                if not title_elem:
                    continue
                    
                title = title_elem.get_text(strip=True)
                
                body_parts = []
                if desc_elem:
                    # Replace <br> with newline for cleaner markdown
                    for br in desc_elem.find_all('br'):
                        br.replace_with('\n')
                    body_parts.append(desc_elem.get_text(strip=True))
                
                if ac_elem:
                    # Process AC list
                    ac_title = ac_elem.find('div', class_='ticket-ac-title')
                    if ac_title:
                        body_parts.append("\n**" + ac_title.get_text(strip=True) + "**")
                    
                    ul = ac_elem.find('ul')
                    if ul:
                        for li in ul.find_all('li'):
                            body_parts.append("- " + li.get_text(strip=True))
                            
                body = "\n".join(body_parts)
                
                # Determine labels
                labels = [f"phase-{i}"]
                if "[BE-" in title:
                    labels.append("backend")
                elif "[FE-" in title:
                    labels.append("frontend")
                    
                tickets.append({
                    "title": title,
                    "body": body,
                    "status": "Todo",
                    "labels": ",".join(labels)
                })
                
    # Write to CSV
    csv_path = r"C:\Users\User\Documents\Potato Mart\Architecture-Design\tickets.csv"
    with open(csv_path, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=["title", "body", "status", "labels"])
        writer.writeheader()
        writer.writerows(tickets)
        print(f"Successfully extracted {len(tickets)} tickets to {csv_path}")

if __name__ == "__main__":
    extract_tickets()
