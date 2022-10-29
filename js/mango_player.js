const SEQ_TYPE = {
	Sequence : 0,
	Shuffle : 1
};

const REPEAT_TYPE = {
	ALL : 0,
	ONE : 1,
	END : 2
};

function PlaylistStorage_Local(){
	this.GetPlaylist = function(){
		var music_list = [];
		var saved_play_list = window.localStorage.getItem('PLAY_LIST');
		if(saved_play_list === undefined || saved_play_list == 'undefined'){
			console.log('undefined ');
			saved_play_list = '';
		}
		if(saved_play_list == null || saved_play_list == ''){
			return music_list;
		}

		music_list = JSON.parse((saved_play_list));
		return music_list;
	};

	this.SavePlaylist = function(music_list){
		window.localStorage.setItem('PLAY_LIST', JSON.stringify(music_list));
	};
}

function PlaylistStorage_Memory(music_list){
	var self = this;
	this._music_list = music_list;

	this.GetPlaylist = function(){
		return self._music_list;
	};

	this.SavePlaylist = function(music_list){
		self._music_list = music_list;
	};
}

function MangoPlayer(){
	var self = this;
	this.__yt_player = null;
	this._music_list = [];
	this._cur_video_id = null;
	this._cur_music_uidx = -1;
	this._play_time_ms = 0;
	this._seq_type = SEQ_TYPE.Sequence;
	this._repeat_type = REPEAT_TYPE.ALL;
	this._is_edit_mode = false;
	this._is_sort_mode = false;
	this._playlist_storage = null;
	this._cb_on_play_started = null;
	this._sortable = null;
	this._sub_music_list = [];
	this._lyrics = null;
	this._flow_event_callback = null;
	this._width = 100;
	this._height = 100;

	this.Init = function(playlist_storage, cb_on_play_started, width, height){
		self._playlist_storage = playlist_storage;
		self._cb_on_play_started = cb_on_play_started;
		self._width = width;
		self._height = height;

		self.CreateYoutubePlayer();

		self.InitHandle();
		self.InitKeyHandle();
		self.ReloadPlayerIcons();
		return self;
	};

	this.CreateYoutubePlayer = function(){
		// console.log('CreateYoutubePlayer ');
		self.__yt_player = new YoutubePlayer().Init(
			self.OnYouTubeIframeAPIReady, self.OnPlayerReady, self.OnFlowEvent, self.OnPlayerStateChange
		);
		self.__yt_player.SetSize(self._width, self._height);
	};

	this.SetFlowEventCallback = function(cb){
		self._flow_event_callback = cb;
	};

	this.InitHandle = function(){
		console.log('InitHandle ');
		$('#id_MP_btn_play_pause').on('click', self.PlayPause);
		$('#id_MP_btn_prev').on('click', self.OnClickPrev);
		$('#id_MP_btn_next').on('click', self.OnClickNext);
		$('#id_btn_seq_type').on('click', self.ToggleSeqType);
		$('#id_btn_repeat_type').on('click', self.ToggleRepeatType);
		$('#id_slider_volume').on('input', self.VolumeControl);
		$('#id_MP_btn_volume').on('click', self.VolumeControl_Show);
		$('#id_btn_player_close_volume_control').on('click', self.VolumeControl_Hide);
		$('#id_btn_music_list_trash').on('click', self.OnTrashClick);
		$('#id_btn_playlist_edit_mode_toggle').on('click', self.ToggleEditMode);
		$('#id_btn_music_list_sort').on('click', self.OnClick_Sort);
	};

	//===========================================================================

	//youtube iframe api가 준비된 상태이므로 이 단계에서는 Load를 할 수 있음.
	this._is_youtube_api_ready = false;
	this.OnYouTubeIframeAPIReady = function(){
		self._is_youtube_api_ready = true;
		// self.ReloadPlayList();
	};

	//Load가 된 상태이므로 play를 할 수 있음.
	this.OnPlayerReady = function(pb_rates, duration, volume){
		$('#id_slider_volume').val(volume);
		self.DisplayDuration(duration);
	};

	this.OnFlowEvent = function(play_time){
		var ms = parseInt(play_time * 1000);
		var progress_rate = (ms / self._play_time_ms) * 100;
		// window.localStorage.setItem('PLAYER.LAST_PLAY_MS', ms);
		var timestamp = new Date().getTime();
		// window.localStorage.setItem('PLAYER.LAST_PLAY_WALLTIME_MS', timestamp);
		// window._slider_control.Update(progress_rate);
		// self.UpdateDuration(ms);

		// if(window._mango_player_styler._player_size == PLAYER_SIZE.LARGE){
		// 	self.UpdateSubMusicHighlight(ms);
		// 	self.UpdateLyricsHighlight(ms);	
		// }
		if(self._flow_event_callback){
			self._flow_event_callback(ms);
		}
	};

	this.OnPlayerStateChange = function(player_state, duration){
		switch(player_state){
			case YT.PlayerState.ENDED:
				self.Next();
				break;
			case YT.PlayerState.PLAYING:
				if(self._cb_on_play_started){
					self._cb_on_play_started();
				}
				self.DisplayDuration(duration);
				break;
			case YT.PlayerState.PAUSED:
				break;
			case YT.PlayerState.BUFFERING:
				break;
			case YT.PlayerState.CUED:
				break;
		}
		self.UpdatePlayPauseButton();
	};
		
	//=============================================================================

	this.OnClick_Sort = function(){
		self._is_sort_mode = !self._is_sort_mode;
		self.DISP_MusicList();

		$('#id_btn_music_list_sort').removeClass('badge-danger');
		if(self._is_sort_mode){
			$('#id_btn_music_list_sort').addClass('badge-danger');
		}
	}

	//=============================================================================

	this.ToggleEditMode = function(){
		$('#id_btn_playlist_edit_mode_toggle').removeClass('badge-danger');
		if(self._is_edit_mode){
			for(var i=0 ; i<self._music_list.length ; i++){
				$('#id_btn_playlist_play_music-'+i).show();
				$('#id_btn_playlist_del_music-'+i).hide();
			}
			self._is_edit_mode = false;
		}else{
			for(var i=0 ; i<self._music_list.length ; i++){
				$('#id_btn_playlist_play_music-'+i).hide();
				$('#id_btn_playlist_del_music-'+i).show();
			}
			self._is_edit_mode = true;
		}

		if(self._is_edit_mode){
			$('#id_btn_playlist_edit_mode_toggle').addClass('badge-danger');
			$('#id_btn_playlist_edit_mode_toggle').html('삭제완료');
		}else{
			$('#id_btn_playlist_edit_mode_toggle').html('선택삭제');
		}
	};

	this.OnTrashClick = function(){
		$('#id_model_confirm_content').html('전체 삭제할까요?');
		$('#id_btn_model_confirm_ok').on('click', self.EmptyPlayList);
		$('#modal_confirm').modal('show');
	};

	this.EmptyPlayList = function(){
		$('#modal_confirm').modal('hide');
		self._music_list = [];
		self.SavePlayList();
		self.DISP_MusicList();
		self.__yt_player.ClearPlayer();
		self.DisplayTitleArtist(null);
	};

	this.UpdatePlayPauseButton = function(){
		if(self.__yt_player.IsPlaying()){
			$('#id_MP_btn_play_pause').removeClass('fa-play');
			$('#id_MP_btn_play_pause').removeClass('fa-pause');
			$('#id_MP_btn_play_pause').addClass('fa-pause');
		}else{
			$('#id_MP_btn_play_pause').removeClass('fa-play');
			$('#id_MP_btn_play_pause').removeClass('fa-pause');
			$('#id_MP_btn_play_pause').addClass('fa-play');
		}

		$('#id_MP_btn_play_pause').removeClass("play_button");
		$('#id_MP_btn_play_pause').removeClass("play_button_disabled");
		$('#id_MP_btn_next').removeClass("play_button");
		$('#id_MP_btn_next').removeClass("play_button_disabled");

		// console.log('UpdatePlayPauseButton ' );
		// console.log('self._music_list.length ' + self._music_list.length);
		if(self._music_list.length > 0 || self.__yt_player.IsPlaying()){
			$('#id_MP_btn_play_pause').addClass("play_button");
			$('#id_MP_btn_next').addClass("play_button");
		}else{
			$('#id_MP_btn_play_pause').addClass("play_button_disabled");
			$('#id_MP_btn_next').addClass("play_button_disabled");
		}
	};

	this.PlayPause = function(){
		console.log('PlayPause ' );
		// if(self._music_list.length == 0){
		// 	console.log('music list zeip ');
		// 	return;
		// }

		console.log('self.__yt_player.IsPlaying() ' + self.__yt_player.IsPlaying());

		if(self.__yt_player.IsPlaying()){
			self.__yt_player.Pause();
			window.localStorage.setItem('PLAY_LAST_STATE', '0');
		}else{
			self.__yt_player.Play();
			window.localStorage.setItem('PLAY_LAST_STATE', '1');
		}
	};

	this.InitKeyHandle = function(){
		document.addEventListener('keydown', function(e){
			switch(e.keyCode){
				case 32:
					// self.PlayPause();
				break;
			}
		});
	};

	this.VolumeControl_Show = function(){
		$('.player_volume_div').show();
	};

	this.VolumeControl_Hide = function(){
		$('.player_volume_div').hide();
	};	

	this.GoToMusic = function(music_uid){
		window._router.Go(`/${window._country_code}/music.go?mid=${music_uid}`);
	};

	this.TryMusic = function(music){
		console.log('music.video_id ' + music.video_id);
		self.__yt_player._LoadVideo(music.video_id);
		self.DisplayTitleArtist(music);
	};

	this._MAX_MUSIC_COUNT = 300;
	this.AddMusic = function(music){
		console.log('music ' + JSON.stringify(music));
		if(self._music_list.length == self._MAX_MUSIC_COUNT){
			$('#id_label_max_count').html(self._MAX_MUSIC_COUNT);
			$('#id_modal_max_count_warning').modal('show');
			$('#id_MP_btn_playlist_show').removeClass("btn-dark");
			$('#id_MP_btn_playlist_show').addClass("btn-danger");
			return;
		}

		self._music_list.push(music);
		var last_idx = self._music_list.length-1;
		self.DISP_MusicList();
		// window._index_control.SendMessage_FindLikeMusic(self._music_list);
		self.SelectMusic(last_idx);
		self.__yt_player.LoadAndPlay(self._cur_video_id);
		self.UpdatePlayPauseButton();
		self.SavePlayList();
	};

	this.LoadMusicList = function(music_list){
		self._music_list = music_list;
		console.log('LoadMusicList len ' + self._music_list.length);
		self.DISP_MusicList();
		self.SelectMusic(0);
		self.__yt_player.LoadAndPlay(self._cur_video_id);
		self.UpdatePlayPauseButton();
		self.SavePlayList();
	};

	this.SavePlayList = function(){
		self._playlist_storage.SavePlaylist(self._music_list);
	};

	this.ReloadPlayList = function(){
		self._music_list = self._playlist_storage.GetPlaylist();
		if(self._music_list.length == 0){
			return;
		}
		self.DISP_MusicList();
		// window._index_control.SendMessage_FindLikeMusic(self._music_list);

		var select_music_uidx = 0;
		{
			var last_played_music_uid = window.localStorage.getItem('PLAYER.LAST_PLAYED_music_uid');
			// console.log('last_played_music_uid ' + last_played_music_uid);
			if(last_played_music_uid != null){
				for(var i=0 ; i<self._music_list.length ; i++){
					// console.log('i ' + i + ' == ' + self._music_list[i].music_uid);
					if(self._music_list[i].music_uid == last_played_music_uid){
						select_music_uidx = i;
						break;
					}
				}
			}
		}

		var auto_play_start = false;
		{
			var play_last_state = window.localStorage.getItem('PLAY_LAST_STATE');
	
			if(play_last_state == '1'){
				var last_play_walltime_ms = window.localStorage.getItem('PLAYER.LAST_PLAY_WALLTIME_MS');
				if(last_play_walltime_ms != null){
					var cur_timestamp = new Date().getTime();
	
					var diff = Math.abs(cur_timestamp - last_play_walltime_ms);
					if(diff < 10 * 1000){//10초 이내에 다시 로드된 경우에만 자동 재시작.
						auto_play_start = true;
					}
				}
			}	
		}

		if(auto_play_start){
			var last_play_ms = window.localStorage.getItem('PLAYER.LAST_PLAY_MS');
			if(last_play_ms == null){
				self.SelectMusic(select_music_uidx);
				self.__yt_player.LoadAndPlay(self._cur_video_id);
			}else{
				self.SelectMusic(select_music_uidx);
				self.__yt_player.LoadAndSeekPlay(self._cur_video_id, last_play_ms);
			}
		}else{
			self.SelectMusic(select_music_uidx, false);
			self.__yt_player.LoadButNotPlay(self._cur_video_id);
		}

		self.HighlightCurrentMusic();
		self.UpdatePlayPauseButton();
	};

	this.OnClickPlayBtn = function(idx){
		self.SelectMusic(idx);
		self.__yt_player.LoadAndPlay(self._cur_video_id);
	};

	this.OnClickDelBtn = function(idx){
		self._music_list.splice(idx, 1);
		self.SavePlayList();
		self.DISP_MusicList();
	};

	this.HighlightCurrentMusic = function(){
		for(var i=0 ; i<self._music_list.length ; i++){
			$('#id_music_title_' + i).removeClass('playlist_music_highlight');	
		}

		// console.log('HighlightCurrentMusic ');
		// console.log('self._cur_music_uidx ' + self._cur_music_uidx);

		var id = '#id_music_title_' + self._cur_music_uidx;
		// console.log('id ' + id);
		$(id).addClass('playlist_music_highlight');
	};

	this.ReloadPlayerIcons = function(){
		var seq_type =  window.localStorage.getItem('PLAYER.SEQ_TYPE');
		if(seq_type == 'Shuffle'){
			self._seq_type = SEQ_TYPE.Shuffle;
		}else if(seq_type == 'Sequence'){
			self._seq_type = SEQ_TYPE.Sequence;
		}
		self.UpdateSeqTypeIcon();

		var repeat_type =  window.localStorage.getItem('PLAYER.REPEAT_TYPE');
		if(repeat_type == 'ONE'){
			self._repeat_type = REPEAT_TYPE.ONE;
		}else if(repeat_type == 'ALL'){
			self._repeat_type = REPEAT_TYPE.ALL;
		}
		self.UpdateRepeatTypeIcon();
	};

	this.ToggleSeqType = function(){
		if(self._seq_type == SEQ_TYPE.Sequence){
			self._seq_type = SEQ_TYPE.Shuffle;
			window.localStorage.setItem('PLAYER.SEQ_TYPE', 'Shuffle');
			UTIL_ShowCherryToast('Random Play');
		}else{
			self._seq_type = SEQ_TYPE.Sequence;
			window.localStorage.setItem('PLAYER.SEQ_TYPE', 'Sequence');
			UTIL_ShowCherryToast('Sequence Play');
		}
		self.UpdateSeqTypeIcon();
	};

	this.UpdateSeqTypeIcon = function(){
		$('#id_icon_seq_type').removeClass('fa-sort-numeric-down');
		$('#id_icon_seq_type').removeClass('fa-random');

		if(self._seq_type == SEQ_TYPE.Sequence){
			$('#id_icon_seq_type').addClass('fa-sort-numeric-down');
		}else{
			$('#id_icon_seq_type').addClass('fa-random');
		}
	};

	this.ToggleRepeatType = function(){
		if(self._repeat_type == REPEAT_TYPE.ALL){
			self._repeat_type = REPEAT_TYPE.ONE;
			window.localStorage.setItem('PLAYER.REPEAT_TYPE', 'ONE');
			UTIL_ShowCherryToast('Repeat Single');
		}else if(self._repeat_type == REPEAT_TYPE.ONE){
			self._repeat_type = REPEAT_TYPE.ALL;
			window.localStorage.setItem('PLAYER.REPEAT_TYPE', 'ALL');
			UTIL_ShowCherryToast('Repeat All');
		}
		self.UpdateRepeatTypeIcon();
	};

	this.UpdateRepeatTypeIcon = function(){
		$('#id_icon_repeat_type').removeClass('fa-reply-all');
		$('#id_icon_repeat_type').removeClass('fa-reply');

		if(self._repeat_type == REPEAT_TYPE.ALL){
			$('#id_icon_repeat_type').addClass('fa-reply-all');
		}else if(self._repeat_type == REPEAT_TYPE.ONE){
			$('#id_icon_repeat_type').addClass('fa-reply');
		}
	};

	this.Play = function(){
		self.__yt_player.Play();
	};

	this.Pause = function(){
		self.__yt_player.Pause();
	};

	this.Stop = function(){
		self.__yt_player.Stop();
	};

	this.SelectMusic = function(id){
		self._cur_music_uidx = id;
		self._cur_video_id = self._music_list[self._cur_music_uidx].video_id;
		var music_uid = self._music_list[self._cur_music_uidx].music_uid;
		window.localStorage.setItem('PLAYER.LAST_PLAYED_music_uid', music_uid);
		self.DisplayTitleArtist(self._music_list[self._cur_music_uidx]);
		self.HighlightCurrentMusic();
	};

	this.GetRandomIndex = function(){
		var min = 0;
		var max = self._music_list.length - 1;
		return Math.floor(Math.random() * (max - min)) + min;	
	};

	this.OnClickPrev = function(){
		self.__yt_player.Stop();
		self.__yt_player.Play();
	};

	this.OnClickNext = function(){
		if(self._music_list.length == 0){
			return;
		}
		self.__yt_player.Stop();

		if(self._seq_type == SEQ_TYPE.Shuffle){
			self.SelectMusic(self.GetRandomIndex());
			self.__yt_player.LoadAndPlay(self._cur_video_id);
			return;
		}else if(self._seq_type == SEQ_TYPE.Sequence){
			//순차적으로 전체를 반복
			var next_music_uidx = self._cur_music_uidx + 1;
			if(self._music_list.length == next_music_uidx){
				next_music_uidx = 0;
			}
			self.SelectMusic(next_music_uidx);
			self.__yt_player.LoadAndPlay(self._cur_video_id);
			return;		
		}
	};

	this.Next = function(){
		if(self._music_list.length == 0){
			return;
		}
		self.__yt_player.Stop();

		if(self._repeat_type == REPEAT_TYPE.ONE){
			//한 곡만 반복
			self.SelectMusic(self._cur_music_uidx);
			self.__yt_player.LoadAndPlay(self._cur_video_id);
			return;
		}else if(self._repeat_type == REPEAT_TYPE.ALL){
			if(self._seq_type == SEQ_TYPE.Shuffle){
				self.SelectMusic(self.GetRandomIndex());
				self.__yt_player.LoadAndPlay(self._cur_video_id);
				return;
			}else if(self._seq_type == SEQ_TYPE.Sequence){
				//순차적으로 전체를 반복
				var next_music_uidx = self._cur_music_uidx + 1;
				if(self._music_list.length == next_music_uidx){
					next_music_uidx = 0;
				}
				self.SelectMusic(next_music_uidx);
				self.__yt_player.LoadAndPlay(self._cur_video_id);
				return;		
			}
		}else if(self._repeat_type == REPEAT_TYPE.END){
			if(self._seq_type == SEQ_TYPE.Shuffle){
				self.SelectMusic(self.GetRandomIndex());
				self.__yt_player.LoadAndPlay(self._cur_video_id);
				return;
			}else if(self._seq_type == SEQ_TYPE.Sequence){
				//순차적으로 전체를 반복
				var next_music_uidx = self._cur_music_uidx + 1;
				if(self._music_list.length == next_music_uidx){
					return;
				}
				self.SelectMusic(next_music_uidx);
				self.__yt_player.LoadAndPlay(self._cur_video_id);
				return;		
			}
		}
	};

	this.VolumeControl = function(){
		var volume = $('#id_slider_volume').val();
		// console.log('volume ' + volume);
		self.__yt_player.SetVolume(volume);
	};
	
	this.DisplayDuration = function(duration){
		self._play_time_ms = duration * 1000;
		$('#id_MP_div_duration').html(self.ConvertMillis2Str(duration));
	};

	this.UpdateDuration = function(ms){
		var remain_ms = parseInt((self._play_time_ms - ms) / 1000);
		$('#id_MP_div_duration').html(self.ConvertMillis2Str(remain_ms));
	};

	this.ConvertMillis2Str = function(ms){
		var hours = 0;
		var minutes = parseInt(ms / 60);
		if(minutes > 60){
			hours = parseInt(minutes / 60);
			minutes = minutes % 60;
		}
		var seconds = parseInt(ms % 60);

		if(minutes == NaN || seconds == NaN){
			return '';
		}

		var htm = '';// = minutes + ':';

		if(hours > 0){
			if(hours < 10){
				htm += '0';
			}
			htm += hours + ':';	
		}

		if(minutes < 10){
			htm += '0';
		}
		htm += minutes + ':';

		if(seconds < 10){
			htm += '0';
		}
		htm += seconds;
		return htm;
	};

	this.SeekToPercent = function(percent){
		var seek_ms = self._play_time_ms/100 * percent;
		self.__yt_player.SeekAndPlay(seek_ms);
	};

	this.SeekToSec = function(sec){
		console.log('SeekToSec ' + sec);
		var seek_ms = sec * 1000;
		if(seek_ms == 0){
			seek_ms = 1;
		}
		self.__yt_player.SeekAndPlay(seek_ms);
	};

	this.SeekToMS = function(ms){
		self.__yt_player.SeekAndPlay(ms);
	}

	this.SeekToEnd = function(sec){
		var seek_ms = self._play_time_ms - (sec * 1000);
		self.__yt_player.SeekAndPlay(seek_ms);
	};

	this.LikeMusic = function(idx){
		var m = self._music_list[idx];
		window._index_control.SendMessage_ClickLikeMusic(m);
	};

	//=============================================================================================

	this.DisplayTitleArtist = function(music){
		if(music == null){
			$('#id_MP_label_title').html('');
			$('#id_MP_label_artist').html('');	
			return;
		}

		$('#id_MP_label_title').html('');
		$('#id_MP_label_artist').html('');	

		//title, artist, artist_uid
		$('#id_MP_label_title').html(`<span class="border-bottom pointer">${music.title}</span>`);

		if(music.artist_uid != '0000000000'){
			$('#id_MP_label_artist').html(`<span class="border-bottom pointer">${music.artist}</span>`);
		}

		self.ParseSubMusicList(music);
		self.DISP_SubMusicList(music);
		// self.LoadLyrics(music.music_uid);
	};

	this.LoadLyrics = function(music_uid){
		$.getJSON(server_path + `/trot/db/lyrics/${music_uid}.json`, function(res){
			// console.log('lyrics ' + JSON.stringify(res));
			if(res.lyrics == null){
				return;
			}

			self._lyrics = null;
			self._lyrics = JSON.parse(res.lyrics);
			self.DISP_Lyrics();
		}).fail(function(){
			console.log('Failed to get lyrics');
		});
	};

	this.DISP_MusicList = function(){
		$('#id_div_cherry_player_music_list').empty();
		$('#id_div_cherry_player_music_list_sort').empty();
		var h = '';
		for(var i=0 ; i<self._music_list.length ; i++){
			var m = self._music_list[i]; 
			var id_title = 'id_music_title_'+i;
			var num = (i*1) + 1;
			var artist_name = m.artist;
			if(m.artist_uid == '0000000000'){
				artist_name = '';
			}

			var onclick_play = `window._mango_player.OnClickPlayBtn(${i})`;
			var onclick_del = `window._mango_player.OnClickDelBtn(${i})`;
			var on_click_title = `window._mango_player.GoToMusic('${m.music_uid}', '${m.title}', '${m.artist}')`
			var on_click_heart = `window._mango_player.LikeMusic(${i})`;
			var id_heart_icon = `id_icon_music_heart-${m.music_uid}`;

			var p_btn_disp = '';
			if(self._is_edit_mode){
				p_btn_disp = 'none';
			}
			var d_btn_disp = 'none';
			if(self._is_edit_mode){
				d_btn_disp = '';
			}

			var box_style = '';
			var sortable_class = '';
			if(self._is_sort_mode){
				box_style = '1px dashed green';
				sortable_class = 'list-group-item';
			}else{
				box_style = '1px solid #dddddd';
			}

			h += `
			<div class="${sortable_class}" style="padding:0px; margin:0px; border:1px" id="id_sort_idx-${i}">
				<div class="my-0 py-0" style="font-size:0.6em; width:50px; padding-left:5px">${num}</div>
				<div class=" d-flex" style="margin-bottom:2px; border:${box_style}" id="${id_title}">
					<div class="d-flex " style="width:calc( 100% - 75px);">
						<image style="height: 50px; width: 50px;" src="https://img.youtube.com/vi/${m.video_id}/0.jpg">
						<div class="pl-1">
							<div class="text-dark">
								<span class="pointer" onClick="${on_click_title}">${m.title}</span>
							</div>
							<div class="text-secondary" style="font-size:0.8em">
				`;

			h += `
						<span class="" style="cursor:pointer; margin-right: 5px">${artist_name}</span>
			`;

			h += `
							</div>
						</div>
					</div>
					<div class="text-right d-flex " style="padding-top:5px;">
						<div>
							<span class="badge pointer" style="width:33px; height:33px; padding-top:10px;" onclick="${on_click_heart}">
								<i id="${id_heart_icon}" class="fas fa-heart" style="color:gray"></i>
							</span>
							<div class="text-center" style="font-size:0.5em"></div>
						</div>
						<div>
							<button type="button" class="btn btn-sm" onclick="${onclick_play}" id="id_btn_playlist_play_music-${i}" style="width:33px; height:33px; display:${p_btn_disp}">
								<i class="fas fa-play"></i>
							</button>
							<button type="button" class="btn btn-sm" onclick="${onclick_del}" id="id_btn_playlist_del_music-${i}" style="width:33px; height:33px; display:${d_btn_disp}">
								<i class="fas fa-trash-alt"></i>
							</button>
						</div>
					</div>
				</div>
			</div>
			`;
		}

		if(self._is_sort_mode){
			$('#id_div_cherry_player_music_list_sort').html(h);

			self._sortable = Sortable.create(id_div_cherry_player_music_list_sort, {
				group: "sorting",
				sort: self._is_sort_mode,
				onUpdate: self.OnSortUpdated
			});	
		}else{
			$('#id_div_cherry_player_music_list').html(h);
		}
	};

	this.OnSortUpdated = function(evt){
		console.log('evt old ' + evt.oldIndex);
		console.log('evt new ' + evt.newIndex);

		self._music_list.splice(evt.newIndex, 0, self._music_list.splice(evt.oldIndex, 1)[0]);
		self.DISP_MusicList();
		self.SavePlayList();
	};

	this.DISP_SubMusicList = function(music){
		var h = '';

		h += `<div class="container-fluid">`;

		for(var i=0 ; i<self._sub_music_list.length ; i++){
			var sm = self._sub_music_list[i];
			var on_click = '';
			if(sm.sec != -1){
				on_click = `window._mango_player.SeekToSec(${sm.sec})`;
			}

			var id_str = `id_sub_music_${sm.sec}`;
			h += `
			<div class="row py-2" onClick="${on_click}" id="${id_str}">
				<div class="col-3 text-right"><span class="border-bottom">${sm.time_str}</span></div>
				<div class="col-9 text-left"><span class="border-bottom">${sm.line}</span></div>
			</div>
			`;
		}

		h += `</div>`;
		h += `<div class="py-3"></div>`;
		$('#id_MP_muti_music_list').html(h);
	};

	this._prev_playing_sec = -1;
	this.UpdateSubMusicHighlight = function(ms){
		var sec = Math.floor(ms/1000);
		if(self._prev_playing_sec != sec){
			self._prev_playing_sec = sec;

			var found_idx = -1;
			for(var i=0 ; i<self._sub_music_list.length ; i++){
				//마지막 노래이면
				if(i == self._sub_music_list.length - 1){
					if(self._sub_music_list[i].sec <= sec){
						found_idx = i;
						break;
					}
				}else{
					var cur_sec = self._sub_music_list[i].sec;
					var next_sec = self._sub_music_list[i+1].sec;
					if(cur_sec <= sec && sec < next_sec){
						found_idx = i;
						break;
					}
				}
			}

			self.UpdateSubMusicHighlight_change(found_idx);
		}
	};

	this.UpdateSubMusicHighlight_change = function(idx){
		for(var i=0 ; i<self._sub_music_list.length ; i++){
			var sec = self._sub_music_list[i].sec;
			var ele = $(`#id_sub_music_${sec}`);
			if(i == idx){
				ele.css('background-color', 'rgb(255, 234, 231)');
			}else{
				ele.css('background-color', 'white');
			}
		}
	};

	this.ParseSubMusicList = function(music){
		self._sub_music_list = [];

		if(music.multi_music_list == undefined){
			return;
		}

		if(music.multi_music_list == ''){
			return;
		}

		var lines = music.multi_music_list.split('\n');
		for(var i=0 ; i<lines.length ; i++){
			var arr = lines[i].split(' ');

			var sub_music_info = {
				sec: -1,
				time_str: '',
				line: ''
			};

			for(var j=0 ; j<arr.length ; j++){
				var pos = arr[j].search(':');
				if(pos == -1){
					sub_music_info.line += arr[j] + ' ';
				}else{
					sub_music_info.time_str = arr[j];

					var time_arr = arr[j].split(':');
					var hour = 0;
					var min = 0;
					var sec = 0;
					if(time_arr.length == 1){
						sec = new Number(time_arr[0]);
					}else if(time_arr.length == 2){
						min = new Number(time_arr[0]);
						sec = new Number(time_arr[1]);
					}else if(time_arr.length == 3){
						hour = new Number(time_arr[0]);
						min = new Number(time_arr[1]);
						sec = new Number(time_arr[2]);
					}
					sub_music_info.sec = (hour * 60 * 60) + (min * 60) + sec;
				}
			}
			self._sub_music_list.push(sub_music_info);
		}
	};

	this.UpdateLyricsHighlight = function(ms){
		if(self._lyrics == null){
			return;
		}

		if(self._lyrics.synced == false){
			return;
		}

		var found_idx = -1;
		for(var i=0 ; i<self._lyrics.lines.length ; i++){
			if(i == self._lyrics.lines.length - 1){
				if(self._lyrics.lines[i].ms <= ms){
					found_idx = i;
					break;
				}
			}else{
				var cur_ms = self._lyrics.lines[i].ms;
				var next_ms = self._lyrics.lines[i+1].ms;
				if(cur_ms <= ms && ms < next_ms){
					found_idx = i;
					break;
				}
			}
		}

		if(found_idx != -1){
			self.UpdateLyricsHighlight_change(found_idx);
		}
	};

	self._cur_lyrics_idx = -1;
	this.UpdateLyricsHighlight_change = function(found_idx){
		if(self._cur_lyrics_idx == found_idx){
			return;
		}
		self._cur_lyrics_idx = found_idx;

		for(var i=0 ; i<self._lyrics.lines.length ; i++){
			var ele = $(`#id_lyrics-${i}`);
			if(i == found_idx){
				ele.css('background-color', 'rgb(255, 234, 231)');
				var outer_height = ele.outerHeight(true);
				$(`#id_MP_div_info`).animate({
					scrollTop: outer_height * i
				}, 1500);
			}else{
				ele.css('background-color', 'white');
			}
		}
	};

	this.DISP_Lyrics = function(){
		var h = `<div style="height:20px"></div>`;
		
		for(var i=0 ; i<self._lyrics.lines.length ; i++){
			var id_str = `id_lyrics-${i}`;

			var text = self._lyrics.lines[i].text;
			if(text == ''){
				text = '<br>';
			}
			h += `
			<div id="${id_str}" class="py-1">${text}</div>
			`;
		}

		h += `<div style="height:20px"></div>`;
		$('#id_MP_muti_music_list').html(h);
	};

	this.IsPlaying = function(){
		return self.__yt_player.IsPlaying();
	};
}