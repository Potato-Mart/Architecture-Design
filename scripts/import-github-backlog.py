#!/usr/bin/env python3
import argparse
import csv
import json
import sys
import subprocess
from collections import defaultdict
from typing import List, Dict, Any, Tuple

# Constants
TODO = "Todo"
IN_PROGRESS = "In Progress"
DONE = "Done"

STATUS_ALIASES = {
    "todo": TODO, "to do": TODO, "backlog": TODO, "open": TODO,
    "in progress": IN_PROGRESS, "doing": IN_PROGRESS, "wip": IN_PROGRESS,
    "done": DONE, "complete": DONE, "completed": DONE, "closed": DONE
}

WORKFLOW_LABELS = {
    TODO: "todo",
    IN_PROGRESS: "in progress",
    DONE: "done"
}

def normalize_status(status_raw: str, default_status: str) -> Tuple[str, bool]:
    if not status_raw or not status_raw.strip():
        return default_status, True
    
    clean_status = status_raw.strip().lower()
    
    if clean_status in STATUS_ALIASES:
        return STATUS_ALIASES[clean_status], True
        
    return status_raw.strip(), False

def check_gh_installed() -> bool:
    try:
        subprocess.run(["gh", "--version"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def run_gh_cmd(cmd: List[str], dry_run: bool = False, capture_output: bool = True) -> str:
    if dry_run:
        print(f"[DRY-RUN] gh {' '.join(cmd)}")
        return "{}" # Return empty JSON placeholder
        
    try:
        result = subprocess.run(["gh"] + cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, encoding='utf-8', check=True)
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"Error executing gh {' '.join(cmd)}", file=sys.stderr)
        print(f"Stdout: {e.stdout}", file=sys.stderr)
        print(f"Stderr: {e.stderr}", file=sys.stderr)
        sys.exit(1)

def get_project_metadata(project_number: str, project_owner: str, status_field_name: str) -> Dict[str, Any]:
    print(f"Fetching project metadata for project {project_number}...")
    
    # Fetch Project Node ID
    proj_view = run_gh_cmd(["project", "view", project_number, "--owner", project_owner, "--format", "json"])
    project_node_id = json.loads(proj_view)['id']
    
    # Fetch Fields
    output = run_gh_cmd(["project", "field-list", project_number, "--owner", project_owner, "--format", "json"])
    fields = json.loads(output)
    
    status_field = next((f for f in fields['fields'] if f['name'] == status_field_name), None)
    if not status_field:
        print(f"Error: Could not find field '{status_field_name}' in project {project_number}.", file=sys.stderr)
        sys.exit(1)
        
    field_type = status_field.get('type', status_field.get('dataType', ''))
    if str(field_type).upper() not in ['SINGLESELECT', 'SINGLE_SELECT', 'PROJECTV2SINGLESELECTFIELD']:
        print(f"Error: Field '{status_field_name}' is not a single select field (found type: {field_type}).", file=sys.stderr)
        sys.exit(1)
        
    options = {opt['name']: opt['id'] for opt in status_field.get('options', [])}
    
    return {
        "project_node_id": project_node_id,
        "field_id": status_field['id'],
        "options": options
    }

def ensure_labels_exist(repo: str, labels: set, dry_run: bool = False):
    print("Ensuring all required labels exist in the repository...")
    for label in labels:
        if not label: continue
        if dry_run:
            print(f"[DRY-RUN] gh label create '{label}' --repo {repo}")
            continue
            
        try:
            subprocess.run(["gh", "label", "create", label, "--repo", repo], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, encoding='utf-8', check=True)
            print(f"  Created label: {label}")
        except subprocess.CalledProcessError as e:
            if "already exists" in e.stderr.lower() or "name has already been taken" in e.stderr.lower():
                pass # Label exists
            else:
                print(f"  Warning: Could not create label '{label}': {e.stderr.strip()}", file=sys.stderr)

def print_table(tickets: List[Dict[str, Any]]):
    if not tickets:
        print("No tickets to display.")
        return
        
    # Calculate column widths
    col_widths = {
        'ID': 3,
        'Title': max(len(t['title']) for t in tickets) if tickets else 5,
        'Status': 12,
        'Labels': max(len(", ".join(t['all_labels'])) for t in tickets) if tickets else 6,
        'Warnings': max(len(", ".join(t['warnings'])) for t in tickets) if tickets else 8,
    }
    col_widths['Title'] = max(col_widths['Title'], 5)
    col_widths['Labels'] = max(col_widths['Labels'], 6)
    col_widths['Warnings'] = max(col_widths['Warnings'], 8)

    # Print header
    header = f"{'ID':<{col_widths['ID']}} | {'Title':<{col_widths['Title']}} | {'Status':<{col_widths['Status']}} | {'Labels':<{col_widths['Labels']}} | {'Warnings':<{col_widths['Warnings']}}"
    print("-" * len(header))
    print(header)
    print("-" * len(header))
    
    # Print rows
    for i, t in enumerate(tickets, 1):
        labels_str = ", ".join(t['all_labels'])
        warnings_str = ", ".join(t['warnings'])
        print(f"{i:<{col_widths['ID']}} | {t['title']:<{col_widths['Title']}} | {t['status']:<{col_widths['Status']}} | {labels_str:<{col_widths['Labels']}} | {warnings_str:<{col_widths['Warnings']}}")
    print("-" * len(header))

def print_markdown(tickets: List[Dict[str, Any]]):
    if not tickets:
        print("No tickets to display.")
        return
        
    print("| ID | Title | Status | Labels | Warnings |")
    print("|---|---|---|---|---|")
    for i, t in enumerate(tickets, 1):
        labels_str = ", ".join(t['all_labels'])
        warnings_str = ", ".join(t['warnings'])
        print(f"| {i} | {t['title']} | {t['status']} | {labels_str} | {warnings_str} |")

def main():
    parser = argparse.ArgumentParser(description="Review-first GitHub Project Backlog Importer")
    parser.add_argument("--file", required=True, help="Path to the CSV file")
    parser.add_argument("--default-status", default=TODO, help="Default status for tickets without one (default: Todo)")
    parser.add_argument("--status-field", default="Status", help="Name of the Status field in GitHub Project (default: Status)")
    parser.add_argument("--format", choices=["table", "markdown", "json"], default="table", help="Display format for preview")
    parser.add_argument("--output", help="Path to write the preview output")
    parser.add_argument("--approve", action="store_true", help="Approve and execute upload to GitHub")
    parser.add_argument("--repo", help="GitHub repository (OWNER/REPO)")
    parser.add_argument("--project-owner", help="GitHub Project owner (OWNER_OR_ORG)")
    parser.add_argument("--project-number", help="GitHub Project number")
    parser.add_argument("--dry-run", action="store_true", help="Simulate upload without mutating GitHub")

    args = parser.parse_args()

    if args.approve and not (args.repo and args.project_owner and args.project_number):
        print("Error: --repo, --project-owner, and --project-number are required when using --approve", file=sys.stderr)
        sys.exit(1)

    tickets = []
    errors = []
    seen_titles = set()
    
    stats = {
        "total": 0,
        "todo": 0,
        "in_progress": 0,
        "done": 0,
        "warnings": 0,
        "errors": 0
    }

    try:
        with open(args.file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            # Check for required columns
            if not reader.fieldnames or 'title' not in reader.fieldnames:
                print("Error: CSV must contain a 'title' column.", file=sys.stderr)
                sys.exit(1)
                
            for row_idx, row in enumerate(reader, 1):
                ticket_errors = []
                ticket_warnings = []
                
                title = row.get('title', '').strip()
                body = row.get('body', '').strip()
                status_raw = row.get('status', '').strip()
                labels_raw = row.get('labels', '').strip()
                
                if not title:
                    ticket_errors.append("Empty title")
                
                if not body:
                    ticket_warnings.append("Missing body")
                    
                if title in seen_titles:
                    ticket_warnings.append("Duplicate title")
                if title:
                    seen_titles.add(title)
                
                status, is_valid_status = normalize_status(status_raw, args.default_status)
                if not is_valid_status:
                    ticket_errors.append(f"Unknown status: '{status_raw}'")
                    
                add_labels = [l.strip() for l in labels_raw.split(',')] if labels_raw else []
                workflow_label = WORKFLOW_LABELS.get(status, "")
                
                all_labels = []
                if workflow_label:
                    all_labels.append(workflow_label)
                all_labels.extend([l for l in add_labels if l and l != workflow_label])
                
                if ticket_errors:
                    stats["errors"] += 1
                if ticket_warnings:
                    stats["warnings"] += 1
                    
                if not ticket_errors:
                    stats["total"] += 1
                    if status == TODO: stats["todo"] += 1
                    elif status == IN_PROGRESS: stats["in_progress"] += 1
                    elif status == DONE: stats["done"] += 1

                tickets.append({
                    "row": row_idx,
                    "title": title,
                    "body": body,
                    "status": status,
                    "all_labels": all_labels,
                    "errors": ticket_errors,
                    "warnings": ticket_warnings
                })
                
    except FileNotFoundError:
        print(f"Error: File '{args.file}' not found.", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error reading CSV: {e}", file=sys.stderr)
        sys.exit(1)

    if not tickets:
        print("Error: Empty CSV or no valid rows found.", file=sys.stderr)
        sys.exit(1)

    # Setup output redirection if --output is provided
    out_file = None
    original_stdout = sys.stdout
    if args.output:
        out_file = open(args.output, 'w', encoding='utf-8')
        sys.stdout = out_file

    try:
        # Display preview
        print("--- TICKET PREVIEW ---")
        if args.format == "table":
            print_table(tickets)
        elif args.format == "markdown":
            print_markdown(tickets)
        elif args.format == "json":
            print(json.dumps(tickets, indent=2, ensure_ascii=False))
            
        print("\n--- SUMMARY ---")
        print(f"Total valid tickets: {stats['total']}")
        print(f"Todo: {stats['todo']}")
        print(f"In Progress: {stats['in_progress']}")
        print(f"Done: {stats['done']}")
        print(f"Tickets with warnings: {stats['warnings']}")
        print(f"Tickets with errors: {stats['errors']}")
        
        if stats["errors"] > 0:
            print("\n🚨 CRITICAL: There are tickets with errors. Please fix them before uploading.")
            for t in tickets:
                if t['errors']:
                    print(f"Row {t['row']} ({t.get('title','')}): {', '.join(t['errors'])}")
                    
    finally:
        if out_file:
            sys.stdout = original_stdout
            out_file.close()

    # Upload logic
    if not args.approve:
        print("\nPreview only. No GitHub changes were made. Re-run with --approve to upload these tickets.")
        sys.exit(0)

    if stats["errors"] > 0:
        print("\nUpload aborted due to validation errors. Please fix the CSV and try again.", file=sys.stderr)
        sys.exit(1)

    print("\n--- INITIATING GITHUB UPLOAD ---")
    if not check_gh_installed():
        print("Error: GitHub CLI (gh) is not installed or not in PATH.", file=sys.stderr)
        print("Please install gh and run 'gh auth login' before uploading.", file=sys.stderr)
        sys.exit(1)
        
    # Ensure all labels exist before creating issues
    all_unique_labels = set()
    for t in tickets:
        all_unique_labels.update(t['all_labels'])
    ensure_labels_exist(args.repo, all_unique_labels, args.dry_run)

    # Fetch project metadata for setting statuses
    project_meta = {}
    if not args.dry_run:
        project_meta = get_project_metadata(args.project_number, args.project_owner, args.status_field)

    for idx, ticket in enumerate(tickets, 1):
        print(f"Processing ticket {idx}/{len(tickets)}: {ticket['title']}")
        
        # 1. Create Issue
        issue_cmd = ["issue", "create", "--repo", args.repo, "--title", ticket['title'], "--body", ticket['body']]
        if ticket['all_labels']:
            issue_cmd.extend(["--label", ",".join(ticket['all_labels'])])
            
        if args.dry_run:
            issue_url = "https://github.com/dry-run/issue/1"
            run_gh_cmd(issue_cmd, dry_run=True)
        else:
            issue_url = run_gh_cmd(issue_cmd)
            print(f"  Created issue: {issue_url}")
            
        # 2. Add to Project
        add_cmd = ["project", "item-add", args.project_number, "--owner", args.project_owner, "--url", issue_url, "--format", "json"]
        if args.dry_run:
            item_id = "PNI_dryrun123"
            project_node_id = "PVT_dryrun123"
            run_gh_cmd(add_cmd, dry_run=True)
        else:
            add_result_str = run_gh_cmd(add_cmd)
            add_result = json.loads(add_result_str)
            item_id = add_result['id']
            project_node_id = project_meta['project_node_id']
            print(f"  Added to project (Item ID: {item_id})")
            
            # 3. Set Project Status Field
            status_val = ticket['status']
            if status_val in project_meta.get('options', {}):
                option_id = project_meta['options'][status_val]
                edit_cmd = [
                    "project", "item-edit", "--id", item_id,
                    "--project-id", project_node_id,
                    "--field-id", project_meta['field_id'],
                    "--single-select-option-id", option_id
                ]
                run_gh_cmd(edit_cmd)
                print(f"  Updated status to: {status_val}")
            else:
                print(f"  Warning: Status '{status_val}' not found in project options. Available: {list(project_meta.get('options', {}).keys())}")

    print("\n✅ Upload complete!")

if __name__ == "__main__":
    main()
