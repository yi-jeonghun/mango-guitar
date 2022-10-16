function MaestroMain() {
	var self = this;
	this._curBarID = 0;
	this._curInstID = 0;
	this._selectedLyricsCell = -1;
	this._underControlKey = false;
	this._underShiftKey = false;
	this._copiedBarID = -1;
	this._copiedMeasureBarID = -1;
	this._copiedMeasureID = -1;
	this._tableMode = TABLE_MODE.INSTRUMENT;
	this._selectedChordIndex = 0;
	this._selectedDrumScale = -1;
	this._selectedStrumMeasureIndex = 0;
	this._selectedStrumTypeNoteIndex = 0;
	this._popupInstID = -1;
	this._inTypingMode = false;
	this._selectedBarIndex = 0;

	this.Init = function () {
		window._maestroMain = self;
		self.InitKeyHandle();
		self.InitComponentHandle();

		window._song = null;
		window._table = new Table();
		window._player = new Player(self.FlowControl, self.OnPlayEnd);
		window._sheet = new Sheet(SheetType.Maestro);
		window._songHandle = new SongHandle();

		var song_name = GetURLParam('song');
		if(song_name == null){
			_song = new Song();
			_songHandle.Initialize();
			self.InitStep2();
		}else{
			var path_to_song = 'song/' + song_name;
			$.getJSON(path_to_song, function(songJSON){
				var str = JSON.stringify(songJSON);
				_songHandle.LoadSong(str);
				self.InitStep2();
			});
		}
	};

	this.InitStep2 = function(){
		_player.Init();
		//_player.LoadDrfaultInstruments();
		_player.LoadInstruments();

		for (var b = 0; b < _song._barList.length; b++) {
			_sheet.AddBar(b);
		}
		self.SelectBar(0);

		$('#id_song_singer').val(_song._singer);
		$('#id_song_title').val(_song._title);
		$('#id_song_words').val(_song._words);
		$('#id_song_music').val(_song._music);
		$('#id_input_bpm').val(_song._bpm);
		$('#id_song_guitar_name').text(INST_GetName(_song._guitar._key));
		self.LoadInstrumentList();
		self.OnChangeQuarter();
	};

	this.LoadInstrumentList = function() {
		var ele_guitar_vol = $('#id_select_guitar_vol');
		{
			ele_guitar_vol.empty();
			for(var i = 10 ; i > 0 ; i--){
				var val = i * 10;
				var selected = _song._guitar._volume == val ? " selected" : "";
				var ele_opt = $('<option value="' + val + '"' + selected + '>' + val + '</option>');
				ele_guitar_vol.append(ele_opt);
			}
		}

		var ele_guitar_capo = $('#id_select_guitar_capo');
		{
			//console.log('_song._guitar._capo ' + _song._guitar._capo);
			ele_guitar_capo.empty();
			for(var i = 0 ; i <= 10 ; i++){
				var selected = _song._guitar._capo == i ? " selected" : "";
				var ele_opt = $('<option value="' + i + '"' + selected + '>' + i + '</option>');
				ele_guitar_capo.append(ele_opt);
			}
		}

		var ele_drum_btn = $('#id_button_drum');
		{
			ele_drum_btn.removeClass('btn-primary');
			ele_drum_btn.removeClass('btn-secondary');
			if(self._tableMode == TABLE_MODE.DRUM) {
				ele_drum_btn.addClass('btn-primary');
			}else{
				ele_drum_btn.addClass('btn-secondary');
			}
		}

		var ele_drum_mute_icon = $('#id_button_drum_mute_icon');
		var ele_button_drum_mute = $('#id_button_drum_mute');
		{
			ele_button_drum_mute.removeClass('btn-primary');
			ele_button_drum_mute.removeClass('btn-secondary');
			ele_drum_mute_icon.removeClass('fa-volume-mute');
			ele_drum_mute_icon.removeClass('fa-volume-up');
			if(SoundSetting.IsDrumOn){
				ele_button_drum_mute.addClass('btn-primary');
				ele_drum_mute_icon.addClass('fa-volume-mute');
			}else{
				ele_button_drum_mute.addClass('btn-secondary');
				ele_drum_mute_icon.addClass('fa-volume-up');
			}
		}

		var ele_drum_volume = $('#id_select_drum_vol');
		{
			ele_drum_volume.empty();
			for(var i = 10 ; i > 0 ; i--){
				var val = i * 10;
				var selected = _song._guitar._volume == val ? " selected" : "";
				var ele_opt = $('<option value="' + val + '"' + selected + '>' + val + '</option>');
				ele_drum_volume.append(ele_opt);
			}
		}

		var ele_inst_list = $('#id_song_instrument_list');
		ele_inst_list.empty();
		for(var i=0 ; i<_song._instList.length ; i++){
			var div = $('<div></div>');
			ele_inst_list.append(div);

			var name = INST_GetName(_song._instList[i]._key);
			var ele_inst_btn = $('<button type="button" class="btn btn-sm"><span class="small">' + (1*i+1) + ' ' + name + '</span></button>');
			{
				if(self._tableMode == TABLE_MODE.DRUM){
					ele_inst_btn.addClass('btn-secondary');
				}else{
					if(self._curInstID == i){
						ele_inst_btn.addClass('btn-primary');
					}else{
						ele_inst_btn.addClass('btn-secondary');
					}
				}
				ele_inst_btn.attr('id', 'id_button_inst-' + i);
				ele_inst_btn.on('click', self.OnChangeInstrument);
				div.append(ele_inst_btn);
			}

			var btn_edit = $('<button type="button" class="btn btn-sm btn-primary"></button>');
			{
				btn_edit.attr('id', 'id_button_instrument-' + i);
				btn_edit.attr('data-toggle', 'modal');
				btn_edit.attr('data-target', '#id_modal_popup');
				var icon_edit = $('<i class="fas fa-edit small"></i>');
				btn_edit.append(icon_edit);
				btn_edit.on('click', self.PopupInstrumentList);
				div.append(btn_edit);
			}

			var btn_mute = $('<button type="button" class="btn btn-sm btn-primary"></button>');
			{
				div.append(btn_mute);
				btn_mute.attr('id', 'id_button_instrument_mute-' + i);
				btn_mute.on('click', self.OnButtonInstrumentMute);
				var icon_edit = $('<i class="fas fa-volume-mute small"></i>');
				icon_edit.attr('id', 'id_button_instrument_mute_icon-' + i);
				btn_mute.append(icon_edit);
			}

			var ele_vol = $('<select class="small rounded"></select>');
			{
				ele_vol.attr('id', 'id_select_vol_inst-'+i);
				ele_vol.on('change', self.OnSelectInstVolume);
				div.append(ele_vol);
				ele_vol.empty();
				for(var k = 10 ; k > 0 ; k--){
					var val = k * 10;
					var selected = _song._instList[i]._volume == val ? " selected" : "";
					var ele_opt = $('<option value="' + val + '"' + selected + '>' + val + '</option>');
					ele_vol.append(ele_opt);
				}
			}

			if(i > 0){
				var btn_del = $('<button type="button" class="btn btn-sm btn-primary"></button>');
				btn_del.attr('id', 'id_button_instrument_del-' + i);
				var icon_rem = $('<i class="fas fa-trash-alt small"></i>');
				btn_del.append(icon_rem);
				btn_del.on('click', self.RemoveInstrument);
				div.append(btn_del);
			}
		}
	};

	this.OnSelectInstVolume = function(){
		var id = this.id.split('-')[1];
		console.log('id ' + id + ' val ' + this.value);
		_song._instList[id]._volume = this.value;
	};

	this.OnChangeInstrument = function(){
		self._tableMode = TABLE_MODE.INSTRUMENT;
		self._curInstID = this.id.split('-')[1];
		console.log('self._curInstID:'+self._curInstID);
		self.LoadInstrumentList();
		//_table.RedrawTable();
		_table.Reinit();
	};

	this.RemoveInstrument = function(){
		var instID = this.id.split('-')[1];
		console.log('rem id ' + instID);
		_songHandle.RemoveInstrument(instID);
		self.LoadInstrumentList(instID);
	};

	this.PopupInstrumentList = function(){
		self._popupInstID = this.id.split('-')[1];
		console.log('_popupInstID', self._popupInstID);

		$('#id_modal_title').text('Instrument');
		var ele_modal_body = $('#id_modal_body');
		ele_modal_body.empty();

		var ele_container = $('<div class="container-fluid"></div>');
		ele_modal_body.append(ele_container);

		var type_list = INST_GetTypeList();
		for(var i=0 ; i<type_list.length ; i++){
			var ele_row = $('<div class="row"></div>');
			ele_container.append(ele_row);
			var ele_col_type = $('<div class="col-lg-1"></div>');
			ele_row.append(ele_col_type);

			var type_label = $('<span class="small">' + type_list[i] + '</span>');
			ele_col_type.append(type_label);

			var ele_col_insts = $('<div class="col-lg-11"></div>');
			ele_row.append(ele_col_insts);
			var inst_list = INST_GetListOfType(type_list[i]);;
			for(var k=0 ; k<inst_list.length ; k++){
				//inst_list[k].name;
				var btn_inst = $('<button type="button" class="btn btn-sm btn-primary">' + inst_list[k].name + '</button>');
				btn_inst.on('click', self.OnSelectInstrument);
				btn_inst.attr('data-dismiss', 'modal');
				btn_inst.attr('id', inst_list[k].key);
				ele_col_insts.append(btn_inst);

				var btn_test = $('<button type="button"><i class="fa fa-play-circle"></i></button>');
				btn_test.attr('id', inst_list[k].key);
				btn_test.on('click', _player.TestSound);
				ele_col_insts.append(btn_test);
			}
		}
	};

	this.PopupGuitarList = function() {
		console.log('PopupGuitarList');
		var list = INST_GetGuitarList();

		var ele_modal_title = $('#id_modal_title');
		ele_modal_title.text('Guitar');

		var ele_body_div = $('#id_modal_body');
		ele_body_div.empty();
		for(var i=0 ; i<list.length ; i++){
			var btn = $('<button class="btn btn-primary btn-sm" id="'+list[i].key+'">' + list[i].name + '</button>');
			btn.on('click', self.OnSelectGuitar);
			btn.attr('data-dismiss', 'modal');
			ele_body_div.append(btn);

			var btn_test = $('<button type="button"><i class="fa fa-play-circle"></i></button>');
			btn_test.attr('id', list[i].key);
			btn_test.on('click', _player.TestSound);
			ele_body_div.append(btn_test);
		}
	};

	this.PopupDrumList = function() {
		var ele_modal_title = $('#id_modal_title');
		ele_modal_title.text('Drum');
		var ele_body_div = $('#id_modal_body');
		ele_body_div.empty();

		{//none
			var div = $('<div></div>');
			ele_body_div.append(div);
			var btn = $('<button class="btn btn-primary btn-sm" id="None">None</button>');
			btn.on('click', self.OnSelectDrum);
			btn.attr('data-dismiss', 'modal');
			div.append(btn);
		}

		var div = $('<div></div>');
		ele_body_div.append(div);

		for(var i=0 ; i<DRUMS.length ; i++){
			var btn = $('<button class="btn btn-primary btn-sm" id="'+DRUMS[i].file+'">' + DRUMS[i].name + '</button>');
			btn.on('click', self.OnSelectDrum);
			btn.attr('data-dismiss', 'modal');
			div.append(btn);

			var btn_test = $('<button type="button"><i class="fa fa-play-circle"></i></button>');
			btn_test.attr('id', DRUMS[i].file);
			btn_test.on('click', _player.TestDrum);
			div.append(btn_test);
		}
	};

	this.PopupStrumType = function(){
		var ele_modal_title = $('#id_modal_title');
		ele_modal_title.text('Strum Pattern');
		var ele_body_div = $('#id_modal_body');
		ele_body_div.empty();

		var ele_btn_none = $('<button type="button">None</button>');
		ele_btn_none.attr('strum_type', 'N');
		ele_btn_none.on('click', self.OnSelectStrumType);
		ele_btn_none.attr('data-dismiss', 'modal');
		ele_body_div.append(ele_btn_none);

		var ele_btn_down = $('<button type="button">Down</button>');
		ele_btn_down.attr('strum_type', 'D');
		ele_btn_down.on('click', self.OnSelectStrumType);
		ele_btn_down.attr('data-dismiss', 'modal');
		ele_body_div.append(ele_btn_down);

		var ele_btn_up = $('<button type="button">Up</button>');
		ele_btn_up.attr('strum_type', 'U');
		ele_btn_up.on('click', self.OnSelectStrumType);
		ele_btn_up.attr('data-dismiss', 'modal');
		ele_body_div.append(ele_btn_up);

		var ele_btn_snap = $('<button type="button">Snap</button>');
		ele_btn_snap.attr('strum_type', 'S');
		ele_btn_snap.on('click', self.OnSelectStrumType);
		ele_btn_snap.attr('data-dismiss', 'modal');
		ele_body_div.append(ele_btn_snap);
	};

	this.OnSelectStrumType = function(){
		var strum_type = $(this).attr('strum_type');
		switch (strum_type){
			case 'N':
				_song._guitar._strums[self._selectedStrumTypeNoteIndex] = n;
				break;
			case 'D':
				_song._guitar._strums[self._selectedStrumTypeNoteIndex] = D;
				break;
			case 'U':
				_song._guitar._strums[self._selectedStrumTypeNoteIndex] = U;
				break;
			case 'S':
				_song._guitar._strums[self._selectedStrumTypeNoteIndex] = S;
				break;
		}
		_table.Reinit();
	};

	this.ChangeModalSize = function(size){
		$('#id_modal_dialog').removeClass('modal-xm');
		$('#id_modal_dialog').removeClass('modal-lg');
		$('#id_modal_dialog').removeClass('modal-xl');
		switch(size){
			case 'xm':
				$('#id_modal_dialog').addClass('modal-xm');
				break;
			case 'sm':
				break;
			case 'lg':
				$('#id_modal_dialog').addClass('modal-lg');
				break;
			case 'xl':
				$('#id_modal_dialog').addClass('modal-xl');
				break;
		}
	};

	this.PopupTableColor = function(){
		self.ChangeModalSize('sm');
		var ele_modal_title = $('#id_modal_title');
		ele_modal_title.text('Color');
		var ele_body_div = $('#id_modal_body');
		ele_body_div.empty();

		var ele_con = $('<div class="container-fluid"></div>');
		ele_body_div.append(ele_con);
		var ele_row = $('<div class="row"></div>');
		ele_con.append(ele_row);

		var colors = ['bbdaff','ffbaf1', 'e872e6', '74f624', 'fcb5a3', 'e96fb2', '76d6ff', '5be6d6', 'f9a05d', '9eb6ff', 'b1b0ff', 'fffcb0'];

		for(var c = 0 ; c < colors.length ; c++){
			var ele_col = $('<button type="button" class="col-lg-1" style="background-color:#'+colors[c]+'">'+colors[c]+'</button>');
			ele_col.attr('color', colors[c]);
			ele_col.on('mousedown', self.OnSelectTableColor);
			ele_col.attr('data-dismiss', 'modal');
			ele_row.append(ele_col);
		}
	};

	this.OnSelectTableColor = function(){
		var col = $(this).attr('color');
		console.log(col);
		console.log('bar id ' + self._selectedBarIndex);
		var obj = $('#id_sheet_table-'+self._selectedBarIndex);
		obj.css('background-color', '#'+col);
		_song._barList[self._selectedBarIndex]._color = col;
		//console.log('obj ' + obj.style);

		_sheet.RedrawAll();
	};

	this.PopupArpeggioPattern = function(){
		var ele_modal_title = $('#id_modal_title');
		ele_modal_title.text('Arpeggio Pattern');
		var ele_body_div = $('#id_modal_body');
		ele_body_div.empty();

		{
			var btnas = $('<button class="btn btn-primary btn-sm">All Simile</button>');
			btnas.on('click', self.OnSelectArpeggioPatternAllSimile);
			btnas.attr('data-dismiss', 'modal');
			ele_body_div.append(btnas);

			var btn = $('<button class="btn btn-primary btn-sm">%</button>');
			btn.attr('id', ARPEGGIO_PATTERN_SAME);
			btn.on('click', self.OnSelectArpeggioPattern);
			btn.attr('data-dismiss', 'modal');
			ele_body_div.append(btn);

			var btn2 = $('<button class="btn btn-primary btn-sm">None</button>');
			btn2.attr('id', ARPEGGIO_PATTERN_NONE);
			btn2.on('click', self.OnSelectArpeggioPattern);
			btn2.attr('data-dismiss', 'modal');
			ele_body_div.append(btn2);
		}

		var ele_container = $('<div class="container-fluid"></div>');
		ele_body_div.append(ele_container);
		var ele_row = $('<div class="row"></div>');
		ele_container.append(ele_row);

		var list = ARPEGGIO_GetPatternList(_song._quarter, _song._divide);
		//console.log('list len ' + list.length);
		for(var i=0 ; i<list.length ; i++){
			var ele_col = $('<div class="col"></div>');
			ele_row.append(ele_col);

			var ele_table = $('<table></table>');
			ele_table.attr('id', list[i]._key);
			ele_table.on('click', self.OnSelectArpeggioPattern);
			ele_table.attr('data-dismiss', 'modal');

			ele_col.append(ele_table);
			for(var r = 0 ; r < list[i]._picks.length ; r++){
				var ele_tr = $('<tr></tr>');
				ele_table.append(ele_tr);
				for(var c = 0 ; c < list[i]._picks[r].length ; c++){
					var ele_td = $('<td></td>');
					ele_tr.append(ele_td);
					ele_td.addClass('tab_pattern_cell');
					if(list[i]._picks[r][c] == 1){
						ele_td.addClass('tab_pattern_cell_fill');
					}
				}
			}
		}
	};

	this.PopupStrumPattern = function(){
		var ele_modal_title = $('#id_modal_title');
		ele_modal_title.text('Strum Pattern');
		var ele_body_div = $('#id_modal_body');
		ele_body_div.empty();

		var ele_table = $('<table></table>');
		ele_body_div.append(ele_table);

		{
			var ele_tr = $('<tr></tr>');
			ele_table.append(ele_tr);

			var ele_td = $('<td></td>');
			ele_tr.append(ele_td);

			var btnas = $('<button class="btn btn-primary btn-sm">All Simile</button>');
			btnas.on('click', self.OnSelectStrumPatternAllSimile);
			btnas.attr('data-dismiss', 'modal');
			ele_td.append(btnas);

			var btn = $('<button class="btn btn-primary btn-sm">%</button>');
			btn.attr('id', STRUM_PATTERN_SAME);
			btn.on('click', self.OnSelectStrumPattern);
			btn.attr('data-dismiss', 'modal');
			ele_td.append(btn);

			var btn1 = $('<button class="btn btn-primary btn-sm">Custom</button>');
			btn1.attr('id', STRUM_PATTERN_CUSTOM);
			btn1.on('click', self.OnSelectStrumPattern);
			btn1.attr('data-dismiss', 'modal');
			ele_td.append(btn1);

			var btn2 = $('<button class="btn btn-primary btn-sm">None</button>');
			btn2.attr('id', STRUM_PATTERN_NONE);
			btn2.on('click', self.OnSelectStrumPattern);
			btn2.attr('data-dismiss', 'modal');
			ele_td.append(btn2);
		}

		var strum_patterns = STRUM_GetPatternList(_song._quarter, _song._divide)
		for(var i=0 ; i<strum_patterns.length ; i++){
			var ele_tr = $('<tr></tr>');
			ele_table.append(ele_tr);

			var ele_td1 = $('<td></td>');
			{
				var btn = $('<button class="btn btn-primary btn-sm">' + strum_patterns[i]._type + '</button>');
				btn.attr('id', strum_patterns[i]._key);
				btn.on('click', self.OnSelectStrumPattern);
				btn.attr('data-dismiss', 'modal');
				ele_td1.append(btn);
				ele_tr.append(ele_td1);
			}

			var ele_td2 = $('<td></td>');
			{
				var ele_disp = STRUM_GetPatternDisplay(strum_patterns[i]._key);
				ele_td2.append(ele_disp);
				ele_tr.append(ele_td2);
			}

			var ele_td3 = $('<td></td>');
			{
				var btn_test = $('<button type="button"><i class="fa fa-play-circle"></i></button>');
				btn_test.attr('id', strum_patterns[i]._key);
				btn_test.on('click', _player.TestStrumPattern);
				ele_td3.append(btn_test);
				ele_tr.append(ele_td3);
			}
		}
	};

	this.OnSelectStrumPatternAllSimile = function(){
		var measure_idx = 0;
		for(var b = 0 ; b < _song._barList.length ; b++){
			for(var m = 0 ; m < _song._barList[b]._measureCount ; m++){
				if(_song._guitar._patternPerMeasure[measure_idx] == null){
					_song._guitar._patternPerMeasure[measure_idx] = STRUM_PATTERN_SAME;
				}
				measure_idx++;
			}
		}

		_table.Reinit();
	};

	this.OnSelectArpeggioPatternAllSimile = function(){
		var measure_idx = 0;
		for(var b = 0 ; b < _song._barList.length ; b++){
			for(var m = 0 ; m < _song._barList[b]._measureCount ; m++){
				if(_song._guitar._tabPattern4M[measure_idx] == null){
					_song._guitar._tabPattern4M[measure_idx] = ARPEGGIO_PATTERN_SAME;
				}
				measure_idx++;
			}
		}

		_table.Reinit();
	};

	this.OnSelectArpeggioPattern = function(){
		//console.log('this.id ' + this.id);
		if(this.id == ARPEGGIO_PATTERN_NONE){
			_song._guitar._tabPattern4M[self._selectedStrumMeasureIndex] = null;
		}else{
			_song._guitar._tabPattern4M[self._selectedStrumMeasureIndex] = new Number(this.id);
		}
		_table.Reinit();
	};

	this.OnSelectStrumPattern = function(){
		if(this.id == STRUM_PATTERN_NONE){
			_song._guitar._patternPerMeasure[self._selectedStrumMeasureIndex] = null;
		}else{
			_song._guitar._patternPerMeasure[self._selectedStrumMeasureIndex] = new Number(this.id);
		}
		_table.Reinit();
	};

	this.OnSelectDrum = function(){
		console.log(this.id);
		console.log('_selectedDrumScale:'+self._selectedDrumScale);
		if(self._selectedDrumScale != -1){
			if(this.id == 'None'){
				_song._drumSet._keyList[self._selectedDrumScale] = null;
			}else{
				_song._drumSet._keyList[self._selectedDrumScale] = this.id;
			}
		}
		_player.LoadInstruments();
		_table.Reinit();
	};

	this.OnSelectGuitar = function(){
		console.log(this.id);
		_song._guitar._key = this.id;
		$('#id_song_guitar_name').text(INST_GetName(_song._guitar._key));
		_player.LoadInstruments();
	};

	this.OnSelectInstrument = function(){
		_song._instList[self._popupInstID]._key = this.id;
		self.LoadInstrumentList();
		_player.LoadInstruments();
	};

	this.SelectBar = function (barID) {
		self._curBarID = barID;
		self.InitArrow();
		_sheet.SelectBar(barID);
		_table.Reinit();
	};

	this.InitKeyHandle = function () {
		$(document).keyup(function (e) {
			//console.log(e.which);
			switch (e.which) {
				case 16://shift
					self._underShiftKey = false;
					break;
				case 17://control
					self._underControlKey = false;
					break;
			}
		});

		$(document).keydown(function (e) {
			//console.log(e.which);
			switch (e.which) {
				case 9://tab
					e.preventDefault();
					self.EditNextLyrics();
					break;
				case 13://enter
					self.EditLyrics();
					break;
				case 16://shift
					self._underShiftKey = true;
					break;
				case 17://control
					self._underControlKey = true;
					break;
				case 27://esc
					if(_player._isPlaying){
						_player.Stop();
					}else{
						_songHandle.SlidesClear();
						_table.Reinit();
					}
					break;
				case 32://space
					if(self._inTypingMode == false)
						e.preventDefault();
					if(_table._currentNoteID >= 0)
						_player.PlayCurrentMeasure();
					break;
				case 33://page up
				case 34://page down
					e.preventDefault();
					if (self._underControlKey && self._underShiftKey) {
						self.MoveBar(e.which);
					}
					break;
				case 37://left
				case 39://right
					if(self._inTypingMode == false){
						e.preventDefault();
						if (self._underControlKey) {
							self.MergeLyricsCell(e.which);
						} else {
							self.ArrowKey(e.which);
						}
					}
					break;
				case 38://up
				case 40://down
					e.preventDefault();
					if(self._underControlKey == true){
						if(e.which == 38){
							_songHandle.SlidesUp();
						}else if(e.which == 40){
							_songHandle.SlidesDown();
						}
						_table.Reinit();
						_table.SlideDraw();
					}

					if (self._underControlKey == false) {
						self.ArrowKey(e.which);
					}
					break;
				case 48://0
					self.OnChangeNoteCount(10);
					break;
				case 49://1
				case 50://2
				case 51://3
				case 52://4
				case 53://5
				case 54://6
				case 55://7
				case 56://8
				case 57://9
					if(self._arrowY >= 0 && self._arrowY <= 5){
						self.EditTab(e.which - 48);
					}else{
						self.OnChangeNoteCount(e.which - 48);
					}
					break;
				case 81://q
					self.OnChangeNoteCount(11);
					break;
				case 87://w
					self.OnChangeNoteCount(12);
					break;
				case 69://e
					self.OnChangeNoteCount(13);
					break;
				case 82://r
					self.OnChangeNoteCount(14);
					break;
				case 84://t
					self.OnChangeNoteCount(15);
					break;
				case 89://y
					self.OnChangeNoteCount(16);
					break;
				case 188://,
					self.ChangeBPMMinus();
					break;
				case 190://.
					self.ChangeBPMPlus();
					break;
				case 73://i
					self.InsertNote();
					break;
				case 68://d
					self.RemoveNote();
					break;
				case 67://c
					if (self._underControlKey) {
						self.CopyMeasure();
					}
					break;
				case 86://v
					if (self._underControlKey) {
						self.PasteMeasure();
					}
					break;
				case 46://delete
					self.OnDeleteKey();
					break;
				case 83://s -> save
					console.log('self._underControlKey ' + self._underControlKey);
					if(self._underControlKey){
						e.preventDefault();
						self.SaveFile();
					}
					break;
				case 111:// num pad '/' key
					self.DivideMeasure();
					break;
			}
		});
	};

	this._lastInputTab = -1;
	this.EditTab = function(key){
		console.log(key);
		var offset = _songHandle.GetNoteOffset(self._curBarID);
		var new_offset = new Number(offset) + new Number(self._arrowX);
		if(_song._guitar._tabs[new_offset] == null){
			_song._guitar._tabs[new_offset] = [];
		}
		console.log('y ' + self._arrowY);
		var string_idx = self._arrowY;
		console.log('string_idx ' + string_idx);

		var fret = key;
		if(self._lastInputTab != -1){
			var tmp = self._lastInputTab + '' + key;
			tmp = new Number(tmp);
			if(tmp > 20){
				return;
			}
			fret = tmp;
		}

		self._lastInputTab = fret;
		_song._guitar._tabs[new_offset][string_idx] = fret;
		_table.Reinit();
	};

	this.DivideMeasure = function(){
		console.log('self._curBarID ' + self._curBarID);
		console.log('_table._currentMeaureID ' + _table._currentMeaureID);
		var qd = _song._barList[self._curBarID]._qdList[_table._currentMeaureID];
		//console.log('qd ' + qd);
		if(qd == QUARTER_DIVIDE._34){
			console.log('not support');
			return;
		}else if(qd == QUARTER_DIVIDE._43){
			console.log('not support');
			return;
		}else if(qd == QUARTER_DIVIDE._44){
			_song._barList[self._curBarID]._qdList[_table._currentMeaureID] = QUARTER_DIVIDE._24;
			//console.log('QD ' + _song._barList[self._curBarID]._qdList[_table._currentMeaureID]);
		}else if(qd == QUARTER_DIVIDE._24){
			_song._barList[self._curBarID]._qdList[_table._currentMeaureID] = QUARTER_DIVIDE._44;
			//console.log('QD ' + _song._barList[self._curBarID]._qdList[_table._currentMeaureID]);
		}
		_sheet.RedrawAll();
		_sheet.SelectBar(self._curBarID);
		_table.Reinit();
	};

	this.OnDeleteKey = function(){
		if(self._arrowY >= 0 &&  self._arrowY <= 5){
			var offset = new Number(_songHandle.GetNoteOffset(self._curBarID));
			offset += self._arrowX;
			if(_song._guitar._tabs[offset] != null){
				_song._guitar._tabs[offset][self._arrowY] = null;
			}
		}

		_sheet.RedrawAll();
		_sheet.SelectBar(self._curBarID);
		_table.Reinit();
	};

	this.GuitarStroke = function(stroke){
		if(self._arrowY != 0){
			return;
		}
		var offset = new Number(_songHandle.GetNoteOffset(self._curBarID));
		offset += self._arrowX;
		_song._guitar._strums[offset] = stroke;
		_sheet.RedrawAll();
		_sheet.SelectBar(self._curBarID);
		_table.Reinit();
	};

	this.FlowControl = function (noteID) {
		var barID = _songHandle.GetBarIDOfNote(noteID);
		if(barID == -1)
			return;

		if(barID >= _song._barList.length)
			return;

		var offset = _songHandle.GetNoteOffset(barID);
		var note_seq = new Number(noteID) - new Number(offset);

		if (self._curBarID != barID) {
			self.SelectBar(barID);
		}
		_sheet.FlowControl(noteID);
		_table.FlowControl(note_seq);
	};

	this.TypingModeTrue = function(){
		self._inTypingMode = true;
	};

	this.TypingModeFalse = function(){
		self._inTypingMode = false;
	};

	this.InitComponentHandle = function () {
		$('#id_song_singer').on("propertychange change keyup paste input", self.OnSingerChange);
		$('#id_song_singer').focus(self.TypingModeTrue);
		$('#id_song_singer').focusout(self.TypingModeFalse);
		$('#id_song_title').on("propertychange change keyup paste input", self.OnTitleChange);
		$('#id_song_title').focus(self.TypingModeTrue);
		$('#id_song_title').focusout(self.TypingModeFalse);
		$('#id_song_words').on("propertychange change keyup paste input", self.OnWordsChange);
		$('#id_song_words').focus(self.TypingModeTrue);
		$('#id_song_words').focusout(self.TypingModeFalse);
		$('#id_song_music').on("propertychange change keyup paste input", self.OnMusicChange);
		$('#id_song_music').focus(self.TypingModeTrue);
		$('#id_song_music').focusout(self.TypingModeFalse);

		//$('#id_button_play').on('mousedown', self.OnButtonPlay);
		$('#id_button_addBar').on('mousedown', self.OnBbuttonAddBar);
		$('#id_button_delBar').on('mousedown', self.OnBbuttonDelBar);
		$('#id_button_hash').on('mousedown', self.OnButtonHash);
		$('#id_sheet_button_copy').on('mousedown', self.OnButtonCopy);
		$('#id_sheet_button_paste').on('mousedown', self.OnButtonPaste);

		$('#id_button_quarter-34').on('click', self.OnButtonChangeQuarter);
		$('#id_button_quarter-43').on('click', self.OnButtonChangeQuarter);
		$('#id_button_quarter-44').on('click', self.OnButtonChangeQuarter);

		$('#id_button_plus_measure').on('mousedown', self.OnButtonPlusMeasure);
		$('#id_button_minus_measure').on('mousedown', self.OnButtonMinusMeasure);

		$('#id_input_bpm').on("propertychange change keyup paste input", self.OnBPMChange);

		$('#id_button_auto_merge').on('click', self.OnButtonAutoMerge);
		$('#id_btn_song_to_json').on('click', self.OnButtonSongToJSON);
		$('#id_btn_json_to_song').on('click', self.OnButtonJSONtoSong);
		$('#id_button_guitar_select').on('click', self.PopupGuitarList);
		$('#id_button_instrument_add').on('click', self.OnButtonAddInstrument);
		$('#id_button_plus_octave').on('click', self.OnButtonPlusOctave);
		$('#id_button_minus_octave').on('click', self.OnButtonMinusOctave);
		$('#id_button_up_key').on('click', self.OnButtonUpKey);
		$('#id_button_down_key').on('click', self.OnButtonDownKey);

		$('#id_button_guitar_mute').on('click', self.OnButtonMuteGuitar);
		$('#id_select_guitar_vol').on('change', self.OnSelectGuitarVolume);
		$('#id_select_guitar_capo').on('change', self.OnSelectGuitarCapo);

		$('#id_button_drum').on('click', self.OnButtonDrum);
		$('#id_button_drum_mute').on('click', self.OnButtonMuteDrum);
		$('#id_select_drum_vol').on('change', self.OnSelectDrumVolume);

		for(var i=1 ; i<=20 ; i++){
			$('#id_note_cnt-' + i).on('click', self.OnButtonNoteCount);
		}
	};

	this.OnButtonDrum = function() {
		self._tableMode = TABLE_MODE.DRUM;
		self.LoadInstrumentList();
		_table.Reinit();
	};

	this.OnButtonMuteGuitar = function() {
		SoundSetting.IsGuitarOn = !SoundSetting.IsGuitarOn;
		var ele_btn = $('#id_button_guitar_mute');
		var ele_icon = $('#id_button_guitar_mute_icon');
		ele_btn.removeClass('btn-primary');
		ele_btn.removeClass('btn-secondary');
		ele_icon.removeClass('fa-volume-up');
		ele_icon.removeClass('fa-volume-mute');
		if(SoundSetting.IsGuitarOn){
			ele_icon.addClass('fa-volume-mute');
			ele_btn.addClass('btn-primary');
		}else{
			ele_icon.addClass('fa-volume-up');
			ele_btn.addClass('btn-secondary');
		}
	};

	this.OnSelectGuitarVolume = function(){
		console.log(this.value);
		_song._guitar._volume = this.value;
	};

	this.OnSelectGuitarCapo = function(){
		console.log(this.value);
		_song._guitar._capo = this.value;
	};

	this.OnButtonMuteDrum = function(){
		SoundSetting.IsDrumOn = !SoundSetting.IsDrumOn;
		self.LoadInstrumentList();
	};

	this.OnSelectDrumVolume = function(){
		_song._drumSet._volume = this.value;
	};

	this.OnButtonInstrumentMute = function(){
		var id = this.id.split('-')[1];
		if(SoundSetting.IsInstrumentOn[id] == null)
			SoundSetting.IsInstrumentOn[id] = true;

		SoundSetting.IsInstrumentOn[id] = !SoundSetting.IsInstrumentOn[id];

		var ele_btn = $('#id_button_instrument_mute-'+id);
		var ele_icon = $('#id_button_instrument_mute_icon-'+id);

		ele_btn.removeClass('btn-primary');
		ele_btn.removeClass('btn-secondary');
		ele_icon.removeClass('fa-volume-mute');
		ele_icon.removeClass('fa-volume-up');

		if(SoundSetting.IsInstrumentOn[id]){
			ele_btn.addClass('btn-primary');
			ele_icon.addClass('fa-volume-mute');
		}else{
			ele_btn.addClass('btn-secondary');
			ele_icon.addClass('fa-volume-up');
		}
	};


	this.OnButtonPlusOctave = function(){
		if(self._tableMode == TABLE_MODE.DRUM)
			return;
		if(_song._instList[self._curInstID]._octave == 6)
			return;
		_song._instList[self._curInstID]._octave++;
		_table.RedrawTable();
	};

	this.OnButtonMinusOctave = function(){
		if(self._tableMode == TABLE_MODE.DRUM)
			return;

		if(_song._instList[self._curInstID]._octave == 1)
			return;
		_song._instList[self._curInstID]._octave--;
		_table.RedrawTable();
	};

	this.OnButtonUpKey = function(){
		console.log('OnButtonUpKey ');
		_songHandle.KeyUp();
		_table.RedrawTable();
	};

	this.OnButtonDownKey = function(){
		console.log('OnButtonDownKey ');
		_songHandle.KeyDown();
		_table.RedrawTable();
	};

	this.OnSingerChange = function () {
		_song._singer = this.value;
	};

	this.OnTitleChange = function () {
		_song._title = this.value;
	};

	this.OnWordsChange = function () {
		_song._words = this.value;
	};

	this.OnMusicChange = function () {
		_song._music = this.value;
	};

	this.SaveFile = function(){
		self._underControlKey = false;
		var str = JSON.stringify(_song);
		_song._singer = _song._singer.trim();
		$('#id_song_singer').text = _song._singer;

		_song._title = _song._title.trim();
		$('#id_song_title').text = _song._title

		_song._words = _song._words.trim();
		$('#id_song_words').text = _song._words;

		_song._music = _song._music.trim();
		$('#id_song_music').text = _song._music;

		if(_song._singer.length == 0){
			alert('Enter Singer!');
			return;
		}

		if(_song._title.length == 0){
			alert('Enter Title!!');
			return;
		}

		$.post('./php/api.php?song_save', JSON.stringify(_song), function(){
			console.log('success');
		}, "json");
	};

	this.OnButtonSongToJSON = function () {
		$('#id_song2json').val(JSON.stringify(_song));
	};

	this.OnButtonJSONtoSong = function () {
		var str = $('#id_song2json').val();
		_songHandle.LoadSong(str);
		_sheet.Clear();

		$('#id_song_singer').val(_song._singer);
		$('#id_song_title').val(_song._title);
		$('#id_song_words').val(_song._words);
		$('#id_song_music').val(_song._music);

		for (var b = 0; b < _song._barList.length; b++) {
			_sheet.AddBar(b);
		}

		self.SelectBar(0);
		_player.LoadInstruments();
		self.LoadInstrumentList();
	};

	this.OnBPMChange = function () {
		_song._bpm = this.value;
	};

	this.ChangeBPMPlus = function () {
		_song._bpm = _song._bpm + 5;
		$('#id_input_bpm').val(_song._bpm);
	};

	this.ChangeBPMMinus = function () {
		_song._bpm = _song._bpm - 5;
		$('#id_input_bpm').val(_song._bpm);
	};

	this.OnButtonChangeQuarter = function () {
		var val = this.id.split('-')[1];
		//console.log('quarter:' + val);

		if(val == 34){
			_songHandle.ChangeQuarterDivide(QUARTER_DIVIDE._34);
		}else if(val == 43){
			_songHandle.ChangeQuarterDivide(QUARTER_DIVIDE._43);
		}else if(val == 44){
			_songHandle.ChangeQuarterDivide(QUARTER_DIVIDE._44);
		}

		_sheet.RedrawAll();
		_sheet.SelectBar(self._curBarID);
		_table.Reinit();
		self.OnChangeQuarter();
	};

	this.OnChangeQuarter = function () {
		if (_song._quarter == 3 && _song._divide == 4) {
			$('#id_button_quarter-34').addClass('btn-primary');
			$('#id_button_quarter-34').removeClass('btn-secondary');
			$('#id_button_quarter-43').addClass('btn-secondary');
			$('#id_button_quarter-43').removeClass('btn-primary');
			$('#id_button_quarter-44').addClass('btn-secondary');
			$('#id_button_quarter-44').removeClass('btn-primary');
		} else if (_song._quarter == 4 && _song._divide == 3) {
			$('#id_button_quarter-34').addClass('btn-secondary');
			$('#id_button_quarter-34').removeClass('btn-primary');
			$('#id_button_quarter-43').addClass('btn-primary');
			$('#id_button_quarter-43').removeClass('btn-secondary');
			$('#id_button_quarter-44').addClass('btn-secondary');
			$('#id_button_quarter-44').removeClass('btn-primary');
		} else if (_song._quarter == 4 && _song._divide == 4) {
			$('#id_button_quarter-34').addClass('btn-secondary');
			$('#id_button_quarter-34').removeClass('btn-primary');
			$('#id_button_quarter-43').addClass('btn-secondary');
			$('#id_button_quarter-43').removeClass('btn-primary');
			$('#id_button_quarter-44').addClass('btn-primary');
			$('#id_button_quarter-44').removeClass('btn-secondary');
		}
	};

	this.OnButtonPlay = function () {
		_player.Play(0, true);
	};

	this.OnButtonCopy = function () {
		self._copiedBarID = self._curBarID;
	};

	this.OnButtonPaste = function () {
		if (self._copiedBarID < 0)
			return;
		if (self._copiedBarID == self._curBarID)
			return;

		_songHandle.CopyAndPaste(self._copiedBarID, self._curBarID);

		_sheet.RedrawAll();
		_sheet.SelectBar(self._curBarID);
		_table.Reinit();
	};

	this.OnBbuttonAddBar = function () {
		var addedBarIdx = _songHandle.AddBar();
		self._curBarID = addedBarIdx;
		_sheet.AddBar(addedBarIdx);
		_sheet.SelectBar(addedBarIdx);
		_table.Reinit();
	};

	this.OnBbuttonDelBar = function () {
		console.log('delete : ' + self._curBarID);
		_songHandle.RemoveBar(self._curBarID);
		_sheet.Clear();
		_sheet.RedrawAll();
		self.SelectBar(0);
	};

	this.OnButtonHash = function () {
		console.log('ba length : ' + _song._barList.length);
		var songJson = JSON.stringify(_song);
		console.log(songJson);
		var hash = window.btoa(songJson);
		window.location.hash = '#' + hash;
	};

	this.OnChangeNoteCount = function(cnt){
		_table._once_node_count = cnt;

		for(var i=1 ; i<=20 ; i++){
			$('#id_note_cnt-'+i).removeClass('note_cnt_selected');
		}
		$('#id_note_cnt-'+cnt).addClass('note_cnt_selected');
	};

	this.OnButtonNoteCount = function () {
		console.log('this.id ' + this.id);
		var cnt = this.id.split('-')[1];
		console.log('cnt ' + cnt);
		self.OnChangeNoteCount(cnt);
	};

	this.PopupChordList = function(){
		var ele_modal_title = $('#id_modal_title');
		ele_modal_title.text('Chords');

		var ele_body_div = $('#id_modal_body');
		ele_body_div.empty();

		{
			var ele_div = $('<div></div>');
			var btn = $('<button class="btn btn-primary btn-sm">None</button>');
			btn.attr('chord', 'None');
			btn.on('click', self.OnButtonSelectChord);
			btn.attr('data-dismiss', 'modal');
			ele_div.append(btn);
			ele_body_div.append(ele_div);
		}

		for(var i=0 ; i<_subChords.length ; i++){
			var ele_div = $('<div></div>');
			for(var s = 0 ; s < _subChords[i].subs.length ; s++){
				var btn = $('<button class="btn btn-primary btn-sm">' + _subChords[i].subs[s] + '</button>');
				btn.attr('chord', _subChords[i].subs[s]);
				btn.on('click', self.OnButtonSelectChord);
				btn.attr('data-dismiss', 'modal');
				ele_div.append(btn);
			}
			ele_body_div.append(ele_div);
		}
	};

	this.OnButtonSelectChord = function () {
		var ele = $(this);
		var chord = ele.attr('chord');
		_table.SelectChord(chord);
		_table.Reinit();
	};

	this.OnButtonPlusMeasure = function () {
		_songHandle.AddMeasure(self._curBarID);
		_sheet.RedrawAll();
		self.SelectBar(self._curBarID);
	};

	this.OnButtonMinusMeasure = function () {
		_songHandle.RemoveMeasure(self._curBarID);
		_sheet.RedrawAll();
		self.SelectBar(self._curBarID);
	};

	this._arrowX = 0;
	this._arrowY = 6;

	this.InitArrow = function(){
		self._arrowX = 0;
		self._arrowY = 6;
		self._selectedLyricsCell = self._arrowX;
	};

	this.EditNextLyrics = function(){
		if(self._arrowY != 6){
			return;
		}

		var note_offset_of_bar = _songHandle.GetNoteOffset(self._curBarID);
		var noteID = new Number(note_offset_of_bar) + new Number(self._arrowX);
		var note_count_of_bar = _songHandle.GetNoteCountOfBar(self._curBarID);
		var note_id_to_edit = -1;
		var cnt = new Number(note_offset_of_bar) + new Number(note_count_of_bar);
		for(var n = noteID + 1 ; n < cnt ; n++){
			if(_song._instList[0]._notes[n] == 'undefined')
				continue;
			if(_song._instList[0]._notes[n] == null)
				continue;
			if(_song._instList[0]._notes[n].length == 0)
				continue;

			note_id_to_edit = n;
			break;
		}

		if(note_id_to_edit != -1){
			self._arrowX = note_id_to_edit - note_offset_of_bar;
			self._selectedLyricsCell = self._arrowX;
			_table.UpdateChordTable();
			setTimeout(self.EditLyrics, 100);
		}
	};

	this.ArrowKey = function (key) {
		//37,38,39,40 left,up,down,right
		//console.log('self._curBarID ' + self._curBarID);
		var offset = _songHandle.GetNoteOffset(self._curBarID);
		var max_x = new Number(_songHandle.GetNoteCountOfBar(self._curBarID))-1;
		//console.log('max_x ' + max_x);
		var max_y = 6;

		switch(key){
			case 37://left
				if(self._arrowY == 6){
					for(var x = self._arrowX-1 ; x >= 0 ; x--){
						if(_song._lyrics[offset+x] != MERGED){
							break;
						}
					}
					self._arrowX = x;
				}else{
					self._arrowX--;
				}

				if(self._arrowX < 0)
					self._arrowX = max_x;
				break;
			case 39://right
				console.log('self._arrowX ' + self._arrowX);
				if(self._arrowY == 6) {
					for (var x = self._arrowX + 1; x <= max_x; x++) {
						if (_song._lyrics[offset + x] != MERGED) {
							break;
						}
					}
					self._arrowX = x;
				}else{
					self._arrowX++;
				}
				//console.log('self._arrowX ' + self._arrowX);
				if(self._arrowX > max_x)
					self._arrowX = 0;
				break;
			case 38://up
				self._arrowY--;
				if(self._arrowY < 0)
					self._arrowY = max_y;
				break;
			case 40://down
				self._arrowY++;
				if(self._arrowY > max_y)
					self._arrowY = 0;
				break;
		}

		//console.log(self._arrowX + ',' + self._arrowY);
		self._lastInputTab = -1;

		if(self._arrowY == 6){
			self._selectedLyricsCell = self._arrowX;
		}

		_table.UpdateChordTable();
	};

	this.EditLyrics = function () {
		_table.EditLyricsWithID(self._selectedLyricsCell);
	};

	this.OnButtonAutoMerge = function(){
		for(var n = 0 ; n < _song._instList[0]._notes.length ; n++){
			if(_song._instList[0]._notes[n] != null){
				if(_song._instList[0]._notes[n].length > 0){
					if(_song._instList[0]._notes[n][0].c > 1){
						for(var c = 1 ; c < _song._instList[0]._notes[n][0].c ; c++){
							_song._lyrics[n + c] = MERGED;
						}
					}
				}
			}
		}
		_table.RedrawLyricsRow();
		_sheet.RedrawAll();
		_sheet.SelectBar(self._curBarID);
	};

	this.MergeLyricsCell = function (key) {
		if(self._arrowY != 6)
			return;

		console.log('merge cell');
		if (self._arrowX < 0)
			return;
		if (self._arrowX >= _songHandle.GetNoteCountOfBar(self._curBarID))
			return;

		var offset = _songHandle.GetNoteOffset(self._curBarID);

		if (key == '37') {//left
			var cell_merged = -1;
			for (var l = self._arrowX + 1; l < _songHandle.GetNoteCountOfBar(self._curBarID); l++) {
				var new_offset = new Number(offset) + new Number(l);
				if (_song._lyrics[new_offset] == MERGED) {
					cell_merged = new_offset;
				} else {
					break;
				}
			}

			if (cell_merged != -1) {
				_song._lyrics[cell_merged] = null;
			}
		}

		if (key == '39') {//right
			var cell_to_merge = -1;
			for (var l = self._arrowX + 1; l < _songHandle.GetNoteCountOfBar(self._curBarID); l++) {
				var new_offset = new Number(offset) + new Number(l);
				if (_song._lyrics[new_offset] != MERGED) {
					cell_to_merge = new_offset;
					break;
				}
			}

			if (cell_to_merge != -1) {
				_song._lyrics[cell_to_merge] = MERGED;
			}
		}

		_table.RedrawLyricsRow();
		var cellCurr = $('#id_table_lyrics-' + self._arrowX);
		cellCurr.addClass('cell_lyrics_selected');
		_sheet.RedrawAll();
		_sheet.SelectBar(self._curBarID);
	};

	this.RemoveNote = function () {
		if (self._curBarID < 0)
			return;
		if (_table._currentNoteID < 0)
			return;

		_songHandle.RemoveNote(self._curBarID, _table._currentNoteID);
		_sheet.RedrawAll();
		_sheet.SelectBar(self._curBarID);
		_table.Reinit();
	};

	this.InsertNote = function () {
		console.log('insert');
		console.log(self._curBarID + ' ' + _table._currentNoteID);
		if (self._curBarID < 0)
			return;
		if (_table._currentNoteID < 0)
			return;

		_songHandle.InsertNote(self._curBarID, _table._currentNoteID);
		_sheet.RedrawAll();
		_sheet.SelectBar(self._curBarID);
		_table.Reinit();
	};

	this.CopyMeasure = function () {
		self._copiedMeasureBarID = self._curBarID;
		self._copiedMeasureID = _table._currentMeaureID;
		console.log('copy : ' + self._copiedMeasureBarID + ' ' + self._copiedMeasureID);
	};

	this.PasteMeasure = function () {
		if (self._copiedMeasureID < 0)
			return;

		if(_table._currentMeaureID < 0)
			return;

		if (self._copiedMeasureBarID == self._curBarID &&
			self._copiedMeasureID == _table._currentMeaureID)
			return;

		console.log('paste from[' + self._copiedMeasureBarID + ':' + self._copiedMeasureID +
		'] to [' + self._curBarID + ':' + _table._currentMeaureID + ']');

		console.log(self._tableMode);

		_songHandle.CopyAndPasteMeasure(
			self._tableMode,
			self._copiedMeasureBarID, self._copiedMeasureID,
			self._curBarID, _table._currentMeaureID
		);
		_sheet.RedrawAll();
		_sheet.SelectBar(self._curBarID);
		_table.Reinit();
	};

	this.MoveBar = function (key) {
		console.log('move bar ' + key);
		if (key == 33) {//up
			if (self._curBarID <= 0) {
				return;
			}
			_songHandle.MoveBarUp(self._curBarID);
			self._curBarID--;
		}

		if (key == 34) {//down
			if (self._curBarID >= _song._barList.length - 1) {
				return;
			}
			_songHandle.MoveBarDown(self._curBarID);
			self._curBarID++;
		}

		_sheet.RedrawAll();
		_sheet.SelectBar(self._curBarID);
		_table.Reinit();
	};

	this.OnPlayEnd = function() {

	};

	this.OnButtonAddInstrument = function(){
		_songHandle.AddInstrument();
		self.LoadInstrumentList();
	};
};

function GetURLParam(name){
	var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
	if (results==null) {
		return null;
	}
	return decodeURI(results[1]) || 0;
};
