var maingame;
var map;

KEY_W = 87;
KEY_A = 65;
KEY_S = 83;
KEY_D = 68;

head.ready(function() {
  if (!startAkihabara) {
    console.log('NOT STARTING AKIHABARA');
  } else {
    loadResources();
  }
});

var bg = new Image();
bg.src = 'resources/bg0.png'

function loadResources() {
  // This initializes Akihabara with the default settings.
  // The title (which appears in the browser title bar) is the text we're passing to the function.

  help.akihabaraInit({ width: 640, height: 480, zoom: 1, title: (getURLParam('name') ? getURLParam('name') : 'Akihabara Level Editor & Sharer (ALES)') });

  gbox.addBundle({ file: 'resources/bundle.js?' + timestamp() });

  // The 'main' function is registered as a callback: this just says that when we're done with loadAll we should call 'main'
  gbox.setCallback(main);

  // When everything is ready, the 'loadAll' downloads all the needed resources.
  gbox.loadAll();
};

//Load all the image resources, this means plugins too!
function getImageResources(){
	//Load default resources
	var imageResources =
		[
			['font',             'resources/CasualEncounter.png'],
			['logo',             'resources/logo.png'],
			['player_sprite',    'resources/walk.png'],
			['map_spritesheet',  'resources/map_pieces.png'],
			['enemy_sprite',  'resources/enemy_sprite.png'],
			['block_sprite',  'resources/block_sprite.png'],
			['background_tilesheet',  'resources/bg1.png'],
			['explosion_sprite',  'resources/Frk_Blast1.png']
		];
	for(var plugin in loadedPlugins) {
		if (loadedPlugins[plugin].sprite) {
			imageResources.push(loadedPlugins[plugin].sprite);
		}
	}
	return imageResources;
}

//Load all the tile resources, this means plugins too!
function getTileResources(){
	//Load default resources
	var tileResources = [
		{
			id:      'map_pieces',
			image:   'map_spritesheet',
			tileh:   32,
			tilew:   32,
			tilerow: 9,
			gapx:    0,
			gapy:    0
		},
		{
			id:      'player_tiles',  // Set a unique ID for future reference
			image:   'player_sprite', // Use the 'player_sprite' image, as loaded above
			tileh:   64,
			tilew:   32,
			tilerow: 10,
			gapx:    0,
			gapy:    0
		},
		{
			id:      'block_tiles',  // Set a unique ID for future reference
			image:   'block_sprite', // Use the 'player_sprite' image, as loaded above
			tileh:   32,
			tilew:   32,
			tilerow: 3,
			gapx:    0,
			gapy:    0
		},
		{
			id:      'background_tiles',  // Set a unique ID for future reference
			image:   'background_tilesheet', // Use the 'player_sprite' image, as loaded above
			tileh:   32,
			tilew:   32,
			tilerow: 3,
			gapx:    0,
			gapy:    0
		},
		{
			id:      'enemy_tiles',  // Set a unique ID for future reference
			image:   'enemy_sprite', // Use the 'player_sprite' image, as loaded above
			tileh:   32,
			tilew:   32,
			tilerow: 2,
			gapx:    0,
			gapy:    0
		},
		{
			id:      'explosion_tiles',  // Set a unique ID for future reference
			image:   'explosion_sprite', // Use the 'player_sprite' image, as loaded above
			tileh:   96,
			tilew:   96,
			tilerow: 14,
			gapx:    0,
			gapy:    0
		}
	];
	for(var plugin in loadedPlugins){
		if(loadedPlugins[plugin].tile){
			tileResources.push(loadedPlugins[plugin].tile);
		}
	}
	return tileResources;
}
//Load all the audio resources, this means plugins too!
function getAudioResources(){
	//Load default resources
	var audioResources = [
		["jump",["resources/jump.mp3","resources/jump.ogg"],{channel:"jump"}],
		["hit",["resources/hit.mp3","resources/hit.ogg"],{channel:"hit"}],
		["squish",["resources/sword.mp3","resources/sword.ogg"],{channel:"hit"}],
		["explode",["resources/megaexplosion.mp3","resources/megaexplosion.ogg"],{channel:"boom"}],
		["star",["resources/coin.mp3","resources/coin.ogg"],{channel:"hit"}]
  	];
	for(var plugin in loadedPlugins){
		if(loadedPlugins[plugin].audio){
			audioResources.push(loadedPlugins[plugin].audio);
		}
	}
	return audioResources;
}
//Load all the font resources, this means plugins too!
function getFontResources(){
	//Load default resources
	var fontResources = [
		{ id: 'small', image: 'font', firstletter: ' ', tileh: 20, tilew: 14, tilerow: 255, gapx: 0, gapy: 0 }
	];
	for(var plugin in loadedPlugins){
		if(loadedPlugins[plugin].audio){
			fontResources.push(loadedPlugins[plugin].audio);
		}
	}
	return fontResources;
}




