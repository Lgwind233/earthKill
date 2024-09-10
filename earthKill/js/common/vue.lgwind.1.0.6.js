//# sourceURL=common/vue.lgwind.js

//隐藏页面避免被发现渲染前的页面
document.write(`<style id='v-body'>body{display:none;opacity:0}</style>`);
//dom加载完成时
document.addEventListener('DOMContentLoaded',function() {
	//注销时间，避免反复触发
	document.removeEventListener('DOMContentLoaded', arguments.callee, false);
	//消除隐藏页面证据-显示页面
	document.getElementById("v-body").remove();
	//执行函数
	$vue.init();
}, false);

/**
 * 代理对象
 * @param {Object} obj
 */
var $vue = function(obj) {
	if(obj.methods) {
		Object.assign(obj.data, obj.methods);
	}
	$vue.$data = $vue.proxy(obj.data);
	return $vue.$data;
};

/**
 * 对象代理
 * @param {Object} obj
 */
$vue.proxy = function(obj, dataName) {
	//对象添加代理
	if(typeof obj == "object") {
		for(let key in obj) {
			if(obj.hasOwnProperty(key)){
				if(typeof obj[key] == "object" && !key.startsWith("$")){
					let newDataName = dataName==null?key:dataName+"."+key;
					obj[key]=this.proxy(obj[key], newDataName);
				}
			}
		}
		//阻止重复代理
		if(obj["$vue"]) {
			return obj;
		}
		return new Proxy(obj, {
			get : function(obj, key) {
				//用于判断是否重复代理
				if(key=="$vue") {
					return true;
				}
				return obj[key];
			},
			set : function(obj, key, value) {
				if(obj[key]==value) return true;
				let newDataName = dataName==null?key:dataName+"."+key;
				if(obj instanceof Array){
					newDataName = dataName==null?key:dataName;
				}
				if(key.startsWith("$")){
					obj[key] = value;
				}else{
					//对象添加代理
					obj[key] = $vue.proxy(value, newDataName);
				}
				//确认修改一次
				if(!$vue.canExe) $vue.canExe={};
				$vue.canExe[newDataName]=true;
	        	setTimeout(()=>{  
					//使用canExe字段保证执行一次
					if(!$vue.canExe[newDataName]){
						return;
					}
					$vue.canExe[newDataName]=false;
					//更新虚拟dom
					$vue.exeVirtualDom(newDataName);
//					console.log(newDataName);
	        	},0);
				return true;
			},
		});
	}else {
		return obj;
	}
};

/**
 * 执行{{}}语句
 * @param {Object} exeStr 表达式
 * @param {Object} dataKeys 元素关联的数据数组
 */
$vue.eval = function(exeStr, dataKeys=[], dom){
	let before = "";
	dataKeys.forEach(key=>{
		if(this.$data.hasOwnProperty(key)){
			before += `let ${key} = `;
			let value = this.$data[key];
			typeof value=="function"?before+=`function(a,b,c,d,e) {return $vue.$data.${key}(a,b,c,d,e);};`:before+=`$vue.$data.${key};`;
		}else if(dom.$data[key]!=null){
			before += `let ${key} = `;
			before += dom.$data[key]+`;`;
		}
	});
	let exeString = before + exeStr;
	try{
		let result = eval(exeString)
		return result==void 0?"":result;
	}catch(e){
		console.log(exeString);
		console.error(e);
	}
	return null;
};

/**
 * 初始化
 */
$vue.init = function(){
	//默认值
	if(!this.$data) {
		this({data : {}});
	}
	//获取虚拟dom对象，初步处理
	this.$dom = this.getVirtualDom(document.querySelector('html'), true);
	//处理虚拟dom对象
	this.dealVirtualDom(this.$dom);
	//设置默认值
	this.exeVirtualDom("$vue");
	this.exeVirtualDom("$forVue");
};

/**
 * 执行dom
 * @param {Object} dom
 */
$vue.exeVirtualDom = function(key, dom=this.$dom?this.$dom:{}) {
	dom.model&&dom.modelFunc(key);
	dom.expr&&dom.exprFunc(key);
	dom.bind&&dom.bindFunc(key);
	dom.show&&dom.showFunc(key);
	dom.if&&dom.ifFunc(key);
	dom.for&&dom.forFunc(key);
	//有子项则遍历
	if(dom.children) {
		dom.children.forEach(item=>{
			//递归遍历
			this.exeVirtualDom(key, item);
		});
	}
};

