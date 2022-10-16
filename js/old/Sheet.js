function Sheet(sheetType){
	var self = this;
	this._initialized = false;
	this._sheetType = sheetType;
	this._isMobileMode = true;

	this.Init = function(){
		if(self._initialized)
			return;
		self._initialized = true;
		if($(window).width() >= 768){
			self._isMobileMode = false;
		}

		if(self._isMobileMode){
		}else{
			var ele_sheet = $('#sheet');
			var ele_div_container = $('<div class="container-fluid" id="id_sheet_container"></div>');
			ele_sheet.append(ele_div_container);
		}
	};

	this.Clear = function(){
		$('#sheet').empty();
		self._initialized = false;
	};

	this.AddBar = function(barID){
		self.Init();
		if(self._sheetType == SheetType.Maestro) {
			self.AddBarComposeMode(barID);
		}else{
			self.AddBarPlayerMode(barID);
		}
	};

	this.AddBarPlayerMode = function(barID){
		var ele_sheet = $('#sheet');
		var ele_row = null;

		if(self._isMobileMode == false){
			ele_row = $('<div class="row no-gutters"></div>');
			$('#id_sheet_container').append(ele_row);
		}

		var measure_offset_of_bar = _songHandle.GetMeasureOffset(barID);

		for(var m = 0 ; m < _song._barList[barID]._measureCount ; m++){
			var measure_id = _songHandle.GetMeasureOffset(barID) + m;
			var note_offset_of_measure = _songHandle.GetNoteOffsetOfMeasure(measure_id);
			var note_count_per_measure = _songHandle.GetNoteCountOfMeasure(measure_offset_of_bar + m);
			var ele_div = null;
			var ele_table = null;

			if(self._isMobileMode){
				ele_div = $('<span class="col-6 col-sm-4 col-md-2 col-lg-2 outter_ele"></span>');
				ele_sheet.append(ele_div);

				ele_table = $('<table cellpadding="0" cellspacing="0"></table>');
				ele_table.addClass("sheet_table");
				ele_div.append(ele_table);
			}else{
				ele_div = $('<div class="col outter_ele"></div>');
				ele_row.append(ele_div);

				ele_table = $('<table cellpadding="0" cellspacing="0"></table>');
				ele_table.addClass("sheet_table");
				ele_div.append(ele_table);
			}

			//chord
			var ele_tr_chord = $('<tr style="vertical-align: bottom"></tr>');
			ele_table.append(ele_tr_chord);
			for(var n = 0 ; n < note_count_per_measure ; n++){
				var merged_cnt = 0;
				for(var n1 = n+1 ; n1 < note_count_per_measure ; n1++){
					if(_song._guitar._chords[(note_offset_of_measure) + n1] != null){
						break;
					}
					merged_cnt++;
				}
				var note_id = (note_offset_of_measure) + n;
				var td = $('<td></td>');
				td.attr('id', 'id_sheet_chord-'+note_id);
				td.on('mousedown', _playerMain.OnChordClick);
				if(merged_cnt > 0){
					td.attr('colspan', merged_cnt+1);
				}
				ele_tr_chord.append(td);

				if(_playerMain.ShowChord(note_id)){
					var ele_chord = _chordManager.GetChordDisplay(_song._guitar._chords[note_id], true);
					td.addClass('css_adjust_chord_height');
					td.append(ele_chord);
				}

				if(_song._guitar._chords[note_id] != null){
					var ele_span = $('<div>' + _song._guitar._chords[note_id] + '</div>');
					td.append(ele_span);
				}else{
					td.text('\xa0');
				}
				if(((n+1)%(note_count_per_measure)) == 0){
					td.addClass("player_tab_measure");
				}

				n = n + merged_cnt;
			}

			//lyrics
			var ele_tr_lyrics = $('<tr></tr>');
			{
				ele_table.append(ele_tr_lyrics);

				for(var n = 0 ; n < note_count_per_measure ; n++){
					var note_id = new Number(note_offset_of_measure) + new Number(n);
					var merged_count = 0;
					for(var m1 = n+1 ; m1 < note_count_per_measure ; m1++){
						var new_lid = new Number(note_offset_of_measure) + new Number(m1);
						if(_song._lyrics[new_lid] == MERGED){
							merged_count++;
						}else{
							break;
						}
					}

					var td = $("<td></td>");
					td.attr('id', 'id_sheet_lyrics-' + note_id);
					td.on('mousedown', self.OnLyricsClick);
					td.addClass('lyrics_td');
					if(self._isMobileMode){
						td.addClass('lyrics_td_font');
					}

					if(merged_count > 0){
						td.attr('colspan', merged_count+1);
					}

					if(n == 0){
						td.addClass("player_tab_measure");
					}

					ele_tr_lyrics.append(td);
					if(_song._lyrics[note_id] != null){
						td.text(_song._lyrics[note_id]);
					}else{
						td.text('\xa0');
					}
					n += merged_count;
				}
			}

			//flow
			var ele_tr_flow = $('<tr></tr>');
			{
				ele_table.append(ele_tr_flow);
				for (var n = 0; n < note_count_per_measure; n++) {
					var note_id = new Number(note_offset_of_measure) + new Number(n);
					var td = $("<td></td>");
					td.addClass('flow_control_td');
					var id = 'id_sheet_flow-' + note_id;
					td.attr('id', id);
					ele_tr_flow.append(td);
				}
			}

			//bottom
			var ele_tr_bottom = $('<tr></tr>');
			{
				ele_tr_bottom.addClass('css_tr_bottom');
				ele_table.append(ele_tr_bottom);
				for (var n = 0; n < note_count_per_measure; n++) {
					var note_id = new Number(note_offset_of_measure) + new Number(n);
					var td = $("<td></td>");
					td.on('mousedown', self.OnLyricsClick);
					td.addClass('css_sheet_bottom');
					var id = 'id_sheet_bottom-' + note_id;
					td.attr('id', id);

					if(self._sheetType == SheetType.Player) {
						if (_playerMain._playFromNoteID == note_id) {
							var icon_right = $('<i class="fas fa-angle-right small"></i>');
							td.append(icon_right);
						}
					}

					ele_tr_bottom.append(td);
				}
			}
		}
	};

	this.ClearFlowControl = function(){
		for(var b = 0 ; b < _song._barList.length ; b++) {
			var measure_offset_of_bar = _songHandle.GetMeasureOffset(b);
			for(var m = 0 ; m < _song._barList[b]._measureCount ; m++){
				var measure_id = new Number(measure_offset_of_bar) + new Number(m);
				var note_count_per_measure = _songHandle.GetNoteCountOfMeasure(measure_id);
				var note_offset_of_measure = _songHandle.GetNoteOffsetOfMeasure(measure_id);
				for (var n = 0; n < note_count_per_measure; n++) {
					var note_id = new Number(note_offset_of_measure) + new Number(n);
					$('#id_sheet_lyrics-'+note_id).removeClass('css_sheet_lyrics_pass');
					$('#id_sheet_flow-'+note_id).removeClass('sheet_pass');
				}
			}
		}
	};

	this.ShowChord = function(){
		for(var b = 0 ; b < _song._barList.length ; b++) {
			var measure_offset_of_bar = _songHandle.GetMeasureOffset(b);
			for(var m = 0 ; m < _song._barList[b]._measureCount ; m++){
				var measure_id = new Number(measure_offset_of_bar) + new Number(m);
				var note_count_per_measure = _songHandle.GetNoteCountOfMeasure(measure_id);
				var note_offset_of_measure = _songHandle.GetNoteOffsetOfMeasure(measure_id);
				for (var n = 0; n < note_count_per_measure; n++) {
					var note_id = new Number(note_offset_of_measure) + new Number(n);
					var ele_td = $('#id_sheet_chord-'+note_id);
					ele_td.empty();
					if(_playerMain.ShowChord(note_id)){
						var ele_chord = _chordManager.GetChordDisplay(_song._guitar._chords[note_id], true);
						td.addClass('css_adjust_chord_height');
						td.append(ele_chord);
					}

					if(_song._guitar._chords[note_id] != null){
						var ele_span = $('<div>' + _song._guitar._chords[note_id] + '</div>');
						td.append(ele_span);
					}else{
						td.text('\xa0');
					}
				}
			}
		}
	};

	this.AddBarComposeMode = function(barID){
		var ele_sheet = $('#sheet');

		var note_offset_of_bar = _songHandle.GetNoteOffset(barID);
		var ele_sheet_table = $("<table></table>");
		ele_sheet_table.addClass("sheet_table");
		ele_sheet_table.attr('id', 'id_sheet_table-'+barID);

		if(_song._barList[barID]._color != ''){
			ele_sheet_table.css('background-color', '#'+_song._barList[barID]._color);
		}
		ele_sheet_table.on('mousedown', self.OnSelectBar);
		ele_sheet.append(ele_sheet_table);

		var ele_chord_tr = $("<tr class='chord_row'></tr>");
		ele_sheet_table.append(ele_chord_tr);

		var ele_lyrics_tr = $("<tr class='lyrics_row'></tr>");
		ele_sheet_table.append(ele_lyrics_tr);

		var ele_flow_tr = $("<tr class='flow_control_row'></tr>");
		ele_sheet_table.append(ele_flow_tr);

		// chord
		var note_seq_of_bar = new Number(-1);
		for(var m = 0 ; m < _song._barList[barID]._measureCount ; m++){
			var note_count_of_measure = _songHandle.GetNoteCountFromQD(_song._barList[barID]._qdList[m]);
			for(var n = 0 ; n < note_count_of_measure ; n++){
				note_seq_of_bar++;
				var td = $("<td></td>");
				var id = 'bar_chord_id-' + barID + '-' + note_seq_of_bar;
				td.attr('id', id);
				ele_chord_tr.append(td);
				if(_song._guitar._chords[note_offset_of_bar + note_seq_of_bar] != null){
					td.text(_song._guitar._chords[note_offset_of_bar + note_seq_of_bar]);
				}
				if(((n+1)%(note_count_of_measure)) == 0){
					td.addClass("player_tab_measure");
				}
				if(n == 0){
					td.addClass("measure");
				}
			}
		}

		//lyrics
		var merged_last_idx = new Number(-1);
		var note_count_of_bar = _songHandle.GetNoteCountOfBar(barID);
		var note_index_of_bar = new Number(-1);

		var note_offset_of_bar = _songHandle.GetNoteOffset(barID);
		var measure_offset_of_bar = _songHandle.GetMeasureOffset(barID);

		for(var m = 0 ; m < _song._barList[barID]._measureCount ; m++) {
			var note_count_of_measure = _songHandle.GetNoteCountFromQD(_song._barList[barID]._qdList[m]);
			var new_measure_id = new Number(measure_offset_of_bar) + new Number(m);
			var note_offset_of_measure = _songHandle.GetNoteOffsetOfMeasure(new_measure_id);

			for (var n = 0; n < note_count_of_measure; n++) {
				note_index_of_bar++;
				var new_note_id = new Number(note_offset_of_measure) + new Number(n);
				//console.log('new_note_id ' + new_note_id);
				if(new_note_id <= merged_last_idx)
					continue;

				var merged_count = 0;
				for(var n1 = n+1 ; n1 < note_count_of_bar ; n1++){
					var new_new_note_id = new Number(note_offset_of_measure) + new Number(n1);
					if (_song._lyrics[new_new_note_id] == MERGED) {
						merged_count++;
					} else {
						break;
					}
				}

				var td = $("<td>1</td>");
				td.attr('id', 'bar_text_id-' + barID + '-' + note_index_of_bar);
				td.addClass('lyrics_td');
				if(merged_count > 0){
					td.attr('colspan', merged_count+1);
				}

				if(n == 0){
					td.addClass("measure");
				}

				ele_lyrics_tr.append(td);

				if(_song._lyrics[new_note_id] != null){
					td.text(_song._lyrics[new_note_id]);
				}else{
					td.text('   ');
				}

				merged_last_idx = new_note_id + merged_count;
			}
		}

		for (var i = 0; i < _songHandle.GetNoteCountOfBar(barID); i++) {
			var note_offset_of_bar = _songHandle.GetNoteOffset(barID);
			var new_note_id = new Number(note_offset_of_bar) + new Number(i);
			var td = $("<td></td>");
			td.addClass('flow_control_td');
			var id = 'id_sheet_flow-' + new_note_id;
			td.attr('id', id);
			ele_flow_tr.append(td);
		}
	};

	this.OnSelectBar = function(e){
		if(e.which == 1){
			var barID = this.id.split('-')[1];
			_maestroMain.SelectBar(barID);
		}else if(e.which == 3){
			console.log('right click');
			$('#id_modal_popup').modal('show');
			_maestroMain.PopupTableColor();
			_maestroMain._selectedBarIndex = this.id.split('-')[1];
		}
	};

	this.SelectBar = function(barIdx) {
		for(var b=0 ; b<_song._barList.length ; b++){
			$('#id_sheet_table-' + b).removeClass('sheet_table_selected');
		}
		$('#id_sheet_table-' + barIdx).addClass('sheet_table_selected');
	};

	this.RedrawAll = function(){
		self.Clear();
		for(var b=0 ; b<_song._barList.length ; b++){
			self.AddBar(b);
		}
	};

	this.FlowControl = function(noteID){
		$('#id_sheet_lyrics-'+noteID).addClass('css_sheet_lyrics_pass');
		$('#id_sheet_flow-'+noteID).addClass('sheet_pass');
	};

	this.OnBeginPlay = function(){
		console.log('_song._barList.length ' + _song._barList.length);
		if(_song._barList.length > 2){
			for(var b = 2 ; b < _song._barList.length ; b++){
				$('#id_sheet_table-'+b).remove();
			}
		}
	};

	this.OnLyricsClick = function(){
		if(_playerMain._playFromNoteID != -1) {
			var ele_bottom = $('#id_sheet_bottom-'+_playerMain._playFromNoteID);
			ele_bottom.empty();
		}

		var note_id = this.id.split('-')[1];

		if(_playerMain._playFromNoteID == note_id){
			_playerMain._playFromNoteID = -1;
			return;
		}

		_playerMain._playFromNoteID = note_id;
		var ele_bottom = $('#id_sheet_bottom-'+note_id);
		var icon_right = $('<i class="fas fa-angle-right small"></i>');
		ele_bottom.append(icon_right);

		console.log('_playerMain._isPlaying ' + _player._isPlaying);
		if(_player._isPlaying){
			self.ClearFlowControl();
			_player.Stop();
			_player.Play(_playerMain._playFromNoteID, false);
		}
	};
}