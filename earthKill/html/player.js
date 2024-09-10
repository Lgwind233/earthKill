
$(()=>{
	//所有武将
	$player.allGeneral = $.getSession("kill-general");
	$player.$img = $.getSession("kill-img");	
	$player.$kingdom = $.getSession("kill-kingdom");
	let winData = $.getSession("kill-win");
	$player.$win = {};
	winData.forEach(one=>{
		$player.$win[one.name] = (one.value*100).toFixed(1)+"%";
	});
	let skill0bj = $.getSession("kill-skill");
	for(let key in skill0bj) {
		let skill = skill0bj[key];
		skill.owner.forEach(owner=>{
			let general = $player.allGeneral[owner];
			if(general && general.name==owner) {
				if(!general.$skill) general.$skill = [];
				if(!general.$skill.includes(skill)) {
					general.$skill.push(skill);
				}
			}
		});
	}
	//创建页面
	winData.forEach(one=>{
		let general = $player.allGeneral[one.name];
		$player.createHtml(general);
	});
//	$player.allGeneral.forEach(one=>{
//		$player.createHtml(one);
//	});
});

$player = {};

$player.createHtml = function(general) {
	let elem = $("<div class='general'></div>");
	$("body app").append(elem);
	//图片
	elem.append(`<img class='skin' src='${this.$img[general.name]}' />`);
	//名字
	elem.append(`<name style='background:${this.$kingdom[general.kingdom[0]]}'>${general.chineseName}</name>`);
	//体力
	let blood = $(`<blood></blood>`);
	elem.append(blood);
	//胜率
	let winNum = this.$win[general.name];
	elem.append(`<win>${winNum?winNum:"0%"}</win>`)
	
	if(general.magatama>5) {
		blood.append(`<img src='${this.$img['blood-5']}' />`);
		blood.append(`<num>&nbsp;x&nbsp;${general.magatama}</num>`)
	}else{;
		for(let bNum=0; bNum<general.magatama; bNum++) {
			blood.append(`<img src='${this.$img['blood-5']}' />`);
		}
	}
	let skillMsg='';
	general.$skill.forEach(skill=>{
		if(skillMsg!="") skillMsg+="\n";
		skillMsg+=`【${skill.name}】${skill.desc}`;
	});
//	console.log(general.$skill);
	elem.attr("title",`${general.chineseName}  ${general.magatama}体力  ${general.kingdom}  ${general.sex}\n${skillMsg}`)
	elem.on("click", (event)=>{
		$('alert').remove();
		let data = elem.attr("title");
		$alert.msg(data);
		event.stopPropagation();
	});
//	elem.append(`<kindom>${general.kingdom}</kindom>`);
//	elem.append(`<sex>${general.sex}</sex>`);
//	console.log(general);
};
