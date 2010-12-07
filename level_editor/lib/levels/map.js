// This is our function for adding the map object -- this keeps our main game code nice and clean
function addMap() {
  gbox.addObject({    
    id:    'background_id', // This is the object ID
    group: 'background',    // We use the 'backround' group we created above with our 'setGroups' call.
 
    // The blit function is what happens during the game's draw cycle. Everything related to rendering and drawing goes here.
    blit: function() {
      // First let's clear the whole screen. Blitfade draws a filled rectangle over the given context (in this case, the screen)
      gbox.blitFade(gbox.getBufferContext(), { alpha: 1, color:gbox.COLOR_WHITE });
 
      // Since we blitted the tilemap to 'map_canvas' back in our main function, we now draw 'map_canvas' onto the screen. The 'map_canvas' is
      //  just a picture of our tilemap, and by blitting it here we're making sure that the picture re-draws every frame.
      gbox.blit(gbox.getBufferContext(), gbox.getCanvas('map_canvas'), { dx: 0, dy: 0, dw: gbox.getCanvas('map_canvas').width, dh: gbox.getCanvas('map_canvas').height, sourcecamera: true });
      
      // Write the entire canvas context to the canvasImage global var, which the editor will read for the minimap
      canvasContext = gbox.getCanvasContext('map_canvas');
    }
  });
}

function loadMap() {
  return help.asciiArtToMap(level, [ [null, '0'], [0, '1'], [1,'2'], [2, '3'], [3,'4'], [4,'5'], [5,'6'], [6,'7'], [7,'8'], [8,'9']])
}

function redrawMap() {
  map =
    {
    tileset: 'map_pieces', // Specify that we're using the 'map_pieces' tiles that we created in the loadResources function
    map: loadMap(),
    tileIsSolidCeil: function(obj, t) {
      if (t != null && t != 3 && t != 5 && t != 6 && t!= 8) return true;
        else return false; // Is a wall if is not an empty space
      },
    tileIsSolidFloor: function(obj, t) {
      if (t != null && t != 3 && t != 5 && t != 6 && t!= 8) return true;
        else return false; // Is a wall if is not an empty space
      }
    }
  map = help.finalizeTilemap(map);
  gbox.blitFade(gbox.getCanvasContext('map_canvas'), { alpha: 1, color:gbox.COLOR_WHITE });
  gbox.blitTilemap(gbox.getCanvasContext('map_canvas'), map);
}