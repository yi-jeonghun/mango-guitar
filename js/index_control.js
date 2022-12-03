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
			var link = `./chord_lyrics_sheet.html?id=${sheet.sheet_uid}_${sheet.artist_name}-${sheet.title}`;

			h += `
			<div class="col-2 py-2">
				<a href="${link}"><img style="width:100%; height:auto;" src="https://img.youtube.com/vi/${sheet.video_id}/0.jpg"></a>
				<div>
					<a href="${link}">${sheet.title}</a>
				</div>
				<div>${sheet.artist_name}</div>
				<div class="d-flex">
					<div class="container-fluid mx-0 px-0">
						<div class="row">
							<div class="col-4 " style="font-size:0.8em">(${sheet.release_year})</div>
							<div class="col-8 text-right" style="font-size:0.8em">${DateYMD(sheet.date_created)}</div>
						</div>
					</div>
				</div>
			</div>
			`;
		}

		$('#id_div_list').html(h);
	};
}