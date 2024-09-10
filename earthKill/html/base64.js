
var $base64 = {
	$file : null,
};

/**
 * 拖拽事件
 * @param {Object} func
 */
$base64.drag = function(func, isHex) {
	// 防止浏览器默认行为
	document.addEventListener('dragenter', function(e) {
		e.preventDefault();
	});	
	document.addEventListener('dragover', function(e) {
		e.preventDefault();
	});	
	document.addEventListener('dragleave', function(e) {
		e.preventDefault();
	});	
	// 拖拽释放
	document.addEventListener('drop', function(e) {
		e.preventDefault();
	});
	// 拖拽释放
	document.addEventListener('drop', (e) => {
		e.preventDefault();
		let files = e.dataTransfer.files;
		this.readFile(files[0], (base64Data, eRead)=>{
			func(base64Data, eRead, e);
		}, isHex);
	});
};

/**
 * 读取文件
 * @param {Object} file
 * @param {Object} func
 */
$base64.readFile = function(file, func, isHex) {
	this.$file=file;
	let reader = new FileReader();
	//读取文件数据
	reader.readAsDataURL(file);
	reader.onload = (e) => {
		//获得base64文件数据
		this.$base64Data = e.target.result;
		if(typeof func == "function") {
			func(isHex?this.toHex():this.$base64Data, e);	
		}
	};
};

$base64.toHex = function(data=this.$base64Data.substring(this.$base64Data.indexOf(",")+1)) {
	//解码Base64字符串为二进制数据
	let binaryStr = atob(data);
	//存储二进制数据
	let unit8Array = new Uint8Array(binaryStr.length);
	for(let i=0; i<binaryStr.length; i++) {
		unit8Array[i] = binaryStr.charCodeAt(i);
	}
	let hexStr = "";
	unit8Array.forEach(u=>{
		hexStr += u.toString(16).padStart(2,"0");
	});
	return hexStr;
};
