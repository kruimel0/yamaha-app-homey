"use strict";

/**
 * Init Yamaha App
 */
module.exports.init = function() {
    initFlows();
    initAutocompletes();

    Homey.log("Yamaha app - init done");
};

/**
 * Init Flows
 */
function initFlows() {
    /**
     * Flow: Power on
     */
    Homey.manager('flow').on('action.powerOn', function (callback, args) {
        if(!args.hasOwnProperty('device') || !args.device.hasOwnProperty('driver')) {
            callback(false);
            return;
        }
        Homey.manager('drivers').getDriver(args.device.driver).powerOn(callback, args);
    });

    /**
     * Flow: Power off
     */
    Homey.manager('flow').on('action.powerOff', function (callback, args) {
        if(!args.hasOwnProperty('device') || !args.device.hasOwnProperty('driver')) {
            callback(false);
            return;
        }
        Homey.manager('drivers').getDriver(args.device.driver).powerOff(callback, args);
    });

    /**
     * Flow: change source
     */
    Homey.manager('flow').on('action.changeSource', function (callback, args) {
        if(!args.hasOwnProperty('device') || !args.device.hasOwnProperty('driver')) {
            callback(false);
            return;
        }
        Homey.manager('drivers').getDriver(args.device.driver).changeSource(callback, args);
    });

    /**
     * Flow: change surround mode
     */
    Homey.manager('flow').on('action.changeSurround', function (callback, args) {
        if(!args.hasOwnProperty('device') || !args.device.hasOwnProperty('driver')) {
            callback(false);
            return;
        }

        Homey.manager('drivers').getDriver(args.device.driver).changeSurround(callback, args);
    });

    /**
     * Flow: Mute
     */
    Homey.manager('flow').on('action.mute', function (callback, args) {
        if(!args.hasOwnProperty('device') || !args.device.hasOwnProperty('driver')) {
            callback(false);
            return;
        }
        Homey.manager('drivers').getDriver(args.device.driver).mute(callback, args);
    });

    /**
     * Flow: Unmute
     */
    Homey.manager('flow').on('action.unMute', function (callback, args) {
        if(!args.hasOwnProperty('device') || !args.device.hasOwnProperty('driver')) {
            callback(false);
            return;
        }
        Homey.manager('drivers').getDriver(args.device.driver).unMute(callback, args);
    });

    /**
     * Flow: set volume
     */
    Homey.manager('flow').on('action.setVolume', function (callback, args) {
        if(!args.hasOwnProperty('device') || !args.device.hasOwnProperty('driver')) {
            callback(false);
            return;
        }
        Homey.manager('drivers').getDriver(args.device.driver).setVolume(callback, args);
    });

    /**
     * Flow: volume up
     */
    Homey.manager('flow').on('action.volumeUp', function (callback, args) {
        if(!args.hasOwnProperty('device') || !args.device.hasOwnProperty('driver')) {
            callback(false);
            return;
        }
        Homey.manager('drivers').getDriver(args.device.driver).volumeUp(callback, args);
    });

    /**
     * Flow: volume down
     */
    Homey.manager('flow').on('action.volumeDown', function (callback, args) {
        if(!args.hasOwnProperty('device') || !args.device.hasOwnProperty('driver')) {
            callback(false);
            return;
        }
        Homey.manager('drivers').getDriver(args.device.driver).volumeDown(callback, args);
    });
}

/**
 * Init Autocomplete
 */
