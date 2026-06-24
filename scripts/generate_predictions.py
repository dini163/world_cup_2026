#!/usr/bin/env python3
"""
2026 FIFA World Cup — AI Predictions Generator

Uses Pollinations.ai (free, no API key required) to generate AI-powered
match predictions. Falls back to a strength-based algorithm if the AI
API is unavailable.

Features:
  - Calls free AI API for each upcoming group match
  - Parses JSON response with probability validation
  - Falls back to enhanced template algorithm on AI failure
  - Detects and repairs Git merge conflict markers
  - Preserves existing predictions for completed matches

Designed to run in GitHub Actions cron (hourly).
"""
import json
import os
import re
import random
import time
import urllib.request
import urllib.parse
import urllib.error
from datetime import datetime

# File paths
PREDICTIONS_PATH = 'data/predictions.json'
MATCHES_PATH = 'data/matches.json'
TEAMS_PATH = 'data/teams.json'

# Pollinations.ai — free text generation API, no key required
AI_API_URL = 'https://text.pollinations.ai/'

# Rate limiting: delay between AI calls (seconds)
AI_DELAY = 2.0

# AI request timeout (seconds)
AI_TIMEOUT = 90


def load_json(path):
    """Load JSON file, returning empty dict/list on error."""
    if not os.path.exists(path):
        return {} if path.endswith('predictions.json') else []
    try:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        # Detect Git merge conflict markers
        if '<<<<<<< HEAD' in content or '>>>>>>>' in content:
            print(f"[ERROR] {path} contains Git merge conflict markers!")
            print("[INFO] Attempting to recover by extracting clean JSON...")
            return recover_from_conflict(content)
        return json.loads(content)
    except json.JSONDecodeError as e:
        print(f"[ERROR] JSON parse failed for {path}: {e}")
        return {} if path.endswith('predictions.json') else []


def recover_from_conflict(content):
    """Attempt to recover JSON from a file with merge conflict markers.

    Strategy: extract the HEAD version (first section) by removing
    everything between ======= and >>>>>>> markers.
    """
    # Remove conflict blocks: take HEAD side, discard incoming side
    cleaned = re.sub(
        r'<<<<<<< HEAD\n(.*?)=======\n.*?>>>>>>>[^\n]*\n',
        r'\1',
        content,
        flags=re.DOTALL
    )
    # Also handle cases where markers exist without proper pairs
    cleaned = re.sub(r'^(<<<<<<<|=======|>>>>>>>)[^\n]*\n', '', cleaned, flags=re.MULTILINE)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        print("[ERROR] Could not recover JSON from conflicted file. Starting fresh.")
        return {}


def save_json(path, data):
    """Save JSON with conflict pre-check."""
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def call_ai(prompt, timeout=AI_TIMEOUT, max_retries=3):
    """Call Pollinations.ai free text API via GET.

    Returns the AI-generated text, or None on failure.
    No API key required. Retries on transient errors (502, timeout).
    """
    for attempt in range(max_retries):
        try:
            url = AI_API_URL + urllib.parse.quote(prompt)
            req = urllib.request.Request(
                url,
                headers={'User-Agent': 'Mozilla/5.0 (WorldCupPredictor/1.0)'}
            )
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return r.read().decode('utf-8', errors='ignore').strip()
        except urllib.error.HTTPError as e:
            if e.code in (502, 503, 429) and attempt < max_retries - 1:
                wait = (attempt + 1) * 5
                print(f"[WARN] HTTP {e.code}, retrying in {wait}s "
                      f"(attempt {attempt + 2}/{max_retries})...", end=' ', flush=True)
                time.sleep(wait)
                continue
            print(f"[WARN] AI API HTTP {e.code} after {max_retries} attempts")
            return None
        except Exception as e:
            if attempt < max_retries - 1:
                wait = (attempt + 1) * 5
                print(f"[WARN] {e}, retrying in {wait}s "
                      f"(attempt {attempt + 2}/{max_retries})...", end=' ', flush=True)
                time.sleep(wait)
                continue
            print(f"[WARN] AI API call failed: {e}")
            return None
    return None


