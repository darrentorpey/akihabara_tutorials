{
  addImage: [
    ['font',            'resources/font.png'],
    ['logo',            'resources/logo.png'],
    ['player_sprite',   'resources/player_sprite.png'],
    ['map_spritesheet', 'resources/map_pieces.png'],
    ['enemy_sprite',    'resources/enemy_sprite.png'],
    ['player_bullet',   'resources/bullet.png'],
    ['sprites',         'resources/explode.png']
  ],

  addFont: [
    { id: 'small', image: 'font', firstletter: ' ', tileh: 8, tilew: 8, tilerow: 255, gapx: 0, gapy: 0 }
  ],

  addTiles: [
    {
      id:      'explosion',
      image:   'sprites',
      tileh:   32,
      tilew:   32,
      tilerow: 4,
      gapx:    0,
      gapy:    0
    },
    {
      id:      'player_tiles',
      image:   'player_sprite',
      tileh:   16,
      tilew:   16,
      tilerow: 19,
      gapx:    0,
      gapy:    0
    },
    {
      id:      'map_pieces',
      image:   'map_spritesheet',
      tileh:   16,
      tilew:   16,
      tilerow: 1,
      gapx:    0,
      gapy:    0
    },
    {
      id:      'enemy_tiles',
      image:   'enemy_sprite',
      tileh:   16,
      tilew:   16,
      tilerow: 19,
      gapx:    0,
      gapy:    0
    },
    {
      id:       'player_shot',
      image:    'player_bullet',
      tileh:    4,
      tilew:    4,
      tilerow:  2,
      gapx:     0,
      gapy:     0
    }
  ],

  addAudio: [
    ['explosion', ['resources/explosion_1a.mp3'], { channel: 'bgmusic', loop: false }]
  ]
}