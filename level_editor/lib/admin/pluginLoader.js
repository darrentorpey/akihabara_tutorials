
var includedJS = storage('includedJS');
loadedPlugins = new Object();
pluginCounter = 0;
if(includedJS){
	for(name in includedJS){
		head.js(includedJS[name],loadPlugin);
	}
}
function loadPlugin(){
	if(typeof getPlugin == 'function'){
		var plugin = getPlugin();
		if(plugin){
			loadedPlugins[pluginCounter] = plugin;
			pluginCounter++;
		}
	}
}

jQuery(document).ready(function() {
	var drop = document.querySelector('#object_loading .drop');

	// Tells the browser that we *can* drop on this target
	addEvent(drop, 'dragover', cancel);
	addEvent(drop, 'dragenter', cancel);

	addEvent(drop, 'drop', function (event) {
		// stops the browser from redirecting off to the text.
		if (event.preventDefault) {
			event.preventDefault();
		}
		if(event.dataTransfer.types && jQuery.inArray("text/plain",event.dataTransfer.types)){
			var pluginObject = event.dataTransfer.types && entities(event.dataTransfer.getData("text/plain"));
			if(pluginObject){
				var pluginName = prompt("What would you like to name this plugin?");
				var includedJS = storage('includedJS');
				if(includedJS){
					includedJS[pluginName] = pluginObject;
				}else{
					includedJS = new Object();
					includedJS[pluginName] = pluginObject;
				}
				storage('includedJS', includedJS);
				head.js(pluginObject);
			}
		}
		return false;
	});

	function cancel(event) {
		if (event.preventDefault) {
			event.preventDefault();
		}
		return false;
	}
	function entities(s) {
	  var e = {
		'"' : '"',
		'&' : '&',
		'<' : '<',
		'>' : '>'
	  };
	  return s.replace(/["&<>]/g, function (m) {
		return e[m];
	  });
	}

});
function removeAllIncludes(){
	var x = this;
	var confirmation = confirm("Are you sure you want to remove all the plugins?");
	if(confirmation){
		storage('includedJS',null);
	}
	jQuery( x ).dialog( "close" );
}
function closeDialog(){
	jQuery( this ).dialog( "close" );
}

function removePlugin(name){
	var confirmation = confirm("Are you sure you want to remove "+name+" ?");
	if(confirmation){
		var includedJS = storage('includedJS');
		delete includedJS[name];
		storage('includedJS',includedJS);
	}
	jQuery(".ui-dialog-titlebar-close").click();
}

function viewPlugins(){
	var div = document.createElement("div");
	var loadedPlugins = storage('includedJS');
	var htmlText = "There are no plugins loaded";
	var buttons = { Close: closeDialog };
	if(loadedPlugins){
		htmlText = "<ul style='list-style:none;'>";
		var counter = 0;
		for(name in loadedPlugins){
			counter++;
			htmlText += '<li><a onclick="removePlugin(\''+name+'\')">x<\/a>&nbsp;&nbsp;'+name+'</li>';
		}
		htmlText += "</ul>";
		if(counter){
			buttons = {'Remove All':removeAllIncludes , Close: closeDialog};
		}else{
			htmlText = "There are no plugins loaded";
		}
	}
	jQuery(div).html(htmlText);
	jQuery(div).dialog(
		{
		title:'Loaded Plugins',
		modal: true,
		buttons: buttons
	});
}

function storage(name,passedObject){
	if(passedObject === null){
		//delete
		sessionStorage.removeItem(name);
	}else if(passedObject){
		//set
		sessionStorage.setItem(name, jQuery.toJSON(passedObject));
	}else{
		//get
		return jQuery.parseJSON(sessionStorage.getItem(name)) || new Object();
	}
}