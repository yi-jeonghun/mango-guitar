function onYouTubeIframeAPIReady(){
	window._mango_player.__yt_player.OnYouTubeIframeAPIReady();
}

const AUTO_START_PLAY_TYPE = {
	NO_PLAY:0,
	AUTO_PLAY:1,
	AUTO_SEEK_PKAY:2
};

function YoutubePlayer(){
	var self = this;
	this._is_youtube_iframe_api_ready = false;
	this._is_player_ready = false;
	this._player = null;
	this._video_id = null;
	this._is_flow_controlling = false;
	this._timer = null;
	this._is_playing = false;
	this._cb_on_iframe_api_ready = null;
	this._cb_on_flow_event = null;
	this._cb_on_player_ready = null;
	this._cb_on_player_state_changed = null;
	this._auto_start_play_type = AUTO_START_PLAY_TYPE.NO_PLAY;
	this._auto_seek_ms = 0;
	this._width = 320;
	this._height = 240;

	this.Init = function(cb_on_iframe_api_ready, cb_on_player_ready, cb_on_flow_event, cb_on_player_state_changed){
		var tag = document.createElement('script');
		tag.src = "https://www.youtube.com/iframe_api";
		var firstScriptTag = document.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

		self._cb_on_iframe_api_ready = cb_on_iframe_api_ready;
		self._cb_on_flow_event = cb_on_flow_event;
		self._cb_on_player_ready = cb_on_player_ready;
		self._cb_on_player_state_changed = cb_on_player_state_changed;	

		return this;
	};

	this.SetSize = function(width, height){
		self._width = width;
		self._height = height;
	};

	this.OnYouTubeIframeAPIReady = function(){
		console.log('OnYouTubeIframeAPIReady');
		self._is_youtube_iframe_api_ready = true;
		if(self._cb_on_iframe_api_ready){
			self._cb_on_iframe_api_ready();
		}
	};

	this.ClearPlayer = function(){
		self.FlowControlStop();
		self.Stop();
	};

	this.OnStoppedVideo = function(){
	};

	this._LoadVideo = function(video_id){
		self._video_id = video_id;
		console.log('self._video_id ' + self._video_id);

		if(self._player == null){
			self._player = new YT.Player('id_MP_player', {
				height: self._width,
				width: self._height,
				videoId: video_id,
				events: {
					'onReady': self._OnPlayerReady,
					'onStateChange': self._OnPlayerStateChange
				}
			});
		}else{
			self._player.loadVideoById(video_id);
		}
	};

	this._OnPlayerReady = function(event){
		// console.log('_OnPlayerReady');
		self._is_player_ready = true;
		var pb_rates = self._player.getAvailablePlaybackRates();
		var duration = self._player.getDuration();
		// console.log('duration ' + duration);
		var volume = self._player.getVolume();

		if(self._cb_on_player_ready){
			self._cb_on_player_ready(pb_rates, duration, volume);
		}

		if(self._auto_start_play_type == AUTO_START_PLAY_TYPE.AUTO_PLAY){
			self.Play();
		}else if(self._auto_start_play_type == AUTO_START_PLAY_TYPE.AUTO_SEEK_PKAY){
			self.SeekAndPlay(self._auto_seek_ms);
		}
	};

	this.IsPlayerReady = function(){
		return self._is_player_ready;
	};

	this._OnPlayerStateChange = function(event){
		if(self._player == null){
			return;
		}
		console.log('event ' + event.data);
		var duration = self._player.getDuration();
		switch(event.data){
			case -1:
				self.OnStoppedVideo();
				console.log('YT.PlayerState.STOPPED ');
				break;
			case YT.PlayerState.ENDED:
				console.log('YT.PlayerState.ENDED ');
				self.FlowControlStop();
				self._is_playing = false;
				break;
			case YT.PlayerState.PLAYING:
				console.log('YT.PlayerState.PLAYING ');
				self.FlowControlStart();
				self._is_playing = true;
				break;
			case YT.PlayerState.PAUSED:
				console.log('YT.PlayerState.PAUSED ');
				self.FlowControlStop();
				self._is_playing = false;
				break;
			case YT.PlayerState.BUFFERING:
				console.log('YT.PlayerState.BUFFERING ');
				self.FlowControlStop();
				self._is_playing = false;
				break;
			case YT.PlayerState.CUED:
				console.log('YT.PlayerState.CUED ');
				if(self._is_seek_and_play){
					self._is_seek_and_play = false;
					self._player.playVideo();
				}else{
					self._is_playing = false;
				}
				// self.FlowControlStop();
				// self._is_playing = false;
					// self._player.playVideo();
				break;
		}

		if(self._cb_on_player_state_changed){
			self._cb_on_player_state_changed(event.data, duration);
		}
	};

	this._is_seek_and_play = false;
	this.SeekAndPlay = function(time_ms){
		console.log('SeekAndPlay ' + time_ms);
		if(self._player == null){
			console.log('_player null ');
			return;
		}

		console.log('self._video_id ' + self._video_id);

		self._player.cueVideoById({
			videoId:self._video_id,
			startSeconds:time_ms/1000
		});
		console.log('play video continue ');
		self._is_seek_and_play = true;
		// self._player.playVideo();
	};

	this.FlowControlStart = function(){
		if(self._is_flow_controlling)
			return;
		self._is_flow_controlling = true;
		self._timer = setInterval(self.FlowControl, 100);
	};

	this.FlowControlStop = function(){
		self._is_flow_controlling = false;
		clearInterval(self._timer);
	};

	this.FlowControl = function(){
		var cur_time = self._player.getCurrentTime();
		if(self._cb_on_flow_event){
			self._cb_on_flow_event(cur_time);
		}
	};

	this.Play = function(){
		if(self._player == null){
			console.log('_player is null');
			return;
		}
		// if(self._is_playing == false){
			self._player.playVideo();
		// }
	};

	this.Stop = function(){
		if(self._player == null){
			return;
		}
		self._player.stopVideo();
	};

	this.Pause = function(){
		if(self._player == null){
			return;
		}
		if(self._is_playing){
			self._player.pauseVideo();
		}
	};

	this.IsPlaying = function(){
		return self._is_playing;
	};

	this.ChangeSpeed = function(speed){
		if(self._player == null){
			return;
		}
		var float_speed = parseFloat(speed);
		console.log(float_speed);
		self._player.setPlaybackRate(parseFloat(float_speed));
	};

	this.SetVolume = function(volume){
		if(self._player == null){
			return;
		}
		self._player.setVolume(volume);
	};

	this.IsPlaying = function(){
		return self._is_playing;
	};

	//==========================================================

	this.LoadAndPlay = function(video_id){
		// console.log('LoadAndPlay ' + video_id);
		self._LoadVideo(video_id);
		self._auto_start_play_type = AUTO_START_PLAY_TYPE.AUTO_PLAY;
	};

	this.LoadButNotPlay = function(video_id){
		// console.log('LoadButNotPlay ' + video_id);
		self._LoadVideo(video_id);
		self._auto_start_play_type = AUTO_START_PLAY_TYPE.NO_PLAY;
	};

	this.LoadAndSeekPlay = function(video_id, seek_ms){
		// console.log('LoadAndSeekPlay ' + video_id);
		self._LoadVideo(video_id);
		self._auto_start_play_type = AUTO_START_PLAY_TYPE.AUTO_SEEK_PKAY;
		self._auto_seek_ms = seek_ms;
	};
}