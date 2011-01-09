introduceALESPlugin({
  targetALESVersion: '0.0.1',
  sourceURL:         'plugins/rotatingBox/rotatingBox.js',
  name:              'Grass', //For display on hover overs and in general...
  sprites:           [['rotating_box_sprite', 'plugins/rotatingBox/rotatingBox.png']],
  paletteImage:      'plugins/rotatingBox/rotatingBox.png',
  tiles: [{
    id:      'rotating_box_tile',  // Set a unique ID for future reference
    image:   'rotating_box_sprite',
    tileh:   32,
    tilew:   32,
    tilerow: 1,
    gapx:    0,
    gapy:    0
  }],
  group:"physics",
  tileset:"rotating_box_tile",
  solidFloor:        false,
  solidCeil:         false,
  solidLeft:         false,
  solidRight:        false,
  add: function(data) {
    gbox.addObject({
      tileID:     data.tileID,
      group:      this.group,
      tileset:    this.tileset,
		isStillColliding: false,
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
        // Counter
        this.counter = (this.counter + 1) % 10;
      	this.frame = 0;

        var pl = gbox.getObject('player', 'player_id');

          if (gbox.collides(this, pl, 0)) {
				 if(!isStillColliding){
					 console.log("Ewww. he's touching me!");
					 isStillColliding = true;
					 currentMap = gbox.map;
					 //rotate the map 90 degrees
					 var x = 0;
					 var y = 0;
					 newMap = new Array();
					 for(x=0;x<currentMap.length;x++){
						 for(y=0;y<currentMap[x].length;y++){

						 }
					 }
				 }
          }else{
				isStillColliding = false;
			 }
      },

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
      }
    });
  }
});