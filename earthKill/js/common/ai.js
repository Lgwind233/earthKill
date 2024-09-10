//# sourceURL=core/common/ai.js

var $ai = {
	$data : {},
};

$(()=>{
	$(".useAI").on("click", function() {
		$game.$room.useAI=!$game.$room.useAI;
		$ai.stopToRun();
	});
	$(".useAISelf").on("click", function() {
		$game.$room.useAISelf=!$game.$room.useAISelf;
		$ai.stopToRun();
	});
});

/**
 * 由停止运行ai过渡到开始运行ai
 */
$ai.stopToRun = function() {
	if(!$game.exe.isRun()) {
		//存储技能
		let tempSkill = $game.$room.$skill;
		//开始允许
		$game.exe.start();
		$game.exe(()=>{
			//停止运行
			$game.exe.stop();
			//恢复技能准备并运行ai
			$skill.exeReady(tempSkill, $game.$room.opPlayer,$game.$room.$extendedData);
		});
		$skill.trigger(`游戏结束判定`,$game.$room.opPlayer,$game.$room.$extendedData);
	}
};

/**
 * 添加技能
 * @param {Object} dataObj
 */
$ai.add = function(dataObj) {
	this.$data[dataObj.name]=dataObj;
};

/**
 * 执行ai
 * @param {Object} skill
 * @param {Object} exePlayer
 * @param {Object} extendedData
 */
$ai.exe = function(skill=$game.$room.$skill, exePlayer=$game.$room.opPlayer, extendedData=$game.$room.$extendedData) {
	exePlayer = $game.$player[exePlayer];
	let run = false;
	if($game.$room.useAI) run = true;
	//主视角使用ai
	if(exePlayer && exePlayer.position == $game.$room.mainView) {
		run = false;
		if($game.$room.useAISelf) run = true;
	}
	if(run)	this.run(skill, exePlayer, extendedData);
};

/**
 * 执行ai
 * @param {Object} skill
 * @param {Object} exePlayer
 * @param {Object} extendedData
 */
$ai.run = function(skill, exePlayer, extendedData) {
	let isExe =false;
	if(this.$data[skill.name]) {
		isExe=true;
		let event = {
			skill : skill,
			exePlayer : exePlayer,
			extendedData : extendedData,
		};
		this.$data[skill.name].exe(this, event);
	}
	if(!isExe) this.click("no");	
}

/**
 * 点击按钮
 * @param {Object} btn
 */
$ai.click = function(btn) {
	setTimeout(()=>{
		if(btn=="yes") {
			$vue.$data.yes();
		}else if(btn=="no") {
			$vue.$data.no();
		}else if(btn=="end") {
			$vue.$data.end();
		}
	});
};

/**
 * 选择手牌
 * @param {Object} name 卡牌名称
 */
$ai.selectHandCard = function(name) {
	let room = $game.$room;
	let players = $game.$player;
	let opPlayer = players[room.opPlayer];
	let card;
	opPlayer.getHandCards().forEach(handCard=>{
		if(handCard.name==name || name=="$first" || handCard.type.startsWith(name) ){
			if(!card) {
				card = handCard;
			}
		}
	});
	if(card) {
		let num = card.id;
		//事件参数
		let eventParm = {
			card : card, 
			selectCards : room.getSelectCards(), 
			selectTargets : room.getSelectTargets(), 
			player : opPlayer,
			room : room,
			players : players,
		};
		//包含则去除
		if(room.$skill.card(eventParm)) {
			//添加
			room.selectCard.push(num);
			return card;
		}else{
			//去除
			room.selectCard.forEach((item,index)=>{
				if(item==num) {
					room.selectCard.splice(index,1);
				}
			});
		}
	}
	return false;
};

/**
 * 选择所有手牌
 */
$ai.selectAllHandCard = function() {
	let room = $game.$room;
	let players = $game.$player;
	let opPlayer = players[room.opPlayer];
	let resultNum = 0;
	opPlayer.getHandCards().forEach(handCard=>{
		let card = handCard;
		if(card) {
			resultNum++;
			let num = card.id;
			//事件参数
			let eventParm = {
				card : card, 
				selectCards : room.getSelectCards(), 
				selectTargets : room.getSelectTargets(), 
				player : opPlayer,
				room : room,
				players : players,
			};
			//包含则去除
			if(room.$skill.card(eventParm)) {
				//添加
				room.selectCard.push(num);
			}else{
				//去除
				room.selectCard.forEach((item,index)=>{
					if(item==num) {
						room.selectCard.splice(index,1);
					}
				});
			}
		}
	});	
	return resultNum;
};

/**
 * 选择敌人
 */
