//ALL ABSTRACT CLASSES: Agent, Model, View, Controller
//ABSTRACT CLASSES 
//------------------------------------------------//
//Class Agent
//args: Controller:Object
//------------------------------------------------//

var Agent = Class.create({
  initialize: function(Controller) {
    this.Controller = Controller;
  },

  registerChild: function(obj) {
    this.Controller.Model.registerChild(obj);
  },

  unregisterChild: function(obj) {
    this.Controller.Model.unregisterChild(obj);
  },

  getChildren: function() {
    return this.Controller.Model.getChildren();
  },

  getChild: function(name) {
    return this.Controller.Model.getChild(name);
  }
});

//------------------------------------------------//

//------------------------------------------------//
//Class View
//------------------------------------------------//

var View = Class.create({
  initialize: function() {
  }
});

//------------------------------------------------//

//------------------------------------------------//
//Class Model
//------------------------------------------------//

var Model = Class.create({
  initialize: function(data) {
    this.children = [];
    if(data) {
      this.data = data;
    }
    else {
      this.data = {};
    }
  
  },

  //Method registerChild 
  //args: agent:Object || controller:Object
  //return: void
  //description: used to register child-agents to this agent
  registerChild: function(obj) {
    //TODO What to do with this?
    if(this.children == undefined) {
      this.children = [];
    }
    if(obj.Controller){
      this.children.push(obj.Controller);
    }
    else {
      this.children.push(obj);
    }
  },
  //Method unregisterChild 
  //args: agent:Object || controller:Object
  //return: void
  //description: used to unregister the agent if the parent/child-relationship changes somehow 
  unregisterChild: function(obj) {
    if(obj.Controller){
      this.children = this.children.without(obj.Controller);
    }
    else {
      this.children = this.children.without(obj);
    }
  },
  //Method getChildren 
  //args: none
  //return: Array
  //description: returns an array of child-agents to this agent
  getChildren: function() {
    return this.children;
  },
  getChild: function(name) {
    for(i = 0; i < this.children.length; i++) {
      if(this.children[i].name == name) {
        return this.children[i];
      }
    }
  },

  //------------------------------------------------//
  //Method setData
  //args: json:Object
  //return: void

  setData: function(json) {
    this.data = json;
  },

  //Method get 
  //args: name:String
  //return: String or undefined
  get: function(name) {
      return this.data[name];
  },

  //Method set 
  //args: name:String, value
  //return: void
  set: function(name, value) {
    this.data[name] = value;
  }

});


//------------------------------------------------//
//Class Controller
//args: View:Object, Model:Object, parentController:Object
//------------------------------------------------//

var Controller = Class.create({
  initialize: function(View, Model, parent) {
    this.View = View;
    this.Model = Model;
    this.parent = parent;
  
  },

  //------------------------------------------------//
  //Method getElement
  //return: HTML Element
  //description: returns the html element associated to this Controller 

  getElement: function() {
    return this.View.element;
  },

  //------------------------------------------------//
  //Method getParent
  //return: Object | null
  //description: returns the Controller of the parent agent or null if controller is already the top-level agent. Mostly used by getMainController-method.

  getParent: function() {
    return this.parent;
  },

  //------------------------------------------------//
  //Method setParent
  //args: Object
  //return: void
  //description: Associates the given Controller as the parent to this Controller. Used when the this controller moves around in the hierarchy-tree.

  setParent: function(parent) {
    this.parent = parent;
  },

  //------------------------------------------------//
  //Method getMainController
  //return: Object
  //description: returns the Controller of the top-level agent. Used throughout the application.

  getMainController: function() {
    var parent = this.getParent();
    var prev = parent;
    while(parent != null) {
      prev = parent; 
      parent = parent.getParent();
    }
    return prev;
  },

  //Method getDepth
  //return: depth;Int
  //description: Returns the depth (level) of the current controller. Used for debugging purposes.
  getDepth: function() {
    var i = 0;
    var parent = this.getParent();
    var prev = parent;
    while(parent != null) {
      prev = parent; 
      parent = parent.getParent();
      i++;
    }
    return i;
  },

  //------------------------------------------------//
  //Method getParentByName
  //args: name:String
  //return: Object
  //description: returns a parent Controller of the given name. Can be used by controllers who wish to use agents that are positioned in between this controller and the main controller in the hierarchy. Names are constructed as: AgentnameController e.g: TimelineController

  getParentByName: function(name) {
    var parent = this.getParent();
    var prev = parent;
    while(parent != null) {
      if(parent.name != name) {
        prev = parent; 
        parent = parent.getParent();
      }
      else{
        return prev;
      }
    }
  },

  //------------------------------------------------//
  //Method registerElement
  //args: element:HTMLElement
  //return: void
  //description: Associates the given element to the Controller's View. Used by View's createElement-method

  registerElement: function(element) {
    this.View.element = element;
    this.View.element.Controller = this;
  }
});

//------------------------------------------------//

//Timeline-triad

//Class Timeline Model
//extends: Model
//------------------------------------------------//

var TimelineModel = Class.create(Model, {
  initialize: function($super, type, data) {
    $super(data);
    if(type) {
      this.data.type = type;
    }
  }
});

//Class Timeline View
//extends: View
//------------------------------------------------//

