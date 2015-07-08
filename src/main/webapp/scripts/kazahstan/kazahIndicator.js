return {
	onChange : function (dti) {
		var rect = obj.getElementsByTagName('rect')[0];
		var fillColor = 'gray';
		switch(parseInt(dti.value)) {
			case 0: fillColor = 'gold'; break;
			case 1: fillColor = 'red'; break;
			default: fillColor = 'gray'; break;
		}
		rect.setAttribute('style', 'fill:' + fillColor + ';');
	},

	onDoubleClick : function() {
		console.log('add content to onDoubleClick in ');
	}
}