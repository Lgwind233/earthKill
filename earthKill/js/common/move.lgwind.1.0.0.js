//延时启动
setTimeout(()=>{
	$move.init();
});

/**
 * 获取对象
 * @param {Object} name 名称
 */
var $move = function(name) {
	return $move.$data[name];
};

/**
 * 初始化
 */
$move.init = function() {
	$move.$data={};
	$move.$collider=[];
	$move.run();
};

/**
 * 对象模板
 * @param {Object} name
 * @param {Object} elem
 */
$move.obj = function(name, elem) {
	this.name = name;
	this.elem = elem;
	this.x = elem.x;
	this.y = elem.y;
	this.vX = 0;
	this.vY = 0;
	this.height = elem.height;
	this.width = elem.width;
	elem.style.position='absolute';
	elem.style.left = this.x+"px";
	elem.style.top = this.y+"px";
};

$move.obj.prototype.setV = function(vX, vY) {
	this.vX = vX;
	this.vY = vY;
};

/**
 * 添加对象
 * @param {Object} name 名称
 * @param {Object} elem 元素
 */
$move.add = function(name, elem, x, y) {
	let target = new this.obj(name, elem);
	x?target.x=x:null;
	y?target.y=y:null;
	this.$data[name]=new Proxy(target, {
		get : function(target, key) {
			return target[key];
		},
		set : function(target, key, value) {
			if(key=="x") {
				target.elem.style.left=value+"px";
			}
			if(key=="y") {
				target.elem.style.top=value+"px";
			}
			target[key]=value;
		}
	});
	return this.$data[name];
};

/**
 * 添加碰撞
 * @param {Object} name
 * @param {Object} name2
 */
$move.addCollider = function(name, name2, func) {
	this.$collider.push([name, name2, func]);
};

/**
 * 模拟jquery
 * @param {Object} select
 */
let $$ =function(select) {
	return document.querySelectorAll(select);
};

/**
 * 循环动画
 */
$moveAnimate = (function(){
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function(/* function */ callback, /* DOMElement */ element){
                window.setTimeout(callback, 100 / 6);
            };
})();

/**
 * 碰撞函数
 * @param {Object} obj
 * @param {Object} Obj2
 */
$move.doCollider = function(obj, obj2, func) {
	if(obj && obj2) {
		if(obj.x>obj2.x+obj2.width || obj2.x>obj.x+obj.width
			|| obj.y>obj2.y+obj2.height || obj2.y>obj.y+obj.height){
			//未碰撞
		}else {
			//碰撞
			if(Math.abs(obj.x-obj2.x)>=Math.abs(obj.y-obj2.y)) {
//				let speed = (Math.abs(obj.vX)+Math.abs(obj2.vX))/2;
				//水平碰撞
				if(obj.x<obj2.x) {
					obj2.x=obj.x+obj.width;
					//速度变化
					obj.vX=-Math.abs(obj.vX);
					obj2.vX=Math.abs(obj2.vX);
//					obj.vX=-speed;
//					obj2.vX=speed;
				}else{				
					obj.x=obj2.x+obj2.width;	
					//速度变化	
					obj.vX=Math.abs(obj.vX);
					obj2.vX=-Math.abs(obj2.vX);
//					obj.vX=speed;
//					obj2.vX=-speed;
				}
			}else{		
//				let speed = (Math.abs(obj.vY)+Math.abs(obj2.vY))/2;			
				//垂直碰撞
				if(obj.y<obj2.y) {
					obj2.y=obj.y+obj.height;
					//速度变化
					obj.vY=-Math.abs(obj.vY);
					obj2.vY=Math.abs(obj2.vY);
//					obj.vY=-speed;
//					obj2.vY=speed;
				}else{					
					obj.y=obj2.y+obj2.height;	
					//速度变化
					obj.vY=Math.abs(obj.vY);
					obj2.vY=-Math.abs(obj2.vY);
//					obj.vY=speed;
//					obj2.vY=-speed;
				}
			}
			//碰撞后执行
			if(typeof func=='function') {
				func(obj, obj2);
			}
		}
	}
};

$move.run = function(){
	$moveAnimate($move.run);
	for(let key in $move.$data) {
		let obj = $move.$data[key];
		if(obj.vX) {
			obj.x+=obj.vX;
		}
		if(obj.vY) {
			obj.y+=obj.vY;
		}
		//世界碰撞
		if(obj.x<0) {
			obj.vX=Math.abs(obj.vX);
		}else if(obj.x+obj.width>innerWidth) {
			obj.vX=-Math.abs(obj.vX);
		}
		if(obj.y<0) {
			obj.vY=Math.abs(obj.vY);
		}else if(obj.y+obj.height>innerHeight) {
			obj.vY=-Math.abs(obj.vY);
		}
		
	}
	for(let first=0; first<$move.$collider.length; first++){
		let colliderObj = $move.$collider[first];		
		let obj = $move.$data[colliderObj[0]];
		let obj2 = $move.$data[colliderObj[1]];
		let func = colliderObj[2];
		$move.doCollider(obj, obj2, func);
	}
//	console.log("test");
};