var TimelineView = Class.create(View, {
  initialize: function() {
  },

  //Method: createTimelineElement
  //return: void
  createElement: function(Controller) {
    var Model = Controller.Model;
    var wrapper_element = new Element('div', {
      id: 'timelinewrapper_' + Math.floor((Math.random() * 100000)),
      className: 'timeline_wrapper'
    });
    wrapper_element.setStyle({
      width: FoogaUtils.settings.timelineWidth + 'px'
    });
    
    var element = new Element('div', {
      id: 'timeline_' + Math.floor((Math.random() * 100000)),
      className: Model.data.type + 'timeline'
    });

    Controller.registerElement(element);
    element.Controller = Controller;
    wrapper_element.appendChild(element);
    Controller.getMainController().getElement().appendChild(wrapper_element);

  },

  //Method getWidth
  //args: None
  //return: TimelineWidthInPx:Int
  //description: Returns the width of this timeline-element. Used by the accessor-method getTimelineWidth in the timeline-agent's controller.
	getWidth: function(){
		var children = this.element.childElements();
		var b = 0;
		for (i = 0; i < children.length; i++){
			a  = parseInt(children[i].style.left, 10) + parseInt(children[i].style.width, 10);
			if (a > b){
				b = a;
			}
		}
		return b;
	},
});

//------------------------------------------------//

//Class Timeline Controller
//extends: Controller
//args: TimelineView:Object, TimelineModel:Object
//------------------------------------------------//

var TimelineController = Class.create(Controller, {
  initialize: function($super, View, Model, parent) {
    $super(View, Model, parent);
    this.name = "TimelineController";
    this.View.createElement(this);
    this.setAsDroppable();
    this.initEventHandlers();
    this.createClips(); 
  },

  //------------------------------------------------//
  //Method setAsDroppable
  //return: void
  //description: Sets this timeline as a scriptaculous-droppable with Droppables.add(), so that it can react with draggable timelineclips

  setAsDroppable: function() {
    Droppables.add(this.View.element, {
      accept: [this.Model.data.type + "Drag", this.Model.data.type + 'Clip'],
      //Method onHover
      //return: void
      //description: Triggered when draggables are hovered over this.View.element, Fires the setCurrentTimeline-method of the dragged agent.
      onHover: function(draggable, droppable) {
        draggable.Controller.setCurrentTimeline(droppable);
      }
    
    });

  },

  //------------------------------------------------//
  //Method createClips
  //return: void
  //description: Create new Clip-agent for each clip associated to this timeline. Used by TimelineController.initialize()

  createClips: function() {
    var clips = this.Model.data;
    //console.log(this.Model.data);
    for(i = 0; i < clips.length; i++) {
      var clip = new Clip(this.Model.data.type, clips[i], this);
    }
  },

  //------------------------------------------------//
  //Method: initEventHandlers
  //return: void
  //description: Initialize all the clip's event-handlers (onClick, others?)

  initEventHandlers: function() {
    this.View.element.observe('click', this.click.bind(this));
  },

  
  //------------------------------------------------//
  //Method: click
  //return: void
  //description: Method ot be fired when an click event on the agent is fired.
  click: function() {
    this.getMainController().collectEditorInstanceData();
  },

  //------------------------------------------------//
  //Method: getScrollLeft
  //return: int
  //description: returns this elements scroll offset

  getScrollLeft: function() {
    return this.View.element.up().scrollLeft;
  },
  
  getTimelineWidth: function() {
    return this.View.getWidth();
  }


});
//------------------------------------------------//

//Class Timeline 
//extends: Agent
//args: "video | audio":String, timelinedataJson:Object
//------------------------------------------------//

var Timeline = Class.create(Agent, {
  initialize: function(type, json, parent) {
    console.warn('Creating ' + type + "timeline for " + parent.name + "...");
    var p = new TimelineView();
    var a = new TimelineModel(type, json);
    this.Controller = new TimelineController(p, a, parent);
    console.warn('Done creating ' + type + 'timeline!');
  },

  

});

//------------------------------------------------//
//---------------

//Fooga-triad
//Class Main Model 
//extends: Model
//args: timelinedataJson:Object, FoogaPlayer:swfobject
//------------------------------------------------//
var MainModel = Class.create(Model, {
  initialize: function(data, player) {
    this.data = data;
    this.player = player;

    this.env = {};
    this.env.zoomLevel = 5.0;
    this.env.zoomValue = 5.0;
  
  }
});

//------------------------------------------------//

//Class Main View 
//extends: View
//------------------------------------------------//

var MainView = Class.create(View, {
  initialize: function() {
  }
});

//------------------------------------------------//


//Class Main Controller 
//extends: Controller
//args: MainView:Object, MainModel:Object
//------------------------------------------------//

