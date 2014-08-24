function DebugLog(message, level) {
	level = level || 1; // default level is 1

	levelsToPrint = [1];
	// 1 - default
	// 2 - event information
	// 3 - method calls

	if ($.inArray(level, levelsToPrint) != -1) {
		console.log(message);	
	}
};

function ErrorLog(message) {
	console.log('ERROR: ' + message);	
};

