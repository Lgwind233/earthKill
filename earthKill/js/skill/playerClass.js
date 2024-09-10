//# sourceURL=core/skill/playerClass.js
/**
 * 玩家对象
 */
$skill.playerClass = function() {};

/**
 * 获取房间对象
 */
$skill.playerClass.prototype.room = function() {
	return $game.$room;
};

/**
 * 获取所有玩家
 */
$skill.playerClass.prototype.players = function() {
	return $game.$player;
};

/**
 * 从摸牌堆摸牌
 * @param {Object} num 摸牌数
 */
$skill.playerClass.prototype.getCards = function(num=1){
	let cards=[];
	for(let first=0; first<num; first++) {
		//从摸牌堆中取出
		let card = this.room().cardPileGet.pop();
		if(card==null) {
			//更新摸牌堆
			this.room().updateCardPileGet();
			card = this.room().cardPileGet.pop();
		}
		if(card!=null) {
			cards.push($card.getById(card));
			//添加到手牌中
			this.cardAreaHand.push(card);
		}
	}
	$msg.add(`${this.cName}摸了${num}张牌`);
	//播放动画
	if(cards.length>0) this.room().getCard(cards);
	return cards;
};

/**
 * 根据点数/花色/名称/类型 从摸牌堆获取牌
 * @param {Object} num
 */
$skill.playerClass.prototype.getCardByMsg = function(...msgArray) {
	if(msgArray.length==1 && msgArray[0] instanceof Array) {
		msgArray = msgArray[0];
	}
	let cards=[];
	msgArray.forEach(msg=>{	
		let cardPile = this.room().cardPileGet;
		for(let first=cardPile.length-1; first>=0; first--) {
			let tempCard = cardPile[first];
			let tempCardObj = $card.getById(tempCard);
			if(tempCardObj.suit==msg 
				|| tempCardObj.num==msg
				|| tempCardObj.color==msg
				|| tempCardObj.name==msg 
				|| tempCardObj.type.startsWith(msg)) {
				cards.push(tempCardObj);
				this.cardAreaHand.push(tempCard);
				cardPile.splice(first,1);
				break;
			}
		}
	});
	if(cards.length>0) {
		//播放动画
		this.room().getCard(cards);		
		$msg.add(`${this.cName}从摸牌堆获得${cards.length}张牌`);
	}
	return cards;
};

/**
 * 根据点数/花色/名称/类型 从摸牌堆获取牌
 * @param {Object} num
 */
$skill.playerClass.prototype.getDiscardByMsg = function(...msgArray) {
	let cards=[];
	msgArray.forEach(msg=>{
		let cardPile = this.room().cardPileLose;
		for(let first=cardPile.length-1; first>=0; first--) {
			let tempCard = cardPile[first];
			let tempCardObj = $card.getById(tempCard);
			if(tempCardObj.suit==msg 
				|| tempCardObj.num==msg
				|| tempCardObj.color==msg
				|| tempCardObj.name==msg 
				|| tempCardObj.type.startsWith(msg)) {
				cards.push(tempCardObj);
				this.cardAreaHand.push(tempCard);
				cardPile.splice(first,1);
				break;
			}
		}
	});
	if(cards.length>0) {
		//播放动画
		this.room().getCard(cards);		
		$msg.add(`${this.cName}从摸牌堆获得${cards.length}张牌`);
	}
	return cards;
};

/**
 * 判断手牌区是否有某种牌
 */
$skill.playerClass.prototype.hasCard = function(cardName) {
	let has = false;
	this.cardAreaHand.forEach(id=>{
		let card = $card.getById(id);
		if(card.name == cardName || card.type.startsWith(cardName)) {
			has = true;
		}
	});
	return has;
};

/**
 * 判断手牌区是否有某种牌
 */
$skill.playerClass.prototype.hasEquipCard = function(cardName) {
	let has = false;
	this.cardAreaEquip.forEach(id=>{
		let card = $card.getById(id);
		if(card.name == cardName || card.type.startsWith(cardName)) {
			has = true;
		}
	});
	return has;
};

