const INSTRUMENTS = [
	{
		type:'Piano',
		name:'Acoustic Grand Piano',
		key:'0000_Aspirin_sf2_file'
	},
	{
		type:'Piano',
		name:'Bright Acoustic Piano',
		key:'0010_Aspirin_sf2_file'
	},
	{
		type:'Piano',
		name:'Electric Grand Piano',
		key:'0020_Aspirin_sf2_file'
	},
	{
		type:'Piano',
		name:'Honky-tonk Piano',
		key:'0030_Aspirin_sf2_file'
	},
	{
		type:'Piano',
		name:'Electric Piano 1',
		key:'0040_Aspirin_sf2_file'
	},
	{
		type:'Piano',
		name:'Electric Piano 2',
		key:'0050_Aspirin_sf2_file'
	},
	{
		type:'Piano',
		name:'Harpsichord',
		key:'0060_Aspirin_sf2_file'
	},
	{
		type:'Piano',
		name:'Clavinet',
		key:'0070_Aspirin_sf2_file'
	},
	{
		type:'Chromatic Percussion',
		name:'Celesta',
		key:'0080_Aspirin_sf2_file'
	},
	{
		type:'Chromatic Percussion',
		name:'Glockenspiel',
		key:'0090_Aspirin_sf2_file'
	},
	{
		type:'Chromatic Percussion',
		name:'Music Box',
		key:'0100_Aspirin_sf2_file'
	},
	{
		type:'Chromatic Percussion',
		name:'Vibraphone',
		key:'0110_Aspirin_sf2_file'
	},
	{
		type:'Chromatic Percussion',
		name:'Marimba',
		key:'0120_Aspirin_sf2_file'
	},
	{
		type:'Chromatic Percussion',
		name:'Xylophone',
		key:'0130_Aspirin_sf2_file'
	},
	{
		type:'Chromatic Percussion',
		name:'Tubular Bells',
		key:'0140_Aspirin_sf2_file'
	},
	{
		type:'Chromatic Percussion',
		name:'Dulcimer',
		key:'0150_Aspirin_sf2_file'
	},
	{
		type:'Organ',
		name:'Drawbar Organ',
		key:'0160_Aspirin_sf2_file'
	},
	{
		type:'Organ',
		name:'Percussive Organ',
		key:'0170_Aspirin_sf2_file'
	},
	{
		type:'Organ',
		name:'Rock Organ',
		key:'0180_Aspirin_sf2_file'
	},
	{
		type:'Organ',
		name:'Church Organ',
		key:'0190_Aspirin_sf2_file'
	},
	{
		type:'Organ',
		name:'Reed Organ',
		key:'0200_Aspirin_sf2_file'
	},
	{
		type:'Organ',
		name:'Accordion',
		key:'0210_Aspirin_sf2_file'
	},
	{
		type:'Organ',
		name:'Harmonica',
		key:'0220_Aspirin_sf2_file'
	},
	{
		type:'Organ',
		name:'Tango Accordion',
		key:'0230_Aspirin_sf2_file'
	},
	{
		type:'Guitar',
		name:'Acoustic Guitar (nylon)',
		key:'0240_Aspirin_sf2_file'
	},
	{
		type:'Guitar',
		name:'Acoustic Guitar (steel)',
		key:'0250_Chaos_sf2_file'
	},
	{
		type:'Guitar',
		name:'Electric Guitar (jazz)',
		key:'0260_Aspirin_sf2_file'
	},
	{
		type:'Guitar',
		name:'Electric Guitar (clean)',
		key:'0270_Aspirin_sf2_file'
	},
	{
		type:'Guitar',
		name:'Electric Guitar (muted)',
		key:'0280_Aspirin_sf2_file'
	},
	{
		type:'Guitar',
		name:'Overdriven Guitar',
		key:'0290_Aspirin_sf2_file'
	},
	{
		type:'Guitar',
		name:'Distortion Guitar',
		key:'0300_Aspirin_sf2_file'
	},
	{
		type:'Guitar',
		name:'Guitar Harmonics',
		key:'0310_Aspirin_sf2_file'
	},
	{
		type:'Bass',
		name:'Acoustic Bass',
		key:'0320_Aspirin_sf2_file'
	},
	{
		type:'Bass',
		name:'Electric Bass (finger)',
		key:'0330_Aspirin_sf2_file'
	},
	{
		type:'Bass',
		name:'Electric Bass (pick)',
		key:'0340_Aspirin_sf2_file'
	},
	{
		type:'Bass',
		name:'Fretless Bass',
		key:'0350_Aspirin_sf2_file'
	},
	{
		type:'Bass',
		name:'Slap Bass 1',
		key:'0360_Aspirin_sf2_file'
	},
	{
		type:'Bass',
		name:'Slap Bass 2',
		key:'0370_Aspirin_sf2_file'
	},
	{
		type:'Bass',
		name:'Synth Bass 1',
		key:'0380_Aspirin_sf2_file'
	},
	{
		type:'Bass',
		name:'Synth Bass 2',
		key:'0390_Aspirin_sf2_file'
	},
	{
		type:'Strings',
		name:'Violin',
		key:'0400_Aspirin_sf2_file'
	},
	{
		type:'Strings',
		name:'Viola',
		key:'0410_Aspirin_sf2_file'
	},
	{
		type:'Strings',
		name:'Cello',
		key:'0420_Aspirin_sf2_file'
	},
	{
		type:'Strings',
		name:'Contrabass',
		key:'0430_Aspirin_sf2_file'
	},
	{
		type:'Strings',
		name:'Tremolo Strings',
		key:'0440_Aspirin_sf2_file'
	},
	{
		type:'Strings',
		name:'Pizzicato Strings',
		key:'0450_Aspirin_sf2_file'
	},
	{
		type:'Strings',
		name:'Orchestral Harp',
		key:'0460_Aspirin_sf2_file'
	},
	{
		type:'Strings',
		name:'Timpani',
		key:'0470_Aspirin_sf2_file'
	},
	{
		type:'Ensemble',
		name:'String Ensemble 1',
		key:'0480_Aspirin_sf2_file'
	},
	{
		type:'Ensemble',
		name:'String Ensemble 2',
		key:'0490_Aspirin_sf2_file'
	},
	{
		type:'Ensemble',
		name:'Synth Strings 1',
		key:'0500_Aspirin_sf2_file'
	},
	{
		type:'Ensemble',
		name:'Synth Strings 2',
		key:'0510_Aspirin_sf2_file'
	},
	{
		type:'Ensemble',
		name:'Choir Aahs',
		key:'0520_Aspirin_sf2_file'
	},
	{
		type:'Ensemble',
		name:'Voice Oohs',
		key:'0530_Aspirin_sf2_file'
	},
	{
		type:'Ensemble',
		name:'Synth Choir',
		key:'0540_Aspirin_sf2_file'
	},
	{
		type:'Ensemble',
		name:'Orchestra Hit',
		key:'0550_Aspirin_sf2_file'
	},
	{
		type:'Brass',
		name:'Trumpet',
		key:'0560_Aspirin_sf2_file'
	},
	{
		type:'Brass',
		name:'Trombone',
		key:'0570_Aspirin_sf2_file'
	},
	{
		type:'Brass',
		name:'Tuba',
		key:'0580_Aspirin_sf2_file'
	},
	{
		type:'Brass',
		name:'Muted Trumpet',
		key:'0590_Aspirin_sf2_file'
	},
	{
		type:'Brass',
		name:'French Horn',
		key:'0600_Aspirin_sf2_file'
	},
	{
		type:'Brass',
		name:'Brass Section',
		key:'0610_Aspirin_sf2_file'
	},
	{
		type:'Brass',
		name:'Synth Brass 1',
		key:'0620_Aspirin_sf2_file'
	},
	{
		type:'Brass',
		name:'Synth Brass 2',
		key:'0630_Aspirin_sf2_file'
	},
	{
		type:'Reed',
		name:'Soprano Sax',
		key:'0640_Aspirin_sf2_file'
	},
	{
		type:'Reed',
		name:'Alto Sax',
		key:'0650_Aspirin_sf2_file'
	},
	{
		type:'Reed',
		name:'Tenor Sax',
		key:'0660_Aspirin_sf2_file'
	},
	{
		type:'Reed',
		name:'Baritone Sax',
		key:'0670_Aspirin_sf2_file'
	},
	{
		type:'Reed',
		name:'Oboe',
		key:'0680_Aspirin_sf2_file'
	},
	{
		type:'Reed',
		name:'English Horn',
		key:'0690_Aspirin_sf2_file'
	},
	{
		type:'Reed',
		name:'Bassoon',
		key:'0700_Aspirin_sf2_file'
	},
	{
		type:'Reed',
		name:'Clarinet',
		key:'0710_Aspirin_sf2_file'
	},
	{
		type:'Pipe',
		name:'Piccolo',
		key:'0720_Aspirin_sf2_file'
	},
	{
		type:'Pipe',
		name:'Flute',
		key:'0730_Aspirin_sf2_file'
	},
	{
		type:'Pipe',
		name:'Recorder',
		key:'0740_Aspirin_sf2_file'
	},
	{
		type:'Pipe',
		name:'Pan Flute',
		key:'0750_Aspirin_sf2_file'
	},
	{
		type:'Pipe',
		name:'Blown bottle',
		key:'0760_Aspirin_sf2_file'
	},
	{
		type:'Pipe',
		name:'Shakuhachi',
		key:'0770_Aspirin_sf2_file'
	},
	{
		type:'Pipe',
		name:'Whistle',
		key:'0780_Aspirin_sf2_file'
	},
	{
		type:'Pipe',
		name:'Ocarina',
		key:'0790_Aspirin_sf2_file'
	},
];

