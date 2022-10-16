const DRUMS = [
	{
		name: 'Bass Drum 2',
		file: '12835_0_Chaos_sf2_file.js',
		var: '_drum_35_0_Chaos_sf2_file',
		pitch: 35
	},
	{
		name: 'Bass Drum 1',
		file: '12836_0_Chaos_sf2_file.js',
		var: '_drum_36_0_Chaos_sf2_file',
		pitch: 36
	},
	{
		name: 'Side Stick/Rimshot',
		file: '12837_0_Chaos_sf2_file.js',
		var: '_drum_37_0_Chaos_sf2_file',
		pitch: 37
	},
	{
		name: 'Snare Drum 1',
		file: '12838_0_Chaos_sf2_file.js',
		var: '_drum_38_0_Chaos_sf2_file',
		pitch: 38
	},
	{
		name: 'Hand Clap',
		file: '12839_0_Chaos_sf2_file.js',
		var: '_drum_39_0_Chaos_sf2_file',
		pitch: 39
	},
	{
		name: 'Snare Drum 2',
		file: '12840_0_Chaos_sf2_file.js',
		var: '_drum_40_0_Chaos_sf2_file',
		pitch: 40
	},
	{
		name: 'Low Tom 2',
		file: '12841_0_Chaos_sf2_file.js',
		var: '_drum_41_0_Chaos_sf2_file',
		pitch: 41
	},
	{
		name: 'Closed Hi-hat',
		file: '12842_0_Chaos_sf2_file.js',
		var: '_drum_42_0_Chaos_sf2_file',
		pitch: 42
	},
	{
		name: 'Low Tom 1',
		file: '12843_0_Chaos_sf2_file.js',
		var: '_drum_43_0_Chaos_sf2_file',
		pitch: 43
	},
	{
		name: 'Pedal Hi-hat',
		file: '12844_0_Chaos_sf2_file.js',
		var: '_drum_44_0_Chaos_sf2_file',
		pitch: 44
	},
	{
		name: 'Mid Tom 2',
		file: '12845_0_Chaos_sf2_file.js',
		var: '_drum_45_0_Chaos_sf2_file',
		pitch: 45
	},
	{
		name: 'Open Hi-hat',
		file: '12846_0_Chaos_sf2_file.js',
		var: '_drum_46_0_Chaos_sf2_file',
		pitch: 46
	},
	{
		name: 'Mid Tom 1',
		file: '12847_0_Chaos_sf2_file.js',
		var: '_drum_47_0_Chaos_sf2_file',
		pitch: 47
	},
	{
		name: 'High Tom 2',
		file: '12848_0_Chaos_sf2_file.js',
		var: '_drum_48_0_Chaos_sf2_file',
		pitch: 48
	},
	{
		name: 'Crash Cymbal 1',
		file: '12849_0_Chaos_sf2_file.js',
		var: '_drum_49_0_Chaos_sf2_file',
		pitch: 49
	},
	{
		name: 'High Tom 1',
		file: '12850_0_Chaos_sf2_file.js',
		var: '_drum_50_0_Chaos_sf2_file',
		pitch: 50
	},
	{
		name: 'Ride Cymbal 1',
		file: '12851_0_Chaos_sf2_file.js',
		var: '_drum_51_0_Chaos_sf2_file',
		pitch: 51
	},
	{
		name: 'Chinese Cymbal',
		file: '12852_0_Chaos_sf2_file.js',
		var: '_drum_52_0_Chaos_sf2_file',
		pitch: 52
	},
	{
		name: 'Ride Bell',
		file: '12853_0_Chaos_sf2_file.js',
		var: '_drum_53_0_Chaos_sf2_file',
		pitch: 53
	},
	{
		name: 'Tambourine',
		file: '12854_0_Chaos_sf2_file.js',
		var: '_drum_54_0_Chaos_sf2_file',
		pitch: 54
	},
	{
		name: 'Splash Cymbal',
		file: '12855_0_Chaos_sf2_file.js',
		var: '_drum_55_0_Chaos_sf2_file',
		pitch: 55
	},
	{
		name: 'Cowbell',
		file: '12856_0_Chaos_sf2_file.js',
		var: '_drum_56_0_Chaos_sf2_file',
		pitch: 56
	},
	{
		name: 'Crash Cymbal 2',
		file: '12857_0_Chaos_sf2_file.js',
		var: '_drum_57_0_Chaos_sf2_file',
		pitch: 57
	},
	{
		name: 'Vibra Slap',
		file: '12858_0_Chaos_sf2_file.js',
		var: '_drum_58_0_Chaos_sf2_file',
		pitch: 58
	},
	{
		name: 'Ride Cymbal 2',
		file: '12859_0_Chaos_sf2_file.js',
		var: '_drum_59_0_Chaos_sf2_file',
		pitch: 59
	},
	{
		name: 'High Bongo',
		file: '12860_0_Chaos_sf2_file.js',
		var: '_drum_60_0_Chaos_sf2_file',
		pitch: 60
	},
	{
		name: 'Low Bongo',
		file: '12861_0_Chaos_sf2_file.js',
		var: '_drum_61_0_Chaos_sf2_file',
		pitch: 61
	},
	{
		name: 'Mute High Conga',
		file: '12862_0_Chaos_sf2_file.js',
		var: '_drum_62_0_Chaos_sf2_file',
		pitch: 62
	},
	{
		name: 'Open High Conga',
		file: '12863_0_Chaos_sf2_file.js',
		var: '_drum_63_0_Chaos_sf2_file',
		pitch: 63
	},
	{
		name: 'Low Conga',
		file: '12864_0_Chaos_sf2_file.js',
		var: '_drum_64_0_Chaos_sf2_file',
		pitch: 64
	},
	{
		name: 'High Timbale',
		file: '12865_0_Chaos_sf2_file.js',
		var: '_drum_65_0_Chaos_sf2_file',
		pitch: 65
	},
	{
		name: 'Low Timbale',
		file: '12866_0_Chaos_sf2_file.js',
		var: '_drum_66_0_Chaos_sf2_file',
		pitch: 66
	},
	{
		name: 'High Agogo',
		file: '12867_0_Chaos_sf2_file.js',
		var: '_drum_67_0_Chaos_sf2_file',
		pitch: 67
	},
	{
		name: 'Low Agogo',
		file: '12868_0_Chaos_sf2_file.js',
		var: '_drum_68_0_Chaos_sf2_file',
		pitch: 68
	},
	{
		name: 'Cabasa',
		file: '12869_0_Chaos_sf2_file.js',
		var: '_drum_69_0_Chaos_sf2_file',
		pitch: 69
	},
	{
		name: 'Maracas',
		file: '12870_0_Chaos_sf2_file.js',
		var: '_drum_70_0_Chaos_sf2_file',
		pitch: 70
	},
	{
		name: 'Short Whistle',
		file: '12871_0_Chaos_sf2_file.js',
		var: '_drum_71_0_Chaos_sf2_file',
		pitch: 71
	},
	{
		name: 'Long Whistle',
		file: '12872_0_Chaos_sf2_file.js',
		var: '_drum_72_0_Chaos_sf2_file',
		pitch: 72
	},
	{
		name: 'Short Guiro',
		file: '12873_0_Chaos_sf2_file.js',
		var: '_drum_73_0_Chaos_sf2_file',
		pitch: 73
	},
	{
		name: 'Long Guiro',
		file: '12874_0_Chaos_sf2_file.js',
		var: '_drum_74_0_Chaos_sf2_file',
		pitch: 74
	},
	{
		name: 'Claves',
		file: '12875_0_Chaos_sf2_file.js',
		var: '_drum_75_0_Chaos_sf2_file',
		pitch: 75
	},
	{
		name: 'High Wood Block',
		file: '12876_0_Chaos_sf2_file.js',
		var: '_drum_76_0_Chaos_sf2_file',
		pitch: 76
	},
	{
		name: 'Low Wood Block',
		file: '12877_0_Chaos_sf2_file.js',
		var: '_drum_77_0_Chaos_sf2_file',
		pitch: 77
	},
	{
		name: 'Mute Cuica',
		file: '12878_0_Chaos_sf2_file.js',
		var: '_drum_78_0_Chaos_sf2_file',
		pitch: 78
	},
	{
		name: 'Open Cuica',
		file: '12879_0_Chaos_sf2_file.js',
		var: '_drum_79_0_Chaos_sf2_file',
		pitch: 79
	},
	{
		name: 'Mute Triangle',
		file: '12880_0_Chaos_sf2_file.js',
		var: '_drum_80_0_Chaos_sf2_file',
		pitch: 80
	},
	{
		name: 'Open Triangle',
		file: '12881_0_Chaos_sf2_file.js',
		var: '_drum_81_0_Chaos_sf2_file',
		pitch: 81
	}
];