/**
 * v-model实现
 * @param {Object} dom
 */
$vue.dealModel = function(dom) {
	//缓存数据
	dom.modelData={};
	//绑定程序内部变量 - 元素相关数据
	dom.modelData.exprData = this.getExprData(dom.model, dom.$data);
	dom.modelData.exprDataVar = this.getExprDataVar(dom.modelData.exprData);
	//添加监听器
	dom.elem.addEventListener("input", (e)=>{
		let content = e.target.value;
		//值改变时修改对象
		eval(`this.$data.${dom.model}=content`);
	}, false);//默认事件冒泡
	//绑定程序
	dom.modelFunc = (key) => {
		if(dom.modelData.exprData.includes(key) || key=="$vue") {
			let newExprValue = this.eval(dom.model, dom.modelData.exprDataVar, dom);
			if(newExprValue!=dom.elem.value) {
				dom.elem.value = newExprValue;
			}
		}
	};
};

/**
 * 表达式{{}}实现
 * @param {Object} dom
 */
$vue.dealExpr = function(dom) {
	//缓存数据
	dom.exprData = {};
	//绑定程序内部变量 - 元素相关数据
	dom.exprData.exprData = this.getExprData(dom.expr, dom.$data);
	dom.exprData.exprDataVar = this.getExprDataVar(dom.exprData.exprData);
	//表达式数组
	dom.exprData.exprArray = [];
	{//遍历表达式
		let newExprValue=dom.expr;
		while(newExprValue.includes("{{") && newExprValue.includes("}}")) {
			let start = newExprValue.indexOf("{{")+2;
			let end = newExprValue.indexOf("}}");
			if(start<=end) {
				let expr = newExprValue.substring(start, end);
				dom.exprData.exprArray.push(expr);
				newExprValue = newExprValue.replace(`{{${expr}}}`,"");
			}else{
				newExprValue = newExprValue.substring(end+2);
			}
		}
	}
	//绑定程序
	dom.exprFunc = (key) => {
		if(dom.exprData.exprData.includes(key) || key=="$vue") {
			let newExprValue=dom.expr;
			dom.exprData.exprArray.forEach(expr=>{
				newExprValue = newExprValue.replace(`{{${expr}}}`,this.eval(expr, dom.exprData.exprDataVar, dom));
			});
			if(newExprValue!=dom.elem.nodeValue) {
				dom.elem.nodeValue = newExprValue;
			}
		}
	};
};

/**
 * v-show实现
 * @param {Object} dom
 */
$vue.dealShow = function(dom) {
	//缓存数据
	dom.showData = {};
	//绑定程序内部变量 - 元素相关数据
	dom.showData.exprData = this.getExprData(dom.show, dom.$data);
	dom.showData.exprDataVar = this.getExprDataVar(dom.showData.exprData);
	//表达式缓存值
	dom.showData.exprValue=null;
	//绑定程序
	dom.showFunc = (key) => {
		if(dom.showData.exprData.includes(key) || key=="$vue") {		
			let newExprValue = this.eval(dom.show, dom.showData.exprDataVar, dom);
			if(newExprValue!=dom.showData.exprValue) {
				dom.showData.exprValue = newExprValue;
				if(newExprValue){
					dom.elem.style["display"]="";
				}else{
					dom.elem.style["display"]="none";
				}
			}
		}
	};
};

/**
 * v-bind实现
 * @param {Object} dom
 */
$vue.dealBind = function(dom) {	
	//绑定程序数组
	dom.bindData = [];
	for(let bindKey in dom.bind) {
		//绑定程序内部变量 - 表达式
		let bindValue = dom.bind[bindKey];
		//绑定程序内部变量 - 元素相关数据
		let exprData = this.getExprData(bindValue, dom.$data);
		let exprDataVar = this.getExprDataVar(exprData);
		//绑定程序
		let oneBindFunc = (key, oneBindData) => {			
			if(oneBindData.exprData.includes(key) || key=="$vue") {
				let newExprValue = this.eval(oneBindData.bindValue, oneBindData.exprDataVar, dom);
				if(newExprValue!=dom.elem.getAttribute(bindKey)) {
					dom.elem.setAttribute(bindKey, newExprValue);
				}
			}
		};
		dom.bindData.push({
			exprData : exprData,
			exprDataVar : exprDataVar,
			bindValue : bindValue,
			func : oneBindFunc,
		});
	}
	//绑定程序
	dom.bindFunc = (key) => {
		dom.bindData.forEach(oneBindData=>{
			oneBindData.func(key, oneBindData);
		});
	};
};