var MainController = Class.create(Controller, {
  initialize: function($super, View, Model, parent) {
    $super(View, Model, parent);
    this.name = "MainController";
  },

  //------------------------------------------------//
  //Method createTimelines
  //args: timelinedataJson:Object
  //return: void

  createTimelines: function() {
    var json = this.Model.data.timelines;
    if(json.video_timelines) {
      for(i = 0; i < json.video_timelines.length; i++) {
        var timeline_data = json.video_timelines[i];
        var tl = new Timeline("video", timeline_data, this);
        this.Model.registerChild(tl);
      }
    }
    else {
        var tl = new Timeline("video", null, this);
        this.Model.registerChild(tl);
    }
    if(json.audio_timelines) {
      for(a = 0; a < json.audio_timelines.length; a++) {
        var timeline_data = json.audio_timelines[a];
        var tl = new Timeline('audio', timeline_data, this);
        this.Model.registerChild(tl);
      }
    }
    else {
        var tl = new Timeline("audio", null, this);
        this.Model.registerChild(tl);
    }
  },

  //------------------------------------------------//
  //Method getZoomLevel
  //return: float
  //description: returns the zoomlevel of this editor-instance

  getZoomLevel: function() {
    return this.Model.env.zoomLevel;
  },
 
  //------------------------------------------------//
  //Method setZoomLevel
  //return: void
  //args: int:zoomLevel
  //description: sets a new zoomLevel for this editor-instance. Invokes the zooMObserver's update-method, which affects all active clips on the timelines.

  setZoomLevel: function(zoom) {
    this.Model.env.zoomLevel = zoom;
    this.Model.env.zoomValue = zoom;
    this.zoomObserver.update();
    this.Model.getChild("TimelineSliderController").resizeHandle();
  },

  //------------------------------------------------//
  //Method getTimelines
  //return: array of extended elements
  //args: type:string 'all' || 'video' || 'audio' || 'effect', element:string 'timeline' || 'wrapper'
  //description: Returns an extended array of timelines of the passed type. 

  //TODO make this return also the wrappers of specified timeline-types
  getTimelines: function(type, element) {
    arguments.callee.argumentNames();
    if(type == 'all' && element == 'timeline') {
      return this.getElement().select('.videotimeline', '.audiotimeline', '.effecttimeline');
    }
    else if(type == 'all' && element == 'wrapper') {
      return this.getElement().select('.timeline_wrapper');
    }
    else {
      return this.getElement().select('.' + type + 'timeline');
    }
  },

  collectEditorInstanceData: function() {
    var timelines = this.Model.getChildren();
    var data = {};
    data.videotimelines = [];
    data.audiotimelines = [];
    timelines.each(function(timeline) {
      var clips = timeline.Model.getChildren();
      var clipDataArr = [];
      clips.each(function(clip) {clipDataArr.push(clip.Model.data)});
      if(timeline.Model.get("type") == "video") {
        data.videotimelines.push(clipDataArr);
      }
      else if(timeline.Model.get("type") == "audio") {
        data.audiotimelines.push(clipDataArr);
      }
    }); 
    //console.log(Object.toJSON(data));
    console.log(data);
  }

});

//------------------------------------------------//

//Class Fooga 
//extends: Agent
//args: container:HTMLElement, MainController:Object 
//------------------------------------------------//

var Fooga = Class.create(Agent, {
  initialize: function($super, element, Controller) {
    $super(Controller);
    this.Controller.registerElement(element);
    //Make sure that the trimManager is told to stop trimming
    document.observe('mouseup', function() {
      if(FoogaUtils.TrimManager.trimming) {
        FoogaUtils.TrimManager.end();
      }
    });
  },

  //------------------------------------------------//
  //Method: launch
  //return: void
  //description: initiates the editor instance

  launch: function() {
    console.warn("Launching Fooga...");
    this.Controller.zoomObserver = new ZoomObserver();
    Draggables.addObserver(new DragObserver("clipobserver", this.Controller));
    this.Controller.createTimelines();
    this.registerChild(new ZoomSlider(this.Controller));
    //this.Controller.zoomSlider = new ZoomSlider(this.Controller);
    this.registerChild(new TimelineSlider(this.Controller));
    //this.Controller.timelineSlider = new TimelineSlider(this.Controller);
    this.registerChild(new Playhead(this.Controller));
    //this.Controller.playhead = new Playhead(this.Controller);
    this.Controller.library = new Library(this.Controller.Model.data.library, this.Controller);
    console.warn("Done launching Fooga!");
    console.timeEnd("Total init time: ");
  }

});

//------------------------------------------------//
//---------------

//Clip-triad
//Class Clip Model
//extends: Model
//------------------------------------------------//

var ClipModel = Class.create(Model, {
  initialize: function($super, type, data) {
    $super(data);
    this.data.type = type;
    this.data.dur_h = data.dur_h;
    this.data.dur_m = data.dur_m;
    this.data.dur_s = data.dur_s;
    this.data.dur_ms = data.dur_ms;

    if(data.in_h != undefined) {
      this.data.in_h = data.in_h;
      this.data.in_m = data.in_m;
      this.data.in_s = data.in_s;
      this.data.in_ms = data.in_ms;

      this.data.out_h = data.out_h;
      this.data.out_m = data.out_m;
      this.data.out_s = data.out_s;
      this.data.out_ms = data.out_ms;
    }
    else {
      this.data.in_h = 0;
      this.data.in_m = 0;
      this.data.in_s = 0;
      this.data.in_ms = 0;

      this.data.out_h = data.dur_h;
      this.data.out_m = data.dur_m;
      this.data.out_s = data.dur_s;
      this.data.out_ms = data.dur_ms;
    }
    
    this.data.duration = FoogaUtils.TimeHelper.timeToMilliseconds(
      data.dur_h, 
      data.dur_m,
      data.dur_s, 
      data.dur_ms);

    if(data.type == "audio" || data.type == "video" && data.in_h != undefined) {
      this.data.offset_h = data.offset_h;
      this.data.offset_m = data.offset_m;
      this.data.offset_s = data.offset_s;
      this.data.offset_ms = data.offset_ms;

      this.data.offset = FoogaUtils.TimeHelper.timeToMilliseconds(
        data.offset_h, 
        data.offset_m, 
        data.offset_s, 
        data.offset_ms);
      
      this.data.inpoint = FoogaUtils.TimeHelper.timeToMilliseconds(
        data.in_h, 
        data.in_m, 
        data.in_s, 
        data.in_ms);

      this.data.outpoint = FoogaUtils.TimeHelper.timeToMilliseconds(
        data.out_h, 
        data.out_m, 
        data.out_s, 
        data.out_ms);
    }
  }

});