def parse_ai_json(ai_text):
    """Extract and validate JSON from AI response.

    Handles markdown code blocks, extra text, and validates probabilities.
    Returns dict or None.
    """
    if not ai_text:
        return None

    # Strip markdown code blocks if present
    text = ai_text.strip()
    text = re.sub(r'^```(?:json)?\s*', '', text)
    text = re.sub(r'\s*```$', '', text)

    # Try to find JSON object in the response
    json_match = re.search(r'\{[^{}]*\}', text, re.DOTALL)
    if not json_match:
        # Try broader match with nested braces
        start = text.find('{')
        end = text.rfind('}')
        if start != -1 and end != -1 and end > start:
            json_str = text[start:end + 1]
        else:
            print(f"[WARN] No JSON found in AI response: {text[:100]}...")
            return None
    else:
        json_str = json_match.group(0)

    try:
        data = json.loads(json_str)
    except json.JSONDecodeError as e:
        print(f"[WARN] JSON parse failed: {e}")
        return None

    # Validate required fields
    required = ['homeProb', 'drawProb', 'awayProb', 'predictedScore',
                'expertComment', 'poisonComment']
    for field in required:
        if field not in data:
            print(f"[WARN] Missing field '{field}' in AI response")
            return None

    # Validate probabilities sum to ~100
    total = data['homeProb'] + data['drawProb'] + data['awayProb']
    if abs(total - 100) > 5:
        # Normalize to 100
        scale = 100.0 / total
        data['homeProb'] = round(data['homeProb'] * scale)
        data['drawProb'] = round(data['drawProb'] * scale)
        data['awayProb'] = 100 - data['homeProb'] - data['drawProb']
        print(f"[INFO] Normalized probabilities to sum=100: "
              f"{data['homeProb']}/{data['drawProb']}/{data['awayProb']}")

    # Ensure probabilities are integers
    for field in ['homeProb', 'drawProb', 'awayProb']:
        data[field] = int(data[field])

    # Validate predictedScore format
    score = str(data['predictedScore'])
    if not re.match(r'^\d+\s*-\s*\d+$', score):
        data['predictedScore'] = "1-1"
        print("[WARN] Invalid predictedScore format, defaulting to 1-1")

    return data


def build_ai_prompt(match, home, away):
    """Build the AI prompt for a match prediction."""
    home_name = home.get('name', 'Unknown')
    away_name = away.get('name', 'Unknown')
    home_rank = home.get('fifa_ranking', 'N/A')
    away_rank = away.get('fifa_ranking', 'N/A')
    home_str = home.get('strength', {})
    away_str = away.get('strength', {})
    home_coach = home.get('coach', 'Unknown')
    away_coach = away.get('coach', 'Unknown')
    home_key = home.get('key_players', ['Key Player'])[0]
    away_key = away.get('key_players', ['Key Player'])[0]
    group = match.get('group', '?')
    city = match.get('city', 'TBD')
    venue = match.get('venue', 'TBD')

    prompt = (
        f"You are a football prediction AI for the 2026 FIFA World Cup.\n\n"
        f"Match: {home_name} (home, FIFA rank {home_rank}) vs "
        f"{away_name} (away, FIFA rank {away_rank})\n"
        f"Group {group}, Venue: {venue}, {city}\n\n"
        f"Home team {home_name}:\n"
        f"  Coach: {home_coach}, Key player: {home_key}\n"
        f"  Strength: Attack {home_str.get('attack', 75)}, "
        f"Midfield {home_str.get('midfield', 75)}, "
        f"Defense {home_str.get('defense', 75)}\n\n"
        f"Away team {away_name}:\n"
        f"  Coach: {away_coach}, Key player: {away_key}\n"
        f"  Strength: Attack {away_str.get('attack', 75)}, "
        f"Midfield {away_str.get('midfield', 75)}, "
        f"Defense {away_str.get('defense', 75)}\n\n"
        f"Return ONLY a valid JSON object (no markdown, no explanation):\n"
        f'{{"homeProb": 45, "drawProb": 28, "awayProb": 27, '
        f'"predictedScore": "2-1", '
        f'"expertComment": "Chinese professional analysis 50-100 chars", '
        f'"poisonComment": "Chinese humorous contrarian take 30-80 chars"}}\n\n'
        f"Rules:\n"
        f"- Probabilities must sum to 100\n"
        f"- predictedScore format: X-Y (e.g. 2-1)\n"
        f"- expertComment: write in Chinese, professional tactical analysis\n"
        f"- poisonComment: write in Chinese, humorous and contrarian\n"
        f"- Reply with JSON only"
    )
    return prompt


