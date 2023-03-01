function PlayerMain(){
	var self = this;
	this._chordMode = CHORD_MODE.GUITAR;
	this._showChords = false;
	this._loadedCount = 0;
	this._playFromNoteID = -1;
	this._chordListToShow = [];

	this.Init = function(){
		window._playerMain = self;
		window._songHandle = new SongHandle();
		window._sheet = new Sheet(SheetType.Player);
		window._song = null;
		window._player = new Player(_playerMain.FlowControl, _playerMain.OnPlayEnd);
		_player.Init();
		window._chordManager = new ChordManager().Init();

		self.InitLoading();
		self.InitHandler();
		self.InitKeyHandle();

		var file = self.GetURLParam('song');
		//console.log(file);
		var path_to_song = 'song/' + file + '.song';
		$.getJSON(path_to_song, function(songJSON){
			var str = JSON.stringify(songJSON);
			_songHandle.LoadSong(str);
			self.LoadSong();
			self.UpdateLoadProgress();
		});
	};

	this.InitKeyHandle = function(){
		$(document).keydown(function (e) {
			//console.log(e.which);
			//return;
			switch (e.which) {
				case 27://esc
					self.OnButtonStop();;
					break;
				case 32://space
					//_player.PlayPause();
					break;
				case 49://1
				case 50://2
				case 51://3
				case 52://4
				case 53://5
				case 54://6
				case 55://7
				case 56://8
					//self.OnButtonNoteCount(e.which - 48);
					break;
				case 80://p
					self.OnPlay();
					break;
				case 188://,
					self.ChangeBPMMinus();
					break;
				case 190://.
					self.ChangeBPMPlus();
					break;
			}
		});
	};

	this.GetURLParam = function(name){
		var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
		if (results==null) {
			return null;
		}
		return decodeURI(results[1]) || 0;
	};

	this.ShowChord = function(noteID){
		var chord = _song._guitar._chords[noteID];
		for(var i = 0 ; i < self._chordListToShow.length ; i++){
			if(self._chordListToShow[i] == chord){
				return true;
			}
		}
		return false;
	};

	this.OnChordClick = function(){
		console.log(this.id);
		var noteID = this.id.split('-')[1];
		var chord = _song._guitar._chords[noteID];

		var exist = false;
		var pos = -1;
		for(var i = 0 ; i < self._chordListToShow.length ; i++){
			if(self._chordListToShow[i] == chord){
				pos = i;
				exist = true;
				break;
			}
		}

		if(exist){
			self._chordListToShow.splice(pos, 1);
		}else{
			self._chordListToShow.push(chord);
		}
		_sheet.RedrawAll();
	};

	this.ChangeBPMPlus = function(){
		_song._bpm = new Number(_song._bpm) + 5;
		$('#id_text_bpm').text(_song._bpm);
	};

	this.ChangeBPMMinus = function(){
		_song._bpm = new Number(_song._bpm) - 5;
		$('#id_text_bpm').text(_song._bpm);
	};

	this.LoadSong = function(){
		//update header
		{
			var title_content = $('title').text();
			var titleBar = _song._singer + ' - ' + _song._title + ' 기타 악보';
			$('title').text(titleBar + title_content);

			var meta_desc = $('#id_meta_desc').attr('content');
			$('#id_meta_desc').attr('content', _song._title + ',' + _song._singer + ',' + meta_desc);

			var keywords = $('#id_meta_keywords').attr('content');
			$('#id_meta_keywords').attr('content', _song._title + ',' + _song._singer + ',' + keywords);

			$('#id_meta_og_title').attr('content', titleBar + title_content);
			$('#id_meta_og_description').attr('content', _song._title + ',' + _song._singer + ',' + meta_desc);
		}

		//update song info
		{
			$('#id_text_title').text(_song._title);
			if(_song._singer == null){
				$('#id_singer').remove();
			}else{
				$('#id_text_singer').text(_song._singer);
			}

			if((_song._words != null && $.trim(_song._words) != '') &&
				(_song._music != null && $.trim(_song._music) != '')
			) {
				if($.trim(_song._words) == $.trim(_song._music)){
					$('#id_words_by').remove();
					$('#id_music_by').remove();
					$('#id_text_words_music').text(_song._music);
				}else{
					$('#id_words_music_by').remove();
					$('#id_text_words').text(_song._words);
					$('#id_text_music').text(_song._music);
				}
			}

			if(_song._words == null || $.trim(_song._words) == ''){
				$('#id_words_music_by').remove();
				$('#id_words_by').remove();
			}else{
				$('#id_text_words').text(_song._words);
			}

			if(_song._music == null || $.trim(_song._music) == ''){
				$('#id_words_music_by').remove();
				$('#id_music_by').remove();
			}else{
				$('#id_text_music').text(_song._music);
			}

			$('#id_text_bpm').text(_song._bpm);
		}

		if(_song._guitar._capo > 0){
			var ele_capo = $('#id_player_capo');
			ele_capo.text('Capo ' + _song._guitar._capo);
		}

		for(var b = 0 ; b<_song._barList.length ; b++){
			_sheet.AddBar(b);
		}

		_player.LoadInstruments(self.OnLoadingFinished);
		_player.LoadReadyStick();
		self.LoadChords();
	};

	this.InitLoading = function(){
		$('#id_player_button_play').hide();
		$('#id_player_button_stop').hide();
	};

	this.OnLoadingDone = function(){
		$('#id_player_button_play').show();
		$('#id_player_button_stop').show();
		$('#id_player_loading').hide();
	};

	this.UpdateLoadProgress = function(){
		//console.log('self._loadedCount ' + self._loadedCount);
		//console.log('_songHandle._instrumentCount ' + _songHandle._instrumentCount);
		$('#id_player_progress').text(self._loadedCount + '/' + _songHandle._instrumentCount);
	};

	this.OnLoadingFinished = function(){
		//console.log('finished');
		self._loadedCount++;
		//console.log('_songHandle._instrumentCount ' + _songHandle._instrumentCount);
		//console.log('self._loadedCount ' + self._loadedCount);
		self.UpdateLoadProgress();
		if(self._loadedCount == _songHandle._instrumentCount){
			$('#id_player_button_play').removeClass('disabled');
			self.OnLoadingDone();
		}
	};

	this.LoadChords = function(){
		var chords = _songHandle.GetChordList();
		var chords_ele = $('#chords');
		chords_ele.empty();
		for(var c = 0 ; c < chords.length ; c++){
			//console.log('chord :[' + chords[c] + ']');
			if(chords[c] != null){
				//_chordManager.GetChordDisplay(chords[c]);

				var ele_span = $('<div class="col cm_chord_display"></div>');
				var chord_text = chords[c];
				ele_span.text(chord_text);
				var ele_chord_disp = _chordManager.GetChordDisplay(chord_text);
				ele_span.append(ele_chord_disp);
				ele_span.attr('id', chord_text);
				ele_span.on('click', _chordManager.PlayGuitarChord);
				chords_ele.append(ele_span);

			}
		}
	};

	this.PlayChord = function(){
		var chord = this.id.split('-')[1];
		_player.PlayChord(chord, self._chordMode);
		console.log('chord : ' + chord);
	};

	this.InitHandler = function(){
		$('#id_player_button_backward').on('mousedown', self.OnButtonBackward);
		$('#id_player_button_play').on('mousedown', self.OnButtonPlay);
		$('#id_player_button_stop').on('mousedown', self.OnButtonStop);
		$('#id_player_button_forward').on('mousedown', self.OnButtonForward);
		$('#id_player_button_count').on('mousedown', self.OnButtonCount);

		$('#id_player_button_guitar').on('click', self.OnButtonGuitar);
		$('#id_player_button_ukulele').on('click', self.OnButtonUkulele);
		$('#id_player_button_fold_chords').on('click', self.OnButtonFoldChords);
		self.OnButtonFoldChords();

		$('#id_player_button_instrument_guitar').on('click', self.OnButtonInstrumentGuitar);
		$('#id_player_button_instrument_melody').on('click', self.OnButtonInstrumentMelody);
		$('#id_player_button_instrument_drum').on('click', self.OnButtonInstrumentDrum);
		self.UpdateInstrumentButtons();

		if(self._chordMode == CHORD_MODE.GUITAR){
			$('#id_player_button_guitar').addClass('btn-primary');
			$('#id_player_button_ukulele').addClass('btn-secondary');
		}else if(self._chordMode == CHORD_MODE.UKULELE){
			$('#id_player_button_guitar').addClass('btn-secondary');
			$('#id_player_button_ukulele').addClass('btn-primary');
		}
	};

	this.OnButtonFoldChords = function(){
		//console.log('fold');
		self._showChords = !self._showChords;

		if(self._showChords == true){
			$('#id_player_chords_div').show();
			$('#id_player_chords_hr').show();
			$('#id_player_fold_icon').addClass('fa-chevron-up');
			$('#id_player_fold_icon').removeClass('fa-chevron-down');
		}else{
			$('#id_player_chords_div').hide();
			$('#id_player_chords_hr').hide();
			$('#id_player_fold_icon').removeClass('fa-chevron-up');
			$('#id_player_fold_icon').addClass('fa-chevron-down');
		}
	};

	this.OnButtonGuitar = function(){
		$('#id_player_button_guitar').removeClass('btn-secondary');
		$('#id_player_button_guitar').addClass('btn-primary');
		$('#id_player_button_ukulele').removeClass('btn-primary');
		$('#id_player_button_ukulele').addClass('btn-secondary');
		self._chordMode = CHORD_MODE.GUITAR;
		self.LoadChords();
		_player.SetChordMode(CHORD_MODE.GUITAR);
	};

	this.OnButtonUkulele = function(){
		$('#id_player_button_guitar').removeClass('btn-primary');
		$('#id_player_button_guitar').addClass('btn-secondary');
		$('#id_player_button_ukulele').removeClass('btn-secondary');
		$('#id_player_button_ukulele').addClass('btn-primary');
		self._chordMode = CHORD_MODE.UKULELE;
		self.LoadChords();
		_player.SetChordMode(CHORD_MODE.UKULELE);
	};

	this.OnButtonPlay = function() {
		self.OnPlay();
	};

	this.OnPlay = function(){
		self._flowControlPrevBarID = -1;

		if(self._playFromNoteID == -1)
			_player.PlayPause(0);
		else
			_player.PlayPause(self._playFromNoteID);

		self.ChangeIcons();
	};

	this.ChangeIcons = function() {
		if(_player._isPlaying){
			$('#id_player_play_icon').removeClass('fa-play');
			$('#id_player_play_icon').addClass('fa-pause');
		}else{
			$('#id_player_play_icon').removeClass('fa-pause');
			$('#id_player_play_icon').addClass('fa-play');
		}
	};

	this.OnButtonStop = function() {
		_player.Stop();
		self.ChangeIcons();
		_sheet.RedrawAll();
	};

	this.OnButtonCount = function(){
		SoundSetting.IsCountOn = !SoundSetting.IsCountOn;
		self.UpdateInstrumentButtons();
	};

	this.OnButtonBackward = function() {
		self.ChangeBPMMinus();
		if(_player._isPlaying){
			_player.Stop();
			_player.Play(_player._curPlayingNote, false);
		}
	};

	this.OnButtonForward = function() {
		self.ChangeBPMPlus();
		if(_player._isPlaying){
			_player.Stop();
			_player.Play(_player._curPlayingNote, false);
		}
	};

	this.OnPlayEnd = function() {
		self.OnButtonStop();
	};

	this.OnButtonInstrumentGuitar = function(){
		SoundSetting.IsGuitarOn = !SoundSetting.IsGuitarOn;
		self.UpdateInstrumentButtons();
		if(_player._isPlaying){
			_player.Stop();
			_player.Play(_player._curPlayingNote, false);
		}
	};

	this.OnButtonInstrumentMelody = function(){
		SoundSetting.IsMelodyOn = !SoundSetting.IsMelodyOn;
		self.UpdateInstrumentButtons();
		if(_player._isPlaying){
			_player.Stop();
			_player.Play(_player._curPlayingNote, false);
		}
	};

	this.OnButtonInstrumentDrum = function(){
		SoundSetting.IsDrumOn = !SoundSetting.IsDrumOn;
		self.UpdateInstrumentButtons();
		if(_player._isPlaying){
			_player.Stop();
			_player.Play(_player._curPlayingNote, false);
		}
	};

	this.UpdateInstrumentButtons = function() {
		if(SoundSetting.IsGuitarOn == true){
			$('#id_player_button_instrument_guitar').addClass('btn-primary');
			$('#id_player_button_instrument_guitar').removeClass('btn-secondary');
		}else{
			$('#id_player_button_instrument_guitar').removeClass('btn-primary');
			$('#id_player_button_instrument_guitar').addClass('btn-secondary');
		}

		if(SoundSetting.IsMelodyOn == true){
			$('#id_player_button_instrument_melody').addClass('btn-primary');
			$('#id_player_button_instrument_melody').removeClass('btn-secondary');
		}else{
			$('#id_player_button_instrument_melody').removeClass('btn-primary');
			$('#id_player_button_instrument_melody').addClass('btn-secondary');
		}

		if(SoundSetting.IsDrumOn == true){
			$('#id_player_button_instrument_drum').addClass('btn-primary');
			$('#id_player_button_instrument_drum').removeClass('btn-secondary');
		}else{
			$('#id_player_button_instrument_drum').removeClass('btn-primary');
			$('#id_player_button_instrument_drum').addClass('btn-secondary');
		}

		if(SoundSetting.IsCountOn == true){
			$('#id_player_button_count').addClass('btn-primary');
			$('#id_player_button_count').removeClass('btn-secondary');
		}else{
			$('#id_player_button_count').removeClass('btn-primary');
			$('#id_player_button_count').addClass('btn-secondary');
		}
	};

	this.FlowControl = function(noteID){
		_sheet.FlowControl(noteID);

		{
			var cur_id = 'id_sheet_flow-' + noteID;
			var cur_obj = document.getElementById(cur_id);
			if(cur_obj != null){
				smoothScroll(cur_id);
			}
		}
	};
}

