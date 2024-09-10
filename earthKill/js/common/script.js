//# sourceURL=common/script.js

$script = {
	$data : [],	
};

//获取版本号
$.ajax({
	"url" : 'js/common/version.js?v='+Math.random(),
	"type" : "get",
	"async" : false,//同步
	'success' : (e) => {
		$script.$version = e.responseText;
	},
});

/**
 * 添加脚本文件
 * @param {Object} script
 */
$script.add = function(...jsUrlArray) {
	jsUrlArray.forEach(jsUrl=>{
		if(typeof jsUrl == "function"){
			this.$data.push(jsUrl);
		}else{
			$.ajax({
				"url" : jsUrl+`?v=${this.$version}`,
				"type" : "get",
				"async" : false,//同步
				'success' : (e) => {
					this.$data.push(e.responseText);
				},
			});
		}		
	});
};


/**
 * 统一执行脚本文件
 */
$script.exe = function() {
	//反序
	this.$data.reverse();
	while(this.$data.length>0) {
		let script = this.$data.pop();
		if(typeof script=="function") {
			eval('('+script.toString()+")()");
		}else{
			//执行
			eval(script);
		}
	}
};