/**
 * v-on实现
 * @param {Object} dom
 */
$vue.dealOn = function(dom) {
	//绑定程序数组
	dom.onData={};
	//绑定程序数组
	for(let onKey in dom.on) {
		//绑定事件内部变量 - 表达式
		let onValue = dom.on[onKey];
		//绑定事件内部变量 - 元素相关数据
		let exprData = this.getExprData(onValue, dom.$data);
		let exprDataVar = this.getExprDataVar(exprData);
		dom.onData[onKey] = {
			onValue : onValue,
			exprData : exprData,
			exprDataVar : exprDataVar,
		};
		//添加事件
		dom.elem.addEventListener(onKey, ()=>{
			//执行表达式
			this.eval(dom.onData[onKey].onValue, dom.onData[onKey].exprDataVar, dom);
		}, false);//默认事件冒泡
	}
};

/**
 * v-if实现
 * @param {Object} dom
 */
$vue.dealIf = function(dom) {
	//缓存数据
	dom.ifData = {};
	//表达式
	dom.ifData.expr = `if(${dom.if}) {0}`;
	dom.elseDom.forEach((oneDom,index)=>{
		if(oneDom.elseIf) {
			dom.ifData.expr += `else if(${oneDom.elseIf}) {${index+1}}`;
		}else{
			dom.ifData.expr += `else {${index+1}}`;
		}
	});
	//绑定事件内部变量 - 元素相关数据
	dom.ifData.exprData = this.getExprData(dom.ifData.expr, dom.$data);
	dom.ifData.exprDataVar = this.getExprDataVar(dom.ifData.exprData);
	//绑定函数
	dom.ifData.showElem = dom.elem;
	dom.ifFunc = (key) => {
		if(dom.ifData.exprData.includes(key) || key=="$vue") {		
			let resultNum = this.eval(dom.ifData.expr, dom.ifData.exprDataVar, dom);
			let changeElem=dom.elem;
			if(resultNum>0) {
				changeElem=dom.elseDom[resultNum-1].elem;
			}
			let showElem = dom.ifData.showElem;
			if(showElem!=changeElem){
				showElem.parentNode.insertBefore(changeElem,showElem);
				showElem.remove();
				dom.ifData.showElem = changeElem;
			}
		}
	};
};

/**
 * v-for实现
 * @param {Object} dom
 */
$vue.dealFor = function(dom) {
	//缓存数据
	dom.forData = {};
	//绑定事件内部变量 - 元素相关数据
	dom.forData.exprData = this.getExprData(dom.for, dom.$data);
	dom.forData.exprDataVar = this.getExprDataVar(dom.forData.exprData);
	dom.children = [];
	//子项生成
	dom.forData.forItemFunc = (value, key, index) => {
		//复制节点
		let node = dom.forNode.cloneNode(true);
		//插入节点
		dom.elem.parentNode.insertBefore(node, dom.elem);
		//生成虚拟dom
		let nodeDom = this.getVirtualDom(node, true);
		dom.children.push(nodeDom);
		//添加作用域变量
		dom.$data?nodeDom.$data={...dom.$data}:nodeDom.$data={};	
		nodeDom.$data[forObj.value]=`${forObj.obj}['${key}']`;
		if(forObj.key) {
			nodeDom.$data[forObj.key]=typeof key=="string"?"'"+key+"'":key;
			if(forObj.index) {
				nodeDom.$data[forObj.index]=index;
			}
		}
		//处理虚拟dom
		this.dealVirtualDom(nodeDom);
		//执行dom
		this.exeVirtualDom('$vue',nodeDom);
		this.exeVirtualDom("$forVue",nodeDom);
	};
	let forObj = (()=>{
		let forV = dom.for.split(" in ");
		let forSplit = forV[0].trim().replace(/[()]/ig,"").split(",");
		return {
			value : forSplit[0].trim(),
			key   : forSplit.length>1?forSplit[1].trim():null,
			index : forSplit.length>2?forSplit[2].trim():null,
			obj   : forV[1].trim(),
		}
	})();
	//绑定程序
	dom.forFunc = (key) => {
		let beforeKey = key.lastIndexOf(".")==-1?"$forBefore":key.substring(0,key.lastIndexOf("."));
		if(dom.forData.exprData.includes(key) || dom.forData.exprData.includes(beforeKey) ||  key=="$forVue") {		
			let newLength = this.eval(`Object.keys(${forObj.obj}).length`, dom.forData.exprDataVar, dom)
			//数量变化时更改
			if(dom.children.length != newLength) {
				if(dom.children.length>newLength) {
					//减少
					while(dom.children.length>newLength) {
						dom.children.pop().elem.remove();
					}
				}else{
					//增加
					let index=0;
					let allItems = this.eval(`${forObj.obj}`, dom.forData.exprDataVar, dom);
					for(let oneItem in allItems) {
						if(allItems.hasOwnProperty(oneItem)){
							index++;
							if(index>dom.children.length) {
							   	dom.forData.forItemFunc(allItems[oneItem], oneItem, index-1);
						   	}
						}
					}
				}
			}
		}
	};
};