/**
 * 获取所有手牌
 */
$skill.playerClass.prototype.getHandCards = function() {
	let cards = [];
	this.cardAreaHand.forEach(id=>{
		let card = $card.getById(id);
		cards.push(card);
	});
	return cards;
};

/**
 * 判断装备区是否有某种牌
 * @param {Object} cardName
 */
$skill.playerClass.prototype.hasCardInEquipArea = function(cardName) {
	let has = false;
	this.cardAreaEquip.forEach(id=>{
		let card = $card.getById(id);
		if(card.name == cardName || card.type.startsWith(cardName)) {
			has = true;
		}
	});
	return has;
};

/**
 * 随机获取一张手牌
 */
$skill.playerClass.prototype.getRandomHandCard = function() {
	let length = this.cardAreaHand.length;
	let randomNum = parseInt(Math.random()*length);
	let id = this.cardAreaHand[randomNum];	
	return $card.getById(id);
};

/**
 * 随机获取一张装备区的牌
 */
$skill.playerClass.prototype.getRandomEquipCard = function() {
	let length = this.cardAreaEquip.length;
	let randomNum = parseInt(Math.random()*length);
	let id = this.cardAreaEquip[randomNum];	
	return $card.getById(id);
};

/**
 * 将装备区所有牌扔进弃牌堆
 * @param {Object} cardId
 */
$skill.playerClass.prototype.loseAllEquipCard = function() {
	let loseCardNum = this.cardAreaEquip.length;
	$game.exe(()=>{
		if(this.cardAreaEquip.length>0) {				
			let cardMsg = "，";
			this.cardAreaEquip.forEach((cardId,index)=>{
				if(index!=0) {
					cardMsg+="、";
				}
				let card = $card.getById(cardId);
				cardMsg+=`【${card.name}${card.suit}${card.num}】`;
			});
			$msg.add(`${this.cName}弃置${this.cardAreaEquip.length}张装备区的牌${cardMsg}`);
		}
		//在弃牌堆中添加
		this.room().cardPileLose.push(...this.cardAreaEquip);
		//播放动画
		this.room().loseEquipCard(this.cardAreaEquip, this.name);
		//从装备区中移除
		this.cardAreaEquip=[];
	}, "first");
	return loseCardNum;
};

/**
 * 将所有手牌扔进弃牌堆
 * @param {Object} cardId
 */
$skill.playerClass.prototype.loseAllHandCard = function() {
	let loseCardNum = this.cardAreaHand.length;
	$game.exe(()=>{
		if(this.cardAreaHand.length>0) {			
			let cardMsg = "，";
			this.cardAreaHand.forEach((cardId,index)=>{
				if(index!=0) {
					cardMsg+="、";
				}
				let card = $card.getById(cardId);
				cardMsg+=`【${card.name}${card.suit}${card.num}】`;
			});
			$msg.add(`${this.cName}弃置${this.cardAreaHand.length}张手牌${cardMsg}`);
		}
		//在弃牌堆中添加
		this.room().cardPileLose.push(...this.cardAreaHand);
		//从手牌中移除
		this.cardAreaHand=[];
	}, "first");
	$game.exe(()=>{
		//播放动画
		this.room().loseCard(this.cardAreaHand);
	}, "first");
	return loseCardNum;
};

/**
 * 装备卡牌
 * @param {Object} cardId
 */
$skill.playerClass.prototype.equipCard = function(cardId) {
	let length = this.cardAreaHand.length;
	let addCard = $card.getById(cardId);
	for(let first=length-1; first>=0; first--) {
		let handCandId = this.cardAreaHand[first];
		if(cardId==handCandId) {
			//播放动画
			this.room().equipCard(cardId, this.name);
			$game.exe(()=>{
				//从手牌中移除
				this.cardAreaHand.splice(first,1);
				//判断装备区中是否有同类型的牌
				this.cardAreaEquip.forEach((eCardNum,eIndex)=>{
					let eCard =  $card.getById(eCardNum);
					if(addCard.type == eCard.type) {
						//从装备区中移除
						this.cardAreaEquip.splice(eIndex,1);
						//在弃牌堆中添加
						this.room().cardPileLose.push(eCardNum);
						//播放动画
						this.room().loseEquipCard(eCardNum, this.name);	
					}
				});
				//在装备区中添加
				this.cardAreaEquip.push(cardId);
			}, "first");
			break;
		}
	}
	return this;
};

