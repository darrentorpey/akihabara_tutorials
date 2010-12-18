{
  addImage: [
    ['font',             'resources/CasualEncounter.png'],
    ['logo',             'resources/logo.png'],
    ['player_sprite',    'resources/walk.png'],
    ['map_spritesheet',  'resources/map_pieces.png'],
    ['enemy_sprite',  'resources/enemy_sprite.png'],
    ['block_sprite',  'resources/block_sprite.png'],
    ['background_tilesheet',  'resources/bg1.png'],
    ['explosion_sprite',  'resources/Frk_Blast1.png'],
    ['lava_sprite',  'resources/lava.png']
  ],

  addFont: [
    { id: 'small', image: 'font', firstletter: ' ', tileh: 20, tilew: 14, tilerow: 255, gapx: 0, gapy: 0 }
  ],

  addTiles: [
    {
      id:      'lava',
      image:   'lava_sprite',
      tileh:   32,
      tilew:   32,
      tilerow: 8,
      gapx:    0,
      gapy:    0
    },
    {
      id:      'map_pieces',
      image:   'map_spritesheet',
      tileh:   32,
      tilew:   32,
      tilerow: 9,
      gapx:    0,
      gapy:    0
    },
    {
      id:      'player_tiles',  // Set a unique ID for future reference
      image:   'player_sprite', // Use the 'player_sprite' image, as loaded above
      tileh:   64,
      tilew:   32,
      tilerow: 10,
      gapx:    0,
      gapy:    0
    },
    {
      id:      'block_tiles',  // Set a unique ID for future reference
      image:   'block_sprite', // Use the 'player_sprite' image, as loaded above
      tileh:   32,
      tilew:   32,
      tilerow: 3,
      gapx:    0,
      gapy:    0
    },
    {
      id:      'background_tiles',  // Set a unique ID for future reference
      image:   'background_tilesheet', // Use the 'player_sprite' image, as loaded above
      tileh:   32,
      tilew:   32,
      tilerow: 3,
      gapx:    0,
      gapy:    0
    },
    {
      id:      'enemy_tiles',  // Set a unique ID for future reference
      image:   'enemy_sprite', // Use the 'player_sprite' image, as loaded above
      tileh:   32,
      tilew:   32,
      tilerow: 2,
      gapx:    0,
      gapy:    0
    },
    {
      id:      'explosion_tiles',  // Set a unique ID for future reference
      image:   'explosion_sprite', // Use the 'player_sprite' image, as loaded above
      tileh:   96,
      tilew:   96,
      tilerow: 14,
      gapx:    0,
      gapy:    0
    }
  ],
  
	// Audio resources	
	addAudio:[
  	["jump",["resources/jump.mp3","resources/jump.ogg"],{channel:"jump"}],	
    ["hit",["resources/hit.mp3","resources/hit.ogg"],{channel:"hit"}],
    ["squish",["resources/sword.mp3","resources/sword.ogg"],{channel:"hit"}],
    ["explode",["resources/megaexplosion.mp3","resources/megaexplosion.ogg"],{channel:"boom"}],
    ["star",["resources/coin.mp3","resources/coin.ogg"],{channel:"hit"}]
  	]
}