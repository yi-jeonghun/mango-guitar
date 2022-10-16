const TIE_TYPE = {
	START:0,
	STOP:1,
	STOP_START:2
};

const SYLLABIC = {
	SINGLE:0,
	BEGIN:1,
	MIDDLE:2,
	END:3
};

const REPEAT = {
	FORWARD:0,
	BACKWARD:1
};

const ENDING_TYPE = {
	START:0,
	STOP:1,
	START_STOP:2
};

function Repeat(){
	this._direction = REPEAT.FORWARD;
	this._times = 2;
};

function Ending(){
	this._type = ENDING_TYPE.START;
	this._number = 1;
};

function Identification(){
	this._title = '';
	this._artist = '';
	this._lyricist = '';
	this._arranger = '';
};

function Measure(){
	this._number = '';
	this._divisions = '';
	this._beats = '';
	this._beat_type = '';
	this._tempo = 120;
	this._note_arr = [];
	this._chord_arr = [];
	this._repeat = null;
	this._ending = null;
	this._reheasal = null;
	this._fifths = null;
};

function Lyric(){
	this._number;
	this._syllabic;
	this._text;
};

function Note(){
	this._backup = false;
	this._rest = false;
	this._chord = false;
	this._step = 0;
	this._octave = '';
	this._alter = 0;
	this._duration = 0;
	this._voice = 0;
	this._tie_type = null;
	this._lyric_arr = [];
	this._is_unpitched = false;
	this._instrument_id = '';
};

function Percussion(){
	this._id;
	this._name;
}

//TODO part에 inst key를 가지고 있게 하자.
function Part(){
	this._id = '';
	this._part_name = '';
	this._is_percussion = false;
	this._volume = 10;
	this._measure_arr = [];
	this._voice_arr = [];
};

function MusicXML(){
	this._identification = new Identification();
	this._default_tempo = 120;
	this._part_arr = [];
	this._percussion_arr = [];
	this._measure_play_sequence = [];
};