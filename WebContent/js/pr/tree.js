// var docURL = document.URL;
// docURL = docURL.substring(docURL.indexOf('://') + 1, docURL.lastIndexOf("/"));

function initTree() {
	$('#treeDIV').jstree({
		'core' : {
			'data' : {
				'url' : docURL.substring(1) + '/dataServer/db/?',
				'data' : function (node) {
					return { "id" : node.id };
				},
				'dataType': 'json'
			}
		},
		'types' : {
			'default' : {
				'icon' : 'glyphicon glyphicon-blackboard'
			},
			'demo' : {
				'icon' : 'glyphicon glyphicon-ok'
			}
		},
		'contextmenu' : {
			'items' : customMenu
		},
		'plugins' : ['types', 'contextmenu', 'state']
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
		var items = {
			item1: {
				label: 'Create Scheme',
				action: function () {
					alert('Create Scheme is impossible now');
				},
				icon : 'glyphicon glyphicon-plus',
			},
			item2: {
				separator_before : true,
				separator_after : true,
				label: 'Change Scheme',
				action: function () {
					// console.log(node.original);
					var iFile = elt('input', {type: 'file', id: 'fileOpenDialog'});
					iFile.addEventListener("change", function(event) {
						var i = 0, file = iFile.files[0], reader = new FileReader();

						fileWebSocket.send('idScheme:' + node.id + ';');

						var reader = new FileReader();
						var rawData = new ArrayBuffer();
						reader.onload = function(e) {
								rawData = e.target.result;
								fileWebSocket.send(rawData);
								fileWebSocket.send('end');
						}
						reader.readAsArrayBuffer(file);
					}, false);
					performClick(iFile);
				},
				icon : 'glyphicon glyphicon-pencil',
				shortcut : 113,
				shortcut_label : 'F2'
			},
			item3: {
				label: 'Delete Scheme',
				action: function () {
					alert('Delete Scheme is impossible now');
				},
				_disabled : true,
				icon : 'glyphicon glyphicon-remove alarm'
			},
			item4: {
				label: 'Save Scheme',
				action: function () {
					alert('Save Scheme is impossible now');
				},
				icon : 'glyphicon glyphicon-ok',
			}
		};

		return items;
	}

	function performClick(elem) {
		if(elem && document.createEvent) {
			var evt = document.createEvent("MouseEvents");
			evt.initEvent("click", true, false);
			elem.dispatchEvent(evt);
		}
	}
}