function getLongURL() {
  var url_params = {
    name:    editor.level.getName(),
    level:   editor.getLevelParams(),
    g:       1,
    plugins: getPluginsForURL()
  };
  return window.location.protocol + "//" + window.location.host + window.location.pathname + '?encoded=' + compressObject(url_params);
}