//Class Clip View
//extends: View
//------------------------------------------------//

var ClipView = Class.create(View, {
  initialize: function() {
  },

  //------------------------------------------------//
  //Method createElement
  //return: void
  //args: Object:ClipController
  //description: Creates the presentation for the clip. Used when the clip is initiated. Used by ClipController.

  createElement: function(Controller) {
    var Model = Controller.Model;
    var element = new Element('div', {
      id: 'timeline_clip' + Math.floor((Math.random() * 100000)),
      className: Model.get('type') + 'Clip'
      }).update("<p>" + Model.get('name') + "</p>");

    var leftHandle = new Element('div', {
      className: 'leftHandle'
    });

    var rightHandle = new Element('div', {
      className: 'rightHandle'
    });
    element.appendChild(leftHandle);
    element.appendChild(rightHandle);
    if(Model.get('type') == 'video') {
      var picture = new Element('img', {
        src: Model.get('thumbnail_image'),  
        className: 'videoClip_thumbnail'
      });
      element.appendChild(picture);
    }

    element.setStyle({width: Controller.getWidthInPx() + "px"});
    Controller.registerElement(element);
    if(Controller.getParentByName('TimelineController') != undefined){
      Controller.getParentByName('TimelineController').getElement().appendChild(element);
    }
    else {
      document.body.appendChild(element);
    }
  },

  drawTrim: function(screenX, direction, duration, inpoint, outpoint, zoomLevel) {
    if(direction == 'out') {
      var old_width = parseInt(this.element.getStyle('width'));
      var offset = this.element.cumulativeOffset()[0];
      var handle_offset = 2; 
      var width = screenX + handle_offset - offset;
      var dur = outpoint - inpoint;
      var duration_px = FoogaUtils.TimeHelper.millisecondsToPixels(duration, zoomLevel);
      var in_px = FoogaUtils.TimeHelper.millisecondsToPixels(inpoint, zoomLevel);
      //If the new trimmed width is in the limits of the clip
      if(width <= duration_px - in_px) {
        this.element.setStyle({width: width + 'px'});
        var change = width - old_width;
        return change;
      }
      //Don't let the width go below 0
      else if(width <= 0) {
        this.element.setStyle({width: '0px'});
        return change;
      }
      
    }
    else if(direction == 'in') {
      var offset = this.element.cumulativeOffset()[0];
      var handle_offset = -2; 
      var difference = screenX - offset;
      var width = parseInt(this.element.getStyle('width'));
      var new_width = width - difference - handle_offset;
      var left = parseInt(this.element.getStyle('left'));
      var in_px = FoogaUtils.TimeHelper.millisecondsToPixels(inpoint, zoomLevel);
      var out_px = FoogaUtils.TimeHelper.millisecondsToPixels(outpoint, zoomLevel);
      var duration_px = FoogaUtils.TimeHelper.millisecondsToPixels(duration, zoomLevel);
      this.element.setStyle({
        width: new_width + 'px', 
        left: left + difference + handle_offset + 'px'
      });
      return difference - handle_offset;
    }

  }
});

//------------------------------------------------//

//Class Clip Controller
//extends: Controller
//args: ClipView:Object, ClipModel:Object
//------------------------------------------------//

