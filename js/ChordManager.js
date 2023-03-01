function ChordManager(){
	var self = this;
	this._instrument = 'guitar';
	this._string_count = 6;
	this._chordDB = null;

	this.Init = function(){
		var instrument = window.localStorage.getItem('INSTRUMENT');
		if(instrument != null){
			self._instrument = instrument;
		}

		console.debug('self._instrument ' + self._instrument);

		if(self._instrument == 'guitar'){
			self._string_count = 6;
		}else if(self._instrument == 'ukulele'){
			self._string_count = 4;
		}

		self._chordDB = new ChordDB(self._instrument);
		return this;
	};

	this.HasChord = function(chord){
		return self._chordDB.HasChord(chord);
	};

	this.Transpose = function(in_chord, up_down){
		return self._chordDB.Transpose(in_chord, up_down);
	};

	this.GetChordDisplayWithChordInfo = function(chord_info, sm){
		return self.GetChordDisplayHTML(chord_info, sm);
	};

	this.GetChordDisplay = function(chord_text, sm) {
		if (chord_text == 'undefined' || chord_text == null || chord_text == '')
			return;

		var chordInfo = self._chordDB.GetChordInfo(chord_text);
		return self.GetChordDisplayHTML(chordInfo, sm);
	};

	//FIXME ukulele
	this.GetChordDisplayHTML = function(chordInfo, sm){
		var ele_span = $('<div></div>');
		if(sm)
			ele_span.addClass('cm_chord_table_sm');
		else
			ele_span.addClass('cm_chord_table');

		var ele_table = $('<table cellspacing="0px" cellpadding="0px"></table>');
		ele_span.append(ele_table);

		var max_str_idx = self._string_count - 1;
		for(var string_idx = max_str_idx ; string_idx >= 0 ; string_idx--){
			var ele_tr = $('<tr></tr>');
			ele_table.append(ele_tr);

			for(var fret_idx = 0 ; fret_idx < 5 ; fret_idx++){
				var ele_td = $('<td></td>');
				ele_td.addClass('cm_chord_td');

				//open or close
				if(fret_idx == 0){

					if(chordInfo.fret == '') {
						if(string_idx == 0){
							ele_td.addClass('cm_fret_neck_bottom');
						}else if(string_idx == max_str_idx){
							ele_td.addClass('cm_fret_neck_top');
						}else{
							ele_td.addClass('cm_fret_neck');
						}
					}else{
						if(string_idx == 0){
							ele_td.addClass('cm_fret_middle_bottom');
						}else if(string_idx == max_str_idx){
							ele_td.addClass('cm_fret_middle_top');
						}else{
							ele_td.addClass('cm_fret_middle');
						}
					}

					if(chordInfo.stringFrets[string_idx] == -1){
						ele_td.text('X');
					}else if(chordInfo.stringFrets[string_idx] == 0){
						ele_td.text('O');
					}
				}else{
					if(string_idx == 0){
						ele_td.addClass('cm_fret_bottom');
					}else if(string_idx == max_str_idx){
						ele_td.addClass('cm_fret_top');
					}else{
						ele_td.addClass('cm_fret');
					}

					if(chordInfo.stringFrets[string_idx] == fret_idx){
						var fn = chordInfo.fingers[string_idx];
						if(fn != 0){
							var ele = $('<img width="10px" height="10px" src="img/f'+fn+'.png">');
							ele_td.append(ele);
						}
					}
				}

				ele_tr.append(ele_td);
			}
		}

		if(chordInfo.fret != ''){
			var ele_tr_fret = $('<tr></tr>');
			ele_table.append(ele_tr_fret);
			var ele_td_fret1 = $('<td></td>');
			ele_tr_fret.append(ele_td_fret1);
			var ele_td_fret2 = $('<td colspan="4" style="font-size:1em; padding-top:10px"></td>');
			ele_tr_fret.append(ele_td_fret2);
			ele_td_fret2.text('Fret ' + chordInfo.fret);
		}

		return ele_span;
	};

	this.ConvertHarmony2Chord = function (root_step, root_alter, kind, degree_value, degree_type, bass_step, bass_alter){
		var debug = false;
		if(debug){
			console.log('root_step[' + root_step + ']root_alter[' + root_alter + ']kind['+ kind +
			']degree_value[' + degree_value + ']degree_type[' + degree_type + ']bass_step[' + bass_step + ']bass_alter[' + bass_alter + ']');
		}
		var chord = root_step;
		if(root_alter == 1){
			chord += '#';
		}else if(root_alter == -1){
			chord += 'b';
		}

		switch(kind){
			case 'major':
				break;
			case 'minor':
				chord += 'm';
				break;
			case 'dominant':
				chord += '7';
				break;
			case 'minor-seventh':
				chord += 'm7';
				break;
			case 'major-seventh':
				chord += 'M7';
				break;
			case 'major-ninth':
				chord += '9';
				break;
			case 'major-11th':
				chord += '11';
				break;
			case 'diminished':
				chord += 'dim';
				break;
			case 'suspended-fourth':
				chord += 'sus4';
				break;
		}

		chord += degree_type + degree_value;

		if(bass_step != ''){
			chord += '/' + bass_step;
			if(bass_alter == 1){
				chord += '#';
			}else if(bass_alter == -1){
				chord += 'b';
			}
		}

		if(debug)
			console.log('chord ' + chord);
		return chord;
	};

	this.GetFretString = function(fret, stringFrets){
		if(fret == ''){
			return stringFrets;
		}else{
			var f = new Number(fret) - 1;
			var ret = [];
			for(var s = 0 ; s < stringFrets.length ; s++){
				ret[s] = new Number(stringFrets[s]) + f;
			}
			return ret;
		}
	};

	//FIXME ukulele
	this.GetPitches = function(frets, capo){
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
};