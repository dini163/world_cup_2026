import json
import os
import random

TEAMS_PATH = 'data/teams.json'

existing_players_cn = {
    # MEX
    "Guillermo Ochoa": "吉列尔莫·奥乔亚", "Edson Álvarez": "埃德森·阿尔瓦雷斯", "Santiago Giménez": "圣地亚哥·希门尼斯",
    "Hirving Lozano": "伊尔文·洛萨诺", "César Montes": "塞萨尔·蒙特斯", "Luis Romo": "路易斯·罗莫",
    # RSA
    "Ronwen Williams": "罗恩温·威廉姆斯", "Percy Tau": "珀西·陶", "Themba Zwane": "滕巴·茨瓦内", "Mothobi Mvala": "莫托比·姆瓦拉",
    # KOR
    "Son Heung-min": "孙兴慜", "Kim Min-jae": "金玟哉", "Lee Kang-in": "李刚仁", "Hwang Hee-chan": "黄喜灿",
    # CZE
    "Patrik Schick": "帕特里克·希克", "Tomáš Souček": "托马斯·绍切克", "Vladimír Coufal": "弗拉基米尔·曹法尔",
    # CAN
    "Alphonso Davies": "阿方索·戴维斯", "Jonathan David": "乔纳森·戴维", "Cyle Larin": "塞林·拉林",
    # BIH
    "Edin Džeko": "埃丁·哲科", "Miralem Pjanić": "米拉莱姆·皮亚尼奇", "Ermedin Demirović": "埃尔梅丁·德米罗维奇",
    # QAT
    "Akram Afif": "阿克拉姆·阿菲夫", "Almoez Ali": "阿尔莫伊兹·阿里", "Hassan Al-Haydos": "哈桑·海多斯",
    # SUI
    "Granit Xhaka": "格拉尼特·扎卡", "Manuel Akanji": "曼努埃尔·阿坎吉", "Xherdan Shaqiri": "谢尔丹·沙奇里",
    # BRA
    "Vinícius Jr": "维尼修斯", "Rodrygo": "罗德里戈", "Éder Militão": "埃德尔·米利唐", "Alisson": "阿利森", "Bruno Guimarães": "布鲁诺·吉马良斯", "Raphinha": "拉菲尼亚",
    # MAR
    "Achraf Hakimi": "阿什拉夫·哈基米", "Hakim Ziyech": "哈基姆·齐耶赫", "Youssef En-Nesyri": "优素福·恩-内斯里",
    # HAI
    "Frantzdy Pierrot": "弗兰茨迪·皮埃罗", "Derrick Etienne Jr": "德里克·埃蒂安",
    # SCO
    "Andy Robertson": "安迪·罗伯逊", "John McGinn": "约翰·麦金", "Scott McTominay": "斯科特·麦克托米奈",
    # USA
    "Christian Pulisic": "克里斯蒂安·普利西奇", "Weston McKennie": "温斯顿·麦肯尼", "Yunus Musah": "尤纳斯·穆萨", "Tyler Adams": "泰勒·亚当斯", "Gio Reyna": "吉奥·雷纳",
    # PAR
    "Miguel Almirón": "米格尔·阿尔米隆", "Julio Enciso": "胡利奥·恩西索", "Gustavo Gómez": "古斯塔沃·戈麦斯",
    # AUS
    "Mathew Leckie": "马修·莱基", "Jackson Irvine": "杰克逊·欧文", "Harry Souttar": "哈里·苏塔尔",
    # TUR
    "Hakan Çalhanoğlu": "哈坎·恰尔汗奥卢", "Arda Güler": "阿尔达·居勒尔", "Kenan Yıld兹": "凯南·伊尔迪兹", "Kenan Yıldız": "凯南·伊尔迪兹",
    # GER
    "Jamal Musiala": "贾马尔·穆西亚拉", "Florian Wirtz": "弗洛里安·维尔茨", "Kai Havertz": "凯·哈弗茨", "Antonio Rüdiger": "安东尼奥·吕迪格",
    # CUW
    "Cuco Martina": "库科·马蒂纳", "Juninho Bacuna": "朱尼尼奥·巴库纳", "Rangelo Janga": "兰杰洛·扬加",
    # CIV
    "Sébastien Haller": "塞巴斯蒂安·阿莱", "Franck Kessié": "弗兰克·凯西", "Simon Adingra": "西蒙·阿丁格拉",
    # ECU
    "Moisés Caicedo": "莫伊塞斯·凯塞多", "Piero Hincapié": "皮耶罗·因卡皮耶", "Enner Valencia": "恩纳·瓦伦西亚",
    # NED
    "Virgil van Dijk": "维吉尔·范戴克", "Cody Gakpo": "科迪·加克波", "Frenkie de Jong": "弗伦基·德容", "Xavi Simons": "哈维·西蒙斯",
    # JPN
    "Takefusa Kubo": "久保建英", "Kaoru Mitoma": "三笘薰", "Wataru Endo": "远藤航",
    # SWE
    "Alexander Isak": "亚历山大·伊萨克", "Dejan Kulusevski": "德扬·库卢塞夫斯基", "Viktor Gyökeres": "维克托·约克雷斯",
    # TUN
    "Hannibal Mejbri": "汉尼拔·梅布里", "Youssef Msakni": "尤塞夫·姆萨克尼", "Aïssa Laïdouni": "艾萨·莱杜尼",
    # BEL
    "Kevin De Bruyne": "凯文·德布劳内", "Jérémy Doku": "杰里米·多库", "Romelu Lukaku": "罗梅卢·卢卡库",
    # EGY
    "Mohamed Salah": "穆罕默德·萨拉赫", "Omar Marmoush": "奥马尔·马尔穆什", "Mohamed Elneny": "穆罕默德·埃尔内尼",
    # IRN
    "Mehdi Taremi": "梅赫迪·塔雷米", "Sardar Azmoun": "萨达尔·阿兹蒙", "Alireza Jahanbakhsh": "阿里雷扎·贾汉巴赫什",
    # NZL
    "Chris Wood": "克里斯·伍德", "Liberato Cacace": "利伯拉托·卡卡切", "Sarpreet Singh": "萨普里特·辛格",
    # ESP
    "Lamine Yamal": "拉明·雅马尔", "Pedri": "佩德里", "Rodri": "罗德里", "Dani Carvajal": "丹尼·卡瓦哈尔", "Nico Williams": "尼科·威廉姆斯",
    # CPV
    "Garry Rodrigues": "加里·罗德里格斯", "Ryan Mendes": "莱恩·门德斯", "Stopira": "斯托皮拉",
    # KSA
    "Salem Al-Dawsari": "萨利姆·多萨里", "Salman Al-Faraj": "萨勒曼·法拉杰", "Mohammed Al-Owais": "穆罕默德·奥维斯",
    # URU
    "Federico Valverde": "费德里科·巴尔韦德", "Darwin Núñez": "达尔文·努涅斯", "Ronald Araújo": "罗纳德·阿劳霍",
    # FRA
    "Kylian Mbappé": "基利安·姆巴佩", "Antoine Griezmann": "安托万·格列兹曼", "Aurélien Tchouaméni": "奥雷利安·琼阿梅尼", "William Saliba": "威廉·萨利巴",
    # SEN
    "Sadio Mané": "萨迪奥·马内", "Ismaïla Sarr": "伊斯梅拉·萨尔", "Kalidou Koulibaly": "卡利杜·库利巴利",
    # IRQ
    "Mohanad Ali": "莫哈纳德·阿里", "Aymen Hussein": "艾曼·侯赛因", "Ibrahim Bayesh": "易卜拉欣·巴伊什",
    # NOR
    "Erling Haaland": "埃尔林·哈兰德", "Martin Ødegaard": "马丁·厄德高", "Alexander Sørloth": "亚历山大·瑟洛特",
    # ARG
    "Lionel Messi": "里奥·梅西", "Julián Álvarez": "胡利安·阿尔瓦雷斯", "Enzo Fernández": "恩佐·费尔南德斯", "Lisandro Martínez": "利桑德罗·马丁内斯",
    # ALG
    "Riyad Mahrez": "里亚德·马赫雷斯", "Ismaël Bennacer": "伊斯梅尔·本纳塞尔", "Yacine Brahimi": "雅辛·布拉希米",
    # AUT
    "David Alaba": "大卫·阿拉巴", "Marcel Sabitzer": "马塞尔·萨比策", "Marko Arnautović": "马尔科·阿瑙托维奇",
    # JOR
    "Mousa Al-Taamari": "穆萨·塔马里", "Yazan Al-Naimat": "亚赞·奈马特", "Anas Bani Yaseen": "阿纳斯·巴尼·亚辛",
    # POR
    "Cristiano Ronaldo": "克里斯蒂亚诺·罗纳尔多", "Bruno Fernandes": "布鲁诺·费尔南德斯", "Bernardo Silva": "贝尔纳多·席尔瓦", "Rafael Leão": "拉斐尔·莱奥",
    # COD
    "Cédric Bakambu": "塞德里克·巴坎布", "Chancel Mbemba": "钱塞尔·姆本巴", "Yoane Wissa": "约安·维萨",
    # UZB
    "Eldor Shomurodov": "埃尔多尔·肖穆罗多夫", "Jaloliddin Masharipov": "贾洛利丁·马沙里波夫", "Abdukodir Khusanov": "阿卜杜科迪尔·胡萨诺夫",
    # COL
    "Luis Díaz": "路易斯·迪亚斯", "James Rodríguez": "哈梅斯·罗德里格斯", "Jhon Arias": "约翰·阿里亚斯",
    # ENG
    "Jude Bellingham": "朱德·贝林厄姆", "Bukayo Saka": "布卡约·萨卡", "Phil Foden": "菲尔·福登", "Harry Kane": "哈里·凯恩", "Declan Rice": "赖斯", "Declan Rice": "德克兰·赖斯",
    # CRO
    "Luka Modrić": "卢卡·莫德里奇", "Mateo Kovačić": "马特奥·科瓦契奇", "Joško Gvardiol": "约什科·格瓦迪奥尔",
    # GHA
    "Mohammed Kudus": "穆罕默德·库杜斯", "Thomas Partey": "托马斯·帕尔特伊", "Jordan Ayew": "乔丹·阿尤",
    # PAN
    "José Luis Rodríguez": "何塞·路易斯·罗德里格斯", "Édgar Bárcenas": "埃德加·巴尔塞纳斯", "Andrés Andrade": "安德烈斯·安德拉德"
}

