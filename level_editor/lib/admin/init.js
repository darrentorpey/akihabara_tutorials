drawGuiActions();

$('body').mouseup(function() {
  if ($('#toggle_autoupdate input:checked').length) {
    redrawMap();
  }
});

$('<label id="toggle_autoupdate"><input type="checkbox" checked = "checked"/>auto-update</label>').appendTo('#admin_buttons').find('input').change(function() {
  if ($(this).attr('checked')) {
    redrawMap();
  }
});