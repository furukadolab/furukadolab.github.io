#!/usr/bin/env python3
# researchmap v2 API -> data/researchmap.json
# Uses only Python standard library.

from __future__ import annotations
import json
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

PERMALINK = "80882191"
BASE = f"https://api.researchmap.jp/{PERMALINK}/"
OUT = Path(__file__).resolve().parents[1] / "data" / "researchmap.json"

RESOURCES = {
    "published_papers": "published_papers",
    "books_etc": "books_etc",
    "presentations": "presentations",
    "awards": "awards",
    "research_projects": "research_projects",
}

def get_json(url):
    req = urllib.request.Request(
        url,
        headers={
            "Accept": "application/json",
            "User-Agent": "FurukadoLab-GitHubPages/1.0",
        },
    )
    with urllib.request.urlopen(req, timeout=45) as r:
        return json.loads(r.read().decode("utf-8"))

def loc(v):
    if v is None:
        return ""
    if isinstance(v, (str, int, float)):
        return str(v)
    if isinstance(v, list):
        return ", ".join(x for x in (loc(i) for i in v) if x)
    if isinstance(v, dict):
        for k in ("ja", "en", "name", "value"):
            if k in v and v[k]:
                return loc(v[k])
        vals = [loc(x) for x in v.values()]
        return " / ".join(x for x in vals if x)
    return str(v)

def first_url(item):
    for s in item.get("see_also") or []:
        if isinstance(s, dict):
            u = s.get("@id") or s.get("url")
            if isinstance(u, str) and u.startswith(("http://","https://")):
                return u
    ids = item.get("identifiers") or {}
    doi = ids.get("doi") if isinstance(ids, dict) else None
    if doi:
        d = doi[0] if isinstance(doi, list) else doi
        d = loc(d)
        if d:
            return "https://doi.org/" + d.replace("https://doi.org/","")
    return ""

def period(item):
    for k in ("publication_date","event_date","award_date","date"):
        if item.get(k):
            return loc(item[k])
    starts = [item.get("from_date"), item.get("start_date"), item.get("research_period_from")]
    ends = [item.get("to_date"), item.get("end_date"), item.get("research_period_to")]
    a = next((loc(x) for x in starts if x), "")
    b = next((loc(x) for x in ends if x), "")
    return " – ".join(x for x in (a,b) if x)

def amount(item):
    for k in ("total_cost","amount","funding_amount"):
        v = item.get(k)
        if v:
            if isinstance(v, dict):
                v = v.get("total_cost") or v.get("value") or v.get("ja") or v.get("en")
            s = loc(v)
            if s:
                return s
    return ""

def normalize(name, item):
    if name == "published_papers":
        return {
            "date": period(item),
            "title": loc(item.get("paper_title") or item.get("title")),
            "venue": loc(item.get("publication_name") or item.get("publisher")),
            "authors": loc(item.get("authors")),
            "url": first_url(item),
        }
    if name == "books_etc":
        return {
            "date": period(item),
            "title": loc(item.get("book_title") or item.get("title")),
            "venue": loc(item.get("publisher")),
            "authors": loc(item.get("authors")),
            "url": first_url(item),
        }
    if name == "presentations":
        return {
            "date": period(item),
            "title": loc(item.get("presentation_title") or item.get("title")),
            "venue": loc(item.get("event") or item.get("event_name")),
            "authors": loc(item.get("presenters")),
            "url": first_url(item),
        }
    if name == "awards":
        return {
            "date": period(item),
            "title": loc(item.get("award_name") or item.get("award_title") or item.get("title")),
            "venue": loc(item.get("association")),
            "url": first_url(item),
        }
    if name == "research_projects":
        ids = item.get("identifiers") or {}
        grant_num = item.get("grant_number")
        if not grant_num and isinstance(ids, dict):
            grant_num = ids.get("grant_number") or ids.get("national_grant_number")
        return {
            "period": period(item),
            "year": period(item),
            "title": loc(item.get("research_project_title") or item.get("title")),
            "funder": loc(item.get("offer_organization") or item.get("funder")),
            "program": loc(item.get("system_name") or item.get("fund_type")),
            "grant_number": loc(grant_num),
            "role": loc(item.get("research_project_owner_role") or item.get("roles")),
            "amount": amount(item),
            "url": first_url(item),
        }
    return item

def items_from(payload):
    if isinstance(payload, list):
        return payload
    if not isinstance(payload, dict):
        return []
    for key in ("items","data","results"):
        if isinstance(payload.get(key), list):
            return payload[key]
    # Some APIs may return the resource list under a resource-specific key
    for v in payload.values():
        if isinstance(v, list) and v and isinstance(v[0], dict):
            return v
    return []

def fetch_resource(endpoint):
    # API accepts paging/limit parameters; keep this broad enough for a personal profile.
    url = BASE + endpoint + "?format=json&limit=1000"
    payload = get_json(url)
    return items_from(payload)

def main():
    out = {
        "generated_at": datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds"),
        "permalink": PERMALINK,
        "sync_status": "ok",
    }
    errors = {}
    for key, endpoint in RESOURCES.items():
        try:
            raw = fetch_resource(endpoint)
            out[key] = [normalize(key, x) for x in raw]
        except Exception as e:
            out[key] = []
            errors[key] = f"{type(e).__name__}: {e}"
    if errors:
        out["sync_status"] = "partial"
        out["errors"] = errors
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {OUT}")
    if errors:
        print(json.dumps(errors, ensure_ascii=False, indent=2), file=sys.stderr)

if __name__ == "__main__":
    main()
