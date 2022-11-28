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
		<div class="row">
			<div class="col-2 border"></div>
			<div class="col-2 border">Artist</div>
			<div class="col-4 border">Title</div>
			<div class="col-2 border">Year</div>
			<div class="col-2 border">Date</div>
		</div>
		`;

		for(var i=0 ; i<self._sheet_list.length ; i++){
			var sheet = self._sheet_list[i];
			var link = `./chord_lyrics_sheet.html?id=${sheet.sheet_uid}_${sheet.artist_name}-${sheet.title}`;
			h += `
			<div class="row border">
				<div class="col-2 border">
					<a href="${link}">
					<image style="width:100px; height:auto" src="https://img.youtube.com/vi/${sheet.video_id}/0.jpg"></image>
					</a>
				</div>
				<div class="col-2 border">
					<a href="${link}">${sheet.artist_name}</a>
				</div>
				<div class="col-4 border">
					<a href="${link}">${sheet.title}</a>
				</div>
				<div class="col-2 border">
					${sheet.release_year}
				</div>
				<div class="col-2 border ">${sheet.date_created}</div>
			</div>
			`;
		}

		$('#id_div_list').html(h);
	};
}