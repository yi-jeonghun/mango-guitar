
function Note() {
	this.s = 0;//scale
	this.c = 0;//count
};

function Instrument() {
	this._key = '0000_Aspirin_sf2_file';
	this._volume = 40;
	this._octave = 4;
	this._notes = [];
};

function Guitar(){
	this._key = DEFAULT_GUITAR;
	this._capo = 0;
	this._volume = 40;
	this._chords = [];
	this._patternPerMeasure = [];
	this._tabPattern4M = [];
	this._strums = [];
	this._tabs = [];
};

function Hit(){
	this.s = 0;
	this.c = 0;
};

function DrumSet(){
	this._keyList = [];
	this._volume = 40;
	this._hits = [];
};

function Bar(){
	this._color = 'bbdaff';
	this._measureCount = DEFAULT_MEASURE_COUNT;
	this._qdList = [
		QUARTER_DIVIDE._44,
		QUARTER_DIVIDE._44,
		QUARTER_DIVIDE._44,
		QUARTER_DIVIDE._44
	];//quarter divide list
};

function Song() {
	this._version = '1.3';
	this._title = '';
	this._singer = '';
	this._words = '';
	this._music = '';
	this._bpm = 120;
	this._quarter = 4;//한 마디에 몇 박자
	this._divide = 4;//한 박자를 몇 등분
	this._instList = [];
	this._barList = [];
	this._guitar;
	this._drumSet;
	this._lyrics = [];
};

//LoadSong, CopyAndPaste, SwapBar

