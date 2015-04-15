var docURL = document.URL;
docURL = docURL.substring(docURL.indexOf('://'), docURL.lastIndexOf("/"));
var webSocket = new WebSocket('ws' + docURL + '/load');

function initWebSocket(ws) {
	ws.onmessage = function (message) {
		var jsonData = JSON.parse(message.data);
		if(jsonData.type === 'CommandMessage') {
			onCommandMessage(jsonData);
		} else if (jsonData.type === 'ValueMessage') {
			onValueMessage(jsonData);
		} else if (jsonData.type === 'AlarmMessage') {
			onAlarmMessage(jsonData);
		} else if (jsonData.type === 'KeyValueArrayMessage') {
			onArrayMessage(jsonData);
		}
	}
	ws.onerror = function (e) {
		console.log(e);
	}
	ws.onclose = function () {
		console.log('session close');
		webSocket = new WebSocket('ws' + docURL + '/load');
		initWebSocket(webSocket);
	}
	ws.onopen = function () {
		console.log('session open');
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
		svg.setAttribute('width', '98%');
		svg.setAttribute('height', '98%');

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
	}
}

function onValueMessage(data) {
	var dti = {};
	var lastDate = document.getElementById('lastDate');
	var timestamp = lastDate.getAttribute('timestamp');
	if(data.timestamp > timestamp) {
		lastDate.setAttribute('timestamp', data.timestamp);
		lastDate.innerHTML = data.dateFormated;
	}

	for (var key in data) {
		if (data.hasOwnProperty(key)) {
			var val = data[key];
			if (key !== 'groups') dti[key] = val;
		}
	}

	for (i = 0; i < data.groups.length; i++) {
		var group = data.groups[i];
		var selectedGroup = document.getElementById(group.name);
		var script = document.getElementById(group.name).getAttribute('script') || '';
		var fName = script.substring(script.lastIndexOf('/') + 1);

		for (var key in group) {
			if (group.hasOwnProperty(key)) {
				var val = group[key];
				dti[key] = val;
			}
		}

		dti.koef = selectedGroup.getAttribute('koef');
		dti.precision = selectedGroup.getAttribute('precision');
		dti.unit = selectedGroup.getAttribute('unit');

		loadFunction('./scripts/' + script + '.js', function (){
			var functPtr = window[fName];
			var gTitle = selectedGroup.getElementsByTagName('title')[0];
			selectedGroup.setAttribute('value', dti.value);
			selectedGroup.setAttribute('dateFormated', dti.dateFormated);
			selectedGroup.setAttribute('rcode', dti.rcode);
			selectedGroup.setAttribute('infoMode', dti.mode);

			// dti.koef = selectedGroup.getAttribute('koef');
			// dti.precision = selectedGroup.getAttribute('precision');
			// dti.unit = selectedGroup.getAttribute('unit');
			// if (gTitle === undefined) {
			// 	var title = document.createElementNS(
			// 		"http://www.w3.org/2000/svg","title");
			// 	title.textContent = dti.title;
			// 	selectedGroup.appendChild(title);
			// 	selectedGroup.setAttribute('idSignal', dti.idSignal);
			// 	selectedGroup.setAttribute('TS', dti.typeSignalValue);
			// 	selectedGroup.setAttribute('typeSignal', dti.typeSignal);
			// 	selectedGroup.setAttribute('infoMode', dti.mode);
			// 	selectedGroup.setAttribute('koef', dti.koef);
			// 	selectedGroup.setAttribute('unit', dti.unit);
			// }

			if (functPtr === undefined) {
				$.getScript ('./scripts/' + script + '.js', function (){
					functPtr = window[fName];
					if (functPtr === undefined) {
						console.log(script);
					} else {
						functPtr(selectedGroup).onChange(dti);
					}
				});
			} else {
				functPtr(selectedGroup).onChange(dti);
			}
			// selectedGroup.setAttribute('idSignal', dti.idSignal);
		});
	}
}

function onAlarmMessage(data) {
	var headerRowCols = $('#alarmTable thead tr:first').find('th');
	var newColumn = '';

	$( "#alarmTable" ).colResizable({ disable : true });

	headerRowCols.each(function(){
		var colName = headerRowCols.eq($(this).index());
		var val = data[colName[0].id] || '-';
		var actual = val.length * 9;

		if ($(this).css('display') !== 'none') {
			if (val === '-') {
				newColumn += '<td style="text-align: center;">' + 
					val + '</td>';
			} else {
				newColumn += '<td>' + val + '</td>';
			}
			if (actual > $(this).width()) $(this).width(actual);
		} else {
			newColumn += '<td style="display: none;">' + 
				val + '</td>';
		}
	});

	$('#alarmTable tbody').append('<tr style="background-color:' + 
		data.color + '">' + newColumn + '</tr>')
		.trigger("update").trigger("sorton", [[[7,0],[12,0],[4,1]]]);

	$("#alarmTable").colResizable({
		liveDrag:true,
		fixed:false
	});
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