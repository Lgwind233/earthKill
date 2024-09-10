//# sourceURL=core/common/file.js

var $file = {
	$base : '/earthKillExtends/'
};


$file.load = function(jsUrl, async=true) {
	$.ajax({
		"url" : jsUrl+'?v='+$script.$version,
		"type" : "get",
		"async" : async,//默认异步
		'success' : function(e) {
			eval(e.responseText);
		},
	});
};

$file.add = function(path, async=true) {
	let base = this.$base;
	if(path.startsWith("http") || path.startsWith("/")) base="";
	this.load(base+path, async);	
};

$file.init = function() {
	let extendsJs = $.getUrlParm("extends");
	if(extendsJs) {
		let lastIndex = extendsJs.lastIndexOf("/")+1;
		this.$base = extendsJs.substring(0, lastIndex);
	}
	this.add("extends.js", false);//同步引入
};




