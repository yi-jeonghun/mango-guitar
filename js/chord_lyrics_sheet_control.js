$('document').ready(function(){
	window._chord_lyrics_sheet_control = new ChordLyricsSheetControl().Init();
});

function ChordLyricsSheetControl(){
	var self = this;
	this._sheet = null;
	this._chordDB = null;

	this.Init = function(){
		var playlist_storage = new PlaylistStorage_Local();
		window._mango_player = new MangoPlayer().Init(playlist_storage, 100, 100);
		window._mango_player.SetFlowEventCallback(self.OnFlowEvent);

		self._chordDB = new ChordDB();
		var id = GetURLParam('id');
		var arr = id.split('_');

		if(arr.length > 0){
			var sheet_uid = arr[0];
			self.LoadSheet(sheet_uid);
		}

		self.InitHandle();
		self.Update();
		return this;
	};

	this.InitHandle = function(){
		$('#id_btn_reload').on('click', function(){
			self.Preview();
		});
		$('#id_btn_play').on('click', function(){
			self.Preview();
			self.ClearChordSync();
			self._flow_sync_chord_index = 0;
			self._flow_sync_beat_index = 0;
			self._timelapse = 0;
			self._timelapse_youtube = 0;
			window._mango_player.Play();
		});
		$('#id_btn_stop').on('click', function(){
			self._timelapse = 0;
			self._timelapse_youtube = 0;
			self._flow_sync_chord_index = 0;
					// self.ClearChordSync();
			window._mango_player.Stop();		
		});
	};

	this.LoadSheet = function(sheet_uid){
		$.getJSON(`db/chord_lyrics_sheet/${sheet_uid}.json`, function(sheet) {
			self._sheet = sheet;
			self._sheet.chord_list = JSON.parse(self._sheet.chord_list);
			self.DISP_Sheet();
			self.LoadVideo();
		});
	};

	this.LoadVideo = function(){
		var interval_id = setInterval(function(){
			if(window._mango_player._is_youtube_api_ready){
				window._mango_player.TryMusic({
					video_id:self._sheet.video_id
				});
				window._mango_player.__yt_player._player.width = 50;
				window._mango_player.__yt_player._player.height = 50;
				clearInterval(interval_id);
			}else{
				console.log('youtube not ready ');
			}
		}, 500);
	};

	this.DISP_Sheet = function(){
		$('#id_label_title').html(self._sheet.title);
		$('#id_label_artist').html(self._sheet.artist_name);
		self.Preview();
	};

	this._chord_sync_index = 0;
	this.Preview = function(){
		self._chord_sync_index = 0;
		var txt = self._sheet.lyrics_chord;
		var htm = '';
		var lines = txt.split('\n');

		for(var i=0 ; i<lines.length ; i++) {
			var line = lines[i];
			line = self.ParseLineBold(line);
			line = line.replace(/\s/g, '`');
			line = self.ParseLineChord(line);

			line = '<span id="id_line-' + i + '">' + line + '</span>';
			line += "<br>";
			htm += line;
		}
		self._total_lines = i;

		var sheet_ele = $('#id_sheet');
		sheet_ele.empty();
		sheet_ele.html(htm);

		self.SetChordPositionList();
		self.DISP_SubBeat();
	};

	this.ParseLineChord = function(line){
		var chars = line.split(/`/g);
		var h = '';
		for(var c=0 ; c<chars.length ; c++){
			if(chars[c] == ""){
				h += '&nbsp;';
			}else{
				if(self._chordDB.HasChord(chars[c])){
					h += `<span id="id_chord_sync-${self._chord_sync_index}" class="chord-sm" onmousedown="PlayChord('${chars[c]}')">${chars[c]}</span>&nbsp;`;
					self._chord_sync_index++;
				}else{
					h += chars[c] + '&nbsp;';
				}
			}
		}

		return h;
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

			var start1 = line.substr(0, bold.start_pos);
			var start2 = line.substr(bold.end_pos+1);
			var content = line.substr(bold.start_pos, bold.end_pos+1);
			content = content.replace(/\s*/g, '');
			content = content.split('*').join('');

			line = start1 + '<h5><b>' + content + '</b></h5>' + start2;
		}
		return line;
	};

	this.OnFlowEvent = function(ms){
		self._timelapse_youtube = ms;
	};

	this.ClearChordSync = function(){
		for(var i=0 ; i<self._sheet.chord_list.length ; i++){
			$('#id_chord_sync-'+i).css('color', 'black');

			for(var b=0 ; b<self._beat_list.length ; b++){
				$(`#id_beat-${b}`).css('color', 'black');
			}
		}
	};

	this._delta = 0;
	this._tick = 0;
	this._timelapse = 0;
	this._timelapse_youtube = 0;
	this.Update = function () {
		{
			var now = Date.now();
			self._delta = now - self._tick;
			self._tick = now;
			// console.log('delta ' + self._delta);
		}

		if(window._mango_player.IsPlaying() == true){
			self._timelapse += self._delta;
			// console.log('self._timelapse ' + self._timelapse);
			self._timelapse_youtube += self._delta;

			//youtube와 시간차 보정
			{
				if(self._timelapse > self._timelapse_youtube){
					var diff = self._timelapse - self._timelapse_youtube;
					self._timelapse -= parseInt(diff / 10);
				}else if(self._timelapse < self._timelapse_youtube){
					var diff = self._timelapse_youtube - self._timelapse;
					self._timelapse += parseInt(diff / 10);
				}
			}

			// if(self._is_stop == false){
				self.UpdateChordSync();
			// }	
		}

		requestAnimationFrame(self.Update);
	};

	this._flow_sync_chord_index = 0;
	this._flow_sync_beat_index = 0;
	this.UpdateChordSync = function(){
		//Update Beat
		{
			for(var b=self._flow_sync_beat_index ; b<self._beat_list.length ; b++){
				if(self._timelapse >= self._beat_list[b]){
					// console.log('beat sync ' + self._flow_sync_chord_index + '-' + b);
					$(`#id_beat-${b}`).css('color', 'white');
					self._flow_sync_beat_index++;
					break;
				}
			}
		}

		//Update Chord
		{
			var synced_index = -1;
			for(var i=self._flow_sync_chord_index ; i<self._sheet.chord_list.length ; i++){
				var chord = self._sheet.chord_list[i];
				if(self._timelapse >= chord.time_ms){
					self._flow_sync_chord_index = i+1;
					synced_index = i;
					break;
				}
			}
	
			if(synced_index != -1){
				var ele = $('#id_chord_sync-'+synced_index);
				ele.css('color', 'red');
	
				$(`#id_sheet`).animate({
					scrollTop: self._chord_position_list[synced_index].top - 10
				}, 1500);
			}	
		}
	};

	this._chord_position_list = [];
	this.SetChordPositionList = function(){
		self._chord_position_list = [];
		for(var i=0 ; i<self._sheet.chord_list.length ; i++){
			var ele = $('#id_chord_sync-'+i);
			var pos = ele.position();
			self._chord_position_list[i] = {
				left: pos.left,
				top: pos.top
			};
		}
	};

	this._beat_list = [];
	this.DISP_SubBeat = function(){
		self._beat_list = [];

		var beat_index = 0;
		for(var i=0 ; i<self._sheet.chord_list.length ; i++){
			var ele = $('#id_chord_sync-'+i);
			var pos = self._chord_position_list[i];

			var h = ``;
			for(var b=0 ; b<self._sheet.chord_list[i].time_ms_arr.length ; b++){
				h += `<i style="z-index:1" id="id_beat-${beat_index}">.</i>`;
				self._beat_list.push(self._sheet.chord_list[i].time_ms_arr[b]);
				beat_index++;
			}

			$(`<span style="z-index:2; position:absolute; left:${pos.left}px; top:${pos.top+5}px;font-size:0.8em">${h}</span>`).insertAfter(ele);
		}
	};
}