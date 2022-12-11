$(document).ready(function () {
	new GuitarChordChartControl().Init();
});

function GuitarChordChartControl(){
	var self = this;
	this._chordDB = null;
	this._chordManager = null;
	this._musicXMLPlayer = null;
	this._selected_root = '';
	this._selected_chord = '';

	this.Init = function(){
		self._chordDB = new ChordDB();
		self._musicXMLPlayer = new MusicXMLPlayer(null, null, null);
		self._musicXMLPlayer.Init();
		self._musicXMLPlayer.LoadInstruments();
		self._chordManager = new ChordManager();
		self.DisplayRootList();

		var chord = self.GetURLParam('chord');
		if(chord != null){
			self.LoadFirstChord(chord);
			self.UpdateMetadata(chord);
		}
	};

	this.UpdateMetadata = function(chord){
		var dec_chord = chord.replace(/z/g, '#');
		dec_chord = dec_chord.replace('x', '/');

		{
			var id_title_str = $('#id_title').text();
			id_title_str = id_title_str.replace('|', '| ' + dec_chord + ' ');
			$('#id_title').text(id_title_str);
		}
		{
			var str = $('#id_description').attr('content');
			str = dec_chord + ' ' + str;
			$('#id_description').attr('content', str);
		}
		{
			var str = $('#id_keywords').attr('content');
			str = dec_chord + ' ' + str;
			$('#id_keywords').attr('content', str);
		}
		{
			var str = $('#id_og_title').attr('content');
			str = str.replace('|', '| ' + dec_chord + ' ');
			$('#id_og_title').attr('content', str);
		}
		{
			var str = $('#id_og_desc').attr('content');
			str = dec_chord + ' ' + str;
			$('#id_og_desc').attr('content', str);
		}
	};

	this.GetURLParam = function(name){
		var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
		if (results==null) {
			return null;
		}
		return decodeURI(results[1]) || 0;
	};

	this.LoadFirstChord = function(chord){
		var dec_chord = chord.replace(/z/g, '#');
		dec_chord = dec_chord.replace('x', '/');

		var root_chord;
		{
			if(dec_chord.startsWith('C#')){
				root_chord = 'C#';
			}else if(dec_chord.startsWith('D#')){
				root_chord = 'D#';
			}else if(dec_chord.startsWith('F#')){
				root_chord = 'F#';
			}else if(dec_chord.startsWith('G#')){
				root_chord = 'G#';
			}else if(dec_chord.startsWith('A#')){
				root_chord = 'A#';
			}else if(dec_chord.startsWith('Db')){
				root_chord = 'Db';
			}else if(dec_chord.startsWith('Eb')){
				root_chord = 'Eb';
			}else if(dec_chord.startsWith('Gb')){
				root_chord = 'Gb';
			}else if(dec_chord.startsWith('Ab')){
				root_chord = 'Ab';
			}else if(dec_chord.startsWith('Bb')){
				root_chord = 'Bb';
			}else if(dec_chord.startsWith('C')) {
				root_chord = 'C';
			}else if(dec_chord.startsWith('D')) {
				root_chord = 'D';
			}else if(dec_chord.startsWith('E')) {
				root_chord = 'E';
			}else if(dec_chord.startsWith('F')) {
				root_chord = 'F';
			}else if(dec_chord.startsWith('G')) {
				root_chord = 'G';
			}else if(dec_chord.startsWith('A')) {
				root_chord = 'A';
			}else if(dec_chord.startsWith('B')) {
				root_chord = 'B';
			}
		}

		console.log('root_chord ' + root_chord);
		self.DisplayTypeList(root_chord);
		self.DisplayChordList(dec_chord);

		var enc_root_chord = root_chord.replace(/#/g, 'z');
		var enc_root_chord = enc_root_chord.replace('x', '/');
		//var enc_chord = chord.replace(/z/g, '#');
		self.ColorRootButton('id_root_btn-'+enc_root_chord);
		self.ColorChordButton('id_chord_btn-'+chord);
	};

	this.DisplayRootList = function(){
		var root_list_ele = $('#id_root_list');
		for(var r=0 ; r<self._chordDB._ROOT_LIST.length ; r++){
			var btn_ele = $('<button type="button" class="btn btn-sm btn-primary root-btn">' + self._chordDB._ROOT_LIST[r] + '</button>');
			var id_str = 'id_root_btn-' + self._chordDB._ROOT_LIST[r];
			id_str = id_str.replace('#', 'z');
			btn_ele.attr('id', id_str);
			btn_ele.on('click', self.OnClickRootChord);
			root_list_ele.append(btn_ele);
		}
	};

	this.ColorRootButton = function(root_id){
		if(self._selected_root == root_id)
			return;

		if(self._selected_root != ''){
			$('#'+self._selected_root).removeClass('btn-secondary');
			$('#'+self._selected_root).addClass('btn-primary');
		}

		$('#'+root_id).removeClass('btn-primary');
		$('#'+root_id).addClass('btn-secondary');

		self._selected_root = root_id;
	};

	this.ColorChordButton = function(chord_id){
		console.log('chord_id ' + chord_id);
		if(self._selected_chord == chord_id)
			return;

		if(self._selected_chord != ''){
			$('#'+self._selected_chord).removeClass('btn-secondary');
			$('#'+self._selected_chord).addClass('btn-primary');
		}
		$('#'+chord_id).removeClass('btn-primary');
		$('#'+chord_id).addClass('btn-secondary');
		self._selected_chord = chord_id;
	};

	this.OnClickRootChord = function(){
		self.ColorRootButton(this.id);

		var chord_root = this.id.split('-')[1];
		chord_root = chord_root.replace('z', '#');
		self.DisplayTypeList(chord_root);

		{
			$('#id_chord_display').empty();
		}

		self.AutoDisplayChordList(chord_root);
	};

	this.DisplayTypeList = function(chord_root){
		var type_list_ele = $('#id_type_list');
		type_list_ele.empty();

		var chord_list_ele = $('#id_chord_list');
		chord_list_ele.empty();

		var chord_list = [];
		for(var t=0 ; t<self._chordDB._TYPE_LIST.length ; t++) {
			var chord = chord_root + self._chordDB._TYPE_LIST[t];
			chord_list.push(chord);
		}

		for(var b=0 ; b<self._chordDB._BASE_LIST.length ; b++){
			if(self._chordDB._BASE_LIST[b].root == chord_root){
				chord_list = chord_list.concat(self._chordDB._BASE_LIST[b].bases);
				break;
			}
		}

		for(var t=0 ; t<chord_list.length ; t++){
			var chord = chord_list[t];
			var btn_ele = $('<button type="button" class="btn btn-sm btn-primary chord-btn">' + chord + '</button>');
			btn_ele.on('click', self.OnClickChord);
			var id_str = 'id_chord_btn-'+chord;
			//id_str = id_str.replace('#', 'z');
			id_str = id_str.replace(/#/g, 'z');
			id_str = id_str.replace('/', 'x');
			btn_ele.attr('id', id_str);
			type_list_ele.append(btn_ele);
		}
	};

	this.OnClickChord = function(){
		console.log('this.id ' + this.id);
		self.ColorChordButton(this.id);

		var chord = this.id.split('-')[1];
		//chord = chord.replace('z', '#');
		chord = chord.replace(/z/g, '#');
		chord = chord.replace('x', '/');
		console.log('chord ' + chord);
		self.DisplayChordList(chord);
	};

	this.AutoDisplayChordList = function(chord){
		console.log('chord ' + chord);
		var new_chord = chord.replace(/#/g, 'z');
		new_chord = new_chord.replace('x', '/');
		self.ColorChordButton('id_chord_btn-' + new_chord);
		self.DisplayChordList(chord);
	};

	this.DisplayChordList = function(chord){
		var chord_display_ele = $('#id_chord_display');
		chord_display_ele.html(chord);

		var chord_list_ele = $('#id_chord_list');
		chord_list_ele.empty();

		var chord_info_list = self._chordDB.GetChordInfoList(chord);
		for(var i=0 ; i<chord_info_list.length ; i++){
			var chord_display_ele = self._chordManager.GetChordDisplayWithChordInfo(chord_info_list[i], false);
			chord_display_ele.on('mousedown', self.PlayChord);
			chord_display_ele.attr('chord', chord);
			chord_display_ele.attr('index', i);
			chord_display_ele.addClass('col-6 col-sm-4 col-md-3 col-lg-2 chord-item pointer');
			chord_list_ele.append(chord_display_ele);
		}
	};

	this.PlayChord = function(){
		var chord = $(this).attr('chord');
		var index = $(this).attr('index');
		//console.log(chord + ' ' + index);

		var chord_list = self._chordDB.GetChordInfoList(chord);
		self._musicXMLPlayer.PlayChordWithChordInfo(chord_list[index], 0.2, 20);
	};
};
