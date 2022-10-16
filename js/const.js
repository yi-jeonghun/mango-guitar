const SCALE = {
	C: 0,
	Db: 1,
	D: 2,
	Eb: 3,
	E: 4,
	F: 5,
	Gb: 6,
	G: 7,
	Ab: 8,
	A: 9,
	Bb: 10,
	B: 11
};

const OCTAVE = 12;

const GUITAR_6th = SCALE.E + OCTAVE * 3;
const GUITAR_5th = SCALE.A + OCTAVE * 3;
const GUITAR_4th = SCALE.D + OCTAVE * 4;
const GUITAR_3rd = SCALE.G + OCTAVE * 4;
const GUITAR_2nd = SCALE.B + OCTAVE * 4;
const GUITAR_1st = SCALE.E + OCTAVE * 5;

//const DEFAULT_GUITAR = '0240_Aspirin_sf2_file';
//const DEFAULT_GUITAR = '0240_SBLive_sf2';
const DEFAULT_GUITAR = '0243_JCLive_sf2_file';

const DEFAULT_READY_STICK = '12842_0_Chaos_sf2_file.js';

/* Sheet */
const SheetType = {
	Player:0,
	Maestro:1
};

const GUITAR_STROKE = {
	U: 0,//up
	D: 1,//down
	S: 2 //snap
};

const MERGED = '_';
const DEFAULT_MEASURE_COUNT = 4;

/* Table */
const TABLE_MODE = {
	INSTRUMENT:0,
	DRUM:1
};

const QUARTER_DIVIDE = {
	_34 : 0,
	_43 : 1,
	_44 : 2,
	_24 : 3
};

const MUSIC_TYPE = {
	MAESTRO : 1,
	CHORD_GP : 2,
	CHORD_TXT : 3
};

function MusicSimpleInfo(){
	this.type = 0;
	this.singer = '';
	this.title = '';
}