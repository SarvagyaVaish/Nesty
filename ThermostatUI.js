var KNOB_MIN = 65;
var KNOB_MAX = 80;

var ThermostatUI = (function () {

	var m_Online = false;
	var m_HvacState = false;
	var m_CurrentTemp = null;
	var m_DesiredTemp = null;

	var m_DesiredTempTimeoutId = null;

	// Thermostat Knob
	var ThermostatKnobModes = {
		Offline: 0,
		HvacOff: 1,
		CurrentTemp: 2,
		DesiredTemp: 3
	};
	var m_ThermostatKnobMode = ThermostatKnobModes.Offline;

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
		Offline : {
			// Properties - unchanged
			'min'			: KNOB_MIN,
			'max'			: KNOB_MAX,
			'angleOffset'	: -125,
			'angleArc'		: 250, 
			'lineCap'		: 'round',
			// Properties
			'inputColor'	: '#999999',
			'fgColor' 		: '#CCCCCC',  // Gray
			'readOnly'		: true,
			// Hooks
			'release'		: NoOpHook,
			'change'		: NoOpHook
		},
		HvacOff : {
			// Properties - unchanged
			'min'			: KNOB_MIN,
			'max'			: KNOB_MAX,
			'angleOffset'	: -125,
			'angleArc'		: 250, 
			'lineCap'		: 'round',
			// Properties
			'inputColor'	: '#999999',
			'fgColor' 		: '#CCCCCC',  // Gray
			'readOnly'		: true,
			// Hooks
			'release'		: NoOpHook,
			'change'		: NoOpHook
		}, 
		CurrentTemp : {
			// Properties - unchanged
			'min'			: KNOB_MIN,
			'max'			: KNOB_MAX,
			'angleOffset'	: -125,
			'angleArc'		: 250, 
			'lineCap'		: 'round',
			// Properties
			'inputColor'	: '#0AB22C',
			'fgColor' 		: '#08D632',  // Green
			'readOnly'		: true,
			// Hooks
			'release'		: NoOpHook,
			'change'		: NoOpHook
		},
		DesiredTemp : {
			// Properties - unchanged
			'min'			: KNOB_MIN,
			'max'			: KNOB_MAX,
			'angleOffset'	: -125,
			'angleArc'		: 250, 
			'lineCap'		: 'round',
			// Properties
			'inputColor'	: '#007BBE',
			'fgColor' 		: '#00A4FC',  // Blue
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
		'fgColor' 		: '#08D632',
		'bgColor'		: '#FFFFFF',
		'displayInput'	: false,
		'readOnly'		: true
	};

	var ResetConfirmationKnob = function(){
		DebugLog("[Reset Confirmation Knob]", 3);

		// Clear Confirmation Knob Interval Timer
		clearInterval(m_ConfirmationIntervalId);
		m_ConfirmationIntervalId = null;

		// Set Confirmation Knob to 0
		m_ConfirmationKnobValue = 0;
		$("#confirmation-knob").val(m_ConfirmationKnobValue).trigger('change');
	};

	var ResetDisplayingDesiredTempTimeout = function(){
		DebugLog("[Reset Displaying Desired Temp Timeout]", 3);
		clearTimeout(m_DesiredTempTimeoutId);
		m_DesiredTempTimeoutId = setTimeout(function(){
			ResetConfirmationKnob();
			ThermostatUI.SetThermostatMode('CurrentTemp');
		}, 5000);
	};

	return {
		// Initialize a knob in disabled state
		Init: function () {
			$("#thermostat-knob").knob(m_ThermostatKnobProperties.DisplayingCurrentTemp);
			$("#confirmation-knob").knob(m_ConfirmationKnobProperties);
			ThermostatUI.VisualizeOffline();
		}, // Init


		VisualizeOffline: function() {
			DebugLog("[Visualize Offline]", 3);

			// Set Thermostat Knob mode
			m_ThermostatKnobMode = ThermostatKnobModes.Offline;

			// Style Thermostat Knob
			$("#thermostat-knob").trigger('configure', m_ThermostatKnobProperties.Offline);
			
			// Visualize
			$("#thermostat-knob").val(KNOB_MIN).trigger('change');
			$("#thermostat-knob").val('-');
		}, // VisualizeOffline


		VisualizeHvacOff: function() {
			if (!m_Online) {
				DebugLog("[Visualize Hvac Off] Not Online. Cannot visualize.", 2);
				return;
			}

			if (!m_CurrentTemp) {
				DebugLog("[Visualize Hvac Off] Current Temp not set. Cannot visualize.", 2);
				return;
			}

			// Set Thermostat Knob mode
			m_ThermostatKnobMode = ThermostatKnobModes.HvacOff;

			// Style Thermostat Knob
			$("#thermostat-knob").trigger('configure', m_ThermostatKnobProperties.HvacOff);
			
			// Visualize
			DebugLog("[Visualize Hvac Off] Setting thermostat knob to " + m_CurrentTemp, 2);
			$("#thermostat-knob").val(m_CurrentTemp).trigger('change');
		}, // VisualizeHvacOff


		VisualizeCurrentTemp: function () {
			if (!m_Online) {
				DebugLog("[Visualize Current Temp] Not Online. Cannot visualize.", 2);
				return;
			}

			if (!m_CurrentTemp) {
				DebugLog("[Visualize Current Temp] Current Temp not set. Cannot visualize.", 2);
				return;
			}

			// Set Thermostat Knob mode
			m_ThermostatKnobMode = ThermostatKnobModes.CurrentTemp;

			// Style Thermostat Knob
			$("#thermostat-knob").trigger('configure', m_ThermostatKnobProperties.CurrentTemp);
			
			// Visualize
			DebugLog("[Visualize Current Temp] Setting thermostat knob to " + m_CurrentTemp, 2);
			$("#thermostat-knob").val(m_CurrentTemp).trigger('change');
		}, // VisualizeCurrentTemp


		VisualizeDesiredTemp: function () {
			if (!m_Online) {
				DebugLog("[Visualize Desired Temp] Not Online. Cannot visualize.", 2);
				return;
			}

			if (!m_DesiredTemp) {
				DebugLog("[Visualize Desired Temp] Desired Temp not set. Cannot visualize.", 2);
				return;
			}

			// Set Thermostat Knob mode
			m_ThermostatKnobMode = ThermostatKnobModes.DesiredTemp;

			// Style Thermostat Knob
			$("#thermostat-knob").trigger('configure', m_ThermostatKnobProperties.DesiredTemp);
			
			// Visualize
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


		SetHvacState: function(state) {
			DebugLog("[Set Hvac State]: " + state, 3);
			m_HvacState = state;
		},


		GetHvacState: function() {
			DebugLog("[Get Hvac State]: " + state, 3);
			return m_HvacState;
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
		//   - Offline
		//   - HvacOff
		//   - CurrentTemp
		//   - DesiredTemp
		SetThermostatMode: function(mode) {
			DebugLog("[Set Thermostat Mode]: " + mode, 3);

			if (mode == 'Offline') {

				// Reset the Confirmation Knob
				ResetConfirmationKnob();

				// Disable the Confirmation Knob
				m_ConfirmationKnobMode = ConfirmationKnobModes.Disabled;

				// Visualize
				ThermostatUI.VisualizeOffline();

			}

			else if (mode == 'HvacOff') {

				// Reset the Confirmation Knob
				ResetConfirmationKnob();

				// Disable the Confirmation Knob
				m_ConfirmationKnobMode = ConfirmationKnobModes.Disabled;

				// Visualize
				ThermostatUI.VisualizeHvacOff();

			}

			else if (mode == "CurrentTemp") {

				// Reset the Confirmation Knob
				ResetConfirmationKnob();

				// Disable the Confirmation Knob
				m_ConfirmationKnobMode = ConfirmationKnobModes.Disabled;

				// Visualize
				ThermostatUI.VisualizeCurrentTemp();

			}

			else if (mode == "DesiredTemp") {

				// Reset the Confirmation Knob
				ResetConfirmationKnob();

				// Visualize
				ThermostatUI.VisualizeDesiredTemp();

				// Enable the Confirmation Knob
				m_ConfirmationKnobMode = ConfirmationKnobModes.Ready;

				// Set up timer to display current temperature 
				ResetDisplayingDesiredTempTimeout();
			}
		},


		GetThermostatMode: function(mode) {
			if (m_ThermostatKnobMode == ThermostatKnobModes.Offline) {
				return 'Offline';
			}
			if (m_ThermostatKnobMode == ThermostatKnobModes.HvacOff) {
				return 'HvacOff';
			}
			if (m_ThermostatKnobMode == ThermostatKnobModes.CurrentTemp) {
				return 'CurrentTemp';
			}
			if (m_ThermostatKnobMode == ThermostatKnobModes.DesiredTemp) {
				return 'DesiredTemp';
			}
		}

	}; // Return

})();
