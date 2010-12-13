var maingame;
var map;

window.addEventListener('load', function() { if (start_akihabara) { loadResources() } }, false);

var bg = new Image();
bg.src = 'resources/bg0.png'

function loadResources() {
  // This initializes Akihabara with the default settings.
  // The title (which appears in the browser title bar) is the text we're passing to the function.

  help.akihabaraInit({ width: 640, height: 480, zoom: 1, title: (params.name ? params.name : 'Akihabara Live Edit') });
  document.body.style.backgroundColor="#D4D4D4";
  
  gbox.addBundle({ file: 'resources/bundle.js?' + timestamp() });

  // The 'main' function is registered as a callback: this just says that when we're done with loadAll we should call 'main'
  gbox.setCallback(main);

  // When everything is ready, the 'loadAll' downloads all the needed resources.
  gbox.loadAll();
};

function main() {
  // For Tutorial Part 3 we're adding 'background' to the next line.
  // The 'background' rendering group that we'll use for our map, and it will render before anything else because we put it first in this list
  gbox.setGroups(['background', 'boxes', 'disboxes', 'enemies', 'player', 'game']);
  gbox.setAudioChannels({jump:{volume:0.3},hit:{volume:1.0}});
  
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
          for (var y = 0; y < 30; y++)
            for (var x = 0; x < 40; x++)
              if (level[y][x] == '2') help.setTileInMapAtPixel(gbox.getCanvasContext("map_canvas"),map,x*32,y*32,1,"map");
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
    
    
  };
  
  // Here we define the map, which consists of a tileset, the actual map data, and a helper function for collision
  map = {
    tileset: 'map_pieces', // Specify that we're using the 'map_pieces' tiles that we created in the loadResources function

    // This loads an ASCII-definition of all the 'pieces' of the map as an array of integers specifying a type for each map tile
    // Each 'type' corresponds to a sprite in our tileset. For example, if a map tile has type 0, then it uses the first sprite in the
    //  map's tile set ('map_pieces', as defined above) and if a map tile has type 1, it uses the second sprite in the tile set, etc.
    // Also note that null is an allowed type for a map tile, and uses no sprite from the tile set
    map: loadMap(),

    // This function have to return true if the object 'obj' is checking if the tile 't' is a wall, so...
    tileIsSolidCeil: function(obj, t) {
      if (t != null && t != 8 && t != 5 && t != 6 && t!= 7 && t != 2 && t != 1) return true;
        else return false; // Is a wall if is not an empty space
      },
    tileIsSolidFloor: function(obj, t) {
      if (t != null && t != 8 && t != 5 && t != 6 && t!= 7 && t != 2 && t != 1) return true;
        else return false; // Is a wall if is not an empty space
      }
  }
 
  // This function calculates the overall height and width of the map and puts them into the 'x' and 'y' fields of the object
  map = help.finalizeTilemap(map);
  
      gbox.trashGroup('boxes');
      gbox.trashGroup('disboxs');
        for (var y = 0; y < 30; y++)
          for (var x = 0; x < 40; x++)
            {
            if (level[y][x] == '3') addBlock({x:x*32,y:y*32,side:true}); 
            if (level[y][x] == '1') addDisBlock({x:x*32,y:y*32,side:true}); 
            }
      gbox.trashGroup('enemies');
        for (var y = 0; y < 30; y++)
          for (var x = 0; x < 40; x++)
            if (level[y][x] == '9') addEnemy({x:x*32,y:y*32,side:true}, 0); 
       

  // We create a canvas that our map will be drawn to, seting its dimentions by using the map's width and height
  gbox.createCanvas('map_canvas', { w: map.w, h: map.h });
  
  gbox.createCanvas('bg_canvas', { w: map.w, h: map.h });
  //gbox.blitAll(gbox.getCanvasContext('bg_canvas'),bg,{dx:0,dy:0});
  for (var tx=0;tx<40;tx++)
    for(var ty=0;ty<30;ty++)
      {
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
  xbuf = 160;                 // The number of pixels from the left and right of the screen at which the camera starts following the player
  ybuf = 160;                 // The number of pixels from the top and bottom of the screen at which the camera starts following the player
  xcam = gbox.getCamera().x; // The current x-coordinate of the camera
  ycam = gbox.getCamera().y; // The current y-coordinate of the camera

  if ((obj.x - xcam) > (gbox._screenw - xbuf)) gbox.setCameraX(xcam + (obj.x - xcam) - (gbox._screenw - xbuf), viewdata);
  if ((obj.x - xcam) < (xbuf))                 gbox.setCameraX(xcam + (obj.x - xcam) - xbuf,                   viewdata);
  if ((obj.y - ycam) > (gbox._screenh - ybuf)) gbox.setCameraY(ycam + (obj.y - ycam) - (gbox._screenh - ybuf), viewdata);
  if ((obj.y - ycam) < (ybuf))                 gbox.setCameraY(ycam + (obj.y - ycam) - ybuf,                   viewdata);
}

