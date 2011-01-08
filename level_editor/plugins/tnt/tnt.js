introduceALESPlugin({
  targetALESVersion: '0.0.1',
  sourceURL:         'plugins/tnt/tnt.js',
  name:              'TNT', //For display on hover overs and in general...
  sprites:           [['tnt_sprite', 'plugins/tnt/tnt.png']],
  paletteImage:      'plugins/tnt/tnt.png',
  tile: [{
		id:      'tnt_tile',  // Set a unique ID for future reference
		image:   'tnt_sprite',
		tileh:   32,
		tilew:   32,
		tilerow: 1,
		gapx:    0,
		gapy:    0
  }],
  group:"boxes",
  tileset:"tnt_tile",
  solidFloor:        true,
  solidCeil:         true,
  solidLeft:         true,
  solidRight:        true,
  add: function(data) {
    gbox.addObject({
      tileID:     data.tileID,
      group:      this.group,
      tileset:    this.tileset,
      initialize: function() {
        toys.platformer.initialize(this, {
           frames: {
				  still:   { speed:1, frames:[0] },
				  walking: { speed:1, frames:[0] },
				  jumping: { speed:1, frames:[0] },
				  falling: { speed:1, frames:[0] },
				  die:     { speed:1, frames:[0] }
				},
				x: data.x,
				y: data.y,
				jumpaccy: 10,
				prevtouchedfloor: true,
				side: data.side
        });
      },

      first: function() {
		 if (gbox.objectIsVisible(this) && gbox.getObject("player","player_id")) {
			 // Counter, required for setFrame
			 this.counter=(this.counter+1)%10;
			 if (toys.timer.every(this,'fall',30) == toys.TOY_DONE) // after a number of steps, explode!
				 {
				 // play explosion animation & sound
				 toys.generate.sparks.simple(this,"particles",null,{animspeed:1.5,tileset:"explosion_tiles",accx:0,accy:0});
				 gbox.hitAudio("explode");
				 // loop through 9 quadrants around the enemy
				 for (var dx = -1; dx <= 1; dx++)
					for (var dy = -1; dy <= 1; dy++)
					  {
					  // remove the tile here, unless it's a star tile
					  if (help.getTileInMap(this.x+this.w/2+this.w*dx,this.y+this.h/2+this.h*dy,map,null,"map") != 1)
						 help.setTileInMapAtPixel(gbox.getCanvasContext("map_canvas"),map,this.x+this.w/2+this.w*dx,this.y+this.h/2+this.h*dy,null,"map");

					  // check and see if there are dynamic objects here
					  for (var j in gbox._groups)
						 for (var i in gbox._objects[gbox._groups[j]])
						 {
							var group = gbox._groups[j];
							if (group == 'enemies' || group == 'player' || group == 'boxes' || group == 'disboxes')
							{
							var other = gbox._objects[group][i];
							if (gbox.pixelcollides({x:this.x+this.w/2+this.w*dx,y:this.y+this.h/2+this.h*dy}, other))
							  {
								 if (group != 'player')
									{
									if ((group == 'enemies' && other.type == 1) || (group == 'disboxes' && other.type == 'TNT')) {other.blink = true;}
									  else gbox.trashObject(other);
									}
									else other.killed = true;
							  }
							}
						 }
					  }
				 gbox.trashObject(this);
			 }
        }
      },

      blit: function() {
        // Render the current sprite.. don't worry too much about what's going on here. We're pretty much doing
        //  the default drawing function, sending along the tileset, the frame info, coordinates, whether the
        //  spries is flipped, camera info, and the alpha transparency value
		  if (gbox.objectIsVisible(this) && !this.blink || !(this.counter % 3)){
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
      }
    });
  }
});