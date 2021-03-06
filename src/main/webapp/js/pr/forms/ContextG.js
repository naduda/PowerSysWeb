return {
	Context: function(){
		var mode = elt('span', {id:'${keyOperationMode}'}, 
										model.Translator.translateValueByKey('keyOperationMode')),
				dMode = elt('DIV', {class:'context'}, mode),
				transp = elt('span', {id:'${keyAddTransparant}'}, 
										model.Translator.translateValueByKey('keyAddTransparant')),
				dTransp = elt('DIV', {class:'context'}, transp),
				main = elt('DIV', {id:'contextG', class:'autoClose'}, dMode, dTransp);

		main.style.backgroundColor = 'silver';
		dTransp.addEventListener('click', function() {
			var elem = document.getElementById("contextG");

			elem.parentNode.removeChild(elem);
			model.psFunctions.run('./js/pr/forms/Transparants.js', 
				function(){
					var func = model.psFunctions.results['./js/pr/forms/Transparants.js'];
					if (func){
						var transps, f = func();
						transps = f.Transpatants();
						document.body.appendChild(transps);
						model.tools.setPopupWindow('transparants', 'main');
						transps.style.top = 
							model.currentItem.getBoundingClientRect().top + 'px';
						transps.style.left = 
							model.currentItem.getBoundingClientRect().left + 'px';
					} else console.log(scriptName);
				});
		});

		return main;
	},

	setWidth: function(menu){
		var spans = menu.getElementsByTagName('span'), 
		w = Math.max(spans[0].getBoundingClientRect().width,
								 spans[1].getBoundingClientRect().width);
		menu.style.width = (w + 10) + 'px';
	},

	ContextTransp: function(transp){
		var edit = elt('span', {id:'${keyEdit}'}, 
										model.Translator.translateValueByKey('keyEdit')),
				dEdit = elt('DIV', {class:'context'}, edit),
				del = elt('span', {id:'${keyDelete}'}, 
										model.Translator.translateValueByKey('keyDelete')),
				dDel = elt('DIV', {class:'context'}, del),
				main = elt('DIV', {id:'contextT', class:'autoClose'}, dEdit, dDel);

		main.style.backgroundColor = 'silver';

		dEdit.addEventListener('click', function(evt){
			model.psFunctions.run('./js/pr/forms/Transparants.js', 
				function(){
					var func = model.psFunctions.results['./js/pr/forms/Transparants.js'];
					if (func){
						var f = func(), transps = f.TranspatantEdit(transp);
						document.body.appendChild(transps);
						model.tools.setPopupWindow('transparantEdit', 'main');
						transps.style.top = 
							model.currentItem.getBoundingClientRect().top + 'px';
						transps.style.left = 
							model.currentItem.getBoundingClientRect().left + 'px';
					} else console.log(scriptName);
				});
		});

		dDel.addEventListener('click', function(evt){
			var cm = {
						type: 'CommandMessage', 
						command: 'deleteTransparant',
						parameters: []
					},
					id = transp.id;

			cm.parameters.push({'id': id.slice(id.indexOf('_') + 1)});
			model.webSocket.send(JSON.stringify(cm));
			// model.removeElement(document.getElementById("contextT"));
			// model.removeElement(transp);
			model.autoClose();
		});

		return main;
	}
}