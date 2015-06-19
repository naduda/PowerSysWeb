return {
	ObjectProperties: function(){
		var headerText = elt('span', {id:'${keyTooltip_info}'}, 
											translateValueByKey('keyTooltip_info')),
				closeButton = elt('i', {class:'fa fa-times closeButton'}),
				header = elt('DIV', {class:'popupHeader'},
										headerText,
										closeButton),
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
						translateValueByKey(key));

			cell1.appendChild(label);
			cell1.appendChild(document.createTextNode(':'));
			cell2.id = arguments[3];
		}
	},
	EditObjectProperties: function(){
		var headerText = elt('span', {id:'${keyTooltip_info}'}, 
											translateValueByKey('keyTooltip_info')),
				closeButton = elt('i', {class:'fa fa-times closeButton'}),
				header = elt('DIV', {class:'popupHeader'},
										headerText,
										closeButton),
				table = elt('table'),
				content = elt('DIV', {class:'popupContent'}, table),
				main = elt('DIV', {id:'editObjectProperties', class:'popupW'}, 
										header, content),
				values = [0,0,0];

			table.style.width = '100%';
			if (model.currentItem) {
				values[0] = model.currentItem.getAttribute('idSignal');
				values[1] = model.currentItem.getAttribute('idTS');
				values[2] = model.currentItem.getAttribute('idTU');
				values[3] = model.currentItem.getAttribute('script');
			}
			tableAddRow(table, 0, 'id', 'elementId', values[0]);
			tableAddRow(table, 1, 'idTS', 'elementIdTS', values[1]);
			tableAddRow(table, 2, 'idTU', 'elementIdTU', values[2]);
			tableAddRow(table, 3, 'script', 'elementScript', values[3]);

			closeButton.addEventListener('click', function() {
				model.EditObjectProperties.hide();
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
					button = elt('input', {type:'button', 
										id:'btn_' + key, value:'Edit'});

			cell1.appendChild(document.createTextNode(key + ' :'));
			cell2.id = arguments[3];
			cell2.innerHTML = arguments[4];
			cell3.appendChild(button);
			cell3.style.textAlign = 'right';

			button.addEventListener('click', function() {
				console.log(this.id);
			});
		}
	}
}