/**
 * 将手牌扔进弃牌堆
 * @param {Object} cardId
 */
$skill.playerClass.prototype.loseHandCard = function(cardId, type='弃置') {
	let length = this.cardAreaHand.length;
	for(let first=length-1; first>=0; first--) {
		let handCandId = this.cardAreaHand[first];
		if(cardId==handCandId) {
			//播放动画
			this.room().loseCard(cardId);
			$game.exe(()=>{
				//从手牌中移除
				this.cardAreaHand.splice(first,1);
				//在弃牌堆中添加
				this.room().cardPileLose.push(cardId);
			}, "first");
			if(type=="弃置") {
				let card = $card.getById(cardId);
				$msg.add(`${this.cName}弃置一张手牌，【${card.name}${card.suit}${card.num}】`);
			}
			break;
		}
	}
	return this;
};

/**
 * 将多张手牌扔进弃牌堆
 * @param {Object} cardId
 */
$skill.playerClass.prototype.loseHandCards = function(cardIdArray) {
	if(cardIdArray.length>0) {
		if(typeof cardIdArray[0]=="object") {
			cardIdArray = cardIdArray["ids"];
		}
	}
	let length = this.cardAreaHand.length;
	for(let first=length-1; first>=0; first--) {
		let handCandId = this.cardAreaHand[first];
		if(cardIdArray.includes(handCandId)) {
			//播放动画
			this.room().loseCard(handCandId);
		}
	}	
	$game.exe(()=>{
		//从手牌中移除
		for(let first=length-1; first>=0; first--) {
			let handCandId = this.cardAreaHand[first];
			if(cardIdArray.includes(handCandId)) {
				this.cardAreaHand.splice(first,1);
			}
		}
		//在弃牌堆中添加
		this.room().cardPileLose.push(...cardIdArray);
		if(cardIdArray.length>0) {
			let cardMsg = "，";
			cardIdArray.forEach((cardId,index)=>{
				if(index!=0) {
					cardMsg+="、";
				}
				let card = $card.getById(cardId);
				cardMsg+=`【${card.name}${card.suit}${card.num}】`;
			});			
			$msg.add(`${this.cName}弃置${cardIdArray.length}张手牌${cardMsg}`);
		}
	}, "first");
	return this;
};

/**
 * 将装备区的一张牌扔进弃牌堆
 * @param {Object} cardId
 */
$skill.playerClass.prototype.loseEquipCard = function(cardId, type='弃置') {
	let length = this.cardAreaEquip.length;
	for(let first=length-1; first>=0; first--) {
		let handCandId = this.cardAreaEquip[first];
		if(cardId==handCandId) {
			//从装备区中移除
			this.cardAreaEquip.splice(first,1);
			//在弃牌堆中添加
			this.room().cardPileLose.push(cardId);
			//播放动画
			this.room().loseEquipCard(cardId, this.name);
			if(type=="弃置") {
				let card = $card.getById(cardId);
				$msg.add(`${this.cName}弃置一张装备牌，【${card.name}${card.suit}${card.num}】`);
			}
			break;
		}
	}
	return this;
};

/**
 * 将手牌移动到其他角色的手牌中
 * @param {Object} cardId
 */
