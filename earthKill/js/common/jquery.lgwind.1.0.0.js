//# sourceURL=common/jquery.lgwind.js

//报相关异常
if(typeof $dom != 'undefined') {
	console.error("$dom 关键词冲突！");
}

/**
 * 选择器
 * @param {Object} elem
 */
var $dom = function(elem) {
	//若是对象，则封装对象
	if(typeof elem=="object"){
		if(elem.length==null){
			return new $dom.obj([elem]);
		}else{//若是数组，则封装数组
			return new $dom.obj(elem);
		}
	}if(typeof elem=="function"){
		//添加事件
		$dom.ready(elem);
		return $dom(document);
	}else if(elem && elem.includes("<") && elem.includes(">")) {
		//若是同时包含字符<和>，则创建对象
		return $dom($dom.createElement(elem));
	}else {
		//若是其他字符串
		return $dom($dom.getElement(elem));
	}
};

/**
 * 选择器
 * @param {Object} elem
 */
if(typeof $ == 'undefined') {
	var $=$dom;
}

/**
 * 封装对象
 * @param {Object} elem 单个对象或伪数组
 */
$dom.obj = function(elem) {
	//生成伪数组对象
	this.length = elem.length;
	for(let first=0; first<this.length; first++) {
		this[first] = elem[first];
	}
};

/**
 * 迭代器
 */
$dom.obj.prototype[Symbol.iterator] = function() {
	let index=0;
	return {		
		next : () => {
			if(index<this.length) {
				const result = { value: this[index], done: false};
				index++;
				return result;
			}else{
				return { value: undefined, done: true};
			}
		}
	};
};


/**
 * 获取dom元素
 * @param {Object} elem
 * @param {Object} parentElem 父级元素或伪数组，默认值：document
 */
$dom.getElement = function(elem, parentElem=[document]){
	if(!elem) return [];
	let htmlCollection = [];
	//元素集合，数组
	for(let first=0; first<parentElem.length; first++) {
		let oneElem = parentElem[first];
		if(elem[0]=="#"&&!elem.includes(" ")){			
			let result = oneElem.querySelector(elem);
			if(result) {
				htmlCollection.push(result);
			}
		}else{
			//获取查询结果，数组
			let result = oneElem.querySelectorAll(elem);
			//将查询结果赋予集合
			htmlCollection.push(...result);
		}
	}
	return htmlCollection;
};

/**
 * 选择下级元素
 * @param {Object} elem
 */
$dom.obj.prototype.find = function(elem){
	return $dom($dom.getElement(elem, this));
};

/**
 * 获取对象对象
 * @param {Object} index
 */
$dom.obj.prototype.eq = function(index) {
	return $dom(this[index]);
};

/**
 * 返回被选元素的首个元素
 */
$dom.obj.prototype.first = function(){
	return this.eq(0);
};

/**
 * 返回被选元素的最后一个元素
 */
$dom.obj.prototype.last = function(){
	return this.eq(this.length-1);
};

/**
 * 获取直接父级元素
 */
$dom.obj.prototype.parent = function() {
	//使用set去重
	let parents = new Set();
	for(let first=0; first<this.length; first++) {
		parents.add(this[first].parentNode);
	}
	return $dom([...parents]);
};

/**
 * 获取所有直接子元素
 */
$dom.obj.prototype.children = function(func) {
	let children = [];
	for(let first=0; first<this.length; first++) {
		if(!func){
			children.push(...this[first].children);
		}else{
			func(children, this[first]);
		}
	}
	return $dom(children);
};

/**
 * 返回被选元素的下一个同胞元素
 */
$dom.obj.prototype.next = function() {
	return this.children((dataArray, elem) => {
		if(elem.nextElementSibling)	dataArray.push(elem.nextElementSibling);
	});
};

/**
 * 返回被选元素的上一个同胞元素
 */
$dom.obj.prototype.prev = function() {
	return this.children((dataArray, elem) => {
		if(elem.previousElementSibling)	dataArray.push(elem.previousElementSibling);
	});
};

/**
 * 属性过滤器，根据元素的所有属性值过滤(新增)
 */
$dom.obj.prototype.attrFilter = function(filter) {
	let result = [];
	for(let first=0; first<this.length; first++) {
		let attributes = this[first].attributes;
		let attrJudge = "";
		for(let second=0; second<attributes.length; second++) {
			attrJudge += attributes[second].value + " ";
		}
		//只保留属性值包含的过滤字符串的
		if(attrJudge.includes(filter)) {
			result.push(this[first]);
		}
	}
	return $dom(result);
};

