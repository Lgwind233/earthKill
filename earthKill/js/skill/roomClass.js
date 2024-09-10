//# sourceURL=core/skill/roomClass.js
/**
 * 房间对象
 */
$skill.roomClass = function() {};

/**
 * 获取所有卡牌
 */
$skill.roomClass.prototype.getAllCards = function() {
	return $card.getAll();
};

/**
 * 播放声音
 * @param {Object} voiceName
 */
$skill.roomClass.prototype.playVoice = function(voiceName) {
	$voice.play(voiceName);
	return this;
};

/**
 * 执行技能
 * @param {Object} func
 */
$skill.roomClass.prototype.exeSkill = function(skill, exePlayer, extendedData) {
	$skill.exeStr(skill, exePlayer, extendedData);
	return this;
};

/**
 * 睡眠时间
 * @param {Object} num
 */
$skill.roomClass.prototype.sleep = function(num) {
	$game.exe.sleep(num);
	return this;
};

/**
 * 停止游戏
 * @param {Object} skill
 * @param {Object} pName
 * @param {Object} extendedData
 */
$skill.roomClass.prototype.stop = function() {
	$game.exe.stop();
	return this;
};

/**
 * 更新摸牌堆
 * @param {Object} init 是否初始化牌堆
 */
$skill.roomClass.prototype.updateCardPileGet = function(init){
	//若为初始化，则创建牌堆，否则把弃牌堆的牌放进摸牌堆
	if(init) {
		//所有卡牌添加进摸牌堆
		this.getAllCards().forEach(card=>{
		    this.cardPileGet.push(card.id);
		});
		//打乱排序
		shuffle(this.cardPileGet);
	}else{
		//打乱排序
		shuffle(this.cardPileLose);
		//将弃牌堆的牌放进摸牌堆
		while(this.cardPileLose.length>0) {
			this.cardPileGet.push(this.cardPileLose.pop());
		}
		//洗牌次数加1
		this.shuffleCardNum++;
	}
	/**
	 * 打乱排序
	 * @param {Object} arr
	 */
	function shuffle(arr) {
		let length = arr.length;
		for(let first=0; first<length; first++) {
			let random = Math.floor(Math.random()*length);
			let temp = arr[random];
			arr[random] = arr[first];
			arr[first] = temp;
		}
	}
};

/**
 * 判断是否点击确定按钮
 */
$skill.roomClass.prototype.getBtn = function() {
	return this.btnName;
};

/**
 * 获取所有选牌
 */
$skill.roomClass.prototype.getSelectCards = function(){
	let cards = [], ids=[];
	this.selectCard.forEach(cardNum=>{
		ids.push(cardNum);
		cards.push($card.getById(cardNum));
	});
	return new Proxy(cards,{
		get : function(target, key) {
			if(key=="ids") {
				return ids;
			}
			return target[key];
		},
		set : (target, key, value) => {
			if(key=='length') {
				this.selectCard.length=value;
			}
			target[key]=value;
			return true;
		},
	});
};

/**
 * 获取所有选牌
 */
$skill.roomClass.prototype.getSelectTargets = function(){
	let targets = [];
	this.selectTarget.forEach(targetName=>{
		targets.push($game.$player[targetName]);
	});
	return new Proxy(targets,{
		get : function(target, key) {
			return target[key];
		},
		set : (target, key, value) => {
			if(key=='length') {
				this.selectTarget.length=value;
			}
			target[key]=value;
			return true;
		},
	});
};


/*************************************
 *        以下是卡牌移动操作                     *
 *************************************/

/**
 * 获得卡牌（将手牌设置在摸牌堆位置，然后移回原位）
 * @param {Object} cards
 */
$skill.roomClass.prototype.getCard = function(cards) {
	if(cards instanceof Array) {			
	}else{
		cards = [cards];
	}
	//加透明样式防止暴露原元素
	let hideStyleStr = "";
	cards.forEach(card=>{
		if(typeof card=="object") card = card.id;
		hideStyleStr+=`.player .card${card}{opacity: 0} `;
	});
	let hideStyle = $(`<style>${hideStyleStr}</style>`);
	$("body").append(hideStyle);
	setTimeout(()=>{
		cards.forEach(card=>{
			if(typeof card=="object") card = card.id;
			//获取弃牌堆位置
			let discardPile = $move.getElemData($(".room .handArea")[0], false);
			//获取弃牌堆卡牌数量
			let discardPileLength = $(".room .handArea .card").length;
			let p = {
				left: discardPile.right,
				top : discardPile.top,
			}
			//横屏处理
			if($move.$landscape) {
				p.left = discardPile.left;
				p.top = discardPile.bottom;
			}
			$move(".card"+card).set(p.left,p.top).moveOld().beforeCall(move=>{
				//隐藏当前元素
				$(move._elem).hide();
			}).call(move=>{
				hideStyle.remove();
				//显示当前元素
				$(move._elem).show();
			});
		});		
	});	
};