$skill.playerClass.prototype.loseHandCardToPlayer = function(cardId, newPlayer) {
	let length = this.cardAreaHand.length;
	for(let first=length-1; first>=0; first--) {
		let handCandId = this.cardAreaHand[first];
		if(cardId==handCandId) {
			//播放动画
			this.room().moveCard(cardId, newPlayer.name);
			$game.exe(()=>{
				//从手牌中移除
				this.cardAreaHand.splice(first,1);
				//在新角色的手牌堆中添加
				newPlayer.cardAreaHand.push(cardId);
			}, "first");
			$msg.add(`${newPlayer.cName}获得${this.cName}的一张手牌`);
			break;
		}
	}
	return this;
};

/**
 * 将装备区的牌移动到其他角色的手牌中
 * @param {Object} cardId
 */
$skill.playerClass.prototype.loseEquipCardToPlayer = function(cardId, newPlayer) {
	let length = this.cardAreaEquip.length;
	for(let first=length-1; first>=0; first--) {
		let handCandId = this.cardAreaEquip[first];
		if(cardId==handCandId) {
			//从装备区中移除
			this.cardAreaEquip.splice(first,1);
			//在新角色的手牌堆中添加
			newPlayer.cardAreaHand.push(cardId);
			//播放动画
			this.room().moveEquipCard(cardId, this.name);
			$msg.add(`${newPlayer.cName}获得${this.cName}的装备区的一张牌`);
			break;
		}
	}
	return this;
};
/**
 * 获取所有存活角色
 */
$skill.playerClass.prototype.getAllLivePlayer = function() {
	let first=[], second = [], pushFirst=false;
	this.players().forEach(player=>{
		if(player.name==this.room().currentRoundPlayer) {
			pushFirst=true;
		}
		if(player.death==false){
			if(pushFirst) {
				first.push(player);
			}else{
				second.push(player);
			}
		}
	});
	first.push(...second);
	return first;
};

/**
 * 获取所有与你势力不同的存活角色
 */
$skill.playerClass.prototype.getAllLiveNoSelfPlayer = function() {
	let first=[], second = [], pushFirst=false;
	this.players().forEach(player=>{
		if(player.name==this.room().currentRoundPlayer) {
			pushFirst=true;
		}
		if(player.death==false && player.kingdom != this.kingdom){
			if(pushFirst) {
				first.push(player);
			}else{
				second.push(player);
			}
		}
	});
	first.push(...second);
	return first;
};

/**
 * 获取所有与你势力相同的存活角色
 */
$skill.playerClass.prototype.getAllLiveSelfPlayer = function() {
	let first=[], second = [], pushFirst=false;
	this.players().forEach(player=>{
		if(player.name==this.room().currentRoundPlayer) {
			pushFirst=true;
		}
		if(player.death==false && player.kingdom == this.kingdom){
			if(pushFirst) {
				first.push(player);
			}else{
				second.push(player);
			}
		}
	});
	first.push(...second);
	return first;
};

/**
 * 获取下家角色
 */
$skill.playerClass.prototype.getNextLivePlayer = function() {
	let nextPlayer=null, firstPlayer=null; addNext=false;
	this.players().forEach(player=>{
		if(player.death==false){
			//记录第一个存活角色
			if(firstPlayer==null) {
				firstPlayer=player;
			}
			if(addNext && nextPlayer==null) {
				nextPlayer=player;
			}
		}
		//找到自己的位置
		if(player.name==this.name) {
			addNext=true;
		}
	});
	return nextPlayer==null?firstPlayer:nextPlayer;
};

/**
 * 增加体力上限
 */
$skill.playerClass.prototype.addBloodMax = function(extendedData, num) {
	if(num!=null) extendedData.addBloodMAX=num;
	//执行后续
	$skill.trigger(`增加体力上限时后续`, this.name, extendedData);
	//增加体力上限时
	$skill.trigger(`增加体力上限时`, this.name, extendedData);
};

/**
 * 回复体力
 * @param {Object} extendedData
 * @param {Object} num
 */
$skill.playerClass.prototype.addBlood = function(extendedData, num) {
	return this.recover(extendedData, num);
};

/**
 * 回复体力
 * @param {Object} extendedData
 * @param {Object} num
 */
