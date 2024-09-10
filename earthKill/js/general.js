//# sourceURL=core/general.js

var $general = {
	$data : {},   //所有武将数据
	$fixData : {},//固定位置武将
	$select : null,//选中武将
	$selectGenerals : [],//所有武将
	$selectRoles : [],   //所有武将角色
	$lastSelect : null,//上次选中武将
	$selectAll : {},//选将频率
	$win : {}, 		//武将胜率
	$lose : {},     //武将败率
	$playerNum : 8, //玩家数量
	$role : ["主公","反贼","内奸","反贼","忠臣","反贼","忠臣","反贼"],//角色
	$fixRole : {},//固定位置角色
	$kingdom : {   //势力颜色
		"魏" : "#2f40c4",
		"汉" : "#cd1616",
		"吴" : "#157e15",
		"群" : "#554f4f",
		"黑" : "#594233",
		'鸡' : "#9e219e",
		'姬' : "#9e219e",
		'只' : "#9e219e",
		'影' : "#0a040c",
		'骑' : '#6f236f',
		'柔' : '#daab71',
	},
};

/**
 * 加载缓存数据
 */
$general.load = function() {
	let prev = $file.$base;
	//已选玩家
	let $select = $.getLocal(prev+"$select");
	if($select) {
		this.$select = $select;
	}
	//上局已选玩家
	let $lastSelect = $.getLocal(prev+"$lastSelect");
	if($lastSelect) {
		this.$lastSelect = $lastSelect;
	}
	//所有已选玩家	
	let $selectAll = $.getLocal(prev+"$selectAll");
	if($selectAll) {
		this.$selectAll = $selectAll;
	}
	//胜率	
	let $win = $.getLocal(prev+"$win");
	if($win) {
		this.$win = $win;
	}
	//败率	
	let $lose = $.getLocal(prev+"$lose");
	if($lose) {
		this.$lose = $lose;
	}
};

/**
 * 保存缓存数据
 */
$general.save = function() {
	let prev = $file.$base;
	if(this.$selectAll[this.$select.name]) {
		this.$selectAll[this.$select.name]++;
	}else{
		this.$selectAll[this.$select.name]=1;
	}
	//已选玩家
	$.setLocal(prev+"$select", this.$select);
	//上局已选玩家
	$.setLocal(prev+"$lastSelect", this.$lastSelect);
	//所有已选玩家	
	$.setLocal(prev+"$selectAll", this.$selectAll);
	//胜率
	$.setLocal(prev+"$win", this.$win);
	//败率
	$.setLocal(prev+"$lose", this.$lose);
};

/**
 * 初始化添加默认武将
 */
$general.init = function() {
	let data = [
		//汉
//		["liubei", "刘备", "汉", 4, "男"],
		["zhugeliang", "诸葛亮", "汉", 4, "男"],
//		["guanyu",   "关羽", "汉", 55, "男"],
//		["zhangfei", "张飞", "汉", 4, "男"],
//		["zhaoyun", "赵云", "汉", 4, "男"],
//		["machao", "马超", "汉", 4, "男"],
//		["huangzhong", "黄忠", "汉", 4, "男"],
//		["weiyan", "魏延", "汉", 4, "男"],
//		["liushan", "刘禅", "汉", 4, "男"],
		["huangyueying", "黄月英", "汉", 3, "女"],
//		["zhaoshibing", "赵士兵", "汉", 6, "女"],
//		["guanping", "关平", "汉", 4, "男"],
//		["jiangwei", "姜维", "汉", 4, "男"],
//		["zhangxingcai", "张星彩", "汉", 3, "女"],
//		["liaohua", "廖化", "汉", 4, "男"],
		//魏
		["zhenji",   "甄姬", "魏", 3, "女"],
//		["caocao",   "曹操", "魏", 4, "男"],
		["guojia",   "郭嘉", "魏", 3, "男"],
//		["xunyu",   "荀彧", "魏", 3, "男"],
//		["xunyou",   "荀攸", "魏", 3, "男"],
//		["chengyu",   "程昱", "魏", 3, "男"],
//		["caopi",   "曹丕", "魏", 4, "男"],
//		["caozhi",   "曹植", "魏", 4, "男"],
//		["yujin",   "于禁", "魏", 4, "男"],
//		["xuchu",   "许褚", "魏", 4, "男"],
//		["dianwei",   "典韦", "魏", 4, "男"],
//		["xiahoudun",   "夏侯惇", "魏", 4, "男"],
//		["xiahouyuan",   "夏侯渊", "魏", 4, "男"],
//		["xuhuang",   "徐晃", "魏", 4, "男"],
//		["zhangliao",   "张辽", "魏", 4, "男"],
//		["zhanghe",   "张郃", "魏", 4, "男"],
//		["dengai",   "邓艾", "魏", 4, "男"],
//		["simayi",   "司马懿", "魏", 4, "男"],
		//吴
//		["sunjian",    "孙坚", "吴", 4, "男"],
//		["sunce",    "孙策", "吴", 2, "男"],
//		["sunquan",   "孙权", "吴", 3, "男"],
		["zhouyu",   "周瑜", "吴", 4, "男"],
//		["luxun",   "陆逊", "吴", 3, "男"],
		["xiaoqiao", "小乔", "吴", 3, "女"],
		["daqiao", "大乔", "吴", 3, "女"],
		["sunshangxiang", "孙尚香", "吴", 3, "女"],
//		["ganning",   "甘宁", "吴", 3, "男"],
//		["taishici",   "太史慈", "吴", 3, "男"],
//		["huanggai",   "黄盖", "吴", 3, "男"],
//		["zhoutai",   "周泰", "吴", 3, "男"],
		//群
		["diaochan", "貂蝉", "群", 3, "女"],	
//		["lvbu", "吕布", "群", 8, "男"],	
//		["dongzhuo", "董卓", "群", 8, "男"],	
//		["huaxiong", "华雄", "群", 6, "男"],	
//		["liru",   "李儒", "群", 3, "男"],
//		["huatuo", "华佗", "群", 8, "男"],	
//		["jiaxu",   "贾诩", "群", 3, "男"],
//		["zhangjiao",   "张角", "群", 3, "男"],
//		["yuanshao",   "袁绍", "群", 3, "男"],
//		["yuanshu",   "袁术", "群", 3, "男"],
//		["gongsunzan",   "公孙瓒", "群", 3, "男"],
//		["liubiao",   "刘表", "群", 3, "男"],
//		["chengong",   "陈宫", "群", 3, "男"],	
	];
	data.forEach(oneGeneral=>{
		this.add(oneGeneral);
	});
};

