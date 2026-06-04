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
    "Hakan Çalhanoğlu": "哈坎·恰尔汗奥卢", "Arda Güler": "阿尔达·居勒尔", "Kenan Yıldız": "凯南·伊尔迪兹",
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
    "Jude Bellingham": "朱德·贝林厄姆", "Bukayo Saka": "布卡约·萨卡", "Phil Foden": "菲尔·福登", "Harry Kane": "哈里·凯恩", "Declan Rice": "德克兰·赖斯",
    # CRO
    "Luka Modrić": "卢卡·莫德里奇", "Mateo Kovačić": "马特奥·科瓦契奇", "Joško Gvardiol": "约什科·格瓦迪奥尔",
    # GHA
    "Mohammed Kudus": "穆罕默德·库杜斯", "Thomas Partey": "托马斯·帕尔特伊", "Jordan Ayew": "乔丹·阿尤",
    # PAN
    "José Luis Rodríguez": "何塞·路易斯·罗德里格斯", "Édgar Bárcenas": "埃德加·巴尔塞纳斯", "Andrés Andrade": "安德烈斯·安德拉德",

    # FRA extra
    "Olivier Giroud": "奥利维耶·吉鲁", "Kingsley Coman": "金斯利·科曼", "Marcus Thuram": "马库斯·图拉姆",
    "Randal Kolo Muani": "兰德尔·科洛·穆阿尼", "Adrien Rabiot": "阿德里安·拉比奥", "N'Golo Kanté": "恩戈洛·坎特",
    "Warren Zaïre-Emery": "沃伦·扎伊尔-埃梅里", "Youssouf Fofana": "优素福·福法纳", "Theo Hernández": "特奥·埃尔南德斯",
    "Jules Koundé": "朱尔·孔德", "Ibrahima Konaté": "易卜拉希马·科纳特", "Dayot Upamecano": "达约·于帕梅卡诺",
    "Benjamin Pavard": "邦雅曼·帕瓦尔", "Lucas Hernández": "卢卡斯·埃尔南德斯", "Mike Maignan": "迈克·迈尼昂",
    "Brice Samba": "布里斯·桑巴", "Alphonse Areola": "阿尔封斯·阿雷奥拉", "Ousmane Dembélé": "奥斯曼·登贝莱",
    # ARG extra
    "Lautaro Martínez": "劳塔罗·马丁内斯", "Ángel Di María": "安赫尔·迪马利亚", "Nicolás González": "尼古拉斯·冈萨雷斯",
    "Alejandro Garnacho": "亚历杭德罗·加纳乔", "Rodrigo De Paul": "罗德里戈·德保罗", "Alexis Mac Allister": "亚历克西斯·麦卡利斯特",
    "Leandro Paredes": "莱安德罗·帕雷德斯", "Giovani Lo Celso": "乔瓦尼·洛塞尔索", "Exequiel Palacios": "埃塞基耶尔·帕拉西奥斯",
    "Cristian Romero": "克里斯蒂安·罗梅罗", "Nahuel Molina": "纳韦尔·莫利纳", "Nicolás Tagliafico": "尼古拉斯·塔利亚菲科",
    "Gonzalo Montiel": "贡萨洛·蒙铁尔", "Marcos Acuña": "马科斯·阿库尼亚", "Nicolás Otamendi": "尼古拉斯·奥塔门迪",
    "Emiliano Martínez": "埃米利亚诺·马丁内斯", "Gerónimo Rulli": "赫罗尼莫·鲁利", "Franco Armani": "弗朗哥·阿尔马尼",
    # ENG extra
    "Marcus Rashford": "马库斯·拉什福德", "Cole Palmer": "科尔·帕尔默", "Ollie Watkins": "奥利·瓦特金斯",
    "Anthony Gordon": "安东尼·戈登", "Jarrod Bowen": "贾罗德·鲍文", "Conor Gallagher": "康纳·加拉格尔",
    "Kobbie Mainoo": "科比·梅努", "Trent Alexander-Arnold": "亚历山大-ア诺德", "Trent Alexander-Arnold": "特伦特·亚历山大-阿诺德", "Kyle Walker": "凯尔·沃克",
    "John Stones": "约翰·斯通斯", "Kieran Trippier": "基兰·特里皮尔", "Marc Guéhi": "马克·格伊",
    "Harry Maguire": "哈里·马奎尔", "Luke Shaw": "卢克·肖", "Joe Gomez": "乔·戈麦斯",
    "Jordan Pickford": "乔丹·皮克福德", "Aaron Ramsdale": "亚伦·拉姆斯代尔", "Dean Henderson": "迪恩·亨德森",
    # BRA extra
    "Gabriel Martinelli": "加布里埃尔·马丁内利", "Endrick": "恩德里克", "Neymar Jr": "内马尔",
    "Richarlison": "理查利森", "Lucas Paquetá": "卢卡斯·帕奎塔", "Casemiro": "卡塞米罗",
    "Douglas Luiz": "道格拉斯·路易斯", "Andreas Pereira": "安德烈亚斯·佩雷拉", "Marquinhos": "马尔基尼奥斯",
    "Gabriel Magalhães": "加布里埃尔·马加良斯", "Bremer": "布雷默", "Danilo": "达尼洛",
    "Yan Couto": "扬·科托", "Wendell": "温德尔", "Ederson": "埃德森", "Bento": "本托",
    "Lucas Beraldo": "卢卡斯·贝拉尔多",
    # ESP extra
    "Alvaro Morata": "阿尔瓦罗·莫拉塔", "Dani Olmo": "丹尼·奥尔莫", "Ferran Torres": "费兰·托雷斯",
    "Joselu": "何塞卢", "Mikel Oyarzabal": "米克尔·奥亚萨瓦尔", "Gavi": "加维",
    "Fabián Ruiz": "法比安·鲁伊斯", "Martin Zubimendi": "马丁·苏维门迪", "Mikel Merino": "米克尔·梅里诺",
    "Robin Le Normand": "罗宾·勒诺尔芒", "Aymeric Laporte": "埃梅里克·拉波尔特", "Marc Cucurella": "马克·库库雷利亚",
    "Alex Grimaldo": "亚历克斯·格里马尔多", "Nacho Fernández": "纳乔·费尔南德斯", "Vivian": "丹尼尔·维维安",
    "Unai Simón": "乌奈·西蒙", "David Raya": "大卫·拉亚", "Alex Remiro": "亚历克斯·雷米罗",
    # POR extra
    "João Félix": "若昂·菲利克斯", "Diogo Jota": "迪奥戈·若塔", "Gonçalo Ramos": "贡萨洛·拉莫斯",
    "Francisco Conceição": "弗朗西斯科·孔塞桑", "João Neves": "若昂·内维斯", "Vitinha": "维蒂尼亚",
    "Otávio": "奥塔维奥", "Rúben Neves": "鲁本·内维斯", "João Palhinha": "若昂·帕利尼亚",
    "Rúben Dias": "鲁本·迪亚斯", "João Cancelo": "若昂·坎塞洛", "Nuno Mendes": "努诺·门德斯",
    "Diogo Dalot": "迪奥戈·达洛特", "António Silva": "安东尼奥·席尔瓦", "Gonçalo Inácio": "贡萨洛·伊纳西奥",
    "Nélson Semedo": "内尔松·塞梅多", "Diogo Costa": "迪奥戈·科斯塔", "José Sá": "若泽·萨",
    "Rui Patrício": "鲁伊·帕特里西奥",
    # GER extra
    "Niclas Füllkrug": "尼克拉斯·菲尔克鲁格", "Leroy Sané": "勒鲁瓦·萨内", "Serge Gnabry": "谢尔日·格纳布里",
    "İlkay Gündoğan": "伊尔卡伊·京多安", "Joshua Kimmich": "约书亚·基米希", "Pascal Groß": "帕斯卡尔·格罗斯",
    "Robert Andrich": "罗伯特·安德里希", "Aleksandar Pavlović": "亚历山大·帕夫洛维奇", "David Raum": "大卫·劳姆",
    "Nico Schlotterbeck": "尼科·施洛特贝克", "Jonathan Tah": "约纳坦·塔", "Maximilian Mittelstädt": "马克西米利安·米特尔施泰特",
    "Waldemar Anton": "瓦尔德马·安东", "Benjamin Henrichs": "本杰明·亨里克斯", "Marc-André ter Stegen": "特尔施特根",
    "Manuel Neuer": "曼努埃尔·诺伊尔", "Oliver Baumann": "奥利弗·鲍曼",
    # JPN extra
    "Daichi Kamada": "镰田大地", "Takumi Minamino": "南野拓实", "Ritsu Doan": "堂安律",
    "Ayase Ueda": "上田绮世", "Reo Hatate": "旗手怜央", "Ao Tanaka": "田中碧",
    "Hidemasa Morita": "守田英正", "Takehiro Tomiyasu": "富安健洋", "Hiroki Ito": "伊藤洋介",
    "Ko Itakura": "板仓滉", "Yukinari Sugawara": "菅原由势", "Koki Machida": "町田浩树",
    "Shogo Taniguchi": "谷口彰悟", "Zion Suzuki": "铃木彩艳", "Keisuke Osako": "大迫敬介",
    # KOR extra
    "Cho Gue-sung": "曹圭成", "Oh Hyeon-gyu": "吴贤揆", "Hwang In-beom": "黄仁范",
    "Lee Jae-sung": "李在城", "Hong Hyun-seok": "洪贤锡", "Park Yong-woo": "朴镕宇",
    "Seol Young-woo": "薛荣宇", "Kim Young-gwon": "金英权", "Jung Seung-hyun": "郑昇炫",
    "Jo Hyeon-woo": "赵贤祐", "Song Bum-keun": "宋范根",
    # USA extra
    "Folarin Balogun": "巴洛贡", "Timothy Weah": "蒂莫西·维阿", "Ricardo Pepi": "里卡多·佩皮",
    "Brenden Aaronson": "布伦登·阿伦森", "Johnny Cardoso": "约翰尼·卡多索", "Malik Tillman": "马里克·蒂尔曼",
    "Antonee Robinson": "安东尼·罗宾逊", "Chris Richards": "克里斯·里查兹", "Tim Ream": "蒂姆·里姆",
    "Cameron Carter-Vickers": "卡特-维克斯", "Joe Scally": "乔·斯卡利", "Matt Turner": "马特·特纳",
    "Ethan Horvath": "伊森·霍瓦特"
}