/**
 * 装备卡牌（将手牌从手牌区移动到装备区位置）
 * @param {Object} cards
 */
$skill.roomClass.prototype.equipCard = function(cards, playerName) {
	setTimeout(()=>{
		if(cards instanceof Array) {			
		}else{
			cards = [cards];
		}
		cards.forEach(card=>{
			if(typeof card=="object") card = card.id;
			//玩家位置
			let pp = $move.getElemData($$(".player_"+playerName)[0]);
			let p = {
				left : pp.left,
				top : pp.top+60,
			};
			//横屏处理
			if($move.$landscape) {
				p.top = pp.top;
			}
			$move(".card"+card).go(p.left,p.top).beforeCall(move=>{
				//隐藏当前元素
				$(move._elem).hide();
				//显示卡牌
				$(move.elem).find(".img0").hide();
			});
		});		
	});	
};

/**
 * 失去卡牌（将手牌移动到弃牌堆位置）
 * @param {Object} cards
 */
$skill.roomClass.prototype.loseCard = function(cards) {
	setTimeout(()=>{
		if(cards instanceof Array) {			
		}else{
			cards = [cards];
		}
		cards.forEach(card=>{
			if(typeof card=="object") card = card.id;
			//弃牌堆位置
			let cardObj = $$(".room .card");
			let p;
			//获取弃牌堆位置
			if(cardObj.length>0) {
				let discard = $move.getElemData(cardObj[cardObj.length-1]);
				p = {
					left : discard.left,
					top : discard.top
				};
				if(cardObj.length<7) {
					p.left += 34.475;
				}
				//横屏处理
				if($move.$landscape) {
					p.left = discard.left;
					p.top = discard.top;
					if(cardObj.length<7) {
						p.top += 34.475;
					}
				}
				if(cardObj.length<7) {
					//弃牌堆左移
					$(".room .handArea").css({
				    	"transform": `translate(-34.475px, 0px)`,
					    "transition":`transform 0.666s`,
					});					
				}else {
					//弃牌堆左移
					$(".room .handArea").css({
				    	"transform": `translate(-68.95px, 0px)`,
					    "transition":`transform 0.666s`,
					});
				}
			}else{
				//获取弃牌堆位置
				let discardPile = $move.getElemData($(".room .handArea")[0]);
				p = {
					left: discardPile.right,
					top : discardPile.top,
				};
				//横屏处理
				if($move.$landscape) {
					p.left = discardPile.left;
					p.top = discardPile.bottom;
				}
			}
			$move(".card"+card).go(p.left,p.top).beforeCall(move=>{
				//隐藏当前元素
				$(move._elem).hide();
				//显示卡牌
				$(move.elem).find(".img0").hide();
			});
		});		
	});	
};

/**
 * 失去装备牌（将弃牌堆的装备牌设置到玩家位置再移回原位）
 * @param {Object} cards
 */
$skill.roomClass.prototype.loseEquipCard = function(cards, playerName) {
	let disCardNum = $(".room .handArea .card").length;
	setTimeout(()=>{
		if(cards instanceof Array) {			
		}else{
			cards = [cards];
		}
		cards.forEach(card=>{
			if(typeof card=="object") card = card.id;
			//获取玩家的位置
			let pp = $move.getElemData($$(".player_"+playerName)[0]);
			let p = {
				left : pp.left,
				top : pp.top+60,
			}
			//横屏处理
			if($move.$landscape) {
				p.left = pp.left;
				p.top = pp.top;
			}
			$move(".discard"+card).set(p.left, p.top).moveOld().beforeCall(move=>{
				//隐藏当前元素
				$(move._elem).hide();
			}).call(move=>{
				//显示当前元素
				$(move._elem).show();
			});
		});
		if(disCardNum<7) {
			//弃牌堆左移
			$(".room .handArea").css({
		    	"transform": `translate(34.475px, 0px)`,
			});			
		}else{
			//弃牌堆左移
			$(".room .handArea").css({
		    	"transform": `translate(68.95px, 0px)`,
			});
		}
		setTimeout(()=>{			
			//复原弃牌堆位置
			$(".room .handArea").css({
		    	"transform": ``,
		    	"transition":`transform 0.666s`,
			});
		});
	}, 0);	
};