/**
 * 添加武将
 */
$general.add = function(...oneGeneral) {
	if(oneGeneral[0] instanceof Array) oneGeneral = oneGeneral[0];
	let general = {
		"name" : oneGeneral[0],
		"chineseName" : oneGeneral[1],
		"kingdom" : oneGeneral[2],
		"magatama" : oneGeneral[3],
		"sex" : oneGeneral[4],
	};
	this.$data[general.name] = (new Proxy(general,{
		get : function(target, key) {
			return target[key];
		},
		set : function(target, key, value) {
			let canUpdate=true;
			//设置不可修改的属性
			['name','chineseName','kingdom','magatama','sex'].forEach(strKey=>{
				if(strKey==key) {
					console.error("不可修改："+key+"="+value);
					canUpdate=false;
				}
			});
			if(canUpdate) target[key]=value;
		},
	}));
};

/**
 * 添加固定位置武将
 * @param {Object} seat
 * @param {Object} name
 */
$general.addFix = function(seat, name) {
	this.$fixData[seat]=name;
};

/**
 * 添加固定位置角色
 * @param {Object} seat
 * @param {Object} name
 */
$general.addFixRole = function(seat, name) {
	this.$fixRole[seat]=name;
};

/**
 * 设置游戏角色
 */
$general.setRole = function(...roleArray) {
	this.$role = roleArray;
};

/**
 * 获取所有武将
 */
$general.getAll = function() {
	return Object.values(this.$data);
};

/**
 * 根据名字获取武将
 * @param {Object} name
 */
$general.getByName = function(name) {
	return this.$data[name];
};

/**
 * 获取单个武将胜率
 * @param {Object} name
 */
$general.getWinByName = function(name) {
	let win = this.$win[name]?this.$win[name]:0;
	let lose = this.$lose[name]?this.$lose[name]:0;
	let value;
	if(win+lose<10) {
		value = (win+5)/(win+lose+10);
	}else{
		value = win/(win+lose);
	}
	return {
		name : name,
		win : win,
		lose : lose,
		value : value,
		valueShow : (100*value).toFixed(1)+"%",
	};
};

/**
 * 获取武将胜率数据
 */
$general.getWinData = function() {
	//过往所有已选武将出现频率数据
	let selectAll = [];
	this.getAll().forEach(general=>{
		let name = general.name;
		selectAll.push(this.getWinByName(name));
	});
	//冒泡排序
	for(let first=0; first<selectAll.length; first++) {
		for(let second=first+1; second<selectAll.length; second++) {
			let general = selectAll[first];
			let nextGeneral = selectAll[second];
			if(general.value<nextGeneral.value) {
				selectAll[first] = nextGeneral;
				selectAll[second] = general;
			}
		}
	}
	return selectAll;
};

