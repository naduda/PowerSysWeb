(function(){
	//		http://localhost:8080/PowerSysWeb/dataServer/journal?id=1
	var docURL = document.URL;
	var params = docURL.substring(docURL.lastIndexOf("?"));
	docURL = docURL.substring(docURL.indexOf('://'), docURL.lastIndexOf("/"));
	docURL = 'http' + docURL + '/dataServer/journal' + params;

	$.getJSON(docURL, function(data){
		Array.prototype.forEach.call(data, function(alarm){
			onAlarmMessage(alarm);
		});
	}).fail(function( jqxhr, textStatus, error ) {
		var err = textStatus + ', ' + error;
		console.log( "Request Failed: " + err);
		modalInfo.close();
	});
})();