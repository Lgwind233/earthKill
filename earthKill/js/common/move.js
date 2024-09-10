//# sourceURL=core/common/move.js

var $move = function(name, x, y, speed){
	return $move.add(name).move(x, y, speed);
};

//初始化移动元素对象数组
$move.$data={};

//是否横屏
$move.$landscape = false;

$move.setLandscape = function(b) {
	this.$landscape = b;
//	$("move").css({
//		"transform": `${$move.$landscape?"rotate(90deg)":""}`,
//		"position" : "absolute",
//		"width" : "1366px",
//		"height" : "661px",
//		"right" : "-352.5px",
//		"top" : "352.5px",
//		"background" : 'red',
//		"pointer-events": "none",
//	});
//	setTimeout(()=>{
//		$alert.msg("")
//	});
};

/**
 * 添加移动元素
 * @param {Object} name
 */
$move.add = function(name) {
	this.$data[name] = new this.obj(name);
	this.$data[name].run();
	return this.$data[name];
};

/**
 * 复制元素具体逻辑
 * @param {Object} pElem
 */
$move.copy = function(pElem) {
	if(pElem) {
		let elem = pElem.cloneNode(true);
		$("body move .handArea").append(elem);
		let pData = $move.getElemData(pElem);
		elem.style.position='absolute';
		elem.style.left = pData.left + "px";
		elem.style.right = pData.right + "px";
		elem.style.top = pData.top + "px";
		elem.style.botom = pData.botom + "px";
		elem.style.width = pData.width+"px";
		//横屏处理
		if(this.$landscape) {
			elem.transform = "rotate(90deg)";
			elem.style.transform = elem.transform;
		}else{
			elem.transform = "";
		}
		return elem;	
	}else{
		console.error("复制元素异常", pElem);
		return document.createElement('div');
	}
};

$("body").append("<move><div class='handArea'></div></move>");

/**
 * 元素移动对象
 * @param {Object} name
 */
$move.obj = function(name) {
	this.name = name;
	this._elem = $$(this.name)[0];
	this.copy();
	this.targetX=0;
	this.targetY=0;
	this.speed = 0.666;
};

/**
 * 复制元素
 */
$move.obj.prototype.copy = function() {
	this.elem = $move.copy(this._elem);
	let data = $move.getElemData(this.elem);
	this.left = data.left;
	this.right = data.right;
	this.top = data.top;
	this.bottom = data.bottom;
	return this.elem;
};

/**
 * 相对移动
 * @param {Object} x
 * @param {Object} y
 * @param {Object} speed
 */
$move.obj.prototype.move = function(x, y, speed) {
	//横屏处理
//	if($move.$landscape) {
//	}else{
		if(x) this.targetX=x;
		if(y) this.targetY=y;
//	}
	if(speed) this.speed=speed;
	return this;
};
$move.obj.prototype.moveOld = function(speed) {
	this.targetX=0;
	this.targetY=0;
	if(speed) this.speed=speed;
	return this;
}

/**
 * 绝对移动
 * @param {Object} x
 * @param {Object} y
 * @param {Object} speed
 */
$move.obj.prototype.go = function(x, y, speed) {
	if(this.elem) {
		this.move(x-this.left, y-this.top, speed);
	}
	return this;
};

/**
 * 绝对设置
 */
$move.obj.prototype.set = function(x, y) {
	this.go(x,y);
	$(this.elem).css({
	    "transform": `translate(${this.targetX}px, ${this.targetY}px) ${this.elem.transform}`,
	});
	return this;
};
/**
 * 元素移动之后调用方法
 * @param {Object} func
 */
$move.obj.prototype.call = function(func) {
	this.func=func;
	return this;
};
/**
 * 复制元素之前调用方法（需在最先调用）
 * @param {Object} func
 */
$move.obj.prototype.beforeCopyCall = function(func) {
	func(this);
	this.elem.remove();
	this.copy();
	return this;
};
/**
 * 复制元素之后，元素移动之前调用方法
 * @param {Object} func
 */
$move.obj.prototype.beforeCall = function(func) {
	func(this);
	return this;
};

/**
 * 元素移动动画
 */
$move.obj.prototype.run = function() {
	setTimeout(()=>{
		let oldTransform = $(this.elem).css("transform");
		$(this.elem).css({
	    	"transform": `translate(${this.targetX}px, ${this.targetY}px) ${this.elem.transform}`,
		    "transition":`transform ${this.speed}s`,
		});
	},10);
	setTimeout(()=>{
		if(typeof this.func == "function") {
			this.func(this);
		}
		delete $move.$data[this.name];
		this.elem.remove();
	},this.speed*1000);
};

/**
 * 模拟jquery
 * @param {Object} select
 */
var $$ =function(select) {
	return document.querySelectorAll(select);
};

/**
 * 判断是否有元素移动
 */
$move.run = function() {	
	for(let key in $move.$data) {
		return true;
	}
	return false;
};

/**
 * 获取元素位置数据
 * @param {Object} elem
 */
$move.getElemData = function(elem, change) {
	let elemData = elem.getBoundingClientRect();
	let copyData = {};
	["x","y","width","height","left","right","top","bottom"].forEach(key=>{
		let key2 = key;
		//横屏处理
		if($move.$landscape && change) {
			key2 = {
				x : 'y',
				y : 'x',
				width : 'height',
				height : 'width',
				left : 'top',
				right : 'bottom',
				top : 'right',
				bottom : 'left',
			}[key];
		}
		copyData[key] = elemData[key2];
	});
	return copyData;
};
