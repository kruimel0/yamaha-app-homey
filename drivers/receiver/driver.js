//"use strict";

//Known issues: unneccessary triggering of tags (such as volume_mute)

var net = require('net');
var tempIP = '';
var tempZone = '';
var client;
var dropmenu = 0;
var request = require('request');
var hostIP = Homey.manager('settings').get( 'hostIP' );
var autoupdate = 0;

//Pairing information
var devices = {};
module.exports.init = function( devices_data, callback ) {
	devices_data.forEach(function(device_data){
	try{
        initDevice( device_data );
	}
	catch (e){
		//Nothing here, just catching errors
	}
    })

    callback();
}
// the `added` method is called is when pairing is done and a device has been added
module.exports.added = function( device_data, callback ) {
    initDevice( device_data );
    callback( null, true );
}

// the `delete` method is called when a device has been deleted by a user
module.exports.deleted = function( device_data, callback ) {
    delete devices[ device_data.id ];
    callback( null, true );
}

module.exports.pair = function (socket) {
	// socket is a direct channel to the front-end

	// this method is run when Homey.emit('list_devices') is run on the front-end
	// which happens when you use the template `list_devices`
	socket.on('list_devices', function (data, callback) {

		Homey.log("Yamaha receiver app - list_devices tempIP is " + tempIP + ", zone is " + hostZone);
		var device_data = {
            name: "New Device",
            data: {
                id: tempIP+hostZone,
				driver: "receiver",
				ipaddress: tempIP,
				zone: hostZone
            },
			settings: { "ipaddress": tempIP, "zone":hostZone }
        }
		var tempdataIDZone = device_data.data.id;
		Homey.log('Got IDZone '+tempdataIDZone)

        callback( null, [ device_data ] );

    })
/*
		var devices = [{
			data: {
				id			: tempIP,
				ipaddress 	: tempIP
			}
		}];

		callback (null, devices);

	});*/

	// this is called when the user presses save settings button in start.html
	socket.on('get_devices', function (data, callback) {

		// Set passed pair settings in variables
		tempIP = data.ipaddress;
		Homey.manager('settings').set( 'hostIP', data.ipaddress);
		Homey.manager('settings').set( 'Zone', data.zone);
		hostIP = tempIP;
		hostZone = data.zone;
		Homey.log ( "Yamaha receiver app - got get_devices from front-end, tempIP =" + hostIP );
		
			module.exports.setSettings({
			ipaddress: hostIP,
			zone: hostZone
			// just provide keys for the settings you want to change
			}, function( err, settings ){
			settings.ipaddress = hostIP;
			settings.zone = hostZone;
			})

			
		// assume IP is OK and continue
		socket.emit ('continue', null);

	});

	socket.on('disconnect', function(){
		Homey.log("Yamaha receiver app - User aborted pairing, or pairing is finished");
	})
}

//When settings are changed
module.exports.settings = function( device_data, newSettingsObj, oldSettingsObj, changedKeysArr, callback ) {
	try{
    // run when the user has changed the device's settings in Homey.
    // changedKeysArr contains an array of keys that have been changed, for your convenience :)

    // always fire the callback, or the settings won't change!
    // if the settings must not be saved for whatever reason:
    // callback( "Your error message", null );
    // else
		Homey.log('---Settings changed!')
	Homey.log(device_data)
	device_data.ipaddress = newSettingsObj.ipaddress;
	device_data.zone = newSettingsObj.zone;
	Homey.log(newSettingsObj)
	Homey.log(device_data)
    callback( null, true );
	}
	catch (e){
		//Nothing here, just catching errors
	}
}

