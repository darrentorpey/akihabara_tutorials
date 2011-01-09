introduceALESPlugin({
  targetALESVersion: '0.0.1',
  sourceURL:   'plugins/physicsBox/physicsBox.js',
  name:     'Physics Box', //For display on hover overs and in general...
  sprites:    [
    ['physics_box_sprite', 'plugins/physicsBox/physicsBox.png']
  ],
  paletteImage:  'plugins/physicsBox/physicsBox.png',
  tiles: [
    {
      id:  'physics_box_tile',  // Set a unique ID for future reference
      image:  'physics_box_sprite',
      tileh:  32,
      tilew:  32,
      tilerow: 1,
      gapx:  0,
      gapy:  0
    }
  ],
  group:"boxes",
  tileset:"physics_box_tile",
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
            still:  { speed:1, frames:[0] },
            walking: { speed:1, frames:[0] },
            jumping: { speed:1, frames:[0] },
            falling: { speed:1, frames:[0] },
            die:  { speed:1, frames:[0] }
          },
          x: data.x,
          y: data.y,
          jumpaccy: 10,
          prevtouchedfloor: true,
          side: data.side
        });
        this.killed = false;
      },

      first: function() {
        if (gbox.objectIsVisible(this) && gbox.getObject("player", "player_id")) {
          if (this.killed) {
            gbox.trashObject(this);
          }
          // Counter
          this.counter = (this.counter + 1) % 10;

          var pl = gbox.getObject("player", "player_id");

          // being jumped on by player
          if ((help.isSquished(this, pl)) && (pl.x + pl.w > this.x + 4) && (pl.x < this.x + this.w - 4)) {
            pl.onBox = true;
            pl.bc = help.yPixelToTile(map, this.y) - pl.h;
          } else if (!collideGroup(pl, 'boxes')) {
            pl.onBox = false;
          }

          // being pushed left/right by player
          if (gbox.collides(this, pl, 4) && pl.x) {
            if ((pl.accx > 1 && pl.x < this.x) || (pl.accx < 1 && pl.x > this.x)) {
              if (pl.accx > 0) {
                pl.accx = Math.floor(pl.accx / 2);
              }
              if (pl.accx < 0) {
                pl.accx = Math.ceil(pl.accx / 2);
              }
              this.accx = pl.accx;
              if (pl.accx > 0) {
                pl.x = this.x + 7 - pl.w;
              }
              if (pl.accx < 0) {
                pl.x = this.x + this.w - 7;
              }
            }
          }

          var group = 'boxes';

          // being pushed left/right by another box
          for (var i in gbox._objects[group]) {
            if ((!gbox._objects[group][i].initialize) && gbox.collides(this, gbox._objects[group][i])) {
              if (gbox._objects[group][i] != this) {
                other = gbox._objects[group][i];
                other.accx = 0;
                if ((this.accx < 0)) {
                  this.accx = 0;
                  this.x = other.x + other.w;
                  this.touchedleftwall = true;
                }
                if ((this.accx > 0)) {
                  this.accx = 0;
                  this.x = other.x - this.w;
                  this.touchedrightwall = true;
                }
              }
            }
          }

          // being landed on by another box
          for (var i in gbox._objects[group]) {
            if ((!gbox._objects[group][i].initialize) && gbox.collides(this, gbox._objects[group][i])) {
              if (gbox._objects[group][i] != this) {
                other = gbox._objects[group][i];
                if (((other.accy >= 0) && (Math.abs(this.y - (other.y + other.h)) < (this.h))) && (other.x + other.w > this.x + 1) && (other.x < this.x + this.w - 1)) {
                  other.onBox = true;
                  other.touchedfloor = true;
                  other.accy = 0;
                  other.y = help.yPixelToTile(map, other.y) + 1;
                }
              }
            }
          }

          var group = 'enemies';

          // being landed on by an enemy
          for (var i in gbox._objects[group]) {
            if ((!gbox._objects[group][i].initialize) && gbox.collides(this, gbox._objects[group][i])) {
              if (gbox._objects[group][i] != this) {
                other = gbox._objects[group][i];
                if ((help.isSquished(this, other)) && (other.x + other.w > this.x + 4) && (other.x < this.x + this.w - 4)) {
                  other.touchedfloor = true;
                  other.accy = 0;
                  other.y = help.yPixelToTile(map, other.y) + 1;
                } else if (!collideGroup(pl, 'enemies')) {
                  other.onBox = false;
                }
              }
            }
          }

          toys.platformer.applyGravity(this); // Apply gravity
          toys.platformer.verticalTileCollision(this, map, 'map'); // vertical tile collision (i.e. floor)

          if (this.onBox) {
            this.touchedfloor = true;
            this.accy = 0;
            this.y = help.yPixelToTile(map, this.y) + 3; // Voodoo code... Darius is "sorry"
          }
          if (!collideGroup(this, 'boxes')) {
            this.onBox = false;
          }

          if (this.onBox && this.touchedfloor) {
            this.y = help.yPixelToTile(map, this.y);
          }

          toys.platformer.horizontalTileCollision(this, map, 'map'); // horizontal tile collision (i.e. walls)
          toys.platformer.handleAccellerations(this); // gravity/attrito
          toys.platformer.setFrame(this); // set the right animation frame

          if (this.touchedfloor && !this.prevtouchedfloor) {
            gbox.hitAudio("hit");
          }
          if (this.touchedfloor) {
            this.prevtouchedfloor = true;
          }
          if (!this.touchedfloor) {
            this.prevtouchedfloor = false;
          }

          // snap the block if it's overlapping a solid tile
          if (map.tileIsSolidFloor(1, help.getTileInMap(this.x + this.w, this.y + this.h / 2, map, null, 'map'))) {
            this.x = help.xPixelToTile(map, this.x);
          }
          if (map.tileIsSolidFloor(1, help.getTileInMap(this.x, this.y + this.h / 2, map, null, 'map'))) {
            this.x = help.xPixelToTile(map, this.x + this.w);
          }
        }
      },

      blit: function() {
        // Render the current sprite.. don't worry too much about what's going on here. We're pretty much doing
        //  the default drawing function, sending along the tileset, the frame info, coordinates, whether the
        //  spries is flipped, camera info, and the alpha transparency value
        if (gbox.objectIsVisible(this)) {
          gbox.blitTile(gbox.getBufferContext(), {
            tileset: this.tileset,
            tile:  this.frame,
            dx:  this.x,
            dy:  this.y,
            fliph:  this.fliph,
            flipv:  this.flipv,
            camera:  this.camera,
            alpha:  1.0
          });
        }
      }
    });
  }
});