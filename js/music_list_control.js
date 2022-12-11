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
		self.LoadList();
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

	this.MoveToPage = function(page){
		console.log('page ' + page);
		self._cur_page = page;
		self.DISP_paging();
		self.DISP_SheetList();
	};

	this.ChangeEra = function(era){
		console.log('era ' + era);
		self._era = era;

		$('#id_btn_era-all').removeClass('btn-primary');
		$('#id_btn_era-1960').removeClass('btn-primary');
		$('#id_btn_era-1970').removeClass('btn-primary');
		$('#id_btn_era-1980').removeClass('btn-primary');
		$('#id_btn_era-1990').removeClass('btn-primary');
		$('#id_btn_era-2000').removeClass('btn-primary');
		$('#id_btn_era-2010').removeClass('btn-primary');

		$(`#id_btn_era-${self._era}`).addClass('btn-primary');

		self.LoadList();
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