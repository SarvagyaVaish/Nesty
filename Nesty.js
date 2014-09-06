var SparkBaseUrl = "https://api.spark.io/v1/devices";

$(function () {

	// Initialize Thermostat UI
	ThermostatUI.Init();

	// Initialize Dropbox Datastore
	DropboxDB.Init();

	// Set up ping to spark core (every 5 seconds)
	GetCurrentTemperature();
	setInterval(GetCurrentTemperature, 5000);

	// HAMMER.JS
	var tapArea = document.getElementById('tap-area');
	var mc = new Hammer.Manager(tapArea);
	mc.add( new Hammer.Tap({ event: 'doubletap', taps: 2 }) );
	mc.add( new Hammer.Tap({ event: 'singletap' }) );
	mc.get('doubletap').recognizeWith('singletap');
	mc.get('singletap').requireFailure('doubletap');

	// Handle single taps
	mc.on("singletap", function(ev) {
		console.log(ev.type + " ");
	});

	// Handle double taps
	mc.on("doubletap", function(ev) {
		console.log(ev.type + " ");
	});

	function GetCurrentTemperature() {
		var url = SparkBaseUrl + '/' + SPARK_CORE_ID + '/' + 'CurrTemp' ;
		$.ajax({
			type: 'GET',
			url: url,
			data: { access_token: SPARK_ACCESS_TOKEN },
			dataType: 'json',
			success: function(data){
				var temp = data.result;
				DebugLog("Current temp: " + temp, 2);
				if (ThermostatUI.GetOnline() == false) {
					ThermostatUI.SetOnline(true);
					ThermostatUI.SetCurrentTemp(temp);
					ThermostatUI.SetThermostatMode('current-temp');
				}
				else {
					ThermostatUI.SetCurrentTemp(temp);
				}
			},
			error: function(){
				ThermostatUI.SetOnline(false);
				ThermostatUI.VisualizeDisabled();
				ErrorLog("[Get Current Temperature] Api call failed. Core Offline.");
			}, 
			timeout: 2000
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