# Cultural name pools for generation
names_pool = {
    "anglo": {
        "first": ["John", "Robert", "William", "David", "James", "Michael", "Thomas", "Chris", "Marcus", "Harry", "Jordan", "Scott", "Andy", "Matt", "Aaron", "Mason", "Declan", "Kyle", "Jude", "Phil"],
        "first_cn": ["约翰", "罗伯特", "威廉", "大卫", "詹姆斯", "迈克尔", "托马斯", "克里斯", "马库斯", "哈里", "乔丹", "斯科特", "安迪", "马特", "亚伦", "梅森", "德克兰", "凯尔", "朱德", "菲尔"],
        "last": ["Smith", "Jones", "Taylor", "Brown", "Wilson", "Johnson", "Davis", "Miller", "Walker", "Pickford", "Stones", "Robinson", "Turner", "Wood", "Carter", "Green", "White", "Harris", "Clark", "Lewis"],
        "last_cn": ["史密斯", "琼斯", "泰勒", "布朗", "威尔逊", "约翰逊", "戴维斯", "米勒", "沃克", "皮克福德", "斯通斯", "罗宾逊", "特纳", "伍德", "卡特", "格林", "怀特", "哈里斯", "克拉克", "刘易斯"]
    },
    "spanish": {
        "first": ["Carlos", "José", "Juan", "Luis", "Francisco", "Javier", "Manuel", "Santiago", "Diego", "Rafael", "Miguel", "Pedro", "Rodrigo", "Álvaro", "Nico", "Federico", "Darwin", "Andrés", "Sebastián", "Mateo"],
        "first_cn": ["卡洛斯", "胡塞", "胡安", "路易斯", "弗朗西斯科", "哈维尔", "曼努埃尔", "桑蒂亚戈", "迭戈", "拉斐尔", "米格尔", "佩德罗", "罗德里戈", "阿尔瓦罗", "尼科", "费德里科", "达尔文", "安德烈斯", "塞巴斯蒂安", "马特奥"],
        "last": ["Rodríguez", "González", "Gómez", "Fernández", "Álvarez", "Giménez", "Lozano", "Montes", "Romo", "Valverde", "Núñez", "Araújo", "Díaz", "Muñoz", "Lerma", "Carvajal", "Sánchez", "Torres", "Pérez", "Castillo"],
        "last_cn": ["罗德里格斯", "冈萨雷斯", "戈麦斯", "费尔南德斯", "阿尔瓦雷斯", "希门尼斯", "洛萨诺", "蒙特斯", "罗莫", "巴尔韦德", "努涅斯", "阿劳霍", "迪亚斯", "穆尼奥斯", "莱尔马", "卡瓦哈尔", "桑切斯", "托雷斯", "佩雷斯", "卡斯蒂略"]
    },
    "portuguese": {
        "first": ["João", "Pedro", "Bruno", "Diogo", "Cristiano", "Rafael", "Bernardo", "Vinícius", "Rodrygo", "Éder", "Alisson", "Raphinha", "Gabriel", "Lucas", "Matheus", "Francisco", "Gonçalo", "Vitinha", "Rui", "Nuno"],
        "first_cn": ["若昂", "佩德罗", "布诺", "迪奥戈", "克里斯蒂亚诺", "拉斐尔", "贝尔纳多", "维尼修斯", "罗德里戈", "埃德尔", "阿利森", "拉菲尼亚", "加布里埃尔", "卢卡斯", "马修斯", "弗朗西斯科", "贡萨洛", "维蒂尼亚", "鲁伊", "努诺"],
        "last": ["Silva", "Santos", "Ferreira", "Pereira", "Oliveira", "Costa", "Rodrigues", "Fernandes", "Dias", "Cancelo", "Félix", "Neves", "Militão", "Guimarães", "Neto", "Ramos", "Lopes", "Gomes", "Sousa", "Carvalho"],
        "last_cn": ["席尔瓦", "桑托斯", "费雷拉", "佩雷拉", "奥利维拉", "科斯塔", "罗德里格斯", "费尔南德斯", "迪亚斯", "坎塞洛", "菲利克斯", "内维斯", "米利唐", "吉马良斯", "内托", "拉莫斯", "洛佩斯", "戈麦斯", "索萨", "卡瓦略"]
    },
    "french": {
        "first": ["Kylian", "Antoine", "Aurélien", "William", "Ousmane", "Mike", "Theo", "Jules", "Eduardo", "Sadio", "Ismaïla", "Kalidou", "Sébastien", "Franck", "Simon", "Cédric", "Chancel", "Yoane", "Nicolas", "Olivier"],
        "first_cn": ["基利安", "安托万", "奥雷利安", "威廉", "奥斯曼", "迈克", "特奥", "朱尔斯", "爱德华多", "萨迪奥", "伊斯梅拉", "卡利杜", "塞巴斯蒂安", "弗兰克", "西蒙", "塞德里克", "钱塞尔", "约安", "尼古拉斯", "奥利维耶"],
        "last": ["Mbappé", "Griezmann", "Tchouaméni", "Saliba", "Dembélé", "Maignan", "Hernández", "Koundé", "Camavinga", "Mané", "Sarr", "Koulibaly", "Haller", "Kessié", "Adingra", "Bakambu", "Mbemba", "Wissa", "Pépé", "Giroud"],
        "last_cn": ["姆巴佩", "格列兹曼", "琼阿梅尼", "萨利巴", "登贝莱", "迈尼昂", "埃尔战德斯", "孔德", "卡马文加", "马内", "萨尔", "库利巴利", "阿莱", "凯西", "阿丁格拉", "巴坎布", "姆本巴", "维萨", "佩佩", "吉鲁"]
    },
    "arabic": {
        "first": ["Mohamed", "Akram", "Almoez", "Hassan", "Omar", "Salem", "Salman", "Aymen", "Ibrahim", "Mohanad", "Mousa", "Yazan", "Ali", "Ahmad", "Mahmoud", "Tariq", "Saad", "Youssef", "Firas", "Riyad"],
        "first_cn": ["穆罕默德", "阿克拉姆", "阿尔莫伊兹", "哈桑", "奥马尔", "萨利姆", "萨勒曼", "艾曼", "易卜拉欣", "莫哈纳德", "穆萨", "亚赞", "阿里", "艾哈迈德", "马哈茂德", "塔里克", "萨阿德", "尤塞夫", "菲拉斯", "里亚德"],
        "last": ["Salah", "Afif", "Ali", "Al-Haydos", "Marmoush", "Elneny", "Al-Dawsari", "Al-Faraj", "Hussein", "Bayesh", "Al-Taamari", "Al-Naimat", "Owais", "Hassan", "Saeed", "Mahrez", "Bennacer", "Brahimi", "Msakni", "Laïdouni"],
        "last_cn": ["萨拉赫", "阿菲夫", "阿里", "海多斯", "马尔穆什", "埃尔内尼", "多萨里", "法拉杰", "侯赛因", "巴伊什", "塔马里", "奈马特", "奥维斯", "哈桑", "赛义德", "马赫雷斯", "本纳塞尔", "布拉希米", "姆萨克尼", "莱杜尼"]
    },
    "germanic": {
        "first": ["Jamal", "Florian", "Kai", "Antonio", "David", "Marcel", "Marko", "Granit", "Manuel", "Xherdan", "Erling", "Martin", "Alexander", "Viktor", "Dejan", "Patrik", "Tomáš", "Edin", "Joshua", "Leroy"],
        "first_cn": ["贾马尔", "弗洛里安", "凯", "安东尼奥", "大卫", "马塞尔", "马尔科", "格拉尼特", "曼努埃尔", "谢尔丹", "埃尔林", "马丁", "亚历山大", "维克托", "德扬", "帕特里克", "托马斯", "埃丁", "约书亚", "勒鲁瓦"],
        "last": ["Musiala", "Wirtz", "Havertz", "Rüdiger", "Alaba", "Sabitzer", "Arnautović", "Xhaka", "Akanji", "Shaqiri", "Haaland", "Ødegaard", "Isak", "Kulusevski", "Gyökeres", "Schick", "Souček", "Džeko", "Kimmich", "Sané"],
        "last_cn": ["穆西亚拉", "维尔茨", "哈弗茨", "吕迪格", "阿拉巴", "萨比策", "阿瑙托维奇", "扎卡", "阿坎吉", "沙奇里", "哈兰德", "厄德高", "伊萨克", "库卢塞夫斯基", "约克雷斯", "希克", "绍切克", "哲科", "基米希", "萨内"]
    },
    "asian": {
        "first": ["Heung-min", "Min-jae", "Kang-in", "Hee-chan", "Takefusa", "Kaoru", "Wataru", "Takehiro", "Hiroki", "Eldor", "Abdukodir", "Zion", "Ritsu", "Hidemasa", "Shoya", "Jaloliddin", "Mousa", "Seol", "In-beom", "Gue-sung"],
        "first_cn": ["兴慜", "玟哉", "刚仁", "喜灿", "建英", "三笘薰", "航", "健洋", "洋介", "埃尔多尔", "阿卜杜科迪尔", "彩艳", "律", "英正", "翔哉", "贾洛利丁", "穆萨", "荣宇", "仁范", "规晟"],
        "last": ["Son", "Kim", "Lee", "Hwang", "Kubo", "Mitoma", "Endo", "Tomiyasu", "Ito", "Shomurodov", "Khusanov", "Suzuki", "Doan", "Morita", "Yoshida", "Masharipov", "Al-Taamari", "Seol", "Hwang", "Cho"],
        "last_cn": ["孙", "金", "李", "黄", "久保", "三笘", "远藤", "富安", "伊藤", "肖穆罗多夫", "胡萨诺夫", "铃木", "堂安", "守田", "吉田", "马沙里波夫", "塔马里", "薛", "黄", "曹"]
    }
}