var ClipController = Class.create(Controller, {
  initialize: function($super, View, Model, parent) {
    $super(View, Model, parent);
    this.name = "ClipController";
    this.View.createElement(this);
    this.setAsDraggable();
    this.initEventHandlers();
    var mainController = this.getMainController();
    mainController.zoomObserver.register(this);
    var zoomLevel = mainController.getZoomLevel();
    if(this.getParentByName('TimelineController') != undefined){
      this.setStartpoint(this.getPxOffset(zoomLevel), zoomLevel, this.getParent().getScrollLeft());
      this.getParent().Model.registerChild(this);
    }
  },
    
  update: function() {
    if(this.Model.previousPlace != document.body) {
      this.Model.previousPlace.Controller.Model.unregisterChild(this);  
      this.getParent().Model.registerChild(this);  
    }
    else {
      this.getParent().Model.registerChild(this);  
    }
  },

  delete: function() {
    this.Model.draggable.destroy();
    this.getElement().stopObserving();
    this.getElement().down().next('.rightHandle').stopObserving();
    this.getElement().down().next('.leftHandle').stopObserving();
    this.View.element.remove();
    this.getParent().Model.unregisterChild(this);

  },

  setAsDraggable: function() {
    this.Model.draggable = new FoogaDraggable(this.View.element, {}, this);
  },

  draw: function() {
    var zoomLevel = this.getMainController().getZoomLevel();
    this.View.element.setStyle({width: this.getWidthInPx() + "px", left: this.getPxOffset(zoomLevel) + "px"});
    
  },

  getWidth: function() {
    return (this.Model.get('outpoint') - this.Model.get('inpoint')) / MS_TO_PX_RATIO;    
  },

  getWidthInPx: function() {
    return this.getWidth() * this.getMainController().getZoomLevel();
  },

  getPxOffset: function(zoomLevel) {
    if(!zoomLevel) var zoomLevel = this.getMainController().getZoomLevel();
    var offset = (this.Model.get('offset') *  zoomLevel / MS_TO_PX_RATIO);
    return offset;
  },

	setStartpoint: function(pos, zoomLevel, timelineOffset) {
		var pos = parseInt(pos);
    ////console.log(this.Model.get('name'), pos);
    var offset_px = pos - timelineOffset;
    offset_px < 0 ? offset_px = 0 : offset_px;
    //console.log(this.View.element);
		
		var offsetTime = FoogaUtils.TimeHelper.millisecondsToTime(FoogaUtils.TimeHelper.pixelsToMilliseconds(offset_px, zoomLevel));
		this.Model.set('offset_h', offsetTime.h);
		this.Model.set('offset_m', offsetTime.m);
		this.Model.set('offset_s', offsetTime.s);
		this.Model.set('offset_ms', offsetTime.ms);
    this.Model.set('offset', FoogaUtils.TimeHelper.timeToMilliseconds(offsetTime.h, offsetTime.m, offsetTime.s, offsetTime.ms));
		
		//this.clipStart = normalizeZoom(offset_px);
		
    console.log("OFFSET_PX" , this.Model.get('name') , offset_px)
		this.View.element.setStyle({left: offset_px + "px", top: '0px'});
	
  },

  removeEventHandlers: function() {
    var element = this.getElement();
    element.stopObserving();
  },

  initEventHandlers: function() {
    var element = this.getElement();
      element.observe('click', 
        this.clicky.bindAsEventListener(this));

      element.down().next('.leftHandle').observe(
        'mousedown', 
        this.eventHandler.bindAsEventListener(this, "in"));
      
      element.down().next('.rightHandle').observe(
        'mousedown', 
        this.eventHandler.bindAsEventListener(this, "out"));

      /*element.observe('mouseup', 
        this.eventHandler.bindAsEventListener(this, 'middle'));*/

      element.down().next('.leftHandle').observe(
        'mouseup', 
        this.eventHandler.bindAsEventListener(this, "in"));
      
      element.down().next('.rightHandle').observe(
        'mouseup', 
        this.eventHandler.bindAsEventListener(this, "out"));
  },

  clicky: function(event) {
    //console.log(this.Model.data)
    Event.stop(event);
  },

  eventHandler: function(event) {
    var action = $A(arguments).pop();
    switch(event.type){
      case "mousedown":
        switch(action) {
          case "middle":
            //console.log("Pressed in the middle");
            //console.log("Clip Data", this.Model);
            Event.stop(event);
          break;

          default: 
            FoogaUtils.TrimManager.start(this, event, action);
            Event.stop(event);
        }
      break;

      case "mouseup":
        switch(action) {
          case "middle":
            //console.log("Released in the middle");
            FoogaUtils.TrimManager.end();
          break;

          default: 
            FoogaUtils.TrimManager.end();
            Event.stop(event);
        }
      break;
    }
//    Event.stop(event);

  },

  setCurrentTimeline: function(element) {
    this.Model.currentTimeline = element;
  },

  getCurrentTimeline: function() {
    if(this.Model.currentTimeline){
      return this.Model.currentTimeline;
    }
  }
});

//------------------------------------------------//

//Class Clip 
//extends: Agent
//args: type:String, json:Object, parentController:Object
//------------------------------------------------//

var Clip = Class.create(Agent, {
  initialize: function(type, json, parent) {
    var p = new ClipView();
    var a = new ClipModel(type, json);
    this.Controller = new ClipController(p, a, parent);
    console.log("\t"+a.data.name + " " + a.data.type + "clip created on level " + this.Controller.getDepth());
  },

  

});

//------------------------------------------------//
//---------------


//Observer abstract class
var Observer = Class.create({
  initialize: function() {
    this.subjects = [];
  },

  register: function(obj) {
    if(obj.Controller){
      this.subjects.push(obj.Controller);
    }
    else {
      this.subjects.push(obj);
    }
  },
  unregister: function(obj) {
    if(obj.Controller){
      this.subjects = this.subjects.without(obj.Controller);
    }
    else {
      this.subjects = this.subjects.without(obj);
    }
  },
  get: function(type) {
    if(type == "data") {
      var data = [];
      for(i = 0; i < this.subjects.length; i++) {
        data.push(this.subjects[i].Model.data);
      }
      return data;
    }
  }
});
//---------------

//Observers
var ZoomObserver = Class.create(Observer, {
  initialize: function($super) {
    $super();
  },

  update: function() {
    var clips = this.subjects;
    clips.each(function(clip) {
      clip.draw();
    });
  }
});

