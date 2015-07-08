var docURL = document.URL;
docURL = docURL.substring(docURL.indexOf('://'), docURL.lastIndexOf("/"));
var webSocket = new WebSocket('ws' + docURL + '/load'),
		myScroll, fileWebSocket = initWebSocketFileServer();

function initWebSocket(ws) {
	ws.onmessage = function (message) {
		var jsonData = JSON.parse(message.data);
		if(jsonData.type === 'CommandMessage') {
			onCommandMessage(jsonData);
		} else if (jsonData.type === 'ValueMessage') {
			onValueMessage(jsonData);
		} else if (jsonData.type === 'AlarmMessage') {
			// tools.js
			onAlarmMessage(jsonData);
		} else if (jsonData.type === 'KeyValueArrayMessage') {
			onArrayMessage(jsonData);
		}
	}
	ws.onerror = function (e) {
		console.log(e);
	}
	ws.onclose = function () {
		console.log('session close ' + docURL);
		alert('Session closed! You need update your page.');
	}
	ws.onopen = function () {
		console.log('session open');
		$.getScript("./js/pr/tree.js", function(){
			initTree();
		});
	}
}
initWebSocket(webSocket);

function initWebSocketFileServer() {
	var ws = new WebSocket('ws' + docURL + '/fileserver');

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

function onCommandMessage(data) {
	var parName, parValue;
	if(data.command === 'scheme') {
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
				document.getElementById('schemeContainer').style.background = parValue;
			}
		}

		var svg = document.getElementsByTagName('svg').item(0);
		model.setSVG(svg);
		svg.setAttribute('width', '100%');
		svg.setAttribute('height', '100%');

		selectable(svg);

		var myScroll = new IScroll('#scheme', {
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

		webSocket.send(JSON.stringify({
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
	}
}

function onValueMessage(data) {
	var dti = {},
			lastDate = document.getElementById('lastDate'),
			timestamp = lastDate.getAttribute('timestamp'),
			dateFormated = timestamp2date(Number(timestamp)),
			lastDateFormated = timestamp2date(Number(data.timestamp));

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
				activeGroup = getGroupByName(group.name);

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
		psFunctions.run(elem.scriptName, elem.run);
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
		var func = psFunctions.results[scriptName];
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

		webSocket.send(JSON.stringify({
			'type' : 'CommandMessage', 'command' : 'getOldValues'
		}));
	}
}