var maingame;
var map;

window.addEventListener('load', loadResources, false);

function loadResources() {
  // This initializes Akihabara with the default settings.
  // The title (which appears in the browser title bar) is the text we're passing to the function.
  help.akihabaraInit({ width: 640, height: 480, zoom: 1 });

  gbox.addBundle({ file: 'resources/bundle.js?' + timestamp() });

  // The 'main' function is registered as a callback: this just says that when we're done with loadAll we should call 'main'
  gbox.setCallback(main);

  // When everything is ready, the 'loadAll' downloads all the needed resources.
  gbox.loadAll();
};

function main() {
  // For Tutorial Part 3 we're adding 'background' to the next line.
  // The 'background' rendering group that we'll use for our map, and it will render before anything else because we put it first in this list
  gbox.setGroups(['background', 'player', 'game']);

  // Create a new maingame into the "gamecycle" group. Will be called "gamecycle". From now, we've to "override" some of the maingame default actions.
  maingame = gamecycle.createMaingame('game', 'game');

  // Disable the default difficulty-choice menu; we don't need it for our tutorial
  maingame.gameMenu = function() { return true; };

  // Disable the default "get ready" screen; we don't need it for our tutorial
  maingame.gameIntroAnimation = function() { return true; };
  
  maingame.pressStartIntroAnimation = function() { return true; };
  
  // Set our intro screen animation
  maingame.gameTitleIntroAnimation = function() { return true; };

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
      if (t != null && t != 3 && t != 5 && t != 6 && t!= 7) return true;
        else return false; // Is a wall if is not an empty space
      },
    tileIsSolidFloor: function(obj, t) {
      if (t != null && t != 3 && t != 5 && t != 6 && t!= 7) return true;
        else return false; // Is a wall if is not an empty space
      }
  }
 //debugger
  // This function calculates the overall height and width of the map and puts them into the 'x' and 'y' fields of the object
  map = help.finalizeTilemap(map);

  // We create a canvas that our map will be drawn to, seting its dimentions by using the map's width and height
  gbox.createCanvas('map_canvas', { w: map.w, h: map.h });

  // We draw the map onto our 'map_canvas' canvas that we created above.
  // This means that the map's 'blit' function can simply draw the 'map_canvas' to the screen to render the map
  gbox.blitTilemap(gbox.getCanvasContext('map_canvas'), map);

  // Now that we've set up our game's elements, this tells the game to run
  gbox.go();
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


// This is our function for adding the player object -- this keeps our main game code nice and clean
function addPlayer() {
  gbox.addObject({
    id:      'player_id',    // id refers to the specific object
    group:   'player',       // The rendering group
    tileset: 'player_tiles', // tileset is where the graphics come from

    // We're overriding the default colh value for the object. "colh" stands for collision height, and it's the height of our collision box. Similarly,
    //  the object automatically has values for colw (collision box width) and colx and coly (the x/y offset of the collision box).
    // We're overriding colh from its default because by default in the toys.topview object, colh is set to half the height of the sprite.
    // We have to do this because topview is normally used for Zelda-style games where the hitbox is considered to be the bottom half
    //  of the sprite so the top half can "overlap" scenery that's "behind" it. In this case we're just setting colh to the default tile height.
    colh: gbox.getTiles('player_tiles').tileh,
    

    // the initialize function contains code that is run when the object is first created. In the case of the player object this only
    // happens once, at the beginning of the game, or possibly after a player dies and respawns.
    initialize: function() {
      // Toys are helper functions that are specific to certain genres.
      // We're using the "topview" toys because we're creating a game with a top view and Akihabara provides convenient helper functions for that.

      // Here we're just telling it to initialize the object, in this case our player.
      //  The second argument provides data to initialize the object with,
      //  but in this case we don't have any, so we just pass an empty hash
      toys.topview.initialize(this, {});
      
      //Overriding the gravity function to double the usual gravity (from 1 to 2).
      toys.platformer.handleAccellerations = function(th) {
			// Gravity
			if (!th.touchedfloor) th.accy += 2;
			// Attrito
			if (th.pushing==toys.PUSH_NONE) if (th.accx) th.accx=help.goToZero(th.accx);
		},
      
      // And we set the starting position and jump speed for our player.
      this.x = 20;
      this.y = 20;
      this.jumpaccy = 16;
      this.maxaccx = 7;
    },

    // The 'first' function is like a step function. Tt runs every frame and does calculations. It's called 'first'
    //  because it happens before the rendering, so we calculate new positions and actions and THEN render them
    first: function() {
    
    // Center the camera on the player object. The map.w and map.h data tells the camera when it's hit the edge of the map so it stops scrolling.
    followCamera(gbox.getObject('player', 'player_id'), { w: map.w, h: map.h });

      if (gbox.keyIsHit("b")) {
        this.x = 20;
        this.y = 20;
      }
     
      toys.platformer.applyGravity(this); // Apply gravity
					toys.platformer.horizontalKeys(this,{left:"left",right:"right"}); // Moves horizontally
					toys.platformer.verticalTileCollision(this,map,"map",1); // vertical tile collision (i.e. floor)
					toys.platformer.horizontalTileCollision(this,map,"map",1); // horizontal tile collision (i.e. walls)
					toys.platformer.jumpKeys(this,{jump:"a",audiojump:"jump"}); // handle jumping
					toys.platformer.handleAccellerations(this); // gravity/attrito
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
  });
}