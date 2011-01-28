var maingame;
var map;
var frameCount = 0;

var AkiGame = Klass.extend({
  init: function() {},

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
    var self = the_game;

    // For Tutorial Part 3 we're adding 'background' to the next line.
    // The 'background' rendering group that we'll use for our map, and it will render before anything else because we put it first in this list
    var groups = ['background', 'staticboxes', 'boxes', 'disboxes', 'enemies', 'particles'];
    groups.push('player');
    groups.push('bullets');
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
    // Create the 'player' (see tutorial Part 2 for a detailed explanation)
    the_game.addPlayer();

    the_game.addEnemies();

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

      first: function() {},

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
    the_game.player_one = new AkiPlayer({
      aki_attributes: {
        id:   'player_id',
        game: the_game,
        x:    50,
        y:    50
      }
    });
    gbox.addObject(the_game.player_one.getAkiObject());

    $('canvas').mousedown(function() {
      var thePlayer = gbox.getObject('player', 'player_id');
      var cam = gbox.getCamera();

      var xPos = event.layerX - this.offsetLeft + cam.x;
      var yPos = event.layerY - this.offsetTop + cam.y;

      var ang = Math.atan2(yPos - (thePlayer.y + 8), xPos - (thePlayer.x + 8));

      toys.topview.fireBullet('bullets', null, {
        tileset:      'player_shot',
        collidegroup: 'enemies',
        from:         thePlayer,
        x:            thePlayer.x + thePlayer.colhw - 2,
        y:            thePlayer.y + thePlayer.colhh - 2,
        accx:         8 * Math.cos(ang),
        accy:         8 * Math.sin(ang),
        maxacc:       8,
        frames:       { speed: 2, frames: [0, 1] },
        upper:        true,
        camera:       true,
        map:          the_game.map,
        mapindex:     'map'
      });
    });
  },

  addEnemies: function() {
    var aki_box = new YellowDot({
      aki_attributes: {
        id:   'box_1',
        game: the_game,
        x:    150,
        y:    150
      }
    });
    gbox.addObject(aki_box.getAkiObject());

    var aki_box2 = new YellowDot({
      aki_attributes: {
        id:   'box_2',
        game: the_game,
        x:    400,
        y:    250
      }
    });
    gbox.addObject(aki_box2.getAkiObject());

    makeYellowDot(50,  150);
    makeYellowDot(50,  425);
    makeYellowDot(300, 350);
    makeYellowDot(450, 200);
    makeYellowDot(500, 400);
  },

  getImageResources: function() {
    return [
      ['font',                 'resources/CasualEncounter.png'],
      ['logo',                 'resources/logo.png'],
      ['player_sprite',        'games/8by5/images/player_sprite.png'],
      ['enemy_sprite',         'games/8by5/images/enemy_sprite.png'],
      ['player_bullet',        'games/8by5/images/bullet.png'],
      ['map_spritesheet',      'resources/map_pieces.png'],
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
      tileh:   16,
      tilew:   16,
      tilerow: 10,
      gapx:    0,
      gapy:    0
    },
    {
      id:       'player_shot',
      image:    'player_bullet',
      tileh:    4,
      tilew:    4,
      tilerow:  2,
      gapx:     0,
      gapy:     0
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
      id:      'enemy_tiles',
      image:   'enemy_sprite',
      tileh:   16,
      tilew:   16,
      tilerow: 19,
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
    }];
  },

  getAudioResources: function() { return []; },

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

var EightByFive = AkiGame.extend({
  init: function() {
    debug.log('Starting 8by5...');

    this.scanner = new Scanner();

    this.turret_1 = new Turret();
    this.turret_2 = new Turret();
    this.turret_3 = new Turret();

    this.base = new Base();

    $aki.controls.watchKeys({
      B: function() {
        makeYellowDot(150, 50);
      },
      C: function() {
        makeYellowDot(50, 200);
      }
    });
  }
});

// Try these out in the console:
//  the_game.scanner.shoot(the_game.turret_2);
//  the_game.base.spawnTurret()