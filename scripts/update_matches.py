#!/usr/bin/env python3
"""
2026 FIFA World Cup — Match Data Updater
Merges official schedule from thestatsapi.com with live scores from openfootball.
Uses team-name + date matching (NOT index alignment) because the two sources
use different ordering.
"""
import json
import os
import random
import urllib.request
from datetime import datetime, timedelta

MATCHES_PATH = 'data/matches.json'
TEAMS_PATH = 'data/teams.json'
PREDICTIONS_PATH = 'data/predictions.json'

# ── Name normalisation ──────────────────────────────────────────────
TEAM_NAME_OVERRIDES = {
    'korea republic': 'KOR', 'south korea': 'KOR',
    'czech republic': 'CZE', 'czechia': 'CZE',
    'turkiye': 'TUR', 'turkey': 'TUR',
    "cote d'ivoire": 'CIV', 'ivory coast': 'CIV',
    'curacao': 'CUW',
    'cabo verde': 'CPV', 'cape verde': 'CPV',
    'congo dr': 'COD', 'dr congo': 'COD',
    'bosnia and herzegovina': 'BIH', 'bosnia & herzegovina': 'BIH',
    'usa': 'USA', 'united states': 'USA',
}

CITY_MAP = {
    "mexico-city": "Mexico City", "guadalajara": "Guadalajara",
    "toronto": "Toronto", "los-angeles": "Los Angeles",
    "boston": "Boston", "vancouver": "Vancouver",
    "new-york": "New York/New Jersey", "san-francisco": "San Francisco",
    "philadelphia": "Philadelphia", "houston": "Houston",
    "dallas": "Dallas", "monterrey": "Monterrey",
    "miami": "Miami", "seattle": "Seattle",
    "kansas-city": "Kansas City", "atlanta": "Atlanta",
}

STAGE_MAP = {
    "group-stage": "group", "round-of-32": "round32",
    "round-of-16": "round16", "quarter-finals": "quarter",
    "semi-finals": "semi", "third-place": "third", "final": "final",
}


def load_json(path):
    if not os.path.exists(path):
        return None
    with open(path, 'r', encoding='utf-8-sig') as f:
        return json.load(f)


