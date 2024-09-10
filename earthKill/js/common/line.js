//# sourceURL=core/common/line.js

var $line = function(name, x, y, x2, y2) {
	return $line.add(name).set(x,y, x2,y2);
};

/**
 * 添加线条对象
 * @param {Object} name
 */
$line.add = function(name) {
	if(!this.$data) this.$data={};
	this.$data[name] = new this.obj(name);
	return this.$data[name];
};

/**
 * 设置线条样式
 * @param {Object} elem
 */
$line.setStyle = function(elem) {
	let style = {
		"display" : "inline-block",
		"position" : "absolute",
		"left" : "100px",
		"top" : "100px",
		"background" : "red",
		"width" :　"2px",
		"height" : "2px",
		"transform-origin" : "left",
		"transform" : "rotate(45deg)",
		"box-shadow": "0px 0px 8px 1px #97650a",
	};
	for(let key in style) {
		elem.style[key]=style[key];
	}
};

/**
 * 线条对象
 * @param {Object} name
 */
$line.obj = function(name) {
	this.name = name;
	//创建元素
	let elem = document.createElement("line");
	//将元素放置在页面上
	document.body.appendChild(elem);
	//设置元素样式
	$line.setStyle(elem);
	this.elem = elem;
};

/**
 * 设置线条位置
 */
$line.obj.prototype.set = function(x, y, x2, y2) {
	if(x!=null && y!=null && x2!=null && y2!=null) {
		let style = this.elem.style;
		//设置线条左边端点位置
		style.left=x+"px";
		style.top=y+"px";
		//计算线条长度
		let dx = x2-x;
		let dy = y2-y;
		let width = Math.sqrt(dx*dx+dy*dy);
		//设置线条长度
		style.width=width+"px";
		//设置线条右边端点位置,通过旋转设置
		let angle = Math.atan(dy/dx)/Math.PI*2*90;
		if(dx<0) angle=angle+180;
		style.transform = `rotate(${angle}deg)`;		
		//记录长度和旋转角度
		this.transform = style.transform;
		this.length = width;
	}
	return this;
};

/**
 * 设置线条颜色
 * @param {Object} color
 */
$line.obj.prototype.setColor = function(color) {
	this.elem.style.background = color;
	return this;
};

/**
 * 设置线条宽度
 * @param {Object} width
 */
$line.obj.prototype.setWidth = function(width) {
	this.elem.style.height = width+"px";
	return this;
};

/**
 * 移除线条
 * @param {Object} num
 */
$line.obj.prototype.remove = function(num) {
	setTimeout(()=>{
		this.elem.remove();
		delete $line.$data[this.name];
	}, num);
	return this;
};

/**
 * 执行函数
 * @param {Object} func
 */
$line.obj.prototype.exe = function(func) {
	func(this.elem.style, this.elem, this);
	return this;
};

