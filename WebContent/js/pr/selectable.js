function selectable(svg) {
	var svgNS = "http://www.w3.org/2000/svg";
	var rect = createRectangle();

	function createRectangle(){
		var rectangle = document.createElementNS(svgNS,"rect");
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

	function clearSelection(obj) {
		var sels = $('.selectableRectangle');
		if (!keysF.ctrl) {
			sels.each(function(){
				$(this).remove();
			});
			rect.setAttribute("stroke","none");
			rect.setAttribute("selectedId",'');
		}
	}

	function onselect(obj) {
		if((rect.getAttribute('stroke') !== 'none') && (keysF.ctrl == true)) {
			var nRect = createRectangle();
			selectRect(nRect, obj);
		} else {
			clearSelection();
			selectRect(rect, obj);
			setObjectProperties(obj);
		}
	}

	function selectRect(rect, obj) {
		var bbox = obj.getBBox();
		var transform = obj.getAttribute('transform');

		rect.setAttribute("x",bbox.x);
		rect.setAttribute("y",bbox.y);
		rect.setAttribute("width",bbox.width);
		rect.setAttribute("height",bbox.height);
		rect.setAttribute("stroke","blue");
		rect.setAttribute("transform",transform);

		rect.setAttribute("selectedId",obj.getAttribute('id'));
	}

	function setObjectProperties(obj) {
		if (obj.getElementsByTagName('title')[0] !== undefined) {
			document.getElementById('infoName').innerHTML = 
				obj.getElementsByTagName('title')[0].innerHTML;
			document.getElementById('infoCode').innerHTML = obj.getAttribute('idSignal');
			document.getElementById('infoType').innerHTML = obj.getAttribute('typeSignal');
			document.getElementById('infoMode').innerHTML = obj.getAttribute('infoMode');
			if (obj.getAttribute('TS') === '1') {
				document.getElementById('infoValue').innerHTML = obj.getAttribute('value') + '·\
					' + obj.getAttribute('koef') + ' = \
					' +(obj.getAttribute('value') * obj.getAttribute('koef'));
			} else {
				document.getElementById('infoValue').innerHTML = obj.getAttribute('value');
			}
			document.getElementById('infoUnit').innerHTML = obj.getAttribute('unit');
			var quality;
			var locale = 'Language_' + document.getElementById('lang').value;
			switch(obj.getAttribute('rcode')) {
				case '0': 
					quality = '<span id="${keyAuto}"\
						>' + translateValueByKey('keyAuto') + '</span>';
					break;
				case '107': 
					quality = '<span id="${keyManual}"\
						>' + translateValueByKey('keyManual') + '</span>';
					break;
			}
			document.getElementById('infoQuality').innerHTML = quality;
			document.getElementById('infoDate').innerHTML = obj.getAttribute('dateFormated');
		} else {
			document.getElementById('infoName').innerHTML = '';
			document.getElementById('infoCode').innerHTML = '';
			document.getElementById('infoType').innerHTML = '';
			document.getElementById('infoMode').innerHTML = '';
			document.getElementById('infoValue').innerHTML = '';
			document.getElementById('infoUnit').innerHTML = '';
			document.getElementById('infoQuality').innerHTML = '';
			document.getElementById('infoDate').innerHTML = '';
		}
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
							runFuncByName(this, 'ondblclick');
							e.preventDefault();
						},
						gs[j].oncontextmenu = function(){
							onselect(this);
							alert('right');
							//return false;
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
		var activeGroup = getGroupByName(target.id);
		var scriptName = './scripts/' + activeGroup.script + '.js';

		psFunctions.run(scriptName, function() {
			var func = psFunctions.results[scriptName];
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