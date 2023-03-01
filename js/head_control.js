$('#document').ready(function(){
	window._head_control = new HeadControl().Init();
});

function HeadControl(){
	var self = this;

	this.Init = function(){
		self.LazyInit();
		return this;
	};

	this.LazyInit = function(){
		// console.debug('lazy init ');
		var ele_guitar = document.getElementById('id_btn_guitar');
		var ele_ukulele = document.getElementById('id_btn_ukulele');

		if(ele_guitar == null || ele_ukulele == null){
			setTimeout(self.LazyInit, 300);
		}else{
			self.LoadInstrument();
		}
	};

	this.LoadInstrument = function(){
		var instrument = window.localStorage.getItem('INSTRUMENT');
		console.debug('instrument ' + instrument);
		if(instrument == 'guitar'){
			self.ChooseGuitar();
		}else if(instrument == 'ukulele'){
			self.ChooseUkulele();
		}
	};

	this.OpenMenu = function(){
		$('#id_head_menu').show();
	};

	this.CloseMenu = function(){
		$('#id_head_menu').hide();
	};

	this.ChooseGuitar = function(){
		// console.debug('choose guitar ');
		$('#id_btn_guitar').removeClass('badge-light');
		$('#id_btn_guitar').addClass('badge-danger');

		$('#id_btn_ukulele').removeClass('badge-danger');
		$('#id_btn_ukulele').addClass('badge-light');
		window.localStorage.setItem('INSTRUMENT', 'guitar');
	};
	this.ChooseUkulele = function(){
		// console.debug('choose ukulele ');
		$('#id_btn_guitar').removeClass('badge-danger');
		$('#id_btn_guitar').addClass('badge-light');

		$('#id_btn_ukulele').removeClass('badge-light');
		$('#id_btn_ukulele').addClass('badge-danger');
		window.localStorage.setItem('INSTRUMENT', 'ukulele');
	};
}
