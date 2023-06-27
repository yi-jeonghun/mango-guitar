$('document').ready(function(){
	window._music_list_control = new MusicListControl().Init();
});

function MusicListControl(){
	var self = this;
	this._sheet_list = null;
	this._cur_page = 0;
	this._count_per_page = 24;
	this._era = 'all';
	this._region = 'all';

	this.Init = function(){
		var era = GetURLParam('era');
		if(era == null){
			self._era = 'all';
		}else{
			self._era = era;
		}

		var region = GetURLParam('region');
		if(region == null){
			self._region = region;
		}else{
			self._region = region;
		}

		var page = GetURLParam('page');
		if(page == null){
			self._cur_page = 0;
		}else{
			self._cur_page = page - 1;
		}

		console.debug('era ' + self._era);
		console.debug('region ' + self._region);
		console.debug('cur_page ' + self._cur_page);
		self.LoadList();
		self.FocusEraRegionButton();
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
			console.debug(JSON.stringify(sheet_list[0]));
			self._sheet_list = [];

			if(self._region == 'all'){
				self._sheet_list = sheet_list;
			}else if(self._region == 'pop'){
				for(var i=0 ; i<sheet_list.length ; i++){
					if(sheet_list[i].region_type == 'POP_SONG'){
						self._sheet_list.push(sheet_list[i]);
					}
				}
			}else if(self._region == 'kpop'){
				for(var i=0 ; i<sheet_list.length ; i++){
					if(sheet_list[i].region_type == 'KPOP'){
						self._sheet_list.push(sheet_list[i]);
					}
				}
			}
			self.DISP_paging();
			self.DISP_SheetList();
		});
	};

	this.GoToEra = function(era){
		window.location.href = `./music_list.html?era=${era}&region=${self._region}`;
	};
	this.GoToRegion = function(region){
		window.location.href = `./music_list.html?era=${self._era}&region=${region}`;
	};

	this.MoveToPage = function(page){
		console.debug('page ' + page);
		window.location.href = `./music_list.html?era=${self._era}&region=${self._region}&page=${page}`;
	};

	this.FocusEraRegionButton = function(){
		console.debug('self._era ' + self._era);
		console.debug('self._region ' + self._region);
		$(`#id_btn_era-${self._era}`).addClass('btn-primary');
		$(`#id_btn_region-${self._region}`).addClass('btn-primary');
	};

	this.DISP_paging = function(){
		console.log('len ' + this._sheet_list.length);
		var page_count = Math.ceil(this._sheet_list.length / self._count_per_page) ;
		console.log('page_count ' + page_count);

		var h = '';
		for(var i=0 ; i<page_count ; i++){
			console.log('i ' + i);
			var on_click = `window._music_list_control.MoveToPage(${i+1})`;
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