function DRUM_GetDrumName(key){
	for(var i=0 ; i<DRUMS.length ; i++){
		if(DRUMS[i].file == key){
			return DRUMS[i].name;
		}
	}
	return '';
};

function DRUM_GetVariable(key){
	for(var i=0 ; i<DRUMS.length ; i++){
		if(DRUMS[i].file == key){
			return DRUMS[i].var;
		}
	}
	return '';
};

function DRUM_GetPitch(key){
	for(var i=0 ; i<DRUMS.length ; i++){
		if(DRUMS[i].file == key){
			return DRUMS[i].pitch;
		}
	}
	return '';
};

function DRUM_GetDrumKeyByName(name){
	var alt_name = name;
	if(name == "Snare (hit)"){
		alt_name = 'Snare Drum 1';
	}else if(name == "Snare (side stick)"){
		alt_name = 'Snare Drum 2';
	}else if(name == "Hi-Hat (closed)"){
		alt_name = 'Closed Hi-hat';
	}else if(name == "Kick (hit)"){
		alt_name = 'Bass Drum 2';
	}else if(name == "Hi-Hat (open)"){
		alt_name = 'Open Hi-hat';
	}else if(name == "Pedal Hi-Hat (hit)"){
		alt_name = 'Pedal Hi-hat';
	}else if(name == "Crash high (hit)"){
		alt_name = 'Crash Cymbal 1';
	}else if(name == "Crash medium (hit)"){
		alt_name = 'Crash Cymbal 2';
	}else if(name == "Splash (hit)"){
		alt_name = 'Splash Cymbal';
	}else if(name == "Low Tom (hit)"){
		alt_name = 'Low Tom 1';
	}else if(name == "Very Low Tom (hit)"){
		alt_name = 'Low Tom 2';
	}else if(name == "Hand Clap (hit)"){
		alt_name = 'Hand Clap';
	}else if(name == "Castanets (hit)"){
		alt_name = "Hand Clap";
	}

	for(var i=0 ; i<DRUMS.length ; i++) {
		if(DRUMS[i].name == alt_name){
			return DRUMS[i].file;
		}
	}

	return null;
};
