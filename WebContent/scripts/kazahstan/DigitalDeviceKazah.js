function DigitalDeviceKazah(obj) {
	return {
		onChange : function (dti) {
			var newX = 0;
			var rect = obj.getElementsByTagName('rect')[0];
			var text = obj.getElementsByTagName('text')[0];
			var style = obj.getAttribute('style');
			text.innerHTML = parseFloat(dti.value).toFixed(dti.precision);
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