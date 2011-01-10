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
      onBox:false,
      blink: false
    });
    this.type = type;
    if (this.type == 1)
      {
      this.frames = {
        still:{ speed:1, frames:[1] },
        walking:{ speed:4, frames:[1] },
        jumping:{ speed:1, frames:[1] },
        falling:{ speed:1, frames:[1] },
        die: { speed:1,frames:[1] }
      };
      }
  },

  first:function() {
    if (!this.type) this.type = 0;

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
          if (this.type == 1) {
            this.blink = true;
          } else gbox.trashObject(this);
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

      if (this.type == 1) toys.platformer.auto.dontFall(this, map, 'map'); // prevent from falling from current platform
      toys.platformer.verticalTileCollision(this, map, 'map'); // vertical tile collision (i.e. floor)
      toys.platformer.horizontalTileCollision(this, map, 'map'); // horizontal tile collision (i.e. walls)
      toys.platformer.handleAccellerations(this); // gravity/attrito
      toys.platformer.setFrame(this); // set the right animation frame
      var pl = gbox.getObject('player', 'player_id');

      //player is squishing the enemy (second conditional is a hack for jumping on multiple enemies at once)
      if ((help.isSquished(this, pl) || ((pl.prevaccy > 0)) && gbox.collides(this, pl) && (Math.abs(this.y - (pl.y + pl.h)) < (pl.h)))) {
        if (gbox.keyIsHold('a')) toys.platformer.bounce(pl, { jumpsize: 25 });
          else toys.platformer.bounce(pl, { jumpsize: 15 });

        gbox.hitAudio("squish");

        if (this.type == 1)
          {
          this.blink = true;
          }
          else gbox.trashObject(this);

      } else if (gbox.collides(this, pl) && pl.x && pl.prevaccy <= 0 && !this.blink) {
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
    if (gbox.objectIsVisible(this)) {
      if (!this.blink || !(this.counter % 3))
        gbox.blitTile(gbox.getBufferContext(),{tileset:this.tileset,tile:this.frame,dx:this.x,dy:this.y,camera:this.camera,fliph:this.side,flipv:this.flipv});
    }
  }
});
}