function addEnemy(data, type) {
			
  gbox.addObject({
  group:"enemies",
  tileset:"enemy_tiles",
  initialize:function() {
    toys.platformer.initialize(this,{
      frames:{
        still:{ speed:1, frames:[0] },
        walking:{ speed:4, frames:[0] },
        jumping:{ speed:1, frames:[0] },
        falling:{ speed:1, frames:[0] },
        die: { speed:1,frames:[0] }
      },
      x:data.x,
      y:data.y,
      jumpaccy:10,
      side:data.side,
      onBox:false
    });
  },

  first:function() {
  if (!type) type = 0;

  if (gbox.objectIsVisible(this) && gbox.getObject("player","player_id")) {

    // Counter
    this.counter=(this.counter+1)%10;
    
    var gp = 'boxes';
    // iterate through each pushblock
    for (var i in gbox._objects[gp])
      {
      var block = gbox._objects[gp][i];
      // check to see if you're being squished by this blocks
      if ((!block.initialize)&&help.isSquished(this,block))
          {
          gbox.trashObject(this);
          toys.platformer.bounce(block,{jumpsize:10});
          gbox.hitAudio("squish");
          }
      // check to see if you're touching it on the left or right
      if (gbox.collides(this,block,2) && this.x)
        {
        if ((this.accx > 1 && block.x > this.x) || (this.accx < 1 && block.x < this.x)) 
          {
          if (this.accx>0) this.touchedrightwall = true;
          if (this.accx<0) this.touchedleftwall = true;
          }
        }
        
      }

      toys.platformer.applyGravity(this); // Apply gravity
      toys.platformer.auto.horizontalBounce(this); // Bounces horizontally if hit the sideways walls
      if (this.touchedfloor) // If touching the floor...
        toys.platformer.auto.goomba(this,{moveWhileFalling:true,speed:1.5}); // goomba movement
      else // Else...
        this.accx=0; // Stay still (i.e. jump only vertically)
      if (type == 1) toys.platformer.auto.dontFall(this,map,"map"); // prevent from falling from current platform
      toys.platformer.verticalTileCollision(this,map,"map"); // vertical tile collision (i.e. floor)
      // if (this.onBox) {
        // this.touchedfloor = true;
        // this.accy = 0;
        // this.y=help.yPixelToTile(map,this.y);
        // }
      toys.platformer.horizontalTileCollision(this,map,"map"); // horizontal tile collision (i.e. walls)
      toys.platformer.handleAccellerations(this); // gravity/attrito
      toys.platformer.setFrame(this); // set the right animation frame
      var pl=gbox.getObject("player","player_id");
      if (help.isSquished(this,pl)) {
        gbox.trashObject(this);
        toys.platformer.bounce(pl,{jumpsize:10});
        gbox.hitAudio("squish");
      } 
      else if (gbox.collides(this,pl,2) && pl.x)
          {
          pl.x = 20;
          pl.y = 20;
          }
          
    
    
  }
  },
  blit:function() {
    if (gbox.objectIsVisible(this))
      gbox.blitTile(gbox.getBufferContext(),{tileset:this.tileset,tile:this.frame,dx:this.x,dy:this.y,camera:this.camera,fliph:this.side,flipv:this.flipv});
  }
  });
  }

