var maingame;
var map;
// This keeps track of how many frames have been rendered in total
var frameCount = 0;

var AkiGame = Klass.extend({
  init: function() {

  },
  start: function() {
    help.akihabaraInit({
      width:  640,
      height: 480,
      zoom:   1,
      title:  (getURLParam('name') ? getURLParam('name') : 'Akihabara Level Editor & Sharer (ALES)')
    });

    gbox.readBundleData({
      addImage: this.getImageResources(),
      addFont:  this.getFontResources(),
      addTiles: this.getTileResources(),
      addAudio: this.getAudioResources()
    }, { onLoad: null });

    gbox.setAudioChannels({ jump: { volume: 0.1 }, hit: { volume: 0.3 }, boom: { volume: 0.3 }});

    gbox.loadAll(this.setup_game);
  },

  setup_game: function() {
    console.log('Game assets loaded...');
    var self = the_game;

    // For Tutorial Part 3 we're adding 'background' to the next line.
    // The 'background' rendering group that we'll use for our map, and it will render before anything else because we put it first in this list
    var groups = ['background', 'staticboxes', 'boxes', 'disboxes', 'enemies', 'particles'];
    groups.push('player');
    groups.push('game');

    gbox.setGroups(groups);

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
              if (game.level[y][x] == '2') help.setTileInMapAtPixel(gbox.getCanvasContext("map_canvas"),map,x*32,y*32,1,"map");
          gbox.getObject('player','player_id').resetGame();
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
    maingame.initializeGame = self.initGame;

    map = self.generateMapObj();
    the_game.map = map;

    // We create a canvas that our map will be drawn to, seting its dimentions by using the map's width and height
    gbox.createCanvas('map_canvas', { w: map.w, h: map.h });

    gbox.createCanvas('bg_canvas', { w: map.w, h: map.h });

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
  },

  initGame: function() {
    console.log('initGame', this);
    // Create the 'player' (see tutorial Part 2 for a detailed explanation)
    the_game.addPlayer();

    // Here we create a map object that will draw the map onto the 'background' layer each time our game world is drawn
    the_game.addMap();
  },

  addMap: function() {
    gbox.addObject({
      id:    'background_id', // This is the object ID
      group: 'background',    // We use the 'backround' group we created above with our 'setGroups' call.
      initialize: function() {
        // reloadGamePieces();
      },

      first: function() {

      },

      // The blit function is what happens during the game's draw cycle. Everything related to rendering and drawing goes here.
      blit: function() {
        // First let's clear the whole screen. Blitfade draws a filled rectangle over the given context (in this case, the screen)
        //gbox.blitFade(gbox.getCanvasContext('map_canvas'), { alpha: 0, color:gbox.COLOR_WHITE });
        gbox.getCanvasContext('map_canvas').clearRect(0,0,640*2,480*2);
        //write the background image
        gbox.blit(gbox.getBufferContext(), gbox.getCanvas('bg_canvas'), { dx: 0, dy: 0, dw: gbox.getCanvas('bg_canvas').width, dh: gbox.getCanvas('bg_canvas').height, sourcecamera: true })


        gbox.blitTilemap(gbox.getCanvasContext('map_canvas'), map);
        gbox.blit(gbox.getBufferContext(), gbox.getCanvas('map_canvas'), { dx: 0, dy: 0, dw: gbox.getCanvas('map_canvas').width, dh: gbox.getCanvas('map_canvas').height, camera: true });


      }
    });
  },

  addPlayer: function() {
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

        // And we set the starting position for our player.
        this.x = 20;
        this.y = 20;

        // here we define the list of animations and set the default animation to start on
        // these states are completely defined by you and seperate from Akihibara. Make sure you use a colon(:) to define ID's like this. These are referenced with this.animList[id].
      // so for example, this.animList[rightDown].frames[2] would return 12-Nick
        this.animList = {
          still: {speed: 1, frames: [0]},
          right: {speed: 3, frames: [1,11]},
          rightDown: {speed: 3, frames: [2,12]},
          down: {speed: 3, frames: [3,13]},
          downLeft: {speed: 3, frames: [4,14]},
          left: {speed: 3, frames: [5,15]},
          leftUp: {speed: 3, frames: [6,16]},
          up: {speed: 3, frames: [7,17]},
          upRight: {speed: 3, frames: [8,18]}
        };

        // the starting animation for the player
        this.animIndex = "still";

      // this adds an event listener to the canvas for mousedown events
      // whenever your mouse button goes down inside the area of the canvas the goToClick function will be called
      // "CANVAS" is the default name for the canvas element and there's only one so we grab the zero index of the array returned by getElementsByTagName
      // using gbox.getCanvas(canvasID) doesn't seem to allow us to add event listeners so we can't use that to access the canvas for this purpose -Nick
      //document.getElementsByTagName("CANVAS")[0].addEventListener('mousedown', goToClick, false);

        $('canvas').mousedown(function() {
          console.log('down');
          var thePlayer = gbox.getObject('player', 'player_id');
          var cam = gbox.getCamera();

          var xPos = (event.layerX - this.offsetLeft)/2 + cam.x;
          var yPos = (event.layerY - this.offsetTop)/2 + cam.y;

          var ang = Math.atan2(yPos - (thePlayer.y + 8), xPos - (thePlayer.x + 8));

          toys.topview.fireBullet('bullets', null, {
            tileset:      'player_shot',
            collidegroup:  'background',
            from:          thePlayer,
            x:            thePlayer.x + thePlayer.colhw - 2,
            y:            thePlayer.y + thePlayer.colhh - 2,
            accx:          8 * Math.cos(ang),
            accy:          8 * Math.sin(ang),
            maxacc:        8,
            frames:        { speed: 2, frames: [0, 1] },
            upper:         true,
            camera:        true,
            map:          the_game.map,
            mapindex:      'map'
          });
        });
      },

      // The 'first' function is like a step function. Tt runs every frame and does calculations. It's called 'first'
      //  because it happens before the rendering, so we calculate new positions and actions and THEN render them
      first: function() {
        // Toys.topview.controlKeys sets the main key controls. In this case we want to use the arrow keys which
        //  are mapped to their english names. Inside this function it applies acceleration values to each of these directions
        toys.topview.controlKeys(this, { left: 'left', right: 'right', up: 'up', down: 'down' });

        // this handles different directional animation cases
        // the if statements check for accelerations in the x and y directions and whether they are positive or negative. It then sets the animation index to the keyword corresponding to that direction.-Nick
        if(this.accx == 0 && this.accy == 0) this.animIndex = "still";
        if(this.accx > 0 && this.accy == 0) this.animIndex = "right";
        if(this.accx > 0 && this.accy > 0) this.animIndex = "rightDown";
        if(this.accx == 0 && this.accy > 0) this.animIndex = "down";
        if(this.accx < 0 && this.accy > 0) this.animIndex = "downLeft";
        if(this.accx < 0 && this.accy == 0) this.animIndex = "left";
        if(this.accx < 0 && this.accy < 0) this.animIndex = "leftUp";
        if(this.accx == 0 && this.accy < 0) this.animIndex = "up";
        if(this.accx > 0 && this.accy < 0) this.animIndex = "upRight";

        // set the animation -Nick
        if(frameCount%this.animList[this.animIndex].speed == 0) this.frame = help.decideFrame(frameCount,this.animList[this.animIndex]);

        // This adds some friction to our accelerations so we stop when we're not accelerating, otherwise our game would control like Asteroids
        toys.topview.handleAccellerations(this);

        // This tells the physics engine to apply those forces
        toys.topview.applyForces(this);
        toys.topview.tileCollision(this, the_game.map, 'map', null, { tollerance: 6, approximation: 3 });
      },

      // the blit function is what happens during the game's draw cycle. everything related to rendering and drawing goes here
      blit: function() {
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
  },

  getImageResources: function() {
    return [
      ['font',                 'resources/CasualEncounter.png'],
      ['logo',                 'resources/logo.png'],
      ['player_sprite',        'resources/walk.png'],
      ['map_spritesheet',      'resources/map_pieces.png'],
      ['enemy_sprite',         'resources/enemy_sprite.png'],
      ['block_sprite',         'resources/block_sprite.png'],
      ['background_tilesheet', 'resources/bg0.png'],
      ['explosion_sprite',     'resources/Frk_Blast1.png']
    ];
  },
  getFontResources: function(){
    return [
      { id: 'small', image: 'font', firstletter: ' ', tileh: 20, tilew: 14, tilerow: 255, gapx: 0, gapy: 0 }
    ];
  },
  getTileResources: function() {
    return [
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
    }];
  },
  getAudioResources: function() {
    return [];
  },

  generateMapObj: function(){
      // Here we define the map, which consists of a tileset, the actual map data, and a helper function for collision
    var map = {
      tileset: 'map_pieces', // Specify that we're using the 'map_pieces' tiles that we created in the loadResources function

      // This loads an ASCII-definition of all the 'pieces' of the map as an array of integers specifying a type for each map tile
      // Each 'type' corresponds to a sprite in our tileset. For example, if a map tile has type 0, then it uses the first sprite in the
      //  map's tile set ('map_pieces', as defined above) and if a map tile has type 1, it uses the second sprite in the tile set, etc.
      // Also note that null is an allowed type for a map tile, and uses no sprite from the tile set
      map: loadMap(),

      tileIsSolid: function(obj, t) {
        return t != null; // Is a wall if is not an empty space
      }
    }

    // This function calculates the overall height and width of the map and puts them into the 'x' and 'y' fields of the object
    map = help.finalizeTilemap(map);
    return map;
  }
});