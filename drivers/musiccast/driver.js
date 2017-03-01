"use strict";

const request = require('request');
var hostIP = Homey.manager('settings').get('hostIP');

var devices = {};

/**
 * init driver
 * @param devices_data
 * @param callback
 */
module.exports.init = function (devices_data, callback) {
    devices_data.forEach(function (device_data) {
        try {
            initDevice(device_data);
        }
        catch (e) {
            //Nothing here, just catching errors
        }
    });

    callback();
};

/**
 * device has been added
 * @param device_data
 * @param callback
 */
module.exports.added = function (device_data, callback) {
    initDevice(device_data);
    callback(null, true);
};

/**
 * delete device
 * @param device_data
 * @param callback
 */
module.exports.deleted = function (device_data, callback) {
    delete devices[device_data.id];
    callback(null, true);
};

/**
 * pair device
 * @param socket
 */
module.exports.pair = function (socket) {
    // this method is run when Homey.emit('list_devices') is run on the front-end
    socket.on('list_devices', function (data, callback) {
        Homey.log("Yamaha receiver app - list_devices from ip " + hostIP);

        // try to get receiver's status via musiccast api
        api(hostIP, 'system', 'getDeviceInfo', function (device, error) {
            if (error) {
                callback(error);
                return;
            }

            // get device name
            api(hostIP, 'system', 'getNameText?id=main', function (name, error) {
                if (error) {
                    callback(error);
                    return;
                }

                // get features
                api(hostIP, 'system', 'getFeatures?id=main', function (features, error) {
                    if (error) {
                        callback(error);
                        return;
                    }

                    // read volume ranges
                    var ranges = {};
                    features.zone[0].range_step.forEach(function (range) {
                        ranges[range.id] = range;
                    });

                    // build device data
                    var device_data = {
                        name: name.text + ': ' + device.model_name,
                        data: {
                            id: device.device_id,
                            driver: 'musiccast',
                            name: device.model_name + ' - ' + name.text,
                            ipaddress: hostIP,
                            zone: 'main',
                            miracast: true,
                            ranges: ranges,
                            input_list: features.zone[0].input_list,
                            sound_program_list: features.zone[0].hasOwnProperty('sound_program_list') ? features.zone[0].sound_program_list : false
                        },
                        settings: {
                            ipaddress: hostIP
                        }
                    };

                    Homey.log('New device data:', device_data);

                    callback(null, [device_data]);
                });
            });
        });
    });

    // this is called when the user presses save settings button in start.html
    socket.on('get_devices', function (data, callback) {
        // Set passed pair settings in variables
        hostIP = data.ipaddress;
        Homey.log("Yamaha receiver app - got get_devices from front-end, hostIP =" + hostIP);

        module.exports.setSettings({
            ipaddress: hostIP
        });

        // assume IP is OK and continue
        socket.emit('continue', null);
    });

    socket.on('disconnect', function () {
        Homey.log("Yamaha receiver app - User aborted pairing, or pairing is finished");
    })
};

/**
 * save / change settings
 * @param device_data
 * @param newSettingsObj
 * @param oldSettingsObj
 * @param changedKeysArr
 * @param callback
 */
module.exports.settings = function (device_data, newSettingsObj, oldSettingsObj, changedKeysArr, callback) {
    try {
        // run when the user has changed the device's settings in Homey.
        // changedKeysArr contains an array of keys that have been changed, for your convenience :)

        // always fire the callback, or the settings won't change!
        // if the settings must not be saved for whatever reason:
        // callback( "Your error message", null );
        // else
        Homey.log('---Settings changed!')
        Homey.log(device_data)
        device_data.ipaddress = newSettingsObj.ipaddress;
        Homey.log(newSettingsObj)
        Homey.log(device_data)
        callback(null, true);
    }
    catch (e) {
        //Nothing here, just catching errors
    }
};

