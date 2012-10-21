/*
 Highlight Text to Clipboard
 version 0.1 BETA
 04-05-2006
 Copyright (c) 2006, Chris McKeever
 Released under the GPL license
 http://www.gnu.org/copyleft/gpl.html

 I try to monitor the Grease Monkey Mail List.
 http://www.mozdev.org/mailman/listinfo/greasemonkey
 Please post questions/comments and suggestions.


 This is an experimental test to provide the automatic copy to clipboard 
 of highlighted text as found in most linux distributions.  It has been tested with FF-Windows

 If you do not specify the domain to be used (using the grease monkey menu Highlight-Copy Site)
 This script will be actie on every site.  Due to the security issues with this script.  It 
 Will prompt you before accessing the priviledged function calls.

 Until the script is signed - in order to use it, you need to change a config setting in about:config
 user_pref("signed.applets.codebase_principal_support", true);
 Please be aware of the security issues which go along with this change.

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
// @name            Highlight Copy
// @namespace       http://r2unit.com/greasemonkey
// @description     Copies selection to clipboard
// @include         http://*
// ==/UserScript==

GM_registerMenuCommand('Highlight-Copy Site',set_site);

function set_site(){
	var site = GM_getValue('site');

	if (!site) site = window.location.host;

	var new_site=prompt('Set Active Domain:',site);
	GM_setValue('site',new_site);

	var update = confirm('You need to refresh page for changes.' + '\n\n Click OK to refresh now.');
        if (update == true){
		unsafeWindow.location = window.location;
        }else alert('Changes Pending Refresh');
}

var site = GM_getValue('site');
var href = window.location.host;
//alert(href);
// if a domain is set that is the only one this uses 
// regex??
if (!site || site == href || site == 'www.' + href || site == '' || 'www.' + site == href){

  unsafeWindow.oncontextmenu = function () {  
	//this is where right click paste would live
		oncontextMenu(); 
		return false; 
  	}

  unsafeWindow.addEventListener('mouseup', function(){
        var copytext= unsafeWindow.getSelection().toString();
	if (copytext == '') return;

        // you have to sign the code to enable this, or see notes below
        unsafeWindow.netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');

        var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
        str.data= copytext;

        // make transferable
        var trans = Components.classes['@mozilla.org/widget/transferable;1'].createInstance(Components.interfaces.nsITransferable);
        if (!trans) return;

        // specify data type; TEXT
        trans.addDataFlavor('text/unicode');
        trans.setTransferData("text/unicode",str,copytext.length*2);

        // make interface clipboard
        var clip = Components.classes['@mozilla.org/widget/clipboard;1'].createInstance(Components.interfaces.nsIClipboard);
        if (!clip) return;
        var clipid=Components.interfaces.nsIClipboard;
        clip.setData(trans,null,clipid.kGlobalClipboard);

  },false);
}
