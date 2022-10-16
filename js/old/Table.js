function Table() {
	var self = this;
	this._scaleCount = 36;
	this._currentMeaureID = 0;
	this._currentNoteID = -1;

	this._once_node_count = 1;

	this.Init2 = function () {
		var table = $('#table');
		var ele_table = $('<table style="width:100%" cellpadding="0px" cellspacing="0px"></table>');
		ele_table.attr('id', 'id_table_table');
		ele_table.on('mouseout', self.OnTableMouseOut);
		table.append(ele_table);

		var note_recog_seq = 0;
		var octave_idx = 3;
		for (var s = self._scaleCount; s >= 0; s--) {
			var ele_tr = $('<tr></tr>');
			ele_table.append(ele_tr);

			var color_class = '';
			{
				if (s % 12 == 0)
					color_class += ' c-line';
				var note_code = self.GetNoteCode(note_recog_seq);
				if (note_recog_seq == 0)
					note_recog_seq = 12;
				note_recog_seq--;
				if (note_code == 'Db' || note_code == 'Eb' || note_code == 'Gb' || note_code == 'Ab' || note_code == 'Bb')
					color_class += ' sharp-line';
			}

			//display octave
			if(_maestroMain._tableMode == TABLE_MODE.INSTRUMENT)
			{
				if (s == 36){
					var ele_td = $('<td></td>');
					ele_tr.append(ele_td);
					ele_td.addClass('disp_scale');
					ele_td.attr('id', 'id_table_octave-' + octave_idx);
					//console.log('id_table_octave-' + octave_idx);
					octave_idx--;
				} else if (s == 35 || s == 23 || s == 11){
					var ele_td = $('<td></td>');
					ele_tr.append(ele_td);
					ele_td.addClass('disp_scale');
					ele_td.attr('rowspan', 12);
					ele_td.attr('id', 'id_table_octave-' + octave_idx);
					//console.log('id_table_octave-' + octave_idx);
					octave_idx--;
				}
			}

			if(_maestroMain._tableMode == TABLE_MODE.INSTRUMENT) {
				//display scale
				var ele_td = $('<td></td>');
				ele_tr.append(ele_td);
				ele_td.addClass('disp_scale');
				ele_td.text(note_code);
				ele_td.attr('id', 'single_scale-' + s);
				ele_td.on('mousedown', self.OnSingleNoteClick);
			}else if(_maestroMain._tableMode == TABLE_MODE.DRUM){
				//drum
				var ele_td = $('<td></td>');
				ele_tr.append(ele_td);
				ele_td.addClass('disp_scale');
				ele_td.attr('id', 'single_scale-' + s);
				ele_td.on('mousedown', self.OnDrumChooseClick);
				if(_song._drumSet._keyList[s] != null){
					var name = DRUM_GetDrumName(_song._drumSet._keyList[s]);
					ele_td.text(name);
				}
			}

			//note
			var note_index = new Number(-1);
			for(var m = 0 ; m < _song._barList[_maestroMain._curBarID]._measureCount ; m++){
				var note_count = _songHandle.GetNoteCountFromQD(_song._barList[_maestroMain._curBarID]._qdList[m]);
				for(var n = 0 ; n < note_count ; n++){
					note_index++;

					var ele_td = $('<td></td>');
					ele_tr.append(ele_td);
					ele_td.addClass('note' + color_class);

					var nid = 'note_id-' + note_index + '-' + s;
					ele_td.attr('id', nid);
					ele_td.on('mousedown', self.OnNoteMouseDown);
					ele_td.on('mousemove', self.OnNoteMouseOver);

					if (((n + 1) % (note_count)) == 0) {
						ele_td.addClass('note_border_measure_split');
					} else if(((n + 1) % _song._divide) == 0) {
						ele_td.addClass('note_border_2_split');
					} else {
						ele_td.addClass('note_border_normal');
					}
				}
			}
		}

		//Chord
		{
			//console.log('draw chords');
			var ele_tr = $("<tr></tr>");
			ele_table.append(ele_tr);

			if (_maestroMain._tableMode == TABLE_MODE.INSTRUMENT){
				var ele_td_dummy = $('<td></td>');
				ele_tr.append(ele_td_dummy);
			}
			var ele_td_dummy = $('<td></td>');
			ele_tr.append(ele_td_dummy);

			var note_index = new Number(-1);
			var offset = _songHandle.GetNoteOffset(_maestroMain._curBarID);
			for (var m = 0; m < _song._barList[_maestroMain._curBarID]._measureCount; m++) {
				var note_count = _songHandle.GetNoteCountFromQD(_song._barList[_maestroMain._curBarID]._qdList[m]);
				for (var n = 0; n < note_count; n++) {
					note_index++;

					var new_offset = new Number(offset) + note_index;
					var ele_td = $("<td></td>");
					if (_song._guitar._chords[new_offset] != null)
						ele_td.text(_song._guitar._chords[new_offset]);
					ele_td.addClass('cell_chord');
					ele_td.addClass('cell_chord_not_selected');

					if (((n + 1) % (note_count)) == 0) {
						ele_td.addClass('note_border_measure_split');
					} else if(((n + 1) % 2) == 0) {
						ele_td.addClass('note_border_2_split');
					} else {
						ele_td.addClass('note_border_normal');
					}

					ele_tr.append(ele_td);
					ele_td.attr('id', 'id_table_text_chord-' + note_index);
					ele_td.on('mousedown', self.OpenChordPopup);
					ele_tr.append(ele_td);
				}
			}
		}

		//strum
		{
			//console.log('draw strum');
			var ele_tr = $("<tr></tr>");
			ele_table.append(ele_tr);

			if (_maestroMain._tableMode == TABLE_MODE.INSTRUMENT){
				var ele_td_dummy = $('<td></td>');
				ele_tr.append(ele_td_dummy);
			}
			var ele_td_dummy = $('<td></td>');
			ele_tr.append(ele_td_dummy);

			var note_offset = _songHandle.GetNoteOffset(_maestroMain._curBarID);
			var measure_offset = _songHandle.GetMeasureOffset(_maestroMain._curBarID);

			for(var i = 0 ; i < _song._barList[_maestroMain._curBarID]._measureCount ; i++){
				var note_count_per_measure = _songHandle.GetNoteCountFromQD(_song._barList[_maestroMain._curBarID]._qdList[i]);
				var measure_index = new Number(measure_offset) + new Number(i);
				//console.log('strum pattern ' + _song._guitar._patternPerMeasure[measure_index]);
				if(_song._guitar._patternPerMeasure[measure_index] == null || _song._guitar._patternPerMeasure[measure_index] == 'undefined') {
					//empty case
					var ele_td = $('<td></td>');
					ele_td.attr('colspan', note_count_per_measure);
					ele_td.attr('id', 'id_table_strum_measure-' + measure_index);
					//console.log('id : ' + 'id_table_strum_measure-' + measure_index);
					ele_td.on('mousedown', self.PopupStrumPatten);
					ele_td.addClass('cell_chord');
					ele_td.addClass('cell_chord_not_selected');
					ele_td.addClass('note_border_measure_split');
					ele_tr.append(ele_td);
				}else if(_song._guitar._patternPerMeasure[measure_index] == STRUM_PATTERN_SAME){
					//same case
					var ele_td = $('<td class="text-center">%</td>');
					ele_td.attr('colspan', note_count_per_measure);
					ele_td.attr('id', 'id_table_strum_measure-' + measure_index);
					console.log('id : ' + 'id_table_strum_measure-' + measure_index);
					ele_td.on('mousedown', self.PopupStrumPatten);
					ele_td.addClass('cell_chord');
					ele_td.addClass('cell_chord_not_selected');
					ele_td.addClass('note_border_measure_split');
					ele_tr.append(ele_td);
				}else if(_song._guitar._patternPerMeasure[measure_index] == STRUM_PATTERN_CUSTOM){
					//custom case
					var note_id_base = _songHandle.GetNoteOffsetOfMeasure(measure_index);
					var strum_pattern_info = STRUM_GetStrumPatternInfo(_song._guitar._patternPerMeasure[measure_index]);
					for(var s = 0 ; s < note_count_per_measure ; s++){
						var ele_td = $('<td></td>');
						if(_song._guitar._strums[note_id_base + s] == D){
							ele_td.text('D');
						}else if(_song._guitar._strums[note_id_base + s] == U){
							ele_td.text('U');
						}else if(_song._guitar._strums[note_id_base + s] == S){
							ele_td.text('S');
						}
						if(s == 0){
							ele_td.addClass('strum_cell_first');
						}else if(s == note_count_per_measure-1){
							ele_td.addClass('strum_cell_last');
						}else{
							ele_td.addClass('strum_cell');
						}
						ele_td.addClass('strum_cell_custom');
						//ele_td.text(strum_pattern_info._strums[s]);
						ele_td.attr('id', 'id_table_strum_cell-' + measure_index);
						ele_td.attr('note_id', note_id_base + s);
						ele_td.on('mousedown', self.PopupStrumPatten);
						ele_td.on('mousedown', self.PopupStrumType);
						ele_tr.append(ele_td);
					}
				}else{
					//pattern case
					var strum_pattern_info = STRUM_GetStrumPatternInfo(_song._guitar._patternPerMeasure[measure_index]);
					for(var s = 0 ; s < note_count_per_measure ; s++){
						var ele_td = $('<td></td>');
						if(s == 0){
							ele_td.addClass('strum_cell_first');
						}else if(s == note_count_per_measure-1){
							ele_td.addClass('strum_cell_last');
						}else{
							ele_td.addClass('strum_cell');
						}
						ele_td.addClass('strum_cell_pattern');

						if(strum_pattern_info._strums[s] == D){
							ele_td.text('D');
						}else if(strum_pattern_info._strums[s] == U){
							ele_td.text('U');
						}else if(strum_pattern_info._strums[s] == S) {
							ele_td.text('S');
						}

						if(strum_pattern_info._accents[s] == 1)
							ele_td.addClass('strum_accent');

						ele_td.attr('id', 'id_table_strum_cell-' + measure_index);
						ele_td.on('mousedown', self.PopupStrumPatten);
						ele_tr.append(ele_td);
					}
				}
			}
		}

		//tab
		{
			var offset = _songHandle.GetNoteOffset(_maestroMain._curBarID);

			for(var row_idx = 0 ; row_idx <= 5 ; row_idx++){
				var ele_tr = $('<tr>1</tr>');
				ele_table.append(ele_tr);

				if (_maestroMain._tableMode == TABLE_MODE.INSTRUMENT){
					var ele_td_dummy = $('<td></td>');
					ele_tr.append(ele_td_dummy);
				}
				var ele_td_dummy = $('<td></td>');
				ele_tr.append(ele_td_dummy);

				var measure_offset = _songHandle.GetMeasureOffset(_maestroMain._curBarID);
				var col_idx = 0;
				for(var m = 0 ; m < _song._barList[_maestroMain._curBarID]._measureCount ; m++) {
					var note_count_per_measure = _songHandle.GetNoteCountFromQD(_song._barList[_maestroMain._curBarID]._qdList[m]);
					var measure_index = new Number(measure_offset) + new Number(m);
					var tabs = null;
					//console.log('measure_index ' + measure_index);
					//console.log('_song._guitar._tabPattern4M[measure_index] ' + _song._guitar._tabPattern4M[measure_index]);
					if(_song._guitar._tabPattern4M[measure_index] != null){
						tabs = ARPEGGIO_GetTabs(measure_index);
					}
					for(var p = 0 ; p < note_count_per_measure ; p++) {
						var ele_td = $('<td></td>');
						ele_td.attr('id', 'id_table_tab-' + row_idx + '-' + col_idx);
						ele_td.attr('measure_id', measure_offset + m);
						ele_td.addClass('cell_chord');
						ele_td.addClass('text-center');
						ele_td.addClass('cell_chord_not_selected');
						ele_td.on('mousedown', self.OnClickTab);

						if (((p + 1) % (note_count_per_measure)) == 0) {
							ele_td.addClass('note_border_measure_split');
						} else if(((p + 1) % 2) == 0) {
							ele_td.addClass('note_border_2_split');
						} else {
							ele_td.addClass('note_border_normal');
						}

						if(tabs == null){
							var new_offset = new Number(offset) + new Number(col_idx);
							if(_song._guitar._tabs[new_offset] != null){
								var t = _song._guitar._tabs[new_offset][row_idx];
								if(t != null)
									ele_td.text(t);
							}
						}else{
							if(tabs[row_idx][p] != null){
								ele_td.text(tabs[row_idx][p]);
							}
							if(_song._guitar._tabPattern4M[measure_index] == ARPEGGIO_PATTERN_SAME){
								ele_td.addClass('tab_pattern_same');
							}else{
								ele_td.addClass('tab_pattern_occupied');
							}
						}

						ele_tr.append(ele_td);
						col_idx++;
					}
				}
			}
		}

		self.RedrawLyricsRow();
	};

	this.OnClickTab = function(e){
		if(e.which == 3) {
			var measure_id = $(this).attr('measure_id');
			//console.log('measure_id ' + measure_id);
			self.PopupArpeggioPattern(measure_id);
		}
	};

	this.OpenChordPopup = function () {
		$('#id_modal_popup').modal('show');
		_maestroMain.ChangeModalSize('sm');
		_maestroMain._selectedChordIndex = this.id.split('-')[1];
		_maestroMain.PopupChordList();
	};

	this.PopupArpeggioPattern = function(measure_id){
		$('#id_modal_popup').modal('show');
		_maestroMain.ChangeModalSize('lg');
		_maestroMain.PopupArpeggioPattern();
		_maestroMain._selectedStrumMeasureIndex = measure_id;
	};

	this.PopupStrumPatten = function(e){
		if(e.which == 3){
			$('#id_modal_popup').modal('show');
			_maestroMain.ChangeModalSize('lg');

			_maestroMain.PopupStrumPattern();
			_maestroMain._selectedStrumMeasureIndex = this.id.split('-')[1];
			console.log('self._selectedStrumMeasureIndex ' + self._selectedStrumMeasureIndex);
		}
	};

	this.PopupStrumType = function(e){
		if(e.which == 1){
			$('#id_modal_popup').modal('show');
			_maestroMain.ChangeModalSize('sm');

			var note_id = $(this).attr('note_id');
			_maestroMain._selectedStrumTypeNoteIndex = note_id;
			_maestroMain.PopupStrumType();
		}
	};

	this.RedrawLyricsRow = function () {
		var ele_table = $('#id_table_table');
		var ele_lyrics_tr = $('#id_table_lyrics_tr');
		ele_lyrics_tr.remove();
		var note_offset = _songHandle.GetNoteOffset(_maestroMain._curBarID);

		{
			var ele_tr = $('<tr></tr>');
			ele_tr.attr('id', 'id_table_lyrics_tr');
			ele_table.append(ele_tr);

			if (_maestroMain._tableMode == TABLE_MODE.INSTRUMENT) {
				var ele_td_dummy = $('<td></td>');
				ele_tr.append(ele_td_dummy);
			}
			var ele_td_dummy = $('<td></td>');
			ele_tr.append(ele_td_dummy);

			var note_count_of_bar = _songHandle.GetNoteCountOfBar(_maestroMain._curBarID);
			var note_idx = new Number(-1);
			var merged_last_idx = new Number(-1);
			for(var m = 0 ; m < _song._barList[_maestroMain._curBarID]._measureCount ; m++){
				var note_count_of_measure = _songHandle.GetNoteCountFromQD(_song._barList[_maestroMain._curBarID]._qdList[m]);
				for(var n = 0 ; n < note_count_of_measure ; n++){
					note_idx++;
					if(note_idx <= merged_last_idx)
						continue;

					var merged_count = 0;
					for(var n1 = note_idx+1 ; n1 < note_count_of_bar ; n1++){
						if (_song._lyrics[note_offset + n1] == MERGED) {
							merged_count++;
						} else {
							break;
						}
					}

					var ele_td = $("<td></td>");
					ele_td.attr('id', 'id_table_lyrics-' + note_idx);
					if (merged_count > 0) {
						ele_td.attr('colspan', merged_count + 1);
					}
					ele_td.addClass('cell_lyrics');

					if (((n + 1) % note_count_of_measure) == 0) {
						ele_td.addClass('note_border_measure_split');
					} else if(((n + 1) % _song._divide) == 0) {
						ele_td.addClass('note_border_2_split');
					} else {
						ele_td.addClass('note_border_normal');
					}

					ele_td.on('mousedown', self.EditLyrics);

					var span = $("<span style=\"writing-Mode: vertical-rl;\"></span>");
					span.attr('id', 'table_text_id-' + note_idx);
					span.text(_song._lyrics[note_offset + note_idx]);
					ele_td.append(span);
					ele_tr.append(ele_td);
					//n += merged_count;
					merged_last_idx = note_idx + merged_count;
				}
			}
		}
	};

	this.Reinit = function () {
		var table = $('#table');
		table.empty();
		//self.Init();
		self.Init2();
		self.RedrawTable();
	};

	this._lastFlowNoteID = 0;
	this.FlowControl = function (noteID) {
		var selector = "td[id^='note_id-" + self._lastFlowNoteID + "-']";
		var notes = $(selector);
		for (var i = 0; i < notes.length; i++) {
			$(notes[i]).removeClass('table_pass');
		}

		selector = "td[id^='note_id-" + noteID + "-']";
		notes = $(selector);
		for (var i = 0; i < notes.length; i++) {
			$(notes[i]).addClass('table_pass');
		}
		self._lastFlowNoteID = noteID;
	};

	this.SelectChord = function (chord) {
		var offset = _songHandle.GetNoteOffset(_maestroMain._curBarID);
		var new_offset = new Number(offset) + new Number(_maestroMain._selectedChordIndex);
		if (chord == 'None') {
			_song._guitar._chords[new_offset] = null;
			$('#id_table_text_chord-' + _maestroMain._selectedChordIndex).text('');
			$('#bar_chord_id-' + _maestroMain._curBarID + '-' + _maestroMain._selectedChordIndex).text('');
		} else {
			_song._guitar._chords[new_offset] = chord;
			$('#id_table_text_chord-' + _maestroMain._selectedChordIndex).text(chord);
			$('#bar_chord_id-' + _maestroMain._curBarID + '-' + _maestroMain._selectedChordIndex).text(chord);
		}
	};

	this.OnTableMouseOut = function () {
		self._currentNoteID = -1;
		self._currentMeaureID = -1;
	};

	this.OnDrumChooseClick = function(){
		_maestroMain._selectedDrumScale = this.id.split('-')[1];
		$('#id_modal_popup').modal('show');
		_maestroMain.ChangeModalSize('lg');
		_maestroMain.PopupDrumList();
	};

	this.OnSingleNoteClick = function (event) {
		console.log('OnSingleNoteClick');
		var octave = _song._instList[_maestroMain._curInstID]._octave;
		var id = this.id.split('-')[1];
		var scale = 12 * new Number(octave) + new Number(id);
		_player.PlayNote(scale);
	};

	this.EditLyrics = function () {
		var lyricsIdx = this.id.split('-')[1];
		_maestroMain._arrowX = new Number(lyricsIdx);
		_maestroMain._arrowY = 6;
		self.UpdateChordTable();
		self.EditLyricsWithID(lyricsIdx);
	};

	this.EditLyricsWithID = function (lyricsIdx) {
		console.log('lyrics id ' + lyricsIdx);
		var offset = _songHandle.GetNoteOffset(_maestroMain._curBarID);
		var new_offset = new Number(offset) + new Number(lyricsIdx);
		console.log('ofset ' + offset);

		var text = _song._lyrics[new_offset];
		if (text == null)
			text = '';

		text = prompt('', text);
		_song._lyrics[new_offset] = text;
		console.log('edit lyrics : ' + _song._lyrics[new_offset]);
		$('#table_text_id-' + lyricsIdx).text(text);
		$('#bar_text_id-' + _maestroMain._curBarID + '-' + lyricsIdx).text(text);
	};

	this.OnNoteMouseDown = function (e) {
		if(e.which == 3){
			self.OnNoteRightClick(this.id);
			return;
		}

		var note_element_info = self.ParseNoteElementInfo(this.id);

		if(_maestroMain._tableMode == TABLE_MODE.INSTRUMENT){
			var s = note_element_info.scale;
			var octave = _song._instList[_maestroMain._curInstID]._octave;
			var scale = 12 * new Number(octave) + new Number(s);
			_player.PlayNote(scale);
		}else if(_maestroMain._tableMode == TABLE_MODE.DRUM){
			_player.HitDrum(note_element_info.scale);
		}

		if (self._virtualTable[note_element_info.note] != null) {
			if (self._virtualTable[note_element_info.note][note_element_info.scale] != null) {
				console.log('occupy ' + self._virtualTable[note_element_info.note][note_element_info.scale]);
				var count = self._virtualTable[note_element_info.note][note_element_info.scale];
				var note_id_to_delete = note_element_info.note - count;
				var scale_to_delete = note_element_info.scale;
				if(_maestroMain._tableMode == TABLE_MODE.INSTRUMENT){
					_songHandle.DeleteNoteScale(_maestroMain._curInstID, _maestroMain._curBarID, note_id_to_delete, scale_to_delete);
				}else if(_maestroMain._tableMode == TABLE_MODE.DRUM) {
					_songHandle.DeleteDrumNote(note_id_to_delete, scale_to_delete);
				}
				self.RedrawTable();
				console.log('return');
				return;
			}
		}

		if (self._once_node_count == 1) {
			if(_maestroMain._tableMode == TABLE_MODE.INSTRUMENT)
				_songHandle.AssignNote(_maestroMain._curInstID, _maestroMain._curBarID, note_element_info.note, note_element_info.scale, self._once_node_count);
			else if(_maestroMain._tableMode == TABLE_MODE.DRUM)
				_songHandle.AssignDrumNote(_maestroMain._curBarID, note_element_info.note, note_element_info.scale, self._once_node_count);
		} else {
			var count = 0;
			for (var i = 0; i < self._once_node_count; i++) {
				var new_note_id = new Number(note_element_info.note + i);
				if (self._virtualTable[new_note_id] != null) {
					if (self._virtualTable[new_note_id][note_element_info.scale] != null) {
						console.log('i ' + i + ' n ' + new_note_id + 's ' + note_element_info.scale);
						break;
					}
				}
			}
			count += i;
			if(_maestroMain._tableMode == TABLE_MODE.INSTRUMENT){
				_songHandle.AssignNote(_maestroMain._curInstID, _maestroMain._curBarID, note_element_info.note, note_element_info.scale, count);
			}else if(_maestroMain._tableMode == TABLE_MODE.DRUM){
				_songHandle.AssignDrumNote(_maestroMain._curBarID, note_element_info.note, note_element_info.scale, count);
			}
		}

		self.RedrawTable();
	};

	this.OnNoteMouseOver = function () {
		var nid = this.id.split('-')[1];
		self._currentNoteID = nid;

		var measure = _songHandle.GetMeasureIDOfNote(nid);
		self._currentMeaureID = measure;
	};

	this.OnNoteRightClick = function(id){
		if(_maestroMain._tableMode == TABLE_MODE.DRUM){
			return;
		}

		var nei = self.ParseNoteElementInfo(id);
		console.log('note ' + nei.note + ' scale ' + nei.scale);

		var isOccupied = false;
		var isSelected = false;

		var offset = _songHandle.GetNoteOffset(_maestroMain._curBarID);
		var new_note = new Number(nei.note) + new Number(offset);
		console.log('new_note ' + new_note + ' offset ' + offset);

		//note가 채워진건지 확인.
		for(var n = new_note ; n >= offset ; n--){
			if(_song._instList[_maestroMain._curInstID]._notes[n] == null){
				continue;
			}

			for(var s = 0 ; s < _song._instList[_maestroMain._curInstID]._notes[n].length ; s++){
				if(_song._instList[_maestroMain._curInstID]._notes[n][s]._slides == null
					|| _song._instList[_maestroMain._curInstID]._notes[n][s]._slides == 'undefined'){

					console.log('null');
					if(_song._instList[_maestroMain._curInstID]._notes[n][s].s == nei.scale){
						var count = _song._instList[_maestroMain._curInstID]._notes[n][s].c;
						for(var c = count ; c >= 0; c--){
							if(nei.note == (n-offset)+c*1.0){
								isOccupied = true;
								isSelected = _songHandle.SlidesIsSelected(n, nei.scale, c);
								console.log('isSelected ' + isSelected);
								if(isSelected){
									_songHandle.SlidesRemove(n, nei.scale, c);
								}else{
									_songHandle.SlidesAppend(n, nei.scale, c, nei.scale);
								}
								break;
							}
						}
					}
				}else{
					console.log('no null');
					//slide가 있는 경우
					var c = nei.note - new Number(n) - offset;
					console.log('c ' + c);
					if(_song._instList[_maestroMain._curInstID]._notes[n][s]._slides[c] == nei.scale){
						isOccupied = true;
						isSelected = _songHandle.SlidesIsSelected(n, _song._instList[_maestroMain._curInstID]._notes[n][s].s, c);
						if(isSelected){
							_songHandle.SlidesRemove(n, _song._instList[_maestroMain._curInstID]._notes[n][s].s, c);
						}else{
							_songHandle.SlidesAppend(n, _song._instList[_maestroMain._curInstID]._notes[n][s].s, c, nei.scale);
						}
					}
				}
				if(isOccupied){
					break;
				}
			}

			if(isOccupied){
				break;
			}
		}

		if(isOccupied){
			//console.log('occupied');
			self.Reinit();
			self.SlideDraw();
		}
	};

	this.ParseNoteElementInfo = function (note_element_id) {
		var arr = note_element_id.split('-');
		//var sc = self.GetScaleFromIndex(parseInt(arr[3]));
		return {
			'note': parseInt(arr[1]),
			'scale': parseInt(arr[2])
		};
	};

	this.ClearColumnStyle = function (note_ID) {
		for (var s = 0; s <= self._scaleCount; s++) {
			var id_str = 'note_id-' + note_ID + '-' + s;
			self.ClearNoteStyle(id_str);
		}
	};

	this.ClearNoteStyle = function (note_element_id) {
		$('#' + note_element_id).removeClass('note_assigned');
		$('#' + note_element_id).removeClass('note_assigned_first');
		$('#' + note_element_id).removeClass('note_assigned_last');
		$('#' + note_element_id).empty();
	};

//todo 화면 넘어 안보이는 곳 까지 다 채우고 관리해야 함.
	this._virtualTable = [[]];
	this.RedrawTable = function () {
		for (var note_seq = 0; note_seq < _songHandle.GetNoteCountOfBar(_maestroMain._curBarID); note_seq++) {
			self.ClearColumnStyle(note_seq);
		}

		if(_maestroMain._curInstID > 0 || _maestroMain._tableMode == TABLE_MODE.DRUM){
			self.RedrawMainTableBackground();
		}

		//octave
		if(_maestroMain._tableMode == TABLE_MODE.INSTRUMENT)	{
			//console.log('cur oct ' + _song._instList[_maestroMain._curInstID]._octave);

			var octave_disp = new Number(_song._instList[_maestroMain._curInstID]._octave) - 1;
			$('#id_table_octave-3').text(octave_disp + 3);
			$('#id_table_octave-2').text(octave_disp + 2);
			$('#id_table_octave-1').text(octave_disp + 1);
			$('#id_table_octave-0').text(octave_disp);
		}

		self._virtualTable = [[]];
		var table_note_id = 0;

		var offset = _songHandle.GetNoteOffset(_maestroMain._curBarID);
		for (var note_seq = 0; note_seq < _songHandle.GetNoteCountOfBar(_maestroMain._curBarID); note_seq++) {
			var new_offset = new Number(offset) + new Number(note_seq);

			if(_maestroMain._tableMode == TABLE_MODE.INSTRUMENT){
				if (_song._instList[_maestroMain._curInstID]._notes[new_offset] != null) {
					for (var scale_seq = 0; scale_seq < _song._instList[_maestroMain._curInstID]._notes[new_offset].length; scale_seq++) {
						var note = _song._instList[_maestroMain._curInstID]._notes[new_offset][scale_seq];

						if(note._slides){
							for(var s = 0 ; s < note._slides.length ; s++){
								var new_note_id = new Number(table_note_id + s);
								var note_element_id = 'note_id-' + new_note_id + '-' + note._slides[s];

								if (self._virtualTable[new_note_id] == null) {
									self._virtualTable[new_note_id] = [];
								}
								self._virtualTable[new_note_id][s] = s;

								if(note._slides[s] == note.s)
									$('#' + note_element_id).addClass('note_assigned');
								else
									$('#' + note_element_id).addClass('note_assigned_continue');

								if (note._slides.length > 1) {
									if (s == 0) {
										$('#' + note_element_id).addClass('note_assigned_first');
									} else if (s >= 1 && s < note._slides.length - 1) {
										$('#' + note_element_id).addClass('note_assigned_first');
										$('#' + note_element_id).addClass('note_assigned_last');
									} else if (s == note._slides.length - 1) {
										$('#' + note_element_id).addClass('note_assigned_last');
									}
								}
							}
						}else{
							for (var c = 0; c < note.c; c++) {
								var new_note_id = new Number(table_note_id + c);
								var note_element_id = 'note_id-' + new_note_id + '-' + note.s;

								if (self._virtualTable[new_note_id] == null) {
									self._virtualTable[new_note_id] = [];
								}
								self._virtualTable[new_note_id][note.s] = c;

								$('#' + note_element_id).addClass('note_assigned');
								if (note.c > 1) {
									if (c == 0) {
										$('#' + note_element_id).addClass('note_assigned_first');
									} else if (c >= 1 && c < note.c - 1) {
										$('#' + note_element_id).addClass('note_assigned_first');
										$('#' + note_element_id).addClass('note_assigned_last');
									} else if (c == note.c - 1) {
										$('#' + note_element_id).addClass('note_assigned_last');
									}
								}
							}
						}
					}
				}
			}else{
				if(_song._drumSet._hits[new_offset] != null){
					for(var i=0 ; i<_song._drumSet._hits[new_offset].length ; i++){
						var note = _song._drumSet._hits[new_offset][i];
						for(var c = 0 ; c < note.c ; c++){
							var new_note_id = new Number(table_note_id + c);
							var note_element_id = 'note_id-' + new_note_id + '-' + note.s;

							if (self._virtualTable[new_note_id] == null) {
								self._virtualTable[new_note_id] = [];
							}
							self._virtualTable[new_note_id][note.s] = c;

							$('#' + note_element_id).addClass('note_assigned');
							if (note.c > 1) {
								if (c == 0) {
									$('#' + note_element_id).addClass('note_assigned_first');
								} else if (c >= 1 && c < note.c - 1) {
									$('#' + note_element_id).addClass('note_assigned_first');
									$('#' + note_element_id).addClass('note_assigned_last');
								} else if (c == note.c - 1) {
									$('#' + note_element_id).addClass('note_assigned_last');
								}
							}
						}
					}
				}
			}

			table_note_id++;
		}

		self.UpdateChordTable();
	};

	this.SlideDraw = function(){
		var note_offset = _songHandle.GetNoteOffset(_maestroMain._curBarID);
		//var note_count = _songHandle.GetNoteCountOfBar(_maestroMain._curBarID);

		for(var n = 0 ; n < _songHandle._slidesNoteList.length ; n++){
			var x = _songHandle._slidesNoteList[n]._note - note_offset;
			var y = _songHandle._slidesNoteList[n]._scale;
			for(var s = 0 ; s < _songHandle._slidesNoteList[n]._slides.length ; s++){
				if(_songHandle._slidesNoteList[n]._slides[s] != null){
					console.log('x ' + x + ' s ' + s);
					var nid = 'note_id-' + (x+s) + '-' + _songHandle._slidesNoteList[n]._slides[s];
					console.log('nid ' + nid);
					$('#'+nid).addClass('slide');
				}
			}
		}
	};

	this.UpdateChordTable = function(){
		var max_x = new Number(_songHandle.GetNoteCountOfBar(_maestroMain._curBarID))-1;

		for(var k=0 ; k<=5 ; k++){
			for(var i=0 ; i<=max_x ; i++) {
				$('#id_table_tab-'+k+'-'+i).removeClass('cell_chord_selected');
				$('#id_table_tab-'+k+'-'+i).addClass('cell_chord_not_selected');
			}
		}

		for(var i=0 ; i<=max_x ; i++){
			$('#id_table_lyrics-'+i).removeClass('cell_lyrics_selected');
		}

		if(_maestroMain._arrowY == 6){
			$('#id_table_lyrics-'+_maestroMain._arrowX).addClass('cell_lyrics_selected');
		}

		if(0 <= _maestroMain._arrowY && _maestroMain._arrowY <= 5) {
			$('#id_table_tab-' + _maestroMain._arrowY + '-' + _maestroMain._arrowX).addClass('cell_chord_selected');
		}
	};

	this.RedrawMainTableBackground = function () {
		var firstInstID = 0;
		var table_note_id = 0;

		var offset = _songHandle.GetNoteOffset(_maestroMain._curBarID);
		for (var note_seq = 0; note_seq < _songHandle.GetNoteCountOfBar(_maestroMain._curBarID); note_seq++) {
			var new_offset = new Number(offset) + new Number(note_seq);
			if (_song._instList[firstInstID]._notes[new_offset] != null) {
				for (var scale_seq = 0; scale_seq < _song._instList[firstInstID]._notes[new_offset].length; scale_seq++) {
					var scale = _song._instList[firstInstID]._notes[new_offset][scale_seq].s;
					var count = _song._instList[firstInstID]._notes[new_offset][scale_seq].c;
					var slides = _song._instList[firstInstID]._notes[new_offset][scale_seq]._slides;

					if(slides != null){
						for(var c = 0 ; c < slides.length ; c++){
							var new_note_id = new Number(table_note_id + c);
							var note_element_id = 'note_id-' + new_note_id + '-' + slides[c];

							var isSingle = true;
							var isFirst = false;
							var isFirstLast = false;
							var isLast = false;

							if (slides.length > 1) {
								isSingle = false;
								if (c == 0) {
									isFirst = true;
								} else if (c >= 1 && c < count - 1) {
									isFirstLast = true;
								} else if (c == count - 1) {
									isLast = true;
								}
							}

							var img = $('<img style="width:100%;height:auto">');
							if (isSingle) {
								img.attr('src', './img/single.png');
							} else {
								if (isFirst) {
									img.attr('src', './img/first.png');
								} else if (isFirstLast) {
									img.attr('src', './img/first_last.png');
								} else if (isLast) {
									img.attr('src', './img/last.png');
								}
							}
							$('#' + note_element_id).append(img);
						}
					}else{
						for (var c = 0; c < count; c++) {
							var new_note_id = new Number(table_note_id + c);
							var note_element_id = 'note_id-' + new_note_id + '-' + scale;

							var isSingle = true;
							var isFirst = false;
							var isFirstLast = false;
							var isLast = false;

							if (count > 1) {
								isSingle = false;
								if (c == 0) {
									isFirst = true;
								} else if (c >= 1 && c < count - 1) {
									isFirstLast = true;
								} else if (c == count - 1) {
									isLast = true;
								}
							}

							var img = $('<img style="width:100%;height:auto">');
							if (isSingle) {
								img.attr('src', './img/single.png');
							} else {
								if (isFirst) {
									img.attr('src', './img/first.png');
								} else if (isFirstLast) {
									img.attr('src', './img/first_last.png');
								} else if (isLast) {
									img.attr('src', './img/last.png');
								}
							}
							$('#' + note_element_id).append(img);
						}
					}
				}
			}
			table_note_id++;
		}
	};

	this.GetNoteCode = function(sidx) {
		var s = sidx % 12;
		var sc = 'C';

		switch (s) {
			case 0:
				sc = 'C';
				break;
			case 1:
				sc = 'Db';
				break;
			case 2:
				sc = 'D';
				break;
			case 3:
				sc = 'Eb';
				break;
			case 4:
				sc = 'E';
				break;
			case 5:
				sc = 'F';
				break;
			case 6:
				sc = 'Gb';
				break;
			case 7:
				sc = 'G';
				break;
			case 8:
				sc = 'Ab';
				break;
			case 9:
				sc = 'A';
				break;
			case 10:
				sc = 'Bb';
				break;
			case 11:
				sc  ='B';
				break;
		}
		return sc;
	};
}