var DragObserver = Class.create({
	initialize: function(name, parent) {
		this.name = name;
		this.parent = parent;
	},

  onDrag: function(eventName, draggable, event) {
    if(draggable.element.className == 'playhead') {
      var offset = draggable.element.cumulativeOffset()[0];
      //console.log(offset)
      if(offset < FoogaUtils.settings.timelineWidth && offset >= 0) {
        var hover = draggable.element.next();
        hover.setStyle({left: offset + 'px'});
      }
    }
  },

  onStart: function(eventName, draggable, event) {
    //console.log("onStart");
    if(draggable.element.className == 'audioClip' || draggable.element.className == 'videoClip') {
	    draggable.Controller.Model.previousPlace = draggable.element.parentNode;
		  document.body.appendChild(draggable.element);
    }
    else if(draggable.element.className == 'playhead') {
    }
  },

  onEnd: function(eventName, draggable, event) {
	  //console.log("onEnd");
	  //console.log(this.parent);
    if(draggable.element.className == 'audioClip' || draggable.element.className == 'videoClip') {
      var current_timeline_element = draggable.Controller.getCurrentTimeline();
	    //console.log("AHURR CURRENT TIMELINE", draggable.Controller);
      if(current_timeline_element == undefined) {
        draggable.Controller.delete();
      }
      //If clip is dragged to a place where it doesn't belong -> send it back to where it once belonged
			else if(!Position.within(current_timeline_element, Event.pointerX(event), Event.pointerY(event))) {
  			draggable.Controller.Model.previousPlace.appendChild(draggable.element);
				draggable.element.setStyle({left: draggable.delta[0]+"px", top: draggable.delta[1]+"px"});
			}
      else {
      //Append the clip to its new timeline
        var pos = parseInt(draggable.element.style.left) + current_timeline_element.up().scrollLeft;
        pos < 0 ? pos = 0 : pos;
        //console.log("This clip offset-position ", pos);
        var mainController = draggable.Controller.getMainController();
        var zoomLevel = mainController.getZoomLevel();
        var current_timeline_element_offset = current_timeline_element.cumulativeOffset()[0];
        current_timeline_element.appendChild(draggable.element);
        draggable.Controller.setStartpoint(pos, zoomLevel, current_timeline_element_offset);
        draggable.Controller.setParent(current_timeline_element.Controller);
        draggable.Controller.update();
        mainController.Model.getChild("TimelineSliderController").resizeHandle();
        //mainController.timelineSlider.Controller.resizeHandle();
      }
		}
    else if(draggable.element.className == 'playhead') {
      //console.log(parseInt(draggable.element.next().getStyle('left')));
      draggable.Controller.setPlace(parseInt(draggable.element.next().getStyle('left')));
    }
  }
});
//---------------

//TimelineSlider-triad
var TimelineSliderModel = Class.create(Model, {
  initialize: function($super, data) {
    $super(data);
  }

});

var TimelineSliderView = Class.create(View, {
  initialize: function() {
  },

  createElement: function(Controller) {
    var mainController = Controller.getMainController();
    var element = new Element('div', {className: 'timelineSlider-wrapper'});
    var track = new Element('div', {className: 'timelineSlider-track'});
    var handle = new Element('div', {className: 'timelineSlider-handle'});

    handle.setStyle({width: FoogaUtils.settings.timelineSliderHandleWidth + 'px'});
  
    track.insert(handle);
    element.insert(track);
    mainController.getElement().insert(element);
    Controller.registerElement(element);
    this.element.handle = handle;
    this.element.track = track;
    
    return element;
  }

});

var TimelineSliderController = Class.create(Controller, {
  initialize: function($super, View, Model, parent) {
    $super(View, Model, parent);
    this.name = "TimelineSliderController";
    var element = this.View.createElement(this);
    this.boundSliderChange = this.handleSliderActions.bind(this);
    this.widget = new Control.Slider(element.down().down(), element.down(), {
      axis: 'horizontal',
      sliderValue: this.getMainController().getZoomLevel(),
      range:  $R(0.2, 16),
      values:[0.2, 0.4, 0.6, 0.8, 1, 1.2, 1.4, 1.6, 1.8, 2, 2.2, 2.4, 2.6, 2.8, 3, 3.2, 3.4, 3.6, 3.8, 4, 4.2, 4.4, 4.6, 4.8, 5, 5.2, 5.4, 5.6, 5.8, 6, 6.2, 6.4, 6.6, 6.8, 7, 7.2, 7.4, 7.6, 7.8, 8, 8.2, 8.4, 8.6, 8.8, 9, 9.2, 9.4, 9.6, 9.8, 10, 10.2, 10.4, 10.6, 10.8, 11, 11.2, 11.4, 11.6, 11.8, 12, 12.2, 12.4, 12.6, 12.8, 13, 13.2, 13.4, 13.6, 13.8, 14, 14.2, 14.4, 14.6, 14.8, 15, 15.2, 15.4, 15.6, 15.8, 16],
    });
    this.initEventHandlers();
    this.resizeHandle();
  },
  
  resizeHandle: function() {
    var timelines = this.getMainController().getTimelines('all', 'timeline'); 
    var max = timelines.max(function(timeline) {return timeline.Controller.getTimelineWidth();});
    var tlDefaultWidth = FoogaUtils.settings.timelineWidth; 
    if(max > tlDefaultWidth) {
      //If the longest timeline is longer than the timeline's Viewport
      this.widget.maximum = 1;
      var handleLength = (FoogaUtils.settings.timelineSliderHandleWidth * tlDefaultWidth) / max;
      //console.log("TL HANDLE WIDTH", handleLength);
      var handleOffset = (timelines[0].up().scollLeft * FoogaUtils.settings.timelineSliderHandleWidth) / max;
      this.widget.handleLength = handleLength;
      this.View.element.handle.setStyle({width: handleLength + 'px', left: handleOffset + 'px'});
    }
    else {
      this.widget.maximum = 0;
      this.View.element.handle.setStyle({width: FoogaUtils.settings.timelineSliderHandleWidth + 'px', left: '0px'}) ;
    }
  },

  handleSliderActions: function(value) {
    var timelines = this.getMainController().getTimelines('all', 'wrapper');
    for(i = 0; i < timelines.length; i++) {
      timelines[i].scrollLeft = Math.round(value / this.widget.maximum * 
                                  (timelines[i].scrollWidth - 
                                  timelines[i].offsetWidth));
    }
    this.resizeHandle();
  },

  initEventHandlers: function() {
    this.widget.options.onChange = this.boundSliderChange;
    this.widget.options.onSlide = this.boundSliderChange;
  }
});

