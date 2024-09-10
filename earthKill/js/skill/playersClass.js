//# sourceURL=core/skill/playersClass.js
/**
 * 所有玩家对象
 */
$skill.playersClass = function() {};
/**
 * 获取玩家数量
 */
$skill.playersClass.prototype.size = function() {
	return Object.keys(this).length;
};
/**
 * 获取当前角色
 */
$skill.playersClass.prototype.getRoundPlayer = function() {
	return this[$game.$room.currentRoundPlayer];
};
/**
 * 获取当前角色
 * @param {Object} func
 */
$skill.playersClass.prototype.forEach = function(func) {
	let num=0;
	for(let playerName in this) {
		if(this.hasOwnProperty(playerName)){
			func(this[playerName], playerName, num++);
		}
	}
};
/**
 * 根据位置获取玩家
 * @param {Object} position
 */
$skill.playersClass.prototype.getByPosition = function(position) {
	let rPlayer=null;
	this.forEach(player=>{
		if(player.position==position) {
			rPlayer=player;
		}
	});
	return rPlayer;
};
/**
 * 获取下个回合角色
 * @param {Object} currentPosition
 */
$skill.playersClass.prototype.getNextRoundPlayer = function(currentPosition) {
	let nextPlayer = this.getByPosition(currentPosition+1);
	if(nextPlayer && nextPlayer.death) {
		nextPlayer = this.getNextRoundPlayer(currentPosition+1)
	}
	return nextPlayer;
};
