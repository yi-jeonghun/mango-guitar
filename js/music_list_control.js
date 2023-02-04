$('document').ready(function(){
	window._music_list_control = new MusicListControl().Init();
});

function MusicListControl(){
	var self = this;
	this._sheet_list = null;
	this._cur_page = 0;
	this._count_per_page = 24;
	this._era = 'all';

	this.Init = function(){
		var era = GetURLParam('era');
		if(era == 'all' || era == null){
			self._era = 'all';
		}else{
			self._era = era;
		}
		console.debug('era ' + self._era);
		self.LoadList();
		self.FocusEraButton();
		return this;
	};

	this.LoadList = function(){
		var json_file = 'db/sheet_list.json';
		if(self._era == 'all'){
			json_file = 'db/sheet_list.json';
		}else{
			json_file = `db/sheet_list_${self._era}.json`;
		}

		$.getJSON(json_file, function(sheet_list) {
			self._sheet_list = sheet_list;
			self.DISP_paging();
			self.DISP_SheetList();
		});
	};

	this.GoToEra = function(era){
		window.location.href = `./music_list.html?era=${era}`;
	};

	this.MoveToPage = function(page){
		console.debug('page ' + page);
		self._cur_page = page;
		self.DISP_paging();
		self.DISP_SheetList();
	};

	this.FocusEraButton = function(){
		console.debug('self._era ' + self._era);
		$(`#id_btn_era-${self._era}`).addClass('btn-primary');
	};

	this.DISP_paging = function(){
		console.log('len ' + this._sheet_list.length);
		var page_count = Math.ceil(this._sheet_list.length / self._count_per_page) ;
		console.log('page_count ' + page_count);

		var h = '';
		for(var i=0 ; i<page_count ; i++){
			console.log('i ' + i);
			var on_click = `window._music_list_control.MoveToPage(${i})`;
			if(self._cur_page == i){
				h += `<span style="padding:5px"><u>&nbsp;<b>${i+1}</b>&nbsp;</u><span>`;
			}else{
				h += `<span style="padding:5px; cursor:pointer" onClick="${on_click}">&nbsp;${i+1}&nbsp;</span>`;
			}
		}
		$('#id_div_page').html(h);
	};

	this.DISP_SheetList = function(){
		var begin_idx = self._cur_page * self._count_per_page;

		var h = '';

		var count = 0;
		for(var i=begin_idx ; i<self._sheet_list.length ; i++){
			count++;
			if(count > self._count_per_page){
				break;
			}

			var sheet = self._sheet_list[i];
			h += GetSheetItem(sheet);
		}

		$('#id_div_list').html(h);
	};
}