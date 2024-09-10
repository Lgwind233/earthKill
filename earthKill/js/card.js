//# sourceURL=core/card.js

var $card = {
	$data : [],
};

setTimeout(()=>{
	$card.init();
});

/**
 * 初始化默认卡牌
 */
$card.init = function() {
	let cardData = {
		"A" : {
			"♦" : ["决斗", "诸葛连弩", "朱雀羽扇"],
			"♣" : ["决斗", "诸葛连弩", "白银狮子"],
			"♥" : ["桃园结义","万箭齐发", "无懈可击"],
			"♠" : ["决斗", "闪电", "古锭刀"],
		},
		"2" : {
			"♦" : ["闪", "闪", "桃"],
			"♣" : ["杀", "八卦阵", "藤甲", "仁王盾"],       //EX仁王盾
			"♥" : ["闪", "闪", "火攻"],
			"♠" : ["八卦阵", "雌雄双股剑", "藤甲", "寒冰剑"],//EX寒冰剑
		},
		"3" : {
			"♦" : ["闪", "桃", "顺手牵羊"],
			"♣" : ["杀", "酒", "过河拆桥"],
			"♥" : ["五谷丰登", "桃", "火攻"],	
			"♠" : ["顺手牵羊", "酒", "过河拆桥"],
		},
		"4" : {
			"♦" : ["火杀", "闪", "顺手牵羊"],	
			"♣" : ["杀", "兵粮寸断", "过河拆桥"],
			"♥" : ["桃", "火杀", "五谷丰登"],	
			"♠" : ["顺手牵羊", "雷杀", "过河拆桥"],
		},
		"5" : {
			"♦" : ["火杀", "闪", "贯石斧", "木牛流马"],//宝物 木牛流马
			"♣" : ["杀", "雷杀", "的卢"],
			"♥" : ["赤兔", "桃", "麒麟弓"],
			"♠" : ["绝影", "雷杀", "青龙偃月刀"],
		},
		"6" : {
			"♦" : ["杀", "闪", "闪"],
			"♣" : ["杀", "雷杀", "乐不思蜀"],
			"♥" : ["桃", "桃", "乐不思蜀"],
			"♠" : ["乐不思蜀", "雷杀", "青釭剑"],
		},
		"7" : {
			"♦" : ["杀", "闪", "闪"],
			"♣" : ["杀", "雷杀", "南蛮入侵"],
			"♥" : ["桃", "火杀", "无中生有"],
			"♠" : ["雷杀", "杀", "南蛮入侵"],
		},
		"8" : {
			"♦" : ["杀", "闪", "闪"],
			"♣" : ["杀", "杀", "雷杀"],
			"♥" : ["桃", "闪", "无中生有"],
			"♠" : ["杀", "杀", "雷杀"],
		},
		"9" : {
			"♦" : ["杀", "闪", "酒"],
			"♣" : ["杀", "杀", "酒"],
			"♥" : ["桃", "闪", "无中生有"],
			"♠" : ["杀", "杀", "酒"],
		},
		"10" : {
			"♦" : ["杀", "闪", "闪"],
			"♣" : ["杀", "杀", "铁索连环"],
			"♥" : ["杀", "杀", "火杀"],
			"♠" : ["杀", "杀", "兵粮寸断"],
		},
		"J" : {
			"♦" : ["闪", "闪", "闪"],
			"♣" : ["杀", "杀", "铁索连环"],
			"♥" : ["闪", "杀", "无中生有"],
			"♠" : ["铁索连环", "顺手牵羊", "无懈可击"],
		},
		"Q" : {
			"♦" : ["桃", "火攻", "方天画戟", "无懈可击"],//EX无懈可击
			"♣" : ["借刀杀人", "铁索连环", "无懈可击"],
			"♥" : ["桃", "闪", "过河拆桥", "闪电"],     //EX闪电
			"♠" : ["过河拆桥", "铁索连环", "丈八蛇矛"],
		},
		"K" : {
			"♦" : ["杀", "骅骝", "紫骍"],
			"♣" : ["借刀杀人", "铁索连环", "无懈可击"],
			"♥" : ["无懈可击", "闪", "爪黄飞电"],
			"♠" : ["南蛮入侵", "无懈可击", "大宛"],
		},
	};
	for(let num in cardData) {
		let suitData = cardData[num];
		for(let suit in suitData) {
			suitData[suit].forEach(name=>{
				this.add(name, suit, num);
			});
		}		
	}
};

