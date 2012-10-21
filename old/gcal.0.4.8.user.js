<?php

        header("Content-type: application/x-javascript");

	$tag = " " . $action_array['tag']['input'];
?>
/*
 Google Calendar Feed View - GMAIL
 version 0.4.8 BETA
 04-13-2006
 Copyright (c) 2006, Chris McKeever
 Released under the GPL license
 http://www.gnu.org/copyleft/gpl.html

 I try to monitor the Grease Monkey Mail List.
 http://www.mozdev.org/mailman/listinfo/greasemonkey
 Please post questions/comments and suggestions.


 This script grabs a GCAL feed URL, parses it, and display it in 
 a side nav.  

 Installation:

  1) Click the install icon for this user script in FireFox
  2) First get your Calendar Feed URL from calendar.google.com (XML)
  3) Add this to google/bookmarks with a non-space label (GMgcal recommended)
  4) When GMail is locaded/refreshed a new NAV box will appear indicating you neeed
	to run setup.
  5) To run setup Firefox:tools:user script commands:GMail Agenda Setup
  6) This will prompt you for the bookmark label, the time offset and the events to display
  7) GMail _should_ refresh with your calendar loaded.

 --------------------------------------------------------------------

 This is a Greasemonkey user script.

 To install, you need Greasemonkey: http://greasemonkey.mozdev.org/
 Then restart Firefox and revisit this script.
 Under Tools, there will be a new menu item to "Install User Script".
 Accept the default configuration and install.

 To uninstall, go to Tools/Manage User Scripts,
 select "Add Calendar Feed - GMail", and click Uninstall.

 --------------------------------------------------------------------
*/

// ==UserScript==
// @name          Add Calendar Feed - GMail<?php if ($tag != " ") print ($tag); ?>

// @namespace     http://www.r2unit.com/greasemonkey
// @description   Adds GCAL feed to GMAIL
// @include       http://mail.google.com/mail/*
// @include       https://mail.google.com/mail/*
// @exclude       http://mail.google.com/mail/help/*
// @exclude       https://mail.google.com/mail/help/*
// ==/UserScript==


GM_registerMenuCommand('GMail Agenda Setup <?php print ($tag); ?>',gcal_setup)

function gcal_setup(){

        var gcalLabel = GM_getValue('gcalLabel');
        if (!gcalLabel || gcalLabel == 'undefined') gcalLabel = 'GMgcal';
        gcalLabel=prompt('What is the Label for the XML Feed Bookmark',gcalLabel);
        GM_setValue('gcalLabel',gcalLabel);

        var gcalOffset = GM_getValue('gcalOffset');
	var dOffset = new Date();
	dOffset = dOffset.getTimezoneOffset()/60 * -1;
        if (!gcalOffset) gcalOffset = dOffset;
        gcalOffset=prompt('What is the time offset: (CST = -5)',gcalOffset);
        GM_setValue('gcalOffset',gcalOffset);

	var gcalDisplay = GM_getValue('gcalDisplay');
        if (!gcalDisplay) gcalDisplay = 20;
        gcalDisplay=prompt('Display how many events',gcalDisplay);
        GM_setValue('gcalDisplay',gcalDisplay);

        top.location.href = "https://mail.google.com/mail";

}


