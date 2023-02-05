$('document').ready(function(){
	window._index_control = new IndexControl().Init();
});

function IndexControl(){
	var self = this;
	this._sheet_list = null;
	this._sheet_list_kpop = [];
	this._sheet_list_pop = [];

	this.Init = function(){
		self.LoadList();
		return this;
	};

	this.LoadList = function(){
		var count = 12;
		$.getJSON('db/sheet_list.json', function(sheet_list) {
			for(var i=0 ; i<sheet_list.length ; i++){
				var sheet = sheet_list[i];
				if(sheet.region_type == 'POP_SONG'){
					if(self._sheet_list_pop.length < count){
						self._sheet_list_pop.push(sheet);
					}
				}else if(sheet.region_type == 'KPOP'){
					if(self._sheet_list_kpop.length < count){
						self._sheet_list_kpop.push(sheet);
					}
				}

				if(self._sheet_list_kpop.length >= count && self._sheet_list_pop.length >= count){
					break;
				}
			}
			self.DISP_SheetList();
		});
	};

	this.DISP_SheetList = function(){
		var h = ``;

		for(var i=0 ; i<self._sheet_list_pop.length ; i++){
			var sheet = self._sheet_list_pop[i];
			h += GetSheetItem(sheet);
		}

		$('#id_div_pop_list').html(h);

		h = ``;

		for(var i=0 ; i<self._sheet_list_kpop.length ; i++){
			var sheet = self._sheet_list_kpop[i];
			h += GetSheetItem(sheet);
		}

		$('#id_div_kpop_list').html(h);

	};
}