var TimelineSlider = Class.create(Agent, {
  initialize: function(parent) {
    var p = new TimelineSliderView();
    var a = new TimelineSliderModel({});
    this.Controller = new TimelineSliderController(p, a, parent);
    //console.warn('Initializing ', this.Controller.name);
  }
});
//---------------

//ZoomSlider-triad
var ZoomSliderModel = Class.create(Model, {
  initialize: function($super, data) {
    $super(data);
  }
});

var ZoomSliderView = Class.create(View, {
  initialize: function() {
  },

  updateZoomValue: function(zoomLevel) {
    this.element.down('.zoomValue').update(Math.round(zoomLevel * 100) + " %");
  },
  
  createElement: function(Controller) {
    
    var mainController = Controller.getMainController();
    var increment_button = new Element('img', {className: 'increment_button', src: 'images/volume_up.gif'});
    var decrement_button = new Element('img', {className: 'decrement_button', src: 'images/volume_down.gif'});
    var zoomValue = new Element('span', {className: 'zoomValue'});
    var element = new Element('span', {className: 'zoom-widget_wrapper'});
    

    element.insert(decrement_button);
    element.insert(zoomValue);
    element.insert(increment_button);

    mainController.getElement().insert({bottom: element});
    Controller.registerElement(element);

    this.updateZoomValue(mainController.getZoomLevel());
  }
});

var ZoomSliderController = Class.create(Controller, {
  initialize: function($super, View, Model, parent) {
    $super(View, Model, parent);
    this.name = "ZoomSliderController";
    this.View.createElement(this);
    this.initEventHandlers();
  },

  initEventHandlers: function() {
    var element = this.getElement();
    var increment_button = element.down('.increment_button');
    var decrement_button = element.down('.decrement_button');
    increment_button.observe('click', this.incrementButtonHandler.bind(this));
    decrement_button.observe('click', this.decrementButtonHandler.bind(this));
    //increment_button.observe('mousedown', this.incrementButtonPressHandler.bind(this));
    //decrement_button.observe('mouseup', this.decrementButtonPressHandler.bind(this));

  },
  
  incrementButtonPressHandler: function() {
/*    this.exec = new PeriodicalExecuter(function() {
      this.incrementButtonHandler();
    }, 2);*/
  },

  decrementButtonPressHandler: function() {
/*    this.exec = new PeriodicalExecuter(function() {
      this.decrementButtonHandler();
    }, 2);*/
  },
  
  incrementButtonHandler: function() {
    var mainController = this.getMainController();
    var zoomLevel = mainController.getZoomLevel();
    var newZoomLevel = zoomLevel + 0.1;
    if(newZoomLevel <= 16){
      mainController.setZoomLevel(newZoomLevel);
      this.View.updateZoomValue(newZoomLevel);
    }
  },

  decrementButtonHandler: function() {
    var mainController = this.getMainController();
    var zoomLevel = mainController.getZoomLevel();
    var newZoomLevel = zoomLevel - 0.1;
    if(newZoomLevel >= 0){
      mainController.setZoomLevel(newZoomLevel);
      this.View.updateZoomValue(newZoomLevel);
    }
  }

});

var ZoomSlider = Class.create(Agent, {
  initialize: function(parent) {
    var p = new ZoomSliderView();
    var a = new ZoomSliderModel({});
    this.Controller = new ZoomSliderController(p, a, parent);
    console.warn('Initializing ', this.Controller.name);
  }
});
//---------------

var FoogaDraggable = Class.create(Draggable, {
  initialize: function($super, elem, options, parent) {
    $super(elem, options);
    this.Controller = parent;
    this.element.Controller = parent;
  },

  hoverCallback: function(timelineName) {
  }

});

var PlayheadModel = Class.create(Model, {
  initialize: function($super, data) {
    $super(data);
  }
});

PlayheadView = Class.create(View, {
  initialize: function() {
  },

  createElement: function(Controller) {
    var timelines = Controller.getMainController().getTimelines('all', 'timeline');
    var timeline_height = parseInt(timelines[0].up().getStyle('height'));
    var timeline_margin = parseInt(timelines[0].up().getStyle('margin-bottom'));
    var playhead_height = (timelines.length * (timeline_height + timeline_margin)) - timeline_margin;

    this.wrapper = new Element('div', {className: 'playheadWrapper'});
    this.wrapper.setStyle({
      width: FoogaUtils.settings.timelineWidth + 'px'
    });

    this.track = new Element('div', {className: 'playheadTrack'});
    this.track.setStyle({
      width: FoogaUtils.settings.timelineWidth + 'px'
    });

    this.playhead = new Element('div', {className: 'playhead'});

    this.playhead_hover = new Element('div', {className: 'playhead_hover'});
    this.playhead_hover.setStyle({
      height: playhead_height + 'px'
    });

    this.wrapper.insert(this.track);
    this.wrapper.insert(this.playhead);
    this.wrapper.insert(this.playhead_hover);

    Controller.getMainController().getElement().insert({top: this.wrapper});
    Controller.registerElement(this.wrapper);
    
  },

  draw: function(place) {
    var playhead_offset = parseInt(this.playhead.getStyle('width')) / 2;
    this.playhead.setStyle({left: place - playhead_offset + 'px'});
    this.playhead_hover.setStyle({left: place + 'px'});
  }
});