function addBlock(data) {
			
  gbox.addObject({
  group:"boxes",
  tileset:"block_tiles",
  initialize:function() {
    toys.platformer.initialize(this,{
      frames:{
        still:{ speed:1, frames:[0] },
        walking:{ speed:1, frames:[0] },
        jumping:{ speed:1, frames:[0] },
        falling:{ speed:1, frames:[0] },
        die: { speed:1,frames:[0] }
      },
      x:data.x,
      y:data.y,
      jumpaccy:10,
      prevtouchedfloor:true,
      side:data.side
    });
  },
  first:function() {
                
    if (gbox.objectIsVisible(this) && gbox.getObject("player","player_id")) {
    

      
      
      // Counter
      this.counter=(this.counter+1)%10;
      
      var pl=gbox.getObject("player","player_id");
      
      // being jumped on by player
      if ((help.isSquished(this,pl))&&(pl.x+pl.w>this.x+4)&&(pl.x<this.x+this.w-4))
      {
        pl.onBox = true;
      }
      else if (!collideGroup(pl,'boxes')) pl.onBox = false;
      
      // being pushed left/right by player
      if (gbox.collides(this,pl,4) && pl.x)
          {
          if ((pl.accx > 1 && pl.x < this.x) || (pl.accx < 1 && pl.x > this.x)) 
            {
            if (pl.accx>0) pl.accx = Math.floor(pl.accx/2);
            if (pl.accx<0) pl.accx = Math.ceil(pl.accx/2);
            this.accx = pl.accx;
            if (pl.accx>0) pl.x=this.x+7-pl.w;
            if (pl.accx<0) pl.x=this.x+this.w-7;
            //pl.pushblock = this;
            }
          }
          //else if (pl.pushblock == this) pl.pushblock = false;

    var group = 'boxes';
    
     // being pushed left/right by another box
    for (var i in gbox._objects[group])
      if ((!gbox._objects[group][i].initialize)&&gbox.collides(this,gbox._objects[group][i]))
        {
        if (gbox._objects[group][i] != this)
          {
          other = gbox._objects[group][i];
          other.accx = 0;
          if ((this.accx<0)) {
					this.accx=0;
					this.x=other.x+other.w;
					this.touchedleftwall=true;
          } 
          if ((this.accx>0)) {
            this.accx=0;
            this.x=other.x-this.w;
            this.touchedrightwall=true;
          }
          }
      }

      // being landed on by another box
    for (var i in gbox._objects[group])
      if ((!gbox._objects[group][i].initialize)&&gbox.collides(this,gbox._objects[group][i]))
        {
        if (gbox._objects[group][i] != this)
          {
          other = gbox._objects[group][i];
          if (((other.accy>=0)&&(Math.abs(this.y-(other.y+other.h))<(this.h)))&&(other.x+other.w>this.x+1)&&(other.x<this.x+this.w-1))
            {
            other.onBox = true;
            other.touchedfloor = true;
            other.accy = 0;
            other.y=help.yPixelToTile(map,other.y)+1;
            }
            //else other.onBox = false;
          }
      }
      
    var group = 'enemies';
    
     // being landed on by an enemy
    for (var i in gbox._objects[group])
      if ((!gbox._objects[group][i].initialize)&&gbox.collides(this,gbox._objects[group][i]))
        {
        if (gbox._objects[group][i] != this)
          {
          other = gbox._objects[group][i];
          if ((help.isSquished(this,other))&&(other.x+other.w>this.x+4)&&(other.x<this.x+this.w-4))
            {
            other.touchedfloor = true;
            other.accy = 0;
            other.y=help.yPixelToTile(map,other.y)+1;
            }
            else if (!collideGroup(pl,'enemies')) other.onBox = false;
          }
      }
      
      toys.platformer.applyGravity(this); // Apply gravity
      toys.platformer.verticalTileCollision(this,map,"map"); // vertical tile collision (i.e. floor)
      
      if (this.onBox) {
          this.touchedfloor = true;
          this.accy = 0;
          this.y=help.yPixelToTile(map,this.y)+3;
          }
      if (!collideGroup(this,'boxes')) this.onBox = false;
      
      if (this.onBox && this.touchedfloor) this.y=help.yPixelToTile(map,this.y);

    
      
      toys.platformer.horizontalTileCollision(this,map,"map"); // horizontal tile collision (i.e. walls)
      toys.platformer.handleAccellerations(this); // gravity/attrito
      toys.platformer.setFrame(this); // set the right animation frame
 
      if (this.touchedfloor && !this.prevtouchedfloor) gbox.hitAudio("hit");
      if (this.touchedfloor) this.prevtouchedfloor = true;
      if (!this.touchedfloor) this.prevtouchedfloor = false;
      
      // snap the block if it's overlapping a solid tile
      if (map.tileIsSolidFloor(1,help.getTileInMap(this.x+this.w,this.y+this.h/2,map,null,'map'))) this.x = help.xPixelToTile(map,this.x);
      if (map.tileIsSolidFloor(1,help.getTileInMap(this.x,this.y+this.h/2,map,null,'map'))) this.x = help.xPixelToTile(map,this.x+this.w);
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
  group:"disboxes",
  tileset:"block_tiles",
  initialize:function() {
    toys.platformer.initialize(this,{
      frames:{
        still:{ speed:1, frames:[1] },
        walking:{ speed:1, frames:[1] },
        jumping:{ speed:1, frames:[1] },
        falling:{ speed:1, frames:[1] },
        die: { speed:1,frames:[1] }
      },
      x:data.x,
      y:data.y,
      jumpaccy:10,
      side:data.side,
      onMe:null,
    });
    help.setTileInMap(gbox.getCanvasContext("map_canvas"),map,this.x/this.w,this.y/this.h,0,"map");
  },
  first:function() {
    if (gbox.objectIsVisible(this) && gbox.getObject("player","player_id")) {

    // Counter, required for setFrame
    this.counter=(this.counter+1)%10;

    for (var j in gbox._groups)
      for (var i in gbox._objects[gbox._groups[j]])
      {
        var group = gbox._groups[j];
        if (group == 'enemies' || group == 'player' || group == 'boxes')
        {
        var other = gbox._objects[group][i];
        if ((other.accy>=0)&&(other.y==this.y-other.h)&&(other.x+other.w>this.x+4)&&(other.x<this.x+this.w-4))
          {
            this.onMe = other;
            if (toys.timer.every(this,'fall',30) == toys.TOY_DONE)
              {
              help.setTileInMap(gbox.getCanvasContext("map_canvas"),map,this.x/this.w,this.y/this.h,null,"map");
              gbox.trashObject(this);
              }
            if (this.toys['fall'].timer > 0) this.alpha = 1-this.toys['fall'].timer/30.0;
          } else if (this.toys && other == this.onMe) {
          this.toys['fall'].timer = 0;
          this.alpha = 1;
          }
        }
      }

    toys.platformer.setFrame(this); // set the right animation frame
 
      
    }
  },
  blit:function() {
    if (gbox.objectIsVisible(this))
      gbox.blitTile(gbox.getBufferContext(),{tileset:this.tileset,tile:this.frame,dx:this.x,dy:this.y,camera:this.camera,fliph:this.side,flipv:this.flipv,alpha:this.alpha});
  }
  });
  }

  
// This is our function for adding the player object -- this keeps our main game code nice and clean
function addPlayer() {
  gbox.addObject({
    id:      'player_id',    // id refers to the specific object
    group:   'player',       // The rendering group
    tileset: 'player_tiles', // tileset is where the graphics come from
    starsTotal:0,
    starsCollected:0,
    // We're overriding the default colh value for the object. "colh" stands for collision height, and it's the height of our collision box. Similarly,
    //  the object automatically has values for colw (collision box width) and colx and coly (the x/y offset of the collision box).
    // We're overriding colh from its default because by default in the toys.topview object, colh is set to half the height of the sprite.
    // We have to do this because topview is normally used for Zelda-style games where the hitbox is considered to be the bottom half
    //  of the sprite so the top half can "overlap" scenery that's "behind" it. In this case we're just setting colh to the default tile height.
    onBox: false,
    finished: false,
    frames:{
        still:{ speed:1, frames:[1] },
        jumping:{ speed:1, frames:[7] },
        walking:{ speed:4, frames:[0,1,2,3,4,5] },
        falling:{ speed:1, frames:[6] },
        die: { speed:1,frames:[1] },
        pushing: { speed:6,frames:[8,9] },
      },
    pushblock:false,

    // the initialize function contains code that is run when the object is first created. In the case of the player object this only
    // happens once, at the beginning of the game, or possibly after a player dies and respawns.
    initialize: function() {
      toys.topview.initialize(this, {});
      
      //Overriding the gravity function to double the usual gravity (from 1 to 2).
      toys.platformer.handleAccellerations = function(th) {
			// Gravity
			if (!th.touchedfloor) th.accy += 2;
			// Attrito
			if (th.pushing==toys.PUSH_NONE) if (th.accx) th.accx=help.goToZero(th.accx);
		};
     
    this.resetHud();
        
      // And we set the starting position and jump speed for our player.
      this.x = 20;
      this.y = 20;
      this.jumpaccy = 15;
      this.maxaccx = 7;
      this.maxaccy = 60;
      this.h = 41;
      this.w = 23;
    },

    // The 'first' function is like a step function. Tt runs every frame and does calculations. It's called 'first'
    //  because it happens before the rendering, so we calculate new positions and actions and THEN render them
    first: function() {
    
    if (this.starsTotal > 0) maingame.hud.setValue("total","value",this.starsTotal-this.starsCollected);
    
    // Counter, required for setFrame
    this.counter=(this.counter+1)%10;

    // if this is a level with stars, check to see if we've collected any
    if (this.starsTotal > 0)
      {
      if (help.getTileInMap(this.x+this.w/2,this.y+this.h/2,map,null,'map') == 1 && !this.finished) 
        {
        //this.finished = true;
        //maingame.gameIsCompleted();
        help.setTileInMapAtPixel(gbox.getCanvasContext("map_canvas"),map,this.x+this.w/2,this.y+this.h/2,null,"map");
        this.starsCollected++;
        gbox.hitAudio("star");
        }
      
      if (this.starsCollected == this.starsTotal && !this.finished)
        {
        this.finished = true;
        maingame.gameIsCompleted();
        
        }
      }
    // Center the camera on the player object. The map.w and map.h data tells the camera when it's hit the edge of the map so it stops scrolling.
    followCamera(gbox.getObject('player', 'player_id'), { w: map.w, h: map.h });
      
      if (gbox.keyIsHit("b")) {
      
      }      
      
      if (gbox.keyIsHit("c")) {
      this.resetGame();
      }      
     
     var gp = 'boxes';
    // iterate through each pushblock
    for (var i in gbox._objects[gp])
      {
      var block = gbox._objects[gp][i];
      // check to see if you're being squished by this block
      if ((!block.initialize)&&help.isSquished(this,block))
          {
          this.resetGame();
          toys.platformer.bounce(block,{jumpsize:10});
          }
     }
      toys.platformer.applyGravity(this); // Apply gravity
					toys.platformer.horizontalKeys(this,{left:"left",right:"right"}); // Moves horizontally
					toys.platformer.verticalTileCollision(this,map,"map",1); // vertical tile collision (i.e. floor)
          
          if (this.onBox) {
          this.touchedfloor = true;
          this.accy = 0;
          this.y=help.yPixelToTile(map,this.y+9)-7;
          }
					toys.platformer.horizontalTileCollision(this,map,"map",1); // horizontal tile collision (i.e. walls)
					toys.platformer.jumpKeys(this,{jump:"a",audiojump:"jump"}); // handle jumping
          if (this.accy < 0) this.onBox = false;
					toys.platformer.handleAccellerations(this); // gravity/attrito
          
          if (this.pushing == toys.PUSH_LEFT) this.fliph = 1;
            else if (this.pushing == toys.PUSH_RIGHT) this.fliph = 0;
          
          this.frames.walking.speed = 20/(Math.abs(this.accx));
          toys.platformer.setFrame(this);
          if ((this.pushing == toys.PUSH_LEFT || this.pushing == toys.PUSH_RIGHT) && Math.abs(this.accx) <= 4) this.frame=help.decideFrame(this.counter,this.frames.pushing);
          if (Math.abs(this.accx) <= 1 && Math.abs(this.accy) <= 1) this.frame=help.decideFrame(this.counter,this.frames.still);
    },

    // the blit function is what happens during the game's draw cycle. everything related to rendering and drawing goes here
    blit: function() {
      // Render the current sprite.. don't worry too much about what's going on here. We're pretty much doing
      //  the default drawing function, sending along the tileset, the frame info, coordinates, whether the
      //  spries is flipped, camera info, and the alpha transparency value
      gbox.blitTile(gbox.getBufferContext(), {
        tileset: this.tileset,
        tile:    this.frame,
        dx:      this.x,
        dy:      this.y,
        fliph:   this.fliph,
        flipv:   this.flipv,
        camera:  this.camera,
        alpha:   1.0
      });
    },
    
    resetGame: function() {
      this.x = 20;
      this.y = 20;
      this.resetHud();
      gbox.trashGroup('enemies');
        for (var y = 0; y < 30; y++)
          for (var x = 0; x < 40; x++)
            if (level[y][x] == '9') addEnemy({x:x*32,y:y*32,side:true}, 0);
      gbox.trashGroup('boxes');
      gbox.trashGroup('disboxes');
        for (var y = 0; y < 30; y++)
          for (var x = 0; x < 40; x++)
            {
            if (level[y][x] == '3') addBlock({x:x*32,y:y*32,side:true}); 
            if (level[y][x] == '1') addDisBlock({x:x*32,y:y*32,side:true}); 
            }
            
    },
    
    resetHud: function() {
      this.starsTotal = 0;
      for (var y = 0; y < 30; y++)
        for (var x = 0; x < 40; x++)
          if (level[y][x] == '2') this.starsTotal++; 
       
      if (this.starsTotal > 0)
        {
        maingame.hud.setWidget("total",{widget:"label",font:"small",value:this.starsTotal-this.starsCollected,dx:32,dy:10,clear:true});
        maingame.hud.setWidget("star",{widget:"stack",rightalign:true,tileset:"map_pieces",dx:0,dy:0,gapx:0,gapy:0,maxshown:1,value:[1]});
        }
        else
        {
        maingame.hud.setWidget("total",{widget:"label",font:"small",value:"",dx:32,dy:10,clear:true});
        maingame.hud.setWidget("star",{widget:"stack",rightalign:true,tileset:"map_pieces",dx:0,dy:0,gapx:0,gapy:0,maxshown:1,value:[]});
        maingame.hud.redraw();
        }
    }
  });
}