//Capabilities (i.e. mobile cards)
module.exports.capabilities = {
    onoff: {
        get: function( device_data, callback ){
			Homey.log('GET onoff info');
			GetStatus(device_data.id);
			var device = getDeviceByData( device_data );
			if( device instanceof Error ) {return callback( device );}
			
			//My head hurts... this is a terrible workaround
			//Check and update capabilities every 20 seconds
			var seconds = 10, the_interval = seconds * 1000;
			setInterval(function() {
				//var tempdataIDZone = "192.168.2.11Main_Zone"
				Homey.log('dev %j',device)
				Homey.log('Testing to do capability update - 10s' + device.data.id)
				GetStatus(device.data)
			  // do your stuff here
			}, the_interval);
	
			callback( null, true )
        },
        set: function( device_data, onoff, callback ) {
			var device = getDeviceByData( device_data );
			if( device instanceof Error ) return callback( device );
			if (onoff == true){
				SendXMLToReceiver(device_data.ipaddress,'<YAMAHA_AV cmd="PUT"><'+device_data.zone+'><Power_Control><Power>On</Power></Power_Control></'+device_data.zone+'></YAMAHA_AV>');
			}
			else{
				SendXMLToReceiver(device_data.ipaddress,'<YAMAHA_AV cmd="PUT"><'+device_data.zone+'><Power_Control><Power>Standby</Power></Power_Control></'+device_data.zone+'></YAMAHA_AV>');
			}
			return callback( null, onoff );

        }
    },
    volume_set: {
        get: function( device_data, callback ){
			Homey.log('GET onoff info');
			GetStatus(device_data.id);
			var device = getDeviceByData( device_data );
			if( device instanceof Error ) {return callback( device );}
			callback( null, true )
        },
        set: function( device_data, volume_set, callback ) {
			var device = getDeviceByData( device_data );
			if( device instanceof Error ) return callback( device );
			var volDb = Math.round((volume_set)*192-160)*5;
			SendXMLToReceiver(device_data.ipaddress,'<YAMAHA_AV cmd="PUT"><'+device_data.zone+'><Volume><Lvl><Val>'+volDb+'</Val><Exp>1</Exp><Unit>dB</Unit></Lvl></Volume></'+device_data.zone+'></YAMAHA_AV>');
			return callback( null, volume_set );

        }
    },
    volume_mute: {
        // this function is called by Homey when it wants to GET the volume mute state, e.g. when the user loads the smartphone interface
        // `device_data` is the object as saved during pairing
        // `callback` should return the current value in the format callback( err, value )
        get: function( device_data, callback ){
			Homey.log('GET volume_mute info')
			//Initiatize muteStatus to 0
			var muteStatus = 0;
			//Check/set real value of muteStatus in the mean time
			GetStatus(device_data.id);
			//GetStatus(volume_mute);
            // send the volume mute value to Homey

            var device = getDeviceByData( device_data );
			if( device instanceof Error ) {return callback( device );}
			//return callback( null, muteStatus );
        },

        // this function is called by Homey when it wants to SET the volume mute state, e.g. when the user says 'red lights'
        // `device_data` is the object as saved during pairing
        // `dim` is the new value
        // `callback` should return the new value in the format callback( err, value )
        set: function( device_data, volume_mute, callback ) {
            
			var device = getDeviceByData( device_data );
			if( device instanceof Error ) return callback( device );

			//device.state.volume_mute = volume_mute;

			// here you would use a wireless technology to actually turn the device on or off
			if (volume_mute == true){
				SendXMLToReceiver(device_data.ipaddress,'<YAMAHA_AV cmd="PUT"><'+device_data.zone+'><Volume><Mute>On</Mute></Volume></'+device_data.zone+'></YAMAHA_AV>');
			}
			else{
				SendXMLToReceiver(device_data.ipaddress,'<YAMAHA_AV cmd="PUT"><'+device_data.zone+'><Volume><Mute>Off</Mute></Volume></'+device_data.zone+'></YAMAHA_AV>');
			}
			// also emit the new value to realtime
			// this produced Insights logs and triggers Flows
			// turned off as realtime is always used to trigger SET functions
			//module.exports.realtime( devices, 'volume_mute', volume_mute)
			return callback( null, volume_mute );

        }
	},
    source_selected: {
        get: function( device_data, callback ){
			var device = getDeviceByData( device_data );
			if( device instanceof Error ) {return callback( device );}
			GetStatus(device_data.id);
        },
        set: function( device_data, source, callback ) {
			var device = getDeviceByData( device_data );
			if( device instanceof Error ) return callback( device );
			SendXMLToReceiver(device_data.ipaddress,'<YAMAHA_AV cmd="PUT"><'+device_data.zone+'><Input><Input_Sel>'+source+'</Input_Sel></Input></'+device_data.zone+'></YAMAHA_AV>');
			return callback( null, source );

        }
    },
    soundprogram_selected: {
        get: function( device_data, callback ){
			var device = getDeviceByData( device_data );
			if( device instanceof Error ) {return callback( device );}
			GetStatus(device_data.id);
        },
        set: function( device_data, soundprogram, callback ) {
			var device = getDeviceByData( device_data );
			if( device instanceof Error ) return callback( device );
			if (soundprogram == 'Straight'){
				SendXMLToReceiver(device_data.ipaddress,'<YAMAHA_AV cmd="PUT"><'+device_data.zone+'><Surround><Program_Sel><Current><Straight>On</Straight></Current></Program_Sel></Surround></'+device_data.zone+'></YAMAHA_AV>');
				callback(null, true);
			} else{
				SendXMLToReceiver(device_data.ipaddress,'<YAMAHA_AV cmd="PUT"><'+device_data.zone+'><Surround><Program_Sel><Current><Straight>Off</Straight><Sound_Program>'+soundprogram+'</Sound_Program></Current></Program_Sel></Surround></'+device_data.zone+'></YAMAHA_AV>');
				callback(null, true);
			}
			return callback( null, source );

        }
    }
}

