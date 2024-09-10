//# sourceURL=core/game.js

var $game={};

/**
 * 游戏初始化
 */
$game.init = function() {
	//运行函数
	this.run();
	//数据初始化
	this.initData();
	//选将阶段
	this.exe("this.selectGeneral()");
};

/**
 * 游戏数据读取
 */
$game.load = function() {
	let prev = $file.$base;
	//房间对象
	let room = $.getLocal(prev+"room");
	Object.assign(this.$room, room);
	//所有玩家对象
	let player = $.getLocal(prev+"player");
	this.$player = new $skill.playersClass();
	Object.assign(this.$player, player);
	this.$player.forEach((general, index)=>{
		let newGeneral = new $skill.playerClass();
		Object.assign(newGeneral, general);
		this.$player[index] = newGeneral;
	});	
	//所有技能临时变量
	let skillTempData = $.getLocal(prev+"skills");
	$skill.$data.forEach(skill=>{
		let skillTemp = skillTempData[skill.name];
		for(let key in skillTemp) {
			if(key.startsWith("$")) {
				skill[key] = skillTemp[key];
			}
		}
	});
//	Object.assign($skill.$data, allSkilldata);
	//已选玩家
	let selectGeneral = $.getLocal(prev+"select");
	$general.initTriggerSkill();
	//缓存程序
	this.exe.func = $.getLocal(prev+"exeFunc");
	$alert("加载成功！");
};

/**
 * 游戏数据缓存
 */
$game.save = function() {
	//$game.$player
	//$game.$room
	//$general.$select
	//调用$general.initTriggerSkill()
	//$game.exe.func
	//判定是否能存储
	let canSave = true;
	this.exe.func.forEach(func=>{
		if(typeof func!="string") {
			canSave = false;
			$alert("存储失败！请在出牌阶段空闲时点击存储！");
		}
	});
	if(canSave) {
		let prev = $file.$base;
		//房间对象
		$.setLocal(prev+"room", this.$room);
		//所有玩家对象
		$.setLocal(prev+"player", this.$player);
		//所有技能临时变量
		let skillTempData = {};
		$skill.$data.forEach(skill=>{
			skillTempData[skill.name] = {};
			for(let key in skill) {
				if(key.startsWith("$")) {
					skillTempData[skill.name][key] = skill[key];
				}
			}
		});
		$.setLocal(prev+"skills", skillTempData);
		//已选玩家
		$.setLocal(prev+"select", $general.$select);
		//缓存程序
		$.setLocal(prev+"exeFunc", this.exe.func);
		$alert("存储成功！");
	}
};

/**
 * 数据初始化
 */
$game.initData = function() {
	//数据总对象
	this.$data = {};
	//获取所有卡牌资源
//	this.$data.cards = $card.$data;
	//获取所有武将资源
//	this.$data.generals = $general.$data; 
	//房间对象
	this.$room = new $skill.roomClass();
	Object.assign(this.$room, {
		//摸牌堆
		cardPileGet : [],
		//弃牌堆
		cardPileLose : [],
		//处理区牌堆
		cardPileDeal : [],
		//记录信息
		message : [],
		//游戏开始时间
		startTime : "",
		//洗牌次数
		shuffleCardNum:0,
		//游戏轮数
		TurnNum : 0,
		//是否使用AI
		useAI : true,
		//是否托管
		useAISelf : false,
		//当前回合角色
		currentRoundPlayer : "room",
		//当前阶段
		currentPhase : 'none',
		//主视角
		mainView : 0,
		//操作人
		opPlayer : "",
		//已选卡牌
		selectCard : [],
		//已选目标
		selectTarget : [],
		//当前技能
		$skill : {},
		//技能提示
		skillTitle : "",
		//点击按钮
		btnName:"",
		//是否显示操作按钮
		showSelectBtn : false,
		//显示结束阶段按钮
		showEndBtn : false,
	});
	//玩家对象类
	let playerClass = function() {};
	//玩家对象
	this.$player = new $skill.playersClass();
};

/**
 * 选将阶段
 */
$game.selectGeneral = function() {
	//游戏开始
	this.exe("this.gameStart()");
	//停止运行，等待输入
	this.exe.stop();
//	console.log("选将阶段");
	//等待执行room技能-选择武将
	$general.select();
};

/**
 * 游戏开始时
 */
$game.gameStart = function() {	
	//每轮开始
	this.exe("this.turnStart()");
//	console.log("游戏开始时");
	$msg.add("游戏开始时");
	//触发相关时机的技能
	Object.values(this.$player).reverse().forEach(player=>{
		$skill.trigger("游戏开始时", player.name);
	});
	$skill.trigger("游戏开始前后续");
	$skill.trigger("游戏开始前");
};

/**
 * 每轮开始时
 */
$game.turnStart = function() {
	$game.$room.TurnNum++;
	//执行每轮结束
	this.exe("this.turnEnd()");
	//执行回合开始
	this.exe("this.roundStart()");
//	console.log("每轮开始时");
	$msg.add(`-----------<br>第${$game.$room.TurnNum}轮`);
	Object.values(this.$player).reverse().forEach(player=>{
		$skill.trigger("每轮开始时", player.name);
	});
	//触发相关时机的技能
	$skill.trigger("每轮开始前");
};

/**
 * 每轮结束时
 */
$game.turnEnd = function() {
	//执行每轮开始
	this.exe("this.turnStart()");
//	console.log("每轮结束时");
	//触发相关时机的技能
	$skill.trigger("每轮结束时");
};

