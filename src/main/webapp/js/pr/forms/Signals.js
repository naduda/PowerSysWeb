return {
	SignalsForm: function(editElem){
		var headerText = elt('span', {id:'${keySignalTreeTitle}'}, 
											model.Translator.translateValueByKey('keySignalTreeTitle')),
				closeButton = elt('i', {class:'fa fa-times closeButton'}),
				header = elt('DIV', {class:'popupHeader'},
										headerText, closeButton),
				content = elt('DIV', {id:'treeSignals', class:'popupContent'}),
				spanOK = elt('span', {id:'${keyApply}'}, 
											model.Translator.translateValueByKey('keyApply')),
				btnOK = elt('button', {type:'button', id:'btnOK',
										style: 'margin: 0 10px 0 10px'}, spanOK),
				spanCancel = elt('span', {id:'${keyClose}'}, 
											model.Translator.translateValueByKey('keyClose')),
				btnCancel = elt('button', {type:'button', id:'btnCancel',
										style: 'margin: 0 10px 0 10px'}, spanCancel),
				footer = elt('DIV', {style: 'text-align: center; margin: 5px'}, 
									btnOK, btnCancel),
				main = elt('DIV', {id:'signalsForm', class:'popupW'}, 
										header, content, footer);

			closeButton.addEventListener('click', function() {
				model.SignalsForm.hide();
			});

			btnCancel.addEventListener('click', function() {
				model.SignalsForm.hide();
			});

			btnOK.addEventListener('click', function() {
				var node = $('#treeSignals').jstree().get_selected(true)[0].original,
						key = editElem.id.slice(editElem.id.indexOf('_') + 1);
				if(node && node.typeNode.toLowerCase() === 'signal'){
					editElem.innerHTML = node.id;
					model.currentItem.setAttribute(key, node.id);
					model.SignalsForm.hide();
				} else {
					alert('Select valid node, please!')
				}
			});

			content.style.maxHeight = '250px';
			content.style.maxWidth = '500px';
			content.style.overflow = 'auto';
			main.style.left = model.SignalsForm.left;
			main.style.top = model.SignalsForm.top;
		return main;
	},
	initSignalsTree: function(id){
		$('#treeSignals').jstree({
			'core' : {
				'data' : {
					'url' : model.docURL.slice(1) + '/dataServer/db/childSignals?',
					'data' : function (node) {
						return { "params" : node.id };
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
			'plugins' : ['types']
		});

		var url = model.docURL.slice(1) + '/dataServer/db/childSignalPath?params=' + id;
		$.getJSON(url, function(data){
			if (data.path){
				openNode(data.path.slice(data.path.indexOf('/') + 1));
			}
		}).fail(function( jqxhr, textStatus, error ) {
			var err = textStatus + ', ' + error;
			console.log( "Request Failed: " + err);
			console.log(url);
		});

		function openNode(path) {
			if (path) {
				var id = path.indexOf('/') > 0 ? 
					path.slice(0, path.indexOf('/')) : path;
				setTimeout(function(){
					if(path.indexOf('/') > 0){
						$('#treeSignals').jstree('open_node', '#' + id);
						openNode(path.slice(path.indexOf('/') + 1));
					} else {
						$('#treeSignals').jstree('select_node', '#' + id);
					}
				}, 150);
			}
		}
	}
}