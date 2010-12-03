function addMap() {
  loadMap(null, function() {
    console.log('done loading map image');

    gbox.addObject({
      id:    'background_id', // This is the object ID
      group: 'background',    // We use the 'backround' group we created above with our 'setGroups' call.

      // The blit function is what happens during the game's draw cycle. Everything related to rendering and drawing goes here.
      blit: function() {
        // First let's clear the whole screen. Blitfade draws a filled rectangle over the given context (in this case, the screen)
        gbox.blitFade(gbox.getBufferContext(), { alpha: 1 });

        // Since we blitted the tilemap to 'map_canvas' back in our main function, we now draw 'map_canvas' onto the screen. The 'map_canvas' is
        //  just a picture of our tilemap, and by blitting it here we're making sure that the picture re-draws every frame.
        gbox.blit(gbox.getBufferContext(), gbox.getCanvas('map_canvas'), { dx: 0, dy: 0, dw: gbox.getCanvas('map_canvas').width, dh: gbox.getCanvas('map_canvas').height, sourcecamera: true });
      }
    });
  });
}

function loadMap(map_path, callback) {
  if (!map_path) {
    map_path = 'resources/map_hd.png?' + timestamp();
  }

  var image = loadImage(map_path, function() {
    drawOutMap(image);
    if (callback) { callback(); }
  });
}