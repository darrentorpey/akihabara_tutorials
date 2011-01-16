/*
 * Plugin Helper
 *   Manages everything having to do with plugins. Loading, drawing, saving etc.
 *
 * 2011-01-15 - RAK - Converted to utilize Klass to prevent global variables and other ickyness.. yes. ickyness.
 * */
if ($config.use_plugins) {
  //The almighty Klass
  var PluginHelper = Klass.extend({
    init: function(options) {
      this.plugins_logging_enabled = false;
      this.pluginURLToID = new Object();
      this.includedJS = this.storage('includedJS');
      this.loadedPlugins = new Object();
      this.pluginOrder = new Array();
      this.pluginCounter = 66; //Arbitrary number above 10 (the number of default objects)
    },
    plugin_log: function() {
      if (this.plugins_logging_enabled) {
        console.log.apply(console, arguments);
      }
    },
    loadPluginFromURL: function (url) {
      //Load plugins in order
      this.pluginURLToID[url] = this.getPluginID();
      head.js(url);
    },
    removeAllIncludes: function () {
      var x = this;
      var confirmation = confirm("Are you sure you want to remove all the plugins?");
      if (confirmation) {
        pluginHelper.storage('includedJS', null);
        pluginHelper.redrawPlugins();
      }
      jQuery(x).dialog('close');

    },

    closeDialog: function () {
      jQuery(this).dialog('close');
    },

    removePlugin: function (name) {
      var confirmation = confirm("Are you sure you want to remove " + name + " ?");
      if (confirmation) {
        var includedJS = this.storage('includedJS');
        delete includedJS[name];
        pluginHelper.storage('includedJS', includedJS);
        pluginHelper.redrawPlugins();
      }
      jQuery('.ui-dialog-titlebar-close').click();
    },

    viewPlugins: function () {
      var div = document.createElement('div');
      var loadedPlugins = this.storage('includedJS');
      var htmlText = 'There are no plugins loaded';
      var buttons = { Close: pluginHelper.closeDialog };
      if (loadedPlugins) {
        htmlText = '<ul style="list-style: none;">';
        var counter = 0;
        for (name in loadedPlugins) {
          counter++;
          htmlText += '<li><a onclick="pluginHelper.removePlugin(\'' + name + '\')">x<\/a>&nbsp;&nbsp;' + name + '</li>';
        }
        htmlText += '</ul>';
        if (counter) {
          buttons = { 'Remove All': pluginHelper.removeAllIncludes, Close: pluginHelper.closeDialog };
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
    },

    storage: function (name, passedObject) {
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
    },

    /*
     * Returns an object that has groups sorted by name,
     * Object['groupName'] = Array of plugin objects
     * */
    getPluginsByGroup: function () {
      var pluginsByGroup = new Object();
      for (var plugin in this.loadedPlugins) {
        if (this.loadedPlugins[plugin].group) {
          if (!pluginsByGroup[this.loadedPlugins[plugin].group]) {
            pluginsByGroup[this.loadedPlugins[plugin].group] = new Array();
          }
          pluginsByGroup[this.loadedPlugins[plugin].group].push(this.loadedPlugins[plugin]);
        }
      }
      return pluginsByGroup;
    },

    getPluginsForURL: function () {
      var pluginsURL = new Object();
      for (var pluginID in this.loadedPlugins) {
        pluginsURL[this.loadedPlugins[pluginID].name] = { url: this.loadedPlugins[pluginID].sourceURL, id: pluginID, parameters: this.loadedPlugins[pluginID].parameters};
      }
      return pluginsURL;
    },

    updateGroups: function () {
      for (var plugin in this.loadedPlugins) {
        if (this.loadedPlugins[plugin].group && jQuery.inArray(this.loadedPlugins[plugin].group, gbox._groups) == -1) {
          gbox._groups[gbox._groups.length - 2] = plugin.group;
          gbox._groups[gbox._groups.length - 1] = "game";
          gbox._groups[gbox._groups.length] = "player";
          gbox.setGroups(gbox._groups);
        }
      }
    },


    redrawPlugins: function () {
      $('.plugin').remove();
      for (var plugin in this.loadedPlugins) {
        var img = new Image();
        img.src = this.loadedPlugins[plugin].paletteImage;
        img.id = 'brush' + plugin; //i;
        img.setAttribute('class', 'brush plugin');
        $(img).appendTo('#palette');
	    var content = this.loadedPlugins[plugin].name;
	    if(this.loadedPlugins[plugin].parameters){
		    content += "<table class='pluginParamEdit' id='" + plugin + "'>";
			  $.each(this.loadedPlugins[plugin].parameters, function (key, value) {
				content += "<tr>"
				content += "<td>" + key + "</td>"
				content += "<td><input name='" + key + "' value='" + value + "'/></td>"
				content += "</tr>"
			  });
              content += "</table><button type='button' onclick='pluginHelper.saveParameters()'>Save</button>";
	    }
	    $('#'+img.id).qtip({
		    content:{
			    text:content
		    },
		    show:{
			    delay: 1000
		    },
		    position:{
              corner:{
				target:'bottomMiddle',
				tooltip:'topMiddle'
			  }
		    },
			style:{
			    tip:true,
				border:{
					radius: 5,
					width: 5,
					color: 'black'
				}
			},
		    hide:{
			    fixed:true
		    }
	    });
      }
    },

    getPluginFromID: function (pluginID) {
      return this.loadedPlugins[pluginID];
    },

    getPluginID: function () {
	  pluginHelper.pluginCounter++;
      return pluginHelper.pluginCounter;
    },
	  
    saveParameters: function () {
      var pluginID = $(".pluginParamEdit").attr('id');
      var plugin = this.getPluginFromID(pluginID);
      $.each(plugin.parameters, function (key, value) {
        plugin.parameters[key] = $('[name="' + key + '"]').val();
      });
    }
  });
  var pluginHelper = new PluginHelper();


//Load a single plugin
  function introduceALESPlugin(plugin) {
    var urlPlugins = getURLParam('plugins');
    if (urlPlugins && urlPlugins[plugin.name] && urlPlugins[plugin.name].parameters) {
      plugin.parameters = urlPlugins[plugin.name].parameters;
    }
    var pluginId = pluginHelper.pluginURLToID[plugin.sourceURL];
    if (typeof pluginId == "undefined") {
      pluginId = pluginHelper.getPluginID();
    }
    pluginHelper.loadedPlugins[pluginId] = plugin;

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
        gbox._groups[gbox._groups.length - 1] = plugin.group;
        gbox._groups[gbox._groups.length] = "game";
        gbox.setGroups(gbox._groups);
      }
//    console.log(gbox._groups);
    }
  }


//Load up stuff that executes on page load.
  head.ready(function() {
    pluginHelper.redrawPlugins();
  });


//Load plugins on page load!
  var urlPlugins = getURLParam('plugins');
  if (urlPlugins) {
    for (pluginID in urlPlugins) {
      pluginHelper.loadPluginFromURL(urlPlugins[pluginID].url);
    }
  } else {
//Load the default plugins
    $.ajax({
      url: timestampedURL('plugins/defaultPlugins.json'),
      dataType: 'json',
      success: function(data, textStatus) {
        jQuery(data).each(function (index, pluginString) {
          pluginHelper.plugin_log(index + ': ' + pluginString);
          pluginHelper.pluginOrder[pluginString] = index;
          pluginHelper.loadPluginFromURL(pluginString);
        });
      },
      async: false
    });
  }
  if (pluginHelper.includedJS) {
    for (name in pluginHelper.includedJS) {
      pluginHelper.loadPluginFromURL(pluginHelper.includedJS[name]);
    }
  }
  $('#object_loading .drop').bind('drop',
	 function(event) {
	   if (event.dataTransfer.types && jQuery.inArray('text/plain', event.dataTransfer.types) >= 0) {
		 var pluginObject = event.dataTransfer.types && $.inArray('text/plain', event.dataTransfer.types) && entities(event.dataTransfer.getData('text/plain'));
		 if (pluginObject) {
		   pluginHelper.plugin_log('Plugin URL dropped: ' + pluginObject);
		   var pluginName = prompt('What would you like to name this plugin?');
		   pluginHelper.includedJS = pluginHelper.storage('includedJS');

		   if (pluginHelper.includedJS) {
			 pluginHelper.includedJS[pluginName] = pluginObject;
		   } else {
			 pluginHelper.includedJS = new Object();
			 pluginHelper.includedJS[pluginName] = pluginObject;
		   }

		   pluginHelper.storage('includedJS', pluginHelper.includedJS);
		   pluginHelper.loadPluginFromURL(pluginObject);
		   var pl = gbox.getObject('player', 'player_id');
		 }
	   } else {
		 evalFirstTextFile(event);
		 pluginHelper.updateGroups();
	   }

	   event.stopPropagation();
	   event.preventDefault();
	   return false;
	 }).bind('dragenter dragover', false);
}