(function() {


var getNode = getObjMethodClosure(document, "getElementById");
// wait till screen is drawn
if(!getNode('nav')) return;

var newNode = getObjMethodClosure(document, "createElement");
var newText = getObjMethodClosure(document, "createTextNode");

const gcalRule = new Array(
        // Block in sidebar
        ".gcalBlock {-moz-border-radius: 5px; background: #ff6666; margin: 20px 7px 0 0; padding: 3px;}",
        ".gcalBlockList {background: white; display:none;}",
        ".gcalLoadingDiv {background: lightgrey; padding: 2px 0px 5px 2px; font-size: 8pt;}",
        ".gcalItem {color: #CC3333; font-size: 8pt;}",
        ".gcalEditLink {color: #CC3333;}",
        ".gcalEditDiv {text-align: right; padding: 2px 0px 5px 0; display:none;}"
        );

var gcalOffset = GM_getValue('gcalOffset');
var cDate = new Date();
var cYear = cDate.getFullYear();
var cMonth = cDate.getMonth();
var cDay = cDate.getDay();
var cEpoch = cDate.getTime();
var event = new Array();
var indexe = 0;

styleInject(gcalRule);

var gcalBlock = newNode("div");
gcalBlock.id = "nb_gcal_1";
gcalBlock.className = "gcalBlock";

// header
var gcalBlockHeader = newNode("div");
gcalBlockHeader.className = "s h";
gcalBlock.appendChild(gcalBlockHeader);

var gcalTriangleImage = newNode("img");
gcalTriangleImage.src = "/mail/images/opentriangle.gif";
gcalTriangleImage.width = 11;
gcalTriangleImage.height = 11;
gcalTriangleImage.addEventListener("click", toggleGcalBlock, true);
gcalBlockHeader.appendChild(gcalTriangleImage);

var gcalText = newNode("span");
//gcalText.appendChild(newText(" Agenda"));
gcalText.innerHTML = "&nbsp;<?php if ($tag == " ") {$tag = "Agenda";} print ($tag); ?>";
gcalText.addEventListener("click", toggleGcalBlock, true);
gcalBlockHeader.appendChild(gcalText);

// loading message
var gcalLoading = newNode("div");
gcalLoading.className = "gcalLoadingDiv";
gcalLoading.appendChild(newText('Agenda Loading...'));
gcalBlock.appendChild(gcalLoading);

// link list
var gcalBlockList = newNode("div");
gcalBlockList.className = "gcalBlockList";
gcalBlock.appendChild(gcalBlockList);

// DIV and A for editing
var gcalEditDiv = newNode("div");
gcalEditDiv.className = "gcalEditDiv";
gcalBlockList.appendChild(gcalEditDiv);

var gEditA = newNode('a');
gEditA.href = "http://calendar.google.com";
gEditA.target = "_blank";
gEditA.className = "lk cs gcalEditLink";
gEditA.appendChild(newText("Edit Gcal"));
gcalEditDiv.appendChild(gEditA);


getNode('nav').insertBefore(gcalBlock, getNode('nb_0'));

var gcalLabel = GM_getValue('gcalLabel');
if (!gcalLabel || gcalLabel == 'undefined') gcalLabel = 'GMgcal';

var gcalDisplay = GM_getValue('gcalDisplay');
if (!gcalDisplay  || gcalDisplay == 'undefined') gcalDisplay = 20;

var XMLurl = "http://www.google.com/bookmarks/lookup?q=label:" + gcalLabel + "&sort=title";

        GM_xmlhttpRequest({
        	method: 'GET',
        	url: XMLurl,
        	onload: function(responseDetails) {
                	var Ua = responseDetails.responseText.match(/\.\/url[^ \n\r"]+(?=.*id=bkmk_href)/);
                	if (!Ua){
				gcalLoading.style.display = "none";
				var msg = newNode("div");
	                        msg.className = "cs gcalItem";
        	                msg.appendChild(newText("Calendar URL not found.  Please run Setup under Tools -> User Script Commands."));
                	        gcalBlockList.insertBefore(msg, gcalEditDiv);
				gcalBlockList.style.display  = "block";
                	}else{
                        	var XMLUrl = Ua[0].replace('./url?url=', '');
				XMLUrl = XMLUrl.match(/(.+)(basic|full)/);
				XMLUrl = XMLUrl[0];
				initialize(XMLUrl);
                	}
        	},
        	onerror: function(responseDetails) {
			gcalLoading.style.display = "none";
			var msg = newNode("div");
                        msg.className = "cs gcalItem";
                        msg.appendChild(newText("Error Loading Agenda"));
                        gcalBlockList.insertBefore(msg, gcalEditDiv);
			gcalBlockList.style.display  = "block";
        	}
        });



function initialize(gcalURL){
	if (gcalURL == 'undefined' || !gcalURL || !gcalOffset) {
		/*  // this could have become annoying for some users that didnt set it up correctly 
			// or shared machine
		var update = confirm("Settings Not found.\n\nDo you want to update the setup variables for Calendar Agenda");
		if (update == true){
			 gcal_setup();
			 return;
		} else { }
		*/
			
			gcalLoading.style.display = "none";
			var msg = newNode("div");
                        msg.className = "cs gcalItem";
			msg.appendChild(newText("Calendar URL not found.  Please run Setup under Tools -> User Script Commands."));
                        gcalBlockList.insertBefore(msg, gcalEditDiv);
			gcalBlockList.style.display  = "block";
			return;
	}

		GM_xmlhttpRequest({
	    	method: 'GET',
	    	url: gcalURL.toString(),
		headers: {
        		'User-agent': 'Mozilla/4.0 (compatible) Greasemonkey/0.3',
	        	'Accept': 'application/atom+xml,application/xml,text/xml',
    		},
	    	onload: function(responseDetails) {
			var parser = new DOMParser();
	        	var dom = parser.parseFromString(responseDetails.responseText,"application/xml");
		        var entryA = dom.getElementsByTagName('entry');
			if (entryA.length == 0){
				var evt = newNode("div");
                  		evt.className = "cs gcalItem";
	                  	evt.appendChild(newText("No Events Found."));
        	          	gcalBlockList.insertBefore(evt, gcalEditDiv);
			} else {
				var feed = dom.getElementsByTagName('feed');
				var feed_title = feed[0].getElementsByTagName('title')[0].textContent;
				if (feed_title.length > 20) feed_title = feed_title.substring(0,18) + "...";
	
				//var feedDiv = newNode('div');
		                //feedDiv.className = 'gcalItem';
				//feedDiv.innerHTML = '&nbsp;<B>' + feed_title + "</B>";
				//gcalBlockList.insertBefore(feedDiv, gcalEditDiv);
				gcalText.innerHTML = '&nbsp;' + feed_title;

				var title;
				var when;
				var startT;
				var startD;
				var endT;
				var endD;
				var where;
				var location;
				var url;
				var link;
				var summary;
				var recurrence;
				var rec = 0;
				var rstartD;
				var REmatch;
				var freq;
				var interval;
				var byday;
				var until;
				var rule;
				var duration;

				// regular expressions 
				tRE = /([0-9]{2})(:[0-9]{2})/;
				dRE = /([0-9]+)-([0-9]+)-([0-9]+)/;
				sdPRE = /When:[\s]+([^\s]+)/;
				stPRE = /When:[\s]+[^\s]+[\s]([^\s]+)/;
				edPRE = /to[\s]+([^\s]+)/;
				etPRE = /to[\s]+[^\s]+[\s]([^\s]+)/;
				wPRE = /(Where: )([^<]+)/;
				sdRRE = /:([^\s]+)/;
				eRRE = /DURATION:PT([0-9]+)/;
				rRRE = /RRULE:[^\s]+/;
				freqRRE = /FREQ=([^;]+)/;
				intRRE = /INTERVAL=([^;]+)/;
				dayRRE = /BYDAY=([^;]+)/;
				untilRRE = /UNTIL=([0-9]{4})([0-9]{2})([0-9]{2})/;
				dRRE = /([0-9]{4})([0-9]{2})([0-9]{2})/;
				tRRE = /T([0-9]{2})([0-9]{2})/;
				var evtCount = entryA.length;
	        		for (var indexc = 0; indexc < evtCount; indexc++) {
					rec = 0;

        	    			title = entryA[indexc].getElementsByTagName('title')[0].textContent;
					if (title.length > 20){
                                		title = title.substring(0,20) + "...";
                        		}
					link = entryA[indexc].getElementsByTagName('link')[0];
                                        url = link.getAttribute('href');
					summary = entryA[indexc].getElementsByTagName('summary')[0];
					recurrence = entryA[indexc].getElementsByTagName('recurrence')[0];

					if (recurrence){
						rec = 1;
						where = entryA[indexc].getElementsByTagName('where')[0];
                                                location = where.getAttribute('valueString');

						recurrence = recurrence.textContent;
						
						startD = dRRE.exec(sdRRE.exec(recurrence));
						// startD = startD[2] +  " " + startD[3] + " " + startD[1];

						duration = eRRE.exec(recurrence);
                                                var dMinutes = (duration[1] % 3600)/60 ; // minutes
						var dHours = (duration[1] - (dMinutes * 60))/3600;

						startT = tRRE.exec(sdRRE.exec(recurrence));
						if (startT) {
							// recurring sends adjusted
							startT[1] = parseInt(startT[1]) - gcalOffset;
							endT = new Array;
							endT[1] = parseInt(startT[1]) + dHours;
							endT[2] = parseInt(startT[2]) + dMinutes;

							startT[2] = ":" + startT[2].toString();
							endT[2] = ":" + endT[2].toString();
							if (endT[2].length != 3) endT[2] = endT[2] + '0';

							endD = startD;
						}

						rule = rRRE.exec(recurrence);
						freq = freqRRE.exec(rule); freq = freq[1];
						interval = intRRE.exec(rule); 
						if (interval) {
							interval = interval[1];
						} else {
							interval = 1;
						}
						byday = dayRRE.exec(rule); 
						if (byday) byday = byday[1];
						until = untilRRE.exec(rule); 
						if (until) {
							until = until[2] + " " + until[3] + " " + until[1];
							until = new Date(until);
							until = until.getTime();
						}
					
	
						recurrence = new Array();
						if (!until || cEpoch < until){
							if (freq == 'WEEKLY'){
								var wrmsg = newNode("div");
					                        wrmsg.className = "cs gcalItem";
								var wrHTML = "<A class='gcalItem' href='" + url + "' target=_blank>" + title + "</A><BR>" 
								+ "&nbsp;Every " + interval + " Week(s)<BR>&nbsp;" + byday + "<BR>";
					                        wrmsg.innerHTML = wrHTML;
				        	                gcalBlockList.insertBefore(wrmsg, gcalEditDiv);
	
							} else if (freq == 'MONTHLY') {
								rstartD = startD[2];
	                                                        while (rstartD < cMonth){
        	                                                        rstartD = parseInt(rstartD) + parseInt(interval);
                	                                        }

								for (var iMonth = 0; iMonth < 2; iMonth++){
                                	                                recurrence[iMonth] = new Array;
                                        	                        recurrence[iMonth]['startD'] = new Array;
                                                	                recurrence[iMonth]['endD'] = new Array;

                                                        	        recurrence[iMonth]['startD'][0] = "";
                                                                	recurrence[iMonth]['startD'][1] = startD[1];
	                                                                recurrence[iMonth]['startD'][2] = parseInt(rstartD) + parseInt(interval) * iMonth;
        	                                                        recurrence[iMonth]['startD'][3] = startD[3];
	
        	                                                        recurrence[iMonth]['endD'] = recurrence[iMonth]['startD'];
                	                                        }
	
							} else if (freq == 'YEARLY') {
								rstartD = startD[1];
								while (rstartD < cYear){
									rstartD = parseInt(rstartD) + parseInt(interval);	
								}
								for (var iYear = 0; iYear < 2; iYear++){
									recurrence[iYear] = new Array;
									recurrence[iYear]['startD'] = new Array;
									recurrence[iYear]['endD'] = new Array;
	
									recurrence[iYear]['startD'][0] = ""; 
									recurrence[iYear]['startD'][1] = parseInt(rstartD) + parseInt(interval) * iYear;
									recurrence[iYear]['startD'][2] = startD[2];
									recurrence[iYear]['startD'][3] = startD[3];
	
									recurrence[iYear]['endD'] = recurrence[iYear]['startD'];
								}
	
							}

							for (indexR = 0; indexR < recurrence.length; indexR ++){
								createEvent(title,url,location,recurrence[indexR]['startD'],startT,recurrence[indexR]['endD'],endT);
							}
						}

					}else if (!summary){
						where = entryA[indexc].getElementsByTagName('where')[0];
						location = where.getAttribute('valueString');

						when = entryA[indexc].getElementsByTagName('when')[0];
						startT = when.getAttribute('startTime');
						startD = dRE.exec(startT);
						startT = tRE.exec(startT);
				
						endT = when.getAttribute('endTime');
						endD = dRE.exec(endT);
                                               	endT = tRE.exec(endT);
					}else{
						REmatch = wPRE.exec(summary.textContent);
						if (REmatch){
	                                                location = REmatch[2];
						}else location = "";

						startD = dRE.exec(sdPRE.exec(summary.textContent));
						startT = tRE.exec(stPRE.exec(summary.textContent));
						endD = dRE.exec(edPRE.exec(summary.textContent));
                        	                endT = tRE.exec(etPRE.exec(summary.textContent));
					}

					if (rec == 0) createEvent(title,url,location,startD,startT,endD,endT);

				}
			
				maxEvent = event.length;
				if (maxEvent > gcalDisplay) maxEvent = gcalDisplay;  // max events to display (optionally chosen)
				if (maxEvent > 0){
					event.sort(function(a,b){return cmp(a.sEpoch,b.sEpoch);});
					for (indexe = 0; indexe < maxEvent; indexe++){
						var evt = new objGcalEvent(event[indexe]['title'],event[indexe]['startT'],event[indexe]['startD'],event[indexe]['endT'],event[indexe]['endD'],event[indexe]['location'],event[indexe]['url']);
                	                        addGcalItem(evt);	
					}
				}else{
					var evt = newNode("div");
	                                evt.className = "cs gcalItem";
        	                        evt.appendChild(newText("No Upcoming Events Found."));
                	                gcalBlockList.insertBefore(evt, gcalEditDiv);
				}

			}

			var blockdisp = getCookie('GMgcal');
			gcalLoading.style.display = "none";
			gcalEditDiv.style.display = "block";
			if (blockdisp == 1){
				gcalBlockList.style.display  = "block";
			}else gcalTriangleImage.src = "/mail/images/triangle.gif";
		
    			},
	    	onerror: function(responseDetails) {
			gcalLoading.innerHTML = "Error Loading Agenda";
    			}
  		});
}

function toggleGcalBlock() {
  	if (gcalBlockList.style.display != "block") {
		setCookie('GMgcal', 1);
     		gcalBlockList.style.display = "block";
		gcalTriangleImage.src = "/mail/images/opentriangle.gif";
  	} else {
		setCookie('GMgcal', 0);
    		gcalBlockList.style.display = "none";
		gcalTriangleImage.src = "/mail/images/triangle.gif";
  	}
  
  	return false;
}

function addGcalItem(event) {
  	gcalBlockList.insertBefore(event.createGcalItem('gcalItem',''), gcalEditDiv);
}

function createEvent(title,url,location,startD,startT,endD,endT){
	dFRE = /[^\s]+\s[^\s]+\s[^\s]+\s[^\s]+/;

	if (!location) location = '';
        if (location.length > 20) location = location.substring(0,20) + "...";

        // timezone offset
        // doesnt handle date rollback from the first

        if (startT){
		var S = startT[1];
        	S = parseInt(S) + parseInt(gcalOffset);
                if (S < 0){
                	S = 24 + S;
                        startD[3] = parseInt(startD[3]);
                        if (startD[3] != 1){
                        	startD[3] = startD[3] - 1;
                        }
                        startD[3] = startD[3].toString();
                }
                startT = S.toString() + startT[2];
	} else startT = '';

        if (startD){
        	startD = new Date(startD[2] + " " + startD[3] + " " + startD[1] + " " + startT);
                var sEpoch = startD.getTime();
                startD = dFRE.exec(startD);
	} else startD = '';

        if (endT){
		var E = endT[1];
        	E = parseInt(E) + parseInt(gcalOffset);
                if (E < 0){
                	E = 24 + E;
                        endD[3] = parseInt(endD[3]);
                        if (endD[3] != 1){
                        	endD[3] = endD[3] - 1;
                        }
                        endD[3] = endD[3].toString();
                }
                endT = E.toString() + endT[2];
	} else endT = '';

	if (endD){
        	endD = new Date(endD[2] + " " + endD[3] + " " + endD[1] + " " + endT);
                endD = dFRE.exec(endD);
	} else endD = '';

	if (cEpoch < sEpoch){
        	event[indexe] = new Array();
                event[indexe]['title'] = title;;
                event[indexe]['startT'] = startT;
                event[indexe]['startD'] = startD;
                event[indexe]['sEpoch'] = sEpoch;
                event[indexe]['endT'] = endT;
                event[indexe]['endD'] = endD;
                event[indexe]['location'] = location;
                event[indexe]['url'] = url;
                indexe ++;
	}


}


// -----------------------------  Resource

function getObjMethodClosure(object, method) {
	// shorthand object reference
  	return function(arg) {
    		return object[method](arg); 
  	}
}

function styleInject(styRule) {
	// injects style elements into head
  	var styleNode = newNode("style");
  	document.body.appendChild(styleNode);

  	var styleSheet = document.styleSheets[document.styleSheets.length - 1];

  	for (var i=0; i < styRule.length; i++) {
    		styleSheet.insertRule(styRule[i], 0);
  	}
  
  	//styleSheet.insertRule(NORMAL_RULE, MESSAGE_BODY_FONT_RULE_INDEX);    
}

function xpath(pattern){
	// simple xpath parser
	var a_emt = new Array();
    	var sshot = document.evaluate(pattern, document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
	if( sshot.snapshotLength > 0){
      		for (i=0; i< sshot.snapshotLength; i++){
        		a_emt[i] = sshot.snapshotItem(i);
      		}
      		return a_emt;
    	}
    	return null;
}

function setCookie(name, value) {
  var today = new Date();
  var expiry = new Date(today.getTime() + 24 * 60  * 60 * 1000);
                                                                                
  document.cookie = name + "=" + escape(value) +
            "; expires=" + expiry.toGMTString() +
            "; path=/";
}

function getCookie(name) {
  var re = new RegExp(name + "=([^;]+)");;
  var value = re.exec(document.cookie);
  return (value != null) ? unescape(value[1]) : null;
}

function cmp(a,b) {
 return (a < b) ? -1 :( a > b) ? 1 : 0;
}


// ------------------------------ Link Object

function objGcalEvent(title,startT,startD,endT,endD,location,url){

	this.title = title;
  	this.startT = startT;
	this.startD = startD;
	this.endT = endT;
	this.endD = endD;
	this.location = location;
	this.url = url;
  
  	this.eventItem = null;
}

objGcalEvent.prototype.createGcalItem = function(itemStyle,clickEvent) {
  	if (!this.eventItem) {
    		this.eventItem = newNode("div");
		var a = newNode("a");
		a.href = this.url;
		a.target = "_blank";
		a.className = "lk cs " + itemStyle;
		a.appendChild(newText(this.title));
		this.eventItem.appendChild(a);
		var evtDiv = newNode('div');
		evtDiv.className = itemStyle;
		var evtHTML;

		var std = this.startD;
		var etd = this.endD;

		if (std.toString() != etd.toString()){
			if (this.startT !== '') std = std + '@' + this.startT;
			if (this.endT != '') etd = etd  + '@' + this.endT;
			var td = "&nbsp;&nbsp;" + std + "-<BR>" + "&nbsp;&nbsp;" + etd;
		}else{
			var td = "&nbsp;&nbsp;" + std + "<BR>";
			if (this.startT !== '') td = td + "&nbsp;&nbsp;" + this.startT;
			if (this.endT != '') td = td + "-" +  this.endT;
		}

		if (this.location){
			evtHTML = '&nbsp;&nbsp;' + this.location + '<BR>' + td;
		}else{
			evtHTML = td;
		}
		
		evtDiv.innerHTML = evtHTML;
    		this.eventItem.appendChild(evtDiv);
		
		if (clickEvent != ''){
	    		this.listItem.addEventListener("click", this[clickEvent], true);
		}
  	}
  
  	return this.eventItem;
}


// ------------------------------ End Link Object


}) ();

