$script.add(
	"js/common/move.js", //卡牌移动
	"js/common/line.js", //攻击线
	"js/common/voice.js",//声音
	"js/common/img.js",  //图片引入
	"js/common/ai.js",   //ai操作
	"js/common/msg.js",  //游戏记录信息
	"js/common/alert.js",//提示文字框
	"js/common/model.js",//模式切换
	"js/common/file.js", //扩展文件引入
	"js/card.js",        //卡牌处理
	"js/general.js",     //武将模板处理
	"js/skill.js",		 //技能模板处理
	"js/skill/roomClass.js",   //技能模板处理-room对象模板
	"js/skill/playersClass.js",//技能模板处理-players对象模板
	"js/skill/playerClass.js", //技能模板处理-player对象模板
	"js/game.js",		 //游戏入口主文件
);

$script.add(()=>{
	//设置玩家数量
	if($.getUrlParm("playerNum")) $general.$playerNum = parseInt($.getUrlParm("playerNum"));
	//设置音量
	if($.getUrlParm("voice")) $voice.$volume = $.getUrlParm("voice");
	//测试环境暴露对象
	if(window.location.href.includes("127.0.0.1")) {
		['game','skill','general','card','voice','line','model','img','file','alert','ai','move','msg'].forEach(name=>{
			eval(`window.$$${name} = $${name};`);
		});
	}
	//使用vue.lgwind.js画界面
	var app = $vue({
		data : {
			room : {
				cardPileGet : [],
				cardPileLose : [],
				cardPileDeal:[],
				message : [],
			},
			player : {},
			//是否显示手牌
			handCardShow : [false,false,false,false,false,false,false,false],
			//已选武将
			selectGeneral : [],
			//是否显示选将框
			showSelectGeneral: true,
			//游戏时间
			gameTime : new Date().toLocaleString(),
		},
		methods : {
			//获取玩家胜率数据
			getWinData(general) {
				return $general.getWinByName(general.name);
			},
			//判断是否允许触发主动技能
			judgeTriggerSKill(oneSkill, item) {
				let opPlayer = this.room.opPlayer;
				//时机正确才可以执行
				if(oneSkill.trigger.includes(this.room.$skill.$triggerTime)) {
					//操作角色正确才可以执行
					if(item.name==opPlayer) {
						if($skill.judgeTrigger(oneSkill)) {
							return true;
						}
					}
				}
				return false;
			},
			//触发主动技能
			triggerSkill(oneSkill, item) {
				//判断是否允许执行主动技能
				if(this.judgeTriggerSKill(oneSkill, item)) {
					let tempSkill = this.room.$skill;
					let opPlayer = this.room.opPlayer;
					let extendedData = this.room.$extendedData;
					$game.exe(()=>{
						//重新加载技能
						//恢复技能准备并运行ai
						$skill.exeReady(tempSkill, opPlayer, extendedData);
					});
					if(!$game.exe.isRun()) {
						$game.exe.start();
					}
					$skill.exeStr(oneSkill, item.name, extendedData);
				}
			},
			//获取主动技能
			getInitiativeSkill(item) {
				let allSkill = []
				item.$skill.forEach(one=>{
					if(one.initiative) {
						allSkill.push(one);
					}
				});
				return allSkill;
			},
			//存储游戏
			saveGame() {
				$game.save();
			},
			//加载游戏
			loadGame() {
				this.player = {};
				this.room.currentRoundPlayer='room';
				this.showSelectGeneral=false;
				$game.exe.stop();
				setTimeout(()=>{
					$game.load();
					//替换app的值
					this.room = $game.$room;
					this.player = $game.$player;
				}, 20);
			},
			//打开卡牌页面
			openCard() {
				open("html/card.html");
			},
			//打开武将页面
			openPlayer() {
				//所有武将信息存于session中
				$.setSession("kill-general", $general.$data);
				//所有图片存储与session中
				$.setSession("kill-img", $img.$data);
				//势力颜色
				$.setSession("kill-kingdom", $general.$kingdom);
				//胜率
				$.setSession("kill-win", $general.getWinData());
				//胜率
				$.setSession("kill-skill", $skill.$data);
				//打开页面
				open("html/player.html");
			},
			//打开音乐
			openMusic() {
				open('/musicPlayer/index.html');
			},
			//打开帮助页面
			openHelp() {
				open('html/help.html');
			},
			//获取游戏时间
			getGameTime() {
				let second = (new Date(this.gameTime) - new Date(this.room.startTime))/1000;
				if(isNaN(second)) return "00:00:00";
				let minute = (parseInt(second/60)%60).toString().padStart(2,"0");
				let hours = parseInt(second/3600).toString().padStart(2,"0");
				second = (second%60).toString().padStart(2,"0");
				return hours+":"+minute+":"+second;
			},
			//获取图片资源
			getImg(name) {
				return $img.get(name);
			},
			//获取装备区卡牌
			getEquipArea(item) {
				let result = {0:{},1:{},2:{},3:{}};
				let equip = item.cardAreaEquip;
				equip.forEach(num=>{
					let card = $card.getById(num);
					if(card.type=='装备-武器') {
						result[0] = card;
					}else if(card.type=='装备-防具') {
						result[1] = card;
					}else if(card.type=='装备-坐骑') {
						result[2] = card;
					}else if(card.type=='装备-宝物') {
						result[3] = card;
					}
				});
				return result;
			},
			//获取弃牌堆左边位置
			getCardPileLeft() {
				let left = 362, w=34.475, width=0;;
				if(this.room.cardPileLose.length<7) {
					width += this.room.cardPileLose.length*2*w;
					left += w*(7-this.room.cardPileLose.length);
					if(this.room.cardPileLose.length==0) {
						left -= w;
					}
				}else{
					width += 7*2*w;					
				}
				return `left:${left}px; width:${width/2-w}px;height:100px`;
			},
			//获取弃牌堆中的牌
			getCardPileLose() {
				if(this.room.cardPileLose.length<=7) {
					return this.room.cardPileLose;
				}
				return this.room.cardPileLose.slice(this.room.cardPileLose.length-7);
			},			
			//获取技能信息
			getSkillMsg(item) {
				let skillStr = item.cName+"：\n";
				item.$skill.forEach(skill=>{
					skillStr+="【"+skill.name+"】"+skill.desc+"\n";
				});
				return skillStr;
			},
			//判断是否显示结束阶段按钮
			judgeOpEnd() {
				if(this.room.showEndBtn){
					return true;
				}
				return false;
			},
			//判断是否显示操作按钮
			judgeOpShow() {
				let opPlayer = this.room.opPlayer;
				//若允许显示按钮 且 操作人为主视角，则允许进行按钮操作
				if(this.player[opPlayer] && this.room.showSelectBtn && this.room.mainView==this.player[opPlayer].position){
					return true;
				}
				return false;
			},
			//取消-按钮
			no() {
				$game.exe.start();
				this.room.btnName="no";
			},
			//结束阶段-按钮
			end(){
				$game.exe.start();
				this.room.showSelectBtn=false;
				this.room.btnName="end";
			},
			//确认-按钮
			yes(){
				$game.exe.start();
				this.room.btnName="yes";
			},
			selectTargetFunc(name) {
				if(!this.judgeOpShow()){
					return ;
				}
				//事件参数
				let eventParm = {
					target : this.player[name], 
					selectCards : this.room.getSelectCards(), 
					selectTargets : this.room.getSelectTargets(), 
					player : this.player[this.room.opPlayer],
					room : this.room,
					players : this.player,
				};
				if( this.room.$skill.target(eventParm) ) {
					//添加
					this.room.selectTarget.push(name);
				}else{
					//去除
					this.room.selectTarget.forEach((item,index)=>{
						if(item==name) {
							this.room.selectTarget.splice(index,1);
						}
					});
				}
			},
			//获取选中武将
			getSelectTarget(name) {
				if(this.room.selectTarget.includes(name)) {
					return " selectTarget";
				}else {
					return "";
				}
			},
			//判断卡牌是否可选
			canSelectCard(num) {
				if(!this.judgeOpShow()){
					return "";
				}
				//事件参数
				let eventParm = {
					card : $card.getById(num), 
					selectCards : this.room.getSelectCards(), 
					selectTargets : this.room.getSelectTargets(), 
					player : this.player[this.room.opPlayer],
					room : this.room,
					players : this.player,
				};
				//包含则去除
				if( this.room.$skill.card(eventParm) ) {
					return ""
				}else{
					return "filter: brightness(0.5);";
				}
			},
			//选牌操作
			selectCardFunc(num) {
				if(!this.judgeOpShow()){
					return ;
				}
				//事件参数
				let eventParm = {
					card : $card.getById(num), 
					selectCards : this.room.getSelectCards(), 
					selectTargets : this.room.getSelectTargets(), 
					player : this.player[this.room.opPlayer],
					room : this.room,
					players : this.player,
				};
				//包含则去除
				if( this.room.$skill.card(eventParm) ) {
					//添加
					this.room.selectCard.push(num);
				}else{
					//去除
					this.room.selectCard.forEach((item,index)=>{
						if(item==num) {
							this.room.selectCard.splice(index,1);
						}
					});
				}
			},
			//获取选中牌
			getSelectCard(num) {
				if(this.room.selectCard.includes(num)) {
					return " selectCard";
				}else{
					return "";
				}
			},
			//获取显示手牌
			getHandCardShow(num) {
				if(num==this.room.mainView%this.player.size()) {
					return true;
				}
				return this.handCardShow[num];
			},
			//重启游戏
			restartGame() {
				this.player={};
				this.room.currentRoundPlayer='room';
				$msg.init();
				//记录上次选中武将
				$general.$lastSelect = $general.$select;
				//清空选中武将
				$general.$select=null;
				setTimeout(()=>{
					//游戏初始化
					$game.init();
					this.room = $game.$room;
					this.player = $game.$player;
					this.showSelectGeneral=true;
					this.changeSelectGeneral();
					//替换原对象引用为代理对象
					$game.$room = this.room;
					$game.$player = this.player;
				});
			},
			//切换主视角
			changeMainView(num) {
				this.room.mainView = num;
				//执行ai
//				$ai.stopToRun();
			},
			//根据数字获取卡牌对象
			getCard(num) {
				return $card.getById(num);
			},
			//显示和隐藏卡牌事件
			showHandCard(num) {
				this.handCardShow[num] = !this.handCardShow[num];
			},
			//显示位置
			showPosition(num) {				
				//玩家数量
				let playerSize = this.player.size();
				this.room.mainView>=playerSize?this.room.mainView-=playerSize:this.room.mainView<0?this.room.mainView+=playerSize:null;
				num=num+playerSize-this.room.mainView;
				//基础位置
				let leftBase=70, left=270, topBase=40, top=205;
				if(playerSize==8) {
					return [
						//一号位
						`left:${leftBase+left*4}px; top:${topBase+top*2}px;`,
						//右中
						`left:${leftBase+left*4}px; top:${topBase+top}px;`,
						//顶部五位
						`left:${leftBase+left*4}px; top:${topBase}px;`,
						`left:${leftBase+left*3}px; top:${topBase}px;`,
						`left:${leftBase+left*2}px; top:${topBase}px;`,
						`left:${leftBase+left}px; top:${topBase}px;`,
						`left:${leftBase}px; top:${topBase}px;`,
						//左中
						`left:${leftBase}px; top:${topBase+top}px;`,
					][num%8];
				}else if(playerSize==7) {
					let topLeft = 300, topLeftBase = 90;
					return [
						//一号位
						`left:${leftBase+left*4}px; top:${topBase+top*2}px;`,
						//右中
						`left:${leftBase+left*4}px; top:${topBase+top}px;`,
						//顶部五位
						`left:${leftBase+topLeft*3+topLeftBase}px; top:${topBase}px;`,
						`left:${leftBase+topLeft*2+topLeftBase}px; top:${topBase}px;`,
						`left:${leftBase+topLeft+topLeftBase}px; top:${topBase}px;`,
						`left:${leftBase+topLeftBase}px; top:${topBase}px;`,
						//左中
						`left:${leftBase}px; top:${topBase+top}px;`,
					][num%7];
				}else if(playerSize==6) {
					let topLeft = 358, topLeftBase = 180;
					return [
						//一号位
						`left:${leftBase+left*4}px; top:${topBase+top*2}px;`,
						//右中
						`left:${leftBase+left*4}px; top:${topBase+top}px;`,
						//顶部五位
						`left:${leftBase+topLeft*2+topLeftBase}px; top:${topBase}px;`,
						`left:${leftBase+topLeft+topLeftBase}px; top:${topBase}px;`,
						`left:${leftBase+topLeftBase}px; top:${topBase}px;`,
						//左中
						`left:${leftBase}px; top:${topBase+top}px;`,
					][num%6];
				}else if(playerSize==5) {
					let topLeft = 358, topLeftBase = 360;
					return [
						//一号位
						`left:${leftBase+left*4}px; top:${topBase+top*2}px;`,
						//右中
						`left:${leftBase+left*4}px; top:${topBase+top}px;`,
						//顶部五位
						`left:${leftBase+topLeft+topLeftBase}px; top:${topBase}px;`,
						`left:${leftBase+topLeftBase}px; top:${topBase}px;`,
						//左中
						`left:${leftBase}px; top:${topBase+top}px;`,
					][num%5];
				}else if(playerSize==4) {
					return [
						//一号位
						`left:${leftBase+left*4}px; top:${topBase+top*2}px;`,
						//右中
						`left:${leftBase+left*4}px; top:${topBase+top}px;`,
						//顶部五位
						`left:${leftBase+left*2}px; top:${topBase}px;`,
						//左中
						`left:${leftBase}px; top:${topBase+top}px;`,
					][num%4];
				}else if(playerSize==3) {
					return [
						//一号位
						`left:${leftBase+left*4}px; top:${topBase+top*2}px;`,
						//右中
						`left:${leftBase+left*4}px; top:${topBase+top*0.1}px;`,
						//左中
						`left:${leftBase}px; top:${topBase+top*0.1}px;`,
					][num%3];
				}else if(playerSize==2) {
					return [
						//一号位
						`left:${leftBase+left*4}px; top:${topBase+top*2}px;`,
						//顶部五位
						`left:${leftBase+left*2}px; top:${topBase}px;`,
					][num%2];
				}
			},
			//势力颜色
			getColorByKingdom(item) {
				let kingdom = item.kingdom[0];
				let before = 'background:';
				let obj = $general.$kingdom;
				let other = kingdom.charCodeAt(0).toString(16);
				return before+(obj[kingdom]?obj[kingdom]:"#"+other+other.substring(0,2));
			},
			//位置
			getPosition(num, item) {
				let p = ["一","二", "三", "四", "五", "六", "七", "八", "九", "十"];
				if(item.name==this.room.currentRoundPlayer) {
					if(this.room.currentPhase!='none'){
						return this.room.currentPhase;
					}
				}
				return p[num]+"号位";
			},
			//体力数组
			getBlood(num, item) {
				let result = [];
				if(item.bloodMax<=5) {
					for(let first=0; first<num && first<item.bloodMax; first++) {
						result.push({
							index : first,
						});
					}
				}
				return result;
			},
			getMagatama(item) {
				let result = [];
				if(item.magatama>5) {
					result.push({
						index : 0,
					});					
				}else{
					for(let first=0; first<item.magatama; first++) {
						result.push({
							index : first,
						});
					}
				}
				return result;
			},
			//体力数字颜色
			getBloodNum(item) {
				let bloodNum = item.blood/item.bloodMax*5;
				return bloodNum>5?5:bloodNum<1?1:Math.round(bloodNum);
			},
			//体力颜色
			getBloodColor(item) {
				let bloodNum = item.blood/item.bloodMax*5;
				let result = bloodNum>5?5:bloodNum<=0?0:bloodNum<1?1:Math.round(bloodNum);
				let color = ['#cc5c50','#cc5c50','#d38938','#bdb844','#8aa73f','#519248'];
				return "color:"+color[result]+';';
			},
			//获取卡牌间距
			getCardWidth(num, item) {
				if(this.room.mainView%this.player.size()==num) {
					let base = 860;
					if($(".mainView .skill")[0]) {
						base-=$(".mainView .skill")[0].clientWidth;
					}
					let result = base/(item.cardAreaHand.length-1);
					return result>68.95?68.95:result;
				}else{
					if(!this.handCardShow[num]) {
						return 0;
					}
				}
				return 22;
			},
			//更换可选武将
			changeSelectGeneral() {
				//获取可选武将
				this.selectGeneral=$general.getSelectData();
			},
			//选中武将
			selectedGeneral(general) {
				$general.$select=general;
				//缓存选将记录
				$general.save();
				//允许运行
				$game.exe.start();
				this.showSelectGeneral=false;
			},
		}
	});
	//文件脚本引入初始化
	$file.init();
	//加载缓存数据
	$general.load();
	//开始游戏
	app.restartGame();
	let time = function(){
		setTimeout(()=>{
			app.gameTime=new Date().toLocaleString();
			time();
		}, 1000);
	};
	time();
	//页面大小固定
	(window.onresize = () => {
	    let scale = innerWidth / 1366;  // 分母——设计稿的尺寸
	    let scale2 = innerHeight / 661; 
	    document.body.style.zoom = scale<scale2?scale:scale2;
	    //横屏处理
	    if(innerWidth<innerHeight) {
	    	let scale = innerWidth / 661;  // 分母——设计稿的尺寸
		    let scale2 = innerHeight / 1366; 
		    document.body.style.zoom = scale<scale2?scale:scale2;
		    $("app").css({
		    	"transform" : "rotate(90deg)",
		    });
		    $move.setLandscape(true);
	    }else{
	    	$("app").css({
		    	"transform" : "",
		    });
		    $move.setLandscape(false);
	    }
	})();
});

//执行脚本
$script.exe();
