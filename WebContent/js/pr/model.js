var model = new Model();

function Model(){
	var model = {};

	model.noCache = 'no-cache';
	model.svg = {};
	model.svg.namespace = 'http://www.w3.org/2000/svg';
	model.transparants = [];

	model.removeElement = function(e){
		e.parentNode.removeChild(e);
	}
	model.autoClose = function(){
		var cls = document.querySelectorAll('.autoClose');
		if(cls.length > 0)
			Array.prototype.forEach.call(cls, function(e){
				model.removeElement(e);
			});
	}

	model.insertTransparant = function(id, titleText, x, y, idTr){
		var desc = model.transparants[id].desc,
				svg = desc.slice(desc.indexOf(';') + 1),
				g = svg.slice(svg.indexOf('<g'), svg.indexOf('</svg')),
				t = document.createElementNS(model.svg.namespace,"g"),
				title = document.createElementNS(model.svg.namespace,'title');

		t.innerHTML = g;
		console.log(idTr)
		console.log(idTr === undefined)
		t.setAttribute('id', 'transparant_' + (idTr === undefined ? id : idTr));
		title.textContent = titleText;
		t.appendChild(title);
		t.setAttribute('transform', 'translate(' + x + ',' + y + ')');

		t.addEventListener('mousedown',function(evt){
			onMoveListener = function(evt){
				var	p = cursorPoint(evt), bounds = t.getBBox();

				t.setAttribute('transform', 
					'translate(' + (p.x - 0.5*bounds.width) + ',' + 
												 (p.y - 0.5*bounds.height) + ')');
			}
			document.body.addEventListener('mousemove', onMoveListener,false);
		},false);
		t.addEventListener('mouseup',function(evt){
			document.body.removeEventListener('mousemove',onMoveListener,false);
		},false);
		function cursorPoint(evt){
			model.svg.point.x = evt.clientX;
			model.svg.point.y = evt.clientY;
			return model.svg.point.matrixTransform(
							model.svg.content.getScreenCTM().inverse());
		}

		t.oncontextmenu = function(e){
			psFunctions.run('./js/pr/forms/ContextG.js', 
				function(){
					var func = psFunctions.results['./js/pr/forms/ContextG.js'];
					if (func){
						var f = func(), menu = f.ContextTransp(t);

						document.body.appendChild(menu);
						setPopupWindow('contextT', 'main');
						menu.style.top = 
							t.getBoundingClientRect().top + 'px';
						menu.style.left = 
							t.getBoundingClientRect().left + 'px';
						f.setWidth(menu);
					} else console.log(scriptName);
				});
			e.preventDefault();
		}

		model.svg.content.appendChild(t);
	}

	model.setSVG = function(content){
		model.svg.content = content;
		model.svg.point = content.createSVGPoint();
		content.addEventListener('click', function(){
			model.autoClose();
		});
	}
	model.alarm = modelAlarms();
	model.setCurrentItem = function(item) {
		model.currentItem = item;
		model.updateObjectProperties();
		model.currentItem.position = getCurrentItemPosition();
	}
	model.updateObjectProperties = function(){
		if (model.currentItem) setObjectProperties(model.currentItem);
	}
	model.ObjectProperties = {left: '5px', top: '250px'};
	model.ObjectProperties.show = function(){
		psFunctions.run('./js/pr/forms/ObjectProperties.js', 
			function(){
				var func = psFunctions.results['./js/pr/forms/ObjectProperties.js'];
				if (func){
					if (document.getElementById('objectProperties')) {
						model.ObjectProperties.hide();
					} else {
						document.body.appendChild(func().ObjectProperties());
						setPopupWindow('objectProperties', 'main');
						model.updateObjectProperties();
					}
				} else console.log(scriptName);
			});
	}
	model.ObjectProperties.hide = function(){
		var elem = document.getElementById("objectProperties");
		model.ObjectProperties.left = elem.style.left;
		model.ObjectProperties.top = elem.style.top;
		return elem.parentNode.removeChild(elem);
	}
	model.EditObjectProperties = {left: '5px', top: '250px'};
	model.EditObjectProperties.show = function(){
		psFunctions.run('./js/pr/forms/ObjectProperties.js', 
			function(){
				var func = psFunctions.results['./js/pr/forms/ObjectProperties.js'];
				if (func){
					if (document.getElementById('editObjectProperties')) {
						model.EditObjectProperties.hide();
					} else {
						document.body.appendChild(func().EditObjectProperties());
						setPopupWindow('editObjectProperties', 'main');
					}
				} else console.log(scriptName);
			});
	}
	model.EditObjectProperties.hide = function(){
		var elem = document.getElementById("editObjectProperties");
		model.EditObjectProperties.left = elem.style.left;
		model.EditObjectProperties.top = elem.style.top;
		return elem.parentNode.removeChild(elem);
	}
	model.EditObjectProperties.update = function(){
		var elem = document.getElementById("editObjectProperties");
		if(elem && elem.style.display === 'block'){
			model.EditObjectProperties.hide();
			model.EditObjectProperties.show();
		}
	}
	model.SignalsForm = {left: '400px', top: '100px'};
	model.SignalsForm.show = function(id, editElem) {
		if(document.getElementById('signalsForm')){
			model.SignalsForm.hide();
		}
		psFunctions.run('./js/pr/forms/Signals.js', 
			function(){
				var func = psFunctions.results['./js/pr/forms/Signals.js'];
				if (func){
					var fObj = func();
					document.body.appendChild(fObj.SignalsForm(editElem));
					setPopupWindow('signalsForm', 'main');
					fObj.initSignalsTree(id);
				} else console.log(scriptName);
			});
	}
	model.SignalsForm.hide = function() {
		var elem = document.getElementById("signalsForm");
		model.SignalsForm.left = elem.style.left;
		model.SignalsForm.top = elem.style.top;
		return elem.parentNode.removeChild(elem);
	}
	return model;

	function modelAlarms() {
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
		if(document.getElementById('objectProperties')) {
			if (obj.getElementsByTagName('title')[0] !== undefined) {
				document.getElementById('infoName').innerHTML = 
					obj.getElementsByTagName('title')[0].innerHTML;
				var code = obj.getAttribute('cp_id');
				if(code === '0') code = obj.getAttribute('cp_idTS');
				document.getElementById('infoCode').innerHTML = code;
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

	function getCurrentItemPosition(){
		var bbox = model.currentItem.getBBox(),
				x = bbox.x, y = bbox.y,
				transform = model.currentItem.getAttribute('transform'),
				matrix = transform.slice(transform.indexOf('(') + 1, 
																 transform.length - 1).split(','),
				a = Number(matrix[0]), b = Number(matrix[1]),
				c = Number(matrix[2]), d = Number(matrix[3]),
				e = Number(matrix[4]), f = Number(matrix[5]);

		function convert(x1, y1, x2, y2){
			return{
				left: 	(x1*a) + (y1*c) + e,
				top: 		(x1*b) + (y1*d) + f,
				right: 	(x2*a) + (y2*c) + e,
				bottom: (x2*b) + (y2*d) + f
			}
		}
		return convert(x, y, x + bbox.width, y + bbox.height);
	}
}