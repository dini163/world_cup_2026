#!/usr/bin/env python3
import json
import os
import random
from datetime import datetime, time

MATCHES_PATH = 'data/matches.json'
TEAMS_PATH = 'data/teams.json'

def load_json(path):
    if not os.path.exists(path):
        return None
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def simulate_match_score(home_strength, away_strength):
    diff = home_strength - away_strength
    
    # Base probability model
    if diff > 15:
        # Home team is significantly stronger
        home_score = random.randint(2, 4)
        away_score = random.randint(0, 1)
    elif diff < -15:
        # Away team is significantly stronger
        home_score = random.randint(0, 1)
        away_score = random.randint(2, 4)
    else:
        # Close strength match
        coin = random.random()
        if coin < 0.30:
            # Draw
            home_score = random.randint(0, 2)
            away_score = home_score
        elif coin < 0.65:
            # Home win
            away_score = random.randint(0, 1)
            home_score = away_score + random.randint(1, 2)
        else:
            # Away win
            home_score = random.randint(0, 1)
            away_score = home_score + random.randint(1, 2)
            
    return home_score, away_score

def update_matches(target_date_str=None):
    if target_date_str is None:
        # Default to simulated current local date
        target_date_str = '2026-06-24'
    
    # Parse simulated target datetime
    # At 19:00:24
    target_date = datetime.strptime(target_date_str, "%Y-%m-%d").date()
    target_time = time(19, 0, 0)
    
    matches_data = load_json(MATCHES_PATH)
    teams_data = load_json(TEAMS_PATH)
    
    if not matches_data or not teams_data:
        print("❌ Error: matches.json or teams.json not found")
        return
        
    teams_dict = {t['id']: t for t in teams_data}
    updated_count = 0
    
    for m in matches_data['matches']:
        m_date = datetime.strptime(m['date'], "%Y-%m-%d").date()
        m_time = datetime.strptime(m['time'], "%H:%M").time()
        
        # Check if match is in the past or currently playing relative to target date and time
        is_past = False
        is_live = False
        
        if m_date < target_date:
            is_past = True
        elif m_date == target_date:
            # On target date, check if time has passed
            # A match takes approx 2 hours (120 minutes)
            m_dt = datetime.combine(m_date, m_time)
            target_dt = datetime.combine(target_date, target_time)
            time_diff = (target_dt - m_dt).total_seconds() / 60.0
            
            if time_diff >= 120:
                is_past = True
            elif 0 <= time_diff < 120:
                is_live = True
                
        # Update match details
        if is_past:
            m['status'] = 'finished'
            # Only generate score if it hasn't been set yet
            if m['home_score'] is None or m['away_score'] is None:
                home = teams_dict.get(m['home'])
                away = teams_dict.get(m['away'])
                hs = home['strength']['overall'] if home else 70
                as_str = away['strength']['overall'] if away else 70
                
                h_score, a_score = simulate_match_score(hs, as_str)
                m['home_score'] = h_score
                m['away_score'] = a_score
                updated_count += 1
        elif is_live:
            m['status'] = 'live'
            # Simulate a live score in progress
            if m['home_score'] is None or m['away_score'] is None:
                home = teams_dict.get(m['home'])
                away = teams_dict.get(m['away'])
                hs = home['strength']['overall'] if home else 70
                as_str = away['strength']['overall'] if away else 70
                
                # In progress, usually lower scores
                h_score = random.randint(0, 1)
                a_score = random.randint(0, 1)
                m['home_score'] = h_score
                m['away_score'] = a_score
                updated_count += 1
        else:
            # Future matches (keep upcoming, scores null unless user simulated in localstorage)
            m['status'] = 'upcoming'
            m['home_score'] = None
            m['away_score'] = None
            m['events'] = []
            
    save_json(MATCHES_PATH, matches_data)
    print(f"✅ Successfully updated matches.json. Simulated scores for {updated_count} matches.")

if __name__ == '__main__':
    # We can fetch date dynamically or use June 24, 2026
    # Let's check current system date, if it is 2026, we can use it,
    # otherwise we use 2026-06-24 as the default simulated tournament date.
    now = datetime.now()
    if now.year == 2026:
        current_date = now.strftime("%Y-%m-%d")
        print(f"System year is 2026, using system date: {current_date}")
        update_matches(current_date)
    else:
        # Simulation mode: World Cup is happening in 2026, today is 2026-06-24
        print("Using simulated date: 2026-06-24")
        update_matches('2026-06-24')
