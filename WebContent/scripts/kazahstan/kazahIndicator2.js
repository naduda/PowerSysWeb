function kazahIndicator2(obj) {
	return {
		onChange : function (dti) {
			var newX = 0;
			var rect = obj.getElementsByTagName('rect')[0];
			var text = obj.getElementsByTagName('text')[0];
			var style = obj.getAttribute('style');
			var newText = '';
			switch(parseInt(dti.value)) {
				case 0: newText = 'Автоматический'; break;
				case 1: newText = 'Ручной'; break;
				default: newText = '-=???=-'; break;
			}
			text.innerHTML = newText;
			
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
		}
	}
}