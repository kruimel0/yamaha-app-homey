//"use strict";

var net = require('net');
var tempIP = '';
var client;
var dropmenu = 0;
//var Promise = require("bluebird");
//var xml2js = Promise.promisifyAll(require("xml2js"));

//var request = Promise.promisify(require("request"));
//Promise.promisifyAll(request);
var request = require('request');

var allPossibleInputs = [
		{	inputName: 'HDMI1',
	 		friendlyName: "HDMI1"
		},
		{	inputName: 'HDMI2',
	 		friendlyName: "HDMI2"
		},
		{	inputName: 'HDMI3',
	 		friendlyName: "HDMI3"
		},
		{	inputName: 'HDMI4',
	 		friendlyName: "HDMI4"
		},
		{	inputName: 'HDMI5',
	 		friendlyName: "HDMI5"
		},
		{	inputName: 'AV1',
	 		friendlyName: "AV1"
		},
		{	inputName: 'AV2',
	 		friendlyName: "AV2"
		},
		{	inputName: 'AV3',
	 		friendlyName: "AV3"
		},
		{	inputName: 'AV4',
	 		friendlyName: "AV4"
		},
		{	inputName: 'AV5',
	 		friendlyName: "AV5"
		},
		{	inputName: 'AV6',
	 		friendlyName: "AV6"
		},
		{	inputName: 'TUNER',
	 		friendlyName: "TUNER"
		},
		{	inputName: 'V-AUX',
	 		friendlyName: "V-AUX"
		},
		{	inputName: 'SERVER',
	 		friendlyName: "SERVER"
		},
		{	inputName: 'NET RADIO',
	 		friendlyName: "NET RADIO"
		},
		{	inputName: 'USB',
	 		friendlyName: "USB"
		},
		{	inputName: 'Spotify',
	 		friendlyName: "Spotify"
		},
		{	inputName: 'AirPlay',
	 		friendlyName: "AirPlay"
		}
];
var allPossibleInputsSurround = [
		{	inputName: 'Straight',
	 		friendlyName: "Straight"
		},
		{	inputName: '7ch Stereo',
	 		friendlyName: "7ch Stereo"
		},
		{	inputName: 'Action Game',
	 		friendlyName: "Action Game"
		},
		{	inputName: 'Roleplaying Game',
	 		friendlyName: "Roleplaying Game"
		},
		{	inputName: 'Music Video',
	 		friendlyName: "Music Video"
		},
		{	inputName: 'Standard',
	 		friendlyName: "Standard"
		},
		{	inputName: 'Spectacle',
	 		friendlyName: "Spectacle"
		},
		{	inputName: 'Sci-Fi',
	 		friendlyName: "Sci-Fi"
		},
		{	inputName: 'Adventure',
	 		friendlyName: "Adventure"
		},
		{	inputName: 'Drama',
	 		friendlyName: "Drama"
		},
		{	inputName: 'Hall in Munich',
	 		friendlyName: "Hall in Munich"
		},
		{	inputName: 'Hall in Vienna',
	 		friendlyName: "Hall in Vienna"
		},
		{	inputName: 'Chamber',
	 		friendlyName: "Chamber"
		},
		{	inputName: 'Cellar Club',
	 		friendlyName: "Cellar Club"
		},
		{	inputName: 'The Roxy Theatre',
	 		friendlyName: "The Roxy Theatre"
		},
		{	inputName: 'The Bottom Line',
	 		friendlyName: "The Bottom Line"
		},
		{	inputName: 'Sports',
	 		friendlyName: "Sports"
		},
		{	inputName: 'Mono Movie',
	 		friendlyName: "Mono Movie"
		},
		{	inputName: '2ch Stereo',
	 		friendlyName: "2ch Stereo"
		},
		{	inputName: 'Surround Decoder',
	 		friendlyName: "Surround Decoder"
		}
];
module.exports.pair = function (socket) {
	// socket is a direct channel to the front-end

	// this method is run when Homey.emit('list_devices') is run on the front-end
	// which happens when you use the template `list_devices`
	socket.on('list_devices', function (data, callback) {

		Homey.log("Yamaha receiver app - list_devices tempIP is " + tempIP);
		
		//Execute !xECNQSTN to get type number as name?
		var devices = [{
			data: {
				id			: tempIP,
				ipaddress 	: tempIP
			}
		}];

		callback (null, devices);

	});

	// this is called when the user presses save settings button in start.html
	socket.on('get_devices', function (data, callback) {

		// Set passed pair settings in variables
		tempIP = data.ipaddress;
		hostIP=tempIP;
		Homey.log ( "Yamaha receiver app - got get_devices from front-end, tempIP =" + hostIP );

		// assume IP is OK and continue
		socket.emit ('continue', null);

	});

	socket.on('disconnect', function(){
		Homey.log("Yamaha receiver app - User aborted pairing, or pairing is finished");
	})
}