$ai.selectTargetEnemy = function(useCard, func) {
	return this.selectTargetFun((opPlayer, target, room, players)=>{
		//选择角色不相等的，即敌人
		if(!this.roleEqual(opPlayer.role, target.role)) {
			if(typeof func == "function") {
				if(func(opPlayer, target, room, players)) {
					return true;
				}
			}else{
				return true;	
			}
		}
		return false;
	}, useCard);
};

/**
 * 选择有手牌的敌人
 */
$ai.selectTargetEnemyHasHandCard = function(useCard) {
	return this.selectTargetFun((opPlayer, target, room, players)=>{
		//选择角色不相等的，即敌人
		if(!this.roleEqual(opPlayer.role, target.role)) {
			//若目标有手牌
			if(target.cardAreaHand.length>0) {
				return true;
			}
		}
		return false;
	}, useCard);
};

/**
 * 选择有手牌的敌人
 */
$ai.selectTargetEnemyHasCard = function(useCard) {
	return this.selectTargetFun((opPlayer, target, room, players)=>{
		//选择角色不相等的，即敌人
		if(!this.roleEqual(opPlayer.role, target.role)) {
			//若目标有手牌或装备牌
			if(target.cardAreaHand.length>0 || target.cardAreaEquip.length>0) {
				return true;
			}
		}
		return false;
	}, useCard);
};

/**
 * 选择目标角色
 * @param {Object} func
 */
$ai.selectTargetFun = function(func, useCard) {
	let room = $game.$room;
	let players = $game.$player;
	let opPlayer = players[room.opPlayer];
	//选择目标角色、 嘲讽度
	let target, taunt;
	players.forEach(one=>{
		//存活角色
		if(!one.death) {
			if(func(opPlayer, one, room, players)) {
				//临时嘲讽值
				let tempTaunt = this.getTaunt(one, useCard);
				if(!target || taunt<tempTaunt) {
					target = one;
					taunt = tempTaunt;
				}
			}
		}
	});
	if(target) {
		return this.selectTarget(target.name);
	}else{
		return false;
	}
};

/**
 * 选择目标
 */
$ai.selectTarget = function(name) {	
	let room = $game.$room;
	let players = $game.$player;
	let opPlayer = players[room.opPlayer];
	let target = players[name];
	if(target) {
		//事件参数
		let eventParm = {
			target : target, 
			selectCards : room.getSelectCards(), 
			selectTargets : room.getSelectTargets(), 
			player : opPlayer,
			room : room,
			players : players,
		};
		if(room.$skill.target(eventParm)) {
			//添加
			room.selectTarget.push(target.name);
		}else{
			//去除
			room.selectTarget.forEach((item,index)=>{
				if(item==target.name) {
					room.selectTarget.splice(index,1);
				}
			});
		}
		return target;
	}
	return false;
};

/**
 * 获取角色嘲讽
 * @param {Object} target
 */
$ai.getTaunt = function(target, useCard={}) {
	let num = 100;
	num -= target.cardAreaEquip.length;
	num -= target.cardAreaHand.length;
	num -= target.blood;
	if(useCard.name=="兵粮寸断") {
		//兵粮寸断对手牌越多的角色嘲讽越大
		num += target.cardAreaHand.length*5;
	}else if(useCard.name=="杀") {
		//普通杀对装备区有防具牌的角色嘲讽降低
		if(target.hasEquipCard("装备-防具")) {
			num -= 20;
		}
	}
	target.$skill.forEach(skill=>{
		if(skill.taunt) {
			let sub = skill.taunt[useCard.name];
			if(!sub) {
				sub = skill.taunt[useCard.type];
			}
			if(!sub) {
				sub = skill.taunt["默认"];
			}
			if(sub) {
				num += sub;
			}
		}
	});
	return num;
};

/**
 * 判断是否强制使用卡牌
 * @param {Object} target
 * @param {Object} useCard
 */
$ai.getForceUse = function(target, useCard={}) {
	let use = false;
	target.$skill.forEach(skill=>{
		if(skill.forceUse) {			
			if(skill.forceUse.includes(useCard.name) || skill.forceUse.includes(useCard.type)) {
				use = true;
			}
		}
	});
	return use;
};

/**
 * 判断目标角色是否相同
 * @param {Object} role
 * @param {Object} role2
 */
$ai.roleEqual = function(role, role2) {	
	if(role==role2) {
		return true;
	}else {
		let model = {
			"主公" : "忠臣",
//			"内奸" : "忠臣",
			"忠臣" : "忠臣",
		};
		role = model[role]?model[role]:role;
		role2 = model[role2]?model[role2]:role2;
		if(role==role2) {
			return true;
		}
	}
	return false;
};
