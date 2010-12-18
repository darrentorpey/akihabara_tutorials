$(function() {
  $('#imageView').mouseup(function() {
    if ($('#toggle_autoupdate input:checked').length) {
      redrawMap();
    }
  });

  $('<label id="toggle_autoupdate"><input type="checkbox" checked = "checked"/>auto-update</label>').appendTo('#admin_buttons').find('input').change(function() {
    if ($(this).attr('checked')) {
      redrawMap();
    }
  });

  $('<label id="toggle_autoupdate"><input type="checkbox" checked = "checked"/>auto-update</label>').appendTo('#admin_buttons').find('input').change(function() {
    if ($(this).attr('checked')) {
      redrawMap();
    }
  });

  $('<p id="undo_counter">Undos: <span class="num">None</span></p>').appendTo('#admin_buttons');
  $('<p><a href="#">Undo</a><a href="#" style="margin-left: 3px; padding-left: 4px; border-left: 1px solid #999">Redo</a></p>').appendTo('#admin_buttons').find("a:contains('Undo')").click(function() {
    $().undo();
  }).parent().find("a:contains('Redo')").click(function() {
    $().redo();
  });

  $('#generate_url').click(function() {
    generateShortURL();

    return false;
  });

  if ($('#share').val() == '') {
    $('#d_clip_button').addClass('disabled');
  }

  if (params.name) {
    $('#level_name input').val(params.name);
  }
})

var testAction = new UndoableAction(function() {}, function() {});

afterEditorLoad = function() {
  // setLevel(["0000000000000000000000000000000000000000", "0000000000000000000000000000000000000000", "0000000000000000000000000000000000000000", "0000000000000000000000000000000000000000", "0000000000000000000000000000000000000000", "0000000000000000000000000000000000000000", "0000000000000000000000000000000000000000", "0000000000000000000000000000000000000000", "0000000000000000000000000000000000000000", "0000000000000000000000000000000000000000", "1111111110000000000000000000000000000000", "0000000000000000000000000000000000000000", "0000000000000000000000000000000000000000", "0000000000000000000000000000000000000000", "0000000000000000000000000000000000000000", "0000000000000000000000000000000000000000", "0000000000000000000000000000000000000000", "0000000000000000000000000000000000000000", "0000000000000000000000000000000000000000", "0000000000000000000000000000000000000000", "0000000000000000000000000000000000000000", "0000000000000000000000000000000000000000", "0000000000000000000000000000000000000000", "0000000000000000000000000000000000000000", "0000000000000000000000000000000000000000", "0000000000000000000000000000000000000000", "0000000000000000000000000000000000000000", "0000000000000000000000000000000000000000", "0000000000000000000000000000000000000000", "1111111111111111111111111111111111111111"]);

  // setLevel(["0000000000000000000000000000000000000000", "0000000000000000000000000000000000000000", "0000000000000000000000000000000000000000", "0000000000000000000000000000000000000000", "0000000000000000000000000000000000000000", "0000000000000000000000000000000000000000", "0000000000000000000000000000000000000000", "0000000000000000000000000000000000000000", "0000000000000000000000000000000000000000", "7888876880000000000000000000000000000000", "1111111110000000000000000000000000000000", "4444444440000000000000000000000000000000", "4444444440000000000000000000000000000000", "4444444440000000000000000000000000000000", "4444444440000000000000000000000000000000", "0000000000000000000000000000000000000000", "0000000000000000000000000000000000000000", "0000000000000000000000000000000000000000", "0000000000000000000000000000000000000000", "0000000000000000000000000000000000000000", "0000000000000000000000000000000000000000", "0000000000000000000000000000000000000000", "0000000000000000000000000000000000000000", "0000000000000000000000000000000000000000", "0000000000000000000000000000000000000000", "0000000000000000000000000000000000000000", "0000000000000000000000000000000000000000", "0000000000000000000000000000000000000000", "0000000000000000000000000000000000000000", "1111111111111111111111111111111111111111"]);
}