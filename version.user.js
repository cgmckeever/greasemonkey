/*

 XMLHttpRequest versioning
 version 0.1 BETA
 04-05-2006
 Copyright (c) 2006, Chris McKeever
 Released under the GPL license
 http://www.gnu.org/copyleft/gpl.html

 I try to monitor the Grease Monkey Mail List.
 http://www.mozdev.org/mailman/listinfo/greasemonkey
 Please post questions/comments and suggestions.

 This script allows versioning notification to end-users
 of scripts using the GM_xmlhttpRequest method
 a notification will appear once per version change

--------------------------------------------------------------------

 This is a Greasemonkey user script.

 To install, you need Greasemonkey: http://greasemonkey.mozdev.org/
 Then restart Firefox and revisit this script.
 Under Tools, there will be a new menu item to "Install User Script".
 Accept the default configuration and install.

 To uninstall, go to Tools/Manage User Scripts,
 select "XMLHttpRequest versioning", and click Uninstall.

--------------------------------------------------------------------


*/


// ==UserScript==
// @name            XMLHttpRequest versioning
// @namespace       http://r2unit.com/greasemonkey
// @description     XMLHttpRequest versioning
// @include         http://*.r2unit.com/*
// @include         http://r2unit.com/*
// ==/UserScript==

// points to where the most current version _should_ be found
var u_loc = 'http://www.r2unit.com/greasemonkey/version.user.js';
//  this version - this is what is keyed against on the remote call
var gms_version = "0.1";

// installed version
var i_version = GM_getValue('i_version',"");

if (i_version != gms_version){
	// different version that the pervious one ran
	GM_setValue('i_version',gms_version);
	GM_setValue('u_version',gms_version);
	alert('Settings have been updated');
}

// last found differing version
var u_version = GM_getValue('u_version');

GM_xmlhttpRequest({
	method: 'GET',
	url: u_loc,
    
	onload: function(responseDetails) {
		// truncate string after the gms_version declaration
		var s_pos = responseDetails.responseText.indexOf('gms_version') + 11;
		var c_version; 
		c_version = responseDetails.responseText.substring(s_pos);

		// find equal sign and remove
		var s_pos = c_version.indexOf('=') + 1;
		var e_pos = c_version.indexOf(';');
		c_version = c_version.substring(s_pos,e_pos);
		c_version = c_version.replace(/^\s*|\s*$/g,"");
		c_version = c_version.replace(/"/g,"");


		if (gms_version != c_version && u_version != c_version) {
			// both the last checked version and this version are
			// different that the current version available
			var update = confirm('Not Current Version (' + c_version + ')\nYou Should Update : ' + u_loc + '\n Click OK to update now');
			if (update == true){
				unsafeWindow.location = u_loc;
			}
			GM_setValue('u_version',c_version);
		}
    	}
});