/**
 * 回合开始时
 */
$game.roundStart = function() {
	//下个回合角色
	let nextPlayer;
	//若为room，则代表每轮开始时
	if(this.$room.currentRoundPlayer=="room") {
		//获取下个回合角色
		nextPlayer=this.$player.getNextRoundPlayer(-1);
		if(nextPlayer){
			//设置一号位为当前回合角色
			this.$room.currentRoundPlayer=nextPlayer.name;
		}else{
			//暂停游戏
			$game.exe.stop();
			$alert("所有角色已死亡！");
		}
	}else{
		//获取下个回合角色
		nextPlayer=this.$player.getNextRoundPlayer(this.$player[this.$room.currentRoundPlayer].position);
		if(nextPlayer){
			//切换回合角色
			this.$room.currentRoundPlayer=nextPlayer.name;
		}else{
			//不存在下个回合角色，则设置room
			this.$room.currentRoundPlayer='room';
		}
	}
	//若存在下个角色，则执行回合开始逻辑
	if(nextPlayer){
		//执行回合结束
		this.exe("this.roundEnd()");
		//设置阶段
		this.$room.currentPhase="回合开始";	
		//执行阶段
		this.exe("this.phaseRun()");
//		console.log(this.$player[this.$room.currentRoundPlayer].cName+"的回合开始时");
		$msg.add(`-----------<br>${this.$player[this.$room.currentRoundPlayer].cName}的回合`);
		//触发相关时机的技能
		$skill.trigger("回合开始时");
	}
};

/**
 * 回合结束时
 */
$game.roundEnd = function() {
	//执行下个回合
	this.exe("this.roundStart()");
	//设置阶段
	this.$room.currentPhase="回合结束";
//	console.log(this.$player[this.$room.currentRoundPlayer].cName+"的回合结束时");
	//触发相关时机的技能
	$skill.trigger("回合结束时");
};

/**
 * 执行阶段
 */
$game.phaseRun = function() {
	let phaseArray = ["回合开始","准备阶段","判定阶段","摸牌阶段","出牌阶段","弃牌阶段","结束阶段"];
	let nextPhase=null;
	phaseArray.forEach((phase,index)=>{
		if(phase==this.$room.currentPhase) {
			nextPhase=phaseArray[index+1];
		}
	});
	//若存在下个阶段，则执行阶段逻辑
	if(nextPhase) {
		//设置阶段
		this.$room.currentPhase=nextPhase;
		//重复执行阶段
		this.exe("this.phaseRun()");
//		console.log("  "+this.$room.currentPhase+'开始时');	
		//执行阶段结束时
		$skill.trigger(this.$room.currentPhase+"结束时");	
		//执行阶段进行中
		$skill.trigger(this.$room.currentPhase);
		//执行阶段开始时
		$skill.trigger(this.$room.currentPhase+"开始时");
	}
};

/**
 * 执行函数
 * @param {Object} func
 * @param {Object} unshift 是否头部插入
 */
$game.exe = function(func, tag) {
	if(tag=="first"){
		this.exe.funcFirst.push(func);
	}else{
		this.exe.func.push(func);
	}
};

/**
 * 允许程序
 */
$game.run = function() {	
	//执行函数
	this.exe.func = [];
	//执行函数-优先
	this.exe.funcFirst = [];
	//睡眠时间
	this.exe.sleepNum = 0;
	//默认运行
	this.exe.canRun=true;
	if(typeof this.exe.animate == 'function') {
		//"避免重复运行"
	}else{
		//睡眠
		this.exe.sleep = (num)=>{
			this.exe.sleepNum = num;
		};
		//停止运行
		this.exe.stop = ()=>{
			this.exe.canRun=false;
		};
		//开始运行
		this.exe.start = ()=>{
			this.exe.canRun=true;
		};
		this.exe.isRun = ()=>{
			return this.exe.canRun;
		};
		/**
		 * 循环动画
		 */
		let $animateFrame = window.requestAnimationFrame       ||
		            window.webkitRequestAnimationFrame ||
		            window.mozRequestAnimationFrame    ||
		            window.oRequestAnimationFrame      ||
		            window.msRequestAnimationFrame     ||
		            function(/* function */ callback, /* DOMElement */ element){
		                window.setTimeout(callback, 1000 / 60);
		            };
		/**
		 * 动画函数
		 */	
		this.exe.animate = ()=>{
			$animateFrame(this.exe.animate);
		    //移动动画
		    let move = $move.run();
		    //移动动画时不执行任务
		    if(!move) {
		    	if(this.exe.canRun){
		    		if(this.exe.sleepNum>0) {
		    			this.exe.sleepNum--;
		    		}else{
			    		 //单次运行
					    if(this.exe.funcFirst.length>0) {			    	
					    	this.runfunc =this.exe.funcFirst.pop();
					    	if(typeof this.runfunc == 'function') {
					    		this.runfunc();
					    	}
				    	}else{
							 //单次运行
						    if(this.exe.func.length>0) {			    	
						    	this.runfunc =this.exe.func.pop();
						    	if(typeof this.runfunc == 'function') {
						    		this.runfunc();
						    	}else if(typeof this.runfunc == 'string') {
						    		eval(this.runfunc);
						    	}
					    	}
					    }
			    	}
			    }
		    }
		};
		this.exe.animate();
	}
};