$skill.playerClass.prototype.recover = function(extendedData, num) {
	if(num!=null) extendedData.recoverNum=num;
	//执行后续
	$skill.trigger(`回复体力时后续`, this.name, extendedData);
	//回复体力时
	$skill.trigger(`回复体力时`, this.name, extendedData);
	return this;
};


/**
 * 旋转特效
 */
$skill.playerClass.prototype.rotate = function(time=233, angle=360, back=true) {
	let rotate = $(`.player_${this.name}`);
	rotate.find(".skin").css({
	    "transform": `rotate(${angle}deg)`,
	    "transition":`transform ${time/1000}s`,
	});
	setTimeout(()=>{
		if(!back) time=0;
		rotate.find(".skin").css({
	    	"transform": ``,
		    "transition":`transform ${time/1000}s`,
		});
	}, time);
};

/**
 * 伤害震动特效
 */
$skill.playerClass.prototype.shake = function() {
	let shakeObj = $(`.player_${this.name}`);
	shakeObj.css({
    	"transform": `translate(-5px, 5px)`,
	    "transition":`transform 0.233s`,
	});	
	shakeObj.find(".handArea").css({
    	"transform": `translate(5px, -5px)`,
	    "transition":`transform 0.233s`,
	});
	setTimeout(()=>{
		shakeObj.css({
	    	"transform": ``,
		    "transition":`transform 0.233s`,
		});
		shakeObj.find(".handArea").css({
	    	"transform": ``,
		    "transition":`transform 0.233s`,
		});
	}, 233);
};

/**
 * 显示伤害数字
 * @param {Object} num
 */
$skill.playerClass.prototype.showHarmNum = function(num=-1) {
	let obj = $(`<div class='pdiv beharm' >${num}</div>`);
	$(`.player_${this.name}`).append(obj);
	setTimeout(()=>{
		obj.css({
	    	"transform": `translate(0px, -40px)`,
		    "transition":`transform 0.666s`,
		});
	},10);
	setTimeout(()=>{
		obj.remove();
	},666);
};

/**
 * 受到伤害
 * @param {Object} extendedData
 * @param {Object} num
 * @param {Object} type
 */
$skill.playerClass.prototype.beHarm = function(extendedData, num, type) {
	if(num!=null) extendedData.doHarmNum=num;
	if(type!=null) extendedData.doHarmType=type;
	//执行后续
	$skill.trigger(`受到伤害时后续`, this.name, extendedData);
	//执行防具减伤
	$skill.trigger(`受到伤害时防具减伤`, this.name, extendedData);
	//执行武器加伤
	$skill.trigger(`受到伤害时武器加伤`, this.name, extendedData);
	//受到伤害时
	$skill.trigger(`受到伤害时`, this.name, extendedData);
	return this;
};

/**
 * 点击按钮
 * @param {Object} btnName
 */
$skill.playerClass.prototype.click = function(btnName) {
	return this;
};

/**
 * 获取手牌上限
 */
$skill.playerClass.prototype.getHandCardMax = function() {
	let bloodNum = this.blood>0?this.blood:0;
	if(this.hasCardInEquipArea("装备-坐骑")) {
		return bloodNum+7;
	}
	return bloodNum;
};

/**
 * 濒死状态
 * @param {Object} extendedData
 * @param {Object} forceDie
 */
$skill.playerClass.prototype.nearDie = function(extendedData, forceDie) {
	if(this.blood<=0 || forceDie) {
		$skill.trigger(`濒死状态时后续`, this.name, extendedData);
		$skill.trigger(`濒死状态时`, this.name, extendedData);
	}
};

/**
 * 死亡
 */
$skill.playerClass.prototype.die = function(extendedData, forceDie) {
	//体力小于0时死亡，或者强制死亡
	if(this.blood<=0 || forceDie) {
		if(this.nearDeath) this.nearDeath = false;
		this.death=true;
		$msg.add(`${this.cName}死亡`);	
		$voice.play("death-"+this.name);
		$skill.trigger(`游戏结束判定`, this.name, extendedData);
		//弃置所有手牌
		this.loseAllHandCard();
		//弃置所有装备
		this.loseAllEquipCard();
	}
};