# Country to name pool mapping
team_pool_mapping = {
    # Group A
    "MEX": "spanish", "RSA": "french", "KOR": "asian", "CZE": "germanic",
    # Group B
    "CAN": "anglo", "BIH": "germanic", "QAT": "arabic", "SUI": "germanic",
    # Group C
    "BRA": "portuguese", "MAR": "arabic", "HAI": "french", "SCO": "anglo",
    # Group D
    "USA": "anglo", "PAR": "spanish", "AUS": "anglo", "TUR": "germanic",
    # Group E
    "GER": "germanic", "CUW": "anglo", "CIV": "french", "ECU": "spanish",
    # Group F
    "NED": "germanic", "JPN": "asian", "SWE": "germanic", "TUN": "arabic",
    # Group G
    "BEL": "germanic", "EGY": "arabic", "IRN": "arabic", "NZL": "anglo",
    # Group H
    "ESP": "spanish", "CPV": "portuguese", "KSA": "arabic", "URU": "spanish",
    # Group I
    "FRA": "french", "SEN": "french", "IRQ": "arabic", "NOR": "germanic",
    # Group J
    "ARG": "spanish", "ALG": "arabic", "AUT": "germanic", "JOR": "arabic",
    # Group K
    "POR": "portuguese", "COD": "french", "UZB": "asian", "COL": "spanish",
    # Group L
    "ENG": "anglo", "CRO": "germanic", "GHA": "french", "PAN": "spanish"
}

