return {
	onChange : function (dti) {
		var newX = 0,
			rect = obj.getElementsByTagName('rect')[0],
			text = obj.getElementsByTagName('text')[0],
			style = obj.getAttribute('style');

		text.innerHTML = parseFloat(dti.value * dti.koef).toFixed(dti.precision)
		 							 + ' ' + dti.unit;
		var width = parseFloat(rect.getAttribute('width'));
		var textWidth = parseFloat(text.getBBox().width);

		style = style.substring(style.indexOf('text-align:') + 11, 
								style.length - 1).trim().toLowerCase();

		switch(style) {
			case 'center' : newX = (width - textWidth)/2; break;
			case 'left' : newX = 5; break;
			case 'right' : newX = width - textWidth - 5; break;
		}
		text.setAttribute('x', newX);
	},

	onDoubleClick : function() {
		var mess = translateValueByKey('keyNewValue');
		var value = obj.getAttribute('value');

		BootstrapDialog.show({
			size: BootstrapDialog.SIZE_SMALL,
			title: obj.getElementsByTagName('title')[0].innerHTML,
			message: mess + '<input type="text" value="' + value +
											'" size="5" class="canSelect">',
			onshown: function(dialog) {
				dialog.getModalBody().find('input').focus();
				dialog.getModalBody().find('input').select();
			},
			buttons: [{
				icon: 'glyphicon glyphicon-send',
				label: '  Send (Enter)',
				cssClass: 'menubutton',
				hotkey: 13, // Enter.
				autospin: true,
				action: function(dialog){
					var newValue = dialog.getModalBody().find('input').val();
					dialog.enableButtons(false);
					dialog.setClosable(false);
					webSocket.send(JSON.stringify({
						'type' : 'CommandMessage', 
						'command' : 'setTU',
						'parameters' : [{
							'id': obj.getAttribute('idSignal'),
							'value': newValue
						}]
					}));
				}
			}],
			draggable: true
		});
	}
}