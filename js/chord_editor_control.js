$(document).ready(function () {
	window._chord_editor = new ChordEditorControl();
	_chord_editor.Init();
});

function PlayChord(chord){
	_chord_editor.PlayChord1(chord);
}

function ChordEditorControl(){
	var self = this;
	this._chordManager = null;
	this._musicXMLPlayer = null;
	this._chord_list = [];
	this._font_size = 16;
	this._line_number = 0;
	this._total_lines = 0;
	this._ID = null;
	this._title_org = null;
	this._singer_org = null;

	this.Init = function(){
		self._musicXMLPlayer = new MusicXMLPlayer(null, null, null);
		self._musicXMLPlayer.Init();
		self._musicXMLPlayer.LoadInstruments();
		self._chordManager = new ChordManager().Init();

		var ID = self.GetURLParam('ID');
		self._ID = ID;
		if(ID != null){
			self.LoadChord();
		}

		self.InitComponentHandle();
		self.InitKeyHandle();
	};

	this.GetURLParam = function(name){
		var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
		if (results==null) {
			return null;
		}
		return decodeURI(results[1]) || 0;
	};

	this.InitComponentHandle = function(){
		$('#id_chord_textarea').bind('input', self.OnChangeTextarea);
		$('#id_save_btn').on('click', self.OnSaveClick);
		$('#id_update_btn').on('click', self.OnUpdateClick);
		$('#id_delete_btn').on('click', self.OnDeleteClick);

		$('#id_font_size_plus_btn').on('click', self.OnButtonFontSizePlus);
		$('#id_font_size_minus_btn').on('click', self.OnButtonFontSizeMinus);
		self.RefreshButtons();
	};

	this.RefreshButtons = function(){
		console.log('ID ' + self._ID);
		if(self._ID == null){
			$('#id_save_btn').show();
			$('#id_update_btn').hide();
			$('#id_delete_btn').hide();
		}else{
			$('#id_save_btn').hide();
			$('#id_update_btn').show();
			$('#id_delete_btn').show();
		}
	};

	this.GetLineNumber = function(){
		var textarea = document.getElementById('id_chord_textarea');
		var content = textarea.value;
		var textLines = content.substr(0, textarea.selectionStart).split("\n");
		self._line_number = textLines.length-1;
	};

	this.InitKeyHandle = function(){
		$(document).keydown(function (e) {
			switch (e.which) {
				case 37://arrow left
				case 38://up
				case 39://arrow right
				case 40://down
					self.HighLightLine();
					break;
			}
		});
	};

	this.OnButtonFontSizePlus = function(){
		console.log('self._font_size ' + self._font_size);
		self._font_size++;
		self.UpdateFontSize();
	};

	this.OnButtonFontSizeMinus = function(){
		console.log('self._font_size ' + self._font_size);
		if(self._font_size > 5)
			self._font_size--;
		self.UpdateFontSize();
	};

	this.UpdateFontSize = function(){
		$('#id_font_size').text(self._font_size);
		$('#id_sheet').css("font-size", self._font_size+'px');
		$('#id_chord_textarea').css("font-size", self._font_size+'px');
		self.Parse();
	};

	this.OnDeleteClick = function(){
		if(confirm('삭제하시겠어요?') == false){
			return;
		}

		var url = '/sheet_music_api/sheet_music?ID='+self._ID;
		$.ajax({
			url:url,
			type:'DELETE',
			success:function(res){
				if(res.ok){
					alert('삭제되었어요.');
					window.close();
				}else{
					if(res.err == 'no permission'){
						alert('권한이 없네요.');
					}
				}
			}
		});
	};

	this.LoadChord = function(){
		var url = '/sheet_music_api/sheet_music?ID='+self._ID;
		$.get(url, null, function(data){
			if(data.ok){
				self.LoadNewSong(data.data);
			}
		});
	};

	this.GetDateString = function(timestamp){
		var date = new Date(timestamp);
		var date_str = date.toISOString();
		date_str = date_str.replace('T', ' ');
		date_str = date_str.replace('Z', ' ');
		return date_str;
	};

	this.LoadNewSong = function(song){
		self._title_org = song.title;
		self._singer_org = song.singer;

		var title_ele = $('#id_title_text');
		var singer_ele = $('#id_singer_text');
		var textarea_ele = $('#id_chord_textarea');
		var date_ele = $('#id_date_text');
		var capo_ele = $('#id_select_capo');
		title_ele.val('');
		singer_ele.val('');
		textarea_ele.val('');
		date_ele.text('');
		title_ele.val(song.title);
		singer_ele.val(song.singer);
		textarea_ele.val(song.content);
		date_ele.text(song.created_time);
		capo_ele.val(song.capo);
		self._font_size = song.font_size;
		self.UpdateFontSize();

		self.Parse();
	};

	this.GetDataForm = function(){
		var title = $('#id_title_text').val();
		title = title.trim();
		$('#id_title_text').val(title);

		var singer = $('#id_singer_text').val();
		singer = singer.trim();
		$('#id_singer_text').val(singer);

		if(title == ''){
			alert('Title을 입력해 주십시오.');
			return null;
		}
		if(singer == ''){
			alert('Singer를 입력해 주십시오.');
			return null;
		}

		return {
			title:title,
			singer:singer,
			font_size:self._font_size,
			capo:$('#id_select_capo').val(),
			content:$('#id_chord_textarea').val()
		};
	};

	this.OnSaveClick = function(){
		if(window._auth_control._user_info == null){
			alert('로그인 해 주십시오.');
			return;
		}

		var data = self.GetDataForm();
		if(data == null)
			return;

		self.CheckDuplicatedTitleAndSinger(data.title, data.singer, function(is_duplicated){
			if(is_duplicated){
				alert('이미 등록된 title, singer');
				return;
			}
			$.ajax({
				url:'/sheet_music_api/register',
				type:"POST",
				data:JSON.stringify(data),
				contentType:"application/json; charset=utf-8",
				dataType:"json",
				success: function(res){
					if(res.ok){
						self._ID = res.ID;
						$('#id_date_text').text(res.created_time);
						self._title_org = data.title;
						self._singer_org = data.singer;
						self.RefreshButtons();
					}else{
						console.log('fail');
					}
				}
			});//$.ajax({
		});//self.CheckDuplicatedTitleAndSinger
	};

	this.OnUpdateClick = function(){
		var data = self.GetDataForm();
		if(data == null)
			return;

		data.ID = self._ID;

		self.CheckDuplicatedTitleAndSinger(data.title, data.singer, function(is_duplicated) {
			if (is_duplicated) {
				alert('이미 등록된 title, singer');
				return;
			}
			$.ajax({
				url:'/sheet_music_api/update',
				type:"POST",
				data:JSON.stringify(data),
				contentType:"application/json; charset=utf-8",
				dataType:"json",
				success: function(res){
					console.log(res);
					if(res.ok){
						$('#id_date_text').text(res.created_time);
						self._title_org = data.title;
						self._singer_org = data.singer;
					}else{
						if(res.err == 'no permission'){
							alert('권한이 없네요!');
						}
					}
				}
			});//$.ajax({
		});//self.CheckDuplicatedTitleAndSinger
	};

	this.CheckDuplicatedTitleAndSinger = function(title, singer, callback){
		//Update 모드인 경우
		if(self._ID != null){
			if(self._title_org == title && self._singer_org == singer){
				if(callback){
					callback(false);
					return;
				}
			}
		}

		var data = {
			title:title,
			singer:singer
		};
		$.ajax({
			url:'/sheet_music_api/is_duplicated',
			type:"POST",
			data:JSON.stringify(data),
			contentType:"application/json; charset=utf-8",
			dataType:"json",
			success: function(res){
				if(res.ok){
					if(callback)
						callback(res.is_duplicated);
				}else{
					console.log('fail');
				}
			}
		});
	};

	this.OnChangeTextarea = function(){
		console.log('d');
		self.Parse();
		self.HighLightLine();
	};

	this.HighLightLine = function(){
		self.GetLineNumber();
		for(var i=0 ; i<self._total_lines ; i++){
			var line_ele = $('#id_line-'+i);
			line_ele.removeClass('line_highlight');
		}
		var id = '#id_line-'+self._line_number;
		//console.log('id ' + id);
		var line_ele = $(id);
		line_ele.addClass('line_highlight');
	};

	this.PlayChord1 = function(chord){
		self._musicXMLPlayer.PlayChord(chord, 0, 20);
	};

	this.Parse = function(){
		self._chord_list = [];
		var txt = $('#id_chord_textarea').val();
		var htm = '';
		var lines = txt.split('\n');

		for(var i=0 ; i<lines.length ; i++) {
			var line = lines[i];
			line = self.ParseLineBold(line);
			line = line.replace(/\s/g, '`');
			//line = self.ParseLineStep1(line);
			line = self.ParseLineStep2(line);

			line = '<span id="id_line-' + i + '">' + line + '</span>';
			line += "<br>";
			htm += line;
		}
		self._total_lines = i;

		var sheet_ele = $('#id_sheet');
		sheet_ele.empty();
		sheet_ele.html(htm);

		self.DisplayChordList();
	};

	this.DisplayChordList = function(){
		var sheet_ele = $('#id_sheet');
		var scrollTop = sheet_ele.scrollTop();

		for(var c=0 ; c<self._chord_list.length ; c++){
			var chord_txt = self._chord_list[c];
			var center = false;
			if(chord_txt.charAt(0) == '.'){
				chord_txt = chord_txt.substr(1);
				center = true;
			}

			var chord_float_ele = null;
			if(self._chordManager.HasChord(chord_txt)){
				chord_float_ele = $('<div onmousedown="PlayChord(\'' + chord_txt + '\')"></div>');
			}else{
				chord_float_ele = $('<div></div>');
			}
			chord_float_ele.addClass('chord-float');
			chord_float_ele.addClass('chord-sm');
			chord_float_ele.text(chord_txt);
			sheet_ele.append(chord_float_ele);

			//position
			{
				var parent_ele = $('#id_chord-'+c);
				var position = parent_ele.position();
				var top = position.top - chord_float_ele.height() + scrollTop;
				var left = position.left;
				if(center){
					left = position.left - ( chord_float_ele.width() / 2);
				}
				chord_float_ele.css({top:top, left:left});
			}
		}
	};

	this.ParseLineStep1 = function(line){
		var htm = '';
		var between = false;
		var chord = '';
		for(var i=0 ; i<line.length ; i++){
			var char = line.charAt(i);
			if(char == '['){
				between = true;
			}else if(char == ']'){
				between = false;
				var id = 'id_chord-' + self._chord_list.length;
				var span = '<span id="' + id + '"></span>';
				self._chord_list.push(chord);
				chord = '';
				htm += span;
			}else{
				if(between){
					chord += char;
				}else{
					htm += char;
				}
			}
		}
		return htm;
	};

	this.ParseLineStep2 = function(line){
		var chars = line.split(/`/g);
		var htm = '';
		for(var c=0 ; c<chars.length ; c++){
			if(chars[c] == ""){
				htm += '&nbsp;';
			}else{
				if(self._chordManager.HasChord(chars[c])){
					htm += '<span class="chord-sm" onmousedown="PlayChord(\'' + chars[c] + '\')">' + chars[c] + '</span>' + '&nbsp;';
				}else{
					htm += chars[c] + '&nbsp;';
				}
			}
		}
		return htm;
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
			console.log(bold.start_pos + ' ' + bold.end_pos);

			var start1 = line.substr(0, bold.start_pos);
			var start2 = line.substr(bold.end_pos+1);
			var content = line.substr(bold.start_pos, bold.end_pos+1);
			console.log('start1 ' + start1);
			console.log('content ' + content);
			//content = content.replace(/\s*/g, '');
			content = content.split('*').join('');
			console.log('start2 ' + start2);

			line = start1 + '<h5><b>' + content + '</b></h5>' + start2;
		}
		//console.log(line);
		return line;
	};
}