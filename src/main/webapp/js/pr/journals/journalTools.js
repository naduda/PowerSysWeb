var model = Object.create(null);

(function(){
	//		http://localhost:8080/PowerSysWeb/dataServer/journal?id=1
	var docURL = document.URL,
			params = docURL.substring(docURL.lastIndexOf("?")),
			id = params.slice(4, params.indexOf(';')),
			docJournal = docURL.substring(docURL.indexOf('://'), 
				docURL.indexOf("?")),
			socketURL, urlRequest, webSocket;

	model.psFunctions = {
		results: Object.create(null),
		run: function(name, cb) {
			if (name in this.results){
				cb();
			} else {
				readScript(name, cb);
			}
		}
	};

	model.tools = new Tools();
	createReport();
	model.alarm = (function(){
		$.getScript("./js/pr/alarms.js", function(){
				model.alarm = new Alarms();
				webSocket = initWebSocket();
			});
		})();
	setTranslator();

//=============== Implementation ===============
	function readScript(file, cb){
		var sName = file.substring(file.lastIndexOf('/') + 1, file.lastIndexOf('.'));
		if (!sName) return false;

		var rawFile = new XMLHttpRequest();
		rawFile.open("GET", file, true);
		if(model && model.noCache)
			rawFile.setRequestHeader('Cache-Control', model.noCache);
		// rawFile.onreadystatechange = function () {
		rawFile.addEventListener("load", function() {
			if(rawFile.readyState === 4) {
				if(rawFile.status === 200 || rawFile.status == 0) {
					var allText = rawFile.responseText,
							func = new Function('obj', allText);
					model.psFunctions.results[file] = func;

					try {
							cb(func);
					} catch(e) {
						console.log(e);
						console.log(file);
					}
				}
			}
		});
		rawFile.send(null);
	}

	function setTranslator(){
		model.psFunctions.run('./js/pr/translate.js', 
				function(){
					var func = model.psFunctions.results['./js/pr/translate.js'];
					if(func){
						model.Translator = func().Translator();
					} else console.log(scriptName);
				});
	}

	function createReport(){
		docJournal = docJournal.substring(0, docJournal.lastIndexOf("/"));
		socketURL = 'ws' + docJournal + '/load';
		docJournal = 'http' + docJournal + '/dataServer/journal';
		urlRequest = docJournal + params;

		switch(id){
			case '1':
				document.title = 'Alarms';
				var north = document.getElementsByClassName('ui-layout-north')[0],
						center = document.getElementsByClassName('ui-layout-center')[0],
						header = elt('DIV', {style:'height:70px;background-color:#ddd;'}),
						dates;

				header.appendChild(elt('b', null, 
					elt('center', {style:'line-height: 70px;'},
						elt('span', {id:'${key_miJAlarms}'})
				)));
				north.appendChild(header);

				createAlarmToolbar(north);
				dates = createDateToolbar(north, function(dateText){
					urlRequest = docJournal + '?id=1;' + 
											 dates.from.value + '_' + dates.to.value;
					model.alarm.clearTable();
					$('#progressDiv').html('');
					$('#progressDiv').width('0');
					getAlarms(urlRequest);
				});
				createAlarmTable(center);
				break;
			default:
				console.log('Not implementation for id = ' + id);
				break;
		}
	}

	function initWebSocket(){
		var ws = new WebSocket(socketURL);
		ws.onmessage = function (message) {
			var jsonData = JSON.parse(message.data);
			if(jsonData.type === 'CommandMessage'){
				// switch(jsonData.command){
				// 	default: console.log(jsonData.command);break;
				// }
			} else if (jsonData.type === 'ValueMessage'){
				//onValueMessage(jsonData);
			} else if (jsonData.type === 'AlarmMessage'){
				model.alarm.onAlarmMessage(jsonData);
			} else if (jsonData.type === 'KeyValueArrayMessage'){
				//onArrayMessage(jsonData);
			}
		}
		ws.onerror = function (e) {
			console.log(e);
		}
		ws.onclose = function () {
			console.log('session close');
		}
		ws.onopen = function () {
			console.log('session open');
		}
		return ws;
	}

	function sendMessage(msg){
		waitForTrue(webSocket.readyState === 1, function(){
				webSocket.send(msg);
		});
	}

	function waitForTrue(bool, callback){
		setTimeout(function () {
				if (bool) {
						if(callback != null){
								callback();
						}
						return;
				} else {
						waitForTrue(bool, callback);
				}
		}, 5);
	}

	function getAlarms(docURL){
		if(!webSocket) return;
		$('#progressDiv').css('text-align','left');
		$.getJSON(docURL, function(data){
			var len = data.alarms.length, i = 1,
					start = new Date().getTime();

			Array.prototype.forEach.call(data.alarms, function(a){
				// setTimeout(function(){
					var w = (i++)*100/len;
					model.alarm.onAlarmMessage(a, false);
					if(w === 100){
						model.alarm.sortTable();
						$('#progressDiv').html('Complete (' +
							(new Date().getTime() - start)/1000 + ' s)');
						$('#progressDiv').css('text-align','center');
					} else
						$('#progressDiv').html('Loading - ' + Number(w.toFixed(2)) + ' %');
					$('#progressDiv').width(w + '%');
				// },10);
			});
		}).fail(function( jqxhr, textStatus, error ) {
			var err = textStatus + ', ' + error;
			console.log( "Request Failed: " + err);
			console.log(docURL);
			//modalInfo.close();
		});
	}

	function getPriorities(docURL){
		$.getJSON(docURL, function(data){
			var sel = document.getElementById('alarmFilter');
			Array.prototype.forEach.call(data, function(priority){
				var op = elt('option', {value:priority.value}, priority.name);
				switch(op.value) {
					case '1': op.style.backgroundColor = 'red'; break;
					case '2': op.style.backgroundColor = 'yellow'; break;
					case '3': op.style.backgroundColor = 'green'; break;
				default: op.style.backgroundColor = '#eee'; break;
			}
				sel.appendChild(op);
			});
		}).fail(function( jqxhr, textStatus, error ) {
			var err = textStatus + ', ' + error;
			console.log( "Request Failed: " + err);
			console.log(docURL);
			modalInfo.close();
		});
	}

	function createDateToolbar(parent, onDateChange){
		var menubar = elt('DIV', {class:'menubar',
				style:'border-top-style:solid; border-top-width:1px;'}),
				menubarId = elt('DIV', {id:'menubarId'}),
				tbDates,
				langSelector = elt('DIV', {id:'langSelector', class:'pull-right'}),
				lang = elt('select', {id:'lang', class:'btn-sm menubutton',
										onchange:'model.Translator.translateARM();'},
										elt('option',{value:'en'},'English'),
										elt('option',{value:'uk'},'Українська'),
										elt('option',{value:'ru'},'Русский'));
		langSelector.appendChild(lang);
		menubar.appendChild(menubarId);
		menubar.appendChild(langSelector);
		parent.appendChild(menubar);
		tbDates = model.tools.dateToolbar(menubarId, onDateChange);
		tbDates.div.style.lineHeight = '29px';
		return tbDates;
	}

	function createAlarmToolbar(parent){
		var toolbarDIV = elt('DIV', {id:'toolbarDIV', class:'toolbar'},
							elt('b', null, elt('ins', null, 
								elt('span',{id:'${keyAlarms}'}))),
							elt('span', {onclick:'model.alarm.confirmOne();', 
													 class:'toolbarItem fa fa-check'}),
							elt('span', {id:'confirmSS', 
													 class:'toolbarItem fa fa-check-square-o'}),
							elt('span', {onclick:'model.alarm.confirmAll();', 
													 class:'toolbarItem fa fa-check-square'}),
							elt('span', {class:'devider'}, '.'),
							elt('DIV', {class:'fa fa-filter'},
								elt('select', {id:'alarmFilter', class:'menubutton'},
									elt('option', {value:'0'}, '*'))),
							elt('button', {type:'button', class:'menubutton',
									onclick:'model.alarm.sortTable();'},
									elt('span', {id:'${keyTooltip_btnSorting}'})),
							elt('button', {type:'button', class:'menubutton',
									id:'btnAlarmColumns',
									onclick:'model.tools.setAlarmColumns();'},'Columns'),
							elt('DIV', {class:'pull-right'},
									elt('span', {id:'alarmsCount', class:'badge'}, '0'))
		);
		getPriorities(docJournal.slice(0, docJournal.lastIndexOf('/')) + 
			'/db/priority');
		parent.appendChild(toolbarDIV);
	}

	function createAlarmTable(parent){
		var divTableAlarm = elt('DIV', {id:'divTableAlarm'},
			elt('table', {id:'alarmTable', class:'tablesorter'},
				elt('thead', null,
					elt('tr', null,
						elt('th', {id:'object'}, elt('span', {id:'${key_pObject}'})),
						elt('th', {id:'location'}, elt('span', {id:'${key_pLocation}'})),
						elt('th', {id:'alarmName'}, elt('span', {id:'${key_pAlarmName}'})),
						elt('th', {id:'recordDT'}, elt('span', {id:'${key_pRecordDT}'})),
						elt('th', {id:'eventDT'}, elt('span', {id:'${key_pEventDT}'})),
						elt('th', {id:'alarmMES'}, elt('span', {id:'${key_pAlarmMes}'})),
						elt('th', {id:'logState'}, elt('span', {id:'${key_pLogState}'})),
						elt('th', {id:'logStateInt',style:'display:none'},
							elt('span', {id:'${key_pLogState}'}, 'P')),
						elt('th', {id:'confirmDT'}, elt('span', {id:'${key_pConfirmDT}'})),
						elt('th', {id:'userRef'}, elt('span', {id:'${key_pUserRef}'})),
						elt('th', {id:'logNote'}, elt('span', {id:'${key_pLogNote}'})),
						elt('th', {id:'alarmPriority'}, 
							elt('span', {id:'${key_pAlarmPriority}'})),
						elt('th', {id:'alarmPriorityInt', style:'display:none'},
								elt('span', {id:'${key_pAlarmPriority}'}, 'P')),
						elt('th', {id:'eventType'}, elt('span', {id:'${key_pEventType}'})),
						elt('th', {id:'schemeObject'}, elt('span', 
							{id:'${key_pSchemeObject}'})),
						elt('th', {id:'objectRef', style:'display:none'},
							elt('span', {id:'${key_pObject}'}, 'P')),
						elt('th', {id:'eventDTorign',style:'display:none'},
							elt('span', {id:'${key_pEventDT}'}, 'P')),
						elt('th', {id:'recordDTorign',style:'display:none'},
							elt('span', {id:'${key_pRecordDT}'}, 'P'))
					)
				),
				elt('tbody')
			)
		);
		parent.appendChild(divTableAlarm);
		divTableAlarm.style.height = '100%';
		return divTableAlarm;
	}
})();