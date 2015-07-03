return {
	Transpatants: function(){
		var headerText = elt('span', {id:'${keyAddTransparant}'}, 
											translateValueByKey('keyAddTransparant')),
				closeButton = elt('i', {class:'fa fa-times closeButton'}),
				header = elt('DIV', {class:'popupHeader'},
										headerText, closeButton),
				txtList = elt('span', {id:'${keyListTransp}'}, 
											translateValueByKey('keyListTransp')),
				list = elt('ol'),
				divElems = elt('DIV', {style:'min-height: 25px;\
												background-color: rgb(238, 238, 238);'}, list),
				txtReason = elt('span', {id:'${keyReason}'}, 
											translateValueByKey('keyReason')),
				inReason = elt('textarea',{style:'width:100%', class:'canSelect'}),
				txtImportance = elt('span', {id:'${keyImportance}'}, 
											translateValueByKey('keyImportance')),
				spanOK = elt('span', {id:'${keyApply}'}, 
											translateValueByKey('keyApply')),
				btnOK = elt('button', {type:'button', id:'btnOK',
										style: 'margin: 0 10px 0 10px'}, spanOK),
				spanCancel = elt('span', {id:'${keyClose}'}, 
											translateValueByKey('keyClose')),
				btnCancel = elt('button', {type:'button', id:'btnCancel',
										style: 'margin: 0 10px 0 10px'}, spanCancel),
				footer = elt('DIV', {style: 'text-align: center; margin: 5px'}, 
									btnOK, btnCancel),
				content = elt('DIV', {style:'text-align:center;'},
										txtList, elt('br'), divElems, txtReason, elt('br'), 
										inReason, elt('br'), txtImportance, elt('br')),
				main = elt('DIV', {id:'transparants', class:'popupW autoClose'}, 
								header, content, footer);

		closeButton.addEventListener('click', model.autoClose);
		btnCancel.addEventListener('click', model.autoClose);

		btnOK.addEventListener('click', function(evt){
			var it = list.getElementsByClassName('selectedAlarm')[0],
					id = it.id.slice(it.id.indexOf('_') + 1),
					position = model.currentItem.position;

			model.insertTransparant(id,
						inReason.value === '' ? 'empty' : inReason.value,
						position.left, position.top);
			model.autoClose();
		});

		model.transparants.forEach(function(el){
			var it = document.createElement('li'),
					url = 'http' + docURL + '/dataServer/image?id=' + el.id,
					desc = el.desc.slice(0, el.desc.indexOf(';')),
					svg = el.desc.slice(el.desc.indexOf(';') + 1),
					svg64 = window.btoa(svg),
					span = elt('span', {style:'top:-13px; position:relative;'});

			it.id = 'tr_' + el.id;
			it.className = 'context';
			it.style.marginLeft = '10px';
			span.innerHTML = desc;
			it.appendChild(span);
			it.style.listStyleImage = 
						"url('data:image/svg+xml;base64," + svg64 + "')";

			it.addEventListener('click', function(){
				var lis = list.getElementsByTagName('li');

				for(var i = 0; i < lis.length; i++)
					$(lis[i]).removeClass('selectedAlarm');

				$(it).addClass('selectedAlarm');
			});

			list.appendChild(it);
		});
		return main;
	},

	TranspatantEdit: function(transp){
		var headerText = elt('span', {id:'${keyAddTransparant}'}, 
											translateValueByKey('keyAddTransparant')),
				closeButton = elt('i', {class:'fa fa-times closeButton'}),
				header = elt('DIV', {class:'popupHeader'},
										headerText, closeButton),
				txtReason = elt('span', {id:'${keyReason}'}, 
											translateValueByKey('keyReason')),
				inReason = elt('textarea',{style:'width:100%', class:'canSelect'}),
				txtImportance = elt('span', {id:'${keyImportance}'}, 
											translateValueByKey('keyImportance')),
				spanOK = elt('span', {id:'${keyApply}'}, 
											translateValueByKey('keyApply')),
				btnOK = elt('button', {type:'button', id:'btnOK',
										style: 'margin: 0 10px 0 10px'}, spanOK),
				spanCancel = elt('span', {id:'${keyClose}'}, 
											translateValueByKey('keyClose')),
				btnCancel = elt('button', {type:'button', id:'btnCancel',
										style: 'margin: 0 10px 0 10px'}, spanCancel),
				footer = elt('DIV', {style: 'text-align: center; margin: 5px'}, 
									btnOK, btnCancel),
				content = elt('DIV', {style:'text-align:center;'},
										txtReason, elt('br'), 
										inReason, elt('br'), txtImportance, elt('br')),
				main = elt('DIV', {id:'transparantEdit', class:'popupW autoClose'}, 
								header, content, footer),
				title = transp.getElementsByTagName('title')[0];

		inReason.value = title.innerHTML;

		closeButton.addEventListener('click', model.autoClose);
		btnCancel.addEventListener('click', model.autoClose);
		btnOK.addEventListener('click', function(evt){
			title.innerHTML = inReason.value;
			model.autoClose();
		});

		return main;
	}
}