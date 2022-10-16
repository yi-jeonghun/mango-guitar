const SoundSetting = {
	IsInstrumentOn:[],
	IsMelodyOn:true,
	IsGuitarOn:true,
	IsDrumOn:true,
	IsCountOn:true
};

function Player(flowControlCallback, playEndCallback) {
	var self = this;
	this._flowControlCallback = flowControlCallback;
	this._playEndCallback = playEndCallback;
	this._chordMode = CHORD_MODE.GUITAR;
	this._audioContext = null;
	this._player = null;
	this._audioInitialized = false;
	this._isPaused = false;
	this._isPlaying = false;
	this._startTime = 0;
	this._endTime = 0;
	this._beatLen = 0;
	this._offset = 0;
	this._curPlayingNote = -1;
	this._onLoadingFinishedCallback = null;

	this.Init = function () {
		if(self._audioInitialized)
			return;
		var AudioContextFunc = window.AudioContext || window.webkitAudioContext;
		self._audioContext = new AudioContextFunc();
		self._player = new WebAudioFontPlayer();
		//self._player.loader.decodeAfterLoading(self._audioContext, '_tone_0250_SoundBlasterOld_sf2');
		//self._player.loader.decodeAfterLoading(self._audioContext, '_tone_0253_Acoustic_Guitar_sf2_file');
		self._audioInitialized = true;
		//self.LoadDrfaultInstruments();
	};

	this.LoadInstruments = function(loadingDoneCallback){
		self._onLoadingFinishedCallback = loadingDoneCallback;
		self.LoadInstrument(_song._guitar._key);
		for(var i=0 ; i<_song._instList.length ; i++){
			self.LoadInstrument(_song._instList[i]._key);
		}

		for(var i=0 ; i<_song._drumSet._keyList.length ; i++){
			if(_song._drumSet._keyList[i] != null){
				self.LoadDrum(_song._drumSet._keyList[i]);
			}
		}
	};

	//fixme 이 함수는 key뒤에 js를 붙여야 하지만
	this.LoadInstrument = function(key){
		var path = 'lib/webaudiofontdata/sound/' + key + '.js';
		var variableName = '_tone_' + key;
		self._player.loader.startLoad(self._audioContext, path, variableName);
		self._player.loader.waitLoad(function(key){
			//console.log('Loading Instrument Finished');
			if(self._onLoadingFinishedCallback != null){
				self._onLoadingFinishedCallback();
			}
		});
	};

	this.LoadDrfaultInstruments = function(){
		self.LoadInstrument(DEFAULT_GUITAR);
	};

	this.LoadReadyStick = function(){
		self.LoadDrum(DEFAULT_READY_STICK);
	};

	//fixme 이 함수는 key가 js 파일이다. 통일 필요.
	this.LoadDrum = function(key){
		var path = 'lib/webaudiofontdata/sound/' + key;
		var variableName = DRUM_GetVariable(key);
		self._player.loader.startLoad(self._audioContext, path, variableName);
		self._player.loader.waitLoad(function(){
			//console.log('Drum Loading Finished');
			if(self._onLoadingFinishedCallback != null){
				self._onLoadingFinishedCallback();
			}
		});
	};

	this._playingMesaureID = 0;
	this.Play = function (offset_from, ready) {
		self.Init();
		if(self._isPlaying){
			self.Stop();
		}

		//calc time
		self.ConvertNotesToMusic(offset_from, new Number(99999), ready, true, false);

		//convert
		self._playingMesaureID = _songHandle.GetMeasureIDOfNote(offset_from);
		//console.log('self._playingMesaureID ' + self._playingMesaureID);
		var note_count_of_measure = _songHandle.GetNoteCountOfMeasure(self._playingMesaureID);
		var note_count_of_measure1 = _songHandle.GetNoteCountOfMeasure(self._playingMesaureID+1);

		var offset_to = offset_from + note_count_of_measure + note_count_of_measure1;
		self.ConvertNotesToMusic(offset_from, offset_to, ready, false, false);

		self._curPlayingNote = -1;
		self._isPaused = false;
		self._isPlaying = true;
		self.FlowControl();
	};

	this.Ready = function(){
		var beatLen = self.GetBeatLen();
		var stick = beatLen * 4;

		var variable = DRUM_GetVariable(DEFAULT_READY_STICK);
		var scale = DRUM_GetPitch(DEFAULT_READY_STICK);
		var stime = self._audioContext.currentTime + 0.1;

		self._player.queueWaveTable(self._audioContext, self._audioContext.destination,
			eval(variable), stime, scale, 0.5);
		self._player.queueWaveTable(self._audioContext, self._audioContext.destination,
			eval(variable), stime + (stick * 1), scale, 0.5);
		self._player.queueWaveTable(self._audioContext, self._audioContext.destination,
			eval(variable), stime + (stick * 2), scale, 0.5);
		self._player.queueWaveTable(self._audioContext, self._audioContext.destination,
			eval(variable), stime + (stick * 3), scale, 0.5);
	};

	this.FlowControl = function(){
		if(self._isPlaying == false)
			return;

		var playingTime = self._audioContext.currentTime - self._startTime;
		var note = Math.floor(playingTime / self._beatLen);
		note = new Number(self._offset) + new Number(note);
		//console.log('cur cell ' + note);

		if(self._curPlayingNote != note){
			self._curPlayingNote = note;

			var measure_id = _songHandle.GetMeasureIDOfNote(note);
			//console.log('self._playingMesaureID ' + self._playingMesaureID);
			//console.log('measure_id ' + measure_id);
			if(measure_id > self._playingMesaureID){
				var next_measure_id = measure_id + 1;
				var note_count_of_measure = _songHandle.GetNoteCountOfMeasure(next_measure_id);
				var offset_from = _songHandle.GetNoteOffsetOfMeasure(next_measure_id);
				var offset_to = offset_from + note_count_of_measure;
				self.ConvertNotesToMusic(offset_from, offset_to, false, false, true);
				self._playingMesaureID = measure_id;
			}

			if(self._flowControlCallback != null){
				self._flowControlCallback(note);
			}
		}

		if(self._endTime <= self._audioContext.currentTime){
			self.Stop();
			if(self._playEndCallback != null){
				self._playEndCallback();
			}
			return;
		}
		window.requestAnimationFrame(self.FlowControl);
	};

	this.Stop = function () {
		self._player.cancelQueue(self._audioContext);
		self._isPaused = false;
		self._isPlaying = false;
	};

	this.PlayPause = function (offset) {
		if(self._isPaused){
			self._audioContext.resume();
			self._isPaused = false;
			self._isPlaying = true;
			self.FlowControl();
			return;
		}

		if(self._isPlaying){
			self._audioContext.suspend();
			self._isPaused = true;
			self._isPlaying = false;
			return;
		}

		self._player.cancelQueue(self._audioContext);
		self.Play(offset, true);
	};

	this.PlayNote = function (scale) {
		console.log('scale ' + scale);
		if(isNaN(scale)){
			console.log('is NAN');
			return;
		}
		self.Init();

		var variable = '_tone_' + _song._instList[_maestroMain._curInstID]._key;
		//console.log(variable);
		self._player.queueWaveTable(self._audioContext, self._audioContext.destination,
			eval(variable), 0, scale, 0.2);
	};

	this.TestSound = function(){
		console.log(this.id);
		self.LoadInstrument(this.id);

		var scale = (12 * 4) + 0;

		var variable = '_tone_' + this.id;
		self._player.queueWaveTable(self._audioContext, self._audioContext.destination,
			eval(variable), self._audioContext.currentTime + 0, scale, 0.2);
		self._player.queueWaveTable(self._audioContext, self._audioContext.destination,
			eval(variable), self._audioContext.currentTime + 0.2, scale+4, 0.2);
		self._player.queueWaveTable(self._audioContext, self._audioContext.destination,
			eval(variable), self._audioContext.currentTime + 0.4, scale+7, 0.2);
		self._player.queueWaveTable(self._audioContext, self._audioContext.destination,
			eval(variable), self._audioContext.currentTime + 0.6, scale+12, 2);
	};

	this.TestDrum = function(){
		self.LoadDrum(this.id);

		var variable = DRUM_GetVariable(this.id);
		var scale = DRUM_GetPitch(this.id);

		self._player.queueWaveTable(self._audioContext, self._audioContext.destination,
			eval(variable), self._audioContext.currentTime + 0, scale, 1);
	};

	this.TestStrumPattern = function(){
		console.log('id ' + this.id);
		var strum_pattern_info = STRUM_GetStrumPatternInfo(this.id);

		var beatLen = self.GetBeatLen();
		var startTime = self._audioContext.currentTime;
		var timeOffset = new Number(-1);

		var chord_info = GetChordInfo('C', CHORD_MODE.GUITAR);
		var variable = '_tone_' + DEFAULT_GUITAR;

		for(var i = 0 ; i < strum_pattern_info._strums.length ; i++){
			timeOffset++;
			var stime = startTime + new Number(timeOffset) * beatLen;
			var volume = new Number(1);
			if(strum_pattern_info._accents[i] == 0){
				volume = new Number(0.5);
			}

			switch(strum_pattern_info._strums[i]){
				case D:
					self._player.queueStrumDown(self._audioContext, self._audioContext.destination,
						eval(variable), stime, self.Pitches(GetFretString(chord_info.fret, chord_info.stringFrets)), 1.5, volume);
					break;
				case U:
					self._player.queueStrumUp(self._audioContext, self._audioContext.destination,
						eval(variable), stime, self.Pitches(GetFretString(chord_info.fret, chord_info.stringFrets)), 1.5, volume);
					break;
				case S:
					self._player.queueSnap(self._audioContext, self._audioContext.destination,
						eval(variable), stime, self.Pitches(GetFretString(chord_info.fret, chord_info.stringFrets)), 1.5, volume);
					break;
				case n:
					break;
			}
		}
	};

	this.HitDrum = function(scale){
		if(_song._drumSet._keyList[scale] == null){
			return;
		}

		var variable = DRUM_GetVariable(_song._drumSet._keyList[scale]);
		var pitch = DRUM_GetPitch(_song._drumSet._keyList[scale]);

		self._player.queueWaveTable(self._audioContext, self._audioContext.destination,
			eval(variable), 0, pitch, 0.2);
	};

	this.PlayChord = function (chord, chordMode) {
		var chord_info = GetChordInfo(chord, CHORD_MODE.GUITAR);
		var variable = '_tone_' + DEFAULT_GUITAR;

		self._player.queueStrumDown(self._audioContext, self._audioContext.destination,
			eval(variable), 0, self.Pitches(GetFretString(chord_info.fret, chord_info.stringFrets)), 1.5);
	};

	this.PlayCurrentMeasure = function () {
		var measure_offset = _songHandle.GetMeasureOffset(_maestroMain._curBarID);
		var mid = new Number(measure_offset) + new Number(_table._currentMeaureID);
		var note_offset_of_measure = _songHandle.GetNoteOffsetOfMeasure(mid);
		self.Play(note_offset_of_measure, false);
	};

	this.GetBeatLen = function(){
		return new Number(60/_song._bpm * 1/_song._divide);
	};

	this.ConvertNotesToMusic = function (offset_from, offset_to, has_ready_part, calc_time, adaptive) {
		if(SoundSetting.IsCountOn == false)
			has_ready_part = false;

		console.log('offset_from ' + offset_from + ' offset_to ' + offset_to);
		console.log('adaptive ' + adaptive);
		var current_measure_id = _songHandle.GetMeasureIDOfNote(offset_from);
		console.log('current_measure_id ' + current_measure_id);
		var note_count_of_measure = _songHandle.GetNoteCountOfMeasure(current_measure_id);
		var beat_len = self.GetBeatLen();
		self._beatLen = beat_len;
		var time_offset = new Number(0);
		var ready_time = new Number(0);
		var adaptive_offset = 0;
		if(adaptive){
			var note_offset = _songHandle.GetNoteOffsetOfMeasure(current_measure_id);
			console.log('note_offset ' + note_offset);
			adaptive_offset = new Number(note_offset) - new Number(self._offset);
			console.log('adaptive_offset ' + adaptive_offset);
		}

		if(has_ready_part){
			if(calc_time == false)
				self.Ready();
			ready_time = beat_len * 16;
		}

		var begin_offset = new Number(99999999);
		{
			for(var i=0 ; i<_song._instList.length ; i++) {
				for(var n=offset_from ; n<_song._instList[i]._notes.length ; n++) {
					if(n >= offset_to)
						break;
					if(_song._instList[i]._notes[n] != null && _song._instList[i]._notes[n].length > 0){
						if(n < begin_offset){
							begin_offset = n;
						}
						break;
					}
				}
			}
			for(var i=offset_from ; i<_song._guitar._chords.length ; i++){
				if(i >= offset_to)
					break;
				if(_song._guitar._chords[i] != null){
					if(i < begin_offset){
						begin_offset = i;
					}
					break;
				}
			}
			for(var i=offset_from ; i<_song._guitar._tabs.length ; i++){
				if(i >= offset_to)
					break;
				if(_song._guitar._tabs[i] != null){
					for(var k=0 ; k<_song._guitar._tabs[i].length ; k++){
						if(_song._guitar._tabs[i][k] != null){
							if(i < begin_offset){
								begin_offset = i;
							}
							break;
						}
					}
				}
			}
			for(var i=offset_from ; i<_song._drumSet._hits.length ; i++){
				if(i >= offset_to)
					break;
				if(_song._drumSet._hits[i] != null){
					if(i < begin_offset){
						begin_offset = i;
					}
					break;
				}
			}
		}

		if(adaptive){
			begin_offset = offset_from;
		}

		if(calc_time){
			self._startTime = self._audioContext.currentTime + ready_time;
			self._endTime = new Number(0);
			self._offset = begin_offset;
		}

		for(var i=0 ; i<_song._instList.length ; i++){
			if(SoundSetting.IsInstrumentOn[i] != null && SoundSetting.IsInstrumentOn[i] == false)
				continue;
			if(SoundSetting.IsMelodyOn != 'undefined' && SoundSetting.IsMelodyOn == false)
				continue;

			time_offset = new Number(-1);
			time_offset += adaptive_offset;
			var octave = new Number(_song._instList[i]._octave);
			var variable = '_tone_' + _song._instList[i]._key;
			var vol = new Number(_song._instList[i]._volume) / 100;

			for(var n=begin_offset ; n<_song._instList[i]._notes.length ; n++){
				if(n >= offset_to)
					break;
				time_offset++;
				if(_song._instList[i]._notes[n] == null)
					continue;

				for(var s=0 ; s<_song._instList[i]._notes[n].length ; s++){
					var ss = _song._instList[i]._notes[n][s].s;
					var cc = _song._instList[i]._notes[n][s].c;
					var slides = _song._instList[i]._notes[n][s]._slides;
					var slides_arr = [];

					if(slides != null){
						var prev = -1;
						for(var s = 0 ; s < slides.length ; s++){
							if(s == 0){
								prev = slides[s];
								ss = slides[s];
							}else{
								if(prev != slides[s]){
									slides_arr.push({
										'pitch':new Number(12) * new Number(octave) + slides[s],
										'when':beat_len*s
									});
									prev = slides[s];
								}
							}
						}
					}

					var stime = self._startTime + new Number(time_offset) * beat_len;
					var scale = new Number(12) * new Number(octave) + new Number(ss);
					var duration = new Number(cc) * beat_len;

					if(calc_time == false){
						self._player.queueWaveTable(self._audioContext, self._audioContext.destination,
							eval(variable), stime, scale, duration, vol, slides_arr);
					}
					self.UpdateEndTime(stime + duration, calc_time);
				}
			}
		}

		//GUITAR
		if(SoundSetting.IsGuitarOn){
			time_offset = new Number(-1);
			time_offset += adaptive_offset;
			var capo = 0;
			if(_song._guitar._capo != null){
				capo = new Number(_song._guitar._capo);
			}
			var variable = '_tone_' + _song._guitar._key;
			var vol = new Number(_song._guitar._volume) / 100;
			var strum_len = beat_len*10;

			var strum_list = _songHandle.GetStrumList();

			for(var n = begin_offset ; n < strum_list.strums.length ; n++){
				if(n >= offset_to)
					break;
				time_offset++;
				if(strum_list.strums[n] == null)
					continue;

				var stime = self._startTime + new Number(time_offset) * beat_len;

				if(strum_list.strums[n] == D){
					if(calc_time == false) {
						var accent = strum_list.accents[n] == 1 ? vol : vol * 0.5;
						self._player.queueStrumDown(self._audioContext, self._audioContext.destination,
							eval(variable), stime, self.Pitches(strum_list.frets[n], capo), strum_len, accent);
					}
					self.UpdateEndTime(stime + strum_len, calc_time);
				}else if(strum_list.strums[n] == U){
					if(calc_time == false) {
						var accent = strum_list.accents[n] == 1 ? vol : vol * 0.5;
						self._player.queueStrumUp(self._audioContext, self._audioContext.destination,
							eval(variable), stime, self.Pitches(strum_list.frets[n], capo), strum_len, accent);
					}
					self.UpdateEndTime(stime + strum_len, calc_time);
				}else if(strum_list.strums[n] == S){
					if(calc_time == false) {
						var accent = strum_list.accents[n] == 1 ? vol : vol * 0.5;
						self._player.queueSnap(self._audioContext, self._audioContext.destination,
							eval(variable), stime, self.Pitches(strum_list.frets[n], capo), strum_len, accent);
					}
					self.UpdateEndTime(stime + strum_len, calc_time);
				}
			}
		}

		//Tab
		if(SoundSetting.IsGuitarOn){
			var variable = '_tone_' + _song._guitar._key;
			time_offset = new Number(-1);
			time_offset += adaptive_offset;
			var vol = new Number(_song._guitar._volume) / 100;
			for(var i=begin_offset ; i<_song._guitar._tabs.length ; i++){
				if(i >= offset_to)
					break;
				time_offset++;
				if(_song._guitar._tabs[i] != null){
					var stime = self._startTime + new Number(time_offset) * beat_len;

					for(var k=0 ; k<6 ; k++){
						var fret = _song._guitar._tabs[i][k];
						if(fret != null){
							var scale = -1;
							switch(k){
								case 0:
									scale = new Number(GUITAR_1st) + new Number(fret);
									break;
								case 1:
									scale = new Number(GUITAR_2nd) + new Number(fret);
									break;
								case 2:
									scale = new Number(GUITAR_3rd) + new Number(fret);
									break;
								case 3:
									scale = new Number(GUITAR_4th) + new Number(fret);
									break;
								case 4:
									scale = new Number(GUITAR_5th) + new Number(fret);
									break;
								case 5:
									scale = new Number(GUITAR_6th) + new Number(fret);
									break;
							}
							if(calc_time == false) {
								self._player.queueWaveTable(self._audioContext, self._audioContext.destination,
									eval(variable), stime, scale, 1, vol);
							}
							self.UpdateEndTime(stime + 1, calc_time);
						}
					}
				}
			}
		}

		//tab pattern
		if(SoundSetting.IsGuitarOn){
			var new_offset = -1;
			var variable = '_tone_' + _song._guitar._key;
			time_offset = new Number(-1);
			time_offset += adaptive_offset;
			var vol = new Number(_song._guitar._volume) / 100;
			var tabs = null;

			for(var m = 0 ; m < _song._guitar._tabPattern4M.length ; m++){
				tabs = null;
				if(_song._guitar._tabPattern4M[m] != null){
					tabs = ARPEGGIO_GetTabs(m);
				}
				var note_count_per_measure = _songHandle.GetNoteCountOfMeasure(m);
				for(var n = 0 ; n < note_count_per_measure ; n++){
					new_offset++;

					if(new_offset < begin_offset)
						continue;

					if(new_offset >= offset_to)
						break;

					time_offset++;
					var stime = self._startTime + new Number(time_offset) * beat_len;

					if(tabs == null)
						continue;

					for(var k=0 ; k<6 ; k++){
						var fret = tabs[k][n];
						if(fret != null){
							var scale = -1;
							switch(k){
								case 0:
									scale = new Number(GUITAR_1st) + new Number(fret);
									break;
								case 1:
									scale = new Number(GUITAR_2nd) + new Number(fret);
									break;
								case 2:
									scale = new Number(GUITAR_3rd) + new Number(fret);
									break;
								case 3:
									scale = new Number(GUITAR_4th) + new Number(fret);
									break;
								case 4:
									scale = new Number(GUITAR_5th) + new Number(fret);
									break;
								case 5:
									scale = new Number(GUITAR_6th) + new Number(fret);
									break;
							}
							if(calc_time == false) {
								self._player.queueWaveTable(self._audioContext, self._audioContext.destination,
									eval(variable), stime, scale, 1, vol);
							}
							self.UpdateEndTime(stime + 1, calc_time);
						}
					}
				}
			}
		}

		//DRUM
		if(SoundSetting.IsDrumOn){
			var vol = new Number(_song._drumSet._volume) / 100;
			for(var k=0 ; k<_song._drumSet._keyList.length ; k++){
				if(_song._drumSet._keyList[k] != null){
					time_offset = new Number(-1);
					time_offset += adaptive_offset;
					var variable = DRUM_GetVariable(_song._drumSet._keyList[k]);
					var pitch = DRUM_GetPitch(_song._drumSet._keyList[k]);
					for(var i=begin_offset ; i<_song._drumSet._hits.length ; i++){
						if(i >= offset_to)
							break;
						time_offset++;
						if(_song._drumSet._hits[i] == null)
							continue;
						for(var n=0 ; n<_song._drumSet._hits[i].length ; n++){
							if(_song._drumSet._hits[i][n].s == k){
								var stime = self._startTime + new Number(time_offset) * beat_len;
								var duration = new Number(_song._drumSet._hits[i][n].c) * beat_len;
								if(calc_time == false) {
									self._player.queueWaveTable(self._audioContext, self._audioContext.destination,
										eval(variable), stime, pitch, duration, vol);
								}
								self.UpdateEndTime(stime + duration, calc_time);
							}
						}
					}
				}
			}
		}
	};

	this.UpdateEndTime = function(et, calcTime){
		if(calcTime){
			if(self._endTime < et){
				self._endTime = et;
			}
		}
	};

	this.Pitches = function(frets, capo){
		var c = 0;
		if(capo != null)
			c = capo;
		var p = [];
		if (frets[0] > -1) p.push(GUITAR_6th + frets[0] + c);
		if (frets[1] > -1) p.push(GUITAR_5th + frets[1] + c);
		if (frets[2] > -1) p.push(GUITAR_4th + frets[2] + c);
		if (frets[3] > -1) p.push(GUITAR_3rd + frets[3] + c);
		if (frets[4] > -1) p.push(GUITAR_2nd + frets[4] + c);
		if (frets[5] > -1) p.push(GUITAR_1st + frets[5] + c);
		return p;
	};

	this.SetChordMode = function (chordMode) {
		self._chordMode = chordMode;
	};
}


