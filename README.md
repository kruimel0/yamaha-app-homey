# Yamaha receiver app for Athom Homey
Control your Yamaha network-enabled receiver using the Homey by Athom B.V.

Important!
Before you can use it to turn your receiver on, you should go to the settings on your receiver's webpage (enter the IP adres in a browser), and go to settings -> Network Standby -> Select 'On'.
If you do not find these settings, take a look at this site, which might help you: http://userscripts-mirror.org/scripts/show/182663

You need to have the (local) IP-address of your receiver to add the device to Homey (There is no discovery)

Use at your own risk, I accept no responsibility for any damages caused by using this script.

# Donations
Are always appreciated :)
[![](https://www.paypalobjects.com/en_US/NL/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=CWQL5MRKGHH5U)

# Changelog

##### Version 0.3.1 (beta)
- Adding Flow Action: Select a specific line within a menu (only for menu based inputs like Net Radio, Server, USB).
- Fixed incorrect behavior on the Flows page (actions where listed below Apps instead of Devices).
- Note: Re-adding of the receiver is necessary! Sorry for this.

##### Version 0.3.0
- Adding support of MusicCast devices and partial re-write of the app following from this.
Huge thanks to Frank for the integration!

##### Version 0.2.5
- Fixed not auto-reconnecting on Homey restart

##### Version 0.2.1 - Version 0.2.4
- Bugfixes

##### Version 0.2.0
*Big rewrite of the app.
YOU MUST REMOVE THE RECEIVER FROM THE HOMEY DEVICES AND RE-ADD IT!*

Added functionality:
* Mobile cards to turn on/off, change volume, change source
* Support of the global tags for onoff, volume level, mute status, source status, surround status
* Support for multiple zones of the receiver (Main_Zone, Zone_2, etc)
* More source possibilities (f.e. HDMI6-8)

##### Version 0.1.1
- Update capabilities crash v0.9.x

##### Version 0.1.0

Currently working:
- Turning receiver on/off
- Mute/unmute receiver
- Increase/decrease volume
- Set volume to a certain value
- Change source of receiver
- Change music equaliser settings of receiver
    - Turning receiver on this way takes 10-20 seconds, take care of this when using in a flow with something else (i.e., delay a command to change the receiver input if you want 1 flow to both turn the receiver on and change the input).
- Fixed settings being destroyed upon restart
- Added nice green check-mark in flows
