// AKIHABARA ENGINE OVERRIDES

// Overriding help.isSquished with a collision fix
help.isSquished = function(th,by) {
  return ((by.accy>0)&&gbox.collides(th,by)&&(Math.abs(th.y-(by.y+by.h))<(by.h)))
};

// Overriding the gravity function to increase the usual gravity (from 1 to 2.5).
toys.platformer.handleAccellerations = function(th) {
  // Gravity
  if (!th.touchedfloor) th.accy += 2.75;
  // Attrito
  if (th.pushing==toys.PUSH_NONE) if (th.accx) th.accx=help.goToZero(th.accx);
};

// overriding toys.platformer.verticalTileCollision to make a four-point collision check
// (topleft, topright, bottomleft, bottomright) instead of a two-point collision check (top-middle, bottom-middle)
toys.platformer.verticalTileCollision = function(th,map,tilemap) {
  var bottomleft=help.getTileInMap(th.x+4,th.y+th.h,map,0,tilemap);
  var topleft=help.getTileInMap(th.x+4,th.y,map,0,tilemap);
  var bottomright=help.getTileInMap(th.x+th.w-4,th.y+th.h,map,0,tilemap);
  var topright=help.getTileInMap(th.x+th.w-4,th.y,map,0,tilemap);
  th.touchedfloor=false;
  th.touchedceil=false;

  if (map.tileIsSolidCeil(th,topleft) || map.tileIsSolidCeil(th,topright)) {
    th.accy=0;
    th.y=help.yPixelToTile(map,th.y,1);
    th.touchedceil=true;
  }

  if (map.tileIsSolidFloor(th,bottomleft) || map.tileIsSolidFloor(th,bottomright)) {
    th.accy=0;
    th.y=help.yPixelToTile(map,th.y+th.h)-th.h;
    th.touchedfloor=true;
  }
};

toys.platformer.horizontalTileCollision = function(th,map,tilemap,precision) {
  var left=0;
  var right=0;
  var t=16;

  th.touchedleftwall=false;
  th.touchedrightwall=false;
  
  while (t<th.h-16) {
    left=help.getTileInMap(th.x,th.y+t,map,0,tilemap);
    right=help.getTileInMap(th.x+th.w-1,th.y+t,map,0,tilemap);
	    
    if ((th.accx<0)&&map.tileIsSolidFloor(th,left)) {
	    th.accx=0;
	    th.x=help.xPixelToTile(map,th.x-1,1);
	    th.touchedleftwall=true;
    } 
    if ((th.accx>0)&&map.tileIsSolidFloor(th,right)) {
	    th.accx=0;
	    th.x=help.xPixelToTile(map,th.x+th.w)-th.w;
	    th.touchedrightwall=true;
    }
    t+=gbox.getTiles(map.tileset).tileh/(precision?precision:1);
  }
};

// overriding toys.platformer.jumpKeys to NOT jump if the player is holding down Ctrl (so you don't jump on Undo)
// also changing the variable-height jump code
toys.platformer.jumpKeys = function(th, key) {
  if (gbox._keyboard[17] != 1) {
    if ((toys.platformer.canJump(th)||(key.doublejump&&(th.accy>=0)))&&gbox.keyIsHit(key.jump)) {
      if (key.audiojump) gbox.hitAudio(key.audiojump);
      th.accy=-th.jumpaccy;
      toys.timer.real(th,'jump',{});
      return true;
    } else if (th.jumpholdtime&&gbox.keyIsHold(key.jump)&&!toys._maketoy(th,'jump')) { // Jump modulation
        if (toys.timer.real(th,'jump',{}) != toys.TOY_DONE) {
            if (th.toys['jump'].realtime < th.jumpholdtime)
                  th.accy=-th.jumpaccsusy;
          }
    } else
      {  
      toys.resetToy(th,'jump');
      }
  }
    return false;  
};

