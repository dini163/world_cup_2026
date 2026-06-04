import json

with open('data/teams.json', 'r', encoding='utf-8') as f:
    teams = json.load(f)

print(f"{'ID':<6} {'Team':<30} {'Squad':>5}")
print("-" * 50)
total_short = 0
for t in teams:
    count = len(t.get('squad', []))
    flag = " *** NEEDS MORE" if count < 23 else ""
    name = t.get('name', '?')
    print(f"{t['id']:<6} {name:<30} {count:>5}{flag}")
    if count < 23:
        total_short += 1

print(f"\nTotal teams: {len(teams)}")
print(f"Teams with < 23 players: {total_short}")
print(f"Teams with < 11 players: {sum(1 for t in teams if len(t.get('squad',[])) < 11)}")