function initAutocompletes() {
    var allPossibleInputs = [
        {	key: 'hdmi1',
            name: 'HDMI1'
        },
        {	key: 'hdmi2',
            name: 'HDMI2'
        },
        {	key: 'hdmi3',
            name: 'HDMI3'
        },
        {	key: 'hdmi4',
            name: 'HDMI4'
        },
        {	key: 'hdmi5',
            name: 'HDMI5'
        },
        {	key: 'hdmi6',
            name: 'HDMI6'
        },
        {	key: 'hdmi7',
            name: 'HDMI7'
        },
        {	key: 'hdmi8',
            name: 'HDMI8'
        },
        {	key: 'av1',
            name: 'AV1'
        },
        {	key: 'av2',
            name: 'AV2'
        },
        {	key: 'av3',
            name: 'AV3'
        },
        {	key: 'av4',
            name: 'AV4'
        },
        {	key: 'av5',
            name: 'AV5'
        },
        {	key: 'av6',
            name: 'AV6'
        },
        {	key: 'audio1',
            name: 'AUDIO1'
        },
        {	key: 'audio2',
            name: 'AUDIO2'
        },
        {	key: 'audio3',
            name: 'AUDIO3'
        },
        {	key: 'tuner',
            name: 'TUNER'
        },
        {	key: 'aux',
            name: 'V-AUX'
        },
        {	key: 'server',
            name: 'SERVER'
        },
        {	key: 'net_radio',
            name: 'NET RADIO'
        },
        {	key: 'usb',
            name: 'USB'
        },
        {	key: 'bluetooth',
            name: 'Bluetooth'
        },
        {	key: 'spotify',
            name: 'Spotify'
        },
        {	key: 'juke',
            name: 'Juke!'
        },
        {	key: 'airplay',
            name: 'AirPlay'
        },
        {	key: 'mc_link',
            name: 'MusicCast Link'
        }
    ];
    var allPossibleInputsSurround = [
        {	key: 'staight',
            name: 'Straight'
        },
        {	key: '2ch_stereo',
            name: '2ch Stereo'
        },
        {	key: '5ch_stereo',
            name: '5ch Stereo'
        },
        {	key: '7ch_stereo',
            name: '7ch Stereo'
        },
        {	key: 'action_game',
            name: 'Action Game'
        },
        {	key: 'roleplaying_game',
            name: 'Roleplaying Game'
        },
        {	key: 'music_video',
            name: 'Music Video'
        },
        {	key: 'standard',
            name: 'Standard'
        },
        {	key: 'spectacle',
            name: 'Spectacle'
        },
        {	key: 'sci-fi',
            name: 'Sci-Fi'
        },
        {	key: 'adventure',
            name: 'Adventure'
        },
        {	key: 'drama',
            name: 'Drama'
        },
        {	key: 'munich',
            name: 'Hall in Munich'
        },
        {	key: 'vienna',
            name: 'Hall in Vienna'
        },
        {	key: 'chamber',
            name: 'Chamber'
        },
        {	key: 'cellar_club',
            name: 'Cellar Club'
        },
        {	key: 'roxy_theatre',
            name: 'The Roxy Theatre'
        },
        {	key: 'bottom_line',
            name: 'The Bottom Line'
        },
        {	key: 'sports',
            name: 'Sports'
        },
        {	key: 'mono_movie',
            name: 'Mono Movie'
        },
        {	key: 'surr_decoder',
            name: 'Surround Decoder'
        }
    ];

    /**
     * Sources
     */
    Homey.manager('flow').on('action.changeSource.input.autocomplete', function (callback, value) {
        var inputSearchString = value.query;
        var items = searchForInputsByValueSource( inputSearchString );
        callback(null, items);
    });

    /**
     * Surround options
     */
    Homey.manager('flow').on('action.changeSurround.input.autocomplete', function (callback, value) {
        var inputSearchString = value.query;
        var items = searchForInputsByValueSurround( inputSearchString );
        callback(null, items);
    });

    /**
     * Helper: Search for sources
     * @param value
     * @returns {Array}
     */
    function searchForInputsByValueSource ( value ) {
        var possibleInputs = allPossibleInputs;
        var tempItems = [];
        for (var i = 0; i < possibleInputs.length; i++) {
            var tempInput = possibleInputs[i];
            if ( tempInput.name.indexOf(value) >= 0 ) {
                tempItems.push({ icon: "", name: tempInput.name, key: tempInput.key });
            }
        }
        return tempItems.sort(sortByName);
    }

    /**
     * Helper: Search for surround options
     * @param value
     * @returns {Array}
     */
    function searchForInputsByValueSurround ( value ) {
        var possibleInputs = allPossibleInputsSurround;
        var tempItems = [];
        for (var i = 0; i < possibleInputs.length; i++) {
            var tempInput = possibleInputs[i];
            if ( tempInput.name.indexOf(value) >= 0 ) {
                tempItems.push({ icon: "", name: tempInput.name, key: tempInput.key });
            }
        }

        return tempItems.sort(sortByName);
    }

    /**
     * Helper: Sort array by object name
     * @param a
     * @param b
     * @returns {number}
     */
    function sortByName(a,b) {
        if (a.name < b.name)
            return -1;
        if (a.name > b.name)
            return 1;
        return 0;
    }
}