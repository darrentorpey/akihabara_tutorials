var GamePiece = Klass.extend({
  init: function(options) {
    this.klass    = options.klass;
    if (this.klass.num_objects == null)
      this.klass.num_objects = 0;
    this.klass_id = this.klass.num_objects++
    this.name     = options.name || 'unknown';
  },

  kill: function(killer) {
    // debug.log('kill', arguments.callee, arguments.callee.caller);
    $($listener).trigger({
      type:    'death',
      object:  this,
      subject: killer
    });
  }
});

var Base = GamePiece.extend({
  init: function() {
    this._super({
      klass: Base
    });
    this.name = 'base_' + (this.klass_id + 1).toString();
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
      klass: Turret
    });
    this.name = 'turret_' + (this.klass_id + 1).toString();
  }
});

var Scanner = GamePiece.extend({
  init: function() {
    this._super({
      klass: Scanner,
      name: 'scanner'
    });
  },

  shoot: function(target) {
    // target.kill.apply(this, target);
    target.kill(this);
  }
});

var obj = {
  name: 'the_obj',
  kill: function() {
    debug.log(this);
    $($listener).trigger({
      type: 'death',
      subject: this
    });
  }
}