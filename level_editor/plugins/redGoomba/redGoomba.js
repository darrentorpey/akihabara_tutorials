introduceALESPlugin({
  targetALESVersion: '0.0.1',
  sourceURL:         'plugins/redGoomba/redGoomba.js',
  name:              'Red Goomba', //For display on hover overs and in general...
  sprites:            [['red_goomba_sprite', 'plugins/redGoomba/redGoomba.png']],
  paletteImage:      'plugins/redGoomba/redGoomba.png',
  tiles: [{
    id:              'red_goomba_tileset',
    image:           'red_goomba_sprite',
    tileh:           32,
    tilew:           32,
    tilerow:         13,
    gapx:            0,
    gapy:            0
  }],
  group:             'enemies',
  tileset:           'red_goomba_tileset',
  solidFloor:        false,
  solidCeil:         false,
  solidLeft:         false,
  solidRight:        false,
  add: function(data) {
    gbox.addObject({
      tileID:     data.tileID,
      group:      this.group,
      tileset:    this.tileset,
      initialize: function() {
        toys.platformer.initialize(this, {
          frames: {
            still:    { speed: 4, frames:[0] },
            fullLava: { speed: 4, frames:[0] },
            walking:  { speed: 4, frames:[0] },
            jumping:  { speed: 4, frames:[0] },
            falling:  { speed: 4, frames:[0] },
            die:      { speed: 4, frames:[0] }
          },
          x:        data.x,
          y:        data.y,
          jumpaccy: 10,
          side:     data.side,
          onBox:    false
        });
      },

      first: function() {
    if (gbox.objectIsVisible(this) && gbox.getObject("player","player_id")) {
      // Counter
      this.counter=(this.counter+1)%10;

      var gp = 'boxes';
      // iterate through each pushblock
      for (var i in gbox._objects[gp]) {
        var block = gbox._objects[gp][i];
        // check to see if you're being squished by this block
        if ((!block.initialize) && help.isSquished(this, block)) {
          toys.platformer.bounce(block, { jumpsize: 10 });
          gbox.hitAudio('squish');
			this.blink = true;
        }

        // check to see if you're touching it on the left or right
        if (gbox.collides(this, block, 2) && this.x) {
          if ((this.accx > 1 && block.x > this.x) || (this.accx < 1 && block.x < this.x)) {
            if (this.accx > 0) this.touchedrightwall = true;
            if (this.accx < 0) this.touchedleftwall = true;
          }
        }
      }

      toys.platformer.applyGravity(this); // Apply gravity
      toys.platformer.auto.horizontalBounce(this); // Bounces horizontally if hit the sideways walls

      if (this.touchedfloor && !this.blink) // If touching the floor and not blinking (about to explode)
        toys.platformer.auto.goomba(this,{moveWhileFalling:true,speed:1.5}); // goomba movement
      else this.accx = 0; // Stay still (i.e. jump only vertically)

      toys.platformer.auto.dontFall(this, map, 'map'); // prevent from falling from current platform
      toys.platformer.verticalTileCollision(this, map, 'map'); // vertical tile collision (i.e. floor)
      toys.platformer.horizontalTileCollision(this, map, 'map'); // horizontal tile collision (i.e. walls)
      toys.platformer.handleAccellerations(this); // gravity/attrito
      toys.platformer.setFrame(this); // set the right animation frame
      var pl = gbox.getObject('player', 'player_id');

      //player is squishing the enemy (second conditional is a hack for jumping on multiple enemies at once)
      if (help.isSquished(this, pl) || ((pl.prevaccy > 0) && gbox.collides(this, pl) && (Math.abs(this.y - (pl.y + pl.h)) < (pl.h)))) {
        if (gbox.keyIsHold('a')) toys.platformer.bounce(pl, { jumpsize: 25 });
          else toys.platformer.bounce(pl, { jumpsize: 15 });

        gbox.hitAudio("squish");

          this.blink = true;

      } else if (gbox.collides(this, pl) && pl.x && pl.prevaccy <= 0) {
        pl.resetGame();
      }

      if (this.blink) {
        if (toys.timer.every(this, 'fall', 30) == toys.TOY_DONE) { // after a number of steps, explode!
          // play explosion animation & sound
          toys.generate.sparks.simple(this, 'particles', null, { animspeed: 1.5, tileset: 'explosion_tiles', accx: 0, accy: 0 });
          gbox.hitAudio('explode');
          // loop through 9 quadrants encompassing the enemy
          for (var dx = -1; dx <= 1; dx++)
            for (var dy = -1; dy <= 1; dy++) {
              // get the tile here
              var tile = help.getTileInMap(this.x+this.w/2+this.w*dx,this.y+this.h/2+this.h*dy,map,null,"map");
              // remove it unless it's a star tile or null (outside the map)
              if (tile != 1 && tile != null)
                help.setTileInMapAtPixel(gbox.getCanvasContext('map_canvas'), map, this.x + this.w/2 + this.w*dx,this.y+this.h/2+this.h*dy, null, "map");

              // check and see if there are dynamic objects here
              for (var j in gbox._groups)
                for (var i in gbox._objects[gbox._groups[j]]) {
                  var group = gbox._groups[j];
                  if (group == 'enemies' || group == 'player' || group == 'boxes' || group == 'disboxes') {
                    var other = gbox._objects[group][i];
                    if (gbox.pixelcollides({ x: this.x + this.w/2 + this.w*dx, y: this.y + this.h/2 + this.h*dy }, other)) {
                      if (group != 'player') {
                        if ((group == 'enemies' && other.type == 1) || (group == 'disboxes' && other.type == 'TNT')) {
                          other.blink = true;
                        } else gbox.trashObject(other);
                      } else other.killed = true;
                    }
                  }
                }
              }
          gbox.trashObject(this);
        }
      }
    }
      },

      blit: function() {
        // Render the current sprite.. don't worry too much about what's going on here. We're pretty much doing
        //  the default drawing function, sending along the tileset, the frame info, coordinates, whether the
        //  spries is flipped, camera info, and the alpha transparency value
		 if (!this.blink || !(this.counter % 3))
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
    });
  }
});