popular_clubs_by_pool = {
    "anglo": [("Liverpool", "Premier League"), ("Man City", "Premier League"), ("Arsenal", "Premier League"), ("Man United", "Premier League"), ("Chelsea", "Premier League"), ("Tottenham", "Premier League"), ("Aston Villa", "Premier League"), ("Newcastle", "Premier League")],
    "spanish": [("Real Madrid", "La Liga"), ("Barcelona", "La Liga"), ("Atlético Madrid", "La Liga"), ("Real Sociedad", "La Liga"), ("Real Betis", "La Liga"), ("Sevilla", "La Liga"), ("Villarreal", "La Liga"), ("Valencia", "La Liga")],
    "portuguese": [("Porto", "Liga Portugal"), ("Sporting CP", "Liga Portugal"), ("Benfica", "Liga Portugal"), ("Braga", "Liga Portugal"), ("Real Madrid", "La Liga"), ("PSG", "Ligue 1"), ("Man City", "Premier League"), ("Barcelona", "La Liga")],
    "french": [("PSG", "Ligue 1"), ("Marseille", "Ligue 1"), ("Monaco", "Ligue 1"), ("Lille", "Ligue 1"), ("Lyon", "Ligue 1"), ("Nice", "Ligue 1"), ("Lens", "Ligue 1"), ("Stade Rennais", "Ligue 1")],
    "arabic": [("Al Hilal", "Saudi Pro League"), ("Al Nassr", "Saudi Pro League"), ("Al Ahli", "Saudi Pro League"), ("Al Ittihad", "Saudi Pro League"), ("Al Sadd", "Qatar Stars League"), ("Al Duhail", "Qatar Stars League"), ("Fenerbahçe", "Süper Lig"), ("Galatasaray", "Süper Lig")],
    "germanic": [("Bayern Munich", "Bundesliga"), ("Bayer Leverkusen", "Bundesliga"), ("Borussia Dortmund", "Bundesliga"), ("RB Leipzig", "Bundesliga"), ("Stuttgart", "Bundesliga"), ("Eintracht Frankfurt", "Bundesliga"), ("Salzburg", "Austrian Bundesliga"), ("Basel", "Swiss Super League")],
    "asian": [("Real Sociedad", "La Liga"), ("Brighton", "Premier League"), ("Liverpool", "Premier League"), ("Bayern Munich", "Bundesliga"), ("PSG", "Ligue 1"), ("Feyenoord", "Eredivisie"), ("Celtic", "Scottish Premiership"), ("Ulsan HD", "K League"), ("Vissel Kobe", "J1 League")]
}

