import json
import random
import os

# Ensure directories exist
os.makedirs('data', exist_ok=True)

def generate():
    # Load matches and teams
    with open('data/matches.json', 'r', encoding='utf-8') as f:
        matches_data = json.load(f)
    
    with open('data/teams.json', 'r', encoding='utf-8') as f:
        teams = json.load(f)
        
    teams_dict = {t['id']: t for t in teams}
    predictions = {}
    
    # Comments template pool
    expert_templates = [
        "从两队近期战绩和整体战术素养来看，{strong} 占据了绝对优势。{strong_coach} 的战术布置更加立体，在中场控球与边路突破上能制造更多杀机。{weak} 想要拿分必须稳固防守并寻找反击机会，但预计很难全身而退。",
        "{team1} 与 {team2} 的对决关键在于中场出球效率。{team1_key} 和 {team2_key} 分别作为各自阵中的核心，本场比赛的表现将起决定作用。双方实力非常接近，本场大概率会是一场防守鏖战，看好双方战平。",
        "考虑到本场是 {stage}，双方在战意上都毋庸置疑。{strong} 拥有更深厚的板凳深度，特别是在锋线上 {strong_key} 的状态火热。{weak} 的后防线将面临巨大考验，预计 {strong} 将稳扎稳打全取三分。"
    ]
    
    poison_templates = [
        "天降大任！这期我直接单推 {weak}！{strong} 算什么？虽然大家都看好他们，但足球是圆的！我掐指一算，{weak} 本场必将上演惊天逆袭，直接打碎所有预言家的眼镜！{strong} 必败！",
        "平局？不可能的，这辈子都别想平局！两队必有一死，我压箱底预测本场会是进球大战，双方防守直接漏洞百出！听我的，直接买大球，两边防线今天都会化身慈善家！",
        "放心吧！{strong} 这场稳如泰山！要是他们能输，我直接现场表演倒立洗头！他们闭着眼睛都能踢个 3-0，{weak} 的锋线估计连射门门框都摸不到，完全是一场毫无悬念的单方面屠杀！"
    ]
    
    for m in matches_data['matches']:
        if m['stage'] != 'group':
            continue
            
        h_id, a_id = m['home'], m['away']
        home = teams_dict.get(h_id)
        away = teams_dict.get(a_id)
        
        if not home or not away:
            continue
            
        h_strength = home['strength']['overall']
        a_strength = away['strength']['overall']
        
        # Calculate win/draw/loss probabilities based on team strengths
        diff = h_strength - a_strength
        if diff >= 0:
            strong_team = home
            weak_team = away
        else:
            strong_team = away
            weak_team = home
            
        # Base probabilities
        if diff > 15:
            # Home is much stronger
            h_prob = random.randint(65, 80)
            d_prob = random.randint(15, 20)
            a_prob = 100 - h_prob - d_prob
            pred_score = f"{random.choice([2, 3])} - {random.choice([0, 1])}"
        elif diff < -15:
            # Away is much stronger
            a_prob = random.randint(65, 80)
            d_prob = random.randint(15, 20)
            h_prob = 100 - a_prob - d_prob
            pred_score = f"{random.choice([0, 1])} - {random.choice([2, 3])}"
        else:
            # Even match
            if diff > 0:
                h_prob = random.randint(38, 48)
                a_prob = random.randint(25, 32)
            else:
                a_prob = random.randint(38, 48)
                h_prob = random.randint(25, 32)
            d_prob = 100 - h_prob - a_prob
            pred_score = f"{random.choice([1, 2])} - {random.choice([1, 2])}"
            if h_prob > a_prob + 5:
                pred_score = "2 - 1"
            elif a_prob > h_prob + 5:
                pred_score = "1 - 2"
            else:
                pred_score = random.choice(["1 - 1", "0 - 0", "2 - 2"])
                
        # Generate comments
        if abs(diff) > 8:
            strong = strong_team['name_cn']
            weak = weak_team['name_cn']
            strong_coach = strong_team['coach']
            strong_key = strong_team['key_players'][0]
            
            expert = expert_templates[0].format(strong=strong, strong_coach=strong_coach, weak=weak)
            if random.random() > 0.5:
                expert = expert_templates[2].format(strong=strong, strong_key=strong_key, weak=weak, stage="小组赛关键之战")
            
            poison = poison_templates[0].format(weak=weak, strong=strong)
            if random.random() > 0.5:
                poison = poison_templates[2].format(strong=strong, weak=weak)
        else:
            expert = expert_templates[1].format(
                team1=home['name_cn'], team2=away['name_cn'], 
                team1_key=home['key_players'][0], team2_key=away['key_players'][0]
            )
            poison = poison_templates[1]
            
        predictions[m['id']] = {
            "matchId": m['id'],
            "homeProb": h_prob,
            "drawProb": d_prob,
            "awayProb": a_prob,
            "predictedScore": pred_score,
            "expertComment": expert,
            "poisonComment": poison
        }
        
    with open('data/predictions.json', 'w', encoding='utf-8') as f:
        json.dump(predictions, f, ensure_ascii=False, indent=2)
    print("Successfully generated data/predictions.json!")

if __name__ == '__main__':
    generate()