/**
 * 处理dom对象
 */
$vue.dealVirtualDom = function(dom={}) {
	//有子项则遍历
	if(dom.children) {
		dom.children.forEach(item=>{
			if(dom.$data) {
				item.$data?Object.assign(item.$data, dom.$data):item.$data={...dom.$data};
			}
			//递归遍历
			this.dealVirtualDom(item);
		});
	}
	//v-model实现
	dom.model&&this.dealModel(dom);
	//{{}}实现
	dom.expr&&this.dealExpr(dom);
	//v-show实现
	dom.show&&this.dealShow(dom);
	//v-bind实现
	dom.bind&&this.dealBind(dom);
	//v-on实现
	dom.on&&this.dealOn(dom);
	//v-if实现
	dom.if&&this.dealIf(dom);
	//v-for实现
	dom.for&&this.dealFor(dom);
};


/**
 * 获取虚拟dom对象
 * @param {Object} pNode
 */
$vue.getVirtualDom = function(pNode, root) {
	//不访问v-body标签里的内容
	if(pNode.localName=="v-body") {
		return null;
	}
	//虚拟dom
	let virtualDom={
		elem : pNode,
		children : []
	};
	let allAttr = pNode.getAttributeNames();
	let childNodes = pNode.childNodes;
	//查找v-for
	if(allAttr.includes("v-for")){
		virtualDom.for=pNode.getAttribute("v-for").trim();
		pNode.removeAttribute("v-for");
		//记录节点模板，避免破坏
		virtualDom.forNode = pNode.cloneNode(true);
		//替换节点
		virtualDom.elem = document.createComment("v-for");
		pNode.parentNode.insertBefore(virtualDom.elem, pNode);
		pNode.remove();
		//阻止继续创建虚拟dom
		allAttr=[];
		childNodes=[];
	}
	allAttr.forEach(oneAttr=>{
		let isRemove=true;
		//查找v-if
		if(oneAttr=="v-if") {
			virtualDom.if=pNode.getAttribute(oneAttr);
			virtualDom.elseDom=[];
			//下一个节点
			let nextElem = pNode.nextElementSibling;
			while(nextElem && nextElem.getAttribute("v-else-if")!=null){
				virtualDom.elseDom.push({
					elem:nextElem,
					elseIf:nextElem.getAttribute("v-else-if")
				});
				let addElem = nextElem;
				nextElem = nextElem.nextElementSibling;
				//移除相关属性
				addElem.removeAttribute('v-else-if');
				addElem.remove();
			}
			//v-else节点
			if(nextElem && nextElem.getAttribute("v-else")!=null){
				virtualDom.elseDom.push({
					elem:nextElem
				});
				//移除相关属性
				nextElem.removeAttribute('v-else');
				nextElem.remove();
			}else{//空节点
				virtualDom.elseDom.push({
					elem:document.createComment("v-if")
				});
			}
		}
		//查找v-model
		else if(oneAttr=="v-model") {
			virtualDom['model']=pNode.getAttribute(oneAttr);
		}
		//查找v-show
		else if(oneAttr=="v-show") {
			virtualDom['show']=pNode.getAttribute(oneAttr);
		}	
		//查找v-bind
		else if(oneAttr.search(new RegExp(`\\bv-bind:|:\\b`))===0) {
			if(!virtualDom.bind) virtualDom.bind ={};
			let key = oneAttr.replace(/v-bind:|:/ig,"");
			virtualDom.bind[key]=pNode.getAttribute(oneAttr);		
		}
		//查找v-on
		else if(oneAttr.search(new RegExp(`\\bv-on:|@\\b`))===0) {
			if(!virtualDom.on) virtualDom.on ={};
			let key = oneAttr.replace(/v-on:|@/ig,"");
			virtualDom.on[key]=pNode.getAttribute(oneAttr);		
		}	
		else{
			isRemove = false;
		}
		if(isRemove) {
			//移除相关属性
			pNode.removeAttribute(oneAttr);
		}		
	});
	childNodes.forEach(item=>{
		//文字节点
		if(item.nodeType == 3) {
			//查找{{}}
			if(/{{((.|\n)+?)}}/.test(item.nodeValue)){
				virtualDom.children.push({
					elem : item,
					expr : item.nodeValue.replace(/[\n\r\t]/ig,'')
				});
			}
		}else if(item.nodeType == 1) {//元素节点
			//递归遍历
			let nextVirtualDom = this.getVirtualDom(item);
			if(nextVirtualDom){
				virtualDom.children.push(nextVirtualDom);
			}
		}
	});
	if(virtualDom.children.length==0) {
		delete virtualDom.children;
	}else if(virtualDom.children.length==1 && !root) {
		//删除中间无用节点
		if(Object.keys(virtualDom).length==2) {
			virtualDom = virtualDom.children[0];
		}
	}
	//若无引用相关变量且非根节点，则删除
	if(Object.keys(virtualDom).length==1 && !root) {
		return null;
	}
	return virtualDom;
};

