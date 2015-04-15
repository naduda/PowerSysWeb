var docURL = document.URL;
docURL = docURL.substring(docURL.indexOf('://') + 1, docURL.lastIndexOf("/"));
$('#treeDIV').jstree({
	'core' : {
		'data' : {
			"url" : docURL + "/dataServer/db/?",
			"data" : function (node) {
				return { "id" : node.id };
			}
		}
	},
	"types" : {
		"default" : {
			"icon" : "glyphicon glyphicon-blackboard"
		},
		"demo" : {
			"icon" : "glyphicon glyphicon-ok"
		}
	},
	"contextmenu" : {
		"items" : customMenu
	},
	"plugins" : ["types", "contextmenu", "state"]
}).on('changed.jstree', function (e, data) {
	if(data.selected.length) {
		parent.webSocket.send(JSON.stringify({
			'type' : 'CommandMessage',
			'command' : 'getScheme',
			'parameters' : [{
				'idNode' : data.instance.get_node(data.selected[0]).id
			}]
		}));
		//alert('The selected node is: ' + data.instance.get_node(data.selected[0]).text);
	}
});

function customMenu(node) {
	// alert(node.original.dt);
	// for (var key in node) {
	// 	console.log(key + ' -> ' + node[key])
	// }
	
	var items = {
		item1: {
			label: "item1",
			action: function () {
				alert('Test 1');
			},
			_disabled : true,
		},
		item2: {
			separator_before : true,
			separator_after : true,
			label: "item2",
			action: function () {
				console.log(node.original);
			},
			icon : "glyphicon glyphicon-ok",
			shortcut : 113,
			shortcut_label : "F2"
		}
	};

	if ($(node).hasClass("folder")) {
		delete items.deleteItem;
	}

	return items;
}