function INST_GetGuitarList(){
	var arr = [];
	for(var i=0 ; i<INSTRUMENTS.length ; i++){
		if(INSTRUMENTS[i].type == 'Guitar'){
			arr.push(INSTRUMENTS[i]);
		}
	}
	return arr;
};

function INST_GetListOfType(type){
	var arr = [];
	for(var i=0 ; i<INSTRUMENTS.length ; i++){
		if(INSTRUMENTS[i].type == type){
			arr.push(INSTRUMENTS[i]);
		}
	}
	return arr;
};

function INST_GetInfo(key){
	for(var i=0 ; i<INSTRUMENTS.length ; i++){
		if(INSTRUMENTS[i].key == key){
			return INSTRUMENTS[i];
		}
	}
	return null;
};

function INST_GetName(key){
	for(var i=0 ; i<INSTRUMENTS.length ; i++){
		if(INSTRUMENTS[i].key == key){
			return INSTRUMENTS[i].name;
		}
	}
	return null;
};

function INST_GetTypeList(){
	var types = [];
	var type = '';
	for(var i=0 ; i<INSTRUMENTS.length ; i++) {
		if(type != INSTRUMENTS[i].type){
			types.push(INSTRUMENTS[i].type);
			type = INSTRUMENTS[i].type;
		}
	}
	return types;
};

function INST_GetInstKeyByName(name){
	//var alt_name = name;
	//if(name == "Classical Guitar"){
	//	alt_name = 'Acoustic Guitar (nylon)';
	//}else if(name == "Electric Guitar"){
	//	alt_name = "Electric Guitar (jazz)";
	//}else if(name == "Bass"){
	//	alt_name = "Acoustic Bass";
	//}else if(name == "Lead Vocal Harmonies"){
	//	alt_name = "Voice Oohs";
	//}

	for(var i=0 ; i<INSTRUMENTS.length ; i++) {
		if(INSTRUMENTS[i].name == name){
			return INSTRUMENTS[i].key;
		}
	}

	return null;
	//return "0000_Aspirin_sf2_file";
};

