/*
print_r_0_2
*/
/*
	Author: Jason Patterson
	Contact: jasonp < at > cableaz.com
	Date: 8/15/2005
	Copyright: (C) 2005  Jason Patterson, http://www.cableaz.com/print_r.php
	
	This code is licensed under the LGPL:
	http://www.gnu.org/licenses/lgpl.html
	
	Special Thanks to:
	www.youngpup.net for the Excellent Dom-Drag Script.....
	Jason Davis for the element Prototyping script
	Slayeroffice.com (object tree) -- for inspiration for this project
	
	This gives an Equivalent to the print_r function in PHP but much more useful
	it can be called on any object, no Really!!!
		
			
	known Problems
	1) in Konqueror the Anchors do not function no ideas on this Either
	2) in Konqueror clicking on a link in the navbar causes it to forget it's name history and start from the element youare currently on
	3) various CSS issues in older versions of browsers listed below
	
	I have tested print_r on 
	Linux (debian Sarge)
		Firefox 1.0.6
		Opera 8.01
		Konqueror 3.3.2
	
	Windows XP
		Firefox 1.0.6
		Opera 8.0.1
		Internet Explorer 6.0.2900.2180
		
	Mac OS X
		I do not have access to a mac should work in Firefox, opera and most likely safari with similar problems to Konqueror listed above
		
	
	usage 
	object.print_r('object');
			
	my CSS Rules
	
	* { behavior: url(HTMLElement.htc); }  
   html, body {font-family: sans-serif;font-size:small;} 	
   .popup {text-align:left;z-index:100000;position: absolute;top: 0;right: 0;bottom: 0;left: 0;width: 80%;height: 50%;margin: auto;}
   .titlebar {font-size:1.75em;font-weight:bold;cursor:move;background-color:blue;color:white;z-index:100000;text-align:left;padding-left:.6em;height:1.5em;vertical-align:middle;border:2px solid black;}
   .content {border: 2px solid black;background-color:white;z-index:100000; overflow:auto;height:100%;width:100%;border-left:1px solid black;}
   .popup * {font-family:sans-serif;font-size:1em;}
	.popup a {text-decoration:none;color: darkblue;cursor:pointer;}			
	.buttonscntr{position:absolute;right: .2em;top:0;vertical-align:middle;cursor:none;}
	.btn {font-family:sans-serif;font-size:1.25em;font-weight:normal;background-color:buttonface;color:buttontext;text-align:center;vertical-align:top;height:1.3em;}			 
	.groupHeader{background-color:orange;font-weight:bold;font-size:1.25em;}
	.navbar {font-weight:bold;font-size:1.25em;width:100%;}
	.navbar a{color:darkred;}
	.constrainSize{overflow:auto;white-space:pre;}
	.tbhdr {font-weight:bold;}
	.content td {font-family: sans-serif;font-size:small;text-align:left;vertical-align:top;border: 1px solid black;}	

	Feel Free to customize to suit you.

								
*/
/**************************************************
 * dom-drag.js
 * 09.25.2001
 * www.youngpup.net
 **************************************************
 * 10.28.2001 - fixed minor bug where events
 * sometimes fired off the handle, not the root.
 **************************************************/

