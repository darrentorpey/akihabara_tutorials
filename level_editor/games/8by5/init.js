var EightByFive = Klass.extend({
  init: function() {
    debug.log('Starting 8by5...');

    this.listener = new Listener();

    this.scanner = new Scanner();
    this.turret_1 = new Turret();
    this.turret_2 = new Turret();
    this.turret_3 = new Turret();
  }
});