function main() {
  // For Tutorial Part 3 we're adding 'background' to the next line.
  // The 'background' rendering group that we'll use for our map, and it will render before anything else because we put it first in this list
  gbox.setGroups(['background', 'boxes', 'disboxes', 'enemies', 'player', 'particles', 'game']);
  gbox.setAudioChannels({ jump: { volume: 0.1 }, hit: { volume: 0.3 }, boom: { volume: 0.3 }});

  // Create a new maingame into the "gamecycle" group. Will be called "gamecycle". From now, we've to "override" some of the maingame default actions.
  maingame = gamecycle.createMaingame('game', 'game');

  // Disable the default difficulty-choice menu; we don't need it for our tutorial
  maingame.gameMenu = function() { return true; };

  // Disable the default "get ready" screen; we don't need it for our tutorial
  maingame.gameIntroAnimation = function() { return true; };

  maingame.pressStartIntroAnimation = function() { return true; };

  // Set our intro screen animation
  maingame.gameTitleIntroAnimation = function() { return true; };

  maingame.endlevelIntroAnimation = function(reset) {
       if (reset) {
         toys.resetToy(this,"default-blinker");
      } else {
        return toys.text.blink(this,"default-blinker",gbox.getBufferContext(),{font:"small",text:"WELL DONE!",valign:gbox.ALIGN_MIDDLE,halign:gbox.ALIGN_CENTER,dx:0,dy:0,dw:gbox.getScreenW(),dh:gbox.getScreenH(),blinkspeed:5,times:10});
      }
    };

    // Game ending
    maingame.gameEndingIntroAnimation = function(reset) {
      if (reset) {
        toys.resetToy(this,"default-blinker");
      } else {
        var the_level = editor.getLevelData();
          for (var y = 0; y < 30; y++)
            for (var x = 0; x < 40; x++)
              if (the_level[y][x] == '2') help.setTileInMapAtPixel(gbox.getCanvasContext("map_canvas"),map,x*32,y*32,1,"map");
          gbox.blitFade(gbox.getBufferContext(),{alpha:1});
          return toys.TOY_DONE;
      }
    };

    maingame.gameoverIntroAnimation = function(reset) {
       if (reset) {
        gbox.stopChannel("bgmusic");
        toys.resetToy(this,"default-blinker");
      } else {
        return toys.TOY_DONE;
      }
    };

  // This function will be called before the game starts running, so here is where we add our game elements
  maingame.initializeGame = function() {

    // Create the 'player' (see tutorial Part 2 for a detailed explanation)
    addPlayer();

    // Here we create a map object that will draw the map onto the 'background' layer each time our game world is drawn
    addMap();

    if (editor) {
      addEditorHelper();
    }
  };
  map = generateMapObj();

  // We create a canvas that our map will be drawn to, seting its dimentions by using the map's width and height
  gbox.createCanvas('map_canvas', { w: map.w, h: map.h });

  gbox.createCanvas('bg_canvas', { w: map.w, h: map.h });
  //gbox.blitAll(gbox.getCanvasContext('bg_canvas'),bg,{dx:0,dy:0});
  for (var tx=0; tx<40; tx++)
    for (var ty=0; ty<30; ty++) {
      gbox.blitTile(gbox.getCanvasContext('bg_canvas'),{tileset:'background_tiles',tile:0,dx:tx*32,dy:ty*32,fliph:0,flipv:0,camera:gbox.getCamera(),alpha:1});
      var rnd = Math.random();
      if (rnd < 0.05) gbox.blitTile(gbox.getCanvasContext('bg_canvas'),{tileset:'background_tiles',tile:1,dx:tx*32,dy:ty*32,fliph:0,flipv:0,camera:gbox.getCamera(),alpha:1});
        else if (rnd >= 0.05 && rnd < 0.1) gbox.blitTile(gbox.getCanvasContext('bg_canvas'),{tileset:'background_tiles',tile:2,dx:tx*32,dy:ty*32,fliph:0,flipv:0,camera:gbox.getCamera(),alpha:1});
      }

  // We draw the map onto our 'map_canvas' canvas that we created above.
  // This means that the map's 'blit' function can simply draw the 'map_canvas' to the screen to render the map
  gbox.blitTilemap(gbox.getCanvasContext('map_canvas'), map);

  // Now that we've set up our game's elements, this tells the game to run
  gbox.go();
}

