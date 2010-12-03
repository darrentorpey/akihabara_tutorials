{
  addImage: [
    ['font',             'resources/font.png'],
    ['logo',             'resources/logo.png'],
    ['map_spritesheet',  'resources/map_pieces.png']
  ],

  addFont: [
    { id: 'small', image: 'font', firstletter: ' ', tileh: 8, tilew: 8, tilerow: 255, gapx: 0, gapy: 0 }
  ],

  addTiles: [
    {
      id:      'map_pieces',
      image:   'map_spritesheet',
      tileh:   8,
      tilew:   8,
      tilerow: 1,
      gapx:    0,
      gapy:    0
    }
  ]
}