$('document').ready(function(){
	window._yt_producer = new YT_Producer().Init();
});

function YT_Producer(){
	var self = this;
	this._lazy_loader = null;
	this._instrument;
	this._metronome = null;
	this._title_font_size = 5;

	this.Init = function(){
		self._metronome = new Metronome().Init('metronome');
		self._instrument = window.localStorage.getItem('INSTRUMENT');

		if(self._instrument == 'ukulele'){
			$('#id_label_instrument').html('Ukulele Lyrics Chords');
		}else if(self._instrument == 'guitar'){
			$('#id_label_instrument').html('Guitar Lyrics Chords');
		}

		$('#id_label_title_font_size').html(self._title_font_size);

		self.InitHandle();
		self.InitKeyHandle();
		self._lazy_loader = setInterval(self.LazyLoad, 500);

		return this;
	};

	this.InitKeyHandle = function(){
		$(document).keydown(function (e) {
			console.log('e.which down' + e.which);
			switch (e.which) {
				case 48: //0
					self.AutoStart();
					break;
				case 49: //1
					self.Step1();
					break;
				case 50: //2
					self.Step2();
					break;
				case 51: //3
					self.Step3();
					break;
				case 52: //4
					self.Step4();
					break;
			}
		});
	};

	this.InitHandle = function(){
		$('#id_btn_title_font_plus').on('click', function(){
			self._title_font_size++;
			$('#id_label_title_font_size').html(self._title_font_size);
			$('#id_label_title').css('font-size', `${self._title_font_size}em`);
		});
		$('#id_btn_title_font_minus').on('click', function(){
			self._title_font_size--;
			$('#id_label_title_font_size').html(self._title_font_size);
			$('#id_label_title').css('font-size', `${self._title_font_size}em`);
		});
	};

	this._auto_step = 0;
	this.AutoStart = function(){
		self._auto_step++;
		console.debug('auto Step ' + self._auto_step);

		if(self._auto_step == 1){
			setTimeout(self.AutoStart, 2000);
		}

		if(self._auto_step == 2){
			self.Step2();
			setTimeout(self.AutoStart, 3000);
		}
		if(self._auto_step == 3){
			self.Step3();
			self.Step4();
			return;
		}
	};

	this.LazyLoad = function(){
		console.debug('LazyLoad ');
		console.debug('window._chord_lyrics_sheet_control ' + window._chord_lyrics_sheet_control);
		if(window._chord_lyrics_sheet_control != undefined){
			if(window._chord_lyrics_sheet_control._sheet != null){
				console.debug('lazy load done ');
				clearInterval(self._lazy_loader);

				var capo = window._chord_lyrics_sheet_control._sheet.capo;
				if(capo == 0){
					capo = 'No';
				}
				$('#id_label_capo').html(capo);
				$('#id_label_bpm').html(window._chord_lyrics_sheet_control._sheet.bpm);

				$('#id_label_capo3').html(capo);
				$('#id_label_bpm3').html(window._chord_lyrics_sheet_control._sheet.bpm);

				$('#id_label_title2').html(window._chord_lyrics_sheet_control._sheet.title);
				$('#id_label_artist2').html(window._chord_lyrics_sheet_control._sheet.artist_name);

				var link = 'https://www.y2mate.com/youtube/' + window._chord_lyrics_sheet_control._sheet.video_id;
				$('#id_label_video_id').html(`<a href="${link}" target="_blank">[Audio Download]</a>`);

				self._metronome.SetSheet(window._chord_lyrics_sheet_control._sheet);
				window._chord_lyrics_sheet_control.SetMetronome(self._metronome);
				self.Step1();
			}
			// console.debug('window._chord_lyrics_sheet_control._sheet.capo ' + window._chord_lyrics_sheet_control._sheet.capo);
		}
	};

	this.HideAll = function(){
		console.debug('Hide All ');

		$('#id_label_instrument').hide();
		$('#id_label_title').hide();
		$('#id_label_artist').hide();
		$('#id_div_capo').hide();
		$('#id_sheet').hide();

		$('#id_div_chord_flow').hide();
		$('#id_div_chord_flow_embed').hide();
		$('#id_label_chord_chart').hide();
		$('#id_div_chord_chart').hide();

		$('#id_label_title2').hide();
		$('#id_label_artist2').hide();
		$('#id_MP_div_video').hide();
		$('#id_div_bpm').hide();
		$('#id_img_ukulele').hide();
		$('#id_img_guitar').hide();

		$('#id_div_capo3').hide();
		$('#id_div_bpm3').hide();
		$('#metronome').hide();
	};

	this.SetPosition = function(id, l, r, t, b){
		$('#'+id).css('left', l);
		$('#'+id).css('right', r);
		$('#'+id).css('top', t);
		$('#'+id).css('bottom', b);
	};

	this.Step1 = function(){
		console.debug('Step1 ');
		self.HideAll();
		$('#id_label_instrument').show();
		if(self._instrument == 'ukulele'){
			$('#id_img_ukulele').show();
		}else if(self._instrument == 'guitar'){
			$('#id_img_guitar').show();
		}

		$('#id_img_logo').css('width', '100px');
		$('#id_img_logo').css('height', '100px');
		self.SetPosition('id_img_logo', '', '50px', '', '70px');
		self.SetPosition('id_label_mango_guitar', '', '55px', '', '50px');
		self.SetPosition('id_label_mango_guitar_com', '', '40px', '', '30px');

		$('#id_step3_bottom').removeClass('border-top');

		$('#id_label_title').show();
		$('#id_label_artist').show();
		$('#id_div_capo').show();
		$('#id_div_bpm').show();
	};

	this.Step2 = function(){
		console.debug('Step2 ');
		self.HideAll();

		$('#id_img_logo').css('width', '100px');
		$('#id_img_logo').css('height', '100px');
		self.SetPosition('id_img_logo', '60px', '', '10px', '');
		self.SetPosition('id_label_mango_guitar', '', '55px', '30px', '');
		self.SetPosition('id_label_mango_guitar_com', '', '40px', '60px', '');

		$('#id_step3_bottom').removeClass('border-top');

		$('#id_label_chord_chart').show();
		$('#id_div_chord_chart').show();
	};

	this.Step3 = function(){
		console.debug('Step3 ');
		self.HideAll();

		$('#id_img_logo').css('width', '80px');
		$('#id_img_logo').css('height', '80px');
		self.SetPosition('id_img_logo', '10px', '', '10px', '');
		self.SetPosition('id_label_mango_guitar', '', '15px', '', '140px');
		self.SetPosition('id_label_mango_guitar_com', '', '15px', '', '120px');

		$('#id_MP_div_video').css('position', 'fixed');
		$('#id_MP_div_video').css('left', '694px');
		$('#id_MP_div_video').css('top', '444px');

		$('#id_step3_bottom').addClass('border-top');

		$('#id_label_title2').show();
		$('#id_label_artist2').show();
		$('#id_MP_div_video').show();
		$('#id_div_capo3').show();
		$('#id_div_bpm3').show();

		$('#id_sheet').html('');
		$('#id_sheet').css('position', 'absolute');
		// $('#id_sheet').css('width', '100%');
		$('#id_sheet').show();
		$('#metronome').show();

		window._chord_lyrics_sheet_control.Preview();

		window._chord_lyrics_sheet_control._is_small_screen = true;
		window._chord_lyrics_sheet_control._id_div_chord_flow = 'id_div_chord_flow_embed';
		window._chord_lyrics_sheet_control._ele_chord_flow = $('#id_div_chord_flow_embed');
		window._chord_lyrics_sheet_control._ele_chord_flow.show();
		window._chord_lyrics_sheet_control.DISP_ChordFlow();
	};

	this.Step4 = function(){
		console.debug('Step4 ');
		window._mango_player.Play();
	};
}