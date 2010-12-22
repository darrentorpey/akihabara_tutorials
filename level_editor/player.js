// This is our function for adding the player object -- this keeps our main game code nice and clean
function addPlayer() {
  gbox.addObject({
    id:             'player_id',    // id refers to the specific object
    group:          'player',       // The rendering group
    tileset:        'player_tiles', // tileset is where the graphics come from
    starsTotal:     0,
    starsCollected: 0,
    onBox: false,
    finished: false,
    frames: {
      still:   { speed:1, frames:[1] },
      jumping: { speed:1, frames:[7] },
      walking: { speed:4, frames:[0,1,2,3,4,5] },
      falling: { speed:1, frames:[6] },
      die:     { speed:1, frames:[1] },
      pushing: { speed:6, frames:[8,9] }
    },
    pushblock: false,

    // the initialize function contains code that is run when the object is first created. In the case of the player object this only
    // happens once, at the beginning of the game, or possibly after a player dies and respawns.
    initialize: function() {
      toys.topview.initialize(this, {});

      this.resetHud();

      // And we set the starting position and jump speed for our player.
      this.x = 20;
      this.y = 20;
      this.jumpaccy = 10.5; // initial jump vel (size of jump when you tap the jump button)
      this.jumpholdtime = 0.25; // amount of time you can hold the jump, in seconds
      this.jumpaccsusy = 15.5; // jump vel while holding
      this.jumping = false; // used by the jumpKeys func
      this.maxaccx = 7;
      this.maxaccy = 20;
      this.h = 58;
      this.w = 32;
      this.bc = 0;
      this.prevaccy = 0;
      this.killed = false;
    },

    // The 'first' function is like a step function. Tt runs every frame and does calculations. It's called 'first'
    //  because it happens before the rendering, so we calculate new positions and actions and THEN render them
    first: function() {
      
      if (this.killed) this.resetGame();

    this.prevaccy = this.accy;

    if (this.starsTotal > 0) maingame.hud.setValue("total","value",this.starsTotal-this.starsCollected);

    // Counter, required for setFrame
    this.counter=(this.counter+1)%10;

    // if this is a level with stars, check to see if we've collected any
    if (this.starsTotal > 0)
      {
      tilecheck1 = help.getTileInMap(this.x+this.w/2,this.y,map,null,'map');
      tilecheck2 = help.getTileInMap(this.x+this.w/2,this.y+this.h/2,map,null,'map')
      if ((tilecheck1 == 1 || tilecheck2 == 1) && !this.finished)
        {
        if (tilecheck1 == 1) help.setTileInMapAtPixel(gbox.getCanvasContext("map_canvas"),map,this.x+this.w/2,this.y,null,"map");
        if (tilecheck2 == 1) help.setTileInMapAtPixel(gbox.getCanvasContext("map_canvas"),map,this.x+this.w/2,this.y+this.h/2,null,"map");
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
      for (var i in gbox._objects[gp]) {
        var block = gbox._objects[gp][i];
        // check to see if you're being squished by this block
        if ((!block.initialize)&&help.isSquished(this,block)) {
          this.resetGame();
          toys.platformer.bounce(block,{jumpsize:10});
        }
      }

      toys.platformer.applyGravity(this); // Apply gravity
      toys.platformer.horizontalKeys(this,{left:"left",right:"right"}); // Moves horizontally
      toys.platformer.horizontalTileCollision(this,map,"map",1); // horizontal tile collision (i.e. walls)
      toys.platformer.verticalTileCollision(this,map,"map",1); // vertical tile collision (i.e. floor)

      if (this.onBox) {
        this.touchedfloor = true;
        this.accy = 0;
        this.y = this.bc + 1;
      }

      toys.platformer.jumpKeys(this, { jump: "a", audiojump: "jump" }); // handle jumping
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
      reloadMap();
      this.x = 20;
      this.y = 20;
      this.accx = 0;
      this.accy = 0;
      this.killed = false;
      this.resetHud();
    },

    resetHud: function() {
      this.starsTotal = 0;
      this.starsCollected = 0;
      for (var y = 0; y < 30; y++)
        for (var x = 0; x < 40; x++)
          if (game.level[y][x] == '2') this.starsTotal++;

      if (this.starsTotal > 0) {
        maingame.hud.setWidget('total', { widget: 'label', font: 'small', value: this.starsTotal, dx: 48, dy: 15, clear: true });
        maingame.hud.setWidget('star', { widget: 'blit', rightalign: true, tileset: 'map_pieces', dx: 10, dy: 5, gapx: 0, gapy: 0, maxshown: 1, value: [1]});
        maingame.hud.redraw();
      } else {
        maingame.hud.setWidget("total",{widget:"label",font:"small",value:"",dx:32,dy:10,clear:true});
        maingame.hud.setWidget("star",{widget:"stack",rightalign:true,tileset:"map_pieces",dx:0,dy:0,gapx:0,gapy:0,maxshown:1,value:[]});
        maingame.hud.redraw();
      }
    }
  });
}