/**
 * 添加卡牌
 * @param {Object} card
 */
$card.add = function(name, suit, num) {
	let card = {
		//卡牌id
		"id" : this.$data.length,
		//卡牌花色
		'suit': suit,
		//卡牌数字
		'num' : num,
		//卡牌名称
		'name' : name,
	};
	//卡牌颜色
	card.color = {
		"♦" : "红色",
		"♥" : "红色",
		"♣" : "黑色",
		"♠" : "黑色",
	}[card.suit];
	//卡牌类型
	card.type = this.getTypeByName(card.name);
	//卡牌描述
	card.desc = this.getDescByName(card),
	//设置代理阻止修改对象
	this.$data.push(new Proxy(card,{
		get : function(target, key) {
			return target[key];
		},
		set : function(target, key, value) {
			let canUpdate=true;
			//设置不可修改的属性
			['id','suit','num','color','name','type','desc'].forEach(strKey=>{
				if(strKey==key) {
					console.error("不可修改："+key+"="+value);
					canUpdate=false;
				}
			});
			canUpdate?target[key]=value:null;
		},
	}));
};

/**
 * 根据卡牌名称获取卡牌类型
 * @param {Object} cardName
 */
$card.getTypeByName = function(cardName) {
	let type = {
		"基本" : {
			"杀" : ["杀", "雷杀", "火杀",],
			"闪" : ["闪",],
			"酒" : ["酒",],
			"桃" : ["桃",],
		},
		"锦囊" : {
			"伤害" : ["南蛮入侵", "万箭齐发", , "决斗", "火攻", "借刀杀人", "闪电",],
			"移牌" : ["无中生有", "铁索连环",  "顺手牵羊", "过河拆桥", "五谷丰登", "兵粮寸断",],
			"特殊" : ["乐不思蜀", "桃园结义", "无懈可击",],
		},
		"装备" : {
			"武器" : [
				"诸葛连弩", 
				"寒冰剑", "雌雄双股剑", "青釭剑", "古锭刀",
				"丈八蛇矛", "青龙偃月刀", "贯石斧", 
				"方天画戟", "朱雀羽扇",
				"麒麟弓",
			],
			"防具" : ["八卦阵", "仁王盾", "藤甲", "白银狮子",],
			"坐骑" : ["绝影", "的卢", "爪黄飞电", "骅骝", "赤兔", "紫骍", "大宛",],         
			"宝物" : ["木牛流马",],
		}
	};
	//封装返回值
	for(var type1 in type) {
		for(var type2 in type[type1]) {
			if(type[type1][type2].includes(cardName)) {
				return type1 + '-' + type2;
			}
		}
	}
};

/**
 * 根据卡牌名称获取卡牌描述
 */
