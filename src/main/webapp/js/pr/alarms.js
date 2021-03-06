function Alarms(){
	var alarm = Object.create(null), alarmTable = Object.create(null);
//======================= Init =======================
	$.tablesorter.addParser({
		id: "customDate",
		format: function(s) {
			s = s.replace("/\-/g"," ");
			s = s.replace(/:/g," ");
			s = s.replace(/\./g," ");
			s = s.split(" ");
			return $.tablesorter.formatFloat(
				new Date(s[2], s[1]-1, s[0], s[3], s[4], s[5])
				.getTime() + parseInt(s[6]));
		},
		type: "numeric"
	});
	$("#alarmTable").tablesorter({
		widgets: ['stickyHeaders'],
		widgetOptions: {
			stickyHeaders_attachTo: '#divTableAlarm'
		},
		headers: {
			3: { sorter:'customDate' },
			4: { sorter:'customDate' },
			8: { sorter:'customDate' }
		}
	});
	$("#alarmFilter").bind('change', function (e) {
		var val = $(this).val();
		$('#alarmTable tbody tr').each(function(){
			var colPrior = $(this).find('td').eq(12);
			if(val === colPrior.html() || val === '0') {
				$(this).css({'display':''});
			} else {
				$(this).css({'display':'none'});
			}
		});
	});

	$("#alarmTable").colResizable({
		liveDrag:true,
		fixed:false
	});

	$('#alarmTable tbody').on('click', 'tr', function(){
		$(this).hasClass('selectedAlarm') ? 
			$(this).removeClass('selectedAlarm') : $(this).addClass('selectedAlarm');
	});
//====================================================
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
		var firstState = $('#alarmTable tbody tr:first').find('td')[7];
		if(!firstState) return;

		alarmTable.body.trigger("update");
		if(firstState.innerHTML === 1){
			alarmTable.body.trigger("sorton", [[[4,1]]]);
		} else {
			alarmTable.body.trigger("sorton", [[[7,0],[12,0],[4,1]]]);
		}
	}
	alarm.clearTable = function(){
		$.tablesorter.clearTableBody($('#alarmTable')[0]);
		alarm.count = 0;
	}
	alarmTable.table = document.getElementById('alarmTable');
	alarmTable.body = $('#alarmTable tbody');
	alarmTable.rows = $('#alarmTable tbody tr');
	alarmTable.headerRowCols = $('#alarmTable thead tr:first').find('th');

	alarmTable.setHeaderColumnsWidth = function(){
		alarmTable.headerRowCols.each(function(){
			var colName = alarmTable.headerRowCols.eq($(this).index()),
					hName = colName[0].getElementsByTagName('span')[0]
											.innerHTML.length;

			hName = hName < 10 ? hName * 20 : hName < 15 ? hName * 14 : hName * 12;
			if ($(this).css('display') !== 'none') $(this).width(hName);
		});
	}
	alarmTable.setHeaderColumnsWidth();

	alarm.onAlarmMessage = function(data, isUpdate){
		var newColumn = '';

		data.eventDTorign = data.eventDT;
		data.recordDTorign = data.recordDT;
		data.eventDT = data.eventDT.length > 23 ? 
			data.eventDT.substring(0, 23) : data.eventDT;
		data.recordDT = data.recordDT.length > 23 ? 
			data.recordDT.substring(0, 23) : data.recordDT;

		// $("#alarmTable").colResizable({disable : true});
		alarmTable.rows.each(function(){
			var eventDT = $(this).find('td').eq(4).html(),
					recordDT = $(this).find('td').eq(3).html(),
					objectRef = $(this).find('td').eq(15).html();

			if(data.eventDT === eventDT && data.recordDT === recordDT &&
				data.objectRef === objectRef) {
				$(this).remove();
			}
		});

		alarmTable.headerRowCols.each(function(){
			var colName = alarmTable.headerRowCols.eq($(this).index()),
					val = data[colName[0].id] || '-', actual = val.length * 9,
					hName = colName[0].getElementsByTagName('span')[0]
											.innerHTML.length * 12;

			actual = actual > hName ? actual : hName;
			if ($(this).css('display') !== 'none') {
				if (val === '-') {
					newColumn += '<td style="text-align: center;">' + 
						val + '</td>';
				} else {
					newColumn += '<td>' + val + '</td>';
				}
				if (actual > $(this).width()) {
					$(this).width(actual);
				}
			} else {
				newColumn += '<td style="display: none;">' + val + '</td>';
			}
		});

		alarm.addRow('<tr style="background-color:' + 
				data.color + '">' + newColumn + '</tr>');
		if (isUpdate == false) {
		} else {
			alarm.sortTable();
		}

		$("#alarmTable").colResizable({
			liveDrag:true,
			fixed:false
		});
	}

	alarm.showHideColumn = function(col, isShow) {
		var header2 = $('.tablesorter-sticky-wrapper');
		$('#alarmTable').find('tr').each(function(){
			$(this).find('th').eq(col).css({
				'display': isShow ? '' : 'none'
			})
			header2.find('th').eq(col).css({
				'display': isShow ? '' : 'none'
			})
			$(this).find('td').eq(col).css({
				'display': isShow ? '' : 'none'
			})
		});
	}

	alarm.confirmOne = function(){
		var isConfirm = true,
				cm = {}, par = {};
		cm.type = 'CommandMessage';
		cm.command = 'confimAlarmOne';
		cm.parameters = [];

		$('.selectedAlarm').each(function() {
			var recordDT = $(this).find('td')[17].innerHTML;
			var eventDT = $(this).find('td')[16].innerHTML;
			var objectRef = $(this).find('td')[15].innerHTML;
			var status = $(this).find('td')[7].innerHTML;

			if (Number(status) == 1) {
				par[eventDT + '_' + objectRef] = recordDT;
				isConfirm = false;
			}
		});

		if(isConfirm) {
			$('.selectedAlarm').each(function() {
				alert('This alarm already confirmed!')
				$(this).removeClass('selectedAlarm');
			});
			return true;
		}
		BootstrapDialog.show({
			size: BootstrapDialog.SIZE_SMALL,
			title: model.Translator.translateValueByKey('keyTooltip_kvitOne'),
			message: $('<textarea class="form-control" placeholder="Text..."></textarea>'),
			onshown: function(dialog) {
				dialog.getModalBody().find('textarea').focus();
			},
			buttons: [{
				icon: 'glyphicon glyphicon-send',
				label: '  ' + model.Translator.translateValueByKey('keySend'),
				cssClass: 'menubutton',
				autospin: true,
				action: function(dialog){
					par.text = dialog.getModalBody().find('textarea').val();
					cm.parameters.push(par);

					dialog.enableButtons(false);
					model.webSocket.send(JSON.stringify(cm));
					$('.selectedAlarm').each(function() {
						$(this).removeClass('selectedAlarm');
					});
					dialog.close();
				}
			}],
			draggable: true,
			closable: true
		});
	}

	alarm.confirmAll = function(){
		var cm = {};
		var par = {};
		cm.type = 'CommandMessage';
		cm.command = 'confimAlarmAll';
		cm.parameters = [];

		BootstrapDialog.show({
			size: BootstrapDialog.SIZE_SMALL,
			title: model.Translator.translateValueByKey('keyTooltip_kvitOne'),
			message: $('<textarea class="form-control" placeholder="Text..."></textarea>'),
			onshown: function(dialog) {
				dialog.getModalBody().find('textarea').focus();
			},
			buttons: [{
				icon: 'glyphicon glyphicon-send',
				label: '  ' + model.Translator.translateValueByKey('keySend'),
				cssClass: 'menubutton',
				autospin: true,
				action: function(dialog){
					par.text = dialog.getModalBody().find('textarea').val();
					cm.parameters.push(par);

					dialog.enableButtons(false);
					model.webSocket.send(JSON.stringify(cm));
					dialog.close();
				}
			}],
			draggable: true,
			closable: true
		});
	}

	return alarm;
}