var ThermostatUI = (function () {

	var m_Online = false;
	var m_CurrentTemp = null;
	var m_DesiredTemp = null;

	var m_ConfirmationTime = 2500; // msec
	var m_ConfirmationTimerStart = null;

	return {

		// Initialize a knob in disabled state
		Init: function () {
			ThermostatUI.VisualizeDisabled();
		}, // Init


		VisualizeDisabled: function() {
			$("#thermostat-knob").knob({
				'min' : 65,
				'max' : 80, 
				'angleOffset' : -125,
				'angleArc' : 250, 
				'lineCap' : 'round',
				'fgColor' : '#CDCDCD',
				'inputColor' : '#CDCDCD', 
				'readOnly' : true
			});

			// Set disabled state
			$("#thermostat-knob").val(80).trigger('change');
			$("#thermostat-knob").val('-');
		},


		VisualizeCurrentTemp: function () {
			if (!m_Online) {
				console.log("ERROR: Not Online. Cannot visualize.");
				return;
			}

			if (!m_CurrentTemp) {
				console.log("ERROR: Current Temp not set. Cannot visualize.");
				return;
			}

			$("#thermostat-knob").knob({
				'min' : 65,
				'max' : 80, 
				'angleOffset' : -125,
				'angleArc' : 250, 
				'lineCap' : 'round'
			});

			// Set disabled state
			$("#thermostat-knob").val(m_CurrentTemp).trigger('change');
		}, // Set Current Temp


		SetOnline: function(online) {
			m_Online = online;

			if (!m_Online) {
				ThermostatUI.VisualizeDisabled();
			}
			else {
				ThermostatUI.VisualizeCurrentTemp();
			}
		},


		SetCurrentTemp: function(currentTemp) {
			m_CurrentTemp = currentTemp;
			ThermostatUI.VisualizeCurrentTemp();
		},

	}; // Return

})();