real_players_by_team = {
    "FRA": [
        {"name": "Kylian Mbappé", "pos": "FW", "age": 27, "club": "Real Madrid", "league": "La Liga", "is_key": True, "injury": None},
        {"name": "Antoine Griezmann", "pos": "FW", "age": 35, "club": "Atlético Madrid", "league": "La Liga", "is_key": True, "injury": None},
        {"name": "Aurélien Tchouaméni", "pos": "MF", "age": 26, "club": "Real Madrid", "league": "La Liga", "is_key": True, "injury": None},
        {"name": "William Saliba", "pos": "DF", "age": 25, "club": "Arsenal", "league": "Premier League", "is_key": True, "injury": None},
        {"name": "Ousmane Dembélé", "pos": "FW", "age": 29, "club": "PSG", "league": "Ligue 1", "is_key": False, "injury": None},
        {"name": "Olivier Giroud", "pos": "FW", "age": 35, "club": "LAFC", "league": "MLS", "is_key": False, "injury": None},
        {"name": "Kingsley Coman", "pos": "FW", "age": 29, "club": "Bayern Munich", "league": "Bundesliga", "is_key": False, "injury": None},
        {"name": "Marcus Thuram", "pos": "FW", "age": 28, "club": "Inter Milan", "league": "Serie A", "is_key": False, "injury": None},
        {"name": "Randal Kolo Muani", "pos": "FW", "age": 27, "club": "PSG", "league": "Ligue 1", "is_key": False, "injury": None},
        {"name": "Eduardo Camavinga", "pos": "MF", "age": 23, "club": "Real Madrid", "league": "La Liga", "is_key": False, "injury": None},
        {"name": "Adrien Rabiot", "pos": "MF", "age": 31, "club": "Juventus", "league": "Serie A", "is_key": False, "injury": None},
        {"name": "N'Golo Kanté", "pos": "MF", "age": 35, "club": "Al Ittihad", "league": "Saudi Pro League", "is_key": False, "injury": None},
        {"name": "Warren Zaïre-Emery", "pos": "MF", "age": 20, "club": "PSG", "league": "Ligue 1", "is_key": False, "injury": None},
        {"name": "Youssouf Fofana", "pos": "MF", "age": 27, "club": "AC Milan", "league": "Serie A", "is_key": False, "injury": None},
        {"name": "Theo Hernández", "pos": "DF", "age": 28, "club": "AC Milan", "league": "Serie A", "is_key": False, "injury": None},
        {"name": "Jules Koundé", "pos": "DF", "age": 27, "club": "Barcelona", "league": "La Liga", "is_key": False, "injury": None},
        {"name": "Ibrahima Konaté", "pos": "DF", "age": 27, "club": "Liverpool", "league": "Premier League", "is_key": False, "injury": None},
        {"name": "Dayot Upamecano", "pos": "DF", "age": 27, "club": "Bayern Munich", "league": "Bundesliga", "is_key": False, "injury": None},
        {"name": "Benjamin Pavard", "pos": "DF", "age": 30, "club": "Inter Milan", "league": "Serie A", "is_key": False, "injury": None},
        {"name": "Lucas Hernández", "pos": "DF", "age": 30, "club": "PSG", "league": "Ligue 1", "is_key": False, "injury": None},
        {"name": "Mike Maignan", "pos": "GK", "age": 30, "club": "AC Milan", "league": "Serie A", "is_key": False, "injury": None},
        {"name": "Brice Samba", "pos": "GK", "age": 32, "club": "Lens", "league": "Ligue 1", "is_key": False, "injury": None},
        {"name": "Alphonse Areola", "pos": "GK", "age": 33, "club": "West Ham", "league": "Premier League", "is_key": False, "injury": None}
    ],
    "ARG": [
        {"name": "Lionel Messi", "pos": "FW", "age": 38, "club": "Inter Miami", "league": "MLS", "is_key": True, "injury": None},
        {"name": "Julián Álvarez", "pos": "FW", "age": 26, "club": "Atlético Madrid", "league": "La Liga", "is_key": True, "injury": None},
        {"name": "Enzo Fernández", "pos": "MF", "age": 25, "club": "Chelsea", "league": "Premier League", "is_key": True, "injury": None},
        {"name": "Lisandro Martínez", "pos": "DF", "age": 28, "club": "Man United", "league": "Premier League", "is_key": True, "injury": None},
        {"name": "Lautaro Martínez", "pos": "FW", "age": 28, "club": "Inter Milan", "league": "Serie A", "is_key": False, "injury": None},
        {"name": "Ángel Di María", "pos": "FW", "age": 38, "club": "Benfica", "league": "Liga Portugal", "is_key": False, "injury": None},
        {"name": "Nicolás González", "pos": "FW", "age": 28, "club": "Juventus", "league": "Serie A", "is_key": False, "injury": None},
        {"name": "Alejandro Garnacho", "pos": "FW", "age": 21, "club": "Man United", "league": "Premier League", "is_key": False, "injury": None},
        {"name": "Rodrigo De Paul", "pos": "MF", "age": 32, "club": "Atlético Madrid", "league": "La Liga", "is_key": False, "injury": None},
        {"name": "Alexis Mac Allister", "pos": "MF", "age": 27, "club": "Liverpool", "league": "Premier League", "is_key": False, "injury": None},
        {"name": "Leandro Paredes", "pos": "MF", "age": 31, "club": "AS Roma", "league": "Serie A", "is_key": False, "injury": None},
        {"name": "Giovani Lo Celso", "pos": "MF", "age": 30, "club": "Real Betis", "league": "La Liga", "is_key": False, "injury": None},
        {"name": "Exequiel Palacios", "pos": "MF", "age": 27, "club": "Bayer Leverkusen", "league": "Bundesliga", "is_key": False, "injury": None},
        {"name": "Cristian Romero", "pos": "DF", "age": 28, "club": "Tottenham", "league": "Premier League", "is_key": False, "injury": None},
        {"name": "Nahuel Molina", "pos": "DF", "age": 28, "club": "Atlético Madrid", "league": "La Liga", "is_key": False, "injury": None},
        {"name": "Nicolás Tagliafico", "pos": "DF", "age": 33, "club": "Lyon", "league": "Ligue 1", "is_key": False, "injury": None},
        {"name": "Gonzalo Montiel", "pos": "DF", "age": 29, "club": "Sevilla", "league": "La Liga", "is_key": False, "injury": None},
        {"name": "Marcos Acuña", "pos": "DF", "age": 34, "club": "River Plate", "league": "Primera División", "is_key": False, "injury": None},
        {"name": "Nicolás Otamendi", "pos": "DF", "age": 38, "club": "Benfica", "league": "Liga Portugal", "is_key": False, "injury": None},
        {"name": "Emiliano Martínez", "pos": "GK", "age": 33, "club": "Aston Villa", "league": "Premier League", "is_key": False, "injury": None},
        {"name": "Gerónimo Rulli", "pos": "GK", "age": 34, "club": "Marseille", "league": "Ligue 1", "is_key": False, "injury": None},
        {"name": "Franco Armani", "pos": "GK", "age": 39, "club": "River Plate", "league": "Primera División", "is_key": False, "injury": None}
    ],
    "ENG": [
        {"name": "Jude Bellingham", "pos": "MF", "age": 23, "club": "Real Madrid", "league": "La Liga", "is_key": True, "injury": None},
        {"name": "Bukayo Saka", "pos": "FW", "age": 24, "club": "Arsenal", "league": "Premier League", "is_key": True, "injury": None},
        {"name": "Phil Foden", "pos": "MF", "age": 26, "club": "Man City", "league": "Premier League", "is_key": True, "injury": None},
        {"name": "Harry Kane", "pos": "FW", "age": 32, "club": "Bayern Munich", "league": "Bundesliga", "is_key": True, "injury": None},
        {"name": "Declan Rice", "pos": "MF", "age": 27, "club": "Arsenal", "league": "Premier League", "is_key": True, "injury": None},
        {"name": "Marcus Rashford", "pos": "FW", "age": 28, "club": "Man United", "league": "Premier League", "is_key": False, "injury": None},
        {"name": "Cole Palmer", "pos": "FW", "age": 24, "club": "Chelsea", "league": "Premier League", "is_key": False, "injury": None},
        {"name": "Ollie Watkins", "pos": "FW", "age": 30, "club": "Aston Villa", "league": "Premier League", "is_key": False, "injury": None},
        {"name": "Anthony Gordon", "pos": "FW", "age": 25, "club": "Newcastle", "league": "Premier League", "is_key": False, "injury": None},
        {"name": "Jarrod Bowen", "pos": "FW", "age": 29, "club": "West Ham", "league": "Premier League", "is_key": False, "injury": None},
        {"name": "Conor Gallagher", "pos": "MF", "age": 26, "club": "Atlético Madrid", "league": "La Liga", "is_key": False, "injury": None},
        {"name": "Kobbie Mainoo", "pos": "MF", "age": 21, "club": "Man United", "league": "Premier League", "is_key": False, "injury": None},
        {"name": "Trent Alexander-Arnold", "pos": "DF", "age": 27, "club": "Liverpool", "league": "Premier League", "is_key": False, "injury": None},
        {"name": "Kyle Walker", "pos": "DF", "age": 36, "club": "Man City", "league": "Premier League", "is_key": False, "injury": None},
        {"name": "John Stones", "pos": "DF", "age": 32, "club": "Man City", "league": "Premier League", "is_key": False, "injury": None},
        {"name": "Kieran Trippier", "pos": "DF", "age": 35, "club": "Newcastle", "league": "Premier League", "is_key": False, "injury": None},
        {"name": "Marc Guéhi", "pos": "DF", "age": 25, "club": "Crystal Palace", "league": "Premier League", "is_key": False, "injury": None},
        {"name": "Harry Maguire", "pos": "DF", "age": 33, "club": "Man United", "league": "Premier League", "is_key": False, "injury": None},
        {"name": "Luke Shaw", "pos": "DF", "age": 30, "club": "Man United", "league": "Premier League", "is_key": False, "injury": None},
        {"name": "Joe Gomez", "pos": "DF", "age": 29, "club": "Liverpool", "league": "Premier League", "is_key": False, "injury": None},
        {"name": "Jordan Pickford", "pos": "GK", "age": 32, "club": "Everton", "league": "Premier League", "is_key": False, "injury": None},
        {"name": "Aaron Ramsdale", "pos": "GK", "age": 28, "club": "Southampton", "league": "Premier League", "is_key": False, "injury": None},
        {"name": "Dean Henderson", "pos": "GK", "age": 29, "club": "Crystal Palace", "league": "Premier League", "is_key": False, "injury": None}
    ],
    "BRA": [
        {"name": "Vinícius Jr", "pos": "FW", "age": 25, "club": "Real Madrid", "league": "La Liga", "is_key": True, "injury": None},
        {"name": "Rodrygo", "pos": "FW", "age": 25, "club": "Real Madrid", "league": "La Liga", "is_key": True, "injury": None},
        {"name": "Éder Militão", "pos": "DF", "age": 28, "club": "Real Madrid", "league": "La Liga", "is_key": True, "injury": None},
        {"name": "Alisson", "pos": "GK", "age": 33, "club": "Liverpool", "league": "Premier League", "is_key": True, "injury": None},
        {"name": "Bruno Guimarães", "pos": "MF", "age": 28, "club": "Newcastle", "league": "Premier League", "is_key": True, "injury": None},
        {"name": "Raphinha", "pos": "FW", "age": 29, "club": "Barcelona", "league": "La Liga", "is_key": False, "injury": None},
        {"name": "Gabriel Martinelli", "pos": "FW", "age": 24, "club": "Arsenal", "league": "Premier League", "is_key": False, "injury": None},
        {"name": "Endrick", "pos": "FW", "age": 19, "club": "Real Madrid", "league": "La Liga", "is_key": False, "injury": None},
        {"name": "Neymar Jr", "pos": "FW", "age": 34, "club": "Al Hilal", "league": "Saudi Pro League", "is_key": False, "injury": None},
        {"name": "Richarlison", "pos": "FW", "age": 29, "club": "Tottenham", "league": "Premier League", "is_key": False, "injury": None},
        {"name": "Lucas Paquetá", "pos": "MF", "age": 28, "club": "West Ham", "league": "Premier League", "is_key": False, "injury": None},
        {"name": "Casemiro", "pos": "MF", "age": 34, "club": "Man United", "league": "Premier League", "is_key": False, "injury": None},
        {"name": "Douglas Luiz", "pos": "MF", "age": 28, "club": "Juventus", "league": "Serie A", "is_key": False, "injury": None},
        {"name": "Andreas Pereira", "pos": "MF", "age": 30, "club": "Fulham", "league": "Premier League", "is_key": False, "injury": None},
        {"name": "Marquinhos", "pos": "DF", "age": 32, "club": "PSG", "league": "Ligue 1", "is_key": False, "injury": None},
        {"name": "Gabriel Magalhães", "pos": "DF", "age": 28, "club": "Arsenal", "league": "Premier League", "is_key": False, "injury": None},
        {"name": "Bremer", "pos": "DF", "age": 29, "club": "Juventus", "league": "Serie A", "is_key": False, "injury": None},
        {"name": "Danilo", "pos": "DF", "age": 34, "club": "Juventus", "league": "Serie A", "is_key": False, "injury": None},
        {"name": "Yan Couto", "pos": "DF", "age": 24, "club": "Borussia Dortmund", "league": "Bundesliga", "is_key": False, "injury": None},
        {"name": "Wendell", "pos": "DF", "age": 32, "club": "Porto", "league": "Liga Portugal", "is_key": False, "injury": None},
        {"name": "Ederson", "pos": "GK", "age": 32, "club": "Man City", "league": "Premier League", "is_key": False, "injury": None},
        {"name": "Bento", "pos": "GK", "age": 26, "club": "Al Nassr", "league": "Saudi Pro League", "is_key": False, "injury": None},
        {"name": "Lucas Beraldo", "pos": "DF", "age": 22, "club": "PSG", "league": "Ligue 1", "is_key": False, "injury": None}
    ],
    "ESP": [
        {"name": "Lamine Yamal", "pos": "FW", "age": 18, "club": "Barcelona", "league": "La Liga", "is_key": True, "injury": None},
        {"name": "Pedri", "pos": "MF", "age": 23, "club": "Barcelona", "league": "La Liga", "is_key": True, "injury": None},
        {"name": "Rodri", "pos": "MF", "age": 30, "club": "Man City", "league": "Premier League", "is_key": True, "injury": None},
        {"name": "Dani Carvajal", "pos": "DF", "age": 34, "club": "Real Madrid", "league": "La Liga", "is_key": True, "injury": None},
        {"name": "Nico Williams", "pos": "FW", "age": 24, "club": "Athletic Bilbao", "league": "La Liga", "is_key": True, "injury": None},
        {"name": "Alvaro Morata", "pos": "FW", "age": 33, "club": "AC Milan", "league": "Serie A", "is_key": False, "injury": None},
        {"name": "Dani Olmo", "pos": "MF", "age": 28, "club": "Barcelona", "league": "La Liga", "is_key": False, "injury": None},
        {"name": "Ferran Torres", "pos": "FW", "age": 26, "club": "Barcelona", "league": "La Liga", "is_key": False, "injury": None},
        {"name": "Joselu", "pos": "FW", "age": 36, "club": "Al Gharafa", "league": "QSL", "is_key": False, "injury": None},
        {"name": "Mikel Oyarzabal", "pos": "FW", "age": 29, "club": "Real Sociedad", "league": "La Liga", "is_key": False, "injury": None},
        {"name": "Gavi", "pos": "MF", "age": 21, "club": "Barcelona", "league": "La Liga", "is_key": False, "injury": None},
        {"name": "Fabián Ruiz", "pos": "MF", "age": 30, "club": "PSG", "league": "Ligue 1", "is_key": False, "injury": None},
        {"name": "Martin Zubimendi", "pos": "MF", "age": 27, "club": "Real Sociedad", "league": "La Liga", "is_key": False, "injury": None},
        {"name": "Mikel Merino", "pos": "MF", "age": 29, "club": "Arsenal", "league": "Premier League", "is_key": False, "injury": None},
        {"name": "Robin Le Normand", "pos": "DF", "age": 29, "club": "Atlético Madrid", "league": "La Liga", "is_key": False, "injury": None},
        {"name": "Aymeric Laporte", "pos": "DF", "age": 32, "club": "Al Nassr", "league": "Saudi Pro League", "is_key": False, "injury": None},
        {"name": "Marc Cucurella", "pos": "DF", "age": 27, "club": "Chelsea", "league": "Premier League", "is_key": False, "injury": None},
        {"name": "Alex Grimaldo", "pos": "DF", "age": 30, "club": "Bayer Leverkusen", "league": "Bundesliga", "is_key": False, "injury": None},
        {"name": "Nacho Fernández", "pos": "DF", "age": 36, "club": "Al Qadsiah", "league": "Saudi Pro League", "is_key": False, "injury": None},
        {"name": "Vivian", "pos": "DF", "age": 26, "club": "Athletic Bilbao", "league": "La Liga", "is_key": False, "injury": None},
        {"name": "Unai Simón", "pos": "GK", "age": 28, "club": "Athletic Bilbao", "league": "La Liga", "is_key": False, "injury": None},
        {"name": "David Raya", "pos": "GK", "age": 30, "club": "Arsenal", "league": "Premier League", "is_key": False, "injury": None},
        {"name": "Alex Remiro", "pos": "GK", "age": 31, "club": "Real Sociedad", "league": "La Liga", "is_key": False, "injury": None}
    ],
    "POR": [
        {"name": "Cristiano Ronaldo", "pos": "FW", "age": 41, "club": "Al Nassr", "league": "Saudi Pro League", "is_key": True, "injury": None},
        {"name": "Bruno Fernandes", "pos": "MF", "age": 31, "club": "Man United", "league": "Premier League", "is_key": True, "injury": None},
        {"name": "Bernardo Silva", "pos": "MF", "age": 31, "club": "Man City", "league": "Premier League", "is_key": True, "injury": None},
        {"name": "Rafael Leão", "pos": "FW", "age": 27, "club": "AC Milan", "league": "Serie A", "is_key": True, "injury": None},
        {"name": "João Félix", "pos": "FW", "age": 26, "club": "Chelsea", "league": "Premier League", "is_key": False, "injury": None},
        {"name": "Diogo Jota", "pos": "FW", "age": 29, "club": "Liverpool", "league": "Premier League", "is_key": False, "injury": None},
        {"name": "Gonçalo Ramos", "pos": "FW", "age": 24, "club": "PSG", "league": "Ligue 1", "is_key": False, "injury": None},
        {"name": "Francisco Conceição", "pos": "FW", "age": 23, "club": "Juventus", "league": "Serie A", "is_key": False, "injury": None},
        {"name": "João Neves", "pos": "MF", "age": 21, "club": "PSG", "league": "Ligue 1", "is_key": False, "injury": None},
        {"name": "Vitinha", "pos": "MF", "age": 26, "club": "PSG", "league": "Ligue 1", "is_key": False, "injury": None},
        {"name": "Otávio", "pos": "MF", "age": 31, "club": "Al Nassr", "league": "Saudi Pro League", "is_key": False, "injury": None},
        {"name": "Rúben Neves", "pos": "MF", "age": 29, "club": "Al Hilal", "league": "Saudi Pro League", "is_key": False, "injury": None},
        {"name": "João Palhinha", "pos": "MF", "age": 30, "club": "Bayern Munich", "league": "Bundesliga", "is_key": False, "injury": None},
        {"name": "Rúben Dias", "pos": "DF", "age": 29, "club": "Man City", "league": "Premier League", "is_key": False, "injury": None},
        {"name": "João Cancelo", "pos": "DF", "age": 32, "club": "Al Hilal", "league": "Saudi Pro League", "is_key": False, "injury": None},
        {"name": "Nuno Mendes", "pos": "DF", "age": 23, "club": "PSG", "league": "Ligue 1", "is_key": False, "injury": None},
        {"name": "Diogo Dalot", "pos": "DF", "age": 27, "club": "Man United", "league": "Premier League", "is_key": False, "injury": None},
        {"name": "António Silva", "pos": "DF", "age": 22, "club": "Benfica", "league": "Liga Portugal", "is_key": False, "injury": None},
        {"name": "Gonçalo Inácio", "pos": "DF", "age": 24, "club": "Sporting CP", "league": "Liga Portugal", "is_key": False, "injury": None},
        {"name": "Nélson Semedo", "pos": "DF", "age": 32, "club": "Wolves", "league": "Premier League", "is_key": False, "injury": None},
        {"name": "Diogo Costa", "pos": "GK", "age": 26, "club": "Porto", "league": "Liga Portugal", "is_key": False, "injury": None},
        {"name": "José Sá", "pos": "GK", "age": 33, "club": "Wolves", "league": "Premier League", "is_key": False, "injury": None},
        {"name": "Rui Patrício", "pos": "GK", "age": 38, "club": "Atalanta", "league": "Serie A", "is_key": False, "injury": None}
    ],
    "GER": [
        {"name": "Jamal Musiala", "pos": "MF", "age": 23, "club": "Bayern Munich", "league": "Bundesliga", "is_key": True, "injury": None},
        {"name": "Florian Wirtz", "pos": "MF", "age": 23, "club": "Bayer Leverkusen", "league": "Bundesliga", "is_key": True, "injury": None},
        {"name": "Kai Havertz", "pos": "FW", "age": 27, "club": "Arsenal", "league": "Premier League", "is_key": True, "injury": None},
        {"name": "Antonio Rüdiger", "pos": "DF", "age": 33, "club": "Real Madrid", "league": "La Liga", "is_key": True, "injury": None},
        {"name": "Niclas Füllkrug", "pos": "FW", "age": 33, "club": "West Ham", "league": "Premier League", "is_key": False, "injury": None},
        {"name": "Leroy Sané", "pos": "FW", "age": 30, "club": "Bayern Munich", "league": "Bundesliga", "is_key": False, "injury": None},
        {"name": "Serge Gnabry", "pos": "FW", "age": 30, "club": "Bayern Munich", "league": "Bundesliga", "is_key": False, "injury": None},
        {"name": "İlkay Gündoğan", "pos": "MF", "age": 35, "club": "Barcelona", "league": "La Liga", "is_key": False, "injury": None},
        {"name": "Joshua Kimmich", "pos": "MF", "age": 31, "club": "Bayern Munich", "league": "Bundesliga", "is_key": False, "injury": None},
        {"name": "Pascal Groß", "pos": "MF", "age": 34, "club": "Borussia Dortmund", "league": "Bundesliga", "is_key": False, "injury": None},
        {"name": "Robert Andrich", "pos": "MF", "age": 31, "club": "Bayer Leverkusen", "league": "Bundesliga", "is_key": False, "injury": None},
        {"name": "Aleksandar Pavlović", "pos": "MF", "age": 22, "club": "Bayern Munich", "league": "Bundesliga", "is_key": False, "injury": None},
        {"name": "David Raum", "pos": "DF", "age": 28, "club": "RB Leipzig", "league": "Bundesliga", "is_key": False, "injury": None},
        {"name": "Nico Schlotterbeck", "pos": "DF", "age": 26, "club": "Borussia Dortmund", "league": "Bundesliga", "is_key": False, "injury": None},
        {"name": "Jonathan Tah", "pos": "DF", "age": 30, "club": "Bayer Leverkusen", "league": "Bundesliga", "is_key": False, "injury": None},
        {"name": "Maximilian Mittelstädt", "pos": "DF", "age": 29, "club": "Stuttgart", "league": "Bundesliga", "is_key": False, "injury": None},
        {"name": "Waldemar Anton", "pos": "DF", "age": 29, "club": "Borussia Dortmund", "league": "Bundesliga", "is_key": False, "injury": None},
        {"name": "Benjamin Henrichs", "pos": "DF", "age": 29, "club": "RB Leipzig", "league": "Bundesliga", "is_key": False, "injury": None},
        {"name": "Marc-André ter Stegen", "pos": "GK", "age": 34, "club": "Barcelona", "league": "La Liga", "is_key": False, "injury": None},
        {"name": "Manuel Neuer", "pos": "GK", "age": 40, "club": "Bayern Munich", "league": "Bundesliga", "is_key": False, "injury": None},
        {"name": "Oliver Baumann", "pos": "GK", "age": 36, "club": "Hoffenheim", "league": "Bundesliga", "is_key": False, "injury": None}
    ],
    "JPN": [
        {"name": "Takefusa Kubo", "pos": "FW", "age": 25, "club": "Real Sociedad", "league": "La Liga", "is_key": True, "injury": None},
        {"name": "Kaoru Mitoma", "pos": "FW", "age": 29, "club": "Brighton", "league": "Premier League", "is_key": True, "injury": None},
        {"name": "Wataru Endo", "pos": "MF", "age": 33, "club": "Liverpool", "league": "Premier League", "is_key": True, "injury": None},
        {"name": "Daichi Kamada", "pos": "MF", "age": 29, "club": "Crystal Palace", "league": "Premier League", "is_key": False, "injury": None},
        {"name": "Takumi Minamino", "pos": "FW", "age": 31, "club": "Monaco", "league": "Ligue 1", "is_key": False, "injury": None},
        {"name": "Ritsu Doan", "pos": "FW", "age": 27, "club": "Freiburg", "league": "Bundesliga", "is_key": False, "injury": None},
        {"name": "Ayase Ueda", "pos": "FW", "age": 27, "club": "Feyenoord", "league": "Eredivisie", "is_key": False, "injury": None},
        {"name": "Reo Hatate", "pos": "MF", "age": 28, "club": "Celtic", "league": "Scottish Premiership", "is_key": False, "injury": None},
        {"name": "Ao Tanaka", "pos": "MF", "age": 27, "club": "Leeds United", "league": "Championship", "is_key": False, "injury": None},
        {"name": "Hidemasa Morita", "pos": "MF", "age": 31, "club": "Sporting CP", "league": "Liga Portugal", "is_key": False, "injury": None},
        {"name": "Takehiro Tomiyasu", "pos": "DF", "age": 27, "club": "Arsenal", "league": "Premier League", "is_key": False, "injury": None},
        {"name": "Hiroki Ito", "pos": "DF", "age": 27, "club": "Bayern Munich", "league": "Bundesliga", "is_key": False, "injury": None},
        {"name": "Ko Itakura", "pos": "DF", "age": 29, "club": "Borussia M'gladbach", "league": "Bundesliga", "is_key": False, "injury": None},
        {"name": "Yukinari Sugawara", "pos": "DF", "age": 25, "club": "Southampton", "league": "Premier League", "is_key": False, "injury": None},
        {"name": "Koki Machida", "pos": "DF", "age": 28, "club": "Union SG", "league": "Belgian Pro League", "is_key": False, "injury": None},
        {"name": "Shogo Taniguchi", "pos": "DF", "age": 34, "club": "Sint-Truidense", "league": "Belgian Pro League", "is_key": False, "injury": None},
        {"name": "Zion Suzuki", "pos": "GK", "age": 23, "club": "Parma", "league": "Serie A", "is_key": False, "injury": None},
        {"name": "Keisuke Osako", "pos": "GK", "age": 26, "club": "Sanfrecce Hiroshima", "league": "J1 League", "is_key": False, "injury": None}
    ],
    "KOR": [
        {"name": "Son Heung-min", "pos": "FW", "age": 33, "club": "Tottenham", "league": "Premier League", "is_key": True, "injury": None},
        {"name": "Kim Min-jae", "pos": "DF", "age": 29, "club": "Bayern Munich", "league": "Bundesliga", "is_key": True, "injury": None},
        {"name": "Lee Kang-in", "pos": "MF", "age": 25, "club": "PSG", "league": "Ligue 1", "is_key": True, "injury": None},
        {"name": "Hwang Hee-chan", "pos": "FW", "age": 30, "club": "Wolverhampton", "league": "Premier League", "is_key": False, "injury": None},
        {"name": "Cho Gue-sung", "pos": "FW", "age": 28, "club": "Midtjylland", "league": "Danish Superliga", "is_key": False, "injury": None},
        {"name": "Oh Hyeon-gyu", "pos": "FW", "age": 25, "club": "Genk", "league": "Belgian Pro League", "is_key": False, "injury": None},
        {"name": "Hwang In-beom", "pos": "MF", "age": 29, "club": "Feyenoord", "league": "Eredivisie", "is_key": False, "injury": None},
        {"name": "Lee Jae-sung", "pos": "MF", "age": 33, "club": "Mainz 05", "league": "Bundesliga", "is_key": False, "injury": None},
        {"name": "Hong Hyun-seok", "pos": "MF", "age": 26, "club": "Mainz 05", "league": "Bundesliga", "is_key": False, "injury": None},
        {"name": "Park Yong-woo", "pos": "MF", "age": 32, "club": "Al Ain", "league": "UAE Pro League", "is_key": False, "injury": None},
        {"name": "Seol Young-woo", "pos": "DF", "age": 27, "club": "Red Star Belgrade", "league": "Serbian League", "is_key": False, "injury": None},
        {"name": "Kim Young-gwon", "pos": "DF", "age": 36, "club": "Ulsan HD", "league": "K League 1", "is_key": False, "injury": None},
        {"name": "Jung Seung-hyun", "pos": "DF", "age": 32, "club": "Al Wasl", "league": "UAE Pro League", "is_key": False, "injury": None},
        {"name": "Jo Hyeon-woo", "pos": "GK", "age": 34, "club": "Ulsan HD", "league": "K League 1", "is_key": False, "injury": None},
        {"name": "Song Bum-keun", "pos": "GK", "age": 28, "club": "Shonan Bellmare", "league": "J1 League", "is_key": False, "injury": None}
    ],
    "USA": [
        {"name": "Christian Pulisic", "pos": "FW", "age": 27, "club": "AC Milan", "league": "Serie A", "is_key": True, "injury": None},
        {"name": "Weston McKennie", "pos": "MF", "age": 27, "club": "Juventus", "league": "Serie A", "is_key": True, "injury": None},
        {"name": "Yunus Musah", "pos": "MF", "age": 23, "club": "AC Milan", "league": "Serie A", "is_key": True, "injury": None},
        {"name": "Tyler Adams", "pos": "MF", "age": 27, "club": "Bournemouth", "league": "Premier League", "is_key": False, "injury": None},
        {"name": "Gio Reyna", "pos": "FW", "age": 23, "club": "Borussia Dortmund", "league": "Bundesliga", "is_key": False, "injury": None},
        {"name": "Folarin Balogun", "pos": "FW", "age": 24, "club": "Monaco", "league": "Ligue 1", "is_key": False, "injury": None},
        {"name": "Timothy Weah", "pos": "FW", "age": 26, "club": "Juventus", "league": "Serie A", "is_key": False, "injury": None},
        {"name": "Ricardo Pepi", "pos": "FW", "age": 23, "club": "PSV", "league": "Eredivisie", "is_key": False, "injury": None},
        {"name": "Brenden Aaronson", "pos": "MF", "age": 25, "club": "Leeds United", "league": "Championship", "is_key": False, "injury": None},
        {"name": "Johnny Cardoso", "pos": "MF", "age": 24, "club": "Real Betis", "league": "La Liga", "is_key": False, "injury": None},
        {"name": "Malik Tillman", "pos": "MF", "age": 24, "club": "PSV", "league": "Eredivisie", "is_key": False, "injury": None},
        {"name": "Antonee Robinson", "pos": "DF", "age": 28, "club": "Fulham", "league": "Premier League", "is_key": False, "injury": None},
        {"name": "Chris Richards", "pos": "DF", "age": 26, "club": "Crystal Palace", "league": "Premier League", "is_key": False, "injury": None},
        {"name": "Tim Ream", "pos": "DF", "age": 38, "club": "Charlotte FC", "league": "MLS", "is_key": False, "injury": None},
        {"name": "Cameron Carter-Vickers", "pos": "DF", "age": 28, "club": "Celtic", "league": "Scottish Premiership", "is_key": False, "injury": None},
        {"name": "Joe Scally", "pos": "DF", "age": 23, "club": "Borussia M'gladbach", "league": "Bundesliga", "is_key": False, "injury": None},
        {"name": "Matt Turner", "pos": "GK", "age": 31, "club": "Crystal Palace", "league": "Premier League", "is_key": False, "injury": None},
        {"name": "Ethan Horvath", "pos": "GK", "age": 31, "club": "Cardiff City", "league": "Championship", "is_key": False, "injury": None}
    ]
}
