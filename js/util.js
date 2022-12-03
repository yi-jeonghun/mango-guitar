function GetURLParam(name){
	var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
	if (results==null) {
		return null;
	}
	return decodeURI(results[1]) || 0;
};

function DateYMD(date_str){
	var ret = date_str.split('T')[0];
	return ret;
}