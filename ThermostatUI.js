var KNOB_MIN = 65;
var KNOB_MAX = 80;

var ThermostatUI = (function () {

	var m_Online = false;
	var m_CurrentTemp = null;
	var m_DesiredTemp = null;

	var m_DesiredTempTimeoutId = null;

	// Thermostat Knob
	var ThermostatKnobModes = {
		DisplayingCurrentTemp: 0,
		DisplayingDesiredTemp: 1
	};
	var m_ThermostatKnobMode = ThermostatKnobModes.DisplayingCurrentTemp;

	// Confirmation Knob
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
			DebugLog("[Complete Confirmation] Confirmation Knob mode == Disabled", 2);
			return;
		}
		
		DebugLog('[Complete Confirmation]', 3);
		
		m_ConfirmationKnobMode = ConfirmationKnobModes.Ready;
		ResetConfirmationKnob();
	};

	var InterruptConfirmation = function() {
		if (m_ConfirmationKnobMode == ConfirmationKnobModes.Disabled) {
			DebugLog("[Interrupt Confirmation] Confirmation Knob mode == Disabled", 2);
			return;
		}
		
		DebugLog('[Interrupt Confirmation]', 3);

		// Stop Confirmation Knob from increasing
		ResetConfirmationKnob();
		m_ConfirmationKnobMode = ConfirmationKnobModes.Disabled;

		// Change Confirmation Knob color to red and fill it all the way
		$("#confirmation-knob").trigger('configure', {
			"fgColor":"#FF0000"
		});
		$("#confirmation-knob").val(100).trigger('change');

		// Change Confirmation Knob color to default and erase it after a brief pause (500 ms)
		setTimeout(function(){
			$("#confirmation-knob").trigger('configure', m_ConfirmationKnobProperties);
			ResetConfirmationKnob();
			m_ConfirmationKnobMode = ConfirmationKnobModes.Ready;
		}, 500);

		/*
		m_ConfirmationKnobMode = ConfirmationKnobModes.Ready;
		*/
	};

	var IncrementConfirmationKnob = function() {
		if (m_ConfirmationKnobMode == ConfirmationKnobModes.Disabled) {
			DebugLog("[Increment Confirmation Knob] Confirmation Knob mode == Disabled", 2);
			return;
		}

		if (m_ConfirmationKnobMode != ConfirmationKnobModes.Increasing) {
			DebugLog("[Increment Confirmation Knob]", 3);
			m_ConfirmationKnobMode = ConfirmationKnobModes.Increasing;
		}

		m_ConfirmationKnobValue += 1;
		$("#confirmation-knob").val(m_ConfirmationKnobValue).trigger('change');
		if (m_ConfirmationKnobValue > 100) {
			CompleteConfirmation();
		}
	};

	var StartConfirmation = function() {
		if (m_ConfirmationKnobMode == ConfirmationKnobModes.Disabled) {
			DebugLog("[Start Confirmation] Confirmation Knob mode == Disabled", 2);
			return;
		}
		DebugLog("[Start Confirmation]", 3);
		
		ResetConfirmationKnob();

		// Reset confirmation knob value and clear previous intervals
		m_ConfirmationKnobValue = 0;

		// Start the confirmation knob after a brief pause (500 ms)
		setTimeout(function(){
			if (m_ConfirmationIntervalId == null) {
				m_ConfirmationIntervalId = setInterval(IncrementConfirmationKnob, m_ConfirmationTime/100.0);
			}
		}, 500);
	};

	var NoOpHook = function() {
		// No op
	};

	var ThermostatKnobReleaseHook = function(){
		DebugLog("[Thermostat Knob Release Hook]", 3);

		ResetDisplayingDesiredTempTimeout();

		StartConfirmation();
	};

	var ThermostatKnobChangeHook = function(){
		DebugLog("[Thermostat Knob Change Hook]", 3);

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
		DebugLog("[Reset Confirmation Knob]", 3);

		m_ConfirmationKnobValue = 0;
		clearInterval(m_ConfirmationIntervalId);
		m_ConfirmationIntervalId = null;
		$("#confirmation-knob").val(m_ConfirmationKnobValue).trigger('change');
	};

	var ResetDisplayingDesiredTempTimeout = function(){
		DebugLog("[Reset Displaying Desired Temp Timeout]", 3);
		clearTimeout(m_DesiredTempTimeoutId);
		m_DesiredTempTimeoutId = setTimeout(function(){
			ResetConfirmationKnob();
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
			DebugLog("[Visualize Disabled]", 3);

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
				DebugLog("[Visualize Current Temp] Not Online. Cannot visualize.", 2);
				return;
			}

			if (!m_CurrentTemp) {
				DebugLog("[Visualize Current Temp] Current Temp not set. Cannot visualize.", 2);
				return;
			}

			// Display current temp
			DebugLog("[Visualize Current Temp] Setting thermostat knob to " + m_CurrentTemp, 2);
			$("#thermostat-knob").val(m_CurrentTemp).trigger('change');

		}, // VisualizeCurrentTemp


		VisualizeDesiredTemp: function () {
			if (!m_Online) {
				DebugLog("[VisualizeDesiredTemp] Not Online. Cannot visualize.", 2);
				return;
			}

			if (!m_DesiredTemp) {
				DebugLog("[VisualizeDesiredTemp] Desired Temp not set. Cannot visualize.", 2);
				return;
			}

			// Display desired temp 
			DebugLog("[Visualize Desired Temp] Setting thermostat knob to " + m_DesiredTemp, 2);
			$("#thermostat-knob").val(m_DesiredTemp).trigger('change');

		}, // VisualizeDesiredTemp


		SetOnline: function(online) {
			DebugLog("[Set Online]: " + online, 3);
			m_Online = online;
		},


		GetOnline: function() {
			DebugLog("[Get Online]: " + m_Online, 3);
			return m_Online;
		},


		SetCurrentTemp: function(temp) {
			DebugLog("[Set Current Temp]: " + temp, 3);
			m_CurrentTemp = temp;
		},


		SetDesiredTemp: function(temp) {
			DebugLog("[Set Desired Temp]: " + temp, 3);
			m_DesiredTemp = temp;
		},


		// Set Thermostat Knob mode
		SetThermostatMode: function(mode) {
			DebugLog("[Set Thermostat Mode]: " + mode, 3);

			if (mode == "current-temp") {

				// Reset the confirmation knob
				ResetConfirmationKnob();

				// Set modes
				m_ConfirmationKnobMode = ConfirmationKnobModes.Disabled;
				m_ThermostatKnobMode = ThermostatKnobModes.DisplayingCurrentTemp;

				// Init Thermostat Knob
				$("#thermostat-knob").trigger('configure', m_ThermostatKnobProperties.DisplayingCurrentTemp);
				ThermostatUI.VisualizeCurrentTemp();
			}
			else if (mode == "desired-temp") {

				// Reset the confirmation knob
				ResetConfirmationKnob();

				// Thermostat Knob mode
				m_ThermostatKnobMode = ThermostatKnobModes.DisplayingDesiredTemp;

				// Init Thermostat Knob
				$("#thermostat-knob").trigger('configure', m_ThermostatKnobProperties.DisplayingDesiredTemp);
				ThermostatUI.VisualizeDesiredTemp();

				// Confirmation Knob mode
				m_ConfirmationKnobMode = ConfirmationKnobModes.Ready;

				// Set up timer to display current temperature 
				ResetDisplayingDesiredTempTimeout();
			}
		},


		GetThermostatMode: function(mode) {
			if (m_ThermostatKnobMode == ThermostatKnobModes.DisplayingCurrentTemp) {
				return 'current-temp';
			}
			if (m_ThermostatKnobMode == ThermostatKnobModes.DisplayingDesiredTemp) {
				return 'desired-temp';
			}
		}

	}; // Return

})();