/**
 * 响应卡牌
 * @param {Object} card
 */
$skill.playerClass.prototype.responseCard = function(card) {
	//播放声音
	this.room().playVoice(card.name+"-"+this.sex);
	//添加信息
	if(card.suit==null) card.suit="";
	$msg.add(`${this.cName}响应使用【${card.name}${card.suit}${card.num}】`);
	//非虚拟牌
	if(card.id!=null) {
		this.loseHandCard(card.id, '使用');
	}
	$skill.trigger(`响应使用${card.name}时`, this.name, {
		"doPlayer" : this,//伤害来源
		"doCard" : card,//响应卡牌
		"doType" : "响应时",
	});
};

/**
 * 使用卡牌
 * @param {Object} extendedData
 * @param {Object} card
 * @param {Object} targets
 */
$skill.playerClass.prototype.useCard = function(card, targets, playVoice=true, useForSave=false) {
	let targetMsg = "";
	if(targets.length>0) {
		targetMsg+="，目标：";						
		targets.forEach((target, index)=>{
			if(index!=0) targetMsg+="、";
			targetMsg+=target.cName;
		});
	}
	//触发事件名称
	let triggerName = card.name;
	//声音文件名称
	let voiceName = card.name+"-"+this.sex;
	if(card.type==null) card.type=$card.getTypeByName(card.name);
	if(card.type.startsWith("装备-")) {
		triggerName = "装备牌";
		voiceName = card.type.substring(3);
	}
	//目标反转
	let newTargets = [];
	newTargets.push(...targets);
	newTargets.reverse();
	$game.exe(()=>{
		if(newTargets.length>0) {
			//触发卡牌技能
			newTargets.forEach(target=>{	
				$skill.trigger(`成为${triggerName}的目标后后续`, target.name, {
					"doPlayer" : this,//伤害来源
					"doCard" : card,//伤害卡牌
					"doTargets" : newTargets,//所有目标
					"doType" : "成为目标后后续",
					"useForSave" : useForSave,
				});
				$skill.trigger(`成为${triggerName}的目标后`, target.name, {
					"doPlayer" : this,//伤害来源
					"doCard" : card,//伤害卡牌
					"doTargets" : newTargets,//所有目标
					"doType" : "成为目标后",
					"useForSave" : useForSave,
				});
			});
			$skill.trigger(`使用${triggerName}指定目标后`, this.name, {
				"doPlayer" : this,//伤害来源
				"doCard" : card,//伤害卡牌
				"doTargets" : newTargets,//所有目标
				"doType" : "指定目标时",
				"useForSave" : useForSave,
			});
		}
	});
	//触发卡牌技能
	newTargets.forEach(target=>{	
		this.room().drawLine(this.name, target.name);
		$skill.trigger(`成为${triggerName}的目标时`, target.name, {
			"doPlayer" : this,//伤害来源
			"doCard" : card,//伤害卡牌
			"doTargets" : newTargets,//所有目标
			"doType" : "成为目标时",
			"useForSave" : useForSave,
		});
	});
	$skill.trigger(`使用${triggerName}指定目标时`, this.name, {
		"doPlayer" : this,//伤害来源
		"doCard" : card,//伤害卡牌
		"doTargets" : newTargets,//所有目标
		"doType" : "指定目标时",
		"useForSave" : useForSave,
	});
	//添加信息
	if(card.suit==null) card.suit="";
	if(card.num==null) card.num="";
	$msg.add(`${this.cName}使用【${card.name}${card.suit}${card.num}】${targetMsg}`);
	//播放声音
	if(playVoice) this.room().playVoice(voiceName);
	if(!card.type.startsWith("装备-")) {
		//非虚拟牌
		if(card.id!=null) {
			//将使用的牌移动到弃牌堆
			this.loseHandCard(card.id, "使用");
		}
	}
};