// overriding toys.timer.real to provide a th.toys[id].realtime variable that tells you the time in seconds and milliseconds
toys.timer.real = function(th,id,data) {
			if (toys._maketoy(th,id)) {
				th.toys[id].subtimer=gbox.getFps();
				th.toys[id].done=false;
				if (data.countdown) {
					th.toys[id].time=data.countdown;
          th.toys[id].realtime=data.countdown;
        }
				else {
					th.toys[id].time=0;
          th.toys[id].realtime=0;
        }
			}
			th.toys[id].subtimer--;
      if (data.countdown) th.toys[id].realtime = th.toys[id].time + th.toys[id].subtimer/gbox.getFps();
        else  th.toys[id].realtime = th.toys[id].time + (1 - th.toys[id].subtimer/gbox.getFps());
			
      if (!th.toys[id].subtimer) {
				th.toys[id].subtimer=gbox.getFps();
				if (data.countdown) {
					if (th.toys[id].time) {
						th.toys[id].time--;
            th.toys[id].realtime = th.toys[id].time;
						if (data.audiocritical&&(th.toys[id].time<=data.critical))
							gbox.hitAudio(data.audiocritical);
					} else th.toys[id].done=true;
				} else
					{
            th.toys[id].time++;
            th.toys[id].realtime = th.toys[id].time;
          }
			}
			return toys._toyfrombool(th,id,th.toys[id].done);

		};

// fixing a bug in gbox._keydown where some keys that are set to -1 won't ever register as down
gbox._keydown = function(e) {
  if (!gbox._passKeysThrough && e.preventDefault) e.preventDefault();
  var key=(e.fake||window.event?e.keyCode:e.which);
  gbox._keyboard[key] = 1;
};