//Capabilities (i.e. mobile cards)
module.exports.capabilities = {
    onoff: {
        get: function (device_data, callback) {
            Homey.log('[' + device_data.name + '] GET onoff info');

            api(device_data.ipaddress, device_data.zone, 'getStatus', function (data) {
                Homey.log('[' + device_data.name + '] onoff info:', (data.power == 'on'));
                callback(null, (data.power == 'on'));
            });
        },
        set: function (device_data, onoff, callback) {
            Homey.log('[' + device_data.name + '] SET onoff:', onoff);

            var value = (onoff) ? 'on' : 'standby';
            api(device_data.ipaddress, device_data.zone, 'setPower?power=' + value);

            callback(null, onoff);
        }
    },
    volume_set: {
        get: function (device_data, callback) {
            Homey.log('[' + device_data.name + '] GET volume info');

            api(device_data.ipaddress, device_data.zone, 'getStatus', function (data) {
                Homey.log('[' + device_data.name + '] volume info:', data.volume);
                callback(null, data.volume);
            });
        },
        set: function (device_data, volume_set, callback) {
            var value = parseInt(volume_set * 100);
            Homey.log('[' + device_data.name + '] SET volume:', value);

            api(device_data.ipaddress, device_data.zone, 'setVolume?volume=' + value);
            callback(null, volume_set);
        }
    },
    volume_mute: {
        get: function (device_data, callback) {
            Homey.log('[' + device_data.name + '] GET mute info');

            api(device_data.ipaddress, device_data.zone, 'getStatus', function (data) {
                Homey.log('[' + device_data.name + '] mute info:', data.mute);
                callback(null, data.mute);
            });
        },
        set: function (device_data, volume_mute, callback) {
            Homey.log('[' + device_data.name + '] SET mute:', volume_mute);

            api(device_data.ipaddress, device_data.zone, 'setMute?enable=' + volume_mute);
            callback(null, volume_mute);
        }
    },
    source_selected: {
        get: function (device_data, callback) {
            Homey.log('[' + device_data.name + '] GET source info');

            api(device_data.ipaddress, device_data.zone, 'getStatus', function (data) {
                Homey.log('[' + device_data.name + '] source info:', data.input);
                callback(null, data.input);
            });
        },
        set: function (device_data, source, callback) {
            Homey.log('[' + device_data.name + '] SET source:', source);

            api(device_data.ipaddress, device_data.zone, 'setInput?input=' + source);
            callback(null, source);
        }
    },
    soundprogram_selected: {
        get: function (device_data, callback) {
            Homey.log('[' + device_data.name + '] GET sound program info');

            api(device_data.ipaddress, device_data.zone, 'getStatus', function (data) {
                Homey.log('[' + device_data.name + '] sound program info:', data.sound_program);
                callback(null, data.input);
            });
        },
        set: function (device_data, soundprogram, callback) {
            Homey.log('[' + device_data.name + '] SET sound program:', soundprogram);

            api(device_data.ipaddress, device_data.zone, 'setSoundProgram?program=' + soundprogram);
            callback(null, soundprogram);
        }
    }
};

/**
 * Yamaha extended control api
 * @param ip
 * @param zone
 * @param method
 * @param callback
 * @returns {*}
 */
function api(ip, zone, method, callback) {
    var url = 'http://' + ip + '/YamahaExtendedControl/v1/' + zone + '/' + method;
    Homey.log('[Request] ' + url);

    return request({
        method: 'GET',
        url: url,
        json: true
    }, function (error, response, body) {
        if (typeof(callback) == 'function') {
            callback(body, error);
        }
    });
}

/**
 * Helper: add device to device list
 * @param device_data
 */
function initDevice(device_data) {
    try {
        Homey.log('Subfunction InitDevice')
        devices[device_data.id] = {};
        devices[device_data.id].data = device_data;
    }
    catch (e) {
        //Nothing here, just catching errors
    }
}


/**
 * Flow: Power on
 */
module.exports.powerOn = function (callback, args) {
    Homey.log('[' + args.device.name + ']: Power on');
    api(args.device.ipaddress, args.device.zone, 'setPower?power=on', function (response, error) {
        callback(error, true);
    });
};

/**
 * Flow: Power off
 */
module.exports.powerOff = function (callback, args) {
    Homey.log('[' + args.device.name + ']: Power off');
    api(args.device.ipaddress, args.device.zone, 'setPower?power=standby', function (response, error) {
        callback(error, true);
    });
};

/**
 * Flow: change source
 */
module.exports.changeSource = function (callback, args) {
    Homey.log('[' + args.device.name + ']: Set source:', args.input.key);
    api(args.device.ipaddress, args.device.zone, 'setInput?input=' + args.input.key, function (response, error) {
        callback(error, true);
    });
};

/**
 * Flow: change surround mode
 */
module.exports.changeSurround = function (callback, args) {
    Homey.log('[' + args.device.name + ']: Set surround program:', args.input.key);
    api(args.device.ipaddress, args.device.zone, 'setSoundProgram?program=' + args.input.key, function (response, error) {
        callback(error, true);
    });
};

/**
 * Flow: Mute
 */
module.exports.mute = function (callback, args) {
    Homey.log('[' + args.device.name + ']: Mute');
    api(args.device.ipaddress, args.device.zone, 'setMute?enable=true', function (response, error) {
        callback(error, true);
    });
};

/**
 * Flow: Unmute
 */
module.exports.unMute = function (callback, args) {
    Homey.log('[' + args.device.name + ']: Unmute');
    api(args.device.ipaddress, args.device.zone, 'setMute?enable=false', function (response, error) {
        callback(error, true);
    });
};

/**
 * Flow: set volume
 */
module.exports.setVolume = function (callback, args) {
    Homey.log('[' + args.device.name + ']: Set volume', args.volume);
    api(args.device.ipaddress, args.device.zone, 'setVolume?volume=' + args.volume, function (response, error) {
        callback(error, true);
    });
};

/**
 * Flow: volume up
 */
module.exports.volumeUp = function (callback, args) {
    Homey.log('[' + args.device.name + ']: volume up by', args.volume);
    api(args.device.ipaddress, args.device.zone, 'setVolume?volume=up&step=' + args.volume, function (response, error) {
        callback(error, true);
    });
};

/**
 * Flow: volume down
 */
module.exports.volumeDown = function (callback, args) {
    Homey.log('[' + args.device.name + ']: volume down by', args.volume);
    api(args.device.ipaddress, args.device.zone, 'setVolume?volume=down&step=' + args.volume, function (response, error) {
        callback(error, true);
    });
};