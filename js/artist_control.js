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
		});
	};
}