{
  addImage: [
    ['font',             'resources/font.png'],
    ['logo',             'resources/logo.png'],
    ['stars_background', 'resources/star_background.png'],
    ['moon_hold',        'resources/moon_hold.png'],
    ['cels',             'resources/cels.png'],
    ['map_spritesheet',  'resources/map_pieces.png'],
    ['map_image',        'resources/map.png']
  ],

  addFont: [
    { id: 'small', image: 'font', firstletter: ' ', tileh: 8, tilew: 8, tilerow: 255, gapx: 0, gapy: 0 }
  ],

  addTiles: [
    {
      id:      'moon_hold',
      image:   'moon_hold',
      tileh:   100,
      tilew:   100,
      tilerow: 4,
      gapx:    0,
      gapy:    0
    },
    {
      id:      'stars_background',
      image:   'stars_background',
      tilew:   1024,
      tileh:   768,
      tilerow: 1,
      gapx:    0,
      gapy:    0
    },
    {
      id:      'maze',
      image:   'cels',
      tileh:   4,
      tilew:   4,
      tilerow: 10,
      gapx:    0,
      gapy:    36
    },
    {
      id:      'map_pieces',
      image:   'map_image',
      tileh:   8,
      tilew:   8,
      tilerow: 1,
      gapx:    0,
      gapy:    0
    }
  ]
}