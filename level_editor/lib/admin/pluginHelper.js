var plugins_logging_enabled = false;


var pluginURLToID = new Object();
var includedJS = storage('includedJS');
var loadedPlugins = new Object();
var pluginOrder = new Array();
var pluginCounter = 66; //Arbitrary number above 10 (the number of default objects)

head.ready(function() {
  redrawPlugins();
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
    $.ajax({
      url: timestampedURL('plugins/defaultPlugins.json'),
      dataType: 'json',
      success: function(data, textStatus) {
        jQuery(data).each(function (index, pluginString) {
          plugin_log(index + ': ' + pluginString);
          pluginOrder[pluginString] = index;
          loadPluginFromURL(pluginString);
        });
      },
      async: false
    });
  }
  if (includedJS) {
    for (name in includedJS) {
      loadPluginFromURL(includedJS[name]);
    }
  }
}


function plugin_log() {
  if (plugins_logging_enabled) {
    console.log.apply(console, arguments);
  }
}

function loadPluginFromURL(url) {
  //Load plugins in order
  pluginURLToID[url] = getPluginID();
  head.js(url);
}

function removeAllIncludes() {
  var x = this;
  var confirmation = confirm("Are you sure you want to remove all the plugins?");
  if (confirmation) {
    storage('includedJS', null);
    redrawPlugins();
  }
  jQuery(x).dialog('close');

}

function closeDialog() {
  jQuery(this).dialog('close');
}

function removePlugin(name) {
  var confirmation = confirm("Are you sure you want to remove " + name + " ?");
  if (confirmation) {
    var includedJS = storage('includedJS');
    delete includedJS[name];
    storage('includedJS', includedJS);
    redrawPlugins();
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

function getPluginsForURL() {
  var pluginsURL = new Object();
  for (var pluginID in loadedPlugins) {
//    plugin_log(pluginID);
    pluginsURL[loadedPlugins[pluginID].name] = { url: loadedPlugins[pluginID].sourceURL, id: pluginID};
  }
  return pluginsURL;
}

function updateGroups() {
  for (var plugin in loadedPlugins) {
    if (loadedPlugins[plugin].group && jQuery.inArray(loadedPlugins[plugin].group, gbox._groups) == -1) {
      gbox._groups[gbox._groups.length-2] = plugin.group; gbox._groups[gbox._groups.length-1] = "game"; gbox._groups[gbox._groups.length] = "player";
      gbox.setGroups(gbox._groups);
    }
  }
}


function redrawPlugins() {
  $('.plugin').remove();
  for (var plugin in loadedPlugins) {
    var img = new Image();
    img.src = loadedPlugins[plugin].paletteImage;
    img.id = 'brush' + plugin; //i;
    img.setAttribute('class', 'brush plugin');
    $(img).appendTo('#palette');
  }
}

//Handle new plugin drops
$(function() {
  $('#object_loading .drop').bind('drop',
       function(event) {
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
    
         event.stopPropagation();
         event.preventDefault();
         return false;
       }).bind('dragenter dragover', false);
});

//Load a single plugin
function introduceALESPlugin(plugin) {
  var pluginId = pluginURLToID[plugin.sourceURL]
  if(typeof pluginId == "undefined"){
    pluginId = getPluginID();
  }
  loadedPlugins[pluginId] = plugin;

  if (plugin.paletteImage) {
    var img = new Image();
    img.src = plugin.paletteImage;
    img.id = 'brush' + pluginId;
    img.setAttribute('class', 'brush plugin');
    $(img).appendTo('#palette');
  }

  if (typeof gbox != 'undefined') {
    //The game is currently running... add paletteImage, reload resources, reset the game.
    //Reset the game and load the new resources
    gbox.addBundle({ file: 'resources/bundle.js?' + timestamp() });

    if (plugin.group && jQuery.inArray(plugin.group, gbox._groups) == -1) {
      gbox._groups[gbox._groups.length-1] = plugin.group; gbox._groups[gbox._groups.length] = "game";
      gbox.setGroups(gbox._groups);
    }
//    console.log(gbox._groups);
  }
}

function getPluginID() {
  return ++pluginCounter;
}