function currentYPosition() {
	// Firefox, Chrome, Opera, Safari
	if (self.pageYOffset) return self.pageYOffset;
	// Internet Explorer 6 - standards mode
	if (document.documentElement && document.documentElement.scrollTop)
		return document.documentElement.scrollTop;
	// Internet Explorer 6, 7 and 8
	if (document.body.scrollTop) return document.body.scrollTop;
	return 0;
}

function elmYPosition(eID) {
	var elm = document.getElementById(eID);
	var y = elm.offsetTop;
	var node = elm;
	while (node.offsetParent && node.offsetParent != document.body) {
		node = node.offsetParent;
		y += node.offsetTop;
	} return y;
}

function smoothScroll(eID) {
	var startY = currentYPosition();
	var stopY = elmYPosition(eID);
	stopY -= 250;

	var distance = stopY > startY ? stopY - startY : startY - stopY;
	if (distance < 100) {
		scrollTo(0, stopY); return;
	}
	var speed = Math.round(distance / 400);
	if (speed >= 20) speed = 20;

	var step = Math.round(distance / 100);
	var leapY = stopY > startY ? startY + step : startY - step;

	var timer = 0;
	if (stopY > startY) {
		for ( var i=startY; i<stopY; i+=step ) {
			setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
			leapY += step; if (leapY > stopY) leapY = stopY; timer++;
		} return;
	}
	for ( var i=startY; i>stopY; i-=step ) {
		setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
		leapY -= step; if (leapY < stopY) leapY = stopY; timer++;
	}
}

