function GetURLParam(name){
	var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
	if (results==null) {
		return null;
	}
	return decodeURI(results[1]) || 0;
};

function DateYMD(date_str){
	var ret = date_str.split('T')[0];
	return ret;
}

function GetSheetItem(sheet){
	var region = '';
	if(sheet.region_type == 'POP_SONG'){
		region = 'pop';
	}else{
		region = 'kpop';
	}

	var first_char = sheet.artist_name.charAt(0);
	var link_sheet = `/chord_lyrics_sheet/${region}/${sheet.release_year}/chord_lyrics_sheet-${sheet.artist_name}-${sheet.title}.htm?id=${sheet.sheet_uid}`;
	var link_artist = `/artist/${first_char}/artist-${sheet.artist_name}-${sheet.artist_uid}.htm?artist_uid=${sheet.artist_uid}`;

	var h = `
	<div class="col-sm-2 col-6 py-2">
		<a href="${link_sheet}"><img style="width:100%; height:auto;" src="https://img.youtube.com/vi/${sheet.video_id}/0.jpg"></a>
		<div>
			<a href="${link_sheet}">${sheet.title}</a>
		</div>
		<div style="font-size:0.8em; color:#777777">
			<a href="${link_artist}">${sheet.artist_name}</a>
		</div>
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
	return h;
}