//http://layout.jquery-dev.net/demos/simple.html
//http://layout.jquery-dev.com/index.cfm
$(document).ready(function (){
	replace4Translator();
	var myLayout = $('body').layout({
		closable:									true
	,	resizable:								true
	,	slidable:									true
	,	livePaneResizing:					true

	,	south__resizable:					false //StatusBar
	,	south__spacing_closed:		0
	,	south__spacing_open:			0
	// ,	south__initClosed:				true
	,	north__resizable:					false //MenuBar
	,	north__spacing_closed:		0
	,	north__spacing_open:			0
	// ,	north__initClosed:				true
	});

	myLayout
		.bindButton('.menubar-toggler', 'toggle', 'north')
		.bindButton('.statusbar-toggler', 'toggle', 'south')
	;

	var myLayoutInner = $('#main').layout({
		closable:									true
	,	resizable:								true
	,	slidable:									true
	,	livePaneResizing:					true

	,	north__resizable:					false				//Toolbar
	,	north__closable: 					false
	,	north__spacing_open:			0
	,	north__spacing_closed:		0
	// ,	north__initClosed:				true
	,	south__spacing_closed:		0						//Alarms
	,	south__spacing_open:			2
	,	south__onclose:						onHideShow
	,	south__onopen:						onHideShow
	,	south__onresize_end:			resizePane
	,	south__size:							200
	// ,	south__initClosed:				true
	,	west__size:								300					//Tree
	,	west__spacing_open:				2
	,	west__spacing_closed:			0
	,	west__onclose:						onHideShow
	,	west__onopen:							onHideShow
	// ,	west__initClosed:					true
	});

	myLayoutInner
		.bindButton('.tree-toggler', 'toggle', 'west')
		.bindButton('.alarm-toggler', 'toggle', 'south')
		.bindButton('.north-toggler', 'toggle', 'north')
	;

	function onHideShow(paneName, pane, state){
		var button, oldValue, newValue;

		if (pane.prop('id') === 'southPane') {
			button = document.getElementById('tAlarms');
			var bText;
			if (state.isClosed == true) {
				oldValue = /\bfa-angle-double-down\b/;
				newValue = 'fa-angle-double-up';
				try {
					bText = document.getElementById('${keyHideAlarms}');
					bText.id = '${keyShowAlarms}';
					bText.innerHTML = model.Translator.translateValueByKey('keyShowAlarms');
				} catch(e){
					console.log('load.js onHideShow...');
				}
			} else {
				oldValue = /\bfa-angle-double-up\b/;
				newValue = 'fa-angle-double-down';
				try {
					bText = document.getElementById('${keyShowAlarms}');
					bText.id = '${keyHideAlarms}';
					bText.innerHTML = model.Translator.translateValueByKey('keyHideAlarms');
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

	function resizePane(paneName, pane, state) {
		if (pane.prop('id') === 'southPane') {
			$('#divTableAlarm').height(state.size - $('#toolbarDIV').height() - 6);
		}
	}

	function replace4Translator(){
		var all = document.body.getElementsByTagName("*");

		for (var i = 0; i < all.length; i++) {
			var el = all[i], begInd = el.innerHTML.indexOf("#{");

			if (begInd > -1) {
				var key = el.innerHTML.substring(begInd + 2);
				key = key.substring(0, key.indexOf('}'));

				el.innerHTML = el.innerHTML.replace('#{' + key + '}',
					'<span id="${' + key + '}"></span>');
			}
		}
	}
});

$('#scheme').on('scroll', function (e) {
	scheme.scrollTop = 0;
	scheme.scrollLeft = 0;
});

$('#divTableAlarm').height(200 - $('#toolbarDIV').height() - 6);

$('#schemeContainer').on('scroll', function (e) {
	schemeContainer.scrollTop = 0;
	schemeContainer.scrollLeft = 0;
});