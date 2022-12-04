$('document').ready(function(){
	window._artist_list_control = new ArtistListControl().Init();
});

function ArtistListControl(){
	var self = this;
	this._artist_list = null;

	this.Init = function(){
		self.LoadList();
		return this;
	};

	this.LoadList = function(){
		$.getJSON('db/artist_list.json', function(artist_list) {
			// console.log('sheet_list ' + JSON.stringify(sheet_list));
			self._artist_list = artist_list;
			self.DISP_ArtistList();
		});
	};

	this.DISP_ArtistList = function(){
		var h = `
		`;

		for(var i=0 ; i<self._artist_list.length ; i++){
			var artist = self._artist_list[i];
			if(artist.sheet_count == 0){
				continue;
			}
			var link = `./artist.html?artist_uid=${artist.artist_uid}&name=${artist.name}`;

			h += `
			<div class="col-4 py-3">
				<a href="${link}">
				${artist.name} (${artist.sheet_count})
				</a>
			</div>			
			`;
		}

		$('#id_div_list').html(h);
	};
}