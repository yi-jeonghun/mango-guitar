$('#document').ready(function(){
	window._head_control = new HeadControl().Init();
});

function HeadControl(){
	var self = this;

	this.Init = function(){
		return this;
	};

	this.LoadHandle = function(){
	};

	this.OpenMenu = function(){
		$('#id_head_menu').show();
	};

	this.CloseMenu = function(){
		$('#id_head_menu').hide();
	};
}
