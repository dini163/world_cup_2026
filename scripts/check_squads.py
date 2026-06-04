import json

with open('data/teams.json', 'r', encoding='utf-8') as f:
    teams = json.load(f)

# Check France
fra = [t for t in teams if t['id'] == 'FRA'][0]
print(f"France squad: {len(fra['squad'])} players")
for p in fra['squad']:
    print(f"  {p['name']} ({p['pos']}) - {p['club']}")

print()
# Check a smaller team like Mexico
mex = [t for t in teams if t['id'] == 'MEX'][0]
print(f"Mexico squad: {len(mex['squad'])} players")
for p in mex['squad']:
    print(f"  {p['name']} ({p['pos']}) - {p['club']}")