/**
 * 获取选将频率数据
 */
$general.getSelectFrequencyData = function() {
	//过往所有已选武将出现频率数据
	let selectAll = [];
	for(let key in this.$selectAll) {
		selectAll.push({
			"name" : key,
			"value" : this.$selectAll[key],
		});
	}
	//冒泡排序
	for(let first=0; first<selectAll.length; first++) {
		for(let second=first+1; second<selectAll.length; second++) {
			let general = selectAll[first];
			let nextGeneral = selectAll[second];
			if(general.value<nextGeneral.value) {
				selectAll[first] = nextGeneral;
				selectAll[second] = general;
			}
		}
	}
	return selectAll;
};

/**
 * 获取可选武将
 */
$general.getSelectData = function() {
	//获取所有武将
	let allGeneral = this.getAll();
	//选将框所有可选武将
	let selectGenerals = [];
	//过往所有已选武将出现频率数据
	let selectAll = this.getSelectFrequencyData();
	//选将框中出现选将频率前三的武将
	for(let first=0; first<3&&first<selectAll.length; first++) {
		let generalData = selectAll[first];
		let general = this.$data[generalData.name];
		if(canAddToSelect(general)) {
			selectGenerals.push(general);
		}
	}
	//获取武将胜率数据
	let win = this.getWinData();
	//选将框中出现胜率前三的武将
	for(let first=0; first<3&&first<win.length; first++) {
		let generalData = win[first];
		let general = this.$data[generalData.name];
		if(canAddToSelect(general)) {
			selectGenerals.push(general);
		}
	}
	//选将框中出现上次选将
	if(this.$lastSelect) {
		let general = this.$data[this.$lastSelect.name];
		if(canAddToSelect(general)) {
			selectGenerals.push(this.$lastSelect);
		}
	}
	/**
	 * 判断是否能添加到选将中
	 * @param {Object} general
	 */
	function canAddToSelect(general) {
		if(!general) return false;
		let judge = true;
		//不选择重复的武将
		selectGenerals.forEach(one=>{
			//若选将框中包含该武将，则不重复添加
			if(one.name==general.name) {
				judge = false;
			}
		});
		return judge;
	}
	//获取16个可选武将
	while(selectGenerals.length<16 && selectGenerals.length<allGeneral.length) {
		let random = Math.floor(Math.random()*allGeneral.length);
		//随机武将
		let autoGeneral = allGeneral[random];
		if(autoGeneral) {
			//若选将框中不包含随机武将，则添加到选将框中
			if(canAddToSelect(autoGeneral)) {
				selectGenerals.push(autoGeneral);
			}
		}
	}
	return selectGenerals;
};

/**
 * 初始化触发技能
 */
$general.initTriggerSkill = function() {
	//会触发的技能
	$skill.$dataTrigger=[];
	$game.$player.forEach(player=>{
		//清空技能
		player.$skill=[];
	});
	//添加房间技能
	$skill.$data.forEach(skill=>{
		if(skill.owner.includes("room")){
			$skill.$dataTrigger.push(skill);
		}
	});
	//角色加载技能
	$skill.$data.forEach(skill=>{
		let addSkill = false;
		skill.owner.forEach(owner=>{
			$game.$player.forEach(player=>{
				if(player.name==owner) {
					addSkill=true;
					if(!player.$skill.includes(skill)) {
						player.$skill.push(skill);
					}
				}
			});
			if(owner=="room") {
//				addSkill=true;
			}
		});
		if(addSkill) {
			$skill.$dataTrigger.push(skill);
		}
	});
};

/**
 * 选择武将 - 分配位置 - 分配角色
 */
$general.select = function() {
	let selectFunc = ()=>{		
		//自动选将
		let result = this.autoSelect();
		if(result) {
			//设置基础技能
			$game.exe(()=>{		
				this.initTriggerSkill();
			});
		}else{
			//添加重复执行
			$game.exe(selectFunc);
		}
		//初始化武将对象
		$game.exe(()=>{			
			this.initPlayerObj();
		});
		//执行阶段进行中
		$skill.trigger("选将后", "room", {
			"select" : this.$select,
			"selectGenerals" : this.$selectGenerals,
			"selectRoles" : this.$selectRoles,
			"allGeneral" : this.$data,
		});
	};
	//添加后续
	$game.exe(selectFunc);	
	//设置基础技能
	$game.exe(()=>{		
		this.initTriggerSkill();
	});
};

/**
 * 自动选择其他武将
 * @param {Object} selectGenerals
 */
