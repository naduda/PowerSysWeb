var keysF = {}
window.addEventListener("keydown", function(event) {
		switch(event.keyCode) {
			case 16: keysF.shift = true; break;
			case 17: keysF.ctrl = true; break;
			case 18: keysF.ctrl = true; break;
			// default: console.log(event.keyCode);break;
		}
}, false);
window.addEventListener("keyup", function(event) {
		switch(event.keyCode) {
			case 16: keysF.shift = false; break;
			case 17: keysF.ctrl = false; break;
			case 18: keysF.ctrl = false; break;
		}
}, false);

function onHideShow(paneName, pane, state) {
	var button;
	var oldValue;
	var newValue;
	if (pane.prop('id') === 'southPane') {
		button = document.getElementById('tAlarms');
		var bText;
		if (state.isClosed == true) {
			oldValue = /\bfa-angle-double-down\b/;
			newValue = 'fa-angle-double-up';
			try {
				bText = document.getElementById('${keyHideAlarms}');
				bText.id = '${keyShowAlarms}';
				bText.innerHTML = translateValueByKey('keyShowAlarms');
			} catch(e){
				console.log('load.js onHideShow...');
			}
		} else {
			oldValue = /\bfa-angle-double-up\b/;
			newValue = 'fa-angle-double-down';
			try {
				bText = document.getElementById('${keyShowAlarms}');
				bText.id = '${keyHideAlarms}';
				bText.innerHTML = translateValueByKey('keyHideAlarms');
			} catch(e){
				console.log('load.js onHideShow...');
			}
		}
	} else if (pane.prop('id') === 'treeContainer') {
		button = document.getElementById('tTree');
		if (state.isClosed == true) {
			oldValue = /\bfa-angle-double-left\b/;
			newValue = 'fa-angle-double-right';
		} else {
			oldValue = /\bfa-angle-double-right\b/;
			newValue = 'fa-angle-double-left';
		}
	}
	button.className = button.className.replace(oldValue,newValue);
}

function setPopupWindow(popup, parent) {
	var iDiv = document.getElementById(popup);

	if (!iDiv.style.display) {
		var formWidth;
		$('#' + popup).draggable({
			containment: "#" + parent,
			handle: "div.popupHeader",
			start: function(){
				formWidth = $(this).width();
			},
			stop: function() {
				if((parseInt($(this).position().left) + $(this).width()) > $('#' + parent).width()) {
					$(this).css({
						left : ($('#' + parent).width() - formWidth) + 'px'
					});
				}
				if((parseInt($(this).position().top) + $(this).height()) > $('#' + parent).height()) {
					$(this).css({
						top : ($('#' + parent).height() - $(this).height()) + 'px'
					});
				}
			}
		});
		iDiv.style.display = 'block';
	} else {
		iDiv.style.display = iDiv.style.display === 'none' ?
			'block' : 'none';
	}
}

function setAlarmColumns() {
	var isExist = document.getElementById('alarmColumns') != null;
	var alarmColumns;
	var tr;
	if (isExist) {
		alarmColumns = document.getElementById('alarmColumns');
		tr = document.getElementById('alarmColumnsTriangle')
		alarmColumns.style.display = 
			alarmColumns.style.display === 'none' ?
																		 'block' : 'none';
		tr.style.display = alarmColumns.style.display;
	} else {
		var btn = document.getElementById('btnAlarmColumns');
		var offsets = btn.getBoundingClientRect();
		var top = offsets.top;
		var left = offsets.left;
		var elHeight = 200;

		alarmColumns = createAlarmColumns();
		alarmColumns.style.height = elHeight + 'px';
		alarmColumns.style.top = (top - elHeight/2) + 'px';
		alarmColumns.style.left = (left + offsets.width + 10) + 'px';
		alarmColumns.style.overflowY = 'scroll';
		alarmColumns.style.display = 'block';
		tr = createTriangle(top, (left + offsets.width + 2));
	}
}

