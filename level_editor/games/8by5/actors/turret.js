// $m = {
//   name: 'the messenger'
// }
//
// var messenger = (function () {  
// });

var Messenger = {
  name: 'The Messenger'
}
$m = $(Messenger);
msg = {
  killed: 'Killed:'//'Joining the dead:'
}

var GamePiece = Klass.extend({
  init: function(options) {
    this.name = options.name || 'unknown';
  },

  kill: function() {
    $m.trigger({
      type: 'death',
      subject: this
    });
  }
});

var Turret = GamePiece.extend({
  init: function() {
    this._super({
      name: 'turret_' + (Turret.num_turrets++).toString(),
    });
  }
});
Turret.num_turrets = 1;

var Scanner = GamePiece.extend({
  init: function() {
    this._super({
      name: 'scanner'
    });
  },

  shoot: function(target) {
    target.kill();
  }
});

var Listener = GamePiece.extend({
  init: function() {
    $m.bind('death', function(data) {
      debug.log(msg.killed, data.subject.name, data.subject);
      debug.log(arguments);
    });
  }
});

