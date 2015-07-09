var model = new Model();

function Model(){
	var _m = Object.create(null), myScroll, onMoveListener;

	_m.noCache = 'no-cache';
	_m.removeElement = function(e){if(e) e.parentNode.removeChild(e);}
	_m.autoClose = autoClose;
	_m.saveTextAsFile = saveTextAsFile;

	_m.svg = {};
	_m.setSVG = setSVG;
	_m.svg.namespace = 'http://www.w3.org/2000/svg';

	_m.transparants = [];
	_m.addTransparant = addTransparant;
	_m.insertTransparant = insertTransparant;
	_m.updateTransparant = updateTransparant;

	_m.alarm = new Alarms();
	_m.setCurrentItem = setCurrentItem;

	_m.ObjectProperties = {left: '5px', top: '250px'};
	_m.ObjectProperties.show = ObjectPropertiesShow;
	_m.ObjectProperties.hide = ObjectPropertiesHide;
	_m.updateObjectProperties = updateObjectProperties;

	_m.EditObjectProperties = {left: '5px', top: '250px'};
	_m.EditObjectProperties.show = EditObjectPropertiesShow;
	_m.EditObjectProperties.hide = EditObjectPropertiesHide;
	_m.EditObjectProperties.update = EditObjectPropertiesUpdate;

	_m.SignalsForm = {left: '400px', top: '100px'};
	_m.SignalsForm.show = SignalsFormShow;
	_m.SignalsForm.hide = SignalsFormHide;

	return _m;
//============ Implemantation ============
	function saveTextAsFile(textToWrite, fileNameToSaveAs){
		var textFileAsBlob = new Blob([textToWrite], {type:'text/plain'}),
				downloadLink = document.createElement("a");

		downloadLink.download = fileNameToSaveAs;
		downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
		downloadLink.click();
	}

	function autoClose(){
		var cls = document.querySelectorAll('.autoClose');
		if(cls.length > 0)
			Array.prototype.forEach.call(cls, function(e){
				_m.removeElement(e);
			});
	}

	function addTransparant(id, titleText, x, y){
		var cm = {
					type: 'CommandMessage', 
					command: 'addTransparant',
					parameters: []
				},
				name = _m.currentItem.getElementsByTagName('title')[0],
				idSignal = _m.currentItem.getAttribute('cp_id');

		name = name ? name.innerHTML : '';
		idSignal = idSignal ? idSignal : '0';
		cm.parameters.push({'id': id});
		cm.parameters.push({'x': x + ''});
		cm.parameters.push({'y': y + ''});
		cm.parameters.push({'txt': titleText});
		cm.parameters.push({'objName': name});
		cm.parameters.push({'idSignal': idSignal});
		webSocket.send(JSON.stringify(cm));
	}

	function insertTransparant(id, titleText, x, y, idTr){
		var desc = _m.transparants[id].desc,
				svg = desc.slice(desc.indexOf(';') + 1),
				g = svg.slice(svg.indexOf('<g'), svg.indexOf('</svg')),
				t = document.createElementNS(_m.svg.namespace,"g"),
				title = document.createElementNS(_m.svg.namespace,'title');

		t.innerHTML = g;
		t.setAttribute('id', 'transparant_' + (idTr === undefined ? id : idTr));
		title.textContent = titleText;
		t.appendChild(title);
		t.setAttribute('transform', 'translate(' + x + ',' + y + ')');

		t.addEventListener('mousedown',function(evt){
			if(evt.buttons != 1) return;
			_m.myScroll.disable();
			onMoveListener = function(evt){
				var	p = cursorPoint(evt, t), bounds = t.getBBox(),
						scale = _m.svg.content.getAttribute('style'), sc;

				scale = scale.slice(scale.indexOf('scale'));
				scale = scale.slice(scale.indexOf('(') + 1, scale.indexOf(')'));
				sc = Number(scale);

				t.setAttribute('transform', 
					'translate(' + (p.x/sc - 0.5*bounds.width) + ',' + 
												 (p.y/sc - 0.5*bounds.height) + ')');
			}
			document.body.addEventListener('mousemove', onMoveListener,false);
		},false);
		t.addEventListener('mouseup',function(evt){
			var cm = {
					type: 'CommandMessage', 
					command: 'updateTransparant',
					parameters: []
				},
				translate = t.getAttribute('transform'), x, y;

			translate = translate.slice(translate.indexOf('(')+1, translate.length-1);
			x = translate.slice(0, translate.indexOf(','));
			y = translate.slice(translate.indexOf(',') + 1);

			cm.parameters.push({'idtr': idTr});
			cm.parameters.push({'x': x + ''});
			cm.parameters.push({'y': y + ''});
			cm.parameters.push({'txt': titleText});
			document.body.removeEventListener('mousemove',onMoveListener,false);
			webSocket.send(JSON.stringify(cm));
			_m.myScroll.enable();
		},false);
		function cursorPoint(evt, t){
			var p = _m.svg.point;
			p.x = evt.clientX; p.y = evt.clientY;
			return p.matrixTransform(_m.svg.content.getScreenCTM().inverse());
		}

		t.oncontextmenu = function(e){
			psFunctions.run('./js/pr/forms/ContextG.js', 
				function(){
					var func = psFunctions.results['./js/pr/forms/ContextG.js'];
					if (func){
						var f = func(), menu = f.ContextTransp(t);

						document.body.appendChild(menu);
						setPopupWindow('contextT', 'main');
						menu.style.top = 
							t.getBoundingClientRect().top + 'px';
						menu.style.left = 
							t.getBoundingClientRect().left + 'px';
						f.setWidth(menu);
					} else console.log(scriptName);
				});
			e.preventDefault();
		}

		_m.svg.content.appendChild(t);
	}

	function updateTransparant(t, titleText, x, y){
		var title = t.getElementsByTagName('title')[0];

		t.setAttribute('transform', 'translate(' + x + ',' + y + ')');
		title.innerHTML = titleText;
	}

	function setSVG(content){
		_m.svg.content = content;
		_m.svg.point = content.createSVGPoint();
		content.addEventListener('click', function(){
			_m.autoClose();
		});
	}

	function setCurrentItem(item){
		_m.currentItem = item;
		_m.updateObjectProperties();
		_m.currentItem.position = getCurrentItemPosition();
	}

	function updateObjectProperties(){
		if (_m.currentItem) setObjectProperties(_m.currentItem);
	}

	function ObjectPropertiesShow(){
		psFunctions.run('./js/pr/forms/ObjectProperties.js', 
			function(){
				var func = psFunctions.results['./js/pr/forms/ObjectProperties.js'];
				if (func){
					if (document.getElementById('objectProperties')){
						_m.ObjectProperties.hide();
					} else {
						document.body.appendChild(func().ObjectProperties());
						setPopupWindow('objectProperties', 'main');
						_m.updateObjectProperties();
					}
				} else console.log(scriptName);
			});
	}

	function ObjectPropertiesHide(){
		var elem = document.getElementById("objectProperties");
		_m.ObjectProperties.left = elem.style.left;
		_m.ObjectProperties.top = elem.style.top;
		return elem.parentNode.removeChild(elem);
	}

	function EditObjectPropertiesShow(){
		psFunctions.run('./js/pr/forms/ObjectProperties.js', 
			function(){
				var func = psFunctions.results['./js/pr/forms/ObjectProperties.js'];
				if (func){
					if (document.getElementById('editObjectProperties')){
						_m.EditObjectProperties.hide();
					} else {
						document.body.appendChild(func().EditObjectProperties());
						setPopupWindow('editObjectProperties', 'main');
					}
				} else console.log(scriptName);
			});
	}

	function EditObjectPropertiesHide(){
		var elem = document.getElementById("editObjectProperties");
		_m.EditObjectProperties.left = elem.style.left;
		_m.EditObjectProperties.top = elem.style.top;
		return elem.parentNode.removeChild(elem);
	}

	function EditObjectPropertiesUpdate(){
		var elem = document.getElementById("editObjectProperties");
		if(elem && elem.style.display === 'block'){
			_m.EditObjectProperties.hide();
			_m.EditObjectProperties.show();
		}
	}

	function SignalsFormShow(id, editElem){
		if(document.getElementById('signalsForm')){
			_m.SignalsForm.hide();
		}
		psFunctions.run('./js/pr/forms/Signals.js', 
			function(){
				var func = psFunctions.results['./js/pr/forms/Signals.js'];
				if (func){
					var fObj = func();
					document.body.appendChild(fObj.SignalsForm(editElem));
					setPopupWindow('signalsForm', 'main');
					fObj.initSignalsTree(id);
				} else console.log(scriptName);
			});
	}

	function SignalsFormHide(){
		var elem = document.getElementById("signalsForm");
		_m.SignalsForm.left = elem.style.left;
		_m.SignalsForm.top = elem.style.top;
		return elem.parentNode.removeChild(elem);
	}

	function Alarms(){
		var alarm = {}, alarmTable = {};

		alarm.table = alarmTable;
		alarm.countElement = document.getElementById('alarmsCount');
		alarm.count = 0;
		alarm.IncCount = function(){
			alarm.countElement.innerHTML = ++alarm.count;
		}
		alarm.DecCount = function(){
			alarm.countElement.innerHTML = --alarm.count;
		}
		alarm.addRow = function(text){
			alarm.table.body.append(text);
			alarm.IncCount();
		}
		alarm.sortTable = function(){
			alarm.table.body.trigger("update")
				.trigger("sorton", [[[7,0],[12,0],[4,1]]]);
			if($('#alarmTable tbody tr:first').find('td')[7].innerHTML === 1) 
				alarm.table.body.trigger("sorton", [[[4,1]]]);
		}
		alarm.clearTable = function(){
			$.tablesorter.clearTableBody($('#alarmTable')[0]);
			alarm.count = 0;
		}
		alarmTable.table = document.getElementById('alarmTable');
		alarmTable.body = $('#alarmTable tbody');
		alarmTable.headerRowCols = $('#alarmTable thead tr:first').find('th');
		return alarm;
	}

	function setObjectProperties(obj){
		if(document.getElementById('objectProperties')){
			if (obj.getElementsByTagName('title')[0] !== undefined){
				document.getElementById('infoName').innerHTML = 
					obj.getElementsByTagName('title')[0].innerHTML;
				var code = obj.getAttribute('cp_id');
				if(code === '0') code = obj.getAttribute('cp_idTS');
				document.getElementById('infoCode').innerHTML = code;
				document.getElementById('infoType').innerHTML = obj.getAttribute('typeSignal');
				document.getElementById('infoMode').innerHTML = obj.getAttribute('infoMode');
				if (obj.getAttribute('TS') === '1'){
					document.getElementById('infoValue').innerHTML = obj.getAttribute('value') + '·\
						' + obj.getAttribute('koef') + ' = \
						' +(obj.getAttribute('value') * obj.getAttribute('koef'));
				} else {
					document.getElementById('infoValue').innerHTML = obj.getAttribute('value');
				}
				document.getElementById('infoUnit').innerHTML = obj.getAttribute('unit');
				var quality;
				var locale = 'Language_' + document.getElementById('lang').value;
				switch(obj.getAttribute('rcode')){
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
	}

	function getCurrentItemPosition(){
		var bbox = _m.currentItem.getBBox(),
				x = bbox.x, y = bbox.y,
				transform = _m.currentItem.getAttribute('transform'),
				matrix = transform.slice(transform.indexOf('(') + 1, 
																 transform.length - 1).split(','),
				a = Number(matrix[0]), b = Number(matrix[1]),
				c = Number(matrix[2]), d = Number(matrix[3]),
				e = Number(matrix[4]), f = Number(matrix[5]);

		function convert(x1, y1, x2, y2){
			return{
				left: 	(x1*a) + (y1*c) + e,
				top: 		(x1*b) + (y1*d) + f,
				right: 	(x2*a) + (y2*c) + e,
				bottom: (x2*b) + (y2*d) + f
			}
		}
		return convert(x, y, x + bbox.width, y + bbox.height);
	}
}