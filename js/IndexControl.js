$(document).ready(function () {
	window._indexControl = new IndexControl();
	_indexControl.Init();
});

function IndexControl(){
	var self = this;
	this._song_list = [];
	this._list_mode = null;

	this.Init = function(){
		self.ComponentHandle();
		self.GetSheetMusicList(1);
	};

	this.ComponentHandle = function (){
		$('#id_btn_search').on('click', self.OnSearchClicked);
		$('#id_btn_logout').on('click', self.OnClickLogout);
		$('#id_btn_make').on('click', self.OnBtnMakeClicked);
		$('#id_btn_mine').on('click', self.OnBtnMineClicked);
		$('#id_btn_favorite').on('click', self.OnBtnFavoriteClicked);
	};

	this.OnBtnFavoriteClicked = function(){
		self._list_mode = 'favorite';
		self.GetSheetMusicList(1);
	};

	this.OnBtnMineClicked = function(){
		self._list_mode = 'mine';
		self.GetSheetMusicList(1);
	};

	this.OnBtnMakeClicked = function(){
		var url = './chord_editor.html';
		var win = window.open(url, '_blank');
		if (win) {
			win.focus();
		}
	};

	this.OnBtnEditClicked = function() {
		var url = './chord_editor.html?ID='+this.id;
		var win = window.open(url, '_blank');
		if (win) {
			win.focus();
		}
	};

	this.OnPageClicked = function(){
		var page = this.id.split('-')[1];
		self.GetSheetMusicList(page);
	};

	this.OnSearchClicked = function(){
		self.GetSheetMusicList(1);
	};

	this.GetSheetMusicList = function(page) {
		var search_type = $('#id_search_select').val();
		var keyword = $('#id_text_keyword').val();
		var m = self._list_mode;
		// var url = '/sheet_music_api/get_list?m='+m+'&page='+page+'&search_type='+search_type+'&keyword='+keyword;
		// $.get(url, null, function(result) {
		// 	if(result.ok) {
		// 		console.log('result.total ' + result.total);
		// 		self._song_list = result.list;
		// 		self.DisplaySongList(self._song_list, result.is_mine);
		// 		self.DisplayPage(page, result.total);
		// 	}
		// });
	};

	this.GetDateString = function (input){
		var date_str = input.split('T')[0];

		var arr = date_str.split('-');
		var y = arr[0];
		var m = arr[1];
		var d = arr[2];
		var new_date_str = y.substr(2,2) + '/' + m + '/' + d;

		return new_date_str;
	};

	this.DisplaySongList = function(song_list, is_mine){
		var ele_song_list = $('#id_song_list');
		ele_song_list.empty();

		for(var i = 0 ; i < song_list.length ; i++){
			var song = song_list[i];

			var tr = $('<tr class="link"></tr>');
			tr.attr('id', song.ID);
			tr.on('click', self.OpenChordPlayer);
			ele_song_list.append(tr);

			var td_title = $('<td>' + song.title + '</td>');
			tr.append(td_title);
			if(is_mine){
				var ele_edit = $('<i class="fas fa-edit" style="cursor: pointer"></i>');
				ele_edit.attr('id', song_list[i].ID);
				ele_edit.on('click', self.OnBtnEditClicked);
				td_title.append($('<span> &nbsp; </span>'));
				td_title.append(ele_edit);
			}

			var td_singer = $('<td>' + song.singer + '</td>');
			tr.append(td_singer);

			var td_date = $('<td></td>');
			td_date.text(self.GetDateString(song.created_time));
			tr.append(td_date);

			var td_user = $('<td>' + song.name + '</td>');
			tr.append(td_user);

			var td_hit = $('<td>' + song.hit + '</td>');
			tr.append(td_hit);
		}
	};

	this.OpenChordPlayer = function(){
		console.log('id ' + this.id);
		var url = '/ChordPlayer.html?ID='+this.id;
		var win = window.open(url, '_blank');
		if (win) {
			win.focus();
		}
	};

	this.DisplayPage = function(page, total){
		var ele_page = $('#id_page');
		ele_page.empty();

		var total_pages = Math.ceil(total / 10);
		console.log('total_pages ' + total_pages);

		var start_page = (Math.floor((page-1) / 10) * 10) + 1;
		var end_page = start_page + 9;
		console.log('start_page ' + start_page);
		console.log('end_page ' + end_page);

		if(end_page > total_pages){
			end_page = total_pages;
			console.log('end_page ' + end_page);
		}

		var ele_page = $('#id_page');
		ele_page.empty();

		if(start_page > 10){
			var ele_item = $( '<span class="page_link"> < </span> ');
			ele_item.on('click', function(){
				var prev = start_page - 1;
				self.GetSheetMusicList(prev);
			});
			ele_page.append(ele_item);
		}

		for(var i=start_page ; i<=end_page ; i++){
			var ele_item = null;
			if(page == i){
				ele_item = $( '<span class="page_cur"> ' + i + ' </span> ');
			}else{
				ele_item = $( '<span class="page_link"> ' + i + ' </span> ');
				ele_item.attr('id', 'id_page-' + i);
				ele_item.on('click', self.OnPageClicked);
			}
			ele_page.append(ele_item);
		}

		if(end_page < total_pages){
			var ele_item = $( '<span class="page_link"> > </span> ');
			ele_item.on('click', function(){
				var next = end_page + 1;
				self.GetSheetMusicList(next);
			});
			ele_page.append(ele_item);
		}
	};
};