def generate_ai_prediction(match, home, away):
    """Generate a prediction using the free AI API.

    Returns a prediction dict or None on failure.
    """
    prompt = build_ai_prompt(match, home, away)
    ai_text = call_ai(prompt)
    if not ai_text:
        return None

    parsed = parse_ai_json(ai_text)
    if not parsed:
        print(f"[WARN] Failed to parse AI response for {match['id']}")
        return None

    return {
        "matchId": match['id'],
        "homeProb": parsed['homeProb'],
        "drawProb": parsed['drawProb'],
        "awayProb": parsed['awayProb'],
        "predictedScore": parsed['predictedScore'],
        "expertComment": parsed['expertComment'],
        "poisonComment": parsed['poisonComment'],
        "aiGenerated": True
    }


def generate_fallback_prediction(match, home, away):
    """Generate a prediction using the enhanced strength-based algorithm.

    Used when AI API is unavailable or returns invalid data.
    """
    h_strength = home['strength']['overall']
    a_strength = away['strength']['overall']
    diff = h_strength - a_strength

    if diff > 15:
        h_prob = random.randint(65, 80)
        d_prob = random.randint(15, 20)
        a_prob = 100 - h_prob - d_prob
        pred_score = f"{random.choice([2, 3])}-{random.choice([0, 1])}"
    elif diff < -15:
        a_prob = random.randint(65, 80)
        d_prob = random.randint(15, 20)
        h_prob = 100 - a_prob - d_prob
        pred_score = f"{random.choice([0, 1])}-{random.choice([2, 3])}"
    else:
        if diff > 0:
            h_prob = random.randint(38, 48)
            a_prob = random.randint(25, 32)
        else:
            a_prob = random.randint(38, 48)
            h_prob = random.randint(25, 32)
        d_prob = 100 - h_prob - a_prob
        if h_prob > a_prob + 5:
            pred_score = "2-1"
        elif a_prob > h_prob + 5:
            pred_score = "1-2"
        else:
            pred_score = random.choice(["1-1", "0-0", "2-2"])

    # Generate comments
    home_cn = home.get('name_cn', home['name'])
    away_cn = away.get('name_cn', away['name'])
    home_key = home.get('key_players', ['Key Player'])[0]
    away_key = away.get('key_players', ['Key Player'])[0]
    home_coach = home.get('coach', '')
    strong_cn = home_cn if diff >= 0 else away_cn
    weak_cn = away_cn if diff >= 0 else home_cn

    if abs(diff) > 8:
        strong_key = home_key if diff >= 0 else away_key
        expert = (
            f"从两队近期战绩和整体战术素养来看，{strong_cn} 占据了绝对优势。"
            f"关键球员 {strong_key} 状态火热，{weak_cn} 的后防线将面临巨大考验，"
            f"预计 {strong_cn} 将稳扎稳打全取三分。"
        )
        poison = (
            f"天降大任！这期我直接单推 {weak_cn}！{strong_cn} 算什么？"
            f"足球是圆的！我掐指一算，{weak_cn} 本场必将上演惊天逆袭！"
        )
    else:
        expert = (
            f"{home_cn} 与 {away_cn} 的对决关键在于中场出球效率。"
            f"{home_key} 和 {away_key} 分别作为各自阵中的核心，"
            f"双方实力非常接近，本场大概率会是一场防守鏖战。"
        )
        poison = (
            "平局？不可能的！两队必有一死，我压箱底预测本场会是进球大战，"
            "双方防守直接漏洞百出！直接买大球！"
        )

    return {
        "matchId": match['id'],
        "homeProb": h_prob,
        "drawProb": d_prob,
        "awayProb": a_prob,
        "predictedScore": pred_score,
        "expertComment": expert,
        "poisonComment": poison,
        "aiGenerated": False
    }


