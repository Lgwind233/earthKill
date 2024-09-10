//# sourceURL=core/common/model.js

var $model = {};

setTimeout(()=>{
	$model.init();
});

/**
 * 模式框架初始化
 */
$model.init = function() {
	let model = $("<div class='model'></div>");
	this.$model = model;
	this.$data = {};
	let tempData = $.getLocal('/earthKill/modelData');
	if(tempData) {
		Object.keys(tempData).forEach(name=>{
			this.add(name, tempData[name]);
		});
	}
	$("body app").append(model);
	//默认隐藏
	this.$model.hide();
	//模式按钮点击事件
	this.click();
	//获取已选模式名称
	let modelName = $.getLocal('/earthKill/modelName');
	if(this.$data[modelName]!=null) {
		//模式名称页面则显示模式
		if(window.location.search==this.$data[modelName]) {
			$(".modelBtn").text("模式："+modelName);
			this.$modelName = modelName;
		}else{
			//非模式名称页面判断页面所属的模式名称
			Object.keys(this.$data).forEach(name=>{
				if(this.$data[name]==window.location.search) {
					$(".modelBtn").text("模式："+name);
				}
			});
		}
	}
	//添加模式
//	this.add("4v4", '?playerNum=8');
//	this.add("3v3", '?playerNum=6');
//	this.add("2v2", '?playerNum=4');
//	this.add("1v1", '?playerNum=2');
//	this.add("ikun", '?extends=/ikunKill/');
};

/**
 * 模式点击事件
 */
$model.click = function() {
	let btn = $(".modelBtn");	
	btn.on('click', (e)=>{
//		$alert(this.$model.css('display'));
		if(this.$model.css('display')=='none') {
			this.$model.show();
		}else{
			this.$model.hide();
		}
		e.stopPropagation();
	});
//	btn.on('mouseenter',()=>{
//		this.$model.show();
//	});
	this.$model.on('mouseleave', ()=>{
		this.$model.hide();
	});	
	$("app").on('click', ()=>{
		this.$model.hide();
	});
};

/**
 * 添加模式
 * @param {Object} name
 * @param {Object} url
 */
$model.add = function(name, url) {
	//不添加重复模式
	if(!this.$data[name]) {
		this.$data[name]=url;
		//缓存模式
		$.setLocal('/earthKill/modelData', this.$data);
		let obj = $(`<div class='name' name='${name}'>${name}</div>`);
		obj.on('click', ()=>{
			//保存模式名称
			$.setLocal('/earthKill/modelName', name);
			open(url, '_self');
		});
		this.$model.append(obj);
	}
};