var PlayheadController = Class.create(Controller, {
  initialize: function($super, View, Model, parent) {
    $super(View, Model, parent);
    this.name = "PlayheadController";
    this.View.createElement(this);
    this.draggable = new FoogaDraggable(this.View.playhead, {
      constraint: 'horizontal'
    }, this);
    this.initEventHandlers();
  },

  initEventHandlers: function() {
    this.View.track.observe('click', this.clickManager.bindAsEventListener(this));
  },

  clickManager: function(event) {
    this.move(event.clientX - this.View.track.cumulativeOffset()[0]);
  },

  setPlace: function(place, scrollLeft) {
    //TODO make this fetch the timeline-wrappers instead of actual elements
    if(!scrollLeft) var scrollLeft = this.getMainController().getTimelines('all', 'timeline')[0].up().scrollLeft;
    
    this.Model.set('place_ms', FoogaUtils.TimeHelper.pixelsToMilliseconds(place + scrollLeft, this.getMainController().getZoomLevel()));
    //console.log('Playhead place_ms', this.Model.get('place_ms'));
  },

  move: function(place) {
    var scrollLeft = this.getMainController().getTimelines('all', 'timeline')[0].up().scrollLeft;
    this.View.draw(place + scrollLeft);
    this.setPlace(place, scrollLeft);
    
  }
});

var Playhead = Class.create(Agent, {
  initialize: function(parent) {
    var p = new PlayheadView();
    var a = new PlayheadModel({place_ms: 0});
    this.Controller = new PlayheadController(p, a, parent);
    console.warn('Initializing ', this.Controller.name);
  }
});

var LibraryController = Class.create(Controller, {
  initialize: function($super, View, Model, parent) {
    $super(View, Model, parent);
    this.name = "LibraryController";
    this.View.createElement(this);
    this.createElements(this.Model);
  },

  createElements: function(Model) {
    if(!Model.data.media_library) return;
    var data = Model.data.media_library;
    for(i = 0; i < data.length; i++) {
      new LibraryClip(data[i].type, data[i], this);
    }
  }
});

var LibraryModel = Class.create(Model, {
  initialize: function($super, data) {
    $super(data);
  }
});
var LibraryView = Class.create(View, {
  initialize: function() {
  },

  createElement: function(Controller) {
    var Model = Controller.Model;
    var element = new Element('div', {
      id: 'librarywrapper_' + Math.floor((Math.random() * 100000)),
      className: 'library_wrapper'
    });
    Controller.registerElement(element);
    element.Controller = Controller;
    //console.log(Controller);
    Controller.getMainController().getElement().appendChild(element);

  }
});

var Library = Class.create(Agent, {
  initialize: function(json, parent) {
    console.warn('Creating library...');
    var p = new LibraryView();
    var a = new LibraryModel(json);
    this.Controller = new LibraryController(p, a, parent);
    console.warn('Done creating library!');
  }
});

var LibraryClipController = Class.create(Controller, {
  initialize: function($super, View, Model, parent) {
    $super(View, Model, parent);
    this.name = "LibraryController";
    var element = this.View.createElement(this);
    element.update(
      "[" + this.Model.data.type + "] " + 
      "<b>" + this.Model.data.name + "</b><br /> " +
      FoogaUtils.TimeHelper.millisecondsToTime(
        FoogaUtils.TimeHelper.timeToMilliseconds(
          Model.data.dur_h, 
          Model.data.dur_m, 
          Model.data.dur_s, 
          Model.data.dur_ms), 
          "True"
      )
    );  
    this.initEventHandlers();
  },
  initEventHandlers: function() {
    this.View.element.observe('mousedown', this.mousedown.bindAsEventListener(this));
  },
  mousedown: function(event) {
    if(Event.isLeftClick(event)) {
      var clip = new Clip(this.Model.data.type, this.Model.data, this);
      var dragElement = clip.Controller.View.element;
          //console.log(Draggables.drags);
      for(i = 0; i < Draggables.drags.length; i++) {
        if(Draggables.drags[i].element == dragElement) {
          dragElement.setStyle({
                                left: Event.pointerX(event) - 5, 
                                top: Event.pointerY(event) - 30
                               });
          Draggables.drags[i].initDrag(event);
          break;
        }
      }
    }
  }
});

var LibraryClipView = Class.create(View, {
  initialize: function() {
  },
  createElement: function(Controller) {
    var element = new Element('div', {
      id: 'library_clip_' + Math.floor((Math.random() * 100000)),
      className: 'library_clip_' + Controller.Model.data.type
    });
    Controller.getParent().View.element.appendChild(element);
    Controller.registerElement(element);
    return element;
  }
});

var LibraryClipModel = Class.create(Model, {
  initialize: function($super, data) {
    $super(data);
  }
});

var LibraryClip = Class.create(Agent, {
  initialize: function(type, json, parent) {
    console.warn('Creating libraryclip...');
    var p = new LibraryClipView();
    var a = new LibraryClipModel(json);
    this.Controller = new LibraryClipController(p, a, parent);
    console.warn('Done creating libraryclip!');
  }
});
