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
	var m_DesiredTempTimeoutId = null;

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
		if (m_ConfirmationKnobMode == ConfirmationKnobModes.Disabled) {
			ResetConfirmationKnob();
		}

		DebugLog('[CompleteConfirmation]');
		
		m_ConfirmationKnobMode = ConfirmationKnobModes.Ready;
		ResetConfirmationKnob();
	};

	var InterruptConfirmation = function() {
		if (m_ConfirmationKnobMode == ConfirmationKnobModes.Disabled) {
			ResetConfirmationKnob();
		}

		DebugLog('[InterruptConfirmation]');
		
		// Stop Confirmation Knob from increasing
		clearInterval(m_ConfirmationIntervalId);

		// Change Confirmation Knob color to red and fill it all the way
		$("#confirmation-knob").trigger('configure', {
			"fgColor":"#FF0000"
		});
		$("#confirmation-knob").val(100).trigger('change');

		// Change Confirmation Knob color to default and erase it after a brief pause
		setTimeout(function(){
			$("#confirmation-knob").trigger('configure', m_ConfirmationKnobProperties);
			ResetConfirmationKnob();
			m_ConfirmationKnobMode = ConfirmationKnobModes.Ready;
		}, 500);
	};

	var IncrementConfirmationKnob = function() {
		if (m_ConfirmationKnobMode == ConfirmationKnobModes.Disabled) {
			ResetConfirmationKnob();
		}

		DebugLog('[IncrementConfirmationKnob]');

		m_ConfirmationKnobMode = ConfirmationKnobModes.Increasing;
		m_ConfirmationKnobValue += 1;
		$("#confirmation-knob").val(m_ConfirmationKnobValue).trigger('change');
		if (m_ConfirmationKnobValue > 100) {
			CompleteConfirmation();
		}
	};

	var StartConfirmation = function() {
		if (m_ConfirmationKnobMode == ConfirmationKnobModes.Disabled) {
			ResetConfirmationKnob();
		}

		// Reset confirmation knob value and clear previous intervals
		m_ConfirmationKnobValue = 0;
		clearInterval(m_ConfirmationIntervalId);

		// Start the confirmation knob after a brief pause
		setTimeout(function(){
			m_ConfirmationIntervalId = setInterval(IncrementConfirmationKnob, m_ConfirmationTime/100.0);
		}, 500);
	};

	var NoOpHook = function() {
		// No op
	};

	var ThermostatKnobReleaseHook = function(){
		ResetDisplayingDesiredTempTimeout();

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
		ResetDisplayingDesiredTempTimeout();
		
		if (m_ConfirmationKnobMode == ConfirmationKnobModes.Increasing) {
			InterruptConfirmation();
		}
	};

	var m_ThermostatKnobProperties = {
		DisplayingCurrentTemp : {
			// Properties
			'min'			: KNOB_MIN,
			'max'			: KNOB_MAX,
			'angleOffset'	: -125,
			'angleArc'		: 250, 
			'lineCap'		: 'round',
			'fgColor' 		: '#999999',
			'readOnly'		: true,
			// Hooks
			'release'		: NoOpHook,
			'change'		: NoOpHook
		},
		DisplayingDesiredTemp : {
			// Properties
			'min'			: KNOB_MIN,
			'max'			: KNOB_MAX,
			'angleOffset'	: -125,
			'angleArc'		: 250, 
			'lineCap'		: 'round',
			'fgColor' 		: '#5CD9F2',
			'readOnly'		: false,
			// Hooks
			'release'		: ThermostatKnobReleaseHook,
			'change'		: ThermostatKnobChangeHook
		}
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

	var ResetConfirmationKnob = function(){
		m_ConfirmationKnobValue = 0;
		clearInterval(m_ConfirmationIntervalId);
		$("#confirmation-knob").val(m_ConfirmationKnobValue).trigger('change');
	};

	var ResetDisplayingDesiredTempTimeout = function(){
		clearTimeout(m_DesiredTempTimeoutId);
		m_DesiredTempTimeoutId = setTimeout(function(){
			ThermostatUI.SetThermostatMode('current-temp');
		}, 5000);
	};

	return {
		// Initialize a knob in disabled state
		Init: function () {
			$("#thermostat-knob").knob(m_ThermostatKnobProperties.DisplayingCurrentTemp);
			$("#confirmation-knob").knob(m_ConfirmationKnobProperties);
			ThermostatUI.VisualizeDisabled();
		}, // Init


		VisualizeDisabled: function() {
			// Reset the confirmation knob
			ResetConfirmationKnob();

			// Disable the confirmation knob
			m_ConfirmationKnobMode = ConfirmationKnobModes.Disabled;

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

			// Display current temp on thermostat knob
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
		},


		SetCurrentTemp: function(temp) {
			m_CurrentTemp = temp;
		},


		SetDesiredTemp: function(temp) {
			m_DesiredTemp = temp;
		},


		// Set Thermostat Knob mode
		SetThermostatMode: function(mode) {
			
			if (mode == "current-temp") {

				// Reset the confirmation knob
				ResetConfirmationKnob();

				// Set modes
				m_ConfirmationKnobMode = ConfirmationKnobModes.Disabled;
				m_ThermostatKnobMode = ThermostatKnobModes.DisplayingCurrentTemp;

				$("#thermostat-knob").trigger('configure', m_ThermostatKnobProperties.DisplayingCurrentTemp);
				ThermostatUI.VisualizeCurrentTemp();
			}
			else if (mode == "desired-temp") {

				// Reset the confirmation knob
				ResetConfirmationKnob();

				// Thermostat Knob mode
				m_ThermostatKnobMode = ThermostatKnobModes.DisplayingDesiredTemp;

				$("#thermostat-knob").trigger('configure', m_ThermostatKnobProperties.DisplayingDesiredTemp);
				ThermostatUI.VisualizeDesiredTemp();

				// Confirmation Knob mode
				m_ConfirmationKnobMode = ConfirmationKnobModes.Ready;

				// Set up timer to go back to current temp after a while
				ResetDisplayingDesiredTempTimeout();
			}
		}

	}; // Return

})();
