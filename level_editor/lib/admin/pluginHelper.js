var plugins_logging_enabled = false;

function plugin_log() {
  if (plugins_logging_enabled) {
    console.log.apply(console, arguments);
  }
}

function loadPluginFromURL(url) {
//  plugin_log('Getting script...');
  //Load plugins in order (hopefully) untested.
  head.js(url);
}

function removeAllIncludes() {
  var x = this;
  var confirmation = confirm("Are you sure you want to remove all the plugins?");
  if (confirmation) {
    storage('includedJS', null);
  }
  jQuery(x).dialog('close');
}

function closeDialog(){
  jQuery(this).dialog('close');
}

function removePlugin(name){
  var confirmation = confirm("Are you sure you want to remove "+name+" ?");
  if (confirmation) {
    var includedJS = storage('includedJS');
    delete includedJS[name];
    storage('includedJS',includedJS);
  }
  jQuery('.ui-dialog-titlebar-close').click();
}

function viewPlugins() {
  var div = document.createElement('div');
  var loadedPlugins = storage('includedJS');
  var htmlText = 'There are no plugins loaded';
  var buttons = { Close: closeDialog };
  if (loadedPlugins) {
    htmlText = '<ul style="list-style: none;">';
    var counter = 0;
    for (name in loadedPlugins) {
      counter++;
      htmlText += '<li><a onclick="removePlugin(\'' + name + '\')">x<\/a>&nbsp;&nbsp;' + name + '</li>';
    }
    htmlText += '</ul>';
    if (counter) {
      buttons = { 'Remove All': removeAllIncludes, Close: closeDialog };
    } else {
      htmlText = "There are no plugins loaded";
    }
  }
  jQuery(div).html(htmlText);
  jQuery(div).dialog({
    title:   'Loaded Plugins',
    modal:   true,
    buttons: buttons
  });
}

function storage(name, passedObject) {
  if (passedObject === null) {
    //delete
    sessionStorage.removeItem(name);
  } else if (passedObject) {
    //set
    sessionStorage.setItem(name, jQuery.toJSON(passedObject));
  } else {
    //get
    return jQuery.parseJSON(sessionStorage.getItem(name)) || new Object();
  }
}

/*
* Returns an object that has groups sorted by name,
* Object['groupName'] = Array of plugin objects
* */
function getPluginsByGroup() {
  var pluginsByGroup = new Object();
  for (var plugin in loadedPlugins) {
    if (loadedPlugins[plugin].group) {
      if (!pluginsByGroup[loadedPlugins[plugin].group]) {
        pluginsByGroup[loadedPlugins[plugin].group] = new Array();
      }
      pluginsByGroup[loadedPlugins[plugin].group].push(loadedPlugins[plugin]);
    }
  }
  return pluginsByGroup;
}

function getPluginsForURL(){
  var pluginsURL = new Object();
  for (var pluginID in loadedPlugins) {
//    plugin_log(pluginID);
    pluginsURL[loadedPlugins[pluginID].name] = { url: loadedPlugins[pluginID].sourceURL, id: pluginID};
  }
  return pluginsURL;
}

function updateGroups() {
for(var plugin in loadedPlugins){
                if(loadedPlugins[plugin].group && jQuery.inArray(loadedPlugins[plugin].group,gbox._groups) == -1){
                        gbox._groups.push(loadedPlugins[plugin].group); gbox.setGroups(gbox._groups);
                }
        }
}