function SongHandle() {
	var self = this;
	this._hasGuitarStroke = -1;
	this._hasTabs = -1;
	this._instrumentCount = 0;

	this.Initialize = function () {
		_song = null;
		_song = new Song();
		_song._barList.push(new Bar());
		_song._instList.push(new Instrument());
		_song._guitar = new Guitar();
		_song._drumSet = new DrumSet();
	};

	this.LoadSong = function(jsonStr){
		self.Initialize();

		//default count for Ready Stick
		self._instrumentCount++;
		//console.log('self._instrumentCount ' + self._instrumentCount);

		var src = JSON.parse(jsonStr);
		{
			_song._title = src._title;
			_song._singer = src._singer;
			_song._words = src._words;
			_song._music = src._music;
			_song._bpm = src._bpm;
			_song._quarter = src._quarter;
			_song._divide = src._divide;

			for(var i = 0 ; i < src._instList.length ; i++){
				if(_song._instList[i] == null){
					_song._instList[i] = new Instrument();
				}
				_song._instList[i]._key = src._instList[i]._key;
				self._instrumentCount++;
				//console.log('self._instrumentCount ' + self._instrumentCount);
				_song._instList[i]._volume = src._instList[i]._volume;
				_song._instList[i]._octave = src._instList[i]._octave;
				for(var n = 0 ; n < src._instList[i]._notes.length ; n++){
					if(src._instList[i]._notes[n] != null){
						_song._instList[i]._notes[n] = [];
						for(var s = 0 ; s < src._instList[i]._notes[n].length ; s++){
							if(src._instList[i]._notes[n][s] != null){
								var note = new Note();
								note.s = src._instList[i]._notes[n][s].s;
								note.c = src._instList[i]._notes[n][s].c;
								_song._instList[i]._notes[n][s] = note;
							}
						}
					}
				}
			}

			for(var i = 0 ; i < src._barList.length ; i++){
				var bar = new Bar();
				bar._color = src._barList[i]._color;
				bar._measureCount = src._barList[i]._measureCount;

				console.log('src._barList[i]._qdList ' + src._barList[i]._qdList);
				if(src._barList[i]._qdList == "undefined" || src._barList[i]._qdList == null){
					for(var m = 0 ; m < bar._measureCount ; m++){
						if(_song._quarter == 3 && _song._divide == 4)
							bar._qdList[m] = QUARTER_DIVIDE._34;
						if(_song._quarter == 4 && _song._divide == 3)
							bar._qdList[m] = QUARTER_DIVIDE._43;
						if(_song._quarter == 4 && _song._divide == 4)
							bar._qdList[m] = QUARTER_DIVIDE._44;
					}
				}else{
					for(var j = 0 ; j < src._barList[i]._qdList.length ; j++){
						//console.log('j ' + j + ' qd ' + src._barList[i]._qdList[j]);
						bar._qdList[j] = src._barList[i]._qdList[j];
					}
				}
				_song._barList[i] = bar;
			}

			{//guitar
				_song._guitar._key = src._guitar._key;
				if(src._guitar._capo){
					_song._guitar._capo = src._guitar._capo;
				}
				self._instrumentCount++;
				//console.log('self._instrumentCount ' + self._instrumentCount);
				_song._guitar._volume = src._guitar._volume;
				for(var i = 0 ; i < src._guitar._chords.length ; i++){
					_song._guitar._chords[i] = src._guitar._chords[i];
				}
				for(var i = 0 ; i < src._guitar._strums.length ; i++){
					_song._guitar._strums[i] = src._guitar._strums[i];
				}
				for(var i = 0 ; i < src._guitar._tabs.length ; i++){
					if(src._guitar._tabs[i] != null){
						_song._guitar._tabs[i] = [];
						for(var t = 0 ; t < src._guitar._tabs[i].length ; t++){
							_song._guitar._tabs[i][t] = src._guitar._tabs[i][t];
						}
					}
				}
				for(var p = 0 ; p < src._guitar._patternPerMeasure.length ; p++){
					_song._guitar._patternPerMeasure[p] = src._guitar._patternPerMeasure[p];
				}
				if(src._guitar._tabPattern4M != 'undefined' && src._guitar._tabPattern4M != null){
					for(var p = 0 ; p < src._guitar._tabPattern4M.length ; p++){
						_song._guitar._tabPattern4M[p] = src._guitar._tabPattern4M[p];
					}
				}
			}

			{//drum
				for(var i = 0 ; i < src._drumSet._keyList.length ; i++){
					if(src._drumSet._keyList[i] != null){
						//console.log('src._drumSet._keyList[i] ' + i + ' ' + src._drumSet._keyList[i]);
						_song._drumSet._keyList[i] = src._drumSet._keyList[i];
						self._instrumentCount++;
						//console.log('self._instrumentCount ' + self._instrumentCount);
					}
				}
				_song._drumSet._volume = src._drumSet._volume;

				for(var i = 0 ; i < src._drumSet._hits.length ; i++){
					if(src._drumSet._hits[i] != null){
						_song._drumSet._hits[i] = [];
						for(var h = 0 ; h < src._drumSet._hits[i].length ; h++){
							if(src._drumSet._hits[i][h] != null){
								var hit = new Hit();
								hit.s = src._drumSet._hits[i][h].s;
								hit.c = src._drumSet._hits[i][h].c;
								_song._drumSet._hits[i][h] = hit;
							}
						}
					}
				}
			}

			{//lyrics
				for(var i = 0 ; i < src._lyrics.length ; i++){
					_song._lyrics[i] = src._lyrics[i];
				}
			}
		}

	};

	this.AddInstrument = function(){
		_song._instList.push(new Instrument());
	};

	this.RemoveInstrument = function(instID){
		_song._instList.splice(instID, 1);
	};

	//return 추가한 Bar index;
	this.AddBar = function () {
		var bar = new Bar();
		bar._measureCount = DEFAULT_MEASURE_COUNT;
		for(var i = 0 ; i < bar._measureCount ; i++){
			if(_song._quarter == 3 && _song._divide == 4)
				bar._qdList[i] = QUARTER_DIVIDE._34;
			if(_song._quarter == 4 && _song._divide == 3)
				bar._qdList[i] = QUARTER_DIVIDE._43;
			if(_song._quarter == 4 && _song._divide == 4)
				bar._qdList[i] = QUARTER_DIVIDE._44;
		}
		_song._barList.push(bar);
		return _song._barList.length - 1;
	};

	this.RemoveBar = function (barID) {
		var note_count = self.GetNoteCountOfBar(barID);
		var offset = self.GetNoteOffset(barID);
		console.log('note_count:' + note_count + ' offset:' + offset);
		_song._barList.splice(barID, 1);
		for (var i = 0; i < _song._instList.length; i++) {
			_song._instList[i]._notes.splice(offset, note_count);
		}
		_song._guitar._chords.splice(offset, note_count);
		_song._lyrics.splice(offset, note_count);
		_song._drumSet._hits.splice(offset, note_count);
	};

	this.GetNoteOffset = function (barID) {
		var offset = 0;
		for (var i = 0; i < barID; i++) {
			var add = _songHandle.GetNoteCountOfBar(i);
			offset += add;
		}
		return offset;
	};

	this.GetNoteOffsetOfMeasure = function(measureID){
		var offset = new Number(0);
		var mid = new Number(-1);

		for(var b = 0 ; b < _song._barList.length ; b++){
			for(var m = 0 ; m < _song._barList[b]._measureCount ; m++){
				mid++;
				if(mid >= measureID)
					return offset;

				offset += self.GetNoteCountFromQD(_song._barList[b]._qdList[m]);
			}
		}
		return offset;
	};

	this.GetBarIDOfNote = function(noteID){
		var sum = new Number(-1);
		for(var i = 0 ; i < _song._barList.length ; i++){
			var note_count = self.GetNoteCountOfBar(i);
			sum += new Number(note_count);
			if(noteID <= sum)
				return i;
		}
		return -1;
	};

	this.GetNoteCountFromQD = function(qd){
		switch(qd){
			case QUARTER_DIVIDE._34:
				return new Number(12);
				break;
			case QUARTER_DIVIDE._43:
				return new Number(12);
				break;
			case QUARTER_DIVIDE._44:
				return new Number(16);
				break;
			case QUARTER_DIVIDE._24:
				return new Number(8);
				break;
		}
		return 0;
	};

	this.GetNoteCountOfBar = function (barID) {
		var total = new Number(0);
		for(var i = 0 ; i < _song._barList[barID]._measureCount ; i++){
			total += self.GetNoteCountFromQD(_song._barList[barID]._qdList[i]);
		}

		return total;
	};

	//fixme performance optimization needed
	this.GetMeasureIDOfNote = function(note){
		var note_cnt_sum = new Number(0);
		var mid = new Number(0);
		for(var b = 0 ; b < _song._barList.length ; b++){
			for(var m = 0 ; m < _song._barList[b]._measureCount ; m++){
				note_cnt_sum += self.GetNoteCountFromQD(_song._barList[b]._qdList[m]);
				if(note_cnt_sum > note){
					return mid;
				}
				mid++;
			}
		}

		return mid;
	};

	this.GetMeasureOffset = function(barID){
		var offset = new Number(0);
		for(var i = 0 ; i < _song._barList.length ; i++){
			if(i == barID)
				break;
			offset += _song._barList[i]._measureCount;
		}
		return offset;
	};

	this.GetNoteCountOfMeasure = function(measureID){
		var mid = new Number(-1);
		for(var b = 0 ; b < _song._barList.length ; b++) {
			for (var m = 0; m < _song._barList[b]._measureCount; m++) {
				mid++;
				if(mid == measureID){
					return self.GetNoteCountFromQD(_song._barList[b]._qdList[m]);
				}
			}
		}
		return 0;
	};

	this.AddMeasure = function (barID) {
		_song._barList[barID]._measureCount++;
		var cnt = _song._barList[barID]._qdList.length;

		if(_song._quarter == 3 && _song._divide == 4)
			_song._barList[barID]._qdList[cnt] = QUARTER_DIVIDE._34;
		if(_song._quarter == 4 && _song._divide == 3)
			_song._barList[barID]._qdList[cnt] = QUARTER_DIVIDE._43;
		if(_song._quarter == 4 && _song._divide == 4)
			_song._barList[barID]._qdList[cnt] = QUARTER_DIVIDE._44;
	};

	this.RemoveMeasure = function (barID) {
		_song._barList[barID]._measureCount--;
		var last = _song._barList[barID]._qdList.length - 1;
		_song._barList[barID]._qdList.splice(last, 1);
	};

	this.AssignNote = function (instID, barID, noteID, scale, count) {
		var offset = self.GetNoteOffset(barID);
		offset = new Number(offset) + new Number(noteID);

		var n = new Note();
		n.s = scale;
		n.c = count;

		if (_song._instList[instID]._notes[offset] == null) {
			_song._instList[instID]._notes[offset] = [];
		}
		_song._instList[instID]._notes[offset].push(n);
	};

	this.AssignDrumNote = function(barID, noteID, scale, count){
		var offset = self.GetNoteOffset(barID);
		offset = new Number(offset) + new Number(noteID);

		if(_song._drumSet._hits[offset] == null){
			_song._drumSet._hits[offset] = [];
		}
		var hit = new Hit();
		hit.s = scale;
		hit.c = count;
		_song._drumSet._hits[offset].push(hit);
	};

	this.DeleteNoteScale = function (instID, barID, noteID, scale) {
		var offset = self.GetNoteOffset(barID);
		offset = new Number(offset) + new Number(noteID);
		for (var i = 0; i < _song._instList[instID]._notes[offset].length; i++) {
			if (_song._instList[instID]._notes[offset][i].s == scale) {
				_song._instList[instID]._notes[offset].splice(i, 1);
				break;
			}
		}
	};

	this.DeleteDrumNote = function(noteID, scale){
		console.log('noteID ' + noteID + ' scale' + scale);
		if(_song._drumSet._hits[noteID] != null){
			for(var i=0 ; i<_song._drumSet._hits[noteID].length ; i++){
				if(_song._drumSet._hits[noteID][i].s == scale){
					_song._drumSet._hits[noteID].splice(i, 1);
				}
			}
		}
	};

	this.GetChordList = function () {
		var chords = [];
		for (var c = 0 ; c < _song._guitar._chords.length ; c++) {
			var chord = _song._guitar._chords[c];
			if (chords.includes(chord) == false) {
				chords.push(chord);
			}
		}
		return chords;
	};

	this.CopyAndPaste = function (from, to) {
		console.log('from ' + from + ' to ' + to);
		if (from < 0 || to < 0)
			return;
		if (from == to)
			return;

		var from_offset = self.GetNoteOffset(from);
		var from_note_count = self.GetNoteCountOfBar(from);
		var to_offset = self.GetNoteOffset(to);
		var to_note_count = self.GetNoteCountOfBar(to);
		var count = 0;
		console.log('from_offset:' + from_offset + ' from count ' + from_note_count + ' to_offset:' + to_offset + ' to count ' + to_note_count);

		//strum pattern
		var to_measure_offset = self.GetMeasureOffset(to);
		var from_measure_offset = self.GetMeasureOffset(from);
		for(var m = 0 ; m < _song._barList[to]._measureCount ; m++){
			_song._guitar._patternPerMeasure[to_measure_offset + m] = _song._guitar._patternPerMeasure[from_measure_offset + m];
		}

		if (from_note_count == to_note_count) {
			count = from_note_count;
		} else if (from_note_count > to_note_count) {
			count = to_note_count;
		} else if (from_note_count < to_note_count) {
			count = from_note_count;
		}
		count = new Number(count);

		//copy chord lyrics
		for (var i = 0; i < count; i++) {
			var from = new Number(from_offset) + new Number(i);
			var to = new Number(to_offset) + new Number(i);

			_song._guitar._chords[to] = null;
			if(_song._guitar._chords[from] != null)
				_song._guitar._chords[to] = _song._guitar._chords[from];

			//stroke
			_song._guitar._strums[to] = null;
			if(_song._guitar._strums[from] != null)
				_song._guitar._strums[to] = _song._guitar._strums[from];

			//tabs
			_song._guitar._tabs[to] = null;
			if(_song._guitar._tabs[from] != null)
			{
				_song._guitar._tabs[to] = [];
				for(var t = 0 ; t < 6 ; t++){
					_song._guitar._tabs[to][t] = _song._guitar._tabs[from][t];
				}
			}

			_song._lyrics[to] = null;
			if(_song._lyrics[from] != null)
				_song._lyrics[to] = _song._lyrics[from];
		}

		//copy instruments
		for (var j = 0; j < _song._instList.length; j++) {
			for (var i = 0; i < count; i++) {
				var from = new Number(from_offset) + new Number(i);
				var to = new Number(to_offset) + new Number(i);
				_song._instList[j]._notes[to] = null;
				if(_song._instList[j]._notes[from] != null) {
					_song._instList[j]._notes[to] = [];
					for(var s=0 ; s<_song._instList[j]._notes[from].length ; s++){
						var note = new Note();
						note.s = _song._instList[j]._notes[from][s].s;
						note.c = _song._instList[j]._notes[from][s].c;
						_song._instList[j]._notes[to].push(note);
					}
				}
			}
		}

		//copy drum
		for(var n=0 ; n<count ; n++){
			var source = new Number(from_offset) + new Number(n);
			var target = new Number(to_offset) + new Number(n);
			_song._drumSet._hits[target] = null;
			if(_song._drumSet._hits[source] != null){
				_song._drumSet._hits[target] = [];
				for(var s=0 ; s<_song._drumSet._hits[source].length ; s++){
					var hit = new Hit();
					hit.s = _song._drumSet._hits[source][s].s;
					hit.c = _song._drumSet._hits[source][s].c;
					_song._drumSet._hits[target].push(hit);
				}
			}
		}
	};

	this.InsertNote = function (barID, noteID) {
		console.log('insert');
		var offset = self.GetNoteOffset(barID);
		var new_offset = new Number(offset) + new Number(noteID);
		_song._guitar._chords.splice(new_offset, 0, null);
		_song._lyrics.splice(new_offset, 0, null);
		for (var i = 0; i < _song._instList.length; i++) {
			_song._instList[i]._notes.splice(new_offset, 0, null);
		}
		_song._drumSet._hits.splice(new_offset, 0, null);
	};

	this.RemoveNote = function (barID, noteID) {
		console.log('RemoveNote');
		var offset = self.GetNoteOffset(barID);
		var new_offset = new Number(offset) + new Number(noteID);
		_song._guitar._chords.splice(new_offset, 1);
		_song._lyrics.splice(new_offset, 1);
		for (var i = 0; i < _song._instList.length; i++) {
			_song._instList[i]._notes.splice(new_offset, 1);
		}
		_song._drumSet._hits.splice(new_offset, 1);
	};

	this.CopyAndPasteMeasure = function (mode, fromBarID, fromMeasureID, toBarID, toMeasureID) {
		console.log(fromBarID + ' ' + fromMeasureID + ' ' + toBarID + ' ' + toMeasureID);
		var count_per_measure = _songHandle.GetNoteCountOfMeasure(toMeasureID);
		console.log('count_per_measure ' + count_per_measure);
		var from_offset = self.GetNoteOffset(fromBarID);
		from_offset = new Number(from_offset) + (new Number(fromMeasureID) * count_per_measure)
		var to_offset = self.GetNoteOffset(toBarID);
		to_offset = new Number(to_offset) + (new Number(toMeasureID) * count_per_measure);
		console.log('from ' + from_offset + ' to ' + to_offset);

		if(mode == TABLE_MODE.INSTRUMENT){
			for (var i = 0; i < count_per_measure; i++) {
				var source = new Number(from_offset) + new Number(i);
				var target = new Number(to_offset) + new Number(i);
				_song._guitar._chords[target] = _song._guitar._chords[source];
				_song._lyrics[target] = _song._lyrics[source];
			}

			for (var i = 0; i < _song._instList.length; i++) {
				for (var n = 0; n < count_per_measure; n++) {
					var source = new Number(from_offset) + new Number(n);
					var target = new Number(to_offset) + new Number(n);
					_song._instList[i]._notes[target] = null;
					console.log('source : ' + source);
					if (_song._instList[i]._notes[source] != null) {
						_song._instList[i]._notes[target] = [];
						console.log('len;' + _song._instList[i]._notes[source].length);
						for (var s = 0; s < _song._instList[i]._notes[source].length; s++) {
							var note = new Note();
							note.s = _song._instList[i]._notes[source][s].s;
							note.c = _song._instList[i]._notes[source][s].c;
							_song._instList[i]._notes[target].push(note);
						}
					}
				}
			}
		}else if(mode == TABLE_MODE.DRUM){
			for(var n=0 ; n<count_per_measure ; n++){
				var source = new Number(from_offset) + new Number(n);
				var target = new Number(to_offset) + new Number(n);
				_song._drumSet._hits[target] = null;
				if(_song._drumSet._hits[source] != null){
					_song._drumSet._hits[target] = [];
					for(var s=0 ; s<_song._drumSet._hits[source].length ; s++){
						var hit = new Hit();
						hit.s = _song._drumSet._hits[source][s].s;
						hit.c = _song._drumSet._hits[source][s].c;
						_song._drumSet._hits[target].push(hit);
					}
				}
			}
		}
	};

	this.MoveBarUp = function (barID) {
		console.log('barID ' + barID);
		self.SwapBar(new Number(barID) - 1, barID);
	};

	this.MoveBarDown = function (barID) {
		console.log('barID ' + barID);
		self.SwapBar(barID, new Number(barID) + 1);
	};

	this.SwapBar = function (bar_1, bar_2) {
		//copy bar1 -> temp
		var bar_1_note_offset = self.GetNoteOffset(bar_1);
		var bar_1_count = self.GetNoteCountOfBar(bar_1);
		var bar_2_note_offset = self.GetNoteOffset(bar_2);
		var bar_1_measure_offset = self.GetMeasureOffset(bar_1);
		var bar_2_measure_offset = self.GetMeasureOffset(bar_2);

		var temp_count = bar_1_count;
		var temp_guitar_chords = [];
		var temp_guitar_patternPerMeasure = [];
		var temp_guitar_strums = [];
		var temp_guitar_tabs = [];
		var temp_bar_qdList = [];

		var temp_bar1_color = _song._barList[bar_1]._color;
		var temp_bar2_color = _song._barList[bar_2]._color;
		_song._barList[bar_1]._color = temp_bar2_color;
		_song._barList[bar_2]._color = temp_bar1_color;

		{
			for(var i = 0 ; i < _song._barList[bar_1]._measureCount ; i++){
				temp_bar_qdList[i] = _song._barList[bar_1]._qdList[i];
			}

			for(var i = 0 ; i < _song._barList[bar_1]._measureCount ; i++){
				if(_song._barList[bar_2]._qdList[i] != null)
					_song._barList[bar_1]._qdList[i] = _song._barList[bar_2]._qdList[i];
			}

			for(var i = 0 ; i < temp_bar_qdList.length ; i++){
				_song._barList[bar_2]._qdList[i] = temp_bar_qdList[i];
			}
		}

		//guitar
		for (var i = 0; i < bar_1_count; i++) {
			var new_offset = new Number(bar_1_note_offset) + new Number(i);
			temp_guitar_chords[i] = _song._guitar._chords[new_offset];
			temp_guitar_strums[i] = _song._guitar._strums[new_offset];
			if(_song._guitar._tabs[new_offset] != null){
				temp_guitar_tabs[i] = [];
				for(var t = 0 ; t < _song._guitar._tabs[new_offset].length ; t++){
					temp_guitar_tabs[i][t] = _song._guitar._tabs[new_offset][t];
				}
			}
		}

		//strum pattern
		for(var m = 0 ; m < _song._barList[bar_1]._measureCount ; m++){
			var new_measure_offset = new Number(bar_1_measure_offset) + m;
			temp_guitar_patternPerMeasure[m] = _song._guitar._patternPerMeasure[new_measure_offset];
		}

		var temp_lyrics = [];
		for (var i = 0; i < bar_1_count; i++) {
			var new_offset = new Number(bar_1_note_offset) + new Number(i);
			temp_lyrics[i] = _song._lyrics[new_offset];
		}

		//fixme slides copy
		var temp_inst_notes = [[]];
		for (var j = 0; j < _song._instList.length; j++) {
			for (var i = 0; i < bar_1_count; i++) {
				var new_offset = new Number(bar_1_note_offset) + new Number(i);
				if (_song._instList[j]._notes[new_offset] == null)
					continue;

				if (temp_inst_notes[j] == null)
					temp_inst_notes[j] = [];

				for (var s = 0; s < _song._instList[j]._notes[new_offset].length; s++) {
					if(temp_inst_notes[j][i] == null)
						temp_inst_notes[j][i] = [];
					var note = new Note();
					note.s = _song._instList[j]._notes[new_offset][s].s;
					note.c = _song._instList[j]._notes[new_offset][s].c;
					temp_inst_notes[j][i].push(note);
					console.log(note);
				}
			}
		}
		console.log('temp_inst_notes ' + temp_inst_notes);

		//copy bar2 -> bar1 ==> bar1만 삭제.
		_song._guitar._chords.splice(bar_1_note_offset, bar_1_count);
		_song._guitar._strums.splice(bar_1_note_offset, bar_1_count);
		_song._guitar._tabs.splice(bar_1_note_offset, bar_1_count);
		_song._guitar._patternPerMeasure.splice(bar_1_measure_offset, _song._barList[bar_1]._measureCount);
		_song._lyrics.splice(bar_1_note_offset, bar_1_count);
		for (var j = 0; j < _song._instList.length; j++) {
			_song._instList[j]._notes.splice(bar_1_note_offset, bar_1_count);
		}

		//copy temp -> bar2
		for (var i = 0; i < temp_count; i++) {
			var new_offset = new Number(i) + new Number(bar_2_note_offset);
			if (_song._guitar._chords[new_offset] == null) {
				_song._guitar._chords[new_offset] = temp_guitar_chords[i];
			} else {
				_song._guitar._chords.splice(new_offset, 1, temp_guitar_chords[i]);
			}

			if(_song._guitar._strums[new_offset] == null){
				_song._guitar._strums[new_offset] = temp_guitar_strums[i];
			}else{
				_song._guitar._strums.splice(new_offset, 1, temp_guitar_strums[i]);
			}

			if(_song._guitar._tabs[new_offset] == null){
				_song._guitar._tabs[new_offset] = temp_guitar_tabs[i];
			}else{
				_song._guitar._tabs[new_offset].splice(new_offset, 1, temp_guitar_tabs[i]);
			}

			if (_song._lyrics[new_offset] == null) {
				_song._lyrics[new_offset] = temp_lyrics[i];
			} else {
				_song._lyrics.splice(new_offset, 1, temp_lyrics[i]);
			}
		}
		for(var i = 0 ; i < _song._barList[bar_1]._measureCount ; i++){
			var new_measure_offset = new Number(i) + new Number(bar_2_measure_offset);
			if(_song._guitar._patternPerMeasure[new_measure_offset] == null){
				_song._guitar._patternPerMeasure[new_measure_offset] = temp_guitar_patternPerMeasure[i];
			}else{
				_song._guitar._patternPerMeasure[new_measure_offset].splice(new_measure_offset, 1, temp_guitar_patternPerMeasure[i]);
			}
		}

		//악기 swap
		for (var j = 0; j < _song._instList.length; j++) {
			for (var i = 0; i < temp_count; i++) {
				var new_offset = new Number(i) + new Number(bar_2_note_offset);
				var arr = null;

				if (temp_inst_notes[j] != null) {
					if(temp_inst_notes[j][i] != null){
						var arr = [];
						console.log('temp_inst_notes[j][i].length ' + temp_inst_notes[j][i].length);
						for (var s = 0; s < temp_inst_notes[j][i].length; s++) {
							var note = new Note();
							note.s = temp_inst_notes[j][i][s].s;
							note.c = temp_inst_notes[j][i][s].c;
							console.log(note);
							arr.push(note);
						}
						if (_song._instList[j]._notes[new_offset] == null) {
							_song._instList[j]._notes[new_offset] = arr;
							console.log('1');
						} else {
							_song._instList[j]._notes.splice(new_offset, 1, arr);
							console.log('2');
						}
					}
				}
			}
		}
	};

	this.HasGuitarStroke = function(){
		if(self._hasGuitarStroke == -1){
			self._hasGuitarStroke = 0;

			for(var p = 0 ; p < _song._guitar._patternPerMeasure.length ; p++){
				if(_song._guitar._patternPerMeasure[p] == null ||
					_song._guitar._patternPerMeasure[p] == 'undefined'){
					continue;
				}else if(_song._guitar._patternPerMeasure[p] == STRUM_PATTERN_NONE){
					continue;
				}else{
					self._hasGuitarStroke = 1;
					break;
				}
			}
		}
		return self._hasGuitarStroke == 1 ? true : false;
	};

	this.HasTabs = function(){
		if(self._hasTabs == -1){
			self._hasTabs = 0;
			for(var i = 0 ; i < _song._guitar._tabs.length ; i++){
				if(_song._guitar._tabs[i] == null)
					continue;
				for(var t = 0 ; t < _song._guitar._tabs[i].length ; t++){
					if(_song._guitar._tabs[i][t] != null){
						self._hasTabs = 1;
						break;
					}
				}
			}
		}
		return self._hasTabs == 1 ? true : false;
	};

	this._slidesNoteList = [];
	//{
	//	'_note':0,
	//	'_scale':0,
	//	'_slides':[]
	//}
	this.SlidesAppend = function(note, scale, count, slide){
		console.log('append note ' + note + ' scale ' + scale + ' count ' + count + ' slide ' + slide);
		//var offset = self.GetNoteOffset(_maestroMain._curBarID);
		//var new_note = new Number(offset) + new Number(note);
		var found = false;
		for(var i = 0 ; i < self._slidesNoteList.length ; i++){
			if(self._slidesNoteList[i]._note == note){
				if(self._slidesNoteList[i]._scale == scale){
					self._slidesNoteList[i]._slides[count] = slide;
					found = true;
					break;
				}
			}
		}
		if(found == false){
			var newSlide = {
				'_note':note,
				'_scale':scale,
				'_slides':[]
			};
			newSlide._slides[count] = slide;
			self._slidesNoteList.push(newSlide);
		}
		console.log(self._slidesNoteList.length);
	};

	this.SlidesRemove = function(note, scale, count){
		console.log('remove')
		//var offset = self.GetNoteOffset(_maestroMain._curBarID);
		//var new_note = new Number(offset) + new Number(note);
		for(var i = 0 ; i < self._slidesNoteList.length ; i++){
			if(self._slidesNoteList[i]._note == note){
				if(self._slidesNoteList[i]._scale == scale){
					self._slidesNoteList[i]._slides[count] = null;
					break;
				}
			}
		}
	};

	this.SlidesIsSelected = function(note, scale, count){
		//var offset = self.GetNoteOffset(_maestroMain._curBarID);
		//var new_note = new Number(offset) + new Number(note);
		for(var i = 0 ; i < self._slidesNoteList.length ; i++){
			if(self._slidesNoteList[i]._note == note){
				if(self._slidesNoteList[i]._scale == scale){
					if(self._slidesNoteList[i]._slides[count] != null){
						return true;
					}
				}
			}
		}
		return false;
	};

	this.SlidesClear = function(){
		self._slidesNoteList.length = 0;
	};

	this.SlidesUp = function(){
		self.SlidesMove(1);
	};

	this.SlidesDown = function(){
		self.SlidesMove(-1);
	};

	this.SlidesMove = function(up_down){
		for(var i = 0 ; i < self._slidesNoteList.length ; i++) {
			var note = self._slidesNoteList[i]._note;
			var scale = self._slidesNoteList[i]._scale;
			if(_song._instList[_maestroMain._curInstID]._notes[note] != null){
				for(var s = 0 ; s < _song._instList[_maestroMain._curInstID]._notes[note].length ; s++){
					if(_song._instList[_maestroMain._curInstID]._notes[note][s].s == scale){
						if(_song._instList[_maestroMain._curInstID]._notes[note][s]._slides == null){
							_song._instList[_maestroMain._curInstID]._notes[note][s]._slides = [];
							for(var c = 0 ; c < _song._instList[_maestroMain._curInstID]._notes[note][s].c ; c++){
								_song._instList[_maestroMain._curInstID]._notes[note][s]._slides[c] = _song._instList[_maestroMain._curInstID]._notes[note][s].s;
							}
						}
						for(var t = 0 ; t < self._slidesNoteList[i]._slides.length ; t++){
							if(self._slidesNoteList[i]._slides[t] != null){
								self._slidesNoteList[i]._slides[t] = self._slidesNoteList[i]._slides[t] + up_down;
								_song._instList[_maestroMain._curInstID]._notes[note][s]._slides[t] =
									self._slidesNoteList[i]._slides[t];
							}
						}
					}
				}
			}
		}
	};

	this.GetStrumList = function(){
		var prev_pattern_key = -1;
		var prev_chord_info = null;
		var note_offset = 0;

		var strums = [];
		var accents = [];
		var frets = [];

		for(var p = 0 ; p < _song._guitar._patternPerMeasure.length ; p++){
			note_offset = self.GetNoteOffsetOfMeasure(p);
			var note_count_of_measure = self.GetNoteCountOfMeasure(p);

			if(_song._guitar._patternPerMeasure[p] == null ||
				_song._guitar._patternPerMeasure[p] == 'undefined' ||
				_song._guitar._patternPerMeasure[p] == STRUM_PATTERN_NONE){
				continue;
			}else	if(_song._guitar._patternPerMeasure[p] == STRUM_PATTERN_SAME){
				if(prev_pattern_key == -1){
					continue;
				}
				var spi = STRUM_GetStrumPatternInfo(prev_pattern_key);
				for(var n = 0 ; n < note_count_of_measure ; n++){
					var note_id = note_offset + n;
					if(_song._guitar._chords[note_id] != null){
						prev_chord_info = GetChordInfo(_song._guitar._chords[note_id], CHORD_MODE.GUITAR);
					}
					if(prev_chord_info != null){
						strums[note_id] = spi._strums[n];
						accents[note_id] = spi._accents[n];
						frets[note_id] = GetFretString(prev_chord_info.fret, prev_chord_info.stringFrets);
					}
				}
			}else if(_song._guitar._patternPerMeasure[p] == STRUM_PATTERN_CUSTOM) {
				for(var n = 0 ; n < note_count_of_measure ; n++){
					var note_id = note_offset + n;
					if(_song._guitar._chords[note_id] != null){
						prev_chord_info = GetChordInfo(_song._guitar._chords[note_id], CHORD_MODE.GUITAR);
					}
					if(prev_chord_info != null){
						strums[note_id] = _song._guitar._strums[note_id];
						frets[note_id] = GetFretString(prev_chord_info.fret, prev_chord_info.stringFrets);
					}
				}
			}else{
				var key = _song._guitar._patternPerMeasure[p];
				prev_pattern_key = key;
				var spi = STRUM_GetStrumPatternInfo(key);
				for(var n = 0 ; n < note_count_of_measure ; n++){
					var note_id = note_offset + n;
					if(_song._guitar._chords[note_id] != null){
						prev_chord_info = GetChordInfo(_song._guitar._chords[note_id], CHORD_MODE.GUITAR);
					}
					if(prev_chord_info != null){
						strums[note_id] = spi._strums[n];
						accents[note_id] = spi._accents[n];
						frets[note_id] = GetFretString(prev_chord_info.fret, prev_chord_info.stringFrets);
					}
				}
			}
		}

		var ret = {
			'strums':strums,
			'accents':accents,
			'frets':frets
		};

		return ret;
	};

	this.KeyUp = function(){
		for(var i = 0 ; i < _song._instList.length ; i++){
			for(var n = 0 ; n < _song._instList[i]._notes.length ; n++){
				if(_song._instList[i]._notes[n] != null){
					for(var s = 0 ; s < _song._instList[i]._notes[n].length ; s++){
						_song._instList[i]._notes[n][s].s++;
					}
				}
			}
		}
	};

	this.KeyDown = function(){
		for(var i = 0 ; i < _song._instList.length ; i++){
			for(var n = 0 ; n < _song._instList[i]._notes.length ; n++){
				if(_song._instList[i]._notes[n] != null){
					for(var s = 0 ; s < _song._instList[i]._notes[n].length ; s++){
						_song._instList[i]._notes[n][s].s--;
					}
				}
			}
		}
	}

	this.ChangeQuarterDivide = function(qdTo){
		var orgQD = QUARTER_DIVIDE._44;
		if(_song._quarter == 3 && _song._divide == 4){
			orgQD = QUARTER_DIVIDE._34;
		}
		if(_song._quarter == 4 && _song._divide == 3){
			orgQD = QUARTER_DIVIDE._43;
		}
		if(_song._quarter == 4 && _song._divide == 4){
			orgQD = QUARTER_DIVIDE._44;
		}

		if(qdTo == QUARTER_DIVIDE._34){
			_song._quarter = 3;
			_song._divide = 4;
		}else if(qdTo == QUARTER_DIVIDE._43){
			_song._quarter = 4;
			_song._divide = 3;
		}else if(qdTo == QUARTER_DIVIDE._44){
			_song._quarter = 4;
			_song._divide = 4;
		}
		for(var b = 0 ; b < _song._barList.length ; b++){
			for(var q = 0 ; q < _song._barList[b]._qdList.length ; q++){
				if(_song._barList[b]._qdList[q] == orgQD){
					_song._barList[b]._qdList[q] = qdTo;
				}
			}
		}
	};
};
