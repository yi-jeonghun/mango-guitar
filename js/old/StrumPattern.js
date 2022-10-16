const STRUM_TYPE = {
	NONE: 0,
	DOWN : 1,
	UP : 11,
	SNAP : 21
};

const D = STRUM_TYPE.DOWN;
const U = STRUM_TYPE.UP;
const n = STRUM_TYPE.NONE;
const S = STRUM_TYPE.SNAP;

const STRUM_PATTERN_NONE = 0;
const STRUM_PATTERN_SAME = 1;
const STRUM_PATTERN_CUSTOM = 2;

const STRUM_PATTERNS = [
// Waltz /////////////////////////////////////////////////////
	{
		_type:'Waltz',
		_key:101,
		_quarter:3,
		_divide:4,
		_strums: [D,n,n,n,D,n,n,n,D,n,n,n],
		_accents:[1,0,0,0,0,0,0,0,0,0,0,0]
	},
	{
		_type:'Waltz',
		_key:102,
		_quarter:3,
		_divide:4,
		_strums: [D,n,n,n,D,n,U,n,D,n,U,n],
		_accents:[1,0,0,0,0,0,0,0,0,0,0,0]
	},
	{
		_type:'Waltz',
		_key:103,
		_quarter:3,
		_divide:4,
		_strums: [D,n,n,n,D,n,U,n,D,n,n,n],
		_accents:[1,0,0,0,0,0,0,0,0,0,0,0]
	},
	{
		_type:'Waltz',
		_key:104,
		_quarter:3,
		_divide:4,
		_strums: [D,n,D,n,D,n,D,n,D,n,D,n],
		_accents:[1,0,0,0,0,0,0,0,0,0,0,0]
	},
// Slow Rock /////////////////////////////////////////////////////
	{
		_type:'Slow Rock',
		_key:201,
		_quarter:4,
		_divide:3,
		_strums: [D,D,D,D,D,D,D,D,D,D,D,D],
		_accents:[0,0,0,1,0,0,0,0,0,1,0,0]
	},
	{
		_type:'Slow Rock',
		_key:202,
		_quarter:4,
		_divide:3,
		_strums: [D,n,D,D,U,D,D,n,D,D,U,D],
		_accents:[0,0,0,1,0,0,0,0,0,1,0,0]
	},
	{
		_type:'Slow Rock',
		_key:203,
		_quarter:4,
		_divide:3,
		_strums: [D,n,n,D,n,U,D,n,n,D,n,U],
		_accents:[0,0,0,1,0,0,0,0,0,1,0,0]
	},
// Simple /////////////////////////////////////////////////////
	{
		_type:'Simple 1',
		_key:290,
		_quarter:4,
		_divide:4,
		_strums: [D,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n],
		_accents:[1,0,0,0,0,0,0,0,n,0,0,0,0,0,0,0]
	},
	{
		_type:'Simple 2',
		_key:291,
		_quarter:4,
		_divide:4,
		_strums: [D,n,n,n,n,n,n,n,D,n,n,n,n,n,n,n],
		_accents:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0]
	},
// Go Go /////////////////////////////////////////////////////
	{
		_type:'Go Go',
		_key:301,
		_quarter:4,
		_divide:4,
		_strums: [D,n,U,n,D,n,U,n,D,n,U,n,D,n,U,n],
		_accents:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]
	},
	{
		_type:'Go Go',
		_key:302,
		_quarter:4,
		_divide:4,
		_strums: [D,n,n,n,D,n,U,n,D,n,U,n,D,n,U,n],
		_accents:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]
	},
// Slow Go Go /////////////////////////////////////////////////////
	{
		_type:'Slow Go Go',
		_key:401,
		_quarter:4,
		_divide:4,
		_strums: [D,n,D,n,D,n,D,n,D,n,D,n,D,n,D,n],
		_accents:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]
	},
	{
		_type:'Slow Go Go',
		_key:402,
		_quarter:4,
		_divide:4,
		_strums: [D,n,D,n,D,n,U,n,D,n,D,n,D,n,U,n],
		_accents:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]
	},
	{
		_type:'Slow Go Go',
		_key:403,
		_quarter:4,
		_divide:4,
		_strums: [D,n,D,n,D,n,D,U,D,n,D,n,D,n,D,U],
		_accents:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]
	},
	{
		_type:'Slow Go Go',
		_key:404,
		_quarter:4,
		_divide:4,
		_strums: [D,n,D,n,D,n,D,U,D,U,D,n,D,n,D,U],
		_accents:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]
	},
// Shuffle /////////////////////////////////////////////////////
	{
		_type:'Shuffle',
		_key:501,
		_quarter:4,
		_divide:4,
		_strums: [D,n,n,U,D,n,n,U,D,n,n,U,D,n,n,U],
		_accents:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]
	},
	{
		_type:'Shuffle',
		_key:502,
		_quarter:4,
		_divide:4,
		_strums: [D,n,n,n,D,n,n,U,D,n,n,U,D,n,n,U],
		_accents:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]
	},
	{
		_type:'Shuffle',
		_key:503,
		_quarter:4,
		_divide:4,
		_strums: [D,n,n,n,D,n,n,U,D,n,n,n,D,n,n,U],
		_accents:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]
	},
