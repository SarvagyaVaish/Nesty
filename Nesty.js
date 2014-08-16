var SparkBaseUrl = "https://api.spark.io/v1/devices";

$(function () {

	// Initialize Thermostat UI
	ThermostatUI.Init();
	ThermostatUI.VisualizeCurrentTemp();

	// Initialize Dropbox Datastore
	DropboxDB.Init();

	IsCoreOnline();
	setInterval(IsCoreOnline, 5000);

	// HAMMER.JS
	var tapArea = $('#tap-area')[0];
	var mc = new Hammer(tapArea);
	mc.on("tap", function(ev) {
		console.log('gesture detected.');
		ThermostatUI.SetThermostatMode("desired-temp");
		setTimeout(function(){
			ThermostatUI.SetThermostatMode("current-temp");
		}, 5000);
	});



	function IsCoreOnlineSuccess(data) {
		var response = data[0]	;
		if ('last_heard' in response) {
			var lastHeardTime = response.last_heard;

			if (Date.now() - Date.parse(lastHeardTime) < 20000) {
				DebugLog("[IsCoreOnlineSuccess] Core Online.");
				ThermostatUI.SetOnline(true);
				ThermostatUI.SetConfirmationKnobReady();
			}
			else {
				DebugLog("[IsCoreOnlineSuccess] Core Offline.");
				ThermostatUI.SetOnline(false);
			}
		}
		else {
			ErrorLog("[IsCoreOnlineSuccess] Data does not have last_heard.");
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
				IsCoreOnlineSuccess(data);
			},
			error: function(){
				ErrorLog("[IsCoreOnline] Api call failed.");
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
				console.log("Current temp: " + temp);
			},
			error: function(){
				ErrorLog("[GetCurrentTemperature] Api call failed.");
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
				console.log("Desired temp: " + temp);
			},
			error: function(){
				ErrorLog("[GetDesiredTemperature] Api call failed.");
			}
		});

	};

	function getVariable(variable, callback) {
		var url = baseURL + SPARK_CORE_ID + "/" + variable + "?access_token=" + SPARK_ACCESS_TOKEN;
		$.getJSON(url, callback).fail(function(obj) {
			onMethodFailure();
		});
	};


	function doMethod(method, data) {
		var url = baseURL + SPARK_CORE_ID + "/" + method;
		$.ajax({
			type: "POST",
			url: url,
			data: { access_token: SPARK_ACCESS_TOKEN, args: data },
			success: onMethodSuccess,
			dataType: "json"
		}).fail(function(obj) {
			onMethodFailure();
		});
	};


	GetCurrentTemperature();
	GetDesiredTemperature();
	ThermostatUI.SetThermostatMode("current-temp");

});