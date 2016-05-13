# Yamaha receiver app for Athom Homey

Version 0.1.0

Control your Yamaha network-enabled receiver using the Homey by Athom B.V.

Currently working:
* Turning receiver on/off
* Mute/unmute receiver
* Increase/decrease volume
* Set volume to a certain value
* Change source of receiver
* Change music equaliser settings of receiver

Turning receiver on this way takes 10-20 seconds, take care of this when using in a flow with something else (i.e., delay a command to change the receiver input if you want 1 flow to both turn the receiver on and change the input).

Important!
Before you can use it to turn your receiver on, you should go to the settings on your receiver's webpage (enter the IP adres in a browser), and go to settings -> Network Standby -> Select 'On'.
If you do not find these settings, take a look at this site, which might help you: http://userscripts-mirror.org/scripts/show/182663

You need to have the (local) IP-address of your receiver to add the device to Homey (There is no discovery)

Use at your own risk, I accept no responsibility for any damages caused by using this script.

Version update:
0.1.0:
Fixed settings being destroyed upon restart
Added nice green check-mark in flows
