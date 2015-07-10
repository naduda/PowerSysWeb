function selectable(svg){
	var rect = createRectangle();

	function createRectangle(){
		var rectangle = document.createElementNS(model.svg.namespace,"rect");
		if ($('#selectableRectangle')[0] === undefined)
			rectangle.setAttribute("id","selectableRectangle");
		else
			rectangle.setAttribute("class","selectableRectangle");
		rectangle.setAttribute("x",0);
		rectangle.setAttribute("y",0);
		rectangle.setAttribute("width",50);
		rectangle.setAttribute("height",50);
		rectangle.setAttribute("fill","none");
		rectangle.setAttribute("stroke","none");
		rectangle.setAttribute("stroke-dasharray","3, 7");
		rectangle.setAttribute("stroke-width","3");
		rectangle.setAttribute("selectedId",'');

		svg.appendChild(rectangle);
		return rectangle;
	}

	function clearSelection() {
		var sels = $('.selectableRectangle');
		model.autoClose();
		if (!model.keysF.ctrl) {
			sels.each(function(){
				$(this).remove();
			});
			rect.setAttribute("stroke","none");
			rect.setAttribute("selectedId",'');
		}
	}

	function onselect(obj) {
		model.autoClose();
		if((rect.getAttribute('stroke') !== 'none') && (model.keysF.ctrl == true)){
			var nRect = createRectangle();
			selectRect(nRect, obj);
		} else {
			clearSelection();
			selectRect(rect, obj);
		}
		model.setCurrentItem(obj);
		model.EditObjectProperties.update();
	}

	function selectRect(rect, obj) {
		var bbox = obj.getBBox();
		var transform = obj.getAttribute('transform');

		rect.setAttribute('x',bbox.x);
		rect.setAttribute('y',bbox.y);
		rect.setAttribute('width',bbox.width == 0 ? 1 : bbox.width);
		rect.setAttribute('height',bbox.height == 0 ? 1 : bbox.height);
		rect.setAttribute('stroke','blue');
		rect.setAttribute('transform',transform);

		rect.setAttribute('selectedId', obj.getAttribute('id'));
	}

	for(i = 0; i < svg.childNodes.length; i++) {
		if (svg.childNodes[i].nodeName === 'g'){
			if (svg.childNodes[i].childNodes.length > 3) {
				var gs = svg.childNodes[i].childNodes;
				for(j = 0; j < gs.length; j++) {
					if (gs[j].nodeName === 'g') {
						gs[j].onclick = function(){
							onselect(this);
							runFuncByName(this, 'onclick');
						};
						gs[j].ondblclick = function(e){
							onselect(this);
							runFuncByName(this, 'ondblclick');
							e.preventDefault();
						};
						gs[j].oncontextmenu = function(e){
							onselect(this);
							model.psFunctions.run('./js/pr/forms/ContextG.js', 
								function(){
									var func = model.psFunctions.results['./js/pr/forms/ContextG.js'];
									if (func){
										var context, f = func();
										context = f.Context();
										document.body.appendChild(context);
										model.tools.setPopupWindow('contextG', 'main');
										context.style.top = 
											model.currentItem.getBoundingClientRect().top + 'px';
										context.style.left = 
											model.currentItem.getBoundingClientRect().left + 'px';
										f.setWidth(context);
									} else console.log(scriptName);
								});
							e.preventDefault();
						}
					}
				}
			} else {
				var page = svg.childNodes[i].getElementsByTagName('g')[0];
				page.onclick = function() {
					clearSelection(this);
				}
			}
		}
	}

	function runFuncByName(target, name) {
		var activeGroup = model.tools.getGroupByName(target.id);
		var scriptName = './scripts/' + activeGroup.script + '.js';

		model.psFunctions.run(scriptName, function() {
			var func = model.psFunctions.results[scriptName];
			if (!func) return false;
			switch(name) {
				case 'ondblclick':
					if(typeof func(activeGroup.element).onDoubleClick === 'function')
						func(activeGroup.element).onDoubleClick();
					break;
				case 'onclick':
					if(typeof func(activeGroup.element).onClick === 'function')
						func(activeGroup.element).onClick();
					break;
			}
		});
	}
}