var Drag = {

obj : null,

init : function(o, oRoot, minX, maxX, minY, maxY, bSwapHorzRef, bSwapVertRef, fXMapper, fYMapper)
{
o.onmousedown= Drag.start;

o.hmode= bSwapHorzRef ? false : true ;
o.vmode= bSwapVertRef ? false : true ;

o.root = oRoot && oRoot != null ? oRoot : o ;

if (o.hmode  && isNaN(parseInt(o.root.style.left  ))) o.root.style.left   = "0px";
if (o.vmode  && isNaN(parseInt(o.root.style.top   ))) o.root.style.top    = "0px";
if (!o.hmode && isNaN(parseInt(o.root.style.right ))) o.root.style.right  = "0px";
if (!o.vmode && isNaN(parseInt(o.root.style.bottom))) o.root.style.bottom = "0px";

o.minX= typeof minX != 'undefined' ? minX : null;
o.minY= typeof minY != 'undefined' ? minY : null;
o.maxX= typeof maxX != 'undefined' ? maxX : null;
o.maxY= typeof maxY != 'undefined' ? maxY : null;

o.xMapper = fXMapper ? fXMapper : null;
o.yMapper = fYMapper ? fYMapper : null;

o.root.onDragStart= new Function();
o.root.onDragEnd= new Function();
o.root.onDrag= new Function();
},

start : function(e)
{
var o = Drag.obj = this;
e = Drag.fixE(e);
var y = parseInt(o.vmode ? o.root.style.top  : o.root.style.bottom);
var x = parseInt(o.hmode ? o.root.style.left : o.root.style.right );
o.root.onDragStart(x, y);

o.lastMouseX= e.clientX;
o.lastMouseY= e.clientY;

if (o.hmode) {
if (o.minX != null)o.minMouseX= e.clientX - x + o.minX;
if (o.maxX != null)o.maxMouseX= o.minMouseX + o.maxX - o.minX;
} else {
if (o.minX != null) o.maxMouseX = -o.minX + e.clientX + x;
if (o.maxX != null) o.minMouseX = -o.maxX + e.clientX + x;
}

if (o.vmode) {
if (o.minY != null)o.minMouseY= e.clientY - y + o.minY;
if (o.maxY != null)o.maxMouseY= o.minMouseY + o.maxY - o.minY;
} else {
if (o.minY != null) o.maxMouseY = -o.minY + e.clientY + y;
if (o.maxY != null) o.minMouseY = -o.maxY + e.clientY + y;
}

document.onmousemove= Drag.drag;
document.onmouseup= Drag.end;

return false;
},

drag : function(e)
{
e = Drag.fixE(e);
var o = Drag.obj;

var ey= e.clientY;
var ex= e.clientX;
var y = parseInt(o.vmode ? o.root.style.top  : o.root.style.bottom);
var x = parseInt(o.hmode ? o.root.style.left : o.root.style.right );
var nx, ny;

if (o.minX != null) ex = o.hmode ? Math.max(ex, o.minMouseX) : Math.min(ex, o.maxMouseX);
if (o.maxX != null) ex = o.hmode ? Math.min(ex, o.maxMouseX) : Math.max(ex, o.minMouseX);
if (o.minY != null) ey = o.vmode ? Math.max(ey, o.minMouseY) : Math.min(ey, o.maxMouseY);
if (o.maxY != null) ey = o.vmode ? Math.min(ey, o.maxMouseY) : Math.max(ey, o.minMouseY);

nx = x + ((ex - o.lastMouseX) * (o.hmode ? 1 : -1));
ny = y + ((ey - o.lastMouseY) * (o.vmode ? 1 : -1));

if (o.xMapper)nx = o.xMapper(y)
else if (o.yMapper)ny = o.yMapper(x)

Drag.obj.root.style[o.hmode ? "left" : "right"] = nx + "px";
Drag.obj.root.style[o.vmode ? "top" : "bottom"] = ny + "px";
Drag.obj.lastMouseX= ex;
Drag.obj.lastMouseY= ey;

Drag.obj.root.onDrag(nx, ny);
return false;
},

end : function()
{
document.onmousemove = null;
document.onmouseup   = null;
Drag.obj.root.onDragEnd(parseInt(Drag.obj.root.style[Drag.obj.hmode ? "left" : "right"]), 
parseInt(Drag.obj.root.style[Drag.obj.vmode ? "top" : "bottom"]));
Drag.obj = null;
},

fixE : function(e)
{
if (typeof e == 'undefined') e = window.event;
if (typeof e.layerX == 'undefined') e.layerX = e.offsetX;
if (typeof e.layerY == 'undefined') e.layerY = e.offsetY;
return e;
}
};

