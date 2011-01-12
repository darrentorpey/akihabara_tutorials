var EightByFive = Klass.extend({
  init: function() {
    debug.log('Starting 8by5...');

    this.scanner = new Scanner();

    this.turret_1 = new Turret();
    this.turret_2 = new Turret();
    this.turret_3 = new Turret();

    this.base = new Base();
  }
});

// Try these out in the console:
//  the_game.scanner.shoot(the_game.turret_2);
//  the_game.base.spawnTurret()