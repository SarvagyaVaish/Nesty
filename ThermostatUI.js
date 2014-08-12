var KNOB_MIN = 65;
var KNOB_MAX = 80;

var ThermostatUI = (function () {

	var m_Online = false;
	var m_CurrentTemp = null;
	var m_DesiredTemp = null;

	var m_ConfirmationTime = 2000.0; // msec
	var m_ConfirmationKnobValue = null;
	var m_ConfirmationIntervalId = null;

	var CompleteConfirmation = function() {
		console.log('CompleteConfirmation');
		
		clearInterval(m_ConfirmationIntervalId);
		$("#confirmation-knob").val(0).trigger('change');
	};

	var InterruptConfirmation = function() {
		console.log('InterruptConfirmation');
		
		clearInterval(m_ConfirmationIntervalId);
		$("#confirmation-knob").trigger('configure', {
			"fgColor":"#FF0000"
		});
		$("#confirmation-knob").val(100).trigger('change');
		setTimeout(function(){
			$("#confirmation-knob").trigger('configure', {
				"fgColor":"#66CC66"
			});
			$("#confirmation-knob").val(0).trigger('change');
		}, 500);
	};

	var IncrementConfirmationKnob = function() {
		console.log('IncrementConfirmationKnob');

		m_ConfirmationKnobValue += 1;
		$("#confirmation-knob").val(m_ConfirmationKnobValue).trigger('change');
		if (m_ConfirmationKnobValue > 100) {
			CompleteConfirmation();
		}
	};

	var StartConfirmation = function() {
		// Dont start if release was triggered but thermostat is offline
		if (!m_Online) {
			return;
		}
		console.log('StartConfirmation');

		m_ConfirmationKnobValue = 0;
		clearInterval(m_ConfirmationIntervalId);
		setTimeout(function(){
			m_ConfirmationIntervalId = setInterval(IncrementConfirmationKnob, m_ConfirmationTime/100.0);
		}, 500);
	};

	var m_ThermostatKnobProperties = {
		// Properties
		'min'			: KNOB_MIN,
		'max'			: KNOB_MAX,
		'angleOffset'	: -125,
		'angleArc'		: 250, 
		'lineCap'		: 'round',
		// Hooks
		'release'		: StartConfirmation
	};

	var m_ConfirmationKnobProperties = {
		// Properties
		'min'			: 0,
		'max'			: 100,
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
			$("#confirmation-knob").val(0).trigger('change');
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
			$("#confirmation-knob").val(0).trigger('change');

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