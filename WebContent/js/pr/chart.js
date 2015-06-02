$('#chartsPowerSys').resizable({
	stop: function(e, ui) {
			var toolbar = $('#chartsPowerSys .popupToolbar');
			var newHeight = ui.size.height - (56 + toolbar.height() + 4);
			var newWidth = ui.size.width - 6;

			chart.chart.setSize(newWidth, newHeight);
			$('#dataWrapper').css({
					'height' : newHeight + 'px',
					'max-height' : newHeight + 'px',
					'max-width'  : newWidth + 'px'
			});
	}
});
$("#sInstantaneous").change(function() {
	chart.setDataTable();
});

$('#sInstantaneous option').each(function(){
	if(this.value == 0) {
		$(this).html("<span id='${keyInstantaneous}'/>");
	} else {
		$(this).html(this.value + " <span id='${keyMinute}'/>");
	}
});

$("#dataTable").tablesorter({
	headers: {0: { sorter:'customDate' }}
});

var chart = {};
chart.isReset = false;
chart.dates = dateToolbar(document.getElementById('chartDates'), 
	function (dateText) {
		chart.setDataTable();
	});

function showChartPowerSys() {
	var md = document.getElementById('chartsPowerSys'),
	sp = $('#sInstantaneous option:first span:first');

	if(!sp.html()) sp.html(translateValueByKey('keyInstantaneous'));
	if (!(md.style.display === 'block')) {
		chart.setDataTable();
	}

	setPopupWindow('chartsPowerSys', 'main');
	chart.chart = $('#tabChart').highcharts();
}

chart.setDataTable = function setDataTable() {
	var closeId,
			modalInfo = new BootstrapDialog({
				size: BootstrapDialog.SIZE_SMALL,
				type: BootstrapDialog.TYPE_SUCCESS,
				title: 'Information: ',
				message: '<i class="fa fa-spinner fa-spin"></i> Creating chart ...',
				closable: false
			});
	modalInfo.open();

	setTimeout(function() {
		chart.chart = $('#tabChart').highcharts();
		while(chart.chart.series.length > 0) {
			chart.chart.series[0].remove(true);
		}
		$.tablesorter.clearTableBody($('#dataTable')[0]);
		var items = document.querySelectorAll('#dataTable thead tr th');
		if (items.length > 1) {
			for (var i = items.length - 1; i > 0; i--) {
				items[i].remove();
			}
		}

		var paras = document.querySelectorAll(".selectableRectangle, #selectableRectangle");
		Array.prototype.forEach.call(paras, function(selRect) {
			var curItem = document.getElementById(selRect.getAttribute('selectedId'));
			closeId = curItem.getAttribute('idSignal');

			chart.chart.yAxis[0].setTitle({
				text: translateValueByKey('key_pValue') + ', ' + curItem.getAttribute('unit')
			});
			addDataById(curItem.getAttribute('idSignal'), 
					chart.dates.from.value, chart.dates.to.value);
		});
	}, 250);

	function addDataById(id, dtBeg, dtEnd) {
		var integr = $("#sInstantaneous")[0].value,
		url = 'http:' + docURL + '/dataServer/db/getDataById?params=' + id + '_' + 
							dtBeg +'_' + dtEnd + '_' + integr;

		$.getJSON(url, function(data){
			var dataTable = document.getElementById('dataTable'),
			htr = document.querySelector('#dataTable thead tr'),
			seriesCount = chart.chart.series.length;

			if(seriesCount > htr.getElementsByTagName('th').length - 2) {
				var nth = document.createElement('th');
				nth.innerHTML = data.signalName;
				nth.style.width = '200px';
				htr.appendChild(nth);
			}

			var charDada = '[';
			$.each(data.data, function(key, val) {
				var dt = timestamp2date(val.timestamp);
				if(seriesCount == 0) {
					var newColumn = '<td style="text-align: left;">' + dt + '</td>';

					newColumn += '<td style="text-align: center;">' + val.value + '</td>';
					$('#dataTable tbody').append('<tr>' + newColumn + '</tr>')
						.trigger("updateAll").trigger("sorton", [[[0,1]]]);
				} else {
					var btr = $('#dataTable tbody')
						.find('tr td:contains("' + dt + '")')[0];
					if ((integr != 0) && (btr !== undefined)) {
						var ntd = document.createElement('td');
						btr = btr.parentNode;
						ntd.setAttribute('style', 'text-align: center;');
						ntd.innerHTML = val.value;
						btr.appendChild(ntd);
						$('#dataTable tbody').trigger("updateAll").trigger("sorton", [[[0,1]]]);
					}
				}
				charDada += '[' + val.timestamp + ',' + val.value + '],';
			});
			if (charDada.length > 1) charDada = charDada.substring(0, charDada.length - 1);
			charDada += ']';

			chart.chart.addSeries({
				id: id,
				name: data.signalName, 
				data: JSON.parse(charDada),
				step: 'right'
			});
			if (id === closeId) {
				modalInfo.close();
			}
		}).fail(function( jqxhr, textStatus, error ) {
			var err = textStatus + ', ' + error;
			console.log( "Request Failed: " + err);
			modalInfo.close();
		});
	}
}

chart.afterSetExtremes = function afterSetExtremes(e) {
	var dtBeg = chart.isReset ? chart.dates.from.value:Math.round(e.min),
			dtEnd = chart.isReset ? chart.dates.to.value:Math.round(e.max),
			integr = $("#sInstantaneous")[0].value, url,
			paras = document
				.querySelectorAll(".selectableRectangle, #selectableRectangle");

	Array.prototype.forEach.call(paras, function(selRect) {
		var curItem = document.getElementById(selRect.getAttribute('selectedId'));
		closeId = curItem.getAttribute('idSignal');

		url = 'http:' + docURL + '/dataServer/db/getDataById?params=' + 
					closeId + '_' + dtBeg +'_' + dtEnd + '_' + integr;
		$.getJSON(url, function (data) {
			var charDada = '[';

			$.each(data.data, function(key, val) {
				charDada += '[' + val.timestamp + ',' + val.value + '],';
			});
			if (charDada.length > 1) 
				charDada = charDada.substring(0, charDada.length - 1);
			charDada += ']';

			chart.chart.get(closeId).setData(JSON.parse(charDada));
		});
	});
	if (chart.isReset) chart.isReset = false;
}

Highcharts.setOptions({global: {useUTC: false}});
$('#tabChart').highcharts({
	tooltip: {
		xDateFormat: '%d.%m.%Y %H:%M:%S',
		shared: true
	},
	credits: {
		enabled: false
	},
	chart: {
		zoomType: 'xy'
	},
	xAxis: {
		events : {
			setExtremes: function (e) {
				if(typeof e.min == 'undefined' && typeof e.max == 'undefined'){
						chart.isReset = true;
				}
			},
			afterSetExtremes : chart.afterSetExtremes
		},
		type: 'datetime'
	},
	yAxis: {
		title: {
			text: "Share prices"
		}
	},
	plotOptions: {
		series: {
			marker: {
				enabled: false
			}
		}
	},
	title: {
		text: '',
		style: {
			display: 'none'
		}
	},
	subtitle: {
		text: '',
		style: {
			display: 'none'
		}
	}
});