// Calypso /////////////////////////////////////////////////////
	{
		_type:'Calypso',
		_key:601,
		_quarter:4,
		_divide:4,
		_strums: [D,n,n,n,D,n,U,n,n,n,U,n,D,n,n,n],
		_accents:[1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0]
	},
	{
		_type:'Calypso',
		_key:602,
		_quarter:4,
		_divide:4,
		_strums: [D,n,n,n,D,n,U,n,n,n,U,n,D,n,U,n],
		_accents:[1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0]
	},
// Soul /////////////////////////////////////////////////////
	{
		_type:'Soul',
		_key:701,
		_quarter:4,
		_divide:4,
		_strums: [D,n,D,n,D,n,n,U,D,U,D,n,D,n,D,n],
		_accents:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]
	},
// Country /////////////////////////////////////////////////////
	{
		_type:'Country',
		_key:801,
		_quarter:4,
		_divide:4,
		_strums: [D,n,n,n,D,n,U,n,D,n,U,n,D,n,n,n],
		_accents:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0]
	},
	{
		_type:'Country',
		_key:802,
		_quarter:4,
		_divide:4,
		_strums: [D,n,n,n,D,n,U,n,D,n,U,n,D,n,U,n],
		_accents:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0]
	},
// Disco /////////////////////////////////////////////////////
	{
		_type:'Disco',
		_key:901,
		_quarter:4,
		_divide:4,
		_strums: [D,n,n,n,D,n,U,n,D,n,n,n,D,n,U,n],
		_accents:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0]
	},
// Polka /////////////////////////////////////////////////////
	{
		_type:'Polka',
		_key:1001,
		_quarter:4,
		_divide:4,
		_strums: [D,n,n,n,D,n,n,n,D,n,n,n,D,n,n,n],
		_accents:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0]
	},
// Trot /////////////////////////////////////////////////////
	{
		_type:'Trot',
		_key:1101,
		_quarter:4,
		_divide:4,
		_strums: [D,n,D,n,D,n,D,n,D,n,D,U,D,n,D,n],
		_accents:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0]
	},
// Rumba /////////////////////////////////////////////////////
	{
		_type:'Rumba',
		_key:1201,
		_quarter:4,
		_divide:4,
		_strums: [D,n,D,U,D,n,D,n,U,n,D,n,D,n,U,n],
		_accents:[1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0]
	},
// Beguine /////////////////////////////////////////////////////
	{
		_type:'Beguine',
		_key:1301,
		_quarter:4,
		_divide:4,
		_strums: [D,n,D,n,n,n,D,n,D,n,D,n,D,n,D,n],
		_accents:[0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0]
	},
];

function STRUM_GetPatternList(quarter, divide){
	var list = [];
	for(var i = 0 ; i < STRUM_PATTERNS.length ; i++){
		if(STRUM_PATTERNS[i]._quarter == quarter &&
			STRUM_PATTERNS[i]._divide == divide){
			list.push(STRUM_PATTERNS[i]);
		}
	}
	return list;
};

function STRUM_GetStrumPatternInfo(key){
	//console.log('key ' + key);
	//console.log('STRUM_PATTERNS.length ' + STRUM_PATTERNS.length);
	for(var i = 0 ; i < STRUM_PATTERNS.length ; i++){
		//console.log('k ' + STRUM_PATTERNS[i]._key);
		if(STRUM_PATTERNS[i]._key == key){
			return STRUM_PATTERNS[i];
		}
	}
	return null;
};

function STRUM_GetPatternDisplay(key){
	//console.log('test ' + key);
	var strum_pattern_info = STRUM_GetStrumPatternInfo(key);

	var ele_div = $('<div></div>');

	var ele_table = $('<table cellspacing="0px" cellpadding="0px"></table>');
	ele_div.append(ele_table);

	var ele_tr = $('<tr></tr>');
	ele_table.append(ele_tr);

	for(var i = 0 ; i < strum_pattern_info._strums.length ; i++){
		var ele_td = $('<td></td>');
		//ele_td.addClass('cell_chord');
		if(i == 0){
			ele_td.addClass('strum_cell_first');
		}else if(i == strum_pattern_info._strums.length-1){
			ele_td.addClass('strum_cell_last');
		}else{
			ele_td.addClass('strum_cell');
		}
		ele_tr.append(ele_td);

		//if (((i + 1) % (_song._quarter * MIN_NOTE_FACTOR)) == 0) {
		//	ele_td.addClass('note_border_measure_split');
		//} else if(((i + 1) % 2) == 0) {
		//	ele_td.addClass('note_border_2_split');
		//} else {
		//	ele_td.addClass('note_border_normal');
		//}

		if(strum_pattern_info._accents[i] == 1){
			ele_td.addClass('strum_accent');
		}

		switch(strum_pattern_info._strums[i]){
			case D:
				ele_td.text('D');
				break;
			case U:
				ele_td.text('U');
				break;
			case S:
				ele_td.text('S');
				break;
		}
	}

	return ele_div;
};
