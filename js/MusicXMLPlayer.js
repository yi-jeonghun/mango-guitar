const PLAYER_STATE = {
	STOP:0,
	PLAY:1,
	PAUSE:2
};

function MusicXMLPlayer(flowControlCallback, playEndCallback, instrumentLoadCallback){
	var self = this;
	this._music = null;
	this._chordManager = null;
	this._audioContext = null;
	this._player = null;
	this._start_time = 0;
	this._end_time = 0;
	this._running_time = 0;
	this._measure_offset_arr = [];
	this._last_queue_measure_seq = 0;
	this._cur_playing_measure_seq = 0;
	this._player_state = PLAYER_STATE.STOP;
	this._begin_measure_seq = 0;
	this._begin_measure_time_offset = 0;
	this._percussion_arr = [];//{_id, _key, _variable, _fine, _pitch}
	this._instrument_arr = [];//{_id, _key, _variable, _fine}
	this._DEFAULT_GUITAR = '0243_JCLive_sf2_file';
	this._DEFAULT_GUITAR_VARIABLE = '_tone_' + self._DEFAULT_GUITAR;
	this._DEFAULT_READY_STICK = '12842_0_Chaos_sf2_file.js';
	this._DEFAULT_READY_STICK_VARIABLE = DRUM_GetVariable(self._DEFAULT_READY_STICK);
	this._part_play_arr = [];
	this._flowControlCallback = flowControlCallback;
	this._playEndCallback = playEndCallback;
	this._instrumentLoadCallback = instrumentLoadCallback;
	this._includes_chord = false;
	this._includes_percussion = false;
	this._play_guitar = false;
	this._play_melody = false;
	this._play_percussion = false;
	this._play_countdown = false;
	this._chord_arr = [];

	this.Init = function(){
		var AudioContextFunc = window.AudioContext || window.webkitAudioContext;
		self._audioContext = new AudioContextFunc();
		self._player = new WebAudioFontPlayer();
		//self._player.loader.waitLoad(self.CallbackInstLoad);
		self._chordManager = new ChordManager().Init();
	};

	this.LoadMusic = function(music){
		self._music = music;

		self.IncludesChord();

		for(var i=0 ; i<self._music._part_arr.length ; i++){
			self._part_play_arr[i] = true;

			if(self._music._part_arr[i]._is_percussion){
				for(var m=0 ; m<self._music._part_arr[i]._measure_arr.length ; m++){
					for(var n=0 ; n<self._music._part_arr[i]._measure_arr[m]._note_arr.length ; n++){
						if(self._music._part_arr[i]._measure_arr[m]._note_arr[n]._is_unpitched){
							var note = self._music._part_arr[i]._measure_arr[m]._note_arr[n];
							self.AddPercussion(note._instrument_id);
							self._includes_percussion = true;
						}
					}
				}
			}else{
				self.AddInstrument(self._music._part_arr[i]._id, self._music._part_arr[i]._part_name);
			}
		}
		self.LoadInstruments();
	};

	this.IncludesChord = function(){
		for(var m=0 ; m<self._music._part_arr[0]._measure_arr.length ; m++){
			var measure = self._music._part_arr[0]._measure_arr[m];
			for(var c=0 ; c<measure._chord_arr.length ; c++){
				var chord = measure._chord_arr[c];
				if(chord != null){
					self._includes_chord = true;

					var found = false;
					for(var i=0 ; i<self._chord_arr.length ; i++){
						if(self._chord_arr[i] == chord){
							found = true;
							break;
						}
					}
					if(found == false){
						self._chord_arr.push(chord);
					}
				}
			}
		}
	};

	this._instrument_count_total = 0;
	this._instrument_count_loaded = 0;
	this.CallbackInstLoad = function(){
		self._instrument_count_loaded++;

		//console.log('loading ' + self._instrument_count_loaded + '/' + self._instrument_count_total);
		//if(self._instrument_count_loaded == self._instrument_count_total)
		//	console.log('load done');

		if(self._instrumentLoadCallback != null){
			self._instrumentLoadCallback(self._instrument_count_loaded, self._instrument_count_total);
		}
	};

	this.LoadInstruments = function(){
		self._instrument_count_total = 1 * self._instrument_arr.length + self._percussion_arr.length;

		//Load Default instruments
		{
			var default_guitar_added = false;
			for(var i=0 ; i<self._instrument_arr.length ; i++) {
				if(self._instrument_arr[i]._key == self._DEFAULT_GUITAR){
					default_guitar_added = true;
					break;
				}
			}
			if(default_guitar_added == false){
				self._instrument_count_total++;
				var path = '../lib/webaudiofontdata/sound/' + self._DEFAULT_GUITAR + '.js';
				self._player.loader.startLoad(self._audioContext, path, self._DEFAULT_GUITAR_VARIABLE);
				self._player.loader.waitLoad(self.CallbackInstLoad);
			}

			var default_stick_added = false;
			for(var p=0 ; p<self._percussion_arr.length ; p++) {
				if(self._percussion_arr[p]._key == self._DEFAULT_READY_STICK){
					default_stick_added = true;
					break;
				}
			}
			if(default_stick_added == false){
				self._instrument_count_total++;
				var path = '../lib/webaudiofontdata/sound/' + self._DEFAULT_READY_STICK;
				self._player.loader.startLoad(self._audioContext, path, self._DEFAULT_READY_STICK_VARIABLE);
				self._player.loader.waitLoad(self.CallbackInstLoad);
			}
		}

		for(var i=0 ; i<self._instrument_arr.length ; i++){
			//console.log('ins ' + self._instrument_arr[i]._id +  self._instrument_arr[i]._key);
			var path = '../lib/webaudiofontdata/sound/' + self._instrument_arr[i]._key + '.js';
			var variable = '_tone_' + self._instrument_arr[i]._key;
			self._instrument_arr[i]._variable = variable;
			self._player.loader.startLoad(self._audioContext, path, variable);
			self._player.loader.waitLoad(self.CallbackInstLoad);
		}

		for(var p=0 ; p<self._percussion_arr.length ; p++){
			//console.log('per ' + self._percussion_arr[p]._id + ' ' + self._percussion_arr[p]._key);
			var path = '../lib/webaudiofontdata/sound/' + self._percussion_arr[p]._key;
			var variable = DRUM_GetVariable(self._percussion_arr[p]._key);
			var pitch = DRUM_GetPitch(self._percussion_arr[p]._key);
			self._percussion_arr[p]._variable = variable;
			self._percussion_arr[p]._pitch = pitch;
			self._player.loader.startLoad(self._audioContext, path, variable);
			self._player.loader.waitLoad(self.CallbackInstLoad);
		}
	};

	this.AddInstrument = function(id, instrument_name){
		for(var i=0 ; i<self._instrument_arr.length ; i++){
			if(self._instrument_arr[i]._id == id){
				return;
			}
		}
		var key = INST_GetInstKeyByName(instrument_name);
		var inst_key = key;
		if(key == null){
			inst_key = "0000_Aspirin_sf2_file";
		}
		self._instrument_arr.push({
			"_id":id,
			"_key":inst_key,
			"_variable":'',
			"_fine":(key!=null?true:false)
		});
	};

	this.IsInstFound = function(id){
		for(var i=0 ; i<self._instrument_arr.length; i++){
			if(self._instrument_arr[i]._id == id){
				return self._instrument_arr[i]._fine;
			}
		}
		return false;
	};

	this.AddPercussion = function(id){
		for(var p=0 ; p<self._percussion_arr.length ; p++){
			if(self._percussion_arr[p]._id == id){
				return;
			}
		}

		for(var p=0 ; p<self._music._percussion_arr.length ; p++){
			if(id == self._music._percussion_arr[p]._id){
				var key = DRUM_GetDrumKeyByName(self._music._percussion_arr[p]._name);
				self._percussion_arr.push({
					"_id":id,
					"_key":key,
					"_variable":'',
					"_fine":(key!=null?true:false),
					"_pitch":0
				});
			}
		}
	};

	this.SetBeginningMeasureSeq = function(bms){
		self._begin_measure_seq = new Number(bms);
	};

	this.TempoPlus = function(){
		//self.Pause();
		self._music._default_tempo = parseInt(self._music._default_tempo) + parseInt(5);
		for(var p=0 ; p<self._music._part_arr.length ; p++){
			var part = self._music._part_arr[p];
			for(var m=0 ; m<part._measure_arr.length ; m++){
				var measure = part._measure_arr[m];
				measure._tempo += 5;
			}
		}
		//self.Resume();
	};

	this.TempoMinus = function(){
		//self.Pause();
		self._music._default_tempo = parseInt(self._music._default_tempo) - parseInt(5);
		for(var p=0 ; p<self._music._part_arr.length ; p++){
			var part = self._music._part_arr[p];
			for(var m=0 ; m<part._measure_arr.length ; m++){
				var measure = part._measure_arr[m];
				measure._tempo -= 5;
			}
		}
		//self.Resume();
	};

	this.Play = function(){
		//self._isPlaying = true;
		var debug = true;
		self._player_state = PLAYER_STATE.PLAY;
		self._begin_measure_time_offset = self.GetMeasureTimeOffset(self._begin_measure_seq);

		self._measure_offset_arr = [];
		for(var mps=0 ; mps<self._music._measure_play_sequence.length ; mps++){
			self._measure_offset_arr[mps] = self.GetMeasureTimeOffset(mps);
			//if(debug) console.log(mps + ' => ' + self._measure_offset_arr[mps]);
		}

		var ready_time = 0;
		if(self._play_countdown){
			var beat_milli_sec = self.GetQuarterMilliSec();
			var pitch = DRUM_GetPitch(self._DEFAULT_READY_STICK);
			var stime = self._audioContext.currentTime;

			for(var i=0 ; i<4 ; i++){
				self._player.queueWaveTable(self._audioContext, self._audioContext.destination,
					eval(self._DEFAULT_READY_STICK_VARIABLE), stime + (beat_milli_sec*i), pitch, 0.5);
			}
			ready_time = beat_milli_sec * 4;
		}

		var last_measure_seq = self._music._measure_play_sequence.length - 1;
		var last_measure_index = self._music._measure_play_sequence[self._music._measure_play_sequence.length - 1];
		//if(debug) console.log('last_measure_index ' + last_measure_index);
		var last_measure_duration = self.GetMeasureDuration(last_measure_index);
		//if(debug) console.log('last_measure_duration ' + last_measure_duration);

		self._start_time = self._audioContext.currentTime + ready_time;
		self._end_time = self._measure_offset_arr[last_measure_seq] + last_measure_duration - self._begin_measure_time_offset;
		self._end_time += self._start_time;
		self._running_time = self._end_time - self._start_time;

		if(debug) console.log('self._start_time ' + self._start_time);
		if(debug) console.log('self._end_time ' + self._end_time);
		if(debug) console.log('self._running_time ' + self._running_time);
		//if(debug) console.log('self._measure_offset_arr.length ' + self._measure_offset_arr.length);

		self.PlayMeasure(self._begin_measure_seq, true);
		self.PlayMeasure(self._begin_measure_seq + 1, true);
		self._last_queue_measure_seq = self._begin_measure_seq + 1;
		self._cur_playing_measure_seq = self._begin_measure_seq;

		self.FlowControl();
	};

	this.Pause = function(){
		//self._isPlaying = false;
		self._player_state = PLAYER_STATE.PAUSE;
		self._audioContext.suspend();
	};

	this.Resume = function(){
		self._player_state = PLAYER_STATE.PLAY;
		self._audioContext.resume();
		self.FlowControl();
	};

	this.Stop = function(){
		console.log('stop');
		//self._isPlaying = false;
		self._player_state = PLAYER_STATE.STOP;
		self._player.cancelQueue(self._audioContext);
	};

	this.FlowControl = function(){
		if(self._player_state != PLAYER_STATE.PLAY)
			return;

		var playingTime = self._audioContext.currentTime - self._start_time;
		playingTime += self._begin_measure_time_offset;
		//console.log('playingTime ' + playingTime + ' endTime' + self._end_time);

		if(playingTime >= self._end_time){
			if(self._playEndCallback != null){
				self._playEndCallback();
			}
			return;
		}

		for(var i=self._cur_playing_measure_seq ; i<self._measure_offset_arr.length ; i++){
			if(playingTime < self._measure_offset_arr[i]){
				self._cur_playing_measure_seq = i-1;
				//console.log('self._cur_playing_measure_seq ' + self._cur_playing_measure_seq);
				break;
			}
		}

		if(self._last_queue_measure_seq < self._measure_offset_arr.length){
			if(playingTime > self._measure_offset_arr[self._last_queue_measure_seq-1]){
				self.PlayMeasure(self._last_queue_measure_seq+1, true);
				self._last_queue_measure_seq++;
			}
		}

		if(self._flowControlCallback != null){
			self._flowControlCallback(playingTime);
		}

		window.requestAnimationFrame(self.FlowControl);
	};

	this.GetFifth = function(part_idx, measure_idx){
		//console.log('get fifths from measure ' + measure_idx);
		if(self._music._part_arr[part_idx]._measure_arr[measure_idx]._fifths != null){
			//console.log('found fifth in this measuer ' + measure_idx);
			return self._music._part_arr[part_idx]._measure_arr[measure_idx]._fifths;
		}

		for(var m = measure_idx ; m >= 0 ; m--){
			//console.log('find fifths ' + m + ' ' + self._music._part_arr[part_idx]._measure_arr[m]._fifths);
			if(self._music._part_arr[part_idx]._measure_arr[m]._fifths != null){
				//console.log('found fifths in ' + m + ' measure');
				return self._music._part_arr[part_idx]._measure_arr[m]._fifths;
			}
		}
		//console.log('fifths not found');
		return 0;
	};

	/*
	 Fifths table
	       C#D#EF#G#A#BC
	 +1 G  _______-_____ +5
	 +2 D  __-__________ +10
	 +3 A  _________-___ +3
	 +4 E  ____-________ +8
	 +5 B  ___________-_ +1
	 +6 F# ______-______ +6
	 -1 F  _____-_______ +7
	 -2 Bb __________-__ +2
	 -3 Eb ___-_________ +9
	 -4 Ab ________-____ +4
	 -5 Db _-___________ +11
	 -6 Gb ______-______ +6
	 */
	this.GetKeyChange = function(fifths){
		var key_change = 0;
		if(fifths == 1) {
			key_change = 5;
		}else if(fifths == 2) {
			key_change = 10;
		}else if(fifths == 3) {
			key_change = 3;
		}else if(fifths == 4){
			key_change = 8;
		}else if(fifths == 5){
			key_change = 1;
		}else if(fifths == 6){
			key_change = 6;
		}else if(fifths == -1){
			key_change = 7;
		}else if(fifths == -2){
			key_change = 2;
		}else if(fifths == -3){
			key_change = 9;
		}else if(fifths == -4){
			key_change = 4;
		}else if(fifths == -5){
			key_change = 11;
		}else if(fifths == -6){
			key_change = 6;
		}

		return key_change;
	};

	this.PlayMeasure = function(measure_seq, is_play){
		if(measure_seq >= self._music._measure_play_sequence.length)
			return;

		var measure_index = self._music._measure_play_sequence[measure_seq];
		if(is_play){
			//console.log('play measure ' + measure_index);
		}

		var measure_duration = new Number(0);

		for(var p=0 ; p<self._music._part_arr.length ; p++){
			var part = self._music._part_arr[p];

			if(measure_index >= part._measure_arr.length){
				continue;
			}

			var fifths = self.GetFifth(p, measure_index);
			var key_change = self.GetKeyChange(fifths);

			var time_offset = self._start_time;

			var measure = part._measure_arr[measure_index];
			var beat_milli_sec = self.GetBeatMilliSec(measure);
			time_offset += self.GetMeasureTimeOffset(measure_seq);
			time_offset -= self._begin_measure_time_offset;

			for(var n=0 ; n<measure._note_arr.length ; n++){
				var note = measure._note_arr[n];
				var chord = measure._chord_arr[n];
				var note_duration = new Number(note._duration * beat_milli_sec);
				var tie_duration = new Number(0);

				if(note._chord){
					time_offset -= note_duration;
				}

				if(note._rest){
					time_offset += note_duration;
				}else if(note._backup){
					time_offset -= note_duration;
				}else{
					if(note._tie_type == TIE_TYPE.START){
						var tie_dur_val = self.GetTieDuration(p, measure_index, n);
						tie_duration = new Number(tie_dur_val * beat_milli_sec);
					}else if(note._tie_type == TIE_TYPE.STOP || note._tie_type == TIE_TYPE.STOP_START){
						time_offset += note_duration;
						continue;
					}

					if(is_play && self._part_play_arr[p] == true){
						var play_duration = note_duration + tie_duration;
						if(part._is_percussion){
							if(self._play_percussion){
								if(note._is_unpitched){
									var perc = self.GetPercussion(note._instrument_id);
									self.QueuePercussion(perc._variable, time_offset, perc._pitch, play_duration, part._volume);
								}
							}
						}else{
							if(self._play_melody){
								var variable = self.GetInstrumentVariable(part._id);
								self.Queue(variable, time_offset, note, play_duration, part._volume, key_change);
							}
						}

						if(chord != null && chord != ''){
							if(self._play_guitar){
								//console.log('play chord ' + chord);
								//self.PlayChord(chord, time_offset, part._volume);
							}
						}
					}
					time_offset += note_duration;
				}
			}

			if(measure_duration < time_offset){
				measure_duration = time_offset;
			}
		}

		return measure_duration;
	};

	this.PlayChord = function (chord, time_offset, volume) {
		var chord_info = self._chordManager._chordDB.GetChordInfo(chord);
		if(chord_info == null){
			console.error("Cannot find chord " + chord);
			return;
		}

		self.PlayChordWithChordInfo(chord_info, time_offset, volume);
	};

	this.PlayChordWithChordInfo = function(chord_info, time_offset, volume){
		var fretString = self._chordManager.GetFretString(chord_info.fret, chord_info.stringFrets);
		var pitches = self._chordManager.GetPitches(fretString);
		self._player.queueStrumDown(self._audioContext, self._audioContext.destination,
			eval(self._DEFAULT_GUITAR_VARIABLE), time_offset, pitches,
			1.5, volume/100);
	};

	this.GetInstrumentVariable = function(id){
		for(var i=0 ; i<self._instrument_arr.length ; i++){
			if(self._instrument_arr[i]._id == id){
				return self._instrument_arr[i]._variable;
			}
		}
		return null;
	};

	this.GetPercussion = function(id){
		for(var p=0 ; p<self._percussion_arr.length ; p++){
			if(self._percussion_arr[p]._id == id){
				return self._percussion_arr[p];
			}
		}
		return null;
	};

	this.QueuePercussion = function(variable, time_offset, pitch, duration, volume){
		self._player.queueWaveTable(self._audioContext, self._audioContext.destination,
			eval(variable), time_offset, pitch, duration, volume/100);
	};

	this.Queue = function(variable, time_offset, note, duration, volume, key_change){
		if(note._voice > 4){
			return;
		}
		var pitch = self.GetPitch(note);
		if(key_change != 0){
			pitch = pitch + key_change;
		}
		self._player.queueWaveTable(self._audioContext, self._audioContext.destination,
			eval(variable), time_offset, pitch, duration, volume/100);
	};

	this.GetTieDuration = function(part_index, measure_index, begin_note_index){
		var part = self._music._part_arr[part_index];
		var duration = new Number(0);
		for(var m=measure_index ; m<part._measure_arr.length ; m++){
			for(var n=begin_note_index+1 ; n<part._measure_arr[m]._note_arr.length ; n++){
				var note = part._measure_arr[m]._note_arr[n];
				if(note._tie_type == TIE_TYPE.STOP_START){
					//console.log('stop start ' + new Number(note._duration));
					duration += new Number(note._duration);
				}else if(note._tie_type == TIE_TYPE.STOP){
					//console.log('stop ' + new Number(note._duration));
					duration += new Number(note._duration);
					return duration;
				}
			}
		}
		//console.log('duration ' + duration);
		return duration;
	};

	this.GetMeasureTimeOffset = function(measure_seq){
		var part = self._music._part_arr[0];
		var time_offset = new Number(0);

		for(var mps=0 ; mps<self._music._measure_play_sequence.length ; mps++){
			if(mps == measure_seq)
				break;

			var measure_idx = self._music._measure_play_sequence[mps];
			var measure = part._measure_arr[measure_idx];
			var beat_milli_sec = self.GetBeatMilliSec(measure);
			var measure_time_sec = beat_milli_sec * measure._divisions * measure._beats / (measure._beat_type/4);
			time_offset += measure_time_sec;
		}
		//console.log('measure_time_offset ' + time_offset);
		return time_offset;
	};

	this.GetMeasureSequenceDuration = function(measure_seq){
		var measure_index = self._music._measure_play_sequence[measure_seq];
		return self.GetMeasureDuration(measure_index);
	};

	this.GetMeasureDuration = function(measure_index){
		var part = self._music._part_arr[0];
		var measure = part._measure_arr[measure_index];
		var beat_milli_sec = self.GetBeatMilliSec(measure);
		return new Number(beat_milli_sec * measure._divisions * measure._beats / (measure._beat_type/4));
	};

	this.GetBeatMilliSec = function(measuer){
		var one_duration_milli_sec = (60/new Number(measuer._tempo)) * (1/new Number(measuer._divisions));
		//console.log('one_duration_milli_sec ' + one_duration_milli_sec);
		return one_duration_milli_sec;
	};
	this.GetQuarterMilliSec = function(){
		return (60/new Number(self._music._default_tempo));
	};

	this.GetPitch = function(note){
		var pitch = new Number(note._octave) * new Number(12);
		switch(note._step){
			case 'C':
				pitch += 0;
				break;
			case 'D':
				pitch += 2;
				break;
			case 'E':
				pitch += 4;
				break;
			case 'F':
				pitch += 5;
				break;
			case 'G':
				pitch += 7;
				break;
			case 'A':
				pitch += 9;
				break;
			case 'B':
				pitch += 11;
				break;
		}

		if(note._alter != 0){
			pitch += note._alter;
		}
		return pitch;
	};
};
