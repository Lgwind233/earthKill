//# sourceURL=core/skill.js
/**
 * 添加技能
 * @param {Object} skill
 */
var $skill = {
	$data: (() => {
		let $dataClass = function(){};
		/**
		 * 遍历对象
		 * @param {Object} func
		 */
		$dataClass.prototype.forEach = function(func) {
			let index = 0;
			for(let key in this) {
				if(this.hasOwnProperty(key)){
					func(this[key], key, index);
					index++;
				}				
			}
		};
		return new $dataClass();
	})(),//所有技能
	$dataTrigger:[],//游戏时触发的技能
};

/**
 * 时机转换器
 * @param {Object} model
 * @param {Object} data
 */
$skill.triggerSet = function(model, data) {
	let newData = [];
	data.forEach(one=>{
		newData.push(model.replace(/#/ig, one));
	});
	return newData;
};

/**
 * 时机转换
 */
$skill.triggerData = {
	//成为牌的目标时
	"成为基本牌杀的目标时" : $skill.triggerSet('成为#的目标时',['杀','雷杀',"火杀"]),
	"成为基本牌的目标时" : $skill.triggerSet('成为#的目标时',['基本牌杀','桃',"酒"]),
	"成为伤害锦囊牌的目标时" : $skill.triggerSet('成为#的目标时',['火攻','决斗','南蛮入侵','万箭齐发','闪电','借刀杀人']),
	"成为非伤害锦囊牌的目标时" : $skill.triggerSet('成为#的目标时',['无中生有','铁索连环','桃园结义','五谷丰登','过河拆桥','顺手牵羊','乐不思蜀','兵粮寸断']),
	'成为锦囊牌的目标时' : $skill.triggerSet('成为#的目标时',['伤害锦囊牌','非伤害锦囊牌']),
	//成为牌的目标后
	"成为基本牌杀的目标后" : $skill.triggerSet('成为#的目标后',['杀','雷杀',"火杀"]),
	"成为基本牌的目标后" : $skill.triggerSet('成为#的目标后',['基本牌杀','桃',"酒"]),
	"成为伤害锦囊牌的目标后" : $skill.triggerSet('成为#的目标后',['火攻','决斗','南蛮入侵','万箭齐发','闪电','借刀杀人']),
	"成为非伤害锦囊牌的目标后" : $skill.triggerSet('成为#的目标后',['无中生有','铁索连环','桃园结义','五谷丰登','过河拆桥','顺手牵羊','乐不思蜀','兵粮寸断']),
	'成为锦囊牌的目标后' : $skill.triggerSet('成为#的目标后',['伤害锦囊牌','非伤害锦囊牌']),
	//使用牌指定目标时
	"使用基本牌杀指定目标时" : $skill.triggerSet('使用#指定目标时',['杀','雷杀',"火杀"]),
	"使用基本牌指定目标时" : $skill.triggerSet('使用#指定目标时',['基本牌杀','桃',"酒"]),
	"使用伤害锦囊牌指定目标时" : $skill.triggerSet('使用#指定目标时',['火攻','决斗',"南蛮入侵","万箭齐发","闪电","借刀杀人"]),
	"使用非伤害锦囊牌指定目标时" : $skill.triggerSet('使用#指定目标时',['无中生有','铁索连环',"桃园结义","五谷丰登","过河拆桥","顺手牵羊","乐不思蜀","兵粮寸断"]),
	"使用锦囊牌指定目标时" : $skill.triggerSet('使用#指定目标时',['伤害锦囊牌','非伤害锦囊牌']),
	"使用牌指定目标时" : $skill.triggerSet('使用#指定目标时',['基本牌','锦囊牌','装备牌']),
	//使用牌指定目标后
	"使用基本牌杀指定目标后" : $skill.triggerSet('使用#指定目标后',['杀','雷杀',"火杀"]),
	"使用基本牌指定目标后" : $skill.triggerSet('使用#指定目标后',['基本牌杀','桃',"酒"]),
	"使用伤害锦囊牌指定目标后" : $skill.triggerSet('使用#指定目标后',['火攻','决斗',"南蛮入侵","万箭齐发","闪电","借刀杀人"]),
	"使用非伤害锦囊牌指定目标后" : $skill.triggerSet('使用#指定目标后',['无中生有','铁索连环',"桃园结义","五谷丰登","过河拆桥","顺手牵羊","乐不思蜀","兵粮寸断"]),
	"使用锦囊牌指定目标后" : $skill.triggerSet('使用#指定目标后',['伤害锦囊牌','非伤害锦囊牌']),
	"使用牌指定目标后" : $skill.triggerSet('使用#指定目标后',['基本牌','锦囊牌','装备牌']),
	//响应使用牌时
	"响应使用基本牌杀时" : ["响应使用杀时","响应使用雷杀时","响应使用火杀时"],
	"响应使用牌时" : ["响应使用基本牌杀时","响应使用闪时","响应使用无懈可击时"],
	//使用牌时
	"使用基本牌杀时" : ["使用基本牌杀指定目标时", "响应使用基本牌杀时"],
	"使用闪时" : ["响应使用闪时"],
	"使用桃时" : ["使用桃指定目标时"],
	"使用酒时" : ["使用酒指定目标时"],
	"使用基本牌时" : ["使用基本牌杀时","使用闪时","使用酒时","使用桃时"],
	"使用伤害锦囊牌时" : ["使用伤害锦囊牌指定目标时"],
	"使用非伤害锦囊牌时" : ["使用非伤害锦囊牌指定目标时", "响应使用无懈可击时"],
	"使用锦囊牌时" : ["使用伤害锦囊牌时", "使用非伤害锦囊牌时"],
	"使用装备牌时" : ["使用装备牌指定目标时"],
	"使用牌时" : ["使用基本牌时", "使用锦囊牌时", "使用装备牌时"],
};

/**
 * 改变时机
 */
$skill.changeTrigger = function(skill) {
	let doChange = false;
	if(skill && skill.trigger) {
		let trigger = [];
		trigger.push(...skill.trigger)
		skill.trigger.forEach(one=>{
			if(this.triggerData[one]) {
				this.triggerData[one].forEach(add=>{
					if(!trigger.includes(add)) {
						trigger.push(add);
						doChange = true;
					}
				});
			}
		});
		//替换原来的触发时机
		skill.trigger = trigger;
	}
	//若已发生改变，则递归实现
	if(doChange) {
		this.changeTrigger(skill);
	}
};

/**
 * 添加技能
 * @param {Object} skill
 */
$skill.add = function(skill) {
	this.$data[skill.name]=skill;
	//时机转化
	this.changeTrigger(skill);
};

/**
 * 技能时机触发器
 * @param {Object} time
 */
$skill.trigger = function(time, exePlayer=$game.$room.currentRoundPlayer, extendedData) {
	this.$dataTrigger.forEach(skill=>{
		//若时机符合，则发动技能
		if(skill.trigger.includes(time)){
			//判断角色拥有该技能，则执行；若改技能是房间技能，同样执行
			if(skill.owner.includes(exePlayer) || skill.owner.includes("room")){
				//主动技能不直接触发
				if(skill.initiative) {
					//允许点击主动技能
					
				}else{
					//缓存技能时机
					skill.$triggerTime=time;
					//执行技能
					this.exeStr(skill, exePlayer, extendedData);
				}
			}
		}
	});
};

/**
 * 判断是否能触发技能
 * @param {Object} skill
 */
$skill.judgeTrigger = function(skill) {
	let canExe = true;
	//技能使用次数<=0，不允许发动技能
	["game","turn","round","phase"].forEach(keyword=>{
		if(skill[`$${keyword}$timeTemp`]<=0) {
			canExe = false;
		}
	});
	return canExe;
};

/**
 * 执行技能
 * @param {Object} skill
 * @param {Object} exePlayer
 */
$skill.exeStr = function(skill, exePlayer=$game.$room.currentRoundPlayer, extendedData) {
	//限制技能触发次数
	if(!this.judgeTrigger(skill)) return false;
	//字符串化技能
	if(extendedData==null) {
		$game.exe(`$skill.exe('${skill.name}', '${exePlayer}')`);
	}else {
		let trigger = ()=>{
			this.exe(skill, exePlayer, extendedData);
		};
		//命名
		trigger.skill = skill.name;
		//执行技能
		$game.exe(trigger);
	}
};

/**
 * 执行技能
 * @param {Object} skill
 */
$skill.exe = function(skill, exePlayer=$game.$room.currentRoundPlayer, extendedDataOld) {
	let extendedData = extendedDataOld?extendedDataOld:{};
	//执行准备
	if(this.exeReady(skill, exePlayer, extendedData)) {
		//执行后续
		if(extendedDataOld==null) {
			let skillName = typeof skill=="object"?skill.name:skill;
			$game.exe(`$skill.exeWait('${skillName}','${exePlayer}');`);
		}else{
			//等待执行的函数
			let exe = ()=>{
				this.exeWait(skill, exePlayer, extendedData);
			};
			//命名
			exe.skill = skill.name;
			$game.exe(exe);
		}
	}
};

/**
 * 准备执行
 * @param {Object} skill
 * @param {Object} exePlayer
 */
$skill.exeReady = function(skill, exePlayer, extendedData) {	
	//根据技能名称获取技能
	if(typeof skill == "string") {
		skill = $skill.$data[skill];
	}
	//技能变量
	let players = $game.$player;
	let player = $game.$player[exePlayer];
	let room = $game.$room;
	//死亡角色不执行技能，死亡技能除外
	if(player && player.death && !skill.death) return false;
	//操作人设置为当前技能角色
	room.opPlayer=exePlayer;
	//缓存技能，用于选择操作
	room.$skill=skill;
	//设置默认
	if(skill.card==null) {
		skill.card = ()=>{return false};
	}
	//设置默认
	if(skill.target==null) {
		skill.target = ()=>{return false};
	}
	//是否显示结束阶段按钮
	if(skill.showEndBtn) {
		room.showEndBtn = true;
	}else {
		room.showEndBtn = false;
	}
	//是否等待选择
	let isSelect;
	//事件参数
	let eventParm = {
		player : player,
		room : room,
		players : players,
		extendedData : extendedData,
	};
	if(typeof skill.select=="function") {
		isSelect = skill.select(eventParm);
	}else{
		isSelect = skill.select;
	}
	//扩展数据
	room.$extendedData = extendedData;
	//是否等待选择
	if(isSelect) {
		//显示操作按钮
		room.showSelectBtn = true;
		//暂停运行等待操作
		$game.exe.stop();
		//技能提示信息
		if(skill.title) { 
			if(typeof skill.title == "function") {
				room.skillTitle = skill.title(eventParm); 
			}else{
				room.skillTitle = skill.title;
			}
		}else{
			room.skillTitle = `是否发动技能“${skill.name}”？`
		};
		//执行ai
		setTimeout(()=>{
			$ai.exe(skill, exePlayer, extendedData);
		}, 66);
	}else{
		if(typeof skill.select=="function") {
			//代码中设置点取消
			room.btnName="no";
		}else{
			//默认点确认
			room.btnName="yes";
		}
	}
	return true;
};

/**
 * 等待执行
 * @param {Object} skill
 * @param {Object} exePlayer
 * @param {Object} extendedData
 */
$skill.exeWait = function(skill, exePlayer, extendedData={}) {
	//根据技能名称获取技能
	if(typeof skill == "string") {
		skill = $skill.$data[skill];
	}
	//技能变量
	let players = $game.$player;
	let player = $game.$player[exePlayer];
	let room = $game.$room;
	//隐藏操作按钮
	room.showSelectBtn = false;
	//获取已选卡牌
	let cards=room.getSelectCards();
	//获取已选目标
	let targets = room.getSelectTargets();
	//清空选中的牌和目标
	room.selectCard=[];
	room.selectTarget=[];
	//技能消息插入位置
	let addMsgPostion = $msg.getNewPostion();
	//事件参数
	let eventParm = {
		cards : cards,
		targets : targets,
		player : player,
		room : room,
		players : players,
		extendedData : extendedData,
		exe : $game.exe,
	};
	//执行技能效果
	let isUse = skill.effect(eventParm);
	if(isUse===true || isUse===void(0)) {
		if(!skill.owner.includes("room") && room.btnName=="yes"){
			$msg.add(`${player.cName}发动了技能“${skill.name}”`, addMsgPostion);
			$alert.skillMsg(`${player.cName}发动了技能“${skill.name}”`);
			//播放技能声音
			room.playVoice(skill.name);
		}
		//技能使用次数-1
		["game","turn","round","phase"].forEach(keyword=>{
			if(skill[`$${keyword}$timeTemp`]!=null) {
				skill[`$${keyword}$timeTemp`]--;
			}
		});
	}
};

/**
 * 更新技能使用次数
 */
$skill.updateUseTime = function(keyword) {
	this.$dataTrigger.forEach(skill=>{
		//复原变量
		for(let key in skill) {
			if(key && key.startsWith(`$${keyword}$`)) {
				if(!key.includes("Temp")) {
					skill[key+"Temp"] = skill[key];
				}
			}
		}
	});
	$game.$player.forEach(player=>{
		//复原变量
		for(let key in player) {
			if(key && key.startsWith(`$${keyword}$`)) {
				if(!key.includes("Temp")) {
					skill[key+"Temp"] = skill[key];
				}
			}
		}
	});
};