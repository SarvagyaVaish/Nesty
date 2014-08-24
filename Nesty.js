var SparkBaseUrl = "https://api.spark.io/v1/devices";

$(function () {

	// Initialize Thermostat UI
	ThermostatUI.Init();

	// Initialize Dropbox Datastore
	DropboxDB.Init();

	// Set up ping to spark core (every 5 seconds)
	IsCoreOnline();
	setInterval(IsCoreOnline, 5000);

	// HAMMER.JS
	var tapArea = $('#tap-area')[0];
	var mc = new Hammer(tapArea);
	mc.on("tap", function(ev) {
		if (ThermostatUI.GetThermostatMode() == 'current-temp') {
			DebugLog('Tap gesture recognized.', 2);
			ThermostatUI.SetThermostatMode("desired-temp");
		}
	});

	function CorePingSuccessful(data) {
		var response = data[0]	;
		if ('last_heard' in response) {
			var lastHeardTime = response.last_heard;

			/*
			var d = new Date();
			var n = d.toUTCString();
			DebugLog(n);

			var d2 = new Date(Date.parse(lastHeardTime));
			var n2 = d2.toUTCString();
			DebugLog(n2);
			*/

			if (Date.now() - Date.parse(lastHeardTime) < 30000) {
				if (ThermostatUI.GetOnline()) {
					DebugLog("[Core Ping Successful] Core Already Online.", 2);
				}
				else {
					DebugLog("[Core Ping Successful] Core Online.", 2);
					ThermostatUI.SetOnline(true);
					// #TODO: the gets happen async and the set thermostat 
					//        is called before the get calls return
					GetCurrentTemperature();
					GetDesiredTemperature();
					ThermostatUI.SetThermostatMode("current-temp");
				}
			}
			else {
				var temp = Date.now() - Date.parse(lastHeardTime);
				DebugLog("[Core Ping Successful] Core Offline: " + temp, 2);
				ThermostatUI.SetOnline(false);
			}
		}
		else {
			ErrorLog("[Core Ping Successful] Data does not have last_heard.");
			console.log(response);
		}
	};

	function IsCoreOnline() {
		var url = SparkBaseUrl;
		$.ajax({
			type: 'GET',
			url: url,
			data: { access_token: SPARK_ACCESS_TOKEN },
			dataType: 'json',
			success: function(data){
				CorePingSuccessful(data);
			},
			error: function(){
				ErrorLog("[Is Core Online] Api call failed.");
			}
		});

	};

	function GetCurrentTemperature() {
		var url = SparkBaseUrl + '/' + SPARK_CORE_ID + '/' + 'CurrTemp' ;
		$.ajax({
			type: 'GET',
			url: url,
			data: { access_token: SPARK_ACCESS_TOKEN },
			dataType: 'json',
			success: function(data){
				var temp = data.result;
				ThermostatUI.SetCurrentTemp(temp);
				DebugLog("Current temp: " + temp, 2);
			},
			error: function(){
				ErrorLog("[Get Current Temperature] Api call failed.");
			}
		});

	};

	function GetDesiredTemperature() {
		var url = SparkBaseUrl + '/' + SPARK_CORE_ID + '/' + 'DesrTemp' ;
		$.ajax({
			type: 'GET',
			url: url,
			data: { access_token: SPARK_ACCESS_TOKEN },
			dataType: 'json',
			success: function(data){
				var temp = data.result;
				ThermostatUI.SetDesiredTemp(temp);
				DebugLog("Desired temp: " + temp, 2);
			},
			error: function(){
				ErrorLog("[Get Desired Temperature] Api call failed.");
			}
		});

	};	

});