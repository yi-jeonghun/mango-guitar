$('document').ready(function(){
	window._artist_control = new ArtistControl().Init();
});

function ArtistControl(){
	var self = this;
	this._artist_uid = null;
	this._name = null;
	this._sheet_list = null;

	this.Init = function(){
		self._artist_uid = GetURLParam('artist_uid');
		self.Load();
		return this;
	};

	this.Load = function(){
		if(self._artist_uid == null){
			return;
		}
		$.getJSON(`db/artists/${self._artist_uid}.json`, function(detail) {
			self._name = detail.name;
			self._sheet_list = detail.sheet_list;

			$('#id_title').html(`${detail.name} @ Mango Guitar`);
			$('#id_description').html(`${detail.name} guitar, ukulele, chords, sheet musics, 기타, 우쿨렐렐, 코드, 코드 악보`);
			$('#id_keyword').html(`${detail.name}, guitar, guitar chords, chords, practice guitar, Guitar Chord Chart, Chord Chart, Chord Table, Chord List`);;

			self.DISP_Detail();
		});
	};

	this.DISP_Detail = function(){
		var h = `
		`;

		$('#id_label_name').html(self._name);

		for(var i=0 ; i<self._sheet_list.length ; i++){
			var sheet = self._sheet_list[i];
			var link = `./chord_lyrics_sheet.html?id=${sheet.sheet_uid}_${sheet.artist_name}-${sheet.title}`;

			h += `
			<div class="col-3 py-2">
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