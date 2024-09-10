//# sourceURL=core/common/voice.js
var $voice = {
	//音量
	$volume : 1,
	//声音元素
	$data : {},
	//声音文件
	$file : {},
};

/**
 * 添加文件数据
 * @param {Object} data
 */
$voice.add = function(data, value) {
	if(typeof data == 'object') {
		Object.assign(this.$file,data);
	}else if(typeof data == "string" && value) {
		this.$file[data] = value;
	}
};

/**
 * 播放声音
 * @param {Object} voiceName
 */
$voice.play = function(voiceName) {
	let fileData = this.$file[voiceName];
	//借用声音
	while(true) {
		if(fileData && fileData.startsWith("#")) {
			fileData = this.$file[fileData.substring(1)]
		}else{
			break;
		}
	}
	if(fileData) {
		this.playByData(fileData)
	}else if(fileData===void(0)){
		$alert("声音文件不存在："+voiceName);
	}
};

/**
 * 播放声音数据
 * @param {Object} voiceData
 */
$voice.playByData = function(voiceData) {
	//若没有缓存文件，则新生成一个文件播放声音并缓存
	if(this.$data[voiceData]==null) {
		this.$data[voiceData] = this.createElem(voiceData);
	}
	//若缓存的文件正在播放，则新生成一个文件播放声音
	else if(!this.$data[voiceData].paused) {
		this.createElem(voiceData);
	}
	//播放缓存的文件
	else {
		this.$data[voiceData].play();
	}
};

/**
 * 创建元素并播放声音数据
 * @param {Object} voiceData
 */
$voice.createElem = function(voiceData) {
	var audioElem = document.createElement('audio');
   	audioElem.setAttribute('src', voiceData);
    audioElem.setAttribute('autoplay', 'autoplay'); //打开自动播放
	//加载后播放
	audioElem.addEventListener("load", function() {
		audioElem.play();
	}, true);
	//设置音量
	if(audioElem.volume!=this.$volume) {
		if(isNaN(this.$volume)) {
			this.$volume = 1;
		}else if(this.$volume>1) {
			this.$volume = 1;
		}else if(this.$volume<0) {
			this.$volume = 0;
		}
		audioElem.volume = this.$volume;
	}
	return audioElem;
};
