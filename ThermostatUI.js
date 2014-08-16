var KNOB_MIN = 65;
var KNOB_MAX = 80;

var ThermostatUI = (function () {

	var m_Online = false;
	var m_CurrentTemp = null;
	var m_DesiredTemp = null;

	var ThermostatKnobModes = {
		DisplayingCurrentTemp: 0,
		DisplayingDesiredTemp: 1
	};
	var m_ThermostatKnobMode = ThermostatKnobModes.DisplayingCurrentTemp;

	var ConfirmationKnobModes = {
		Disabled: 0,
		Ready: 1,
		Increasing: 2
	};
	var m_ConfirmationKnobMode = ConfirmationKnobModes.Disabled;
	var m_ConfirmationTime = 2000.0; // msec
	var m_ConfirmationKnobValue = null;
	var m_ConfirmationIntervalId = null;

	var CompleteConfirmation = function() {
		DebugLog('[CompleteConfirmation]');
		
		m_ConfirmationKnobMode = ConfirmationKnobModes.Ready;
		clearInterval(m_ConfirmationIntervalId);
		$("#confirmation-knob").val(0).trigger('change');
	};

	var InterruptConfirmation = function() {
		DebugLog('[InterruptConfirmation]');
		
		// Stop Confirmation Knob from increasing
		clearInterval(m_ConfirmationIntervalId);

		// Change Confirmation Knob color to red and fill it all the way
		$("#confirmation-knob").trigger('configure', {
			"fgColor":"#FF0000"
		});
		$("#confirmation-knob").val(100).trigger('change');

		// Change Confirmation Knob color to default and earse it after a brief pause
		setTimeout(function(){
			$("#confirmation-knob").trigger('configure', {
				"fgColor":"#66CC66"
			});
			$("#confirmation-knob").val(0).trigger('change');
			m_ConfirmationKnobMode = ConfirmationKnobModes.Ready;
		}, 500);
	};

	var IncrementConfirmationKnob = function() {
		DebugLog('[IncrementConfirmationKnob]');

		m_ConfirmationKnobMode = ConfirmationKnobModes.Increasing;
		m_ConfirmationKnobValue += 1;
		$("#confirmation-knob").val(m_ConfirmationKnobValue).trigger('change');
		if (m_ConfirmationKnobValue > 100) {
			CompleteConfirmation();
		}
	};

	var StartConfirmation = function() {
		// Reset confirmation knob value and clear previous intervals
		m_ConfirmationKnobValue = 0;
		clearInterval(m_ConfirmationIntervalId);

		// Start the confirmation knob after a brief pause
		setTimeout(function(){
			m_ConfirmationIntervalId = setInterval(IncrementConfirmationKnob, m_ConfirmationTime/100.0);
		}, 500);
	};

	var ThermostatKnobReleaseHook = function(){
		// Don't StartConfirmation if Offline
		if (!m_Online) {
			DebugLog("[ThermostatKnobReleaseHook] Not Online. Cannot StartConfirmation.");
			return;
		}

		// Don't StartConfirmation if ConfirmationKnob is disabled
		if (m_ConfirmationKnobMode == ConfirmationKnobModes.Disabled) {
			DebugLog("[ThermostatKnobReleaseHook] Confirmation Knob not enabled. Cannot StartConfirmation.");
			return;	
		}

		StartConfirmation();
	};

	var ThermostatKnobChangeHook = function(){
		if (m_ConfirmationKnobMode == ConfirmationKnobModes.Increasing) {
			InterruptConfirmation();
		}
	};

	var m_ThermostatKnobProperties = {
		// Properties
		'min'			: KNOB_MIN,
		'max'			: KNOB_MAX,
		'angleOffset'	: -125,
		'angleArc'		: 250, 
		'lineCap'		: 'round',
		// Hooks
		'release'		: ThermostatKnobReleaseHook,
		'change'		: ThermostatKnobChangeHook
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
				DebugLog("[VisualizeCurrentTemp] Not Online. Cannot visualize.");
				return;
			}

			if (!m_CurrentTemp) {
				DebugLog("[VisualizeCurrentTemp] Current Temp not set. Cannot visualize.");
				return;
			}

			$("#thermostat-knob").val(m_CurrentTemp).trigger('change');

		}, // VisualizeCurrentTemp


		VisualizeDesiredTemp: function () {
			if (!m_Online) {
				DebugLog("[VisualizeDesiredTemp] Not Online. Cannot visualize.");
				return;
			}

			if (!m_DesiredTemp) {
				DebugLog("[VisualizeDesiredTemp] Desired Temp not set. Cannot visualize.");
				return;
			}

			$("#thermostat-knob").val(m_DesiredTemp).trigger('change');

		}, // VisualizeDesiredTemp


		SetOnline: function(online) {
			m_Online = online;

			//if (!m_Online) {
			//	ThermostatUI.VisualizeDisabled();
			//}
			//else {
			//	ThermostatUI.VisualizeCurrentTemp();
			//}
		},


		SetCurrentTemp: function(temp) {
			m_CurrentTemp = temp;
			//ThermostatUI.VisualizeCurrentTemp();
		},


		SetDesiredTemp: function(temp) {
			m_DesiredTemp = temp;
			//ThermostatUI.VisualizeDesiredTemp();
		},


		// Set Thermostat Knob mode
		SetThermostatMode: function(mode) {
			if (mode == "current-temp") {
				m_ThermostatKnobMode = ThermostatKnobModes.DisplayingCurrentTemp;
				m_ThermostatKnobProperties.readOnly = true;
				$("#thermostat-knob").trigger('configure', m_ThermostatKnobProperties);
				ThermostatUI.VisualizeCurrentTemp();
			}
			else if (mode == "desired-temp") {
				m_ThermostatKnobMode = ThermostatKnobModes.DisplayingDesiredTemp;
				m_ThermostatKnobProperties.readOnly = false;
				$("#thermostat-knob").trigger('configure', m_ThermostatKnobProperties);
				ThermostatUI.VisualizeDesiredTemp();
			}
		},


		// Enable / disable confirmation knob
		SetConfirmationKnobReady: function() {
			m_ConfirmationKnobMode = ConfirmationKnobModes.Ready;
		}

	}; // Return

})();
