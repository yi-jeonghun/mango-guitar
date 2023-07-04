<< comment
<script type="text/javascript" src="/js/ChordDB.js"></script>
<script type="text/javascript" src="/js/ChordManager.js"></script>
<script type="text/javascript" src="/js/Drums.js"></script>
<script type="text/javascript" src="/js/MusicXMLPlayer.js"></script>
<script type="text/javascript" src="/js/const.js"></script>
<script type="text/javascript" src="/js/youtube_iframe_player.js"></script>
<script type="text/javascript" src="/js/mango_player.js"></script>
<script type="text/javascript" src="/js/metronome.js"></script>
<script type="text/javascript" src="/js/chord_lyrics_sheet_control.js"></script>
comment

uglifyjs --compress --mangle -o chord_lyrics_sheet.min.js -- \
	ChordDB.js \
	ChordManager.js \
	Drums.js \
	MusicXMLPlayer.js \
	const.js \
	youtube_iframe_player.js \
	mango_player.js \
	metronome.js \
	chord_lyrics_sheet_control.js \
	