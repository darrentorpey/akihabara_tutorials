WAIT_TIME = 10;
BLUE_MANAGER = {
  init: function(blue_tiles) {
    this.blue_tiles = blue_tiles;
    this.waits = [];

    return this;
  },

  add_wait: function(x, y) {
    this.waits.push({ x: x, y: y, time: WAIT_TIME });
  },

  get_wait: function(x, y) {
    for (wait_id in this.waits) {
      var wait = this.waits[wait_id];
      if (wait.x == x && wait.y == y) {
        return wait;
      }
    }
  },

  reset: function() {
    this.waits = [];
  },

  get_tile: function(x, y) {
    for (tile_id in this.blue_tiles) {
      var tile = this.blue_tiles[tile_id];
      if (tile.x == x && tile.y == y) {
        return tile;
      }
    }
  },

  remove_tile: function(x, y) {
    for (tile_id in this.blue_tiles) {
      var tile = this.blue_tiles[tile_id];
      if (tile.x == x && tile.y == y) {
        delete this.blue_tiles[tile_id];
      }
    }
  },

  update: function() {
    // invoke(this.blue_tiles, function (tile) { tile.wait--; });
    // invoke(this.waits, function (wait) {
    //   wait.time--;
    //   if (wait.time <= 0) {
    //     this.waits
    //   }
    // });
    for (wait_id in this.waits) {
      var wait = this.waits[wait_id];
      wait.time--;
      // if (wait.time <= 0) {
        // delete this.waits[wait_id];
      // }
    }
  },

  grow_blue: function() {
    var candidates = [];

    for (tile in this.blue_tiles) {
      var blue_tile = this.blue_tiles[tile];

      var ttile = BLUE_MANAGER.get_tile(blue_tile.x, blue_tile.y);
      if (ttile.wait) { 
        // console.log("waiting");
        continue;
      }

      var next_up    = maze.map[blue_tile.y - 1][blue_tile.x];
      var far_up     = maze.map[blue_tile.y - 2][blue_tile.x];
      var wait_up    = wait(blue_tile.y - 1, blue_tile.x);

      var next_down  = maze.map[blue_tile.y + 1][blue_tile.x];
      var far_down   = maze.map[blue_tile.y + 2][blue_tile.x];
      var wait_down  = wait(blue_tile.y + 1, blue_tile.x);

      var next_right = maze.map[blue_tile.y][blue_tile.x + 1];
      var far_right  = maze.map[blue_tile.y][blue_tile.x + 2];
      var wait_right = wait(blue_tile.y, blue_tile.x + 1);

      var next_left  = maze.map[blue_tile.y][blue_tile.x - 1];
      var far_left   = maze.map[blue_tile.y][blue_tile.x - 2];
      var wait_left  = wait(blue_tile.y, blue_tile.x - 1);

      if (next_up == BLUE_PATH && !is_wall(far_up) && !wait_up) {
        // this.grow_into({ x: blue_tile.x, y: blue_tile.y - 1 });
        candidates.push({ x: blue_tile.x, y: blue_tile.y - 1 });
      } else if (next_left == BLUE_PATH && !is_wall(far_left) && !wait_left) {
        // this.grow_into({ x: blue_tile.x - 1, y: blue_tile.y });
        candidates.push({ x: blue_tile.x - 1, y: blue_tile.y });
      } else if (next_right == BLUE_PATH && !is_wall(far_right) && !wait_right) {
        // this.grow_into({ x: blue_tile.x + 1, y: blue_tile.y });
        candidates.push({ x: blue_tile.x + 1, y: blue_tile.y });
      } else if (next_down == BLUE_PATH && !is_wall(far_down) && !wait_down) {
        // this.grow_into({ x: blue_tile.x, y: blue_tile.y + 1 });
        candidates.push({ x: blue_tile.x, y: blue_tile.y + 1 });
      }
    }
    
    ind = Math.floor(Math.random()*candidates.length);
    this.grow_into(candidates[ind]);
  },

  grow_into: function(coords) {
    help.setTileInMap(gbox.getCanvasContext('mazecanvas'), maze, coords.x, coords.y, BLUE_TILE);
    this.blue_tiles.push({ x: coords.x, y: coords.y });
  }
}

function is_wall(tile) {
  return any_match([0, 1, 2, 3, 4, 5, 6, 7, 8], tile);
}

function wait(y, x) {
  var wait = BLUE_MANAGER.get_wait(x, y);
  if (wait && wait.time > 0) {
    return true;
  }
  return false;
}