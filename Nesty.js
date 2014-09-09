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
		DebugLog("[Tap]: " + ev.type, 2);

		// Display desired temp knob if displaying current temp. Ignore otherwise
		if (ThermostatUI.GetThermostatMode() == 'CurrentTemp') {
			ThermostatUI.SetThermostatMode('DesiredTemp');
		}
		else {
			DebugLog("[Tap]: " + "Ignored", 2);
		}
	});


	// Handle double taps
	mc.on("doubletap", function(ev) {
		DebugLog("[Tap]: " + ev.type, 2);

		// Toggle Hvac on / off
		if (ThermostatUI.GetThermostatMode() == 'HvacOff') {
			ThermostatUI.SetThermostatMode('CurrentTemp');
		}
		else if (ThermostatUI.GetThermostatMode() == 'CurrentTemp') {
			ThermostatUI.SetThermostatMode('HvacOff');
		}
		else {
			DebugLog("[Tap]: " + "Ignored", 2);
		}
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
					ThermostatUI.SetThermostatMode('CurrentTemp');
					GetDesiredTemperature();
				}
				else {
					ThermostatUI.SetCurrentTemp(temp);
					// Hack - call set thermostat mode again to display correct temp
					if (ThermostatUI.GetThermostatMode() == 'CurrentTemp') {
						ThermostatUI.SetThermostatMode('CurrentTemp');
					}
				}
			},
			error: function(){
				ThermostatUI.SetOnline(false);
				ThermostatUI.SetThermostatMode('Offline');
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


	// Event that can be triggered to set nestry mode
	$('#tap-area').on('SetNestyMode', function(e, args){
		DebugLog('[SetNestyMode Event]: Triggered. Args.mode: ' + args.mode, 2);
		SetNestyMode(args.mode);
	});

	// Example
	// $('#tap-area').trigger('SetNestyMode', { mode: "cool" });

	function SetNestyMode(mode) {
		var url = SparkBaseUrl + '/' + SPARK_CORE_ID + '/' + 'SetMode';
		$.ajax({
			type: 'POST',
			url: url,
			data: { 
				access_token: SPARK_ACCESS_TOKEN, 
				args: mode
			},
			dataType: 'json',
			success: function(data){
				DebugLog('[Set Nesty Mode]: Successful');
			},
			error: function(){
				ErrorLog('[Set Nesty Mode]: Failed');
			}, 
			timeout: 2000
		});

	};


	// Event that can be triggered to set desired temp
	$('#tap-area').on('SetDesiredTemp', function(e, args){
		DebugLog('[Set Desired Temp Event]: Triggered. Args.temp: ' + args.temp, 2);
		SetDesiredTemp(args.temp);
	});

	// Example
	// $('#tap-area').trigger('SetDesiredTemp', { temp: "70" });

	function SetDesiredTemp(temp) {
		var url = SparkBaseUrl + '/' + SPARK_CORE_ID + '/' + 'SetDesrTemp';
		$.ajax({
			type: 'POST',
			url: url,
			data: { 
				access_token: SPARK_ACCESS_TOKEN, 
				args: 'temp=' + temp
			},
			dataType: 'json',
			success: function(data){
				DebugLog('[Set Desired Temp]: Successful');
			},
			error: function(){
				ErrorLog('[Set Desired Temp]: Failed');
			}, 
			timeout: 2000
		});

	};

});