// a helper method to get a device from the devices list by it's device_data object
function getDeviceByData( device_data ) {
	try{
    var device = devices[ device_data.id ];
    if( typeof device === 'undefined' ) {
        return new Error("invalid_device");
    } else {
        return device;
    }
	}
	catch (e){
		//Nothing here, just catching errors
	}
}
// a helper method to add a device to the devices list
function initDevice( device_data ) {
	try{
	Homey.log('Subfunction InitDevice')
    devices[ device_data.id ] = {};
    GetStatus(device_data);
    devices[ device_data.id ].data = device_data;
	}
	catch (e){
		//Nothing here, just catching errors
	}
}
//Flow action handlers
//Homey.manager('flow').on('action.getStatus', function (callback, args){
//	GetStatus(args.device);
//    callback(null, true);
//});


module.exports.powerOn = function (callback, args) {
	module.exports.realtime( args.device, 'onoff', true)
    SendXMLToReceiver(args.device.ipaddress,'<YAMAHA_AV cmd="PUT"><'+args.device.zone+'><Power_Control><Power>On</Power></Power_Control></'+args.device.zone+'></YAMAHA_AV>');
	callback(null, true);
};
module.exports.powerOff = function (callback, args) {
	module.exports.realtime( args.device, 'onoff', false)
    SendXMLToReceiver(args.device.ipaddress,'<YAMAHA_AV cmd="PUT"><'+args.device.zone+'><Power_Control><Power>Standby</Power></Power_Control></'+args.device.zone+'></YAMAHA_AV>');
	callback(null, true);
};
module.exports.changeSource = function (callback, args) {
	module.exports.realtime( args.device, 'source_selected', args.input.name)
	SendXMLToReceiver(args.device.ipaddress,'<YAMAHA_AV cmd="PUT"><'+args.device.zone+'><Input><Input_Sel>'+args.input.name+'</Input_Sel></Input></'+args.device.zone+'></YAMAHA_AV>');
	callback(null, true);
};
module.exports.changeSurround = function (callback, args) {
	if (args.input.key == 'straight'){
		SendXMLToReceiver(args.device.ipaddress,'<YAMAHA_AV cmd="PUT"><'+args.device.zone+'><Surround><Program_Sel><Current><Straight>On</Straight></Current></Program_Sel></Surround></'+args.device.zone+'></YAMAHA_AV>');
		callback(null, true);
	} else{
		SendXMLToReceiver(args.device.ipaddress,'<YAMAHA_AV cmd="PUT"><'+args.device.zone+'><Surround><Program_Sel><Current><Straight>Off</Straight><Sound_Program>'+args.input.name+'</Sound_Program></Current></Program_Sel></Surround></'+args.device.zone+'></YAMAHA_AV>');
		callback(null, true);
	}
};
module.exports.mute = function (callback, args){
	Homey.log('Mute flow: %j',args.device)
	//devices[ args.device.id ].volume_mute.set = true;
	
	module.exports.realtime( args.device, 'volume_mute', true)
	//module.exports.capabilities.volume_mute = true;
	//devices[ args.device.id ].state = { volume_mute: true }
	SendXMLToReceiver(args.device.ipaddress,'<YAMAHA_AV cmd="PUT"><'+args.device.zone+'><Volume><Mute>On</Mute></Volume></'+args.device.zone+'></YAMAHA_AV>');
	callback(null, true);
};
module.exports.unMute = function (callback, args){
	//devices[ args.device.id ].state.set = { volume_mute: false };
	module.exports.realtime( args.device, 'volume_mute', false)
	SendXMLToReceiver(args.device.ipaddress,'<YAMAHA_AV cmd="PUT"><'+args.device.zone+'><Volume><Mute>Off</Mute></Volume></'+args.device.zone+'></YAMAHA_AV>');
	//GetStatus(args.device)
	callback(null, true);
};
module.exports.setVolume = function (callback, args){
	var targetVolume = args.volume;
	Homey.log ('target volume=' + targetVolume);
	var targetVolumedB = Math.round((targetVolume/100)*192-160)*5
	module.exports.realtime( args.device, 'volume_set', args.volume)
	SendXMLToReceiver(args.device.ipaddress,'<YAMAHA_AV cmd="PUT"><'+args.device.zone+'><Volume><Lvl><Val>'+targetVolumedB+'</Val><Exp>1</Exp><Unit>dB</Unit></Lvl></Volume></'+args.device.zone+'></YAMAHA_AV>');
	callback(null, true);
};
module.exports.volumeUp = function (callback, args){
	var targetVolume = args.volume;
	Homey.log ('target volume=' + targetVolume);
	SendXMLToReceiver(args.device.ipaddress,'<YAMAHA_AV cmd="PUT"><'+args.device.zone+'><Volume><Lvl><Val>Up '+targetVolume+' dB</Val><Exp></Exp><Unit></Unit></Lvl></Volume></'+args.device.zone+'></YAMAHA_AV>');	
	callback(null, true);
};
module.exports.volumeDown = function (callback, args){
	var targetVolume = args.volume;
	SendXMLToReceiver(args.device.ipaddress,'<YAMAHA_AV cmd="PUT"><'+args.device.zone+'><Volume><Lvl><Val>Down '+targetVolume+' dB</Val><Exp></Exp><Unit></Unit></Lvl></Volume></'+args.device.zone+'></YAMAHA_AV>');	
	callback(null, true);
};

