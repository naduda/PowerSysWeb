//http://layout.jquery-dev.net/demos/simple.html
//http://layout.jquery-dev.com/index.cfm
var myLayout;
var myLayoutInner;

$(document).ready(function () {
	myLayout = $('body').layout({
		closable:									true
	,	resizable:								true
	,	slidable:									true
	,	livePaneResizing:					true

	,	south__resizable:					false //StatusBar
	,	south__spacing_closed:		0
	,	south__spacing_open:			0
	,	south__initClosed:				true
	,	north__resizable:					false //MenuBar
	,	north__spacing_closed:		0
	,	north__spacing_open:			0
	,	north__initClosed:				true
	});

	myLayout
		.bindButton('.menubar-toggler', 'toggle', 'north')
		.bindButton('.statusbar-toggler', 'toggle', 'south')
	;

	myLayoutInner = $('#main').layout({
		closable:									true
	,	resizable:								true
	,	slidable:									true
	,	livePaneResizing:					true

	,	north__resizable:					false				//Toolbar
	,	north__closable: 					false
	,	north__spacing_open:			0
	,	north__spacing_closed:		0
	,	north__initClosed:				true
	,	south__spacing_closed:		0						//Alarms
	,	south__spacing_open:			2
	,	south__onclose:						onHideShow
	,	south__onopen:						onHideShow
	,	south__onresize_end:			resizePane
	,	south__size:							200
	,	south__initClosed:				true
	,	west__size:								300					//Tree
	,	west__spacing_open:				2
	,	west__spacing_closed:			0
	,	west__onclose:						onHideShow
	,	west__onopen:							onHideShow
	,	west__initClosed:					true
	});

	myLayoutInner
		.bindButton('.tree-toggler', 'toggle', 'west')
		.bindButton('.alarm-toggler', 'toggle', 'south')
		.bindButton('.north-toggler', 'toggle', 'north')
	;
});

var psFunctions = {
	results: {},
	run: function(name, cb) {
		if (name in this.results) {
			cb();
		} else {
			readScript(name, cb);
		}
	}
};

function readScript(file, cb) {
	var sName = file.substring(file.lastIndexOf('/') + 1, file.lastIndexOf('.'));
	if (!sName) return false;

	var rawFile = new XMLHttpRequest();
	rawFile.open("GET", file, true);
	// rawFile.onreadystatechange = function () {
	rawFile.addEventListener("load", function() {
		if(rawFile.readyState === 4) {
			if(rawFile.status === 200 || rawFile.status == 0) {
				var allText = rawFile.responseText;
				var func = new Function('obj', allText);
				psFunctions.results[file] = func;

				try {
						cb(func);
				} catch(e) {
					console.log(file);
				}
			}
		}
	});
	rawFile.send(null);
}

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

$('#scheme').on('scroll', function (e) {
	scheme.scrollTop = 0;
	scheme.scrollLeft = 0;
});

$('#divTableAlarm').height(200 - $('#toolbarDIV').height() - 6);

function resizePane(paneName, pane, state) {
	if (pane.prop('id') === 'southPane') {
		$('#divTableAlarm').height(state.size - $('#toolbarDIV').height() - 6);
	}
}

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

$('#schemeContainer').on('scroll', function (e) {
	schemeContainer.scrollTop = 0;
	schemeContainer.scrollLeft = 0;
});

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

function setObjectProperties() {
	setPopupWindow('objectProperties', 'schemeContainer');
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

function getGroupByName(name) {
	var gr = {};
	gr.element = document.getElementById(name);
	gr.script = gr.element.getAttribute('script') || '';
	gr.FunctionName = gr.script.length > 0 ?
		gr.script.substring(gr.script.lastIndexOf('/') + 1) : '';
	gr.koef = gr.element.getAttribute('koef');
	gr.precision = gr.element.getAttribute('precision');
	gr.unit = gr.element.getAttribute('unit');
	return gr;
}