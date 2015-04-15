$('#chartsPowerSys').resizable({
	stop: function(e, ui) {
			var chart = $('#tabChart').highcharts();
			var toolbar = $('#chartsPowerSys .popupToolbar');
			var newHeight = ui.size.height - (56 + toolbar.height() + 4);
			var newWidth = ui.size.width - 6;

			chart.setSize(newWidth, newHeight);
			$('#dataWrapper').css({
					'max-height' : newHeight + 'px',
					'max-width'  : newWidth + 'px'
			});
	}
});
$("#sInstantaneous").change(function() {
	var selRect = $('#selectableRectangle')[0];
	var curItem = $('#' + selRect.getAttribute('selectedId'))[0];
	var urlData = 'http:' + docURL + '/dataServer/db/getDataById?params=' + 
							curItem.getAttribute('idSignal') + '_' + 
							$("#dpBeg")[0].value +'_' + $("#dpEnd")[0].value + '_' + 
							this.value;

	setDataTable(urlData, curItem);
});
$(".datePicker").datepicker({
	showOn: "button",
	dateFormat: "dd.mm.yy",
	buttonText: "<i class='fa fa-calendar'></i>",
	onSelect: onDateChange
});
var curDate1 = new Date();
curDate1.setDate(curDate1.getDate() + 1);
$("#dpBeg").datepicker('setDate', new Date());
$("#dpEnd").datepicker('setDate', curDate1);
$("#dpBeg").datepicker( "option", "maxDate", new Date());
$("#dpEnd").datepicker( "option", "minDate", curDate1);

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

function onDateChange(dateText) {
	var arr = dateText.split('.');
	var dd = parseInt(arr[0]);
	var mm = parseInt(arr[1]) - 1;
	var yy = parseInt(arr[2]);
	var selRect = $('#selectableRectangle')[0];
	var curItem = $('#' + selRect.getAttribute('selectedId'))[0];
	var urlData = 'http:' + docURL + '/dataServer/db/getDataById?params=' + 
							curItem.getAttribute('idSignal') + '_' + 
							$("#dpBeg")[0].value +'_' + $("#dpEnd")[0].value + '_' + 
							$("#sInstantaneous")[0].value;

	if(this.id === 'dpBeg') {
		$("#dpEnd").datepicker("option", "minDate", new Date(yy, mm, dd));
	} else if(this.id === 'dpEnd') {
		$("#dpBeg").datepicker("option", "maxDate", new Date(yy, mm, dd));
	}

	setDataTable(urlData, curItem);
}

function showChartPowerSys() {
	var md = document.getElementById('chartsPowerSys');
	var selRect = $('#selectableRectangle')[0];
	var curItem = $('#' + selRect.getAttribute('selectedId'))[0];
	if (curItem === undefined) {
		if (md.style.display === 'block') 
			md.style.display = 'none';
		return false;
	}
	var urlData = 'http:' + docURL + '/dataServer/db/getDataById?params=' + 
							curItem.getAttribute('idSignal') + '_' + 
							$("#dpBeg")[0].value +'_' + $("#dpEnd")[0].value + '_' + 
							$("#sInstantaneous")[0].value;
	var sp = $('#sInstantaneous option:first span:first');
	if(!sp.html()) sp.html(translateValueByKey('keyInstantaneous'));

	if (!(md.style.display === 'block')) {
		setDataTable(urlData, curItem);
	}

	setPopupWindow('chartsPowerSys', 'main');
}

function setDataTable(url, curItem) {
	var chart = $('#tabChart').highcharts();
	while(chart.series.length > 0) {
		chart.series[0].remove(true);
	}
	$.tablesorter.clearTableBody($('#dataTable')[0]);

	$.getJSON(url, function(data){
		var chart = $('#tabChart').highcharts();
		var charDada = '[';
		$.each(data.data, function(key, val) {
			var dt = timestamp2date(val.timestamp);
			var newColumn = '<td style="text-align: left;">' + dt + '</td>';

			newColumn += '<td style="text-align: center;">' + val.value + '</td>';
			$('#dataTable tbody').append('<tr>' + newColumn + '</tr>')
				.trigger("update").trigger("sorton", [[[0,1]]]);
			charDada += '[' + val.timestamp + ',' + val.value + '],';
		});
		if (charDada.length > 1) charDada = charDada.substring(0, charDada.length - 1);
		charDada += ']';

		chart.yAxis[0].setTitle({
			text: translateValueByKey('key_pValue') + ', ' + curItem.getAttribute('unit')
		});
		chart.addSeries({
			name: data.signalName, 
			data: JSON.parse(charDada),
			step: 'right'});
	}).fail(function( jqxhr, textStatus, error ) {
		var err = textStatus + ', ' + error;
		console.log( "Request Failed: " + err);
	});
}

function timestamp2date(ts){
	var d = new Date(ts);
	var dd = d.getDate();
	var mm = d.getMonth() + 1;
	var yy = d.getFullYear();
	var hh = d.getHours();
	var mi = d.getMinutes();
	var ss = d.getSeconds();
	var SSS = d.getMilliseconds();
	dd = dd < 10 ? '0' + dd : dd;
	mm = mm < 10 ? '0' + mm : mm;
	hh = hh < 10 ? '0' + hh : hh;
	mi = mi < 10 ? '0' + mi : mi;
	ss = ss < 10 ? '0' + ss : ss;
	SSS = SSS > 10 ? (SSS > 100 ? SSS : '0' + SSS) : '00' + SSS;
	return dd + '.' + mm + '.' + yy + ' ' +
				 hh + ':' + mi + ':' + ss + '.' + SSS;
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