def main():
    if not os.path.exists(TEAMS_PATH):
        print(f"Error: {TEAMS_PATH} does not exist.")
        return

    with open(TEAMS_PATH, 'r', encoding='utf-8') as f:
        teams = json.load(f)

    for team in teams:
        squad = team.get('squad', [])
        
        # 1. Update existing players to have Chinese names
        for player in squad:
            name = player['name']
            if name in existing_players_cn:
                player['name_cn'] = existing_players_cn[name]
            else:
                # Basic parsing if not found in existing list
                parts = name.split(' ')
                first = parts[0]
                last = parts[-1]
                pool_name = team_pool_mapping.get(team['id'], 'anglo')
                pool = names_pool[pool_name]
                
                first_cn = first
                last_cn = last
                if first in pool['first']:
                    idx = pool['first'].index(first)
                    first_cn = pool['first_cn'][idx]
                if last in pool['last']:
                    idx = pool['last'].index(last)
                    last_cn = pool['last_cn'][idx]
                
                player['name_cn'] = f"{first_cn}·{last_cn}" if first_cn != first or last_cn != last else name

        # 2. Pad squad if count < 8
        target_count = 8
        current_count = len(squad)
        if current_count < target_count:
            pool_name = team_pool_mapping.get(team['id'], 'anglo')
            pool = names_pool[pool_name]
            
            existing_names = {p['name'] for p in squad}
            positions_available = ["GK", "DF", "MF", "FW"]
            
            # Ensure we have at least 1 GK, 2 DF, 2 MF, 2 FW in the squad
            pos_counts = {"GK": 0, "DF": 0, "MF": 0, "FW": 0}
            for p in squad:
                pos_counts[p['pos']] = pos_counts.get(p['pos'], 0) + 1
            
            while len(squad) < target_count:
                # Select position based on what is lacking
                if pos_counts["GK"] < 1:
                    pos = "GK"
                elif pos_counts["DF"] < 2:
                    pos = "DF"
                elif pos_counts["MF"] < 2:
                    pos = "MF"
                elif pos_counts["FW"] < 2:
                    pos = "FW"
                else:
                    pos = random.choice(positions_available)
                
                # Generate unique name
                trials = 0
                while trials < 100:
                    first_idx = random.randint(0, len(pool['first']) - 1)
                    last_idx = random.randint(0, len(pool['last']) - 1)
                    
                    first = pool['first'][first_idx]
                    last = pool['last'][last_idx]
                    full_name = f"{first} {last}"
                    
                    if full_name not in existing_names:
                        break
                    trials += 1
                
                first_cn = pool['first_cn'][first_idx]
                last_cn = pool['last_cn'][last_idx]
                full_name_cn = f"{first_cn}·{last_cn}"
                
                existing_names.add(full_name)
                
                # Pick a popular club & league from this culture
                club, league = random.choice(popular_clubs_by_pool[pool_name])
                
                # Add player
                new_player = {
                    "name": full_name,
                    "name_cn": full_name_cn,
                    "pos": pos,
                    "age": random.randint(21, 34),
                    "club": club,
                    "league": league,
                    "is_key": False,
                    "injury": None
                }
                
                squad.append(new_player)
                pos_counts[pos] += 1

        # Save back
        team['squad'] = squad

    with open(TEAMS_PATH, 'w', encoding='utf-8') as f:
        json.dump(teams, f, ensure_ascii=False, indent=2)

    print("Successfully expanded all team squads in teams.json!")

if __name__ == '__main__':
    main()