// if the object is colliding with another object of a given group (do not count the object we're testing), return the object
// otherwise return false
function collideGroup(obj,group) {
  for (var i in gbox._objects[group])
    if ((!gbox._objects[group][i].initialize)&&gbox.collides(obj,gbox._objects[group][i]))
      if (gbox._objects[group][i] != obj) return gbox._objects[group][i];
  return false;
}

function followCamera(obj, viewdata) {
  // the distance from the top/bottom/left/right at which we start panning the camera
  xbufL = 32*8;
  xbufR = 32*8;
  ybufT = 32*3;
  ybufB = 32*5;
  xcam = gbox.getCamera().x; // The current x-coordinate of the camera
  ycam = gbox.getCamera().y; // The current y-coordinate of the camera
  
  // we want to center the camera on the object
  x = obj.x + obj.w/2;
  y = obj.y + obj.h/2;

  if ((x - xcam) > (gbox._screenw - xbufR)) gbox.setCameraX(xcam + (x - xcam) - (gbox._screenw - xbufR), viewdata);
  if ((x - xcam) < (xbufL))                 gbox.setCameraX(xcam + (x - xcam) - xbufL,                   viewdata);
  if ((y - ycam) > (gbox._screenh - ybufB)) gbox.setCameraY(ycam + (y - ycam) - (gbox._screenh - ybufB), viewdata);
  if ((y - ycam) < (ybufT))                 gbox.setCameraY(ycam + (y - ycam) - ybufT,                   viewdata);
}

