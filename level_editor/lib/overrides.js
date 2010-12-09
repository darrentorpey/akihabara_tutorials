// AKIHABARA ENGINE OVERRIDES
  
  // overriding help.isSquished with a collision fix
  help.isSquished = function(th,by) {
		return ((by.accy>0)&&gbox.collides(th,by)&&(Math.abs(th.y-(by.y+by.h))<(th.h)))
	};
  
  // overriding gbox.initScreen to reposition akihabara frame
  gbox.initScreen = function(w,h) {
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
		gbox.setCanAudio(true); // Tries to enable audio by default
		
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