function createTriangle(top, left) {
	var tr = document.createElement('div');
	tr.id = 'alarmColumnsTriangle';
	tr.setAttribute('class', 'triangleLeft');
	tr.style.top = top + 'px';
	tr.style.left = left + 'px';
	document.body.appendChild(tr);
	return tr;
}

function createAlarmColumns() {
	var ret = document.createElement('div');
	var headerRowCols = $('#alarmTable thead tr:first').find('th');
	var context = '';
	headerRowCols.each(function(){
		var colName = headerRowCols.eq($(this).index());
		var span = $(this).find('span:first');

		if ($(this).css('display') !== 'none') {
			var input = document.createElement('input');
			input.setAttribute('name', 'alarmColumns');
			input.setAttribute('value', colName.attr('id'));
			input.setAttribute('type', 'checkbox');
			input.checked = 'true';
			ret.appendChild(input);
			ret.appendChild(span.clone()[0]);
			ret.appendChild(document.createElement('br'));
		}
	});
	ret.id = 'alarmColumns';
	ret.setAttribute('class', 'popupW');
	document.body.appendChild(ret);
	$('input[name="alarmColumns"]').change(function(e){
		var idCol = $(this)[0].value;
		var ind;
		headerRowCols.each(function(){
			var colName = headerRowCols.eq($(this).index());
			if(colName.attr('id') === idCol) {
				ind = $(this).index();
			}
		})
		showHideColumn(ind, $(this)[0].checked);
	});
	return ret;
}

function timestamp2date(ts){
	var d = new Date(ts);
	var dd = d.getDate();
	var mm = d.getMonth() + 1;
	var yy = d.getFullYear();
	var hh = d.getHours();
	var mi = d.getMinutes();
	var ss = d.getSeconds();
	var SSS = d.getMilliseconds();
	dd = dd < 10 ? '0' + dd : dd;
	mm = mm < 10 ? '0' + mm : mm;
	hh = hh < 10 ? '0' + hh : hh;
	mi = mi < 10 ? '0' + mi : mi;
	ss = ss < 10 ? '0' + ss : ss;
	SSS = SSS > 10 ? (SSS > 100 ? SSS : '0' + SSS) : '00' + SSS;
	return dd + '.' + mm + '.' + yy + ' ' +
				 hh + ':' + mi + ':' + ss + '.' + SSS;
}

function onAlarmMessage(data) {
	var headerRowCols = $('#alarmTable thead tr:first').find('th');
	var newColumn = '';
	data.eventDTorign = data.eventDT;
	data.recordDTorign = data.recordDT;
	data.eventDT = data.eventDT.length > 23 ? 
		data.eventDT.substring(0, 23) : data.eventDT;
	data.recordDT = data.recordDT.length > 23 ? 
		data.recordDT.substring(0, 23) : data.recordDT;

	// $("#alarmTable").colResizable({disable : true});
	$('#alarmTable tbody tr').each(function(){
		var eventDT = $(this).find('td').eq(4).html();
		var recordDT = $(this).find('td').eq(3).html();
		var objectRef = $(this).find('td').eq(15).html();

		if(data.eventDT === eventDT && data.recordDT === recordDT &&
			data.objectRef === objectRef) {
			$(this).remove();
		}
	});

	headerRowCols.each(function(){
		var colName = headerRowCols.eq($(this).index());
		var val = data[colName[0].id] || '-';
		var actual = val.length * 9;
		var hName = colName[0].getElementsByTagName('span')[0]
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

	$('#alarmTable tbody').append('<tr style="background-color:' + 
		data.color + '">' + newColumn + '</tr>')
		.trigger("update").trigger("sorton", [[[7,0],[12,0],[4,1]]]);
	var status = $('#alarmTable tbody tr:first').find('td')[7];
	if(status.innerHTML === 1)
		$('#alarmTable tbody').trigger("sorton", [[[4,1]]]);

	$("#alarmTable").colResizable({
		liveDrag:true,
		fixed:false
	});
	document.getElementById('alarmsCount').innerHTML =
		document.getElementById('alarmTable')
			.getElementsByTagName("tbody")[0]
			.getElementsByTagName("tr").length;
}