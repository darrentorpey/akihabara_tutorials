introduceALESPlugin({
  targetALESVersion: '0.0.1',
  sourceURL:    'plugins/savePoint/savePoint.js',
  name:       'Save Point', //For display on hover overs and in general...
  sprites:      [
    ['savePoint_sprite', 'plugins/savePoint/savePoint.png']
  ],
  paletteImage:   'plugins/savePoint/savePointPalette.png',
  tiles: [
    {
      id:   'savePoint_tile',  // Set a unique ID for future reference
      image:  'savePoint_sprite',
      tileh:  32,
      tilew:  32,
      tilerow: 2,
      gapx:  0,
      gapy:  0
    }
  ],
  group:"savePoint",
  tileset:"savePoint_tile",
  solidFloor:    false,
  solidCeil:    false,
  solidLeft:    false,
  solidRight:    false,
  add: function(data) {
    gbox.addObject({
      tileID:   data.tileID,
      group:   this.group,
      tileset:  this.tileset,
      initialize: function() {
        toys.platformer.initialize(this, {
          frames: {
            still:  { speed:1, frames:[0] },
            walking: { speed:1, frames:[0] },
            jumping: { speed:1, frames:[0] },
            falling: { speed:1, frames:[0] },
            die:   { speed:1, frames:[0] }
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
        // Counter
        if (this.killed) {
          gbox.trashObject(this);
        }
        this.counter = (this.counter + 1) % 10;
        this.frame = 0;
        var pl = gbox.getObject('player', 'player_id');
	    if (gbox.objectIsVisible(this) && pl) {
		  if(pl.spawn.x == this.x && pl.spawn.y == this.y){
            this.frame = 1;
		  }
	      if (gbox.collides(this, pl, 0)) {
		    pl.spawn.x = this.x;
		    pl.spawn.y = this.y;
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
            dx:   this.x,
            dy:   this.y,
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