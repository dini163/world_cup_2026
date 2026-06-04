import json
import random
import os
from datetime import datetime

# Path helper
NEWS_PATH = 'data/news.json'
TEAMS_PATH = 'data/teams.json'

def load_json(path):
    if not os.path.exists(path):
        return []
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def generate_random_news():
    teams = load_json(TEAMS_PATH)
    if not teams:
        teams = [{"name": "Argentina", "name_cn": "阿根廷", "coach": "Lionel Scaloni", "key_players": ["Messi"]}]

    team = random.choice(teams)
    player = random.choice(team.get('key_players', ['Star Player']))
    coach = team.get('coach', 'Head Coach')
    team_name_cn = team.get('name_cn', team['name'])
    team_name_en = team['name']

    # Template pool
    templates = [
        {
            "type": "official",
            "source": "FIFA Press Center",
            "title": {
                "zh-CN": f"官方：FIFA确认本届世界杯将为各队提供专门的康复理疗基地",
                "en": f"Official: FIFA confirms specialized recovery centers for teams in all base camps",
                "es": f"Oficial: La FIFA confirma centros de recuperación en todos los campamentos de base",
                "fr": f"Officiel : La FIFA confirme des centres de récupération spécialisés dans tous les camps de base"
            },
            "summary": {
                "zh-CN": f"为了缓解跨国旅行带来的疲劳，国际足联宣布为所有48支参赛队伍配备独立的高科技康复中心，保障球员的身体竞技状态。",
                "en": f"To combat fatigue from long-distance flights, FIFA announced high-tech recovery centers for all 48 qualified teams to ensure player fitness.",
                "es": f"Para combatir la fatiga por vuelos largos, la FIFA anunció centros de recuperación de alta tecnología para los 48 equipos clasificados.",
                "fr": f"Pour lutter contre la fatigue liée aux vols longue distance, la FIFA a annoncé des centres de récupération de haute technologie pour les 48 équipes."
            }
        },
        {
            "type": "gossip",
            "source": "World Football Insider",
            "title": {
                "zh-CN": f"传闻：豪门星探云集！{team_name_cn}锋线新星被多家俱乐部密切关注",
                "en": f"Rumor: Scouts Swarm! {team_name_en} young forward tracked by top European clubs",
                "es": f"Rumor: ¡Cazatalentos al acecho! El joven delantero de {team_name_en} seguido por grandes clubes",
                "fr": f"Rumeur : Les recruteurs s'activent ! Le jeune attaquant de l'équipe d' {team_name_en} suivi par les grands clubs"
            },
            "summary": {
                "zh-CN": f"据知情人士透露，来自英超和西甲的六家豪门俱乐部已经派遣球探前往{team_name_cn}的集训大本营，意图抢先签下这位潜力无限的年轻锋线小将。",
                "en": f"According to insiders, scouts from six major Premier League and La Liga clubs have arrived at {team_name_en}'s base camp to monitor the promising youngster.",
                "es": f"Según informes, cazatalentos de seis clubes de la Premier League y La Liga han llegado al campamento de {team_name_en} para seguir al joven talento.",
                "fr": f"Selon des indiscrétions, des recruteurs de six clubs de Premier League et de La Liga sont arrivés au camp de l'équipe d' {team_name_en} pour suivre le jeune joueur."
            }
        },
        {
            "type": "official",
            "source": "Local Organizing Committee",
            "title": {
                "zh-CN": f"世界杯公共交通指南发布：持球票可免费乘坐地铁轻轨",
                "en": f"World Cup Travel Guide: Free public transport for match ticket holders",
                "es": f"Guía del Mundial: Transporte público gratuito para poseedores de entradas",
                "fr": f"Guide de Voyage : Transports publics gratuits pour les détenteurs de billets de match"
            },
            "summary": {
                "zh-CN": f"联合组委会正式宣布，世界杯期间所有主办城市将开辟绿色通道。球迷凭比赛日门票和电子球迷卡可免费使用当地地铁、公交和城铁服务。",
                "en": f"The joint committee announced that fans with a valid matchday ticket and digital Fan ID can ride subways, light rails, and buses for free during the tournament.",
                "es": f"El comité organizador anunció transporte gratuito en metro y autobuses para aficionados con entrada válida el día del partido.",
                "fr": f"Le comité d'organisation a annoncé la gratuité des métros et bus pour les supporters munis d'un billet de match valide."
            }
        },
        {
            "type": "gossip",
            "source": "Social Media Leak",
            "title": {
                "zh-CN": f"更衣室趣闻：{team_name_cn}主帅{coach}在生日宴会上为全队大秀热舞",
                "en": f"Locker Room Fun: {team_name_en} head coach {coach} dances for the team on birthday party",
                "es": f"Diversión en Vestuario: El técnico de {team_name_en}, {coach}, baila ante su equipo por su cumpleaños",
                "fr": f"Vestiaire Insolite : Le sélectionneur d' {team_name_en}, {coach}, danse pour l'équipe pour son anniversaire"
            },
            "summary": {
                "zh-CN": f"有球员在社交平台发布了一段更衣室短视频，镜头中一向严厉的{coach}带头跳起了动感舞蹈，全队笑成一片，展现出极佳的备战氛围。",
                "en": f"A short video leaked from the locker room showing the strict manager {coach} showing off dance moves during a team dinner, reflecting excellent team chemistry.",
                "es": f"Un video filtrado muestra al estricto entrenador {coach} mostrando pasos de baile durante la cena, reflejando un ambiente de armonía.",
                "fr": f"Une courte vidéo montre l'entraîneur strict {coach} exécutant des pas de danse lors du dîner, reflétant la bonne humeur du groupe."
            }
        },
        {
            "type": "gossip",
            "source": "Locker Room Gossip",
            "title": {
                "zh-CN": f"爆料：{team_name_cn}核心{player}在训练中完成半场吊门，惊呆队友",
                "en": f"Tip: {team_name_en} star {player} scores half-field lob in training, teammates stunned",
                "es": f"Cotilleo: La estrella de {team_name_en}, {player}, anota gol desde media cancha en práctica",
                "fr": f"Info : La star d' {team_name_en}, {player}, marque un lob de 50 mètres à l'entraînement"
            },
            "summary": {
                "zh-CN": f"在今早的战术演练中，{player}在己方半场突然起脚，皮球划出美妙弧线直接飞进球门死角。门将直接高举双手表示无奈，现场响起一阵掌声。",
                "en": f"During tactical drills this morning, {player} spotted the goalkeeper off his line and lobbed the ball from his own half into the top corner, prompting cheers.",
                "es": f"En la práctica de esta mañana, {player} vio al portero adelantado y anotó desde media cancha, asombrando a todos sus compañeros.",
                "fr": f"À la séance de ce matin, {player} a vu le gardien avancé et a marqué du milieu de terrain, émerveillant ses partenaires."
            }
        }
    ]

    selected = random.choice(templates)
    news_id = f"N_LIVE_{random.randint(1000, 9999)}"
    
    return {
        "id": news_id,
        "type": selected["type"],
        "date": datetime.now().strftime("%Y-%m-%d"),
        "likes": random.randint(50, 450),
        "title": selected["title"],
        "summary": selected["summary"],
        "source": selected["source"]
    }

def main():
    os.makedirs('data', exist_ok=True)
    news = load_json(NEWS_PATH)
    
    new_item = generate_random_news()
    news.insert(0, new_item)  # Prepend new item
    
    # Cap total news at 15 to prevent file size bloat
    if len(news) > 15:
        news = news[:15]
        
    save_json(NEWS_PATH, news)
    print(f"Successfully generated new article '{new_item['title']['en']}' and appended to data/news.json!")

if __name__ == '__main__':
    main()
