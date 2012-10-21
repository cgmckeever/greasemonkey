<?php

        header("Content-type: application/x-javascript");

?>
// ==UserScript==
// @name          JS Regex Test
// @namespace     http://www.r2unit.com/greasemonkey
// @description   REGEX TESTER
// @include       *regex.user.js

// ==/UserScript==



(function() {

	 const RE = /bkmk_href[^ >]+>([^<]*)/g;
	

	GM_xmlhttpRequest({
    		method: 'GET',
    		url: "http://mobile.google.com/bookmarks/lookup?q=label:GMqlink",
    		onload: function(responseDetails) {
      		//GM_log(responseDetails.responseText);
			//var match = RE.exec(responseDetails.responseText);
			//alert(match[0]);
			var Rarray = responseDetails.responseText.match(/bkmk_href[^ >]+>([^<]*)/g);
			var indexc;
			alert(Rarray.length);
			for (indexc = 0; indexc < Rarray.length; indexc++){
				var repl = Rarray[indexc].replace(/bkmk_href[^ >]+>/,'');
				alert(repl);
			}
			Rarray = responseDetails.responseText.match(/\.\/url[^ \n\r"]+(?=.*id=bkmk_href)/g);
			for (indexc = 0; indexc < Rarray.length; indexc++){
                                var repl = Rarray[indexc];
                                alert(repl);
                        }
			

			//GM_log(RegExp.$1);

    		},
    		onerror: function(responseDetails) {
      			alert("Request for contact resulted in error code: " + responseDetails.status);
    		}
  	});




}) ();

