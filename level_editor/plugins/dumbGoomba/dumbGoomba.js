introduceALESPlugin({
  targetALESVersion: '0.0.1',
  sourceURL:   'plugins/dumbGoomba/dumbGoomba.js',
  name:     'Dumb Goomba', //For display on hover overs and in general...
  sprites:    [
    ['dumb_goomba_sprite', 'plugins/dumbGoomba/dumbGoomba.png']
  ],
  paletteImage:  'plugins/dumbGoomba/dumbGoombaPalette.png',
  tiles: [
    {
      id:     'dumb_goomba_tileset',
      image:    'dumb_goomba_sprite',
      tileh:    32,
      tilew:    32,
      tilerow:   13,
      gapx:    0,
      gapy:    0
    }
  ],
  group:    'enemies',
  tileset:    'dumb_goomba_tileset',
  solidFloor:   false,
  solidCeil:   false,
  solidLeft:   false,
  solidRight:   false,
  add: function(data) {
    gbox.addObject({
      tileID:  data.tileID,
      group:  this.group,
      tileset:  this.tileset,
      initialize: function() {
        toys.platformer.initialize(this, {
          frames: {
            still:  { speed: 4, frames:[0] },
            fullLava: { speed: 4, frames:[0] },
            walking:  { speed: 4, frames:[0] },
            jumping:  { speed: 4, frames:[0] },
            falling:  { speed: 4, frames:[0] },
            die:  { speed: 4, frames:[0] }
          },
          x:   data.x,
          y:   data.y,
          jumpaccy: 10,
          side:  data.side,
          onBox:  false
        });
        this.killed = false;
      },

      first: function() {
        if (gbox.objectIsVisible(this) && gbox.getObject("player", "player_id")) {
          // Counter
          this.counter = (this.counter + 1) % 10;
          if (this.killed) {
            gbox.hitAudio("squish");
            gbox.trashObject(this);
          }
          var gp = 'boxes';
          // iterate through each pushblock
          for (var i in gbox._objects[gp]) {
            var block = gbox._objects[gp][i];
            // check to see if you're being squished by this block
            if ((!block.initialize) && help.isSquished(this, block)) {
              toys.platformer.bounce(block, { jumpsize: 10 });
              this.killed = true;
            }

            // check to see if you're touching it on the left or right
            if (gbox.collides(this, block, 2) && this.x) {
              if ((this.accx > 1 && block.x > this.x) || (this.accx < 1 && block.x < this.x)) {
                if (this.accx > 0) {
                  this.touchedrightwall = true;
                }
                if (this.accx < 0) {
                  this.touchedleftwall = true;
                }
              }
            }
          }

          toys.platformer.applyGravity(this); // Apply gravity
          toys.platformer.auto.horizontalBounce(this); // Bounces horizontally if hit the sideways walls

          if (this.touchedfloor && !this.blink) // If touching the floor and not blinking (about to explode)
          {
            toys.platformer.auto.goomba(this, {moveWhileFalling:true,speed:1.5});
          } // goomba movement
          else {
            this.accx = 0;
          } // Stay still (i.e. jump only vertically)

          toys.platformer.verticalTileCollision(this, map, 'map'); // vertical tile collision (i.e. floor)
          toys.platformer.horizontalTileCollision(this, map, 'map'); // horizontal tile collision (i.e. walls)
          toys.platformer.handleAccellerations(this); // gravity/attrito
          toys.platformer.setFrame(this); // set the right animation frame
          var pl = gbox.getObject('player', 'player_id');

          //player is squishing the enemy (second conditional is a hack for jumping on multiple enemies at once)
          if (help.isSquished(this, pl) || ((pl.prevaccy > 0) && gbox.collides(this, pl) && (Math.abs(this.y - (pl.y + pl.h)) < (pl.h)))) {
            if (gbox.keyIsHold('a')) {
              toys.platformer.bounce(pl, { jumpsize: 25 });
            }
            else {
              toys.platformer.bounce(pl, { jumpsize: 15 });
            }
            this.killed = true;

          } else if (gbox.collides(this, pl) && pl.x && pl.prevaccy <= 0) {
            pl.resetGame();
          }

        }
      },

      blit: function() {
        // Render the current sprite.. don't worry too much about what's going on here. We're pretty much doing
        //  the default drawing function, sending along the tileset, the frame info, coordinates, whether the
        //  spries is flipped, camera info, and the alpha transparency value
        gbox.blitTile(gbox.getBufferContext(), {
          tileset: this.tileset,
          tile:  this.frame,
          dx:  this.x,
          dy:  this.y,
          fliph:  this.side,
          flipv:  this.flipv,
          camera:  this.camera,
          alpha:  1.0
        });
      }
    });
  }
});