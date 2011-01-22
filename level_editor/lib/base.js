function getLongURL() {
  var url_params = {
    name:    currentLevel.getName(),
    level:   currentLevel.getLevelParams(),
    g:       1,
    plugins: pluginHelper.getPluginsForURL()
  };
  return window.location.protocol + "//" + window.location.host + window.location.pathname + '?encoded=' + compressObject(url_params);
}