$card.getDescByName = function(card) {
	let killDesc = "\n②当你成为【杀】的目标后，你可以使用此牌，令【杀】对你无效；\n③当你成为【决斗】的目标后，你可以使用此牌，令【决斗】对你无效，然后视为对【决斗】的使用者使用一张【决斗】；\n④当你成为【南蛮入侵】的目标后，你可以使用此牌，令【南蛮入侵】对你无效。";
	let desc = {
		//基本
		"杀" : 	`①出牌阶段，你可以对一名角色使用此牌，对其造成1点伤害；${killDesc}`,
		"火杀" : `①出牌阶段，你可以对一名角色使用此牌，对其造成1点火属性伤害；${killDesc}`,
		"雷杀" : `①出牌阶段，你可以对一名角色使用此牌，对其造成1点雷属性伤害；${killDesc}`,
		"闪" : "①当你成为【杀】的目标后，你可以使用此牌，令【杀】对你无效。\n②当你成为【万箭齐发】的目标后，你可以使用此牌，令【万箭齐发】对你无效。",
		"桃" : "①出牌阶段，你可以使用此牌，令你回复1点体力（若你没有受伤，改为增加1点体力上限）。\n②当一名角色进入濒死状态时，若其势力与你相同，你可以使用此牌，令其回复1点体力。",
		"酒" : "①出牌阶段，你可以使用此牌，对你造成1点伤害。\n②当一名角色进入濒死状态时，若其势力与你相同，你可以使用此牌，令其将体力值回复至1点。",
		//移牌锦囊
		"无中生有" : "出牌阶段，你可以使用此牌，从摸牌堆中获得两张不同颜色的牌。",
		"铁索连环" : "出牌阶段，你可以使用此牌，令你摸一张牌。",
		"过河拆桥" : "出牌阶段，你可以对一名角色使用此牌，随机弃置其一张牌（优先装备区）。",
		"顺手牵羊" : "出牌阶段，你可以对一名角色使用此牌，随机获得其一张牌（优先装备区）。",
		"五谷丰登" : "出牌阶段，你可以使用此牌，令与你势力相同的所有角色各摸一张牌。",
		"兵粮寸断" : "出牌阶段，你可以对一名角色使用此牌，弃置其所有手牌。",
		//伤害锦囊
		"南蛮入侵" : "出牌阶段，你可以使用此牌，对所有角色造成1点伤害。",
		"万箭齐发" : "出牌阶段，你可以使用此牌，对所有角色造成1点伤害。",
		"借刀杀人" : "出牌阶段，你可以对一名角色使用此牌，令其视为对其下家使用一张【杀】。",
		"决斗" : "出牌阶段，你可以对一名角色使用此牌，对其造成1点伤害。",
		"火攻" : "出牌阶段，你可以对一名角色使用此牌，对其造成1点火属性伤害。",
		"闪电" : "出牌阶段，你可以对一名角色使用此牌，对其造成0~3点雷属性随机伤害。",
		//特殊锦囊
		"桃园结义" : "出牌阶段，你可以使用此牌，令与你势力相同的所有角色各回复1点体力。",
		"无懈可击" : "当你成为锦囊牌的目标后，你可以使用此牌，令锦囊牌对你无效。",
		"乐不思蜀" : "出牌阶段，你可以对一名角色使用此牌，将其势力改为与你相同。",
		//装备
		'装备-武器' : "出牌阶段，你可以使用此牌，将此牌置于你的装备区。\n装备技能：\n锁定技，你造成的普通伤害+1（每回合限1次）。",
		'装备-防具' : "出牌阶段，你可以使用此牌，将此牌置于你的装备区。\n装备技能：\n锁定技，你受到的普通伤害-1。",
		'装备-坐骑' : "出牌阶段，你可以使用此牌，将此牌置于你的装备区。\n装备技能：\n锁定技，你的手牌上限+7。",
		'装备-宝物' : "出牌阶段，你可以使用此牌，将此牌置于你的装备区。\n装备技能：\n锁定技，摸牌阶段，你多摸一张牌。",
	};
	let result = desc[card.name];
	if(result==null) result = desc[card.type];
	if(result==null) result = "无";
	return "【"+card.name+"】"+card.suit+card.num+"   "+"序号："+card.id+"\n"+result;
};

/**
 * 根据id获取卡牌
 * @param {Object} id
 */
$card.getById = function(id) {
	return this.$data[id];
};

/**
 * 获取所有卡牌
 */
$card.getAll = function() {
	return this.$data;
};
