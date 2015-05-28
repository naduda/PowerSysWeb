var docURL = document.URL;
docURL = docURL.substring(docURL.indexOf('://'), docURL.lastIndexOf("/"));
var webSocket = new WebSocket('ws' + docURL + '/load');
var myScroll;

// function showLogin() {
// 	var userID = 'admin', psw;
// 	BootstrapDialog.show({
// 		size: BootstrapDialog.SIZE_SMALL,
// 		title: 'Login',
// 		message: '<form action="">' +
// 						'<table><tr><td style="padding:5px;">' +
// 						'User name</td><td>' + 
// 						'<input type="text" value="' + userID +
// 						'" style="padding:0 5px;" class="canSelect"><br>' + 
// 						'</td></tr>' + 
// 						'<tr><td style="padding:5px;">Password</td><td>' + 
// 						'<input type="password" name="password" ' + 
// 						'style="padding:0 5px;" class="canSelect">' + 
// 						'</td></tr></table>' +
// 						'</form>',
// 		onshown: function(dialog) {
// 			dialog.getModalBody().find('input').focus();
// 			dialog.getModalBody().find('input').select();
// 		},
// 		buttons: [{
// 			icon: 'glyphicon glyphicon-send',
// 			label: '  Login (Enter)',
// 			cssClass: 'menubutton',
// 			hotkey: 13, // Enter.
// 			autospin: true,
// 			action: function(dialog){
// 				var user = dialog.getModalBody().find('input:first').val();
// 				var psw = dialog.getModalBody().find('input:last').val();
// 				dialog.enableButtons(false);
// 				var urlData = 'http:' + docURL + '/dataServer/db/checkuser?params=' + psw;
// 				var req = new XMLHttpRequest();
// 				req.open("POST", urlData, true);
// 				req.addEventListener("load", function() {
// 					if (req.status == 200) {
// 						var uData = JSON.parse(req.responseText);

// 						webSocket.send(JSON.stringify({
// 							'type' : 'CommandMessage', 'command' : 'checkuser',
// 							'parameters' : [{
// 								'name' : user,
// 								'password' : uData.encript,
// 								'IP' : uData.clientIP
// 							}]
// 						}));
// 					}
// 				});
// 				req.send();
// 			}
// 		}],
// 		draggable: true,
// 		closable: false
// 	});
// }

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
		window.location = docURL;
		//alert('Session closed! You need update your page.');
		// var isConnect = false;
		// while (!isConnect) {
		// 	try {
		// 		//setTimeout(function() {
		// 			webSocket = new WebSocket('ws' + docURL + '/load');
		// 			initWebSocket(webSocket);
		// 			isConnect = true;
		// 		//}, 1000);
		// 	} catch (e) {
		// 		console.log('Failed connect ...')
		// 	}
		// }
	}
	ws.onopen = function () {
		console.log('session open');
		// showLogin();
		initTree();
	}
}

initWebSocket(webSocket);

function onCommandMessage(data) {
	var parName;
	var parValue;
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
		var arr = data.parameters[0].value.split('_');
		document.getElementById('connectInfo').innerHTML = '   User - ' +
				arr[3] + '; Server - ' + arr[0] + '; DB - ' +
				arr[1] + '.';
	}
}

function onValueMessage(data) {
	var dti = {},
			lastDate = document.getElementById('lastDate'),
			timestamp = lastDate.getAttribute('timestamp'),
			dateFormated = timestamp2date(Number(timestamp));

	if(data.timestamp > timestamp) {
		lastDate.setAttribute('timestamp', data.timestamp);
		lastDate.innerHTML = timestamp2date(Number(data.timestamp));
	}

	for (var key in data) {
		if (data.hasOwnProperty(key)) {
			var val = data[key];
			if (key !== 'groups') dti[key] = val;
		}
	}

	for (i = 0; i < data.groups.length; i++) {
		var group = data.groups[i],
				activeGroup = getGroupByName(group.name);

		for (var key in group) {
			if (group.hasOwnProperty(key)) {
				var val = group[key];
				dti[key] = val;
			}
		}

		dti.koef = activeGroup.koef;
		dti.precision = activeGroup.precision;
		dti.unit = activeGroup.unit;

		var elem = new Elem(activeGroup, dti);
		psFunctions.run(elem.scriptName, elem.run);
	}
}

function Elem(activeGroup, dti){
	var scriptName = './scripts/' + activeGroup.script + '.js';
	var element = activeGroup.element;
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
				var selectedGroup = document.getElementById(gName);
				var valArray = val[gName].split(':');
				var title = document.createElementNS(
					"http://www.w3.org/2000/svg","title");
				title.textContent = valArray[7];
				selectedGroup.appendChild(title);
				selectedGroup.setAttribute('idSignal', valArray[0]);
				selectedGroup.setAttribute('TS', valArray[2]);
				selectedGroup.setAttribute('typeSignal', valArray[1]);
				selectedGroup.setAttribute('koef', valArray[3]);
				selectedGroup.setAttribute('precision', valArray[4]);
				selectedGroup.setAttribute('unit', valArray[5] || '');
				selectedGroup.setAttribute('script', valArray[6]);
			}
		}
	}
	webSocket.send(JSON.stringify({
		'type' : 'CommandMessage', 'command' : 'getOldValues'
	}));
}