// Driver specific flows.
Homey.manager('flow').on('action.ListControl_DirectSel', function (callback, args) {
	SendXMLToReceiver(args.device.ipaddress, '<YAMAHA_AV cmd="PUT"><' + args.input + '><List_Control><Direct_Sel>Line_' + args.line + '</Direct_Sel></List_Control></NET_RADIO></YAMAHA_AV>');
	callback(null, true);
});

//Set and get XML information
function SendXMLToReceiver (ipaddress,xml){
	try{
	Homey.log ("Yamaha receiver app - sending " + xml + " to " + hostIP);
    var latestPostHTTP = request
	.post({
        method: 'POST', 
        uri: 'http://'+ipaddress+'/YamahaRemoteControl/ctrl',
        body:xml
    })
	.on('response', function(response) {
    Homey.log(response.statusCode) // 200
    Homey.log(response.headers['content-type']) // 'image/png'
    Homey.log(response.body) // 'image/png'
	})
	Homey.log ("Lastest HTTP_send: %j",latestPostHTTP)	
	Homey.log ('callback true');
	}
	catch (e){
		//Nothing here, just catching errors
	}
};
function GetXMLFromReceiver (xml){
	try{
	Homey.log ("Yamaha receiver app - getting " + xml + " from " + hostIP);
    var latestGetHTTP = request
	.post({
        method: 'POST', 
        uri: 'http://'+hostIP+'/YamahaRemoteControl/ctrl',
        body:xml
    })
	.on('response', function(response) {
    Homey.log(response.statusCode) // 200
    Homey.log(response.headers['content-type']) // 'image/png'
    Homey.log(response.text) // 'image/png'
	})
	.on('data', function (chunk) {
    Homey.log('BODY: ' + chunk);
	});
	Homey.log ("Lastest HTTP_GET: %j",latestGetHTTP)
	}
	catch (e){
		//Nothing here, just catching errors
	}
};
//Get status and parse it --> this is the XML part.
function GetStatus (cap){
	try{
	if (typeof cap !== undefined){
		xml = '<YAMAHA_AV cmd="GET"><Main_Zone><Basic_Status>GetParam</Basic_Status></Main_Zone></YAMAHA_AV>';
		Homey.log ("Yamaha receiver app - status request " + xml + " from " + hostIP + 'with cap = ' +cap);
		var latestGetHTTP = request
		.post({
			method: 'POST', 
			uri: 'http://'+hostIP+'/YamahaRemoteControl/ctrl',
			body:xml
		})
		.on('response', function(response) {
			//Check if status is 200 (toDO)
			Homey.log('Response status (200 is okay): '+response.statusCode) // 200
		})
		.on('data', function (chunk) {
			Homey.log('Full BODY: ' + chunk);
			
			//Regexp the result - Mute
			var str = String(chunk);
			var regexp = /Lvl><Mute>((On|Off))<\/Mute/i;
			var matches_array = str.match(regexp);
			//Make muteStatus binary: 1 is on, 0 is off.
			if (matches_array !== null ){
				var muteStatus = matches_array[1].replace('On',1);
				muteStatus = muteStatus.replace('Off',0);
			}
			
			//Regexp the result - Volume value
			var regexp = /<Volume><Lvl><Val>(.?([0-9])*)<\/Val/i;
			var matches_array = str.match(regexp);
			if (matches_array !== null ){
				var volumeStatus = matches_array[1];
				//Set volumeStatus to 0-1 float value
				volumeStatus=((volumeStatus/5)+160)/192;
			}
					
			//Regexp the result - current input
			var regexp = /<Input><Input_Sel>(.*?)<\/Input_Sel>/i;
			var matches_array = str.match(regexp);
			if (matches_array !== null ){
				var inputStatus = matches_array[1];
			}
			
			//Regexp the result - sourceName
			var regexp = /<Src_Name>(.*?)<\/Src_Name>/i;
			var matches_array = str.match(regexp);
			if (matches_array !== null ){
				var sourceNameStatus = matches_array[1];
			}
			
			//Regexp the result - onoff state
			var regexp = /Power_Control><Power>(.*?)<\/Power>/i;
			var matches_array = str.match(regexp);
			//Make onoffStatus binary: 1 is on, 0 is off.
			if (matches_array !== null ){
				var onoffStatus = matches_array[1].replace('On',1);
				onoffStatus = onoffStatus.replace('Off',0);
			}
			
			//Regexp the result - sleep state
			var regexp = /Power><Sleep>(.*?)<\/Sleep>/i;
			var matches_array = str.match(regexp);
			//Make sleepStatus binary: 1 is on, 0 is off.
			if (matches_array !== null ){
				var sleepStatus = matches_array[1].replace('On',1);
				sleepStatus = sleepStatus.replace('Off',0);
			}
			
			//Regexp the result - straight option
			var regexp = /<Straight>(.*?)<\/Straight>/i;
			var matches_array = str.match(regexp);
			//Make straightStatus binary: 1 is on, 0 is off.
			if (matches_array !== null ){
				var straightStatus = matches_array[1].replace('On',1);
				straightStatus = straightStatus.replace('Off',0);
			}
			
			//Regexp the result - enhancer option
			var regexp = /<Enhancer>(.*?)<\/Enhancer>/i;
			var matches_array = str.match(regexp);
			//Make straightStatus binary: 1 is on, 0 is off.
			if (matches_array !== null ){
				var enhancerStatus = matches_array[1].replace('On',1);
				enhancerStatus = enhancerStatus.replace('Off',0);
			}
			
			//Regexp the result - soundProgram
			var regexp = /<Sound_Program>(.*?)<\/Sound_Program>/i;
			var matches_array = str.match(regexp);
			if (matches_array !== null ){
				var soundProgramStatus = matches_array[1];
			}
			
			//Regexp the result - bassValue
			var regexp = /<Bass><Val>(.*?)<\/Val>/i;
			var matches_array = str.match(regexp);
			if (matches_array !== null ){
				var bassValueStatus = matches_array[1];
			}
			
			//Regexp the result - trebleValue
			var regexp = /<Treble><Val>(.*?)<\/Val>/i;
			var matches_array = str.match(regexp);
			if (matches_array !== null ){
				var trebleValueStatus = matches_array[1];
			}
			
			//Test regexp which is wrong forsure
			var regexp = /<Trebless><Val>(.*?)<\/Val>/i;
			var matches_array = str.match(regexp);
			if (matches_array !== null ){
				var trebleValueStatus2 = matches_array[1];
			}
			Homey.log("--------------------------------- Error avoided!")
			
			//Give a log of the results
			Homey.log('---------------------------------------------')
			Homey.log('Mute Status: '+muteStatus);
			Homey.log('Volume Status: '+volumeStatus);
			Homey.log('Input Status: '+inputStatus);
			Homey.log('Onoff Status: '+onoffStatus);
			Homey.log('Sleep Status: '+sleepStatus);
			Homey.log('Source Name Status: '+sourceNameStatus);
			Homey.log('Straight Status: '+straightStatus);
			Homey.log('Enhancer Status: '+enhancerStatus);
			Homey.log('Sound Program Status: '+soundProgramStatus);
			Homey.log('Bass value Status: '+bassValueStatus);
			Homey.log('Treble value Status: '+trebleValueStatus);
			Homey.log('Wrong value test: '+trebleValueStatus2);
			
			//Capabilities part
			//Changing all capabilities - too much, but no workaround at the moment
			if (cap !== 0) {
				//Homey.log('Capabilities part in GetStatus part %j - %j',cap,muteStatus)
				//var device = getDeviceByData( cap )
				//Homey.log('Current volume_mute status: '+device)
				if (muteStatus == 0){module.exports.realtime( cap, 'volume_mute', false)}
				else{module.exports.realtime( cap, 'volume_mute', true)}
				
				if (onoffStatus == 0){module.exports.realtime( cap, 'onoff', false)}
				else{module.exports.realtime( cap, 'onoff', true)}
				
				if (typeof inputStatus !== undefined){
					module.exports.realtime( cap, 'source_selected', String(inputStatus))
				} else {module.exports.realtime( cap, 'source_selected', "Nothing found")}
				if (typeof soundProgramStatus !== undefined){
					module.exports.realtime( cap, 'soundprogram_selected', String(soundProgramStatus))
				} else {module.exports.realtime( cap, 'soundprogram_selected', "Nothing found")}
				if (typeof volumeStatus !== undefined){
					module.exports.realtime( cap, 'volume_set', volumeStatus)
				} else {module.exports.realtime( cap, 'volume_set', 0)}
			};
			
	});
	
	}
	}
	catch (e){
		//Nothing here, just catching errors
	}
};
