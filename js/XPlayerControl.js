$(document).ready(function () {
	new XPlayerControl().Init();
});

function XPlayerControl(){
	var self = this;
	this._music = null;
	this._musicXMLPlayer = null;
	this._chordManager = null;
	this._scroll = null;
	this._flow_control_cell_list = [];
	this._flow_control_cur_cell = 0;
	this._selected_measure_seq = -1;

	this.Init = function(){
		self._musicXMLPlayer = new MusicXMLPlayer(self.FlowControlCallback, self.PlayEndCallback, self.OnInstrumentLoaded);
		self._musicXMLPlayer.Init();
		self._chordManager = new ChordManager();
		self._scroll = new Scroll();
		self.InitComponentHandle();
		self.InitLoading();

		//Load Music
		{
			var file = self.GetURLParam('music');
			var draft = self.GetURLParam('draft');
			//console.log('draft ' + draft);

			var path_to_song = '';
			if(draft == '1'){
				path_to_song = './_man/workbench/'+file;
			}else{
				path_to_song = './song/xchord/'+file+'.xchord';
			}

			$.ajax({
				url: path_to_song,
				type:"GET",
				success: function(res){
					//base64 decode
					var b64_decoded = atob(res);
					//gunzip
					var decompressed = pako.inflate(b64_decoded);
					//uint8array -> utf8 string
					var restored = self.Uint8ArrayToUTF8(decompressed);
					//JSON first
					var json = JSON.parse(restored);
					//JSON twice(?)
					var json2 = JSON.parse(json);
					self.LoadMusic(json2);
				}
			});
		}
	};

	this.Uint8ArrayToUTF8 = function(data){
		const extraByteMap = [ 1, 1, 1, 1, 2, 2, 3, 0 ];
		var count = data.length;
		var str = "";

		for(var index = 0;index < count;){
			var ch = data[index++];
			if (ch & 0x80){
				var extra = extraByteMap[(ch >> 3) & 0x07];
				if (!(ch & 0x40) || !extra || ((index + extra) > count))
					return null;

				ch = ch & (0x3F >> extra);
				for (;extra > 0;extra -= 1)	{
					var chx = data[index++];
					if ((chx & 0xC0) != 0x80)
						return null;

					ch = (ch << 6) | (chx & 0x3F);
				}
			}
			str += String.fromCharCode(ch);
		}
		return str;
	};

	this.LoadMusic = function(music){
		self._music = music;
		self._musicXMLPlayer.LoadMusic(self._music);
		self.InitButtons();
		self.UpdateTempo();
		self.DisplayChords();
		self.DisplayTitle();
		self.DisplaySheet();
	};

	this.InitButtons = function(){
		{
			var btn_melody = $('#id_player_button_instrument_melody');
			btn_melody.addClass('btn-primary');
			btn_melody.on('click', self.OnMelodyClick);
			self._musicXMLPlayer._play_melody = true;
		}

		{
			var btn_guitar = $('#id_player_button_instrument_guitar');
			btn_guitar.on('click', self.OnClickGuitar);
			if(self._musicXMLPlayer._includes_chord){
				btn_guitar.addClass('btn-primary');
				self._musicXMLPlayer._play_guitar = true;
			}else{
				btn_guitar.hide();
				self._musicXMLPlayer._play_guitar = false;
			}
		}

		{
			var btn_percussion = $('#id_player_button_instrument_percussion');
			btn_percussion.on('click', self.OnClickPercussion);
			if(self._musicXMLPlayer._includes_percussion){
				btn_percussion.addClass('btn-primary');
				self._musicXMLPlayer._play_percussion = true;
			}else {
				btn_percussion.hide();
				self._musicXMLPlayer._play_percussion = false;
			}
		}

		{
			var btn_countdown = $('#id_player_button_count');
			btn_countdown.on('click', self.OnClickCountdown);
			self._musicXMLPlayer._play_countdown = true;
		}
	};

	this.OnClickGuitar = function(){
		var btn_guitar = $('#id_player_button_instrument_guitar');
		if(self._musicXMLPlayer._play_guitar == true){
			btn_guitar.removeClass('btn-primary');
			btn_guitar.addClass('btn-secondary');
			self._musicXMLPlayer._play_guitar = false;
		}else{
			btn_guitar.addClass('btn-primary');
			btn_guitar.removeClass('btn-secondary');
			self._musicXMLPlayer._play_guitar = true;
		}
	};

	this.OnMelodyClick = function(){
		var btn_melody = $('#id_player_button_instrument_melody');
		if(self._musicXMLPlayer._play_melody == true){
			btn_melody.removeClass('btn-primary');
			btn_melody.addClass('btn-secondary');
			self._musicXMLPlayer._play_melody = false;
		}else{
			btn_melody.addClass('btn-primary');
			btn_melody.removeClass('btn-secondary');
			self._musicXMLPlayer._play_melody = true;
		}
	};

	this.OnClickPercussion = function(){
		var btn_percussion = $('#id_player_button_instrument_percussion');
		if(self._musicXMLPlayer._play_percussion == true){
			btn_percussion.removeClass('btn-primary');
			btn_percussion.addClass('btn-secondary');
			self._musicXMLPlayer._play_percussion = false;
		}else{
			btn_percussion.addClass('btn-primary');
			btn_percussion.removeClass('btn-secondary');
			self._musicXMLPlayer._play_percussion = true;
		}
	};

	this.OnClickCountdown = function(){
		var btn_countdown = $('#id_player_button_count');
		btn_countdown.removeClass('btn-primary');
		btn_countdown.removeClass('btn-secondary');
		if(self._musicXMLPlayer._play_countdown){
			btn_countdown.addClass('btn-secondary');
			self._musicXMLPlayer._play_countdown = false;
		}else{
			btn_countdown.addClass('btn-primary');
			self._musicXMLPlayer._play_countdown = true;
		}
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

	this.GetURLParam = function(name){
		var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
		if (results==null) {
			return null;
		}
		return decodeURI(results[1]) || 0;
	};

	this.InitComponentHandle = function(){
		console.log('InitComponentHandle');
		$('#id_player_button_play').on('click', self.Play);
		$('#id_player_button_stop').on('click', self.Stop);
		$('#id_player_button_backward').on('click', self.TempoControl);
		$('#id_player_button_forward').on('click', self.TempoControl);
	};

	this.TempoControl = function(){
		var plus;
		if(this.id == 'id_player_button_forward'){
			plus = true;
			console.log('plus');
		}else{
			plus = false;
			console.log('minus');
		}
		console.log('self._musicXMLPlayer._player_state ' + self._musicXMLPlayer._player_state);

		switch(self._musicXMLPlayer._player_state){
			case PLAYER_STATE.PLAY:
				self._musicXMLPlayer.Stop();
				if(plus){
					self._musicXMLPlayer.TempoPlus();
				}else{
					self._musicXMLPlayer.TempoMinus();
				}
				self._musicXMLPlayer.SetBeginningMeasureSeq(self._musicXMLPlayer._cur_playing_measure_seq);
				self._musicXMLPlayer.Play();
				self.UpdateTempo();
				break;
			case PLAYER_STATE.PAUSE:
				self._musicXMLPlayer.Stop();
				if(plus){
					self._musicXMLPlayer.TempoPlus();
				}else{
					self._musicXMLPlayer.TempoMinus();
				}
				self._musicXMLPlayer.SetBeginningMeasureSeq(self._musicXMLPlayer._cur_playing_measure_seq);
				self.UpdateTempo();
				break;
			case PLAYER_STATE.STOP:
				if(plus){
					self._musicXMLPlayer.TempoPlus();
				}else{
					self._musicXMLPlayer.TempoMinus();
				}
				self.UpdateTempo();
				break;
		}
		self.UpdateFlowControlCellList();
	};

	this.Play = function(){
		switch(self._musicXMLPlayer._player_state){
			case PLAYER_STATE.STOP:
				if(self._selected_measure_seq == -1){
					self._musicXMLPlayer.SetBeginningMeasureSeq(0);
				}else{
					self._musicXMLPlayer.SetBeginningMeasureSeq(self._selected_measure_seq);
				}
				self._musicXMLPlayer.Play();
				self.ChangePlayIcon('pause');
				break;
			case PLAYER_STATE.PLAY:
				self._musicXMLPlayer.Pause();
				self.ChangePlayIcon('play');
				break;
			case PLAYER_STATE.PAUSE:
				self._musicXMLPlayer.Resume();
				self.ChangePlayIcon('pause');
				break;
		}
	};

	this.Stop = function(){
		self._musicXMLPlayer.Stop();
		self.ChangePlayIcon('play');
		self.PlayEndCallback();
	};

	this.ChangePlayIcon = function(play_pause){
		console.log('play_pause ' + play_pause);
		var icon = $('#id_player_play_icon');
		icon.removeClass('fa-pause');
		icon.removeClass('fa-play');
		if(play_pause == 'play'){
			icon.addClass('fa-play');
		}else if(play_pause == 'pause'){
			icon.addClass('fa-pause');
		}
	};

	this.FlowControlCallback = function(playingTime){
		//console.log('self._selected_measure_seq ' + self._selected_measure_seq);
		//console.log('self._flow_control_cur_cell ' + self._flow_control_cur_cell);

		if(self._selected_measure_seq != -1 && self._flow_control_cur_cell == 0){
			var measure_time_offset = self._musicXMLPlayer.GetMeasureTimeOffset(self._selected_measure_seq);
			for(var i=0 ; i<self._flow_control_cell_list.length ; i++){
				var c = self._flow_control_cell_list[i];
				if(measure_time_offset > c._offset){
					$('#'+c._id).addClass('td_flow_pass');
					self._flow_control_cur_cell = i;
				}else{
					break;
				}
			}
		}

		//console.log('playingTime ' + playingTime);
		if(self._flow_control_cur_cell >= self._flow_control_cell_list.length){
			return;
		}
		var c = self._flow_control_cell_list[self._flow_control_cur_cell];
		//console.log(playingTime + ' ' + c._offset);
		if(playingTime >= c._offset){
			$('#'+c._id).addClass('td_flow_pass');
			self._flow_control_cur_cell++;

			{
				var cur_obj = document.getElementById(c._id);
				if(cur_obj != null){
					self._scroll.SmoothScroll(c._id);
				}
			}
		}
	};

	this.PlayEndCallback = function(){
		console.log('Play end callback');
		self._flow_control_cur_cell = 0;
		self.CleanSheet();
	};

	this.OnInstrumentLoaded = function(cnt, tot){
		//console.log(cnt + '/' + tot);
		$('#id_player_progress').html(cnt + '/' + tot);
		if(cnt >= tot){
			self.OnLoadingDone();
		}
	};

	this.UpdateTempo = function(){
		$('#id_text_bpm').text(self._music._default_tempo);
	};

	this.DisplayChords = function(){
		var chords_ele = $('#chords');
		for(var c=0 ; c<self._musicXMLPlayer._chord_arr.length ; c++){
			var chord = self._musicXMLPlayer._chord_arr[c];
			var ele_span = $('<div class="col cm_chord_display"></div>');
			ele_span.text(chord);
			var ele_chord_disp = self._chordManager.GetChordDisplay(chord, false);
			ele_span.append(ele_chord_disp);
			chords_ele.append(ele_span);
		}
	};

	this.DisplayTitle = function(){
		var title_ele = $('title');
		var org_title = title_ele.text();
		title_ele.text(self._music._identification._title + ' - ' + self._music._identification._artist + org_title);

		var desc_ele = $('#id_meta_desc');
		var org_desc = desc_ele.attr('content');
		desc_ele.attr('content', self._music._identification._title + ', ' + self._music._identification._artist + ', ' + org_desc);

		var keywords_ele = $('#id_meta_keywords');
		var org_keywords = keywords_ele.attr('content');
		keywords_ele.attr('content', self._music._identification._title + ', ' + self._music._identification._artist + ', ' + org_keywords);

		$('#id_meta_og_title').attr('content', self._music._identification._title + ' - ' + self._music._identification._artist + org_title);
		$('#id_meta_og_description').attr('content', self._music._identification._title + ', ' + self._music._identification._artist + ', ' + org_desc);

		$('#id_text_title').text(self._music._identification._title);
		if(self._music._identification._artist == ''){
			$('#id_singer').hide();
		}else{
			$('#id_singer').text(self._music._identification._artist);
		}

		if(self._music._identification._lyricist == '' && self._music._identification._arranger == ''){
			$('#id_words_by').hide();
			$('#id_music_by').hide();
			$('#id_words_music_by').hide();
		}else{
			if(self._music._identification._lyricist && self._music._identification._arranger){
				$('#id_words_by').hide();
				$('#id_music_by').hide();
				$('#id_words_music_by').text('Words and Music ' + self._music._identification._lyricist);
			}else{
				$('#id_words_by').text('Words ' + self._music._identification._lyricist);
				$('#id_music_by').text('Music ' + self._music._identification._arranger);
				$('#id_words_music_by').hide();
			}
		}
	};

	this.OnClickMeasure = function(){
		var measure_sequence = this.id.split('-')[1];
		if(measure_sequence == self._selected_measure_seq){
			$('#id_measure_selected-'+self._selected_measure_seq).empty();
			self._selected_measure_seq = -1;
		}else{
			if(self._selected_measure_seq != -1){
				$('#id_measure_selected-'+self._selected_measure_seq).empty();
			}
			var i_ele = $('<i class="fas fa-arrow-alt-circle-right"></i>');
			console.log('measure_sequence ' + measure_sequence);
			$('#id_measure_selected-'+measure_sequence).append(i_ele);
			self._selected_measure_seq = measure_sequence;
		}

		if(self._musicXMLPlayer._player_state == PLAYER_STATE.PLAY){
			self.Stop();
			self.Play();
		}
	};

	this._chord_show_arr = [];
	this.OnClickChord = function(){
		//console.log('this.id ' + this.id);
		var chord_text = this.id.split('-')[1];

		for(var c=0 ; c<self._chord_show_arr.length ; c++){
			if(self._chord_show_arr[c] == chord_text){
				var id = 'id_chord_show-' + self._chord_show_arr[c];
				var chord_show_eles = $('[id="' + id + '"]');
				chord_show_eles.empty();
				self._chord_show_arr.splice(c, 1);
				return;
			}
		}

		self._chord_show_arr.push(chord_text);

		for(var c=0 ; c<self._chord_show_arr.length ; c++) {
			var ele_span = $('<div class="col cm_chord_display"></div>');
			var ele_chord_disp = self._chordManager.GetChordDisplay(self._chord_show_arr[c], true);
			ele_span.append(ele_chord_disp);

			var id = 'id_chord_show-' + self._chord_show_arr[c];
			var chord_show_eles = $('[id="' + id + '"]');
			chord_show_eles.empty();
			chord_show_eles.append(ele_span);
		}
	};

	this.DisplaySheet = function(){
		var sheet_ele = $('#sheet');
		var debug = false;

		var part_index = 0;//fix for first part.
		var part = self._music._part_arr[part_index];

		var measure_repeat_arr = [];
		for(var m=0 ; m<part._measure_arr.length ; m++){
			measure_repeat_arr[m] = 0;
		}

		for(var ms=0 ; ms<self._music._measure_play_sequence.length ; ms++){
			if(debug) console.log('measure sequence ' + ms);
			var measure_index = self._music._measure_play_sequence[ms];
			measure_repeat_arr[measure_index]++;
			var measure = part._measure_arr[measure_index];
			if(debug) console.log('mesaure index ' + new Number(measure_index + 1))

			var measure_ele = $('<div class="col outter_ele"></div>');
			measure_ele.attr('id', 'id_measure_sequence-'+ms);
			sheet_ele.append(measure_ele);

			if(debug) console.log('measure._divisions ' + measure._divisions);
			if(debug) console.log('measure._beats ' + measure._beats);
			if(debug) console.log('measure._beat_type ' + measure._beat_type);
			var cell_count = measure._beats / (measure._beat_type / (4 * measure._divisions));
			if(debug) console.log('cell_count ' + cell_count);

			var chord_cell_arr = [];
			var lyrics_cell_arr = [];
			for(var c=0 ; c<cell_count ; c++){
				chord_cell_arr.push(null);
				lyrics_cell_arr.push(null);
			}

			//모으기
			var c = 0;

			for(var n=0 ; n<measure._chord_arr.length ; n++){
				chord_cell_arr[n] = measure._chord_arr[n];
			}

			for(var n=0 ; n<measure._note_arr.length ; n++){
				var note = measure._note_arr[n];
				if(note._backup){
					c -= note._duration;
					continue;
				}
				if(note._chord){
					c -= note._duration;
				}

				{
					if(debug) console.log('lyrics length ' + note._lyric_arr.length);
					//반복 회수가 가사 array 크기 보다 작거나 같으면 array의 index로 사용
					//반복 회수가 가사 array 크기 보다 크면 -> 가사 array의 마지막 것을 사용.
					if(note._lyric_arr.length > 0){
						if(measure_repeat_arr[measure_index] <= note._lyric_arr.length){
							var lyric_arr_index = measure_repeat_arr[measure_index] - 1;
							lyrics_cell_arr[c] = note._lyric_arr[lyric_arr_index]._text;
						}else{
							var lyric_arr_index = note._lyric_arr.length - 1;
							lyrics_cell_arr[c] = note._lyric_arr[lyric_arr_index]._text;
						}
					}
				}

				c += note._duration;
			}

			//여기에서 그리기.
			{
				var table_ele = $('<table class="measure_table"></table>');
				measure_ele.append(table_ele);

				var tr_reheasal_ele = $('<tr></tr>');
				table_ele.append(tr_reheasal_ele);

				var tr_chord_ele = $('<tr></tr>');
				table_ele.append(tr_chord_ele);

				var tr_info_ele = $('<tr></tr>');
				table_ele.append(tr_info_ele);

				var tr_lyric_ele = $('<tr class="tr_lyric"></tr>');
				tr_lyric_ele.attr('id', 'id_tr_lyric-'+ms);
				tr_lyric_ele.on('click', self.OnClickMeasure);
				table_ele.append(tr_lyric_ele);

				var tr_flow_ele = $('<tr></tr>');
				table_ele.append(tr_flow_ele);

				//reheasal 표시
				{
					var td = $('<td class="td_reheasal"></td>');
					td.attr('colspan', cell_count);
					if(measure._reheasal != null){
						td.text(measure._reheasal);
					}
					tr_reheasal_ele.append(td);
				}

				//info 표시하기
				{
					var td = $('<td class="td_chord"></td>');
					td.attr('colspan', cell_count);
					var measure_sequence_ele = $('<span class="measure_sequence">' + new Number(ms+1) + '</span>');
					td.append(measure_sequence_ele);
					var measure_selected_ele = $('<span></span>');
					measure_selected_ele.attr('id', 'id_measure_selected-'+ms);
					td.append(measure_selected_ele);
					tr_info_ele.append(td);
				}

				//코드 표현하기
				for(var c=0 ; c<cell_count ; c++){
					var td = $('<td class="td_chord"></td>');
					tr_chord_ele.append(td);

					if(chord_cell_arr[c] != null && chord_cell_arr[c] != undefined){
						var chord_text_ele = $('<div></div>');
						chord_text_ele.text(chord_cell_arr[c]);
						td.append(chord_text_ele);
					}

					var span = 1;
					for(var c1=c+1 ; c1<cell_count ; c1++){
						if(chord_cell_arr[c1] == null || chord_cell_arr[c1] == undefined){
							span++;
						}else{
							break;
						}
					}
					if(span > 1){
						td.attr('colspan', span);
						c += span-1;
					}
				}

				//가사 표현하기.
				for(var c=0 ; c<cell_count ; c++){
					if(c == 0){
						var td = $('<td class="td_lyrics">&nbsp;&nbsp;</td>');
						tr_lyric_ele.append(td);

						if(lyrics_cell_arr[c] != null){
							td.text(lyrics_cell_arr[c]);
							if(debug) console.log('c ' + c + ' ' + lyrics_cell_arr[c]);
						}

						var span = 1;
						for(var c1=c+1 ; c1<cell_count ; c1++){
							if(lyrics_cell_arr[c1] != null){
								break;
							}
							span++;
						}
						if(span > 1){
							td.attr('colspan', span);
							c = new Number(c-1) + new Number(span-1);
						}
					}else{
						if(lyrics_cell_arr[c] != null){
							var td = $('<td class="td_lyrics"></td>');
							tr_lyric_ele.append(td);
							if(debug) console.log('c ' + c + ' ' + lyrics_cell_arr[c]);
							td.text(lyrics_cell_arr[c]);

							var span = 1;
							for(var c1=c+1 ; c1<cell_count ; c1++){
								if(lyrics_cell_arr[c1] != null){
									break;
								}
								span++;
							}
							if(debug) console.log('span ' + span);
							if(span > 1){
								td.attr('colspan', span);
								c = new Number(c) + new Number(span-1);
							}
						}
					}
				}

				//control flow 표현하기.
				var measure_time_offset = self._musicXMLPlayer.GetMeasureTimeOffset(ms);
				var measure_duration = self._musicXMLPlayer.GetMeasureSequenceDuration(ms);
				var cell_duration = measure_duration / cell_count;
				var flow_cell_span = parseInt(cell_count) / parseInt(measure._beats);
				if(debug) console.log('flow_cell_span ' + flow_cell_span);

				for(var c=0 ; c<cell_count ; c++){
					var id = 'id_fc_' + ms + '_' + c;
					var offset = measure_time_offset + (cell_duration * c);
					self._flow_control_cell_list.push({
						'_id':id,
						'_offset':offset
					});
					//console.log(c + ' ' + self._flow_control_cell_list.length + ' ' + offset);

					var td_flow_ele = $('<td class="td_flow">.....................</td>');
					tr_flow_ele.append(td_flow_ele);
					td_flow_ele.attr('id', id);
					if(flow_cell_span > 1){
						td_flow_ele.attr('colspan', flow_cell_span);
						c = new Number(c-1) + flow_cell_span;
					}else if(flow_cell_span == '0.5'){

					}
				}
			}
		}
	};

	this.UpdateFlowControlCellList = function(){
		self._flow_control_cell_list = [];
		for(var ms=0 ; ms<self._music._measure_play_sequence.length ; ms++) {
			var measure_index = self._music._measure_play_sequence[ms];
			var measure = self._music._part_arr[0]._measure_arr[measure_index];
			var cell_count = measure._beat_type * measure._divisions;

			var measure_time_offset = self._musicXMLPlayer.GetMeasureTimeOffset(ms);
			var measure_duration = self._musicXMLPlayer.GetMeasureSequenceDuration(ms);
			var cell_duration = measure_duration / cell_count;

			for(var c=0 ; c<cell_count ; c++){
				var id = 'id_fc_' + ms + '_' + c;
				var offset = measure_time_offset + (cell_duration * c);
				self._flow_control_cell_list.push({
					'_id':id,
					'_offset':offset
				});

				if(measure._divisions > 1){
					c = new Number(c-1) + new Number(measure._divisions);
				}
			}
		}
	};

	this.CleanSheet = function(){
		for(var i=0 ; i<self._flow_control_cell_list.length ; i++){
			$('#' + self._flow_control_cell_list[i]._id).removeClass('td_flow_pass');
		}
	};
};