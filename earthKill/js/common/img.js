//# sourceURL=core/common/img.js

var $img ={
	$data : {},
};

$img.add = function(name, base64) {
	this.$data[name] = base64;
	//页面图标-icon
	if(name=="app") {
		$("link[rel='icon']")[0].href=base64;
	}
};

/**
 * 获取图片
 */
$img.get = function(name) {
	return this.$data[name];
};