function print_r_Namespace()
{
	// Attach to some Basic Objects including the base Object object.
	window.print_r = __print_r;
	document.print_r = __print_r;
	Object.prototype.print_r = __print_r;
	/*
		Creates the container and returns it as an object for future use.		
	*/
	function __createContainer(a,objName)
	{
		var arrContainer = new Object();		
		arrContainer.container = document.createElement('div');		
		arrContainer.container.className = 'PR-popup';
		arrContainer.titlebar = document.createElement('div');
		arrContainer.container.appendChild(arrContainer.titlebar);		
		arrContainer.titlebar.className = 'PR-titlebar';
		arrContainer.titlebar.appendChild(document.createElement('div'));
		arrContainer.buttoncntr = document.createElement('span');
		arrContainer.buttoncntr.className = 'PR-buttonscntr';
		arrContainer.titlebar.appendChild(arrContainer.buttoncntr);
		arrContainer.buttoncntr.appendChild(document.createTextNode('Reuse?'));
		arrContainer.reusechk = document.createElement('input');
		arrContainer.reusechk.setAttribute("type", "checkbox");
		arrContainer.reusechk.type = 'checkbox';		
		arrContainer.buttoncntr.appendChild(arrContainer.reusechk);
		arrContainer.refreshbtn = document.createElement('button');		
		arrContainer.refreshbtn.appendChild(document.createTextNode('Refresh'));
		arrContainer.refreshbtn.className = 'PR-btn';
		arrContainer.buttoncntr.appendChild(arrContainer.refreshbtn);
		arrContainer.minbtn = document.createElement('button');
		arrContainer.minbtn.appendChild(document.createTextNode('Min'));
		arrContainer.minbtn.onclick = function (){arrContainer.content.style.display = 'none';arrContainer.container.style.height = '1.5em';};
		arrContainer.minbtn.className = 'PR-btn';
		arrContainer.buttoncntr.appendChild(arrContainer.minbtn);
		arrContainer.maxbtn = document.createElement('button');
		arrContainer.maxbtn.appendChild(document.createTextNode('Max'));
		arrContainer.maxbtn.onclick = function (){arrContainer.content.style.display = 'block';arrContainer.container.style.height =  '50%';};
		arrContainer.maxbtn.className = 'PR-btn';
		arrContainer.buttoncntr.appendChild(arrContainer.maxbtn);
		arrContainer.closebtn = document.createElement('button');
		arrContainer.closebtn.appendChild(document.createTextNode('Close'));
		arrContainer.buttoncntr.appendChild(arrContainer.closebtn);
		arrContainer.closebtn.onclick = function () {document.body.removeChild(arrContainer.container);};
		arrContainer.closebtn.className = 'PR-btn';
		arrContainer.content = document.createElement('div');
		arrContainer.content.className ='PR-content';
		arrContainer.container.appendChild(arrContainer.content);	
		arrContainer.content.navbar = document.createElement('div');
		arrContainer.content.navbar.className = 'PR-navbar';
		if (arrContainer.content.navbar.style.overflowX && arrContainer.content.navbar.style.whiteSpace){
			arrContainer.content.navbar.style.overflowX = 'auto';
			arrContainer.content.navbar.style.whiteSpace = 'nowrap';
		}
		else{
			arrContainer.content.navbar.style.overflow = 'auto';
		}
		arrContainer.content.appendChild(arrContainer.content.navbar);
		arrContainer.refreshbtn.onclick = refreshThis(a, objName, arrContainer);
		function refreshThis(obj, name, container)
		{
			return (function(){return obj.print_r(name, true, container);});
		}
		return arrContainer;
	}
	/*
		The Bulk of the Code is here 
		This takes the results of __walk_object and converts them into a table 
		which is returned for future use.
	*/
	function __createContent(a, objName, reuse, container)
	{		
		reuse = reuse || container;		
		var txtreturn = new String();
		var arrall = __walkObject(a, objName[objName.length-1]['name']);
		function arrSort(a,b)
		{
			var acomp = a['name'].toString(10);
			var bcomp = b['name'].toString(10);
			if (!isNaN(Number(acomp)))
			{
				acomp = Number(acomp);
			}
			if (!isNaN(Number(bcomp)))
			{
				bcomp = Number(bcomp);
			}
			if (acomp < bcomp)
			{
				return -1;
			}
			if (acomp > bcomp)
			{
				return 1;
			}
			return 0;
		}
		function format(str) 
		{
			//str=str.replace(/</g,"&lt;");
			//str=str.replace(/>/g,"&gt;");
			return str;
		}
		arrall['unique_id'] = Math.floor(Math.random()  * (100000)) + 1;
		arrall[0].sort(arrSort);
		arrall[0]['unique_id'] = Math.floor(Math.random()  * (100000)) + 1;
		arrall[0]['headertext'] = '(This Object)';
		arrall[0]['headername'] = 'this';
		
		arrall[1].sort(arrSort);
		arrall[1]['unique_id'] = Math.floor(Math.random()  * (100000)) + 1;
		arrall[1]['headertext'] = '(Properties)';
		arrall[1]['headername'] = 'properties';
		arrall[2].sort(arrSort);
		arrall[2]['unique_id'] = Math.floor(Math.random()  * (100000)) + 1;
		arrall[2]['headertext'] = '(Methods / Custom Object Definitions)';
		arrall[2]['headername'] = 'Methods';
		arrall[3].sort(arrSort);
		arrall[3]['unique_id'] = Math.floor(Math.random()  * (100000)) + 1;
		arrall[3]['headertext'] = '(Event Listeners)';
		arrall[3]['headername'] = 'events';
		arrall[4].sort(arrSort);
		arrall[4]['unique_id'] = Math.floor(Math.random()  * (100000)) + 1;		
		arrall[4]['headertext'] = '(Extra Information)';
		arrall[4]['headername'] = 'extra';
		var table = document.createElement('table');
		table.style.tableLayout = 'fixed';
		table.setAttribute('cellpadding', '0');
		table.setAttribute('cellspacing', '0');
		var thead = table.appendChild(document.createElement('thead'));		
		var th_row=	thead.insertRow(0);
		var th_rowcell0 = th_row.insertCell(0);
		th_rowcell0.style.width =  '20%';
		var th_rowcell1 = th_row.insertCell(1);
		th_rowcell1.style.width =  '70%';
		var th_rowcell2 = th_row.insertCell(2);
		th_rowcell2.style.width =  '10%';
		var th_row1=	thead.insertRow(1);
		var th_rowcell1 = th_row1.insertCell(0);
		th_rowcell1.colSpan = '3';
		var toplink = document.createElement('a');
		toplink.name = 'top' + arrall['unique_id'];
		th_rowcell1.appendChild (toplink);
		for (g=0;g<arrall.length;g++)
		{		
		if (arrall[g].length > 0)
		{
			th_rowcell1.appendChild(document.createTextNode('  '));
			var propsbody = document.createElement('tbody');
			table.appendChild(propsbody);
			var propsthead = propsbody.insertRow(0);
			var propshead = propsthead.insertCell(0);
			propshead.colSpan ='3';			
			propshead.className = 'PR-groupHeader';
			propshead.appendChild(document.createElement('a')).setAttribute('name', arrall[g]['headertext'] + arrall[g]['unique_id']);
			propshead.appendChild(document.createTextNode(arrall[g]['headertext']));
			propshead.appendChild(document.createTextNode('   '));
			var subtoplink = document.createElement('a');
			subtoplink.href = '#top' + arrall['unique_id'];
			subtoplink.appendChild(document.createTextNode('top'));
			if (subtoplink.scrollIntoView)
			{
				subtoplink.onclick = getscrollclick (toplink);
			}
			else
			{
				subtoplink.onclick = getnoscrollintoview(toplink);
			}
			propshead.appendChild(subtoplink);
			var propsth = propsbody.insertRow(1);
			var propsthname = propsth.insertCell(0);
			propsthname.className = 'PR-tbhdr';
			propsthname.appendChild(document.createTextNode('Name'));
			var propsthvalue = propsth.insertCell(1);
			propsthvalue.className = 'PR-tbhdr';
			propsthvalue.appendChild(document.createTextNode('Value'));
			var propsthtype = propsth.insertCell(2);
			propsthtype.className = 'PR-tbhdr';
			propsthtype.appendChild(document.createTextNode('Type'));
			var props = arrall[g];
			var propslink = document.createElement('a');
			propslink.href = '#' + arrall[g]['headertext'] + arrall[g]['unique_id'];
			propslink.appendChild(document.createTextNode(arrall[g]['headertext']));
			if (propslink.scrollIntoView)
			{
				propslink.onclick = getscrollclick (propsbody);
			}
			else
			{
				propslink.onclick = getnoscrollintoview(propsbody);
			}
			th_rowcell1.appendChild(propslink);
			try
			{
			for (x=0;x< props.length;x++)
			{
				var stemparr = [ ];		
				stemparr['name'] = props[x]['name'];
				stemparr['ref'] = a[props[x]['name']];
				var tr = propsbody.insertRow(propsbody.rows.length);
				var td0 = tr.insertCell(0);
				if (g !=0)
				{
					var namelink = document.createElement('a');
					try
					{
						namelink.onclick = getPropRef(a[props[x]['name']],objName, stemparr);
					}
					catch (e)
					{
						namelink.onclick = function (){alert('This Object is not Enumerable in this Browser!');}
					} 
				}
				else
				{
					var namelink = document.createElement('span');
				}
				namelink.appendChild(document.createTextNode(props[x]['name']));
				td0.appendChild(namelink);
				var td1 = tr.insertCell(1);
				var td1span = document.createElement('div');
				td1span.className = 'PR-constrainSize';
				if (g == 2)
				{
					//alert (props[x]['length']);
				}				
				var subobjs = format(props[x]['value']).split(/\[/g);
				if (props[x]['type']!='string' && props[x]['type'] != 'function' && subobjs.length > 2&&g != 3)
				{					
					for (c=1;c< subobjs.length;c++)
					{
						var cor = c-1;
						var stemparr1 = [ ];
						stemparr1['name'] = cor;
						stemparr1['ref'] = a[props[x]['name']][cor];						
						var subobjlink = document.createElement('a');
						try
						{
							subobjlink.onclick = getPropRef(stemparr1['ref'] , objName, stemparr, stemparr1);
						}
						catch (e)
						{
							subobjlink.onclick = function (){alert('This Object is not Enumerable in this Browser!');}
						}
						subobjlink.style.cursor = 'pointer';											
						subobjlink.appendChild(document.createTextNode('[' + subobjs[c]));
						td1span.appendChild(subobjlink);
						if (c <(subobjs.length -1))
						{
							td1span.appendChild(document.createElement('br'));
						}
					}
				}
				else
				{
					if (props[x]['value'] != 'null' && g != 0)
					{										
						var subobjlink = document.createElement('a');						
						try
						{
							subobjlink.onclick = getPropRef(a[props[x]['name']],objName, stemparr);
						}
						catch (e)
						{
							subobjlink.onclick = function (){alert('This Object is not Enumerable in this Browser!');}
						}
						subobjlink.style.cursor = 'pointer';
						subobjlink.appendChild(document.createTextNode(format(props[x]['value'])));
						td1span.appendChild(subobjlink);
					}
					else
					{
						var subobjlink = document.createElement('span');						
						subobjlink.appendChild(document.createTextNode(props[x]['value']));
						td1span.appendChild(subobjlink);
					}
				}
				td1.appendChild(td1span);
				var td2 = tr.insertCell(2);
				td2.appendChild(document.createTextNode(props[x]['type']));
				propsbody.appendChild(tr);				
			}
			}
			catch (e){}
		}				
		}
		/*
			This is an Inner Function that uses Closures to create the onclick function 
			with the variables passed to it
		*/
		function getPropRef(propRef, propString, newArr, newArr1)
		{			
			return (function()
			{
				propString.push(newArr);
				if (newArr1)
				{
					propString.push(newArr1);
				}
				try 
				{					
					return propRef.print_r(propString, container.reusechk.checked, container);	
				}
				catch (e)
				{
					try 
					{
						return window.__print_r.call(propRef, propString, container.reusechk.checked, container);
					}
					catch (e)
					{
						return alert('This Browser will not Enumerate this Object'  + e.toString());
					}
				}				
			});
			
		}	
		/*
			for the Anchors scroll them into view
			if suportted by the browser if not (konqueror/safari) return False
			so they do not scroll to the wrong place
		*/	
		function getscrollclick (elem)
		{
			return (function (){try {elem.scrollIntoView();}catch(e){}});
		}
		function getnoscrollintoview(elem)
		{
			return (function (){try {return false;}catch(e){}});
		}
		return table;
	}
	/*
		The Function that does most of the work 
		it retrieves whatever information it can about an object.
	*/
	function __walkObject(a, aname)
	{
		var arrall = [ ];
		var arrthis = [ ];
		var arrprops = [ ];
		var arrmethods = [ ];
		var arrevents = [ ];
		var arrerrata = [ ];
		var props ='';
		var methods = '';
		var events = '';
		try 
		{
			var temparray = [ ];
			temparray['name'] = 'Name';	
			temparray['value'] = aname;
			temparray['type'] = 'string';
			arrthis.push (temparray);		
			temparray = [ ];
			temparray['name'] = 'Value';
			try{
				temparray['value'] = a.toString();
			}
			catch (e){
				temparray['value'] = 'Cannot Convert to a String';
			}
			temparray['type'] = typeof(a);
			temparray['length'] = null;
			arrthis.push(temparray);
			//Enumerate all properties, methods, and Functions
			for (properties in a)
			{	
				/// Set The Variables
				try {var name = properties.toString();}catch (e){}
				try{var type = typeof(a[properties]);}catch(e){}
				try 
				{
					if (a[properties] && a[properties].toString)
					{
						var value = a[properties].toString();										
					}
					else
					{
						if (type == 'boolean')
						{
							var value = 'false';
						}
						else
						{
							var value = 'null';
						}
					}
				}
				catch (e)
				{
					var value = '[value Undefined]';
					//alert ('An Error occurred accessing ' +  properties );
				}
				
				try{
				if (a[properties]&&a[properties].length)
				{
					var length = a[properties].length;	
				}
				else 
				{
					var length = null;
				}
				}catch(e){}
				//assign the variables to an array
				var temparray = [ ];
				temparray['name'] = name;					
				temparray['value'] = value;
				temparray['type'] = type;
				temparray['length'] = length;
				var placeholder = a[properties];
				temparray['reference'] = placeholder;
				//Assign to appropriate array
				//Either a property or a Event
				if (type != 'function')
				{
					// its an Event handler
					if (name.indexOf('_e__') > -1)
					{
						arrevents.push (temparray);
					}
					else
					{
						arrprops.push(temparray);							
					}						
				}
				else
				{
					if (temparray['name'] != 'print_r')
					{
						arrmethods.push(temparray);
					}
				}
			}
			var erratas = new Array('constructor', 'arguments', 'caller', '__proto__', 'prototype');
			for (j=0;j<erratas.length;j++)
			{
				var errata = erratas[j];				
				try
				{
					if (a[errata])
					{
						name = errata;
						if (a[errata].toString)
						{
							value = a[errata].toString();
						}
						else
						{
							value = 'null';
						}
						type = typeof(a[errata]);
						length = a[errata].length;
						temparray = [ ];
						temparray['name'] = name;					
						temparray['value'] = value;
						temparray['type'] = type;
						temparray['length'] = length;
						if (temparray['name'] != 'print_r')
						{
							arrerrata.push(temparray);						
						}
					}
				}
				catch (e){}
			}
		}
		// Catch Any Weird Errors
		catch (e)
		{
			//
		}
		arrall.push(arrthis);
		arrall.push (arrprops);
		arrall.push (arrmethods);
		arrall.push (arrevents);
		arrall.push (arrerrata);
		return arrall;
	}	
	/*
		The Public stub 
		This is called when you do object.print_r();
		it requires no variables for initiation
		though objName is highly reccomended because
		it will default to the toString() method of the object 
		it is attached to which is not usually desirable.
		
		Params:
			objName -- (String) optional (reccomended) a String describing 
				the object in question. i.e. 'myVar' or 'Google Map Object'
				if no argument is supplied then the String '[Root Object]' will
				be used.
			reuse -- (Boolean) optional (internal) this option in conjunction with 
				container 	to control whether a new container is generated 
				or the old one is reused.
			container -- (Container Object) optional (internal) if reuse is true this 
				the new content will be added to this container rather than creating 
				a new container	
			
	*/
	function __print_r (objName, reuse, container)
	{		
			
		container = container||false;
		if (typeof(reuse) == 'undefined')
		{			
			reuse = true;
		}
		var a = this;
		try
		{
			if (typeof(objName) == 'string'||typeof(objName) == 'undefined')
			{
				var arr1 = new Array();
				arr1[0] = new Array();
				arr1[0]['name'] = objName||'[Root Object]';
				arr1[0]['ref'] = a;				
				objName = arr1;
			}				
			if (!reuse||!container)
			{
				var objContainer = __createContainer(a, objName);		
				document.body.appendChild(objContainer.container);
				objContainer.titlebar.replaceChild(document.createTextNode(objName[objName.length -1]['name']),objContainer.titlebar.firstChild);
				objContainer.content.navbar.appendChild(__buildlinkbar(a, objName, objContainer));
				objContainer.content.appendChild(__createContent(a, objName, reuse, objContainer));		
				objContainer.reusechk.checked = reuse;				
				Drag.init(objContainer.titlebar, objContainer.container);				
			}
			else
			{				
				container.titlebar.replaceChild(document.createTextNode(objName[objName.length -1]['name']), container.titlebar.firstChild);
				container.content.navbar.replaceChild(__buildlinkbar(a, objName,container), container.content.navbar.firstChild);
				container.content.replaceChild(__createContent(a, objName, reuse, container),container.content.childNodes[1]);
			}
		}
		catch (e){}
		/*
			an Internal link bar generator
			this creates the link bar at the top			
		*/
		function __buildlinkbar(obj, arr, container)
		{
			var bar = document.createElement('div');
			bar.style.overflow = 'auto';	
			try
			{
				for (x=0;x<arr.length;x++)
				{				
					var link= document.createElement('a');
					link.appendChild(document.createTextNode(arr[x]['name']));
				
					link.onclick = getonclick(arr.slice(0, (x+1)), arr[x]['ref'], container);
					bar.appendChild(link);
					bar.appendChild(document.createTextNode('.'));
				}
			}
			catch (e){ }
			/*
				internal onclick function generator
			*/
			function getonclick(name, dest, container)
			{
				return (function(){dest.print_r(name, container.reusechk.checked,  container);});	
			}
			bar.removeChild(bar.lastChild);		
			return bar;
		}	
	}	
	// For internal use attach the __print_r function to the window object for internal use 
	// the onclick handlers will stop working if you do.
	window.__print_r = __print_r;
	/*
	HTMLElement Prototyping in KHTML and WebCore
	Copyright (C) 2005  Jason Davis, http://www.jasonkarldavis.com
	Additional thanks to Brothercake, http://www.brothercake.com

	This code is licensed under the LGPL:
	http://www.gnu.org/licenses/lgpl.html
	*/

	if (navigator.vendor == "Apple Computer, Inc." || navigator.vendor == "KDE") 
	{
	 // WebCore/KHTML
		(function(c) 
		{
			try
			{
				for (var i in c)
				{
					window["HTML" + i + "Element"] = document.createElement(c[i]).constructor;
				}
			}
			catch(e)
			{
			}
		}
		)(
		{
			Html: "html", Head: "head", Link: "link", Title: "title", Meta: "meta",
			Base: "base", IsIndex: "isindex", Style: "style", Body: "body", Form: "form",
			Select: "select", OptGroup: "optgroup", Option: "option", Input: "input",
			TextArea: "textarea", Button: "button", Label: "label", FieldSet: "fieldset",
			Legend: "legend", UList: "ul", OList: "ol", DList: "dl", Directory: "dir",
			Menu: "menu", LI: "li", Div: "div", Paragraph: "p", Heading: "h1", Quote: "q",
			Pre: "pre", BR: "br", BaseFont: "basefont", Font: "font", HR: "hr", Mod: "ins",
			Anchor: "a", Image: "img", Object: "object", Param: "param", Applet: "applet",
			Map: "map", Area: "area", Script: "script", Table: "table", TableCaption: "caption",
			TableCol: "col", TableSection: "tbody", TableRow: "tr", TableCell: "td",
			FrameSet: "frameset", Frame: "frame", IFrame: "iframe"
		});
		function HTMLElement() {}
		HTMLElement.prototype     = HTMLHtmlElement.__proto__.__proto__;	
		var HTMLDocument          = document.constructor;
		var HTMLCollection        = document.links.constructor;
		var HTMLOptionsCollection = document.createElement("select").options.constructor;
		var Text                  = document.createTextNode("").constructor;
		var Node                  = Text;
	}
	HTMLElement.prototype.print_r = function (objName)
  	{  	  
  	 	__print_r.call(this, objName);
  	}
}
//Initialize print_r
print_r_Namespace();
