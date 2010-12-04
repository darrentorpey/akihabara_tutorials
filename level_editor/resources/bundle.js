{
  addImage: [
    ['font',             'resources/font.png'],
    ['logo',             'resources/logo.png'],
    ['player_sprite',    'resources/player_sprite.png'],
    ['map_spritesheet',  'resources/map_pieces.png']
  ],

  addFont: [
    { id: 'small', image: 'font', firstletter: ' ', tileh: 8, tilew: 8, tilerow: 255, gapx: 0, gapy: 0 }
  ],

  addTiles: [
    {
      id:      'map_pieces',
      image:   'map_spritesheet',
      tileh:   32,
      tilew:   32,
      tilerow: 2,
      gapx:    0,
      gapy:    0
    },
    {
      id:      'player_tiles',  // Set a unique ID for future reference
      image:   'player_sprite', // Use the 'player_sprite' image, as loaded above
      tileh:   32,
      tilew:   32,
      tilerow: 1,
      gapx:    0,
      gapy:    0
    }
  ]
}