/**
 * 文本过滤器，根据元素的内容过滤(新增)
 */
$dom.obj.prototype.textFilter = function(filter) {
	let result = [];
	for(let first=0; first<this.length; first++) {
		//只保留文本包含的过滤字符串的
		if(this[first].innerText && this[first].innerText.includes(filter)) {
			result.push(this[first]);
		}
	}
	return $dom(result);
};

/**
 * 获取对应元素
 */
$dom.obj.prototype.get = function(index) {
	return this[index];
};

/**
 * 创建元素
 * @param {Object} elem
 */
$dom.createElement = function(elem) {
	let temp = document.createElement("temp");
	temp.innerHTML=elem;
	return temp.childNodes; 
};

/**
 * 在现有的子节点后加入一个新的子节点
 * @param {Object} nodes
 */
$dom.obj.prototype.append = function(nodes, func) {	
	if(!nodes) return this;	
	let newNodes;
	if(typeof nodes=="object"){
		if(nodes.length==null){
			newNodes = [nodes];
		}else{
			newNodes = nodes;
		}
	}else{
		//创建新元素节点
		newNodes = $dom.createElement(nodes); 
	}
	for(let first=0; first<this.length; first++){
		for(let second=0; second<newNodes.length; second++) {
			if(!func) {
				this[first].appendChild(newNodes[second]);
			}else{//通用方法
				func(this[first], newNodes[second])
			}
		}		
	}
	return this;
};

/**
 * 在现有的子节点前加入一个新的子节点
 * @param {Object} nodes
 */
$dom.obj.prototype.prepend = function(nodes) {
	return this.append(nodes, (elem, node) => {
		elem.insertBefore(node,elem.children[0]); 
	});
};

/**
 * 在现有的节点后加入一个新的同胞节点
 * @param {Object} nodes
 */
$dom.obj.prototype.after = function(nodes) {	
	return this.append(nodes, (elem, node) => {
		elem.parentNode.insertBefore(node,elem); 
		//交换位置
		elem.parentNode.insertBefore(elem,node); 
	});
};

/**
 * 在现有的节点前加入一个新的同胞节点
 * @param {Object} nodes
 */
$dom.obj.prototype.before = function(nodes) {	
	return this.append(nodes, (elem, node) => {
		elem.parentNode.insertBefore(node,elem); 
	});
};

/**
 * 删除节点
 */
$dom.obj.prototype.remove = function() {
	for(let first=0; first<this.length; first++){
		this[first].remove();
	}
	return this;
};

/**
 * 删除节点的所有后代节点
 */
$dom.obj.prototype.empty = function() {
	this.html("");
	return this;
};

/**
 * 获取或修改html内容
 * @param {Object} elem
 */
$dom.obj.prototype.html = function(elem) {
	//若参数为空，则获取html内容
	if(elem==null) {
		if(this.length>0){
			return this[0].innerHTML;
		}
	}else {	//参数不为空，修改html内容
		for(let first=0; first<this.length; first++){
			this[first].innerHTML = elem; 
		}	
	}
	return this;
};

/**
 * 修改元素内容，不添加html标签
 * @param {Object} text
 */
$dom.obj.prototype.text = function(textContent) {
	//若参数为空，则获取html内容
	if(textContent==null) {
		if(this.length>0){
			return this[0].textContent;
		}
	}else {	//参数不为空，修改html内容
		for(let first=0; first<this.length; first++){
			this[first].textContent = textContent; 
		}
	}
	return this;
};

/**
 * 元素赋值
 * @param {Object} textContent
 */
$dom.obj.prototype.val = function(textContent) {
	//若参数为空，则获取html内容
	if(textContent==null) {
		if(this.length>0){
			return this[0].value?this[0].value:"";
		}
	}else {	//参数不为空，修改html内容
		for(let first=0; first<this.length; first++){
			this[first].value = textContent;
		}	
	}
	return this;
};

/**
 * 获取或修改属性值
 * @param {Object} attrKey
 * @param {Object} attrValue
 */
$dom.obj.prototype.attr = function(attrKey, attrValue) {
	//若参数为空，则获取html内容
	if(attrValue==null) {
		if(this.length>0){
			return this[0].getAttribute(attrKey);
		}
	}else {	//参数不为空，修改html内容
		for(let first=0; first<this.length; first++){
			this[first].setAttribute(attrKey, attrValue);
		}	
	}
	return this;
};

/**
 * 修改css样式
 * @param {Object} cssKey
 * @param {Object} cssValue
 */
