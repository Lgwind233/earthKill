//# sourceURL=core/common/msg.js

var $msg = {
	//是否允许跳转
	canGo : true,
};

$msg.init = function() {
	this.addElem();
};

$msg.addElem = function() {
	if(!this.$obj){
		this.$obj = $("<msg style='display:none;'></msg>");
		$("body app").append(this.$obj);
		this.$obj.on("dblclick", ()=>{
			this.canGo=!this.canGo;
		});
	}else{
		this.$obj.html("");
		this.$obj.hide();
	}
};

$msg.addInit = function() {
	if(!this.$playerName) {
		this.$playerName = [];
		for(let name in $general.$data) {
			let player = $general.$data[name];
			this.$playerName.push(player.chineseName);
		}
	}
	if(!this.$cardName) {
		this.$cardName = [];
		$card.getAll().forEach(card=>{
			if(!this.$cardName.includes(card.name)) {
				this.$cardName.push(card.name);
			}
		});
		//排序
		for(let first=0; first<this.$cardName.length; first++) {
			for(let second=first+1; second<this.$cardName.length; second++) {
				if(this.$cardName[first].length<this.$cardName[second].length) {
					let temp = this.$cardName[first];
					this.$cardName[first] = this.$cardName[second];
					this.$cardName[second] = temp;
				}
			}
		}
	}
	if(!this.$cardSuitNum) {
		this.$cardSuitNum=[];
		["A",2,3,4,5,6,7,8,9,10,"J","Q","K"].forEach(num=>{
			this.$cardSuitNum.push("♦"+num);
			this.$cardSuitNum.push("♥"+num);
		})
	}
};

/**
 * 获取最新位置
 */
$msg.getNewPostion = function() {
	return $("msg .msg").length-1;
};

/**
 * 添加一条消息
 * @param {Object} msg
 */
$msg.add = function(msg, position) {
	//添加消息处理变量
	this.addInit();
	//玩家名称标黄
	this.$playerName.forEach(name=>{
		msg = msg.replace(new RegExp(`${name}`,"ig"),`<span style='color:#f7c060'>${name}</span>`);
	});
	//卡牌名称标黄
	this.$cardName.forEach(name=>{
		msg = msg.replace(new RegExp(`${name}`,"ig"),`<span style='color:#f7c060'>${name}</span>`);
	});
	//卡牌花色标红
	this.$cardSuitNum.forEach(name=>{
		msg = msg.replace(new RegExp(`${name}`,"ig"),`<span style='color:#f33443'>${name}</span>`);
	});
	let msgObj = $(`<div class='msg'>${msg}</div>`);
	this.$obj.show();
	if(position>=0){
		let prev = $($("msg .msg")[position]);
		prev.after(msgObj);
	}else if(position==-1){		
		this.$obj.prepend(msgObj);
	}else{
		this.$obj.append(msgObj);
	}
	//跳转
	if(this.canGo) this.$obj[0].scrollTop=99999;
};
