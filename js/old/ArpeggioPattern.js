const ARPEGGIO_PATTERN_NONE = 0;
const ARPEGGIO_PATTERN_SAME = 1;

const ARPEGGIO_PATTERNS = [
// Waltz /////////////////////////////////////////////////////
	{
		_key:10001,
		_quarter:3,
		_divide:4,
		_picks:[
			[0,0,0,0,1,0,0,0,1,0,0,0],
			[0,0,0,0,1,0,0,0,1,0,0,0],
			[0,0,0,0,1,0,0,0,1,0,0,0],
			[1,0,0,0,0,0,0,0,0,0,0,0]
		]
	},
	{
		_key:10002,
		_quarter:3,
		_divide:4,
		_picks:[
			[0,0,0,0,1,0,0,0,1,0,0,0],
			[0,0,0,0,1,0,0,0,1,0,0,0],
			[0,0,1,0,0,0,1,0,0,0,1,0],
			[1,0,0,0,0,0,0,0,0,0,0,0]
		]
	},
	{
		_key:10003,
		_quarter:3,
		_divide:4,
		_picks:[
			[0,0,0,0,0,0,1,0,0,0,0,0],
			[0,0,0,0,1,0,0,0,1,0,0,0],
			[0,0,1,0,0,0,0,0,0,0,1,0],
			[1,0,0,0,0,0,0,0,0,0,0,0]
		]
	},
// Slow Rock /////////////////////////////////////////////////////
	{
		_key:10101,
		_quarter:4,
		_divide:3,
		_picks:[
			[0,0,0,1,0,0,0,0,0,1,0,0],
			[0,0,1,0,1,0,0,0,1,0,1,0],
			[0,1,0,0,0,1,0,1,0,0,0,1],
			[1,0,0,0,0,0,1,0,0,0,0,0]
		]
	},
	{
		_key:10102,
		_quarter:4,
		_divide:3,
		_picks:[
			[0,0,0,1,0,0,1,0,0,1,0,0],
			[0,0,1,0,1,0,0,1,0,0,1,0],
			[0,1,0,0,0,1,0,0,1,0,0,1],
			[1,0,0,0,0,0,0,0,0,0,0,0]
		]
	},
//////////////////////////////////////////////////////
	{
		_key:10201,
		_quarter:4,
		_divide:4,
		_picks:[
			[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
			[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
			[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
			[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0]
		]
	},
	{
		_key:10202,
		_quarter:4,
		_divide:4,
		_picks:[
			[0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
			[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
			[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
			[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
		]
	},
];

function ARPEGGIO_GetPatternList(quarter, divide){
	//console.log('quarter ' + quarter);
	//console.log('divide ' + divide);
	var list = [];
	for(var i = 0 ; i < ARPEGGIO_PATTERNS.length ; i++){
		if(ARPEGGIO_PATTERNS[i]._quarter == quarter &&
			ARPEGGIO_PATTERNS[i]._divide == divide){
			list.push(ARPEGGIO_PATTERNS[i]);
		}
	}
	return list;
};

function ARPEGGIO_GetPicks(key){
	for(var i = 0 ; i < ARPEGGIO_PATTERNS.length ; i++){
		if(ARPEGGIO_PATTERNS[i]._key == key){
			return ARPEGGIO_PATTERNS[i]._picks;
		}
	}
	return null;
};

function ARPEGGIO_GetTabs(measureID){
	var tabs = [[],[],[],[],[],[]];
	var key = _song._guitar._tabPattern4M[measureID];
	if(key == ARPEGGIO_PATTERN_SAME){
		for(var m = measureID ; m >= 0 ; m--){
			if(_song._guitar._tabPattern4M[m] != null &&
				_song._guitar._tabPattern4M[m] != ARPEGGIO_PATTERN_SAME){
				key = _song._guitar._tabPattern4M[m];
				break;
			}
		}
	}
	var picks = ARPEGGIO_GetPicks(key);

	var note_count_per_measure = _songHandle.GetNoteCountOfMeasure(measureID);
	//var offset = _songHandle.GetNoteOffset(_maestroMain._curBarID);

	var chords = [];
	var prev_chord = null;
	var chord_info = null;
	for(var n = 0 ; n < note_count_per_measure ; n++){
		var new_offset = (note_count_per_measure * measureID) + new Number(n);
		if(_song._guitar._chords[new_offset] != null){
			chords[n] = _song._guitar._chords[new_offset];
			prev_chord = _song._guitar._chords[new_offset]
		}else{
			if(prev_chord == null){
				for(var back = new_offset ; back >= 0 ; back--){
					if(_song._guitar._chords[back] != null){
						prev_chord = _song._guitar._chords[back];
						break;
					}
				}
			}
			chords[n] = prev_chord;
		}

		if(chords[n] != null){
			//console.log('chords[n] ' + chords[n]);
			chord_info = GetChordInfo(chords[n], CHORD_MODE.GUITAR);
			//console.log('chord_info ' + chord_info.stringFrets);

			if(chord_info != null){
				if(picks[0][n] == 1){
					tabs[0][n] = chord_info.stringFrets[5];
				}
				if(picks[1][n] == 1){
					tabs[1][n] = chord_info.stringFrets[4];
				}
				if(picks[2][n] == 1){
					tabs[2][n] = chord_info.stringFrets[3];
				}
				if(picks[3][n] == 1){
					var tab_base_idx = 5 - chord_info.base;
					tabs[tab_base_idx][n] = chord_info.stringFrets[chord_info.base];
				}
			}
		}
	}
	//console.log(tabs);

	return tabs;
};