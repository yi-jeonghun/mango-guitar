$(document).ready(function () {
	window._chordPlayerControl = new ChordPlayerControl();
	_chordPlayerControl.Init();
});

function PlayChord(chord){
	_chordPlayerControl.PlayChord1(chord);
};

function ChordPlayerControl() {
	var self = this;
	this._music = null;
	this._chord_chart = [];
	this._chord_list = [];
	this._font_size = 16;
	this._chordManager = null;
	this._musicXMLPlayer = null;
	this._chordDB = null;
	this._scrolling = false;
	this._time_in_milli = 0;
	this._elapsed_time = parseInt(0);
	this._speed = 5;
	this._scroll_frequency = 50;
	this._stop_scroll = false;
	this._transpose = 0;
	this._chord_opened = false;
	this._isFavorite = false;
	this._music_info = new MusicSimpleInfo();
	this._ID = null;
	this._is_inline_type = false;

	this.Init = function(){
		self.InitComponentHandle();
		self._chordDB = new ChordDB();
		self._musicXMLPlayer = new MusicXMLPlayer(null, null, null);
		self._musicXMLPlayer.Init();
		self._musicXMLPlayer.LoadInstruments();
		self._chordManager = new ChordManager();

		var music_param = self.GetURLParam('music');
		if(music_param != null){
			self.LoadOldTypeMusic(music_param);
		}else{
			self._ID = self.GetURLParam('ID');
			self.LoadNewTypeMusic();
		}
	};

	this.LoadOldTypeMusic = function(music_param){
		var singer = music_param.split('-')[0].trim();
		var title = music_param.split('-')[1].trim();
		var url = '/sheet_music_api/get_ID?singer='+singer+'&title='+title;
		$.get(url, null, function(res){
			if(res.ok){
				self._ID = res.ID;
				self.LoadNewTypeMusic();
			}else{
				alert(res.reason);
			}
		});
	};

	this.LoadNewTypeMusic = function(){
		var url = '/sheet_music_api/sheet_music?ID='+self._ID;
		$.get(url, null, function(data){
			console.log(data);
			if(data.ok){
				self._music = data.data;
				{
					self._music_info.type = MUSIC_TYPE.CHORD_TXT;
					self._music_info.singer = self._music.singer;
					self._music_info.title = self._music.title;
				}

				self._isFavorite = data.is_favorite;
				console.log('self._isFavorite ' + self._isFavorite);
				if(self._isFavorite){
					$('#id_player_favorite_icon').addClass('favorite');
				}

				self.DisplayTitle();
				self.GatherChords();

				//console.log('width ' + screen.width);
				if(self._music.font_size != undefined && self._music.font_size != null){
					if(screen.width <= 360)
						self._font_size = self._music.font_size;
				}

				if(self._music.inline_type == 'Y')
					self._is_inline_type = true;

				console.log('self._is_inline_type ' + self._is_inline_type);

				self.UpdateFontSize();

				self.DisplayCapo();
				self.Display();
			}
		});

		self.UpdateShareText();
	};

	this.UpdateShareText = function(){
		var text = '<iframe width="560" height="560" ';
		text += 'src="https://www.guitarok.net/ChordPlayer.html?ID=' + self._ID + '" ';
		text += ' frameborder="0"></iframe>';
		$('#id_share_text').text(text);
	};

	this.DisplayCapo = function(){
		if(self._music.capo != undefined && self._music.capo != null){
			if(self._music.capo > 0){
				$('#id_capo_text').text('Capo ' + self._music.capo);
			}
		}
	};

	this.UpdateFontSize = function(){
		$('#id_font_text').text(self._font_size);
		$('#id_sheet').css("font-size", self._font_size+'px');
	};

	this.InitComponentHandle = function(){
		$('#id_player_button_play').on('click', self.OnClickAutoScroll);
		$('#id_speed_minus_btn').on('click', self.OnClickSpeedMinus);
		$('#id_speed_plus_btn').on('click', self.OnClickSpeedPlus);
		$('#id_transpose_minus_btn').on('click', self.OnClickTransposeMinus);
		$('#id_transpose_plus_btn').on('click', self.OnClickTransposePlus);
		$('#id_speed_text').text(self._speed);
		$('#id_chord_open_btn').on('click', self.OnClickChordOpenButton);
		$('#id_font_minus_btn').on('click', self.OnClickFontMinus);
		$('#id_font_plus_btn').on('click', self.OnClickFontPlus);
		$('#id_player_button_favorite').on('click', self.OnClickFavorite);
	};

	this.OnClickFavorite = function(){
		if(window._auth_control._user_info == null){
			alert('로그인이 필요합니다.');
			return;
		}

		var set = self._isFavorite ? '0' : '1';
		var url = '/sheet_music_api/set_favorite?ID=' + self._ID + '&set='+set;

		if(self._isFavorite){
			$.get(url, null, function(res){
				if(res.ok){
					self._isFavorite = false;
					$('#id_player_favorite_icon').removeClass('favorite');
				}
			});
		}else{
			$.get(url, null, function(res) {
				if(res.ok){
					self._isFavorite = true;
					$('#id_player_favorite_icon').addClass('favorite');
				}
			});
		}
	};

	this.OnClickFontPlus = function(){
		self._font_size++;
		self.UpdateFontSize();
		self.Display();
	};

	this.OnClickFontMinus = function(){
		if(self._font_size > 5)
			self._font_size--;
		self.UpdateFontSize();
		self.Display();
	};

	this.OnClickChordOpenButton = function(){
		if(self._chord_opened == false){
			self.DisplayChords();
			$('#id_chord_open_icon').removeClass('fa-caret-down');
			$('#id_chord_open_icon').addClass('fa-caret-up');
		}else{
			self.HideChords();
			$('#id_chord_open_icon').addClass('fa-caret-down');
			$('#id_chord_open_icon').removeClass('fa-caret-up');
		}
		self._chord_opened = !self._chord_opened;
	};

	this.OnClickTransposeMinus = function(){
		self._transpose = parseInt(self._transpose) - 1;
		//self.DisplayChords();
		//self.Display();
	};

	this.OnClickTransposePlus = function(){
		self._transpose = parseInt(self._transpose) + 1;
		//self.DisplayChords();
		//self.Display();
	};

	this.OnClickSpeedMinus = function(){
		if(self._speed == 1)
			return;
		self._speed = parseInt(self._speed) - parseInt(1);
		self.SetScrollFrequency();
	};

	this.OnClickSpeedPlus = function() {
		if(self._speed == 10)
			return;
		self._speed = parseInt(self._speed) + parseInt(1);
		self.SetScrollFrequency();
	};

	this.SetScrollFrequency = function(){
		$('#id_speed_text').text(self._speed);
		switch(self._speed){
			case 1:
				self._scroll_frequency = 100;
				break;
			case 2:
				self._scroll_frequency = 90;
				break;
			case 3:
				self._scroll_frequency = 80;
				break;
			case 4:
				self._scroll_frequency = 70;
				break;
			case 5:
				self._scroll_frequency = 60;
				break;
			case 6:
				self._scroll_frequency = 50;
				break;
			case 7:
				self._scroll_frequency = 40;
				break;
			case 8:
				self._scroll_frequency = 30;
				break;
			case 9:
				self._scroll_frequency = 20;
				break;
			case 10:
				self._scroll_frequency = 10;
				break;
		}
	};

	this.OnClickAutoScroll = function(){
		var ele_btn_text = $('#id_auto_scroll_text');
		var ele_icon = $('#id_player_play_icon');
		if(self._scrolling == true){
			self._stop_scroll = true;
			ele_btn_text.text('Auto Scroll');
			ele_icon.addClass('fa-play');
			ele_icon.removeClass('fa-stop');
		}else{
			self._stop_scroll = false;
			self.pageScroll();
			ele_btn_text.text('Stop Scroll');
			ele_icon.removeClass('fa-play');
			ele_icon.addClass('fa-stop');
		}
		self._scrolling = !self._scrolling;
	};

	this.pageScroll = function() {
		if(self._stop_scroll)
			return;

		var ms = Date.now();
		var delta = ms - self._time_in_milli;
		self._time_in_milli = ms;
		self._elapsed_time = parseInt(self._elapsed_time) + parseInt(delta);

		if(self._elapsed_time > self._scroll_frequency){
			//window.scrollBy(0, 1);
			window.scrollBy({
				top:1,
				left:0,
				behavior:'smooth'
			});
			self._elapsed_time = parseInt(0);
		}

		requestAnimationFrame(self.pageScroll);
	}

	this.GetURLParam = function(name){
		var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
		if (results==null) {
			return null;
		}
		return decodeURI(results[1]) || 0;
	};

	this.DisplayTitle = function(){
		var title_ele = $('title');
		var org_title = title_ele.text();
		title_ele.text(self._music.title + ' - ' + self._music.singer+ org_title);

		var desc_ele = $('#id_meta_desc');
		var org_desc = desc_ele.attr('content');
		desc_ele.attr('content', self._music.title + ', ' + self._music.singer + ', ' + org_desc);

		var keywords_ele = $('#id_meta_keywords');
		var org_keywords = keywords_ele.attr('content');
		keywords_ele.attr('content', self._music.title + ', ' + self._music.singer + ', ' + org_keywords);

		$('#id_meta_og_title').attr('content', self._music.title + ' - ' + self._music.singer + org_title);
		$('#id_meta_og_description').attr('content', self._music.title + ', ' + self._music.singer + ', ' + org_desc);

		$('#id_text_title').text(self._music.title);
		if(self._music.singer == ''){
			$('#id_singer').hide();
		}else{
			$('#id_singer').text(self._music.singer);
		}
	};

	this.PutChord = function(chord){
		var found = false;
		for(var i=0 ; i<self._chord_chart.length ; i++){
			if(chord == self._chord_chart[i]){
				found = true;
				return;
			}
		}
		if(found == false){
			self._chord_chart.push(chord);
		}
	};

	this.GatherChords = function(){
		var lines  = self._music.content.split('\n');
		for(var i=0 ; i<lines.length ; i++){
			var list = lines[i].split(' ');
			for(var l=0 ; l<list.length ; l++){
				var chord = list[l].trim();
				if(chord != '' && self._chordDB.HasChord(chord)){
					self.PutChord(chord);
				}
			}
		}
	};

	this.DisplayChords = function(){
		var chords_ele = $('#id_chords');
		chords_ele.empty();

		for(var c=0 ; c<self._chord_chart.length ; c++){
			var chord = self._chord_chart[c];
			var ele_span = $('<div class="col cm_chord_display chord-lg"></div>');
			ele_span.text(chord);
			ele_span.on('mousedown', self.PlayChord);
			ele_span.attr('id', 'id_chord_chart-'+chord);
			var ele_chord_disp = self._chordManager.GetChordDisplay(chord, false);
			ele_span.append(ele_chord_disp);
			chords_ele.append(ele_span);
		}
	};

	this.HideChords = function(){
		var chords_ele = $('#id_chords');
		chords_ele.empty();
	};

	this.PlayChord1 = function(chord){
		self._musicXMLPlayer.PlayChord(chord, 0, 20);
	};

	this.PlayChord = function(){
		var chord = this.id.split('-')[1];
		self._musicXMLPlayer.PlayChord(chord, 0, 20);
	};

	this.Display = function(){
		self._chord_list = [];
		var txt = self._music.content;
		var htm = '';
		var lines = txt.split('\n');

		for(var i=0 ; i<lines.length ; i++) {
			var line = lines[i];
			line = self.ParseLineBold(line);
			line = line.replace(/\s/g, '`');
			if(self._is_inline_type)
				line = self.ParseLineStep1(line);
			line = self.ParseLineStep2(line);
			line += "<br>";
			htm += line;
		}

		var sheet_ele = $('#id_sheet');
		sheet_ele.empty();
		sheet_ele.html(htm);

		for(var i=0 ; i<self._chord_list.length ; i++){
			var chord = self._chord_list[i];
			if(chord.charAt(0) == '.'){
				chord = chord.substr(1);
			}
			self.PutChord(chord);
		}

		self.DisplayChordList();
	};

	this.DisplayChordList = function(){
		var sheet_ele = $('#id_sheet');

		for(var c=0 ; c<self._chord_list.length ; c++){
			var chord_txt = self._chord_list[c];
			var center = false;
			if(chord_txt.charAt(0) == '.'){
				chord_txt = chord_txt.substr(1);
				center = true;
			}

			var chord_float_ele = null;
			if(self._chordDB.HasChord(chord_txt)){
				chord_float_ele = $('<div onmousedown="PlayChord(\'' + chord_txt + '\')"></div>');
			}else{
				chord_float_ele = $('<div></div>');
			}
			chord_float_ele.addClass('chord-float');
			chord_float_ele.addClass('chord-sm');
			chord_float_ele.text(chord_txt);
			sheet_ele.append(chord_float_ele);

			//position
			{
				var parent_ele = $('#id_chord-'+c);
				var position = parent_ele.position();
				var top = position.top - chord_float_ele.height();
				var left = position.left;
				if(center){
					left = position.left - ( chord_float_ele.width() / 2);
				}
				chord_float_ele.css({top:top, left:left});
			}
		}
	};

	this.ParseLineStep1 = function(line){
		var htm = '';
		var between = false;
		var chord = '';
		for(var i=0 ; i<line.length ; i++){
			var char = line.charAt(i);
			if(char == '['){
				between = true;
			}else if(char == ']'){
				between = false;
				var id = 'id_chord-' + self._chord_list.length;
				var span = '<span id="' + id + '"></span>';
				self._chord_list.push(chord);
				chord = '';
				htm += span;
			}else{
				if(between){
					chord += char;
				}else{
					htm += char;
				}
			}
		}
		return htm;
	};

	this.ParseLineStep2 = function(line){
		var chars = line.split(/`/g);
		var htm = '';
		for(var c=0 ; c<chars.length ; c++){
			if(chars[c] == ""){
				htm += '&nbsp;';
			}else{
				if(self._chordDB.HasChord(chars[c])){
					htm += '<span class="chord-sm" onmousedown="PlayChord(\'' + chars[c] + '\')">' + chars[c] + '</span>' + '&nbsp;';
				}else{
					htm += chars[c] + '&nbsp;';
				}
			}
		}
		return htm;
	};

	this.ParseLineBold = function(line){
		var bold_arr = [];
		var start_found = false;
		var start_pos = -1;
		for(var c=0 ; c<line.length ; c++) {
			if(line[c] == '*'){
				if(start_found == false){
					start_found = true;
					start_pos = c;
				}else{
					var end_pos = c;
					bold_arr.push({start_pos:start_pos, end_pos:end_pos});
					start_found = false;
					start_pos = -1;
				}
			}
		}

		for(var b=0 ; b<bold_arr.length ; b++){
			var bold = bold_arr[b];
			//console.log(bold.start_pos + ' ' + bold.end_pos);

			var start1 = line.substr(0, bold.start_pos);
			var start2 = line.substr(bold.end_pos+1);
			var content = line.substr(bold.start_pos, bold.end_pos+1);
			//console.log('start1 ' + start1);
			//console.log('content ' + content);
			//content = content.replace(/\s*/g, '');
			content = content.split('*').join('');
			//console.log('start2 ' + start2);

			line = start1 + '<h5><b>' + content + '</b></h5>' + start2;
		}
		//console.log(line);
		return line;
	};
};