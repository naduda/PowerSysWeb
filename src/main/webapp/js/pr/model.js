var model = new Model();

function Model(){
	var _m = Object.create(null), myScroll, onMoveListener;

	_m.psFunctions = {
		results: Object.create(null),
		run: function(name, cb) {
			if (name in this.results){
				cb();
			} else {
				readScript(name, cb);
			}
		}
	};

	setTranslator();
	initKeysListeners();
	_m.tools = new Tools();
	_m.noCache = 'no-cache';
	_m.docURL = getDocURL();

	_m.removeElement = function(e){if(e) e.parentNode.removeChild(e);}
	_m.autoClose = autoClose;
	_m.saveTextAsFile = saveTextAsFile;

	_m.chart = createChart();
	_m.alarm = setAlarms(function(){
		_m.webSocket = initWebSocket();
		_m.fileWebSocket = initWebSocketFileServer();
	});
	_m.setCurrentItem = setCurrentItem;

	_m.svg = {};
	_m.setSVG = setSVG;
	_m.svg.namespace = 'http://www.w3.org/2000/svg';

	_m.transparants = [];
	_m.addTransparant = addTransparant;
	_m.insertTransparant = insertTransparant;
	_m.updateTransparant = updateTransparant;

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
	function readScript(file, cb){
		var sName = file.substring(file.lastIndexOf('/') + 1, file.lastIndexOf('.'));
		if (!sName) return false;

		var rawFile = new XMLHttpRequest();
		rawFile.open("GET", file, true);
		if(model && model.noCache)
			rawFile.setRequestHeader('Cache-Control', model.noCache);
		// rawFile.onreadystatechange = function () {
		rawFile.addEventListener("load", function() {
			if(rawFile.readyState === 4) {
				if(rawFile.status === 200 || rawFile.status == 0) {
					var allText = rawFile.responseText,
							func = new Function('obj', allText);
					_m.psFunctions.results[file] = func;

					try {
						cb(func);
					} catch(e) {
						console.log(e);
						console.log(file);
					}
				}
			}
		});
		rawFile.send(null);
	}

	function setTranslator(){
		_m.psFunctions.run('./js/pr/translate.js', 
				function(){
					var func = _m.psFunctions.results['./js/pr/translate.js'];
					if(func){
						_m.Translator = func().Translator();
					} else console.log(scriptName);
				});
	}

	function initWebSocketFileServer(){
		var ws = new WebSocket('ws' + _m.docURL + '/fileserver');

		ws.binaryType = "arraybuffer";
		ws.onopen = function() {
				console.log("FileServer Connected.")
		};

		ws.onmessage = function(evt) {
				try{
					var msg = JSON.parse(evt.data);
					switch(msg.type.toLowerCase()){
						case 'ok':
							var selectedNodeId = $('#treeDIV').jstree('get_selected').toString();
							$("#treeDIV").jstree("deselect_node", "#" + selectedNodeId);
							$("#treeDIV").jstree("select_node", "#" + selectedNodeId);
							alert('Done! OK!');
							break;
						case 'error':
							alert('Error! See log file.');
							break;
						default:
							console.log('Message type = ' + msg.type);
							break;
					}
				} catch(e) {
					console.log('Error: ' + e);
				}
		};

		ws.onclose = function() {
				console.log("Connection is closed...");
		};
		ws.onerror = function(e) {
				console.log(e.msg);
		}
		return ws;
	}

	function initWebSocket(){
		var ws = new WebSocket('ws' + _m.docURL + '/load');
		ws.onmessage = function (message) {
			var jsonData = JSON.parse(message.data);
			if(jsonData.type === 'CommandMessage') {
				onCommandMessage(jsonData);
			} else if (jsonData.type === 'ValueMessage'){
				onValueMessage(jsonData);
			} else if (jsonData.type === 'AlarmMessage'){
				_m.alarm.onAlarmMessage(jsonData);
			} else if (jsonData.type === 'KeyValueArrayMessage') {
				onArrayMessage(jsonData);
			}
		}
		ws.onerror = function (e) {
			console.log(e);
		}
		ws.onclose = function () {
			console.log('session close ' + model.docURL);
			alert('Session closed! You need update your page.');
		}
		ws.onopen = function(){
			console.log('session open');
			$.getScript('./js/pr/tree.js');
		}
		return ws;
	}

	function onCommandMessage(data){
		var parName, parValue;
		if(data.command === 'scheme'){
			for (i = 0; i < data.parameters.length; i++) {
				for (var key in data.parameters[i]) {
					parName = key;
					if (data.parameters[i].hasOwnProperty(key)) {
						parValue = data.parameters[i][key];
					}
				}

				if (parName === 'content') {
					document.getElementById('scheme').innerHTML = parValue;
				} else if (parName === 'fill') {
					document.getElementById('scheme').style.background = parValue;
					document.getElementById('schemeContainer')
									.style.background = parValue;
				}
			}

			var svg = document.getElementsByTagName('svg').item(0);
			model.setSVG(svg);
			svg.setAttribute('width', '100%');
			svg.setAttribute('height', '100%');

			selectable(svg);

			model.myScroll = new IScroll('#scheme', {
				zoom: true,
				zoomMax : 10,
				scrollX: true,
				scrollY: true,
				mouseWheel: true,
				wheelAction: 'zoom'
			});

			$('#alarmTable thead tr:first').find('th').each(function(){
				var actual = $(this).find('span:first').html()
								.length * 10 + 40;
				if($(this).width() < actual)
					$(this).width(actual);
			});

			model.webSocket.send(JSON.stringify({
				'type' : 'CommandMessage', 'command' : 'getScripts'
			}));
		} else if(data.command === 'priority') {
			var selectPriority = document.getElementById('alarmFilter');
			for (i = 0; i < data.parameters.length; i++) {
				for (var key in data.parameters[i]) {
					parName = key;
					if (data.parameters[i].hasOwnProperty(key)) {
						parValue = data.parameters[i][key];
					}
				}
				var option = document.createElement("option");
				option.value = parName;
				option.text = parValue;
				switch(parName) {
					case '1': option.style.backgroundColor = 'red'; break;
					case '2': option.style.backgroundColor = 'yellow'; break;
					case '3': option.style.backgroundColor = 'green'; break;
					default: option.style.backgroundColor = '#eee'; break;
				}
				selectPriority.add(option);
			}
		} else if(data.command === 'updateTU'){
			var param = data.parameters[0];
			if (param.status === '1')
				$('.modal.bootstrap-dialog').remove();
		} else if(data.command === 'connString'){
			var connStr = data.parameters[0].value,
				arr = connStr.split('_'), 
				user = arr[arr.length - 1],
				server = arr[0],
				dbName = connStr.substring(server.length + 1, connStr.length - user.length - 1);	

			document.getElementById('connectInfo').innerHTML = '   User - ' +
					user + '; Server - ' + server + '; DB - ' + dbName + '.';
		} else if(data.command === 'transparants'){
			for (i = 0; i < data.parameters.length; i++) {
				for (var key in data.parameters[i]) {
					if (data.parameters[i].hasOwnProperty(key)) {
						var item = {};
						item.id = key;
						item.desc = data.parameters[i][key];
						model.transparants[item.id] = item;
					}
				}
			}
		} else if(data.command === 'setTratsparant'){
			var idTr, id, titleText, x, y, t;

			for (i = 0; i < data.parameters.length; i++) {
				for (var key in data.parameters[i]) {
					if (data.parameters[i].hasOwnProperty(key)) {
						switch(key){
							case 'idTr': idTr = data.parameters[i][key]; break;
							case 'id': id = data.parameters[i][key]; break;
							case 'txt': titleText = data.parameters[i][key]; break;
							case 'x': x = data.parameters[i][key]; break;
							case 'y': y = data.parameters[i][key]; break;
						}
					}
				}
			}
			t = document.getElementById('transparant_' + idTr);
			if(t){
				model.updateTransparant(t, titleText, x, y);
			} else {
				model.insertTransparant(id,
						titleText === '' ? 'empty' : titleText, x, y, idTr);
			}
		} else if(data.command === 'delTratsparant'){
			var idTr = data.parameters[0]['idTr'];
					transp = document.getElementById('transparant_' + idTr);
			model.removeElement(transp);
		} else if(data.command === 'saveScheme'){
			model.saveTextAsFile(data.parameters[0]['content'], 'svgScheme.svg');
		}
	}

	function onValueMessage(data) {
		var dti = {},
				lastDate = document.getElementById('lastDate'),
				timestamp = lastDate.getAttribute('timestamp'),
				dateFormated = model.tools.timestamp2date(Number(timestamp)),
				lastDateFormated = model.tools.timestamp2date(Number(data.timestamp));

		if(data.timestamp > timestamp) {
			lastDate.setAttribute('timestamp', data.timestamp);
			lastDate.innerHTML = lastDateFormated;
		}

		for (var key in data) {
			if (data.hasOwnProperty(key)) {
				if (key !== 'groups') dti[key] = data[key];
			}
		}

		for (i = 0; i < data.groups.length; i++) {
			var group = data.groups[i],
					activeGroup = model.tools.getGroupByName(group.name);

			activeGroup.element.setAttribute('dateFormated', lastDateFormated);
			activeGroup.element.setAttribute('rcode', data.rcode);
			activeGroup.element.setAttribute('infoMode', data.mode);
			for (var key in group) {
				if (group.hasOwnProperty(key)) {
					dti[key] = group[key];
				}
			}

			dti.koef = activeGroup.koef;
			dti.precision = activeGroup.precision;
			dti.unit = activeGroup.unit;

			var elem = new Elem(activeGroup, dti);
			_m.psFunctions.run(elem.scriptName, elem.run);
		}
		if (model.currentItem != null) {
			model.updateObjectProperties();
		}
	}

	function Elem(activeGroup, dti){
		var scriptName = './scripts/' + activeGroup.script + '.js',
				element = activeGroup.element;
		this.dti = dti;
		this.scriptName = scriptName;
		this.run = function() {
			var func = _m.psFunctions.results[scriptName];
			if (func){
				func(element).onChange(dti);
				element.setAttribute('value', dti.value);
			} else console.log(scriptName);
		}
	}

	function onArrayMessage(data) {
		if (data.name === 'scripts') {
			var arr = data.array;
			for(var i in arr){
				var val = arr[i];
				for(var gName in val){
					var selectedGroup = document.getElementById(gName),
							valArray = val[gName].
											slice(0, val[gName].indexOf('[')).split(':'),
							title = document.createElementNS(model.svg.namespace,'title'),
							custProps = val[gName].substring(
															val[gName].indexOf('[') + 1, 
															val[gName].indexOf(']')),
							props = custProps.split(';');

					if(valArray.length > 0){
						title.textContent = valArray[0];
						selectedGroup.appendChild(title);
						selectedGroup.setAttribute('typeSignal', valArray[1]);
						selectedGroup.setAttribute('TS', valArray[2]);
						selectedGroup.setAttribute('koef', valArray[3]);
						selectedGroup.setAttribute('precision', valArray[4]);
						selectedGroup.setAttribute('unit', valArray[5] || '');
						selectedGroup.setAttribute('script', valArray[6] || '');
					}

					Array.prototype.forEach.call(props, function(prop){
						var pName = prop.substring(0, prop.indexOf(':')),
								pValue = prop.substring(prop.indexOf(':') + 1);
						selectedGroup.setAttribute(pName, pValue);
					});
				}
			}

			model.webSocket.send(JSON.stringify({
				'type' : 'CommandMessage', 'command' : 'getOldValues'
			}));
		}
	}

	function getDocURL(){
		var docURL = document.URL;
				docURL = docURL.substring(docURL.indexOf('://'), 
																	docURL.lastIndexOf("/"));
		return docURL;
	}

	function initKeysListeners(){
		if(!_m.keysF) _m.keysF = Object.create(null);
		window.addEventListener("keydown", function(event){
			switch(event.keyCode) {
				case 16: _m.keysF.shift = true; break;
				case 17: _m.keysF.ctrl = true; break;
				case 18: _m.keysF.ctrl = true; break;
				// default: console.log(event.keyCode);break;
			}
		}, false);
		window.addEventListener("keyup", function(event){
				switch(event.keyCode) {
					case 16: _m.keysF.shift = false; break;
					case 17: _m.keysF.ctrl = false; break;
					case 18: _m.keysF.ctrl = false; break;
				}
		}, false);
	}

	function createChart(){
		$.getScript("./js/pr/chart.js", function(){
			_m.chart = new Chart();
		});
		return _m.chart;
	}

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
		_m.webSocket.send(JSON.stringify(cm));
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
			_m.webSocket.send(JSON.stringify(cm));
			_m.myScroll.enable();
		},false);
		function cursorPoint(evt, t){
			var p = _m.svg.point;
			p.x = evt.clientX; p.y = evt.clientY;
			return p.matrixTransform(_m.svg.content.getScreenCTM().inverse());
		}

		t.oncontextmenu = function(e){
			_m.psFunctions.run('./js/pr/forms/ContextG.js', 
				function(){
					var func = _m.psFunctions.results['./js/pr/forms/ContextG.js'];
					if (func){
						var f = func(), menu = f.ContextTransp(t);

						document.body.appendChild(menu);
						_m.tools.setPopupWindow('contextT', 'main');
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
		var alarmTable = document.getElementById('divTableAlarm');
		_m.svg.content = content;
		_m.svg.point = content.createSVGPoint();
		content.addEventListener('click', function(){_m.autoClose();});
		alarmTable.addEventListener('click', function(){_m.autoClose();});
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
		_m.psFunctions.run('./js/pr/forms/ObjectProperties.js', 
			function(){
				var func = _m.psFunctions.results['./js/pr/forms/ObjectProperties.js'];
				if (func){
					if (document.getElementById('objectProperties')){
						_m.ObjectProperties.hide();
					} else {
						document.body.appendChild(func().ObjectProperties());
						_m.tools.setPopupWindow('objectProperties', 'main');
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
		_m.psFunctions.run('./js/pr/forms/ObjectProperties.js', 
			function(){
				var func = _m.psFunctions.results['./js/pr/forms/ObjectProperties.js'];
				if (func){
					if (document.getElementById('editObjectProperties')){
						_m.EditObjectProperties.hide();
					} else {
						document.body.appendChild(func().EditObjectProperties());
						_m.tools.setPopupWindow('editObjectProperties', 'main');
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
		_m.psFunctions.run('./js/pr/forms/Signals.js', 
			function(){
				var func = _m.psFunctions.results['./js/pr/forms/Signals.js'];
				if (func){
					var fObj = func();
					document.body.appendChild(fObj.SignalsForm(editElem));
					_m.tools.setPopupWindow('signalsForm', 'main');
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

	function setAlarms(cb){
		$.getScript("./js/pr/alarms.js", function(){
			model.alarm = new Alarms();
			if(cb) cb();
		});
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
							>' + model.Translator.translateValueByKey('keyAuto') + '</span>';
						break;
					case '107': 
						quality = '<span id="${keyManual}"\
							>' + model.Translator.translateValueByKey('keyManual') + '</span>';
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