if (!gameOnlyMode) {
  // overriding gbox.initScreen to reposition akihabara frame
  gbox.initScreen = function(w, h) {
    var container=document.createElement("a");
    container.style.width=640;
    container.style.height=480;
    //container.style.display="table";
    this._box=document.createElement("a");

    this._screen=document.createElement("canvas");
    this._screen.style.border="1px solid black";
    this._screen.setAttribute('height',h);
    this._screen.setAttribute('width',w);
    this._screen.style.width=(w*this._zoom)+"px";
    this._screen.style.height=(h*this._zoom)+"px";
    this._screenh=h;
    this._screenw=w;
    this._screenhh=Math.floor(h/2);
    this._screenhw=Math.floor(w/2);
    this._camera.x=0;
    this._camera.y=0;
    this._camera.h=h;
    this._camera.w=w;
    this._box.appendChild(this._screen);
    container.appendChild(this._box);
    document.getElementById("container").appendChild(container);

    this.createCanvas("_buffer");
    gbox.addEventListener(window,'keydown', this._keydown);
    gbox.addEventListener(window,'keyup', this._keyup);
    if (this._statbar) {
      this._statbar=document.createElement("div");
      if (this._border) this._statbar.style.border="1px solid black";
      this._statbar.style.margin="auto";
      this._statbar.style.backgroundColor="#ffffff";
      this._statbar.style.fontSize="10px";
      this._statbar.style.fontFamily="sans-serif";
      this._statbar.style.width=(w*this._zoom)+"px";
      this._box.appendChild(this._statbar);
    }
    // Keyboard support on devices that needs focus (like iPad) - actually is not working for a bug on WebKit's "focus" command.
    this._keyboardpicker=document.createElement("input");
    this._keyboardpicker.onclick=function(evt) { gbox._hidekeyboardpicker();evt.preventDefault();evt.stopPropagation();};
    this._hidekeyboardpicker(this._keyboardpicker);

    gbox._box.appendChild(this._keyboardpicker);
    gbox._screen.ontouchstart=function(evt) { gbox._screenposition=gbox._domgetabsposition(gbox._screen);if (evt.touches[0].pageY-gbox._screenposition.y<30) gbox._showkeyboardpicker();else gbox._hidekeyboardpicker();evt.preventDefault();evt.stopPropagation();};
    gbox._screen.ontouchend=function(evt) {evt.preventDefault();evt.stopPropagation();};
    gbox._screen.ontouchmove=function(evt) { evt.preventDefault();evt.stopPropagation();};
    gbox._screen.onmousedown=function(evt) {gbox._screenposition=gbox._domgetabsposition(gbox._screen);if (evt.pageY-gbox._screenposition.y<30)  gbox._showkeyboardpicker(); else gbox._hidekeyboardpicker();evt.preventDefault();evt.stopPropagation();};

    var d=new Date();
    gbox._sessioncache=d.getDate()+"-"+d.getMonth()+"-"+d.getFullYear()+"-"+d.getHours()+"-"+d.getMinutes()+"-"+d.getSeconds();

    gbox._loadsettings(); // Load default configuration
    gbox.setCanAudio($config.use_audio); // Tries to enable audio by default

    switch (gbox._flags.fse) { // Initialize FSEs
      case "scanlines": {
        gbox.createCanvas("-gbox-fse",{w:w,h:h});
        gbox.getCanvasContext("-gbox-fse").save();
        gbox.getCanvasContext("-gbox-fse").globalAlpha=0.2;
        gbox.getCanvasContext("-gbox-fse").fillStyle = gbox.COLOR_BLACK;
        for (var j=0;j<h;j+=2)
          gbox.getCanvasContext("-gbox-fse").fillRect(0,j,w,1);
        gbox.getCanvasContext("-gbox-fse").restore();
        gbox._localflags.fse=true;
        break;
      }
      case "lcd":{
        gbox.createCanvas("-gbox-fse-old",{w:w,h:h});
        gbox.createCanvas("-gbox-fse-new",{w:w,h:h});
        gbox._localflags.fse=true;
        break;
      }
    }
  };
} else { // game-only mode
  gbox.initScreen = function(w, h) {
    document.body.style.textAlign="center";
    document.body.style.height="100%";
    document.body.style.margin="0px";
    document.body.style.padding="0px";
    document.getElementsByTagName("html")[0].style.height="100%";

    var container=document.createElement("div");
    container.style.width="100%";
    container.style.height="100%";
    container.style.display="table";
    this._box=document.createElement("div");
    this._box.style.display="table-cell";
    this._box.style.width="100%";
    this._box.style.textAlign="center";
    this._box.style.verticalAlign="middle";

    this._screen=document.createElement("canvas");
    if (this._border) this._screen.style.border="1px solid black";
    this._screen.setAttribute('height',h);
    this._screen.setAttribute('width',w);
    this._screen.style.width=(w*this._zoom)+"px";
    this._screen.style.height=(h*this._zoom)+"px";
    this._screen.setAttribute('id','aki');
    this._screenh=h;
    this._screenw=w;
    this._screenhh=Math.floor(h/2);
    this._screenhw=Math.floor(w/2);
    this._camera.x=0;
    this._camera.y=0;
    this._camera.h=h;
    this._camera.w=w;
    this._box.appendChild(this._screen);
    container.appendChild(this._box);
    document.getElementById('container').appendChild(container);

    this.createCanvas("_buffer");
    gbox.addEventListener(window,'keydown', this._keydown);
    gbox.addEventListener(window,'keyup', this._keyup);
    if (this._statbar) {
      this._statbar=document.createElement("div");
      if (this._border) this._statbar.style.border="1px solid black";
      this._statbar.style.margin="auto";
      this._statbar.style.backgroundColor="#ffffff";
      this._statbar.style.fontSize="10px";
      this._statbar.style.fontFamily="sans-serif";
      this._statbar.style.width=(w*this._zoom)+"px";
      this._box.appendChild(this._statbar);
    }
    // Keyboard support on devices that needs focus (like iPad) - actually is not working for a bug on WebKit's "focus" command.
    this._keyboardpicker=document.createElement("input");
    this._keyboardpicker.onclick=function(evt) { gbox._hidekeyboardpicker();evt.preventDefault();evt.stopPropagation();};
    this._hidekeyboardpicker(this._keyboardpicker);

    gbox._box.appendChild(this._keyboardpicker);
    gbox._screen.ontouchstart=function(evt) { gbox._screenposition=gbox._domgetabsposition(gbox._screen);if (evt.touches[0].pageY-gbox._screenposition.y<30) gbox._showkeyboardpicker();else gbox._hidekeyboardpicker();evt.preventDefault();evt.stopPropagation();};
    gbox._screen.ontouchend=function(evt) {evt.preventDefault();evt.stopPropagation();};
    gbox._screen.ontouchmove=function(evt) { evt.preventDefault();evt.stopPropagation();};
    gbox._screen.onmousedown=function(evt) {gbox._screenposition=gbox._domgetabsposition(gbox._screen);if (evt.pageY-gbox._screenposition.y<30)  gbox._showkeyboardpicker(); else gbox._hidekeyboardpicker();evt.preventDefault();evt.stopPropagation();};

    var d=new Date();
    gbox._sessioncache=d.getDate()+"-"+d.getMonth()+"-"+d.getFullYear()+"-"+d.getHours()+"-"+d.getMinutes()+"-"+d.getSeconds();

    gbox._loadsettings(); // Load default configuration
    gbox.setCanAudio($config.use_audio); // Tries to enable audio by default

    switch (gbox._flags.fse) { // Initialize FSEs
      case "scanlines": {
        gbox.createCanvas("-gbox-fse",{w:w,h:h});
        gbox.getCanvasContext("-gbox-fse").save();
        gbox.getCanvasContext("-gbox-fse").globalAlpha=0.2;
        gbox.getCanvasContext("-gbox-fse").fillStyle = gbox.COLOR_BLACK;
        for (var j=0;j<h;j+=2)
          gbox.getCanvasContext("-gbox-fse").fillRect(0,j,w,1);
        gbox.getCanvasContext("-gbox-fse").restore();
        gbox._localflags.fse=true;
        break;
      }
      case "lcd":{
        gbox.createCanvas("-gbox-fse-old",{w:w,h:h});
        gbox.createCanvas("-gbox-fse-new",{w:w,h:h});
        gbox._localflags.fse=true;
        break;
      }
    }
  };
}