function addBlock(data) {
gbox.addObject({
  group:   "boxes",
  tileset: "block_tiles",
  initialize: function() {
    toys.platformer.initialize(this, {
      frames: {
        still:   { speed:1, frames:[0] },
        walking: { speed:1, frames:[0] },
        jumping: { speed:1, frames:[0] },
        falling: { speed:1, frames:[0] },
        die:     { speed:1, frames:[0] }
      },
      x: data.x,
      y: data.y,
      jumpaccy: 10,
      prevtouchedfloor: true,
      side: data.side
    });
  },
  first:function() {
    if (gbox.objectIsVisible(this) && gbox.getObject("player","player_id")) {
      // Counter
      this.counter=(this.counter+1)%10;

      var pl=gbox.getObject("player","player_id");

      // being jumped on by player
      if ((help.isSquished(this,pl)) && (pl.x+pl.w>this.x+4)&&(pl.x<this.x+this.w-4)) {
        pl.onBox = true;
        pl.bc = help.yPixelToTile(map, this.y) - pl.h;
      } else if (!collideGroup(pl, 'boxes'))
        pl.onBox = false;

      // being pushed left/right by player
      if (gbox.collides(this, pl, 4) && pl.x) {
        if ((pl.accx > 1 && pl.x < this.x) || (pl.accx < 1 && pl.x > this.x)) {
          if (pl.accx > 0) pl.accx = Math.floor(pl.accx/2);
          if (pl.accx < 0) pl.accx = Math.ceil(pl.accx/2);
          this.accx = pl.accx;
          if (pl.accx > 0) pl.x = this.x + 7 - pl.w;
          if (pl.accx < 0) pl.x = this.x + this.w - 7;
        }
      }

    var group = 'boxes';

     // being pushed left/right by another box
    for (var i in gbox._objects[group])
      if ((!gbox._objects[group][i].initialize) && gbox.collides(this,gbox._objects[group][i])) {
        if (gbox._objects[group][i] != this) {
          other = gbox._objects[group][i];
          other.accx = 0;
          if ((this.accx<0)) {
            this.accx = 0;
            this.x = other.x + other.w;
            this.touchedleftwall = true;
          }
          if ((this.accx>0)) {
            this.accx = 0;
            this.x=other.x - this.w;
            this.touchedrightwall = true;
          }
        }
      }

    // being landed on by another box
    for (var i in gbox._objects[group])
      if ((!gbox._objects[group][i].initialize) && gbox.collides(this, gbox._objects[group][i])) {
        if (gbox._objects[group][i] != this) {
          other = gbox._objects[group][i];
          if (((other.accy >= 0) && (Math.abs(this.y - (other.y + other.h)) < (this.h))) && (other.x + other.w > this.x + 1) && (other.x < this.x + this.w - 1)) {
            other.onBox = true;
            other.touchedfloor = true;
            other.accy = 0;
            other.y = help.yPixelToTile(map, other.y) + 1;
          }
        }
      }

    var group = 'enemies';

     // being landed on by an enemy
    for (var i in gbox._objects[group])
      if ((!gbox._objects[group][i].initialize) && gbox.collides(this, gbox._objects[group][i])) {
        if (gbox._objects[group][i] != this) {
          other = gbox._objects[group][i];
          if ((help.isSquished(this,other))&&(other.x+other.w>this.x+4)&&(other.x<this.x+this.w-4)) {
            other.touchedfloor = true;
            other.accy = 0;
            other.y=help.yPixelToTile(map,other.y)+1;
          } else if (!collideGroup(pl,'enemies')) other.onBox = false;
        }
      }

    toys.platformer.applyGravity(this); // Apply gravity
    toys.platformer.verticalTileCollision(this, map, 'map'); // vertical tile collision (i.e. floor)

    if (this.onBox) {
      this.touchedfloor = true;
      this.accy = 0;
      this.y = help.yPixelToTile(map, this.y) + 3; // Voodoo code... Darius is "sorry"
    }
    if (!collideGroup(this, 'boxes')) this.onBox = false;

    if (this.onBox && this.touchedfloor) this.y = help.yPixelToTile(map, this.y);

    toys.platformer.horizontalTileCollision(this, map, 'map'); // horizontal tile collision (i.e. walls)
    toys.platformer.handleAccellerations(this); // gravity/attrito
    toys.platformer.setFrame(this); // set the right animation frame

    if (this.touchedfloor && !this.prevtouchedfloor) gbox.hitAudio("hit");
    if (this.touchedfloor) this.prevtouchedfloor = true;
    if (!this.touchedfloor) this.prevtouchedfloor = false;

    // snap the block if it's overlapping a solid tile
    if (map.tileIsSolidFloor(1, help.getTileInMap(this.x + this.w, this.y + this.h/2, map, null, 'map'))) this.x = help.xPixelToTile(map, this.x);
    if (map.tileIsSolidFloor(1, help.getTileInMap(this.x, this.y + this.h/2, map, null, 'map'))) this.x = help.xPixelToTile(map, this.x + this.w);
  }
  },
  blit:function() {
    if (gbox.objectIsVisible(this))
      gbox.blitTile(gbox.getBufferContext(),{tileset:this.tileset,tile:this.frame,dx:this.x,dy:this.y,camera:this.camera,fliph:this.side,flipv:this.flipv,alpha:this.alpha});
  }
  });
}