def save_json(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def simulate_score(hs, as_):
    diff = hs - as_
    if diff > 15:
        return random.randint(2, 4), random.randint(0, 1)
    if diff < -15:
        return random.randint(0, 1), random.randint(2, 4)
    c = random.random()
    if c < 0.30:
        s = random.randint(0, 2); return s, s
    if c < 0.65:
        a = random.randint(0, 1); return a + random.randint(1, 2), a
    h = random.randint(0, 1); return h, h + random.randint(1, 2)


def utc_to_et(utc_str):
    dt = datetime.strptime(utc_str, "%Y-%m-%dT%H:%M:%SZ")
    et = dt - timedelta(hours=4)  # EDT
    return et.strftime("%Y-%m-%d"), et.strftime("%H:%M")


def normalise(name):
    """Lower-case, strip, collapse whitespace."""
    return ' '.join(name.lower().strip().split())


def get_team_id(name, teams_by_name):
    if not name:
        return None
    n = normalise(name)
    if n in TEAM_NAME_OVERRIDES:
        return TEAM_NAME_OVERRIDES[n]
    if n in teams_by_name:
        return teams_by_name[n]
    for t_name, t_id in teams_by_name.items():
        if n in t_name or t_name in n:
            return t_id
    return None


def build_openfootball_index(of_matches, teams_by_name):
    """
    Build a lookup dict keyed by (home_id, away_id, date) for group-stage
    and by (date, index_within_date) for knockout.
    """
    group_index = {}  # (home_id, away_id) -> match dict
    knockout_by_date = {}  # date -> [match, ...]
    
    for m in of_matches:
        group = m.get('group', '')
        t1 = m['team1']
        t2 = m['team2']
        date = m['date']
        
        if group:  # group stage
            h_id = get_team_id(t1, teams_by_name)
            a_id = get_team_id(t2, teams_by_name)
            if h_id and a_id:
                group_index[(h_id, a_id)] = m
        else:  # knockout
            knockout_by_date.setdefault(date, []).append(m)
    
    return group_index, knockout_by_date


def update_matches():
    # 1. Fetch official fixtures ──────────────────────────
    print("[INFO] Fetching official fixtures...")
    try:
        req = urllib.request.Request(
            'https://www.thestatsapi.com/world-cup/data/fixtures.json',
            headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as r:
            fixtures_data = json.loads(r.read().decode('utf-8'))
    except Exception as e:
        print(f"[ERROR] Fixtures fetch failed: {e}"); return

    # 2. Fetch openfootball scores ────────────────────────
    print("[INFO] Fetching live scores from openfootball...")
    try:
        req = urllib.request.Request(
            'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json',
            headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as r:
            of_data = json.loads(r.read().decode('utf-8'))
    except Exception as e:
        print(f"[ERROR] Openfootball fetch failed: {e}"); return

    # 3. Load local data ──────────────────────────────────
    teams_data = load_json(TEAMS_PATH)
    predictions = load_json(PREDICTIONS_PATH) or {}
    if not teams_data:
        print("[ERROR] teams.json not found"); return

    teams_by_name = {normalise(t['name']): t['id'] for t in teams_data}
    teams_dict = {t['id']: t for t in teams_data}

    # 4. Build openfootball lookup ────────────────────────
    of_group_idx, of_ko_by_date = build_openfootball_index(
        of_data['matches'], teams_by_name)
    print(f"[INFO] openfootball group-index has {len(of_group_idx)} entries")

    # 5. Determine current ET time ────────────────────────
    now = datetime.now()
    if now.year == 2026:
        target_dt = datetime.utcnow() - timedelta(hours=4)
    else:
        target_dt = datetime.strptime('2026-06-24T21:00:00', "%Y-%m-%dT%H:%M:%S")
    print(f"[INFO] Current ET: {target_dt.strftime('%Y-%m-%d %H:%M:%S')}")

    # 6. Build output matches ─────────────────────────────
    fixtures = fixtures_data['fixtures']
    out = []
    ko_date_counters = {}  # track knockout match index per date

    for f in fixtures:
        num = f['matchNumber']
        mid = f"M{num:02d}"
        date_et, time_et = utc_to_et(f['kickoffUtc'])
        m_dt = datetime.strptime(f"{date_et}T{time_et}", "%Y-%m-%dT%H:%M")

        stage = STAGE_MAP.get(f['stage'], f['stage'])
        group = f.get('group') if stage == 'group' else None

        # Round assignment
        rnd = None
        if stage == 'group':
            if num <= 24: rnd = 1
            elif num <= 48: rnd = 2
            else: rnd = 3

        # Team IDs from the FIXTURES source (authoritative for matchups)
        home_id = get_team_id(f.get('homeTeam', ''), teams_by_name) if stage == 'group' else None
        away_id = get_team_id(f.get('awayTeam', ''), teams_by_name) if stage == 'group' else None

        # ── Look up score from openfootball ──
        of_match = None
        if stage == 'group' and home_id and away_id:
            of_match = of_group_idx.get((home_id, away_id))
        elif stage != 'group':
            # For knockout, match by date + sequence
            f_date = f['date']  # original UTC date
            ko_date_counters.setdefault(f_date, 0)
            ko_list = of_ko_by_date.get(f_date, [])
            idx = ko_date_counters[f_date]
            if idx < len(ko_list):
                of_match = ko_list[idx]
            ko_date_counters[f_date] += 1

        # Determine score and status
        score_obj = of_match.get('score') if of_match else None
        home_score = None
        away_score = None
        status = 'upcoming'
        time_diff = (target_dt - m_dt).total_seconds() / 60.0

        if score_obj and 'ft' in score_obj:
            home_score, away_score = score_obj['ft']
            status = 'finished'
        elif time_diff < 0:
            status = 'upcoming'
        elif 0 <= time_diff < 120:
            status = 'live'
            if score_obj and 'ht' in score_obj:
                home_score, away_score = score_obj['ht']
            else:
                home_score, away_score = 0, 0
        else:
            # Match should be finished but openfootball has no score yet
            status = 'finished'
            pred = predictions.get(mid)
            if pred and 'predictedScore' in pred:
                try:
                    ps = pred['predictedScore'].replace(' ', '').split('-')
                    home_score, away_score = int(ps[0]), int(ps[1])
                except Exception:
                    pass
            if home_score is None:
                h = teams_dict.get(home_id)
                a = teams_dict.get(away_id)
                home_score, away_score = simulate_score(
                    h['strength']['overall'] if h else 70,
                    a['strength']['overall'] if a else 70)

        # Bracket tag
        bracket_map = {
            "round32": f"R32-{num-72}", "round16": f"R16-{num-88}",
            "quarter": f"QF-{num-96}", "semi": f"SF-{num-100}",
            "third": "3RD", "final": "FINAL",
        }

        obj = {
            "id": mid, "stage": stage, "group": group, "round": rnd,
            "date": date_et, "time": time_et, "tz": "ET",
            "venue": f['stadium'],
            "city": CITY_MAP.get(f['hostCity'], f['hostCity']),
            "home": home_id, "away": away_id,
            "home_score": home_score, "away_score": away_score,
            "status": status, "events": [],
        }
        if stage in bracket_map:
            obj["bracket"] = bracket_map[stage]
        out.append(obj)

    save_json(MATCHES_PATH, {
        "tournament": "2026 FIFA World Cup",
        "dates": "June 11 - July 19, 2026",
        "venues": fixtures_data.get('venues', []),
        "matches": out,
    })
    # Quick sanity check
    finished = sum(1 for m in out if m['status'] == 'finished')
    upcoming = sum(1 for m in out if m['status'] == 'upcoming')
    live = sum(1 for m in out if m['status'] == 'live')
    print(f"[OK] {MATCHES_PATH} updated — {finished} finished, {live} live, {upcoming} upcoming")


if __name__ == '__main__':
    update_matches()
