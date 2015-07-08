(function(){
	//		http://localhost:8080/PowerSysWeb/dataServer/journal?id=1
	var docURL = document.URL,
	params = docURL.substring(docURL.lastIndexOf("?")),
	id = params.slice(4, params.indexOf(';'));

	docURL = docURL.substring(docURL.indexOf('://'), docURL.lastIndexOf("/"));
	docURL = 'http' + docURL + '/dataServer/journal' + params;

	switch(id){
		case '1':
			document.title = 'Alarms';
			var north = document.getElementsByClassName('ui-layout-north')[0],
					center = document.getElementsByClassName('ui-layout-center')[0];
			createDateToolbar(north, function (dateText) {
					console.log(dateText);
			});
			createAlarmToolbar(north);
			createAlarmTable(center);

			$.getJSON(docURL, function(data){
				Array.prototype.forEach.call(data, function(alarm){
					onAlarmMessage(alarm);
				});
			}).fail(function( jqxhr, textStatus, error ) {
				var err = textStatus + ', ' + error;
				console.log( "Request Failed: " + err);
				modalInfo.close();
			});
			break;
		default:
			console.log('Not implementation for id = ' + id);
			break;
	}

	function createDateToolbar(parent, onDateChange){
		var menubar = elt('DIV', {class:'menubar'}),
				menubarId = elt('DIV', {id:'menubarId'}),
				tbDates,
				langSelector = elt('DIV', {id:'langSelector', class:'pull-right'}),
				lang = elt('select', {id:'lang', class:'btn-sm menubutton',
										onchange:'translateARM();'},
										elt('option',{value:'en'},'English'),
										elt('option',{value:'uk'},'Українська'),
										elt('option',{value:'ru'},'Русский'));
		langSelector.appendChild(lang);
		menubar.appendChild(menubarId);
		menubar.appendChild(langSelector);
		parent.appendChild(menubar);
		tbDates = dateToolbar(menubarId, onDateChange);
		tbDates.div.style.lineHeight = '29px';
	}
// ======================== ALARM ============================
	function createAlarmToolbar(parent){
		var toolbarDIV = elt('DIV', {id:'toolbarDIV', class:'toolbar'},
							elt('b', null, elt('ins', null, 
								elt('span',{id:'${keyAlarms}'},
									translateValueByKey('keyAlarms')))),
							elt('span', {onclick:'confirmOne();', 
													 class:'toolbarItem fa fa-check'}),
							elt('span', {id:'confirmSS', 
													 class:'toolbarItem fa fa-check-square-o'}),
							elt('span', {onclick:'confirmAll();', 
													 class:'toolbarItem fa fa-check-square'}),
							elt('span', {class:'devider'}, '.'),
							elt('DIV', {class:'fa fa-filter'},
								elt('select', {id:'alarmFilter', class:'menubutton'},
									elt('option', {value:'0'}, '*'))),
							elt('button', {type:'button', class:'menubutton',
									onclick:'$("#alarmTable tbody").trigger("sorton", [[[7,0],[12,0],[4,1]]]);'},
									elt('span', {id:'${keyTooltip_btnSorting}'},
										translateValueByKey('keyTooltip_btnSorting'))),
							elt('button', {type:'button', class:'menubutton',
									id:'btnAlarmColumns',
									onclick:'setAlarmColumns();'},'Columns'),
							elt('DIV', {class:'pull-right'},
									elt('span', {id:'alarmsCount', class:'badge'}, '0'))
		);
		parent.appendChild(toolbarDIV);
	}

	function createAlarmTable(parent){
		var divTableAlarm = elt('DIV', {id:'divTableAlarm'},
			elt('table', {id:'alarmTable', class:'tablesorter'},
				elt('thead', null,
					elt('tr', null,
						elt('th', {id:'object'}, elt('span', {id:'${key_pObject}'}, 
							translateValueByKey('key_pObject'))),
						elt('th', {id:'location'}, elt('span', {id:'${key_pLocation}'}, 
							translateValueByKey('key_pLocation'))),
						elt('th', {id:'alarmName'}, elt('span', {id:'${key_pAlarmName}'}, 
							translateValueByKey('key_pAlarmName'))),
						elt('th', {id:'recordDT'}, elt('span', {id:'${key_pRecordDT}'}, 
							translateValueByKey('key_pRecordDT'))),
						elt('th', {id:'eventDT'}, elt('span', {id:'${key_pEventDT}'}, 
							translateValueByKey('key_pEventDT'))),
						elt('th', {id:'alarmMES'}, elt('span', {id:'${key_pAlarmMes}'}, 
							translateValueByKey('key_pAlarmMes'))),
						elt('th', {id:'logState'}, elt('span', {id:'${key_pLogState}'}, 
							translateValueByKey('key_pLogState'))),
						elt('th', {id:'logStateInt',style:'display:none'},
							elt('span', {id:'${key_pLogState}'},
								translateValueByKey('key_pLogState'), 'P')),
						elt('th', {id:'confirmDT'}, elt('span', {id:'${key_pConfirmDT}'}, 
							translateValueByKey('key_pConfirmDT'))),
						elt('th', {id:'userRef'}, elt('span', {id:'${key_pUserRef}'}, 
							translateValueByKey('key_pUserRef'))),
						elt('th', {id:'logNote'}, elt('span', {id:'${key_pLogNote}'}, 
							translateValueByKey('key_pLogNote'))),
						elt('th', {id:'alarmPriority'}, elt('span', {id:'${key_pAlarmPriority}'}, 
							translateValueByKey('key_pAlarmPriority'))),
						elt('th', {id:'alarmPriorityInt', style:'display:none'},
								elt('span', {id:'${key_pAlarmPriority}'},
									translateValueByKey('key_pAlarmPriority'), 'P')),
						elt('th', {id:'eventType'}, elt('span', {id:'${key_pEventType}'}, 
							translateValueByKey('key_pEventType'))),
						elt('th', {id:'schemeObject'}, elt('span', {id:'${key_pSchemeObject}'}, 
							translateValueByKey('key_pSchemeObject'))),
						elt('th', {id:'objectRef', style:'display:none'},
							elt('span', {id:'${key_pObject}'},
								translateValueByKey('key_pObject'), 'P')),
						elt('th', {id:'eventDTorign',style:'display:none'},
							elt('span', {id:'${key_pEventDT}'},
								translateValueByKey('key_pEventDT'), 'P')),
						elt('th', {id:'recordDTorign',style:'display:none'},
							elt('span', {id:'${key_pRecordDT}'},
								translateValueByKey('key_pRecordDT'), 'P'))
					)
				),
				elt('tbody')
			)
		);
	parent.appendChild(divTableAlarm);
	}
})();