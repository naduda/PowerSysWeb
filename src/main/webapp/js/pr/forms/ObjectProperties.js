return {
	ObjectProperties: function(){
		var headerText = elt('span', {id:'${keyTooltip_info}'}, 
											model.Translator.translateValueByKey('keyTooltip_info')),
				closeButton = elt('i', {class:'fa fa-times closeButton'}),
				header = elt('DIV', {class:'popupHeader'},
										headerText, closeButton),
				table = elt('table'),
				content = elt('DIV', {class:'popupContent'}, table),
				main = elt('DIV', {id:'objectProperties', class:'popupW'}, 
										header, content);

			tableAddRow(table, 0, 'keyName', 'infoName');
			tableAddRow(table, 1, 'keyCode', 'infoCode');
			tableAddRow(table, 2, 'keyType', 'infoType');
			tableAddRow(table, 3, 'keyMode', 'infoMode');
			tableAddRow(table, 4, 'keyValue', 'infoValue');
			tableAddRow(table, 5, 'keyUnit', 'infoUnit');
			tableAddRow(table, 6, 'keyQuality', 'infoQuality');
			tableAddRow(table, 7, 'keyDate', 'infoDate');

			closeButton.addEventListener('click', function() {
				model.ObjectProperties.hide();
			});

			main.style.left = model.ObjectProperties.left;
			main.style.top = model.ObjectProperties.top;
		return main;

		function tableAddRow(table, id){
			var row = table.insertRow(id),
					cell1 = row.insertCell(0),
					cell2 = row.insertCell(1),
					key = arguments[2],
					label = elt('span', {id:'${' + key + '}'}, 
						model.Translator.translateValueByKey(key));

			cell1.appendChild(label);
			cell1.appendChild(document.createTextNode(':'));
			cell2.id = arguments[3];
		}
	},
	EditObjectProperties: function(){
		var headerText = elt('span', {id:'${keyTooltip_info}'}, 
											model.Translator.translateValueByKey('keyTooltip_info')),
				closeButton = elt('i', {class:'fa fa-times closeButton'}),
				header = elt('DIV', {class:'popupHeader'},
										headerText,
										closeButton),
				table = elt('table'),
				iName = elt('input', {id:'propKey', type:'text', size:'10'}),
				iValue = elt('input', {id:'propValue',type:'text', size:'10'}),
				spanOK = elt('span', {id:'${keyApply}'}, 
											model.Translator.translateValueByKey('keyApply')),
				btnApply = elt('button', {type:'button'}, spanOK),
				top = elt('DIV', null, 
								'Name: ', iName, ' value: ', iValue, btnApply),
				content = elt('DIV', {class:'popupContent'}, 
										top, elt('hr',{style:'margin:5px;'}), table),
				main = elt('DIV', {id:'editObjectProperties', class:'popupW'}, 
										header, content);

			table.style.maxHeight = '250px';
			table.style.maxWidth = '500px';
			table.style.overflowY = 'scroll';
			table.style.display = 'block';

			if (model.currentItem) {
				var rowCount = 0;
				for(var i = 0; i < model.currentItem.attributes.length; i++){
					var attr = model.currentItem.attributes[i];
					if(attr.name.slice(0,3) === 'cp_'){
						tableAddRow(table, rowCount++, attr.name, attr.value);
					}
				}
			}

			closeButton.addEventListener('click', function() {
				model.EditObjectProperties.hide();
			});

			btnApply.addEventListener('click', function() {
				var key = document.getElementById('propKey').value,
						value = document.getElementById('propValue').value,
						elem = document.getElementById('elem_cp_' + key);

				if(elem){
					elem.innerHTML = value;
				} else {
					tableAddRow(table, table.rows.length, 'cp_' + key, value);
				}
				model.currentItem.setAttribute('cp_' + key, value);
			});

			main.style.left = model.EditObjectProperties.left;
			main.style.top = model.EditObjectProperties.top;
		return main;

		function tableAddRow(table, id){
			var row = table.insertRow(id),
					cell1 = row.insertCell(0),
					cell2 = row.insertCell(1),
					cell3 = row.insertCell(2),
					key = arguments[2],
					value = arguments[3],
					spanEdit = elt('span', {id:'${keyEdit}'}, 
											model.Translator.translateValueByKey('keyEdit')),
					button = elt('button', {type:'button', 
										id:'btn_' + key}, spanEdit),
					spanDelete = elt('span', {id:'${keyDelete}'}, 
											model.Translator.translateValueByKey('keyDelete')),
					buttonDel = elt('button', {type:'button', 
										id:'btn_del_' + key}, spanDelete);

			cell1.appendChild(document.createTextNode(
							key.slice(key.indexOf('_') + 1) + ' :'));
			cell1.style.fontWeight = 'bold';
			cell2.id = 'elem_' + key;
			cell2.innerHTML = value;
			cell3.appendChild(button);
			cell3.appendChild(buttonDel);
			cell2.style.maxWidth = '100px';

			button.addEventListener('click', function() {
				var idElement = this.id.slice(this.id.indexOf('_') + 1),
						elem = document.getElementById('elem_' + idElement),
						idSignal = elem.innerHTML;
				if(idElement === 'cp_id' ||
						idElement === 'cp_idTS' ||
						idElement === 'cp_idTU' ||
						idElement.indexOf('cp_signal_') > -1){
					model.SignalsForm.show(idSignal, elem);
				} else {
					var key = document.getElementById('propKey'),
							value = document.getElementById('propValue'),
							rowId = this.parentNode.parentNode.rowIndex,
							row = table.rows.item(rowId), text;

					text = row.cells.item(0).innerHTML;
					key.value = text.slice(0, text.indexOf(' '));
					text = row.cells.item(1).innerHTML;
					value.value = text;
				}
			});

			buttonDel.addEventListener('click', function() {
				var pName = this.id.slice(this.id.lastIndexOf('_') + 1),
						row = this.parentNode.parentNode;

				model.currentItem.removeAttribute('cp_' + pName);
				table.deleteRow(row.rowIndex);
			});
		}
	}
}