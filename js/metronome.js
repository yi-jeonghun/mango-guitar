function Metronome(){
  var self = this;
  this._sheet = null;
  this._width = 0;
  this._height = 0;
  this._ctx = null;

  this.Init = function(id){
    var canvas = document.getElementById(id);
    self._width = canvas.width;
    self._height = canvas.height;
    self._ctx = canvas.getContext('2d');
    return this;
  };

  this.SetSheet = function(sheet){
    this._sheet = sheet;
		// console.debug('._sheet ' + JSON.stringify(self._sheet));
		// console.debug('self._sheet.chord_list.length ' + self._sheet.chord_list.length);
		// console.debug('self._sheet.chord_list. 0 ' + self._sheet.chord_list[0].time_ms);
		// for(var i=0 ; i<self._sheet.chord_list.length ; i++){
		// 	console.debug(i + ' => ' + self._sheet.chord_list[i].time_ms);
		// }
	};

  this.Update = function(ms){
		// console.debug('ms ' + ms + ' ' + self._sheet.chord_list[0].time_ms);

    //find beat
    var beat_idx = -1;
    var is_last = false;
    for(var i=0 ; i<self._sheet.chord_list.length ; i++){
      var beat = self._sheet.chord_list[i];
      if(ms >= beat.time_ms){
        if(i < self._sheet.chord_list.length-1){
          if(ms < self._sheet.chord_list[i+1].time_ms){
            beat_idx = i;
            break;
          }
        }else if(i == self._sheet.chord_list.length-1){ //last
          beat_idx = i;
          is_last = true;
          break;
        }
      }
    }

		if(beat_idx == -1){
			// console.debug('beat_idx -1 ');
			return;
		}

    //find curr and next ms
    var curr_beat_ms = self._sheet.chord_list[beat_idx].time_ms;
    var next_beat_ms = 0;
    if(is_last){
      var diff_ms = self._sheet.chord_list[beat_idx].time_ms - self._sheet.chord_list[beat_idx-1].time_ms;
      next_beat_ms = curr_beat_ms + diff_ms;
    }else{
      next_beat_ms = self._sheet.chord_list[beat_idx+1].time_ms;
    }

    if(ms <= next_beat_ms){
      var diff_ms = next_beat_ms - curr_beat_ms;
      var indication_ms = ms - curr_beat_ms;
      var percent = indication_ms / diff_ms;
      self.Draw(percent, self._sheet.chord_list[beat_idx].beat_count);
    }
  };

  this._colors = ['red', 'blue', 'green', 'purple'];
  this.Draw = function(percent, beat_count){
    self._ctx.clearRect(0, 0, self._width, self._height);
    var one_beat_width = (1/beat_count) * self._width;
    self._ctx.fillStyle = "gray";
    var w = self._width * percent;
    self._ctx.fillRect(0, 0, w, self._height);
    for(var i=0 ; i<beat_count ; i++){
      var left = one_beat_width*i;
      var width = (one_beat_width * (i+1));
      self._ctx.beginPath();
      self._ctx.strokeStyle = "black";//self._colors[i];
      self._ctx.rect(left, 0, width-1, self._height);
      self._ctx.stroke();
    }
  };
}