$dom.obj.prototype.css = function(cssKey, cssValue) {
	//若参数为对象
	if(typeof cssKey == "object") {
		for(let key in cssKey){
			for(let first=0; first<this.length; first++){
				this[first].style[key] = cssKey[key];
			}	
		}
		return this;
	}
	//若参数为字符串，且没有赋值，则读取
	if(cssValue==null) {
		if(this.length>0){
			return this[0].style[cssKey];
		}
	}else {	//参数赋值，修改css样式
		for(let first=0; first<this.length; first++){
			this[first].style[cssKey] = cssValue;
		}	
	}
	return this;
};

/**
 * 添加类名
 * @param {Object} className
 */
$dom.obj.prototype.addClass = function(className, func) {
	for(let first=0; first<this.length; first++){
		let classList = this[first].classList;
		if(!func){
			//若不包含class类名则添加
			if(!classList.contains(className)){
				classList.add(className);
			}
		}else{
			func(classList);
		}
	}
	return this;
};

/**
 * 移除类名
 * @param {Object} className
 */
$dom.obj.prototype.removeClass = function(className) {	
	return this.addClass(className, (classList) => {
		//若包含class类名则移除
		if(classList.contains(className)){
			classList.remove(className);
		}
	});
};

/**
 * 显示
 */
$dom.obj.prototype.show = function() {
	return this.css("display", "");
};

/**
 * 隐藏
 */
$dom.obj.prototype.hide = function() {
	return this.css("display", "none");
};

/**
 * blur focus focusin focusout resize scroll click dblclick 
 * mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave 
 * change select submit keydown keypress keyup contextmenu  
 * "".split(" ");
 * 绑定事件
 * @param {Object} event
 * @param {Object} func
 */
$dom.obj.prototype.on = function(event, func) {		
	for(let first=0; first<this.length; first++){
		//DOM0级事件模型
		//this[first]["on"+event] = func;
		//DOM2级事件模型
		if(!this[first]._event) this[first]._event={};
		if(!this[first]._event[event]) this[first]._event[event]=[];
		//存储匿名函数用于删除
		this[first]._event[event].push(func);
		$dom.addEventListener(this[first], event, func);
	}
	return this;
};

/**
 * 绑定事件（只执行一次）
 * @param {Object} event
 * @param {Object} func
 */
$dom.obj.prototype.one = function(event, func) {		
	for(let first=0; first<this.length; first++){
		//DOM0级事件模型
		//this[first]["on"+event] = func;
		//DOM2级事件模型
		let elem = this[first];
		$dom.addEventListener(elem, event, function(){
			//注销时间，避免反复触发
			$dom.removeEventListener(elem, event, arguments.callee);
			func();
		});
	
	}
	return this;
};

/**
 * 解绑事件
 * @param {Object} event
 */
$dom.obj.prototype.off = function(event) {
	for(let first=0; first<this.length; first++){
		//DOM0级事件模型
		//this[first]["on"+event] = null;
		//DOM2级事件模型
		if(!this[first]._event) continue;
		if(!this[first]._event[event]) continue;
		let funcArray = this[first]._event[event];
		for(let second=0; second<funcArray.length; second++) {			
			$dom.removeEventListener(this[first], event, funcArray[second]);
		}
		//清空数组对象
		this[first]._event[event]=[];
	}
	return this;
};

/**
 * 触发事件
 * @param {Object} event
 */
$dom.obj.prototype.trigger = function(event) {	
	for(let first=0; first<this.length; first++){
		//DOM0级事件模型
		//this[first]["on"+event]();
		//DOM2级事件模型
		let _event = document.createEvent('Events');
		//事件类型，是否冒泡，是否阻止浏览器的默认行为
		_event.initEvent(event, true, true);
		//触发绑定事件句柄的DOM元素上的事件
		this[first].dispatchEvent(_event);
	}
	return this;
};

/**
 * 触发点击事件
 */
$dom.obj.prototype.click = function() {
	return this.trigger("click");
};

$dom.obj.prototype.ready = function(func) {
	$dom.ready(func);	
	return this;
};

/**
 * 添加DOM2级事件
 * @param {Object} elem
 * @param {Object} event
 * @param {Object} func
 */
$dom.addEventListener = function(elem, event, func) {
	if(elem.addEventListener) {//标准浏览器
		elem.addEventListener(event, func, false);//默认事件冒泡
	}else if(elem.attachEvent) {//IE浏览器
		if(event=="DOMContentLoaded") event='onreadystatechange';
		elem.attachEvent(event, func);
	}
};

