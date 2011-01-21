var AkiPlayer = Klass.extend({
  init: function() {
    
  },

  getAkiObject: function() { return {
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
    }
  };}
});