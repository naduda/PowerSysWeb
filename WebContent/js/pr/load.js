//http://layout.jquery-dev.net/demos/simple.html
//http://layout.jquery-dev.com/index.cfm
var myLayout;
var myLayoutInner;

$(document).ready(function () {
	myLayout = $('body').layout({
		closable:					true	// pane can open & close
	,	resizable:					true	// when open, pane can be resized 
	,	slidable:					true	// when closed, pane can 'slide' open over other panes - closes on mouse-out
	,	livePaneResizing:			true

	,	south__resizable:			false	// OVERRIDE the pane-default of 'resizable=true'
	,	south__spacing_closed:		0		// big resizer-bar when open (zero height)
	,	south__spacing_open:		0
	,	north__resizable:			false
	,	north__spacing_closed:		0
	,	north__spacing_open:		0
	});

	myLayout
		.bindButton('.menubar-toggler', 'toggle', 'north')
		.bindButton('.statusbar-toggler', 'toggle', 'south')
	;

	myLayoutInner = $('#main').layout({
		closable:					true	// pane can open & close
	,	resizable:					true	// when open, pane can be resized 
	,	slidable:					true	// when closed, pane can 'slide' open over other panes - closes on mouse-out
	,	livePaneResizing:			true

	,	north__resizable:			false
	,	north__closable: 			false
	,	north__spacing_open:		0
	,	north__spacing_closed:		0
	,	south__spacing_closed:		0
	,	south__spacing_open:		2
	,	south__onclose:				onHideShow
	,	south__onopen:				onHideShow
	,	south__onresize_end:		resizePane
	,	south__size:				200
	,	west__size:					300
	,	west__spacing_open:			2
	,	west__spacing_closed:		0
	,	west__onclose:				onHideShow
	,	west__onopen:				onHideShow
	});

	myLayoutInner
		.bindButton('.tree-toggler', 'toggle', 'west')
		.bindButton('.alarm-toggler', 'toggle', 'south')
		.bindButton('.north-toggler', 'toggle', 'north')
	;
});

function loadFunction(scriptName, callback) {
	var isThere = false;
	$("script").each(function() {
		if ($(this).attr("src") === scriptName) {
			isThere = true;
			callback();
		}
	});
	if (isThere === false) {
		// $('head').append('<script src="' + sn +'"></script>');
		// callback();
		var fileref = document.createElement('script');
		fileref.onload = callback;
		fileref.src = scriptName;
		$('head')[0].appendChild(fileref);
	}
}

$('#scheme').on('scroll', function (e) {
	scheme.scrollTop = 0;
	scheme.scrollLeft = 0;
});

(function() {
	$('#divTableAlarm').height(200 - $('#toolbarDIV').height() - 6);
})();

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
		if (state.isClosed == true) {
			oldValue = /\bfa-angle-double-down\b/;
			newValue = 'fa-angle-double-up';
		} else {
			oldValue = /\bfa-angle-double-up\b/;
			newValue = 'fa-angle-double-down';
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

function setObjectPuoperties() {
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