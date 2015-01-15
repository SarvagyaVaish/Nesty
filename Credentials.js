// ---- ---- USAGE ---- ----
// 1. Fill out the keys and tokens listed in Step 1.
// 2. On a local server, launch the Nesty website and in the developer console
//    call the EncryptKeysAndTokens() method with the passphrase that you
//    would like to use to log into the website. 
// 3. Encrypted keys and tokens will be printed in the console. 
//    Copy that text and paste it under Step 2.
// 4. Erase the unencrypted keys you entered in Step 1.
// 5. Commit the file and upload to server.


// Step 1
var DROPBOX_APP_KEY = '';
var DROPBOX_ACCESS_TOKEN = '';

var SPARK_CORE_ID = '';
var SPARK_ACCESS_TOKEN = '';


// Step 2
var DROPBOX_APP_KEY_ENCRYPTED = 'U2FsdGVkX1+GNehSn5y+4Ci9UaN1uovyLsJOZ5aofRs=';
var DROPBOX_ACCESS_TOKEN_ENCRYPTED = 'U2FsdGVkX1/jh8zt06fI4f1KpY66LhrGKhR1e11/tH1NtYv5zNs4oJcfk58BK22aQdC0QMtUW13DvwRrPxTqQ128H0pa36m88JwhQnKTYZPlwJXUCi3sleKTD3KgGei+';
var SPARK_CORE_ID_ENCRYPTED = 'U2FsdGVkX1/Ct2fiw1otA6yWmFrgkU1DAogyrMzTvK2foHND8JkMuUVCnmLSAAOj';
var SPARK_ACCESS_TOKEN_ENCRYPTED = 'U2FsdGVkX18xZGDVqVygwR67axeCBgBWEQZhiZKGweaFRoz+FyU4JPEQIM+ao0NxCNqrsShbhdEI+pFO1g4TCQ==';


// This method uses a passphrase to encrypt keys and tokens
function EncryptKeysAndTokens(passphrase) {
	s = CryptoJS.AES.encrypt(DROPBOX_APP_KEY, passphrase).toString();
	console.log("var DROPBOX_APP_KEY_ENCRYPTED = '" + s + "';")

	s = CryptoJS.AES.encrypt(DROPBOX_ACCESS_TOKEN, passphrase).toString();
	console.log("var DROPBOX_ACCESS_TOKEN_ENCRYPTED = '" + s + "';")

	s = CryptoJS.AES.encrypt(SPARK_CORE_ID, passphrase).toString();
	console.log("var SPARK_CORE_ID_ENCRYPTED = '" + s + "';")

	s = CryptoJS.AES.encrypt(SPARK_ACCESS_TOKEN, passphrase).toString();
	console.log("var SPARK_ACCESS_TOKEN_ENCRYPTED = '" + s + "';")
}


// This method uses a passphrase to decrypt keys and tokens
function DecryptKeysAndTokens(passphrase) {
	temp = CryptoJS.AES.decrypt(DROPBOX_APP_KEY_ENCRYPTED, passphrase).toString();
	if (temp != "") {
		DROPBOX_APP_KEY = CryptoJS.AES.decrypt(DROPBOX_APP_KEY_ENCRYPTED, passphrase).toString(CryptoJS.enc.Utf8);
	}
	else {
		return false;
	}

	temp = CryptoJS.AES.decrypt(DROPBOX_ACCESS_TOKEN_ENCRYPTED, passphrase).toString();
	if (temp != "") {
		DROPBOX_ACCESS_TOKEN = CryptoJS.AES.decrypt(DROPBOX_ACCESS_TOKEN_ENCRYPTED, passphrase).toString(CryptoJS.enc.Utf8);
	}
	else {
		return false;
	}

	temp = CryptoJS.AES.decrypt(SPARK_CORE_ID_ENCRYPTED, passphrase).toString();
	if (temp != "") {
		SPARK_CORE_ID = CryptoJS.AES.decrypt(SPARK_CORE_ID_ENCRYPTED, passphrase).toString(CryptoJS.enc.Utf8);
	}
	else {
		return false;
	}

	temp = CryptoJS.AES.decrypt(SPARK_ACCESS_TOKEN_ENCRYPTED, passphrase).toString();
	if (temp != "") {
		SPARK_ACCESS_TOKEN = CryptoJS.AES.decrypt(SPARK_ACCESS_TOKEN_ENCRYPTED, passphrase).toString(CryptoJS.enc.Utf8);
	}
	else {
		return false;
	}

	return true;
}