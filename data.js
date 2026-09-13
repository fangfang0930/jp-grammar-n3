/* ============================================================
   N3句型语法 123条 数据文件
   ------------------------------------------------------------
   【数据格式说明】
   每条语法是一个对象，字段含义：
     title      : 语法项（索引），字符串，必填
     connection : 接续方式，字符串
     meaning    : 中文意思，字符串
     note       : 详细说明 / 补充，字符串
     examples   : 例句数组，每条 { jp: "日文例句", cn: "中文翻译" }

   【使用方法】
   对照文件夹中的 PDF 文档，将每条语法的内容填入对应的
   占位字段（把 "" 空字符串替换成实际内容即可）。
   修改保存 data.js 后，刷新网页即可看到效果。
   ============================================================ */

const GRAMMAR_DATA = [

    /* ===== 1-20 示例条目（已填入常见N3语法做参考） ===== */

    {
        title: "～はずだ / ～はずがない",
        connection: "动词・い形容词・な形容词・名词 の ＋ はずだ",
        meaning: "应该…… / 不可能……（按理推测）",
        note: "「はずだ」表示根据某种依据做出的推测，客观性较强。「はずがない」表示强烈的否定，「不可能有这种情况」。",
        examples: [
            { jp: "彼は昨日日本に着いたはずだ。", cn: "他按理应该昨天就到日本了。" },
            { jp: "あんなに上手な人が試験に落ちるはずがない。", cn: "那么厉害的人不可能考试不及格。" }
        ]
    },

    {
        title: "～わけだ / ～わけではない / ～わけがない",
        connection: "普通形＋わけだ",
        meaning: "当然…… / 并不是…… / 不可能……",
        note: "「わけだ」表示从前面的事实得出理所当然的结论，「难怪……」。「わけではない」表示部分否定，「并非如此」。「わけがない」表示强烈否定。",
        examples: [
            { jp: "毎日日本語で話しているから、上手になるわけだ。", cn: "因为每天都用日语交谈，当然会进步。" },
            { jp: "このレストランがいつも空いているわけではない。", cn: "并不是说这家餐厅一直都有空位。" },
            { jp: "あんな難しい仕事が一人でできるわけがない。", cn: "那么难的工作一个人不可能做得了。" }
        ]
    },

    {
        title: "～に決まっている / ～に相違ない / ～に違いない",
        connection: "普通形＋に決まっている",
        meaning: "一定是……，肯定……（确信度高）",
        note: "三者都表示说话人强烈的肯定推测。「に決まっている」口语感强，「に違いない」书面和口语都用，「に相違ない」偏书面正式。",
        examples: [
            { jp: "あのチームが優勝するに決まっている。", cn: "那支队伍肯定会赢。" },
            { jp: "彼が犯人だに違いない。", cn: "他一定是犯人。" }
        ]
    },

    {
        title: "～かもしれない / ～おそれがある",
        connection: "普通形＋かもしれない",
        meaning: "也许……，可能…… / 有……的危险",
        note: "「かもしれない」可能性一般，可用口语「かも」。「おそれがある」用于不好的事情，「恐怕会……」，偏书面。",
        examples: [
            { jp: "明日は雨が降るかもしれない。", cn: "明天可能会下雨。" },
            { jp: "このままでは計画が失敗するおそれがある。", cn: "这样下去的话计划有失败的危险。" }
        ]
    },

    {
        title: "～ようだ / ～みたいだ / ～そうだ / ～らしい",
        connection: "ようだ：普通形＋ようだ｜みたいだ：普通形＋みたいだ｜そうだ：ます形・い形容词词干・な形容词词干＋そうだ｜らしい：普通形＋らしい",
        meaning: "好像……，似乎……（样态 / 传闻）",
        note: "「ようだ・みたいだ」表主观推测，通过感官；「そうだ」接动词ます形表「眼看就要……」，接形容词表「看起来……」；「そうだ」也可表传闻；「らしい」表根据外部信息的客观推测，也可表传闻。",
        examples: [
            { jp: "このケーキはおいしそうだ。", cn: "这个蛋糕看起来很好吃。" },
            { jp: "彼は風邪を引いているようだ。", cn: "他好像感冒了。" },
            { jp: "天気予報によると、明日は雪だそうだ。", cn: "据天气预报说明天会下雪。" }
        ]
    },

    {
        title: "～すぎる",
        connection: "动词ます形・い形容词词干・な形容词词干 ＋ すぎる",
        meaning: "太……，过于……（超过一定限度）",
        note: "多表示程度过高，含贬义。「吃太多」「太贵了」等。",
        examples: [
            { jp: "今日は食べ過ぎてお腹が痛い。", cn: "今天吃太多了，肚子痛。" },
            { jp: "この問題は難しすぎる。", cn: "这个问题太难了。" }
        ]
    },

    {
        title: "～やすい / ～にくい",
        connection: "动词ます形＋やすい / にくい",
        meaning: "容易…… / 难以……（做某事的难易度）",
        note: "表示事物的性质导致动作容易或难进行。「やすい」也可表不好的倾向如「忘れやすい」（健忘）。",
        examples: [
            { jp: "このペンは書きやすい。", cn: "这支笔很好写。" },
            { jp: "この薬は苦くて飲みにくい。", cn: "这药很苦，很难喝下去。" }
        ]
    },

    {
        title: "～がち / ～気味",
        connection: "がち：动词ます形・名词＋がち｜気味：动词ます形・名词＋気味",
        meaning: "容易……，经常…… / 有点……，稍微……",
        note: "「がち」表示反复出现的不好倾向，「总是……」。「気味」表示程度不深，「有点……的感觉」，如「風邪気味」（有点感冒）、「疲れ気味」（有点累）。",
        examples: [
            { jp: "冬は休みがちだ。", cn: "冬天容易请假。" },
            { jp: "最近は少し疲れ気味だ。", cn: "最近感觉有点累。" }
        ]
    },

    {
        title: "～かけ / ～かけの / ～かけだ",
        connection: "动词ます形＋かけ",
        meaning: "做到一半……，没做完……；刚要……",
        note: "表示动作进行到中途尚未完成。「かける」作为复合动词使用，如「読みかけた本」（读到一半的书）。",
        examples: [
            { jp: "食べかけのパンを捨てた。", cn: "把吃了一半的面包扔了。" },
            { jp: "彼は何か言いかけて、やめた。", cn: "他刚要说什么，又停住了。" }
        ]
    },

    {
        title: "～出す / ～始める / ～続ける / ～終わる",
        connection: "动词ます形＋出す / 始める / 続ける / 終わる",
        meaning: "……起来 / 开始…… / 继续…… / ……完",
        note: "复合动词，表示动作的开始、持续、结束。「出す」有「突然开始」的语感，「始める」较客观。",
        examples: [
            { jp: "急に雨が降り出した。", cn: "突然下起雨来了。" },
            { jp: "三時間歩き続けた。", cn: "连续走了三个小时。" },
            { jp: "宿題をやり終わったら遊びに行く。", cn: "作业做完了就去玩。" }
        ]
    },

    {
        title: "～直す",
        connection: "动词ます形＋直す",
        meaning: "重新……，再做一次……",
        note: "表示把做过的事重新再做一遍，「重新做」。",
        examples: [
            { jp: "作文を書き直した。", cn: "把作文重写了一遍。" },
            { jp: "もう一度考え直してください。", cn: "请你再重新考虑一下。" }
        ]
    },

    {
        title: "～きる / ～きれる / ～きれない",
        connection: "动词ます形＋切る / 切れる / 切れない",
        meaning: "……完，……尽 / 能……完 / 不能……完",
        note: "「きる」表动作完全结束，「使い切る」用完；「きれない」表无法做到底，「数え切れない」数不清。",
        examples: [
            { jp: "貯金を全部使い切った。", cn: "把存款全部用光了。" },
            { jp: "こんなにたくさん、一人では食べきれない。", cn: "这么多，一个人吃不完。" }
        ]
    },

    {
        title: "～ぬく",
        connection: "动词ます形＋抜く",
        meaning: "坚持做到底，……到底",
        note: "表示经过艰苦努力把动作进行到最后，「坚持……」，如「頑張り抜く」（坚持到底）。",
        examples: [
            { jp: "最後まで戦い抜いた。", cn: "坚持战斗到了最后。" },
            { jp: "苦しくても走り抜いた。", cn: "即使很痛苦也坚持跑完了。" }
        ]
    },

    {
        title: "～ながら / ～ながらに / ～ながらも",
        connection: "动词ます形・い形容词・な形容词词干・名词＋ながら",
        meaning: "一边……一边……；虽然……但是……",
        note: "表同时动作或逆接。「ながらも」逆接语气更强。",
        examples: [
            { jp: "音楽を聞きながら勉強する。", cn: "一边听音乐一边学习。" },
            { jp: "残念ながら、明日は行けません。", cn: "很遗憾，明天不能去。" }
        ]
    },

    {
        title: "～つつ / ～つつある",
        connection: "动词ます形＋つつ / つつある",
        meaning: "一边……一边……；正在逐步……",
        note: "「つつ」表同时动作，书面。「つつある」表变化正在进行，「正在……中」。",
        examples: [
            { jp: "考えつつ歩く。", cn: "边走边想。" },
            { jp: "景気は回復しつつある。", cn: "经济正在逐步恢复。" }
        ]
    },

    {
        title: "～一方 / ～一方で / ～反面",
        connection: "普通形＋一方 / 一方で / 反面",
        meaning: "一方面……另一方面……；虽然……但反面……",
        note: "表示两个对照性的事物或方面同时存在。「反面」强调相反的另一面。",
        examples: [
            { jp: "彼は仕事ができる一方、遊びもよくする。", cn: "他一方面工作能干，另一方面也很会玩。" },
            { jp: "この車は速い反面、燃費が悪い。", cn: "这辆车速度快，但反过来油耗高。" }
        ]
    },

    {
        title: "～うえ（に） / ～うえで / ～うえは",
        connection: "うえに：普通形＋うえに｜うえで：动词た形・名词の＋うえで｜うえは：动词た形＋うえは",
        meaning: "而且……，加上…… / 在……基础上，……之后 / 既然……就……",
        note: "「うえに」表示累加；「うえで」表示在……基础上做某事；「うえは」表示「既然到了这个地步」，与「以上は」类似。",
        examples: [
            { jp: "この店は安い上に、味もいい。", cn: "这家店不仅便宜，而且味道也好。" },
            { jp: "よく考えたうえで決めました。", cn: "是在仔细考虑之后决定的。" },
            { jp: "こうなったうえは、仕方がない。", cn: "既然变成这样，也没办法了。" }
        ]
    },

    {
        title: "～以上（は）",
        connection: "普通形＋以上（は）",
        meaning: "既然……就……；超过……",
        note: "接在动词た形或现在形后，表示「既然……那就必须……」，后项多为义务、决心。",
        examples: [
            { jp: "約束した以上は、守らなければならない。", cn: "既然约定了，就必须遵守。" },
            { jp: "社員である以上は、会社のルールに従うべきだ。", cn: "既然是公司职员，就应该遵守公司规定。" }
        ]
    },

    {
        title: "～に限って / ～に限る / ～に限らず / ～だけでなく",
        connection: "に限って：名词＋に限って｜に限る：名词・动词辞书形＋に限る｜に限らず：名词＋に限らず",
        meaning: "偏偏…… / 最好…… / 不限于……，不仅……而且……",
        note: "「に限って」表「偏偏在……时候」「に限る」表「……为最佳」「に限らず」表「不仅如此还有」。",
        examples: [
            { jp: "急ぐ時に限って、バスが来ない。", cn: "偏偏在着急的时候，公交车不来。" },
            { jp: "疲れた時は寝るに限る。", cn: "累的时候最好是睡觉。" },
            { jp: "東京に限らず、日本全国で物価が高い。", cn: "不仅是东京，全日本物价都很高。" }
        ]
    },

    {
        title: "～において / ～における / ～際（に）",
        connection: "において：名词＋において｜際（に）：动词辞书形・た形・名词の＋際（に）",
        meaning: "在……（方面 / 场合） / 在……的时候",
        note: "「において」相当于助词「で」，偏书面正式；「際（に）」表「……的时候 / 之际」，偏正式，也可用「に際して」。",
        examples: [
            { jp: "会議において、新しい計画が発表された。", cn: "在会议上，公布了新的计划。" },
            { jp: "お帰りの際に、これをどうぞ。", cn: "您回去的时候，请收下这个。" }
        ]
    },

    /* ===== 21-123 模板占位：请对照PDF文档填入 ===== */

    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 21
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 22
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 23
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 24
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 25
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 26
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 27
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 28
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 29
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 30
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 31
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 32
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 33
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 34
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 35
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 36
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 37
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 38
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 39
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 40
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 41
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 42
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 43
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 44
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 45
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 46
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 47
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 48
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 49
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 50
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 51
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 52
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 53
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 54
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 55
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 56
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 57
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 58
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 59
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 60
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 61
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 62
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 63
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 64
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 65
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 66
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 67
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 68
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 69
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 70
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 71
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 72
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 73
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 74
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 75
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 76
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 77
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 78
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 79
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 80
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 81
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 82
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 83
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 84
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 85
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 86
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 87
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 88
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 89
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 90
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 91
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 92
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 93
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 94
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 95
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 96
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 97
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 98
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 99
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 100
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 101
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 102
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 103
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 104
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 105
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 106
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 107
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 108
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 109
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 110
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 111
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 112
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 113
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 114
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 115
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 116
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 117
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 118
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 119
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 120
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 121
    { title: "", connection: "", meaning: "", note: "", examples: [] }, // 122
    { title: "", connection: "", meaning: "", note: "", examples: [] }  // 123

];