// flow action handlers
Homey.manager('flow').on('action.powerOn', function (callback, args) {
    SendXMLToReceiver('<YAMAHA_AV cmd="PUT"><Main_Zone><Power_Control><Power>On</Power></Power_Control></Main_Zone></YAMAHA_AV>');
});
Homey.manager('flow').on('action.powerOff', function (callback, args) {
    SendXMLToReceiver('<YAMAHA_AV cmd="PUT"><Main_Zone><Power_Control><Power>Standby</Power></Power_Control></Main_Zone></YAMAHA_AV>');
});
Homey.manager('flow').on('action.changeSource', function (callback, args) {
	SendXMLToReceiver('<YAMAHA_AV cmd="PUT"><Main_Zone><Input><Input_Sel>'+args.input.inputName+'</Input_Sel></Input></Main_Zone></YAMAHA_AV>');
});
Homey.manager('flow').on('action.changeSurround', function (callback, args) {
	if (args.input.inputName == 'Straight'){
		SendXMLToReceiver('<YAMAHA_AV cmd="PUT"><Main_Zone><Surround><Program_Sel><Current><Straight>On</Straight></Current></Program_Sel></Surround></Main_Zone></YAMAHA_AV>')
	} else{
		SendXMLToReceiver('<YAMAHA_AV cmd="PUT"><Main_Zone><Surround><Program_Sel><Current><Straight>Off</Straight><Sound_Program>'+args.input.inputName+'</Sound_Program></Current></Program_Sel></Surround></Main_Zone></YAMAHA_AV>');
	}
});
Homey.manager('flow').on('action.mute', function (callback, args){
	SendXMLToReceiver('<YAMAHA_AV cmd="PUT"><Main_Zone><Volume><Mute>On</Mute></Volume></Main_Zone></YAMAHA_AV>');
});
Homey.manager('flow').on('action.unMute', function (callback, args){
	SendXMLToReceiver('<YAMAHA_AV cmd="PUT"><Main_Zone><Volume><Mute>Off</Mute></Volume></Main_Zone></YAMAHA_AV>');
});
Homey.manager('flow').on('action.setVolume', function (callback, args){
	var targetVolume = args.volume;
	Homey.log ('target volume=' + targetVolume);
	var targetVolumedB = Math.round((targetVolume/100)*192-160)*5
	//for(var i=100;i>2;i-=2){
	//	SendXMLToReceiver('<YAMAHA_AV cmd="PUT"><Main_Zone><Volume><Lvl><Val>Down '+i+' dB</Val><Exp></Exp><Unit></Unit></Lvl></Volume></Main_Zone></YAMAHA_AV>');
	//}
	//setTimeout(function() {Homey.log('Waiting 3s');}, 5000);
	SendXMLToReceiver('<YAMAHA_AV cmd="PUT"><Main_Zone><Volume><Lvl><Val>'+targetVolumedB+'</Val><Exp>1</Exp><Unit>dB</Unit></Lvl></Volume></Main_Zone></YAMAHA_AV>');
});

Homey.manager('flow').on('action.volumeUp', function (callback, args){
	var targetVolume = args.volume;
	Homey.log ('target volume=' + targetVolume);
	SendXMLToReceiver('<YAMAHA_AV cmd="PUT"><Main_Zone><Volume><Lvl><Val>Up '+targetVolume+' dB</Val><Exp></Exp><Unit></Unit></Lvl></Volume></Main_Zone></YAMAHA_AV>');	
});

Homey.manager('flow').on('action.volumeDown', function (callback, args){
	var targetVolume = args.volume;
	SendXMLToReceiver('<YAMAHA_AV cmd="PUT"><Main_Zone><Volume><Lvl><Val>Down '+targetVolume+' dB</Val><Exp></Exp><Unit></Unit></Lvl></Volume></Main_Zone></YAMAHA_AV>');	
});

function SendXMLToReceiver (xml){
	Homey.log ("Yamaha receiver app - sending " + xml + " to " + hostIP);
    request.post({
        method: 'POST', 
        uri: 'http://'+hostIP+'/YamahaRemoteControl/ctrl',
        body:xml
    })
	Homey.log ('callback true');
};



function GetXMLFromReceiver (xml){
	Homey.log ("Yamaha receiver app - getting " + xml + " from " + hostIP);
    var latestGetHTTP = request.get({
        method: 'GET', 
        uri: 'http://'+hostIP+'/YamahaRemoteControl/ctrl',
        body:xml
    })
	Homey.log ("Lastest HTTP_GET:"+latestGetHTTP)
	
};
Homey.manager('flow').on('action.changeSource.input.autocomplete', function (callback, value) {
	var inputSearchString = value.query;
	var items = searchForInputsByValueSource( inputSearchString );
	callback(null, items);
});
Homey.manager('flow').on('condition.inputselected.input.autocomplete', function (callback, value) {
	var inputSearchString = value.query;
	var items = searchForInputsByValueSource( inputSearchString );
	callback(null, items);
});
Homey.manager('flow').on('action.changeSurround.input.autocomplete', function (callback, value) {
	var inputSearchString = value.query;
	var items = searchForInputsByValueSurround( inputSearchString );
	callback(null, items);
});
Homey.manager('flow').on('condition.inputselected.input.autocomplete', function (callback, value) {
	var inputSearchString = value.query;
	var items = searchForInputsByValueSurround( inputSearchString );
	callback(null, items);
});
function searchForInputsByValueSource ( value ) {
	var possibleInputs = allPossibleInputs;
	var tempItems = [];
	for (var i = 0; i < possibleInputs.length; i++) {
		var tempInput = possibleInputs[i];
		if ( tempInput.friendlyName.indexOf(value) >= 0 ) {
			tempItems.push({ icon: "", name: tempInput.friendlyName, inputName: tempInput.inputName });
		}
	}
	return tempItems;
};
function searchForInputsByValueSurround ( value ) {
	var possibleInputs = allPossibleInputsSurround;
	var tempItems = [];
	for (var i = 0; i < possibleInputs.length; i++) {
		var tempInput = possibleInputs[i];
		if ( tempInput.friendlyName.indexOf(value) >= 0 ) {
			tempItems.push({ icon: "", name: tempInput.friendlyName, inputName: tempInput.inputName });
		}
	}
	return tempItems;
};