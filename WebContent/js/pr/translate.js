var all = document.body.getElementsByTagName("*");
var filesLocale = '';

for (var i = 0; i < all.length; i++) {
	var el = all[i];
	var begInd = el.innerHTML.indexOf("#{");

	if (begInd > -1) {
		var key = el.innerHTML.substring(begInd + 2);
		key = key.substring(0, key.indexOf('}'));

		el.innerHTML = el.innerHTML.replace('#{' + key + '}',
			'<span id="${' + key + '}"></span>');
	}
}

messageResource.init({filePath : 'lang/'});

function translateARMByLocale(locale) {
	var translateAll = function() {
		var all = document.body.getElementsByTagName("span");
		for (var i = 0; i < all.length; i++) {
			var el = all[i];
			var begInd = el.id.indexOf("${");
			if (begInd > -1) {
				var key = el.id.substring(begInd + 2);
				key = key.substring(0, key.indexOf('}'));
				if (el.hasAttribute("title")) {
					el.title = messageResource.get(key, locale);
				} else {
					el.innerHTML = messageResource.get(key, locale);
				}
				if (key === 'keyChart') {
					var chart = $('#tabChart').highcharts();
					var selRect = $('#selectableRectangle')[0];
					if(selRect != undefined) {
						var curItem = $('#' + selRect.getAttribute('selectedId'))[0];
						chart.yAxis[0].setTitle({
							text: messageResource.get('key_pValue', locale) + ', ' +
										curItem.getAttribute('unit')
						});
					}
				}
			}
		}
	}

	if (filesLocale.indexOf(locale) < 0) {
		messageResource.load(locale, function(){
			translateAll();
		});
		filesLocale += locale + ';';
	} else {
		translateAll();
	}
}

function translateValueByKey(key) {
	var locale = 'Language_' + document.getElementById('lang').value;
	return messageResource.get(key, locale);
}

function translateARM() {
	var locale = 'Language_' + document.getElementById('lang').value;
	translateARMByLocale(locale);
}

translateARM();