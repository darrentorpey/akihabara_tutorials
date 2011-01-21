akiba = {
  animation: {
    eight_way_std: {
      makeList: function() {
        return {
          still:     { speed: 1, frames: [0]     },
          right:     { speed: 3, frames: [1, 11] },
          rightDown: { speed: 3, frames: [2, 12] },
          down:      { speed: 3, frames: [3, 13] },
          downLeft:  { speed: 3, frames: [4, 14] },
          left:      { speed: 3, frames: [5, 15] },
          leftUp:    { speed: 3, frames: [6, 16] },
          up:        { speed: 3, frames: [7, 17] },
          upRight:   { speed: 3, frames: [8, 18] }
        }
      },
      startIndex: 'still'
    },

    makeAnimationList: function(obj, style, startIndex) {
      obj.animList  = this[style].makeList();
      obj.animIndex = startIndex || this[style].startIndex;

      obj.updateAnimation = function() {
        this.adjustAnimationToVelocity();

        if (frameCount % this.animList[this.animIndex].speed == 0)
          this.frame = help.decideFrame(frameCount, this.animList[this.animIndex]);
      }

      obj.adjustAnimationToVelocity = function() {
        // this handles different directional animation cases
        // the if statements check for accelerations in the x and y directions and whether they are positive or negative. It then sets the animation index to the keyword corresponding to that direction.-Nick
        if (this.accx == 0 && this.accy == 0) this.animIndex = "still";
        if (this.accx > 0  && this.accy == 0) this.animIndex = "right";
        if (this.accx > 0  && this.accy > 0)  this.animIndex = "rightDown";
        if (this.accx == 0 && this.accy > 0)  this.animIndex = "down";
        if (this.accx < 0  && this.accy > 0)  this.animIndex = "downLeft";
        if (this.accx < 0  && this.accy == 0) this.animIndex = "left";
        if (this.accx < 0  && this.accy < 0)  this.animIndex = "leftUp";
        if (this.accx == 0 && this.accy < 0)  this.animIndex = "up";
        if (this.accx > 0  && this.accy < 0)  this.animIndex = "upRight";
      }
    }
  },

  controls: {
    control_keys: {
      eight_way_std: { left: 'left', right: 'right', up: 'up', down: 'down' }
    },

    setControlKeys: function(obj, style) {
      var my_keys = this.control_keys[style];
      obj.processControlKeys = function() {
        toys.topview.controlKeys(this, my_keys);
      }
    }
  },

  physics: {
    setPhysics: function(obj, style) {
      obj.applyPhysics = function() {
        // This adds some friction to our accelerations so we stop when we're not accelerating, otherwise our game would control like Asteroids
        toys.topview.handleAccellerations(this);

        // This tells the physics engine to apply those forces
        toys.topview.applyForces(this);
        toys.topview.tileCollision(this, this.game.map, 'map', null, { tollerance: 6, approximation: 3 });
      }
    }
  },

  magic: {
    standard_blit: function() {
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

    init_topdown: function() {
      help.mergeWithModel(this, {
        x: 0, y: 0, z: 0,
        accx: 0, accy: 0, accz: 0,
        frames        : {},
        shadow        : null,
        maxacc        : 4,
        controlmaxacc : 4,
        responsive    : 0, // Responsiveness
        weapon        : 0, // Weapon
        camera        : true,
        flipv         : false,
        fliph         : false,
        facing        : toys.FACE_DOWN,
        flipside      : true,
        haspushing    : false,
        frame         : 0,
        colh          : gbox.getTiles(this.tileset).tileh,
        colw          : gbox.getTiles(this.tileset).tilew,
        colx          : 0,
        staticspeed   : 0,
        nodiagonals   : false,
        noreset       : false
      });
      if (this.coly==null) this.coly=gbox.getTiles(this.tileset).tileh-this.colh;
      this.colhh=Math.floor(this.colh/2);
      this.colhw=Math.floor(this.colw/2);

      toys.topview.spawn(this);
    }
  }
}

akiba.actors = {
  top_down_object: {
    initialize: akiba.magic.init_topdown,
    blit: akiba.magic.standard_blit,
    first: function() {
      if (this.processControlKeys) this.processControlKeys();

      this.updateAnimation();

      this.applyPhysics();
    }
  }
}