/**
 * 移动装备牌（将新角色手牌区的装备牌设置在旧角色的位置，然后移回原位）
 * @param {Object} cards
 * @param {Object} newPlayerName
 */
$skill.roomClass.prototype.moveEquipCard = function(cards, playerName) {
	setTimeout(()=>{
		if(cards instanceof Array) {			
		}else{
			cards = [cards];
		}
		cards.forEach(card=>{
			if(typeof card=="object") card = card.id;
			//获取玩家的位置
			let pp = $move.getElemData($$(".player_"+playerName)[0]);
			let p = {
				left : pp.left,
				top : pp.top+60,
			};
			//横屏处理
			if($move.$landscape) {
				p.left = pp.left;
				p.top = pp.top;
			}
			$move(".card"+card).set(p.left, p.top).moveOld().beforeCall(move=>{
				//隐藏当前元素
				$(move._elem).hide();
				//显示元素
				$(move.elem).find(".img0").hide();
			}).call(move=>{
				//显示当前元素
				$(move._elem).show();
			});
		});		
	});	
};

/**
 * 移动卡牌（将手牌移动到新角色的手牌区位置）
 * @param {Object} cards
 */
$skill.roomClass.prototype.moveCard = function(cards, newPlayerName) {
	setTimeout(()=>{
		if(cards instanceof Array) {			
		}else{
			cards = [cards];
		}
		cards.forEach(card=>{
			if(typeof card=="object") card = card.id;
			//新角色手牌区位置
			let cardObj = $(".player_"+newPlayerName+ " .card");
			let p;
			//获取卡牌位置
			if(cardObj.length>0) {
				let pp = $move.getElemData(cardObj[cardObj.length-1]);
				p= {
					left : pp.left,
					top : pp.top,
				};
				if(cardObj.find(".img0").css("display")=="none") {					
					//横屏处理
					if($move.$landscape) {
						p.top += 68.95;
					}else{
						p.left += 68.95;
					}
				}
			}else{
				let pp = $move.getElemData($$(".player_"+newPlayerName+ " .handArea")[0]);
				p= {
					left : pp.left,
					top : pp.top,
				};
			}
			$move(".card"+card).go(p.left,p.top).beforeCall(move=>{
				//隐藏当前元素
				$(move._elem).hide();
				//显示元素
				$(move.elem).find(".img0").hide();
			});
		});
	});	
};

/**
 * 画线
 * @param {Object} name
 * @param {Object} name2
 */
$skill.roomClass.prototype.drawLine = function(name, name2) {
	let playerObj = $$(".player_"+name)[0];
	let playerObj2 = $$(".player_"+name2)[0];
	let player = playerObj.getBoundingClientRect();
	let player2 = playerObj2.getBoundingClientRect();
	let x=player.left;
	let y=player.top;
	let x2=player2.left;
	let y2=player2.top;
	let app = $("app")[0].getBoundingClientRect();
//	if(x==1150&&y==450) x=610;
//	else if(x2==1150&&y2==450) x2=610;
	if(playerObj.classList.contains("mainView")) {
		//横屏处理
		if($move.$landscape) {
			y = 610+app.top;
		}else{
			x = 610+app.left;
		}
	}else if(playerObj2.classList.contains("mainView")) {
		//横屏处理
		if($move.$landscape) {
			y2 = 610+app.top;
		}else{
			x2 = 610+app.left;
		}
	}
	$line(name+"_"+name2).set(
		x+player.width/2,
		y+player.height/2,
		x2+player2.width/2,
		y2+player2.height/2,
	).setWidth(2.5).setColor("#b5652a").remove(888).exe((style, elem, obj)=>{
		$(elem).css({
	    	"transform": `${obj.transform} scaleX(0)`,
		});
		setTimeout(()=>{			
			$(elem).css({
		    	"transform": `${obj.transform} scaleX(1)`,
			    "transition":`transform 0.366s`,
			});
		}, 10);
	});
};
