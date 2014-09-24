var DropboxDB = (function () {

	var m_AppKey;
	var m_AccessToken;

	var m_Client;
	var m_NestyDatastore;
	var m_CommandsTable;

	return {

		Init: function () {
			m_AppKey = DROPBOX_APP_KEY;
			m_AccessToken = DROPBOX_ACCESS_TOKEN;


			// Client Object
			client = new Dropbox.Client({key: m_AppKey, token: m_AccessToken});
			

			// Authentication
			client.authenticate({interactive:false}, function (error) {
				if (error) {
					alert('Authentication error: ' + error);
				}
			});


			// Retrieve Datastore and Table
			if (client.isAuthenticated()) {

				DebugLog("authentication successful...", 2);

				client.getDatastoreManager().openOrCreateDatastore('nesty', function (error, datastore) { 
					if (error) {
						alert('Error opening the \'nesty\' datastore: ' + error);
						return;
					}

					m_NestyDatastore = datastore;
					m_CommandsTable = datastore.getTable('commands');
				});

			}
		}, // Init


		PrintTableContents: function( table, count ) {
			var records = table.query();
			records.sort(function (taskA, taskB) {
				if (taskA.get('issued_on') < taskB.get('issued_on')) return -1;
				if (taskA.get('issued_on') > taskB.get('issued_on')) return 1;
				return 0;
			});
			console.log("Last " + count + " rows of \'" + table.getId() + "\' table: ");
			for (var i = records.length - 1; i >= Math.max(0, records.length - count); i--) {
				var record = records[i];
				console.log("hvac_state: " + record.get('hvac_state') + ', ' + "desired_temp: " + record.get('desired_temp') + ', ' + record.get('issued_on'));
			}
		}, // PrintTableContents


		InsertThermostatCommands: function( hvacState, desiredTemp ) {
			// Validate
			if (["off", "cool", "heat"].indexOf(hvacState) == -1) {
				console.log("hvacState (" + hvacState + ") is not one of [off, cool, heat]");
				return;
			}

			// Insert row
			m_CommandsTable.insert({
				issued_on:     new Date(),
				hvac_state:    hvacState,
				desired_temp:  desiredTemp
			});

			// Debug print to console
			DropboxDB.PrintTableContents(m_CommandsTable, 1);
		}, // InsertThermostatCommands


		ResetCommandsTable: function() {
			$.each(m_CommandsTable.query(), function(i, v){
				v.deleteRecord();
			})
		} // ResetCommandsTable

	};

})();