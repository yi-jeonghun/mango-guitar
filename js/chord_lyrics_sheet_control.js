$('document').ready(function(){
	window._chord_lyrics_sheet_control = new ChordLyricsSheetControl().Init();
});

function ChordLyricsSheetControl(){
	var self = this;
	this._sheet = null;
	this._chordDB = null;
	this._sheet_scroll_top = 0;
	this._chord_scroll_top = 0;
	this._chordManager = null;
	this._speed = 1.0;
	this._chord_chart = [];

	this.Init = function(){
		self._chordManager = new ChordManager();
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
		$('#id_btn_speed_plus').on('click', function(){
			if(self._speed == 1.5){
				return;
			}
			self._speed = new Number(self._speed) + new Number(0.1);
			self._speed = self._speed.toFixed(1);
			$('#id_label_speed').html(self._speed);
			window._mango_player.ChangeSpeed(self._speed);
		});
		$('#id_btn_speed_minus').on('click', function(){
			if(self._speed == 0.5){
				return;
			}
			self._speed = new Number(self._speed) - new Number(0.1);
			self._speed = self._speed.toFixed(1);
			$('#id_label_speed').html(self._speed);
			window._mango_player.ChangeSpeed(self._speed);
		});
		$('#id_btn_reload').on('click', function(){
			self.Preview();
			$('#id_sheet').scrollTop(0);
			$('#id_div_chord_flow').scrollTop(0);
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
			self.ClearChordSync();
			window._mango_player.Stop();		
		});
		$('#id_nav_chord_flow').on('click', self.SwitchChordFlow);
		$('#id_nav_chord_chart').on('click', self.SwitchChordChart);

		{
			const sheet_scroller = document.querySelector("#id_sheet");
			sheet_scroller.addEventListener("scroll", (event) => {
				self._sheet_scroll_top = sheet_scroller.scrollTop;
			});			
		}

		{
			const chord_scroller = document.querySelector("#id_div_chord_flow");
			chord_scroller.addEventListener("scroll", (event) => {
				self._chord_scroll_top = chord_scroller.scrollTop;
			});
		}

		document.fonts.onloadingdone = function (fontFaceSetEvent) {
			// alert('onloadingdone we have ' + fontFaceSetEvent.fontfaces.length + ' font faces loaded');
			for(var i=0 ; i<fontFaceSetEvent.fontfaces.length ; i++){
				console.log('font ' + JSON.stringify(fontFaceSetEvent.fontfaces[i]));
			}
			self.Preview();
		};
	};

	this.LoadSheet = function(sheet_uid){
		$.getJSON(`db/chord_lyrics_sheet/${sheet_uid}.json`, function(sheet) {
			self._sheet = sheet;
			self._sheet.chord_list = JSON.parse(self._sheet.chord_list);
			if(self._sheet.capo > 0){
				for(var i=0 ; i<self._sheet.chord_list.length ; i++){
					for(var c=self._sheet.capo ; c>0 ; c--){
						self._sheet.chord_list[i].chord = self._chordDB.Transpose(self._sheet.chord_list[i].chord, 'down');
					}
				}
			}

			self._chord_chart = [];
			for(var i=0 ; i<self._sheet.chord_list.length ; i++){
				var chord = self._sheet.chord_list[i].chord;
				var found = false;
				for(var g=0 ; g<self._chord_chart.length ; g++){
					if(self._chord_chart[g] == chord){
						found = true;
						break;
					}
				}
				if(found == false){
					self._chord_chart.push(chord);
				}
			}

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
				// window._mango_player.ChangeSpeed(self._speed);
				window._mango_player.__yt_player._player.width = 50;
				window._mango_player.__yt_player._player.height = 50;
				clearInterval(interval_id);
			}else{
				console.log('youtube not ready ');
			}
		}, 500);
	};

	this.DISP_Sheet = function(){
		$('#id_title').html(`${self._sheet.artist_name} - ${self._sheet.title} @ mango-guitar.com`)
		$('#id_description').attr('content', `${self._sheet.artist_name} ${self._sheet.title} Guitar Chord, Ukulele Chord. Play or practice guitar along youtube video. Adjust speed, transpose chords`)
		$('#id_keyword').attr('content', `${self._sheet.artist_name}, ${self._sheet.title}, guitar, guitar chord, ukulele, ukelele chord, chord, chords, chord sheet, sheet music, score, easy chord, lyrics, youtube sync, 기타, 통기타, 기타 악보, 기타 코드, 코드 악보, 기타 코드 악보, 쉬운 기타 악보, 쉬운 기타 코드`)

		$('#id_label_title').html(self._sheet.title);
		$('#id_label_artist').html(self._sheet.artist_name);
		if(self._sheet.capo > 0){
			$('#id_label_capo').html(`Capo : ${self._sheet.capo}`);
		}
		self.Preview();
	};

	this.IsOverflowLine = function(width, line){
		var ret = {
			is_overflow: false,
			split1: '',
			split2: '',
			position: -1
		};
		var line_width = 0;

		for(var c=0 ; c<line.length ; c++) {
			line_width += 8;
			// console.log(line[c] + ' line_width ' + line_width);
			if(line_width >= width){
				ret.is_overflow = true;
				if(line[c] == ' '){
					ret.position = c;	
				}else{
					for(var r=c-1 ; r>=0 ; r--){
						if(line[r] == ' '){
							ret.position = r;
							break;
						}
					}
				}
				break;
			}
		}

		if(ret.is_overflow == true){
			ret.split1 = line.substr(0, ret.position);
			ret.split1 = ret.split1.trimRight();
			ret.split2 = line.substr(ret.position);
			ret.split2 = ret.split2.trimRight();
		}

		return ret;
	};

	this._chord_sync_index = 0;
	this._overflow_lines = [];
	this.Preview = function(){
		self._overflow_lines = [];
		var sheet_ele = $('#id_sheet');
		var width = sheet_ele.width();
		console.log('sheet_ele width ' + width);

		self._chord_sync_index = 0;
		var txt = self._sheet.lyrics_chord;
		var htm = '';
		var lines_temp = txt.split('\n');
		var lines = [];

		/* transpose */
		for(var i=0 ; i<lines_temp.length ; i++) {
			// console.log('before transpose ' + lines_temp[i]);
			lines_temp[i] = self.TransposeLine(lines_temp[i]);
			// console.log('after transpose ' + lines_temp[i]);
		}

		/* Overflow 처리하기 */
		for(var i=0 ; i<lines_temp.length ; i++) {
			var line = lines_temp[i];

			if(i == lines_temp.length - 2){
				// 마지막 2번째 줄 까지만 처리함.
				break;
			}
			if(i >= lines_temp.length-1){
				break;
			}

			// console.log('line idx ' + i);
			var first_chord_line = self.IsChordLine(lines_temp[i]);
			var second_chord_line = self.IsChordLine(lines_temp[i+1]);
			// console.log('first_chord_line ' + first_chord_line);
			// console.log('second_chord_line ' + second_chord_line);

			// 첫 줄은 코드 둘째 줄은 가사 쌍인 경우만 처리
			// 그 외는 overflow가 잘 없기 때문.
			if(first_chord_line == true && second_chord_line == false){
				var ret_1st = self.IsOverflowLine(width, lines_temp[i]);
				var ret_2nd = self.IsOverflowLine(width, lines_temp[i+1]);
				if(ret_1st.is_overflow == false && ret_2nd.is_overflow == false){
					lines.push(lines_temp[i]);
					lines.push(lines_temp[i+1]);
				}else if(ret_1st.is_overflow == true && ret_2nd.is_overflow == false){
					self._overflow_lines[lines.length] = 'start';
					if(ret_1st.split1 != ''){
						lines.push(ret_1st.split1);
					}
					lines.push(lines_temp[i+1]);
					if(ret_1st.split2 != ''){
						lines.push(ret_1st.split2);
					}
					self._overflow_lines[lines.length-1] = 'end';
				}else if(ret_1st.is_overflow == false && ret_2nd.is_overflow == true){
					self._overflow_lines[lines.length] = 'start';
					lines.push(lines_temp[i]);
					lines.push(ret_2nd.split1);
					if(ret_2nd.split2 != ''){
						lines.push(ret_2nd.split2);
					}
					self._overflow_lines[lines.length-1] = 'end';
				}else if(ret_1st.is_overflow == true && ret_2nd.is_overflow == true){
					self._overflow_lines[lines.length] = 'start';
					console.log('lines.length ' + lines.length + ' ' + self._overflow_lines[lines.length]);
					lines.push(ret_1st.split1);
					lines.push(ret_2nd.split1);

					var padding_1st = 0;
					var padding_2nd = 0;
					if(ret_1st.position == ret_2nd.position){
						paddind_1st = 0;
						padding_2nd = 0;	
					}else if(ret_1st.position > ret_2nd.position){
						padding_1st = ret_1st.position - ret_2nd.position;
					}else if(ret_1st.position < ret_2nd.position){
						padding_2nd = ret_2nd.position - ret_1st.position;
					}

					if(ret_1st.split2 != ''){
						var tmp = '';
						for(var p=0 ; p<padding_1st ; p++){
							tmp += ' ';
						}
						lines.push(tmp + ret_1st.split2);
					}
					if(ret_2nd.split2 != ''){
						var tmp = '';
						for(var p=0 ; p<padding_2nd ; p++){
							tmp += ' ';
						}
						lines.push(tmp + ret_2nd.split2);
					}
					self._overflow_lines[lines.length-1] = 'end';
					console.log('lines.length ' + lines.length + ' ' + self._overflow_lines[lines.length]);
				}
				i = i + 1;
			}else{
				var ret_1st = self.IsOverflowLine(width, lines_temp[i]);
				if(ret_1st.is_overflow){
					self._overflow_lines[lines.length] = 'start';
					lines.push(ret_1st.split1);
					lines.push(ret_1st.split2);
					self._overflow_lines[lines.length-1] = 'end';
				}else{
					lines.push(line);
				}
			}
		}
		
		/* 라인 별로 보여주기 */
		for(var i=0 ; i<lines.length ; i++) {
			var line = lines[i];

			line = self.ParseLineBold(line);
			line = line.replace(/\s/g, '`');
			line = self.ParseLineChord(line);
			// line = self.ConvertChosung(line);

			line = '<span id="id_line-' + i + '">' + line + '</span>';

			// console.log('self._overflow_lines[i] ' + self._overflow_lines[i]);
			if(self._overflow_lines[i] == 'start'){
				htm += '<div style="background-color:#eeeeee">';
			}
			htm += line;
			if(self._overflow_lines[i] == 'end'){
				htm += '</div>';
			}

			htm += "<br>";
			// htm += line;
		}
		htm += "<br>";

		// console.log('self._chord_sync_index ' + self._chord_sync_index);

		self._total_lines = i;

		var sheet_ele = $('#id_sheet');
		sheet_ele.empty();
		sheet_ele.html(htm);

		self.SetChordPositionList();
		self.DISP_SubBeat();
		self.DISP_ChordFlow();
		self.DISP_ChordChart();
	};

	this._cho = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
	this. ConvertChosung = function(str){
		var result = "";
		for(i=0 ; i<str.length ; i++){
			var code = str.charCodeAt(i) - 44032;
			if(code >- 1 && code < 11172){
				result += self._cho[Math.floor(code/588)];
			}
			else{
				result += str.charAt(i);
			}
		}
		return result;
	}

	this.IsChordLine = function(line){
		line = line.replace(/\s/g, '`');
		// console.log('line ' + line);
		var chars = line.split(/`/g);
		for(var c=0 ; c<chars.length ; c++){
			if(chars[c] == ""){
				
			}else{
				// console.log('chars[c]) ' + chars[c]);
				if(self._chordDB.HasChord(chars[c])){
					return true;
				}else{
					
				}
			}
		}
		return false;
	};

	this.TransposeLine = function(line){
		// console.log('capo ' + self._sheet.capo + ' transpose before ' + line);
		line = line.replace(/\s/g, '`');
		var chars = line.split(/`/g);
		var h = '';
		for(var c=0 ; c<chars.length ; c++){
			if(chars[c] == ""){
				h += ' ';
			}else{
				if(self._chordDB.HasChord(chars[c])){
					var chord_txt = chars[c];
					if(self._sheet.capo > 0){
						for(var t=self._sheet.capo ; t>0 ; t--){
							chord_txt = self._chordDB.Transpose(chord_txt, 'down');
						}
					}
					h += chord_txt + ' ';
				}else{
					h += chars[c] + ' ';
				}
			}
		}
		// console.log('transpose after ' + h);

		return h;
	};

	this.ParseLineChord = function(line){
		var chars = line.split(/`/g);
		var h = '';
		for(var c=0 ; c<chars.length ; c++){
			if(chars[c] == ""){
				h += '&nbsp;';
			}else{
				if(self._chordDB.HasChord(chars[c])){
					var chord_txt = chars[c];
					// if(self._sheet.capo > 0){
					// 	for(var t=self._sheet.capo ; t>0 ; t--){
					// 		chord_txt = self._chordDB.Transpose(chord_txt, 'down');
					// 	}
					// }
					h += `<span id="id_chord_sync-${self._chord_sync_index}" class="chord-sm" onmousedown="PlayChord('${chord_txt}')">${chord_txt}</span>&nbsp;`;
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
				$(`#id_chord_beat-${b}`).css('color', 'black');
			}

			$(`#id_chord_flow-${i}`).css('visibility', 'visible');
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
					$(`#id_chord_beat-${b}`).css('color', 'white');
					self._flow_sync_beat_index++;
					break;
				}
			}
		}

		//Update Chord Flow
		{
			var nav_bar_height = 45;
			var synced_index = -1;
			for(var i=self._flow_sync_chord_index ; i<self._sheet.chord_list.length ; i++){
				var chord = self._sheet.chord_list[i];
				if(self._timelapse >= chord.time_ms){
					//Hide chord preview
					{
						var ele = $(`#id_chord_flow-${i}`);

						$(`#id_chord_flow-${i-1}`).css('visibility', 'hidden');
						
						console.log(`ele.position().top ${ele.position().top + self._chord_scroll_top}  self._chord_scroll_top ${self._chord_scroll_top}`);
						$(`#id_div_chord_flow`).animate({
							scrollTop: ele.position().top + self._chord_scroll_top - nav_bar_height
						}, 300);
					}

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
				}, 300);
			}	
		}

		//Update Chord Chart
		{
			//음악 진행에 맞춰서 chord chart에서도 현재 코드를 highlight 하려고 했는데
			//별로 필요가 없을 듯 하여 우선은 작업하지 않음.
		}
	};

	this._chord_position_list = [];
	this.SetChordPositionList = function(){
		self._chord_position_list = [];
		console.log('self._sheet.chord_list length ' + self._sheet.chord_list.length);
		for(var i=0 ; i<self._sheet.chord_list.length ; i++){
			var ele = $('#id_chord_sync-'+i);
			var pos = ele.position();
			self._chord_position_list[i] = {
				left: pos.left,
				top: pos.top + self._sheet_scroll_top
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
				h += `<i style="" id="id_beat-${beat_index}">.</i>`;
				self._beat_list.push(self._sheet.chord_list[i].time_ms_arr[b]);
				beat_index++;
			}

			$(`<span style="position:absolute; left:${pos.left}px; top:${pos.top+5}px;font-size:0.8em">${h}</span>`).insertAfter(ele);
		}
	};

	this.DISP_ChordFlow = function(){
		var parent_ele = $('#id_div_chord_flow');
		parent_ele.empty();

		var beat_index = 0;
		for(var i=0 ; i<self._sheet.chord_list.length ; i++){
			var chord_txt = self._sheet.chord_list[i].chord;

			var h = ``;
			for(var b=0 ; b<self._sheet.chord_list[i].time_ms_arr.length ; b++){
				h += `<i id="id_chord_beat-${beat_index}">.</i>`;
				beat_index++;
			}

			var div_ele = $(`<div class="col-3" style="margin-bottom:20px" id="id_chord_flow-${i}"></div>`);

			var chord_ele = self._chordManager.GetChordDisplay(chord_txt, false);
			chord_ele.on('mousedown', self.PlayChord);
			chord_ele.attr('chord', chord_txt);
			chord_ele.attr('index', i);

			div_ele.append(`<div class="text-center">${chord_txt} ${h}</div>`)
			div_ele.append(chord_ele);

			parent_ele.append(div_ele);
		}
	};

	this.DISP_ChordChart = function(){
		var parent_ele = $('#id_div_chord_chart');
		parent_ele.empty();

		for(var g=0 ; g<self._chord_chart.length ; g++){
			var chord_txt = self._chord_chart[g];
			var div_ele = $(`<div class="col-3" style="margin-bottom:20px"></div>`);

			var chord_ele = self._chordManager.GetChordDisplay(chord_txt, false);
			chord_ele.on('mousedown', self.PlayChord);
			chord_ele.attr('chord', chord_txt);
			chord_ele.attr('index', g);

			div_ele.append(`<div class="text-center" id="id_div_chord_chart-${g}">${chord_txt}</div>`)
			div_ele.append(chord_ele);

			parent_ele.append(div_ele);

			// console.log(chord_chart[g]);
		}
	};

	this.SwitchChordChart = function(){
		self.SwitchChordChartAndFlow('chart');
	};
	this.SwitchChordFlow = function(){
		self.SwitchChordChartAndFlow('flow');
	};

	this.SwitchChordChartAndFlow = function(type){
		$('#id_nav_chord_flow').removeClass('active');
		$('#id_nav_chord_chart').removeClass('active');

		if(type == 'chart'){
			$('#id_nav_chord_chart').addClass('active');
			$('#id_div_chord_chart').show();
			$('#id_div_chord_flow').hide();
		}else if(type == 'flow'){
			$('#id_nav_chord_flow').addClass('active');
			$('#id_div_chord_flow').show();
			$('#id_div_chord_chart').hide();
		}
	};
}