function addDisBlock(data) {
gbox.addObject({
  group:   "disboxes",
  tileset: "block_tiles",
  initialize: function() {
    toys.platformer.initialize(this,{
      frames:{
        still:{ speed:1, frames:[1] },
        walking:{ speed:1, frames:[1] },
        jumping:{ speed:1, frames:[1] },
        falling:{ speed:1, frames:[1] },
        die: { speed:1,frames:[1] }
      },
      x:     data.x,
      y:     data.y,
      blink: false,
      side:  data.side,
      onMe:  null,
      type:  data.type
    });
    if (this.type == 'TNT')
      {
      this.frames = {
        still:{ speed:1, frames:[2] },
        walking:{ speed:1, frames:[2] },
        jumping:{ speed:1, frames:[2] },
        falling:{ speed:1, frames:[2] },
        die: { speed:1,frames:[2] }
      };
      help.setTileInMap(gbox.getCanvasContext("map_canvas"),map,this.x/this.w,this.y/this.h,6,"map");
      }
    else help.setTileInMap(gbox.getCanvasContext("map_canvas"),map,this.x/this.w,this.y/this.h,0,"map");
  },
  first:function() {
    if (gbox.objectIsVisible(this) && gbox.getObject("player","player_id")) {

    // Counter, required for setFrame
    this.counter=(this.counter+1)%10;

    if (data.type != 'TNT') {
      for (var j in gbox._groups)
        for (var i in gbox._objects[gbox._groups[j]]) {
          var group = gbox._groups[j];
          if (group == 'enemies' || group == 'player' || group == 'boxes') {
            var other = gbox._objects[group][i];
            if ((other.accy>=0)&&(other.y==this.y-other.h)&&(other.x+other.w>this.x+4)&&(other.x<this.x+this.w-4)) {
              this.onMe = other;
              if (toys.timer.every(this,'fall',30) == toys.TOY_DONE) {
                help.setTileInMap(gbox.getCanvasContext('map_canvas'), map, this.x/this.w, this.y/this.h, null, "map");
                gbox.trashObject(this);
              }
              if (this.toys['fall'].timer > 0)
                this.alpha = 1 - this.toys['fall'].timer/30.0;
            } else if (this.toys && other == this.onMe) {
              this.toys['fall'].timer = 0;
              this.alpha = 1;
            }
          }
        }
    } else if (this.blink) {
        if (toys.timer.every(this,'fall',30) == toys.TOY_DONE) // after a number of steps, explode!
          {
          // play explosion animation & sound
          toys.generate.sparks.simple(this,"particles",null,{animspeed:1.5,tileset:"explosion_tiles",accx:0,accy:0});
          gbox.hitAudio("explode");
          // loop through 9 quadrants around the enemy
          for (var dx = -1; dx <= 1; dx++)
            for (var dy = -1; dy <= 1; dy++)
              {
              // remove the tile here, unless it's a star tile
              if (help.getTileInMap(this.x+this.w/2+this.w*dx,this.y+this.h/2+this.h*dy,map,null,"map") != 1)
                help.setTileInMapAtPixel(gbox.getCanvasContext("map_canvas"),map,this.x+this.w/2+this.w*dx,this.y+this.h/2+this.h*dy,null,"map");

              // check and see if there are dynamic objects here
              for (var j in gbox._groups)
                for (var i in gbox._objects[gbox._groups[j]])
                {
                  var group = gbox._groups[j];
                  if (group == 'enemies' || group == 'player' || group == 'boxes' || group == 'disboxes')
                  {
                  var other = gbox._objects[group][i];
                  if (gbox.pixelcollides({x:this.x+this.w/2+this.w*dx,y:this.y+this.h/2+this.h*dy}, other))
                    {
                      if (group != 'player')
                        {
                        if ((group == 'enemies' && other.type == 1) || (group == 'disboxes' && other.type == 'TNT')) {other.blink = true;}
                          else gbox.trashObject(other);
                        }
                        else other.killed = true;
                    }
                  }
                }
              }
          gbox.trashObject(this);
          }
        }
      toys.platformer.setFrame(this); // set the right animation frame
    }
  },
  blit:function() {
    if (gbox.objectIsVisible(this))
      if (!this.blink || !(this.counter % 3))
        gbox.blitTile(gbox.getBufferContext(),{tileset:this.tileset,tile:this.frame,dx:this.x,dy:this.y,camera:this.camera,fliph:this.side,flipv:this.flipv,alpha:this.alpha});
  }
});
}