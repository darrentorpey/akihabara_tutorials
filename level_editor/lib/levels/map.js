// This is our function for adding the map object -- this keeps our main game code nice and clean
function addMap() {
  gbox.addObject({    
    id:    'background_id', // This is the object ID
    group: 'background',    // We use the 'backround' group we created above with our 'setGroups' call.
    initialize: function() {
      reloadGamePieces();
    },
 
    first: function() {

    },
 
    // The blit function is what happens during the game's draw cycle. Everything related to rendering and drawing goes here.
    blit: function() {
      // First let's clear the whole screen. Blitfade draws a filled rectangle over the given context (in this case, the screen)
      //gbox.blitFade(gbox.getCanvasContext('map_canvas'), { alpha: 0, color:gbox.COLOR_WHITE });
      gbox.getCanvasContext('map_canvas').clearRect(0,0,640*2,480*2);
      //write the background image
      gbox.blit(gbox.getBufferContext(), gbox.getCanvas('bg_canvas'), { dx: 0, dy: 0, dw: gbox.getCanvas('bg_canvas').width, dh: gbox.getCanvas('bg_canvas').height, sourcecamera: true })
      
      
      gbox.blitTilemap(gbox.getCanvasContext('map_canvas'), map); 
      gbox.blit(gbox.getBufferContext(), gbox.getCanvas('map_canvas'), { dx: 0, dy: 0, dw: gbox.getCanvas('map_canvas').width, dh: gbox.getCanvas('map_canvas').height, camera: true });        

      if (editor) {
        editor.minimapCanvasContext = gbox.getBufferContext();//gbox.getCanvasContext('map_canvas');
      }
      
      
    }
  });
}

function loadMap() {
	var mapData = [ [null, '0'], [0, '1'], [1,'2'], [2, '3'], [3,'4'], [4,'5'], [5,'6'], [6,'7'], [7,'8'], [8,'9'], [9,'A']];
	for(pluginID in loadedPlugins){
		mapData.push([pluginID,String.fromCharCode(pluginID)]);
	}
	return help.asciiArtToMap(game.level, mapData);
}

function reportLevel(lvl, prefix) {
  if (!prefix) { prefix = '' }
  console.log(prefix + ': ' + lvl[0]);
}

function reloadMap() {
	map = generateMapObj();

	reloadGamePieces();

	gbox.getCanvasContext('map_canvas').clearRect(0, 0, 640 * 2, 480 * 2);
	//write the background image
	gbox.blit(gbox.getBufferContext(), gbox.getCanvas('bg_canvas'), { dx: 0, dy: 0, dw: gbox.getCanvas('bg_canvas').width, dh: gbox.getCanvas('bg_canvas').height, sourcecamera: true })
	
	
	

	gbox.blitTilemap(gbox.getCanvasContext('map_canvas'), map);
	gbox.blit(gbox.getBufferContext(), gbox.getCanvas('map_canvas'), { dx: 0, dy: 0, dw: gbox.getCanvas('map_canvas').width, dh: gbox.getCanvas('map_canvas').height, camera: true });
	
	
}

function getLevelCopy(lvl) {
  if (!lvl) { lvl = editor.level }
  return $.extend(true, [], lvl);
}


function reloadGamePieces(){
	//TODO: These should really be configurable.
	var gameWidth = 40;
	var gameHeight = 30;
	//Trash default groups
	gbox.trashGroup('disboxes');
	gbox.trashGroup('boxes');
	gbox.trashGroup('enemies');
	var pluginsByGroup = getPluginsByGroup(); //From pluginHelper
	//Iterate over each group trashing them
	for(var group in pluginsByGroup){
        gbox.trashGroup(group);
	}
	//Iterate over the gameboard
	for (var y = 0; y < gameHeight; y++){
		for (var x = 0; x < gameWidth; x++){
			//If there is anything defined in the level at point y,x find out what it is and load it
			if(game.level[y][x]){
				var charCode = game.level[y][x].charCodeAt(0);
				if(loadedPlugins[charCode]){
					var data = {
						x:x*32,
						y:y*32,
						side:true,
						tileID:charCode
					}
					//Add the game piece to the level
					loadedPlugins[charCode].add(data);
				}
			}
			//Load Default objects
			if (game.level[y][x] == '3') addBlock({x:x*32,y:y*32,side:true});
			if (game.level[y][x] == '1') addDisBlock({x:x*32,y:y*32,side:true});
			if (game.level[y][x] == '7') addDisBlock({x:x*32,y:y*32,side:true,type:'TNT'});
			if (game.level[y][x] == '9') addEnemy({x:x*32,y:y*32,side:true}, 0);
			if (game.level[y][x] == '6') addEnemy({x:x*32,y:y*32,side:true}, 1);
			
		}
    }
}

function generateMapObj(){
	  // Here we define the map, which consists of a tileset, the actual map data, and a helper function for collision
	var map = {
		tileset: 'map_pieces', // Specify that we're using the 'map_pieces' tiles that we created in the loadResources function

		// This loads an ASCII-definition of all the 'pieces' of the map as an array of integers specifying a type for each map tile
		// Each 'type' corresponds to a sprite in our tileset. For example, if a map tile has type 0, then it uses the first sprite in the
		//  map's tile set ('map_pieces', as defined above) and if a map tile has type 1, it uses the second sprite in the tile set, etc.
		// Also note that null is an allowed type for a map tile, and uses no sprite from the tile set
		map: loadMap(),

		// This function have to return true if the object 'obj' is checking if the tile 't' is a wall, so...
		tileIsSolidCeil: function(obj, t) {
			if (t<10) {
				if (t != null && t != 8 && t != 5 && t != 7 && t != 2 && t != 1) {
					return true;
				} else {
					return false;
				}
			}else{
				if(loadedPlugins[t] && loadedPlugins[t].solidCeil){
					return true;
				}else{
					return false;
				}
			}
		},
		tileIsSolidFloor: function(obj, t) {
			if (t<10) {
				if (t != null && t != 8 && t != 5 && t != 7 && t != 2 && t != 1) {
					return true;
				} else {
					return false;
				}
			}else{
				if(loadedPlugins[t] && loadedPlugins[t].solidFloor){
					return true;
				}else{
					return false;
				}
			}
		}
	}

  // This function calculates the overall height and width of the map and puts them into the 'x' and 'y' fields of the object
  map = help.finalizeTilemap(map);
	return map;
}