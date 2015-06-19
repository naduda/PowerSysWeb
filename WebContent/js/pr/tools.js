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

if ( !window.requestAnimationFrame ) {
	window.requestAnimationFrame = ( function() {
		return window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function(callback, element ) {
			window.setTimeout( callback, 1000 / 60 );
		};
	})();
}

function elt(name, attributes) {
	var node = document.createElement(name);
	if (attributes) {
		for (var attr in attributes)
			if (attributes.hasOwnProperty(attr))
				node.setAttribute(attr, attributes[attr]);
			}
	for (var i = 2; i < arguments.length; i++) {
		var child = arguments[i];
		if (typeof child == "string")
			child = document.createTextNode(new String(child));
		node.appendChild(child);
	}
	return node;
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
	var isExist = document.getElementById('alarmColumns') != null,
	alarmColumns = isExist ? document.getElementById('alarmColumns') :
													 createAlarmColumns(),
	elHeight = 200, btn = document.getElementById('btnAlarmColumns'),
	offsets = btn.getBoundingClientRect(),
	top = offsets.top, left = offsets.left,
	tr = isExist ? document.getElementById('alarmColumnsTriangle') :
								 createTriangle(top, (left + offsets.width + 2));

	if (isExist) {
		alarmColumns.style.display = 
			alarmColumns.style.display === 'none' ?
																		 'block' : 'none';

		tr.setAttribute('style', 'display:' + alarmColumns.style.display +
			';top:' + top + 'px;left:' + (left + offsets.width + 2) + 'px;');
	} else {
		alarmColumns.setAttribute('style', 'overflow-y:scroll;display:block;' +
			'height:' + elHeight + 'px;');
	}

	alarmColumns.style.top = (top - elHeight/2) + 'px';
	alarmColumns.style.left = (left + offsets.width + 10) + 'px';
}

function createTriangle(top, left) {
	var tr = elt('DIV', {id:'alarmColumnsTriangle',
							class:'triangleLeft',
							style:'top:' + top + 'px;left:' + left + 'px;'});
	document.body.appendChild(tr);
	return tr;
}

function createAlarmColumns() {
	var ret = document.createElement('div'),
	headerRowCols = $('#alarmTable thead tr:first').find('th'),
	context = '';

	headerRowCols.each(function(){
		var colName = headerRowCols.eq($(this).index());
		var span = $(this).find('span:first');

		if ($(this).css('display') !== 'none') {
			var input = elt('input',{name:'alarmColumns',
				value:colName.attr('id'), type:'checkbox', checked:'true'});
			ret.appendChild(input);
			ret.appendChild(span.clone()[0]);
			ret.appendChild(document.createElement('br'));
		}
	});
	ret.id = 'alarmColumns';
	ret.setAttribute('class', 'popupW');
	document.body.appendChild(ret);
	$('input[name="alarmColumns"]').change(function(e){
		var idCol = $(this)[0].value, ind;

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
	var d = new Date(ts),
	dd = d.getDate(), mm = d.getMonth() + 1, yy = d.getFullYear(),
	hh = d.getHours(), mi = d.getMinutes(), ss = d.getSeconds(),
	SSS = d.getMilliseconds();

	dd = dd < 10 ? '0' + dd : dd;
	mm = mm < 10 ? '0' + mm : mm;
	hh = hh < 10 ? '0' + hh : hh;
	mi = mi < 10 ? '0' + mi : mi;
	ss = ss < 10 ? '0' + ss : ss;
	SSS = SSS > 10 ? (SSS > 100 ? SSS : '0' + SSS) : '00' + SSS;
	return dd + '.' + mm + '.' + yy + ' ' +
				 hh + ':' + mi + ':' + ss + '.' + SSS;
}

function dateToolbar(parent, onDateChange){
	var toolbar = {
		lFrom: 	elt('span', {id:'${keyPeriodFrom}'}),
		from: 	elt('input', {class:'datePicker menubutton', style:'margin: 0 5px;'}),
		lTo: 		elt('span', {id:'${keyTo}'}),
		to: 		elt('input', {class:'datePicker menubutton', style:'margin: 0 5px;'}),
		div: 		parent
	}
	parent.appendChild(toolbar.lFrom);
	parent.appendChild(toolbar.from);
	parent.appendChild(toolbar.lTo);
	parent.appendChild(toolbar.to);
	parent.style.display = 'inline-block';

	var curDate = new Date();
	curDate.setDate(curDate.getDate() + 1);

	$(".datePicker").datepicker({
		showOn: "button",
		dateFormat: "dd.mm.yy",
		buttonText: "<i class='fa fa-calendar'></i>",
		onSelect: function(dateText) {
			$(toolbar.to).datepicker("option", "minDate", 
				$(toolbar.from).datepicker("getDate"));
			$(toolbar.from).datepicker("option", "maxDate", 
				$(toolbar.to).datepicker("getDate"));
			onDateChange(dateText);
		}
	});
	$(toolbar.from).datepicker('setDate', new Date());
	$(toolbar.to).datepicker('setDate', curDate);
	$(toolbar.from).datepicker("option", "maxDate", new Date());
	$(toolbar.to).datepicker( "option", "minDate", curDate);

	return toolbar;
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