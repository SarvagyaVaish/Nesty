var KNOB_MIN = 65;
var KNOB_MAX = 80;

var ThermostatUI = (function () {

	var m_Online = false;
	var m_CurrentTemp = null;
	var m_DesiredTemp = null;

	var m_ConfirmationTime = 2500; // msec
	var m_ConfirmationTimerStart = null;
	
	var m_ThermostatKnobProperties = {
		'min'			: KNOB_MIN,
		'max'			: KNOB_MAX,
		'angleOffset'	: -125,
		'angleArc'		: 250, 
		'lineCap'		: 'round' 
	};

	var m_ConfirmationKnobProperties = {
		'min'			: KNOB_MIN,
		'max'			: KNOB_MAX,
		'angleOffset'	: -125,
		'angleArc'		: 250, 
		'lineCap'		: 'round',
		'fgColor' 		: '#66CC66',
		'bgColor'		: '#FFFFFF',
		'displayInput'	: false,
		'readOnly'		: true
	};

	return {

		// Initialize a knob in disabled state
		Init: function () {
			$("#thermostat-knob").knob(m_ThermostatKnobProperties);
			$("#confirmation-knob").knob(m_ConfirmationKnobProperties);
			ThermostatUI.VisualizeDisabled();
		}, // Init


		VisualizeDisabled: function() {
			// Set values to minimum
			$("#thermostat-knob").val(KNOB_MIN).trigger('change');
			$("#thermostat-knob").val('-');
			$("#confirmation-knob").val(KNOB_MIN).trigger('change');
		}, // VisualizeDisabled


		VisualizeCurrentTemp: function () {
			if (!m_Online) {
				console.log("ERROR: Not Online. Cannot visualize.");
				return;
			}

			if (!m_CurrentTemp) {
				console.log("ERROR: Current Temp not set. Cannot visualize.");
				return;
			}

			$("#thermostat-knob").val(m_CurrentTemp).trigger('change');
			$("#confirmation-knob").val(KNOB_MIN).trigger('change');

		}, // VisualizeCurrentTemp


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