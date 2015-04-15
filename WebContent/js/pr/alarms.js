$.tablesorter.addParser({
	id: "customDate",
	format: function(s) {
		s = s.replace("/\-/g"," ");
		s = s.replace(/:/g," ");
		s = s.replace(/\./g," ");
		s = s.split(" ");
		return $.tablesorter.formatFloat(
			new Date(s[2], s[1]-1, s[0], s[3], s[4], s[5])
			.getTime() + parseInt(s[6]));
	},
	type: "numeric"
});
$("#alarmTable").tablesorter({
	headers: {
		3: { sorter:'customDate' },
		4: { sorter:'customDate' },
		8: { sorter:'customDate' }
	}
});
$("#alarmFilter").bind('change', function (e) {
	var val = $(this).val();
	$('#alarmTable tbody tr').each(function(){
		var colPrior = $(this).find('td').eq(12);
		if(val === colPrior.html() || val === '0') {
			$(this).css({'display':''});
		} else {
			$(this).css({'display':'none'});
		}
	});
});

$("#alarmTable").colResizable({
	liveDrag:true,
	fixed:false
});

$('#alarmTable thead tr:first').find('th').each(function(){
	if ($(this).index() === 7 || $(this).index() === 12) {
		$(this).css({
			display: "none"
		})
	}
});

$('#alarmTable tbody').on('click', 'tr', function(){
	$(this).hasClass('selectedAlarm') ? 
		$(this).removeClass('selectedAlarm') : $(this).addClass('selectedAlarm');
});

function showHideColumn(col, isShow) {
	$('#alarmTable').find('tr').each(function(){
		$(this).find('th').eq(col).css({
			'display': isShow ? '' : 'none'
		})
		$(this).find('td').eq(col).css({
			'display': isShow ? '' : 'none'
		})
	});
}