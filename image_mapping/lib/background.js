function addBackground() {
  gbox.addObject({
    id:       'stars_bckgnd',
    group:    'background',
    tileset:  'stars_background',

    first: function() {
      toys.topview.initialize(this, {});
    },

    blit: function() {
      gbox.blitFade(gbox.getBufferContext(), { alpha: 1 });

      gbox.blitTile(gbox.getBufferContext(), {
        tileset: this.tileset,
        tile:    this.frame,
        dx:      this.x,
        dy:      this.y,
        fliph:   this.fliph,
        flipv:   this.flipv,
        camera:  this.camera,
        alpha:   1.0
      });
    }
  });
}