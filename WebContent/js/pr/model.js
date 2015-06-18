var model = new Model();

function Model(){
	var model = {};

	model.alarm = modelFunction();
	model.setCurrentItem = function(item) {
		model.currentItem = item;
		setObjectProperties(item);
	}
	model.updateObjectProperties = function(){
		setObjectProperties(model.currentItem);
	}
	return model;

	function modelFunction() {
		var alarm = {}, alarmTable = {};

		alarm.table = alarmTable;
		alarm.countElement = document.getElementById('alarmsCount');
		alarm.count = 0;
		alarm.IncCount = function() {
			alarm.countElement.innerHTML = ++alarm.count;
		}
		alarm.DecCount = function() {
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
}