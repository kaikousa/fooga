var MS_TO_PX_RATIO = 300;
var FoogaUtils = FoogaUtils || {};


FoogaUtils.TimeHelper = {

  normalizeZoom: function(pos, zoomLevel) {
    pos = parseInt(pos)/zoomLevel;
    return pos;

  },

  millisecondsToTime: function(ms, str) {
    var h = Math.floor(ms/3600000);
    var m = Math.floor(ms/60000);
    var s = Math.floor((ms/1000)%60);
    ms = ms%1000;
    if(!str){
      return ({ 'h': h, 'm': m, 's': s, 'ms': ms});
    }
    else {
      return h + ":" + m + ":" + s + ":" + ms;
    }

  }, 

  millisecondsToTimeWithFps: function(ms, fps) {
    var h = Math.floor(ms/3600000);
    var m = Math.floor(ms/60000);
    var s = Math.floor((ms/1000)%60);
    var f = Math.ceil(((ms % 1000)/1000)*fps);
    
    return ({'h': h, 'm': m, 's': s, 'f': f});
  },

  timeToMilliseconds: function(h, m, s, ms) {
    var m = h*60 + m;
    var s = m*60 + s;
    var ms = s*1000 + ms;
    return ms;
  },

  timeToMillisecondsWithFps: function(h, m, s, f, fps) {
    m = h*60 + m;
    s = m*60 + s;
    var ms = (s + f/fps)*1000;

    return ms;
  },

  pixelsToMilliseconds: function(pixels, zoomlevel) {
    return parseInt(pixels * MS_TO_PX_RATIO / zoomlevel, 10);
  },

  millisecondsToPixels: function(milliseconds, zoomlevel) {
    return parseInt((milliseconds*zoomlevel) / MS_TO_PX_RATIO, 10);
  },

  zerofill: function(number, digits) {
    if(digits == 2) {
      if(number < 10) {number = "0" + number;}
    } else if(digits == 3) {
      if(number < 10) {
        number = "00" + number;
      } else if(number < 100) {
        number = "0" + number;
      }
    }
    return number;
  }
};

FoogaUtils.TrimManager = {
  
  trimming: false,   

  start: function(clip, event, trimEvent) {
    this.trimming = true;
    this.activeTrim = $A(arguments);
    this.activeTrim.push(clip.getMainController().getZoomLevel());
    this.bound = this.trimHandler.bindAsEventListener(this, event);
    Event.observe(document, 'mousemove', this.bound);
  },

  end: function() {
    if(this.trimming) {
      this.trimming = false;
      console.log("Ended trimming");
      var clip = this.activeTrim[0];
      var event = this.activeTrim[1];
      var direction = this.activeTrim[2];
      var zoomLevel = this.activeTrim[3];
      Event.stopObserving(document, 'mousemove', this.bound);
      clip.setStartpoint(clip.View.element.getStyle('left'), zoomLevel, clip.getParent().getScrollLeft());
      FoogaUtils.playerNotifier.end(direction, clip.Model.get(direction + 'point'));
      this.activeTrim = null;
    }
  },

  trimHandler: function(event) {
    var clip = this.activeTrim[0];
    var direction = this.activeTrim[2];
    var zoomLevel = this.activeTrim[3];
    var outpoint = clip.Model.get('outpoint');
    var inpoint = clip.Model.get('inpoint');

    var change = clip.View.drawTrim(
      event.screenX, 
      direction, 
      clip.Model.get('duration'), 
      inpoint, 
      outpoint, 
      zoomLevel);

    if(direction == 'out') {
      var change_ms = FoogaUtils.TimeHelper.pixelsToMilliseconds(change, zoomLevel);
      if(outpoint + change_ms <= 0) {
        clip.Model.set('outpoint', 0);
        clip.Model.set('out_h', 0);
        clip.Model.set('out_m', 0);
        clip.Model.set('out_s', 0);
        clip.Model.set('out_ms', 0);
      }
      else {
        var time = FoogaUtils.TimeHelper.millisecondsToTime(outpoint + change_ms);
        clip.Model.set('outpoint', outpoint + change_ms);
        clip.Model.set('out_h', time.h);
        clip.Model.set('out_m', time.m);
        clip.Model.set('out_s', time.s);
        clip.Model.set('out_ms', time.ms);
        FoogaUtils.playerNotifier.notify('out', outpoint + change_ms);
      }
      
    }
    else if(direction == 'in') {
      var change_ms = FoogaUtils.TimeHelper.pixelsToMilliseconds(change, zoomLevel);
      var time = FoogaUtils.TimeHelper.millisecondsToTime(inpoint + change_ms);
      if(inpoint + change_ms >= 1) {
        clip.Model.set('inpoint', inpoint + change_ms);
        clip.Model.set('in_h', time.h);
        clip.Model.set('in_m', time.m);
        clip.Model.set('in_s', time.s);
        clip.Model.set('in_ms', time.ms);
        FoogaUtils.playerNotifier.notify('in', outpoint + change_ms);
      }
      else {
        clip.Model.set('inpoint', 0);
        clip.Model.set('in_h', 0);
        clip.Model.set('in_m', 0);
        clip.Model.set('in_s', 0);
        clip.Model.set('in_ms', 0);
        FoogaUtils.playerNotifier.notify('in', 0);
      }      
    }
  }
};


FoogaUtils.playerNotifier = {
  notify: function(direction, ms) {
    //console.log("Notified player: ", direction, ms);
  },

  end: function(direction, ms) {
    //console.log("Ended notifying player: ", direction, ms);
  }

};

FoogaUtils.settings = {
  timelineWidth: 800,
  fps: 24,
  timelineSliderHandleWidth: 240
};