/**
 * 分割代码
 * @param {Object} code
 */
$vue.splitCode = function(code) {
	let result = [];
	let codeLength = code.length;
	let word = "";
	for(let first=0; first<codeLength; first++){
		let letter = code[first];
		if(/[0-9a-zA-Z\.]/.test(letter)) {
			word+=letter;
		}else if("["==letter || "]"==letter) {
			word+=".";
		}else if("$"==letter) {
			word+="$";
		}else if(word.length>0){
			if(word[word.length-1]==".") {
				word = word.substring(0,word.length-1);
			}
			if(word.startsWith("this.")) {
				word = word.substring(5);
			}
			//添加字符
			result.push(word);
			word = "";
		}
	}
	if(word.length>0){
		//添加字符
		result.push(word);
	}
	return result;
};

$vue.getExprDataVar = function(exprData) {
	let exprDataVar=[];
	exprData.forEach(data=>{
		let word = data.indexOf(".")==-1?data:data.substring(0, data.indexOf("."));
		if(!exprDataVar.includes(word)) {
			exprDataVar.push(word);
		}
	});
	return exprDataVar;
};

/**
 * 查找变量
 * @param {Object} code
 * @param {Object} domObj
 */
$vue.getExprData = function(code, domObj={}, nextFunc=true, first=true) {
	//分割code
	let splitCode = this.splitCode(code);
	let dataObj = this.$data;
	let exprData=[];
	for(let dataKey in dataObj){
		splitCode.forEach(word=>{
			if(word == dataKey || word.substring(0, word.indexOf("."))==dataKey ) {
				if(!exprData.includes(word)) {
					//添加
					exprData.push(word);
				}
				//访问函数代码
				if(typeof dataObj[dataKey] == "function" && nextFunc){
					let funcCode = dataObj[dataKey].toString();					
					this.getExprData(funcCode, domObj, false, false).forEach(funcWord=>{
						if(!exprData.includes(funcWord)) {
							exprData.push(funcWord);
						}
					});
				}
			}
		});
	}
	for(let dataKey in domObj){
		splitCode.forEach(word=>{
			if(word == dataKey || word.substring(0, word.indexOf("."))==dataKey ) {
				if(!exprData.includes(word)) {
					//递归遍历
					this.getExprData(domObj[dataKey], domObj, true, false).forEach(nextWord=>{
						if(!exprData.includes(nextWord)) {
							exprData.push(nextWord);
						}
					});
					//添加
					exprData.push(word);
					let dataValue = word.replace(dataKey, domObj[dataKey]).replace(/\[|\]/ig,".").replace(/['"]/g,"").replace(/\.\./g,".");
					if(!exprData.includes(dataValue) && !/^\d+$/.test(dataValue)) {
						exprData.push(dataValue);
					}
				}
			}
		});					
	}				
	//处理结果
	if(first) {
		exprData.forEach(word=>{
			while(word.lastIndexOf(".")!=-1) {
				word = word.substring(0, word.lastIndexOf("."));
				if(!exprData.includes(word)) {
					//添加
					exprData.push(word);
				}
			}
		});
	}
	if(first && exprData.length==0) {
		console.error('exprData不能为空！代码段：'+code);
	}
	return exprData;
};

/**
 * ajax请求
 * @param {Object} obj
 */
$vue.ajax = function(obj) {
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