/**
 * 移除DOM2级事件
 * @param {Object} elem
 * @param {Object} event
 * @param {Object} func
 */
$dom.removeEventListener = function(elem, event, func) {
	if(elem.removeEventListener) {//标准浏览器
		elem.removeEventListener(event, func, false);//默认事件冒泡
	}else if(elem.detachEvent) {//IE浏览器
		if(event=="DOMContentLoaded") event='onreadystatechange';
		elem.detachEvent(event, func);
	}
};

/**
 * 初始化
 */
($dom.init = function() {
	//判断是否加载完成
	let isReady=false;
	//加载函数数组
	let readyFuncArray=[];
	/**
	 * 对外接口
	 */
	$dom.ready = function(func){
		readyFuncArray.push(func);
		//若dom已加载完成
		if(isReady){
			setTimeout(()=>{doReady();},0);
		}	
	};
	
	/**
	 * dom加载完成后执行
	 */
	function doReady(){
		isReady = true;
		while(readyFuncArray.length>0) {
			let func = readyFuncArray.shift();
			func();
		}
	};
	//标准浏览器
	$dom.addEventListener(document, 'DOMContentLoaded',function() {
		//注销时间，避免反复触发
		$dom.removeEventListener(document, 'DOMContentLoaded', arguments.callee);
		//执行函数
		doReady();	
	});
})();

/**
 * ajax请求
 * @param {Object} obj
 */
$dom.ajax = function(obj) {
	//创建异步对象
	let ajax = new XMLHttpRequest();
	//注册事件 onreadystatechange 状态改变就会调用
	ajax.onreadystatechange = function () {
		// readyState 0=>初始化 1=>载入 2=>载入完成 3=>解析 4=>完成
		if(ajax.readyState==4) {
			//200:交易成功  404:没有发现文件、查询或URl
			if(ajax.status==200) {
				obj.success(ajax);
			}else{
				obj.error?obj.error(ajax):console.error(ajax);
			}
		}
	};
	//设置请求的url参数,参数一是请求的类型,参数二是请求的url,可以带参数,动态的传递参数starName到服务端
	ajax.open(obj.type?obj.type:"get", obj.url, obj.async?true:false);
	//发送信息至服务器时内容编码类型
	ajax.setRequestHeader('Content-Type', obj['contentType']?obj['contentType']:'application/json');
	//发送请求
	ajax.send(obj.data?obj.data:null);
};

/**
 * 获取链接参数值
 * @param {Object} parm
 */
$dom.getUrlParm = function(parm) {
	let split = location.href.split("?");
	let parmValue = "";
	if(split.length>1) {
		split[1].split("&").forEach(judge=>{
		 	if(judge.startsWith(parm)){
				parmValue = judge.substring(parm.length+1);
			}
		});
	}
	return parmValue;
};

/**
 * sessionStorage 获取
 * @param {Object} name
 */
$dom.getSession = function(name) {
	let value = sessionStorage.getItem(name);;
	if(value && value.startsWith("#obj#")) {
		value = JSON.parse(value.substring(5));
	}
	return value;
};

/**
 * sessionStorage 存储
 * @param {Object} name
 * @param {Object} value
 */
$dom.setSession = function(name, value) {
	if(typeof value == "object") {
		value = "#obj#"+JSON.stringify(value);
	}
	sessionStorage.setItem(name, value);
};

/**
 * localStorage 获取
 * @param {Object} name
 */
$dom.getLocal = function(name) {
	let value = localStorage.getItem(name);;
	if(value && value.startsWith("#obj#")) {
		value = JSON.parse(value.substring(5),function(key, value) {
			if(typeof value=="string" && value.startsWith("#func#")) {
				return eval('(' + value.substring(6) + ')')
//				return Function('"use strict";return (' + val + ')')()
			}else {
				return value;
			}
		});
	}
	return value;
};

/**
 * localStorage 存储
 * @param {Object} name
 * @param {Object} value
 */
$dom.setLocal = function(name, value) {
	if(typeof value == "object") {
		value = "#obj#"+JSON.stringify(value,function(key,value) {
        	if(typeof value == 'function') {
				return "#func#"+value.toString();
        	}else  {
        		return value;
        	}
      	});
	}
	localStorage.setItem(name, value);
};
//$dom.obj.prototype.animate = function() {};
//$dom.obj.prototype.load = function() {};
//$dom.obj.prototype.get = function() {};
//$dom.obj.prototype.post = function() {};

//过滤选择器