if (!gameOnlyMode)
  // overriding help.akihabaraInit to have better default title behavior (first check for explicit title, then check doc title, then do default)
   help.akihabaraInit = function(data) {
    if ((typeof data).toLowerCase() == "string") data={title:data};
    var device=this.getDeviceConfig();
    var footnotes=["MADE WITH AKIHABARA (C)2010 - GPL2/MIT","Project: www.kesiev.com/akihabara","Sources: github.com/kesiev/akihabara"];
    if (data.title) document.title = data.title;
      else if (!document.title) document.title = "Akihabara";
    if (data.splash) {
      if (data.splash.footnotes)
        for (var i=0;i<footnotes.length;i++) data.splash.footnotes.push(footnotes[i]);
      gbox.setSplashSettings(data.splash);
    }
    var screenwidth=(data.width?data.width:(data.portrait?240:320));
    var screenheight=(data.height?data.height:(data.portrait?320:240));
    if (device.iswii) {
      gbox._keymap={
        left:175,
        right:176,
        up:177,
        down:178,
        a:173,
        b:172,
        c:13
      };
      document.onkeypress= function(e){ if (e.preventDefault) e.preventDefault(); return false};
    }
    if (!data.splash||(data.splash.minilogo==null)) gbox.setSplashSettings({minilogo:"logo"});
    if (!data.splash||(data.splash.background==null)) gbox.setSplashSettings({background:"akihabara/splash.png"});
    if (!data.splash||(data.splash.minimalTime==null)) gbox.setSplashSettings({minimalTime:3000});
    if (!data.splash||(data.splash.footnotes==null)) gbox.setSplashSettings({footnotes:footnotes});
    if (!data||!data.hardwareonly) {
      if ((typeof(jQuery) == 'undefined') || jQuery('body').css('backgroundColor') == '') {
        document.body.style.backgroundColor="#000000";
      }
      gbox.setScreenBorder(false);
    }
    if (help.geturlparameter("statusbar")) gbox.setStatusBar(1);
    if (help.geturlparameter("db")||device.doublebuffering) gbox.setDoubleBuffering(true);
    if (help.geturlparameter("noautoskip")) gbox.setAutoskip(null);
    if (help.geturlparameter("zoom")) gbox.setZoom(help.geturlparameter("zoom")); else
         if (help.isDefined(data.zoom)) gbox.setZoom(data.zoom); else
      if (help.isDefined(device.zoom)) gbox.setZoom(device.zoom); else
      if (help.isDefined(device.width)) gbox.setZoom(device.width/screenwidth); else
      if (help.isDefined(device.height)) gbox.setZoom(device.height/screenheight);

    if (help.geturlparameter("fps")) gbox.setFps(help.geturlparameter("fps")*1);
      else gbox.setFps((data.fps?data.fps:25));
    if (help.geturlparameter("fskip")) gbox.setFrameskip(help.geturlparameter("fskip"));
    if (help.geturlparameter("forcedidle")) gbox.setForcedIdle(help.geturlparameter("forcedidle")*1);
      else if (help.isDefined(device.forcedidle)) gbox.setForcedIdle(device.forcedidle);
    if (help.geturlparameter("canlog")) gbox.setCanLog(true);

    if (!data||!data.hardwareonly) gbox.initScreen(screenwidth,screenheight);

    if (help.geturlparameter("showplayers")) gbox.setShowPlayers(help.geturlparameter("showplayers")=="yes");
    if (help.geturlparameter("canaudio")) gbox.setCanAudio(help.geturlparameter("canaudio")=="yes"); //else
      //gbox.setCanAudio(device.canaudio&&(!device.audioisexperimental||gbox.getFlag("experimental")));
    if (help.geturlparameter("audiocompatmode")) gbox.setAudioCompatMode(help.geturlparameter("audiocompatmode")*1); else
      if (help.isDefined(device.audiocompatmode)) gbox.setAudioCompatMode(device.audiocompatmode);
    if (help.geturlparameter("audioteam")) gbox.setAudioTeam(help.geturlparameter("audioteam")*1); else
      if (help.isDefined(device.audioteam)) gbox.setAudioTeam(device.audioteam);
    if (help.geturlparameter("loweraudioteam")) gbox.setLowerAudioTeam(help.geturlparameter("loweraudioteam")*1); else
      if (help.isDefined(device.loweraudioteam)) gbox.setLowerAudioTeam(device.loweraudioteam);
    if (help.geturlparameter("audiocreatemode")) gbox.setAudioCreateMode(help.geturlparameter("audiocreatemode")*1); else
      if (help.isDefined(device.audiocreatemode)) gbox.setAudioCreateMode(device.audiocreatemode);
    if (help.geturlparameter("audiodequeuetime")) gbox.setAudioDequeueTime(help.geturlparameter("audiodequeuetime")*1); else
      if (help.isDefined(device.audiodequeuetime)) gbox.setAudioDequeueTime(device.audiodequeuetime);
    if (help.geturlparameter("audiopositiondelay")) gbox.setAudioPositionDelay(help.geturlparameter("audiopositiondelay")*1); else
      if (help.isDefined(device.audiopositiondelay)) gbox.setAudioPositionDelay(device.audiopositiondelay);
    if (help.geturlparameter("forcedmimeaudio")) gbox.setForcedMimeAudio(help.geturlparameter("forcedmimeaudio")); else
      if (help.isDefined(device.forcedmimeaudio)) gbox.setForcedMimeAudio(device.forcedmimeaudio);
    if (help.geturlparameter("audioissinglechannel")) gbox.setAudioIsSingleChannel(help.geturlparameter("audioissinglechannel")=="yes"); else
      if (help.isDefined(device.audioissinglechannel)) gbox.setAudioIsSingleChannel(device.audioissinglechannel);


    if (!data||!data.hardwareonly) {
      if (help.geturlparameter("touch")=="no");
        else if ((help.geturlparameter("touch")=="yes")||device.touch)
          switch (data.padmode) {
            case "fretboard": {
              iphofretboard.initialize({h:100,bg:"akihabara/fretboard.png"});
              break;
            }
            case "none": {
              break;
            }
            default: {
              iphopad.initialize({h:100,dpad:"akihabara/dpad.png",buttons:"akihabara/buttons.png",bg:"akihabara/padbg.png"});
              break;
            }
          }
    }

    return device;
  };

help.geturlparameter = getURLParam;