$general.autoSelect = function() {
	if(!this.$select) return false;
	this.$select = this.getByName(this.$select.name);
	//获取所有武将
	let allGeneral = this.getAll();
	//玩家数量异常处理
	if(isNaN(this.$playerNum)) this.$playerNum=8;
	//玩家数量最大为8
	if(this.$playerNum>8) this.$playerNum=8;
	//玩家数量最小为2
	if(this.$playerNum<2) this.$playerNum=2;
	//已选武将数组
	let selectGenerals = new Array(this.$playerNum<allGeneral.length?this.$playerNum:allGeneral.length);
	selectGenerals.fill(null);
	//添加固定位置武将
	Object.keys(this.$fixData).forEach(key=>{
		if(key<selectGenerals.length) {
			selectGenerals[key] = this.getByName(this.$fixData[key]);
		}
	});
	//已选武将位置
	let selectNum, hasNull=false;
	//判断是否有空位
	selectGenerals.forEach(one=>{
		if(one==null) {
			//设置有空位
			hasNull = true;
		}
	});
	//加入已选武将
	while(true) {
		//获取随机位置
		selectNum = Math.floor(Math.random()*selectGenerals.length);
		//不重复添加武将
		if(!selectGenerals.includes(this.$select)) {
			//若有空位则不占用已有位置，无空位则占用
			if(selectGenerals[selectNum]==null || hasNull==false) {
				//添加已选择的武将
				selectGenerals[selectNum]=this.$select;
				break;
			}
		}else{
			selectNum = selectGenerals.indexOf(this.$select);
			break;
		}
	}
	//是否继续选将
	let canSelect = true;
	while(canSelect) {
		//设置不在选将
		canSelect = false;
		//随机数
		let random = Math.floor(Math.random()*allGeneral.length);
		//随机角色
		let randomGeneral = allGeneral[random];
		//添加位置
		let addSeat;
		selectGenerals.forEach((one, index)=>{
			if(one==null) addSeat = index;
		});
		//有位置才添加武将
		if(addSeat!=null) {
			//不重复选将
			if(!selectGenerals.includes(randomGeneral)) {
				selectGenerals[addSeat] = randomGeneral;
			}
		}
		//判断是否继续选将
		selectGenerals.forEach(one=>{
			if(one==null) canSelect = true;
		});
	}
	//设置主视角
	$game.$room.mainView=selectNum;
	//设置游戏开始时间
	$game.$room.startTime = new Date().toLocaleString();
	//角色数组
	let roleArrayBase = this.$role.slice(0, selectGenerals.length);
	//新角色数组-用于打乱顺序
	let roleArray = new Array(roleArrayBase.length);	
	roleArray.fill(null);	
	//添加固定位置角色
	Object.keys(this.$fixRole).forEach(key=>{
		if(key<roleArray.length) {
			let roleNum = roleArrayBase.indexOf(this.$fixRole[key]);
			if(roleNum!=-1) {
				roleArray[key] = this.$fixRole[key];
				roleArrayBase.splice(roleNum,1)
			}
		}
	});	
	//是否继续选角色
	let canSelectRole = true;
	while(canSelectRole) {
		//设置不在选将
		canSelectRole = false;
		//随机数
		let random = Math.floor(Math.random()*roleArray.length);
		//角色为空设置角色
		if(roleArray[random]==null) {
			roleArray[random]=roleArrayBase.pop();
		}
		//判断是否继续选将
		roleArray.forEach(one=>{
			if(one==null) canSelectRole = true;
		});
	}
	this.$selectGenerals = selectGenerals;
	this.$selectRoles = roleArray;
	return true;
};

/**
 * 初始化玩家对接
 */
$general.initPlayerObj = function() {
	let selectGenerals = this.$selectGenerals;
	//选将去重
	selectGenerals = Array.from(new Set(selectGenerals));
	let roleArray = this.$selectRoles;
	//初始化玩家对象
	selectGenerals.forEach((general, index)=>{
		let player = new $skill.playerClass();
		Object.assign(player, {
			//名字
			'name' : general.name,
			//中文名字
			'cName' : general.chineseName,
			//性别
			'sex' : general.sex,
			//血量
			'blood' : general.magatama,
			//血量上限
			'bloodMax' : general.magatama,
			//势力
			'kingdom' : general.kingdom,
			//是否死亡
			'death' : false,
			//是否濒死
			'nearDeath' : false,
			//位置
			'position' : index,
			//角色
			'role' : roleArray.shift(),
			//手牌区
			'cardAreaHand' : [],
			//装备区
			'cardAreaEquip' : [],
			//判定区
			'cardAreaJudge' : [],
			//技能
			"$skill" : [],
		});
		$game.$player[general.name] = player;
	});
}
