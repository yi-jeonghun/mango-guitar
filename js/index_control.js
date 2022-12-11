$('document').ready(function(){
	window._index_control = new IndexControl().Init();
});

function IndexControl(){
	var self = this;
	this._sheet_list = null;

	this.Init = function(){
		self.LoadList();
		return this;
	};

	this.LoadList = function(){
		$.getJSON('db/sheet_list.json', function(sheet_list) {
			// console.log('sheet_list ' + JSON.stringify(sheet_list));
			self._sheet_list = sheet_list;
			self.DISP_SheetList();
		});
	};

	this.DISP_SheetList = function(){
		var h = `
		`;

		var count = 12;
		self._sheet_list.length;
		if(self._sheet_list.length > 12){
			count = 12;
		}else{
			count = self._sheet_list.length;
		}

		for(var i=0 ; i<count ; i++){
			var sheet = self._sheet_list[i];
			h += GetSheetItem(sheet);
		}

		$('#id_div_list').html(h);
	};
}