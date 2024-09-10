//# sourceURL=core/common/alert.js

$alert = function(msg, speed) {
	return $alert.hint(msg, speed);
};

/**
 * 提示文字
 */
$alert.hint = function(msg, speed=1.5) {
	let obj = $("<alert>消息</alert>");
	obj.css({
		"display" : "block",
		"background" : "#fff",
		"border" : "1px solid #ccc",
		"color" : "#1b1b78",
		"position" : 'absolute',
		"width" : "200px",
		"left" : "calc(50% - 126px)",
		"top" : "calc(50% - 100px)",
		"padding" : "20px",
		"border-radius" : "10px",
		"text-align" : "center",
		"pointer-events": "none" ,
		"z-index" : "900",
	});
	obj.text(msg);
	$("body app").append(obj);
	setTimeout(()=>{
		obj.css({
		    "transform": `translate(0px, -100px)`,
		    "transition":`transform ${speed}s`,
		});
	}, 10);
	setTimeout(()=>{
		obj.remove();
	}, speed*1000)
};

/**
 * 消息文字
 * @param {Object} msg
 */
$alert.msg = function(msg, speed) {
	let obj = $("<alert>消息</alert>");
	obj.css({
		"display" : "block",
		"background" : "#00000088",
		"border" : "0px solid #ccc",
		"color" : "#f7c060",
  		"font-family": '楷体1',
  		"font-size" : "18px",
		"position" : 'absolute',
		"width" : "400px",
		"left" : "calc(50% - 226px)",
		"top" : "calc(50% - 100px)",
		"padding" : "20px",
		"border-radius" : "10px",
		"text-align" : "left",
		"z-index" : "900",
	});
	msg = msg.replace(/\n/ig,"<br>");
	obj.html(msg);
	$("body app").append(obj);
	$(document).on('click', ()=>{
		obj.remove();
	});
	setTimeout(()=>{
		let data = obj[0].getBoundingClientRect();		
		//横屏处理
		if(typeof $move != "undefined" && $move.$landscape) {
			obj.css({
				"top" : `calc(50% - ${data.width/2+50}px)`,
			});
		}else {
			obj.css({
				"top" : `calc(50% - ${data.height/2+50}px)`,
			});
		}
	});
};

/**
 * 触发技能提示信息
 * @param {Object} msg
 * @param {Object} speed
 */
$alert.skillMsg = function(msg, speed=2) {
	let obj = $("<alert>消息</alert>");
	obj.css({
		"display" : "block",
		"font-weight" : "900",
		"font-family" : "楷体1",
		"font-size" : "21px",
		"border" : "0px solid #ccc",
		"color" : "#cd1616",
		"text-shadow": "rgb(205 152 214) 0px 1px 2px",
		"position" : 'absolute',
		"width" : "400px",
		"left" : "calc(50% - 216px)",
		"top" : "calc(50% - 100px)",
		"padding" : "20px",
		"border-radius" : "10px",
		"text-align" : "center",
		"pointer-events": "none" ,
		"z-index" : "900",
	});
	obj.text(msg);
	$("body app").append(obj);
	setTimeout(()=>{
		obj.css({
		    "transform": `translate(0px, -100px)`,
		    "transition":`transform ${speed}s`,
		});
	}, 10);
	setTimeout(()=>{
		obj.remove();
	}, speed*1000)
};