var includedJS = storage('includedJS');
loadedPlugins = new Object();
pluginOrder = new Array();
pluginCounter = 66; //Arbitrary number above 10 (the number of default objects)
pluginCounterMin = pluginCounter;
if (includedJS) {
  for (name in includedJS) {
    loadPluginFromURL(includedJS[name]);
  }
}

 head.ready(function() {
        
        
        //console.log("ready!");
        
        plugin_log(loadedPlugins);
        for (i in loadedPlugins) $('#brush' + i).remove();
        var g = new Array();
        for (i in loadedPlugins) {
          p = pluginOrder[loadedPlugins[i].sourceURL] + pluginCounterMin;
          g[p] =  loadedPlugins[i];
          loadedPlugins[i].origID = i;
        }
        
        for (i=pluginCounterMin; i<pluginCounterMin+10; i++) {
          if (g[i]) {
            var img = new Image();
            img.src = g[i].paletteImage;
            q = pluginOrder[g[i].sourceURL]+pluginCounterMin;
            img.id = 'brush' + g[i].origID; //i;
            img.setAttribute('class', 'brush');
            $(img).appendTo('#palette');
          }
        }
      });

if ($config.use_plugins) {
  //Load plugins on page load!
  var urlPlugins = getURLParam('plugins');
  if (urlPlugins) {
    for (pluginID in urlPlugins) {
      loadPluginFromURL(urlPlugins[pluginID].url);
    }
  } else {
    //Load the default plugins
    jQuery.getJSON(timestampedURL('plugins/defaultPlugins.json'), function(data,textStatus) {
      jQuery(data).each(function (index,pluginString) {
        plugin_log(index + ': ' + pluginString);
        pluginOrder[pluginString] = index;
        loadPluginFromURL(pluginString);
      });

     
    });
  }
}

$(function() {
  $('#object_loading .drop').bind('drop', function(event) { 
    if (event.dataTransfer.types && jQuery.inArray('text/plain', event.dataTransfer.types) >= 0) {
      var pluginObject = event.dataTransfer.types && $.inArray('text/plain', event.dataTransfer.types) && entities(event.dataTransfer.getData('text/plain'));
      if (pluginObject) {
        plugin_log('Plugin URL dropped: ' + pluginObject);
        var pluginName = prompt('What would you like to name this plugin?');
        var includedJS = storage('includedJS');

        if (includedJS) {
          includedJS[pluginName] = pluginObject;
        } else {
          includedJS = new Object();
          includedJS[pluginName] = pluginObject;
        }

        storage('includedJS', includedJS);
        loadPluginFromURL(pluginObject);
        

        var pl = gbox.getObject('player', 'player_id');
      }
    } else {
      evalFirstTextFile(event);
      updateGroups();
    }

    event.stopPropagation(); event.preventDefault(); return false;
  }).bind('dragenter dragover', false);
});

function introduceALESPlugin(plugin) {
//  plugin_log('Loading plugin:');
//  plugin_log(plugin);
  var pluginId = getPluginIDFromName(plugin.name, plugin.sourceURL);

  loadedPlugins[pluginId] = plugin;

  if (plugin.paletteImage){
    var img = new Image();
    img.src = plugin.paletteImage;
    img.id = 'brush' + pluginId;
    img.setAttribute('class', 'brush');
    $(img).appendTo('#palette');
  }

  if (typeof gbox != 'undefined') {
    //The game is currently running... add paletteImage, reload resources, reset the game.
    //Reset the game and load the new resources
    gbox.addBundle({ file: 'resources/bundle.js?' + timestamp() });
    
    if(plugin.group && jQuery.inArray(plugin.group,gbox._groups) == -1){
                        gbox._groups.push(plugin.group); gbox.setGroups(gbox._groups);
    }
  }
}


function getPluginIDFromName(pluginName, pluginURL){
  //Check to see if the plugin is in the list of existing plugins
  var plugins = getURLParam("plugins");

  //if it's a default plugin, return an ID based on its order in the defaultPlugins.json file
  if (typeof pluginOrder[pluginURL] != 'undefined') {return pluginOrder[pluginURL]+pluginCounterMin;}
  
  if(plugins){
    //We have existing plugins, no need to generate a new number. Find our pluginName in the list.
    for(var i=0;i<plugins.length;i++){
      if(plugins[i].name == pluginName){
        return plugins[i].id;
      }
    }
  }

  //Otherwise, find a pluginID that is not in use
  while(loadedPlugins[pluginCounter] != null){
     pluginCounter++;
  }
  return pluginCounter;
}