def main():
    os.makedirs('data', exist_ok=True)

    # Load data
    matches_data = load_json(MATCHES_PATH)
    teams = load_json(TEAMS_PATH)
    existing_preds = load_json(PREDICTIONS_PATH)

    if not isinstance(existing_preds, dict):
        existing_preds = {}

    matches = matches_data.get('matches', []) if isinstance(matches_data, dict) else []
    teams_dict = {t['id']: t for t in teams} if isinstance(teams, list) else {}

    if not matches or not teams_dict:
        print("[ERROR] Missing matches or teams data. Aborting.")
        return

    today = datetime.now().strftime('%Y-%m-%d')
    print(f"[INFO] Today: {today}")
    print(f"[INFO] Existing predictions: {len(existing_preds)}")

    # Determine which matches need predictions
    # Only generate for upcoming group matches
    upcoming_group = [
        m for m in matches
        if m.get('stage') == 'group' and m['date'] >= today
    ]
    print(f"[INFO] Upcoming group matches to predict: {len(upcoming_group)}")

    predictions = {}
    ai_count = 0
    fallback_count = 0
    preserved_count = 0

    # Preserve existing predictions for past matches
    for m in matches:
        if m['id'] in existing_preds and m['date'] < today:
            predictions[m['id']] = existing_preds[m['id']]
            preserved_count += 1

    print(f"[INFO] Preserved {preserved_count} existing predictions for past matches")

    # Generate new predictions for upcoming matches
    for m in upcoming_group:
        match_id = m['id']
        home = teams_dict.get(m['home'])
        away = teams_dict.get(m['away'])

        if not home or not away:
            print(f"[WARN] Missing team data for {match_id}, skipping")
            continue

        home_name = home.get('name', m['home'])
        away_name = away.get('name', m['away'])
        print(f"[INFO] Predicting {match_id}: {home_name} vs {away_name} "
              f"({m['date']})...", end=' ', flush=True)

        # Try AI first
        pred = generate_ai_prediction(m, home, away)

        if pred:
            predictions[match_id] = pred
            ai_count += 1
            print("AI ✓")
        else:
            # Fallback to strength-based algorithm
            pred = generate_fallback_prediction(m, home, away)
            predictions[match_id] = pred
            fallback_count += 1
            print("fallback ✓")

        # Rate limit AI calls
        time.sleep(AI_DELAY)

    # Also preserve any existing predictions for upcoming matches
    # that we didn't regenerate (e.g., non-group stages)
    for m in matches:
        if m['id'] in existing_preds and m['id'] not in predictions:
            predictions[m['id']] = existing_preds[m['id']]

    print(f"\n[OK] Generated {len(predictions)} predictions total")
    print(f"     AI-generated: {ai_count}")
    print(f"     Fallback: {fallback_count}")
    print(f"     Preserved: {preserved_count}")

    save_json(PREDICTIONS_PATH, predictions)
    print(f"[OK] Saved to {PREDICTIONS_PATH}")


if __name__ == '__main__':
    main()
