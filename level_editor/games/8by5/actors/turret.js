var GamePiece = Klass.extend({
  init: function(options) {
    this.klass_name = options.klass_name;
    this.klass      = options.klass || eval(capitalize(options.klass_name));
    if (this.klass.num_objects == null)
      this.klass.num_objects = 0;
    this.klass_id   = options.klass_id || this.klass.num_objects++;
    this.name       = options.name || this.klass_name + '_' + (this.klass_id + 1).toString();
  },

  kill: function(killer) {
    $listener.inform(killer, 'death', this);
  }
});

var Base = GamePiece.extend({
  init: function() {
    this._super({
      klass_name: 'base'
    });
  },

  spawnTurret: function(target) {
    var newb = new Turret();
    $listener.inform(this, 'spawn', newb);
    return newb;
  }
});

var Turret = GamePiece.extend({
  init: function() {
    this._super({
      klass_name: 'turret'
    });
  }
});

var Scanner = GamePiece.extend({
  init: function() {
    this._super({
      klass_name: 'scanner'
    });
  },

  shoot: function(target) {
    target.kill(this);
  }
});