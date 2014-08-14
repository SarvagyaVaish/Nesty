$(function () {

	// Initialize Thermostat UI
	ThermostatUI.Init();
	ThermostatUI.VisualizeCurrentTemp();

	setTimeout(function(){
		ThermostatUI.SetOnline(true);
		ThermostatUI.SetCurrentTemp(70);
		ThermostatUI.SetConfirmationKnobReady();
	}, 1000);

	// Initialize Dropbox Datastore
	DropboxDB.Init();

});