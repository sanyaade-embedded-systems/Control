//TODO: this.widgets should hold ALL widgets, including constants. this.constants and this.pages can be used to keep them separated.

function Control() {
	this.widgetCount = 0;
	this.pages = [];
    this.constants = [];
	this.currentPage = 0;
	this.deviceWidth = null;
	this.deviceHeight = null;
	this.values = [];
	this.valuesString = "";
	this.currentTab = document.getElementById("Interfaces");
	this.tabBarHidden = false;
	this.orientation = 0;
 	this.orientationString = "portrait";
 	this.width = screen.width;
 	this.height = screen.height;
	acc = null;
	compass = null;
	gyro = null;
	interfaceDiv = document.getElementById("selectedInterface");
	this.changeTab(this.currentTab);
	this.isAddingConstants = false;
	return this;
}

Control.prototype.init = function() {
    //if(device.platform == 'iPhone') {
        //PhoneGap.exec(null, null, "OSCManager", "startReceiveThread", []);
	    //PhoneGap.exec("CNTRL_Accelerometer.setUpdateRate", 50);
	    //PhoneGap.exec("Gyro.setUpdateRate", 50);	
    //}
}

Control.prototype.makePages = function(_pages,width, height) {
	pages = _pages;
	this.deviceWidth = width;
	this.deviceHeight = height;
    this.ctx = null;
//    {   // main canvas
//        this.canvas = document.getElementById('canvas');
//        this.ctx = this.canvas.getContext("2d");;
//        
//        this.canvas.setAttribute('width',  width);
//        this.canvas.setAttribute('height', height)
//        $("#canvas").css({margin:0, top:0, left:0, position:"absolute"});
//    }
    
    //this.ctx.fillStyle = "rgb(200,0,0)";
    //this.ctx.fillRect (0, 0, width, height);
    
    
	/*interfaceDiv.innerHTML = "";
	interfaceDiv.style.width = this.deviceWidth + "px";
	interfaceDiv.style.height = this.deviceHeight + "px";
    interfaceDiv.style.display = "block";
    interfaceDiv.style.left = "0px";
    interfaceDiv.style.top = "0px";		
    */
	document.addEventListener('touchend', control.event, true);
	document.addEventListener('touchstart', control.event, true);
	document.addEventListener('touchmove', control.event, true);
	//document.addEventListener('touchmove', preventBehavior, false);

    

}

Control.prototype.removeWidgetWithName = function(widgetName) {
	for(var i=0; i < this.widgets.length; i++) {
		var widget = this.widgets[i];
		if(widget.name == widgetName) {
			this.widgets.splice(i,1);
			widget.unload();
			break;
		}
	}
    for(var page = 0; page < control.pages.length; page++) {
		for(var j = 0; j < control.pages[page].length; j++) {
			var widget = control.pages[page][j];
			if(widget.name == widgetName) {
                control.pages[page].splice(j,1);
                widget = null;
			}
		}
	}
	
	for(var i = 0; i < control.constants.length; i++) {
		var widget = control.constants[i];
		if(typeof widget.name == widgetName) {
			control.constants.splice(i,1);
            widget = null;
		}
	}
    
}

Control.prototype.getWidgetWithName = function(widgetName) {
    for(var i=0; i < this.widgets.length; i++) {
		var widget = this.widgets[i];
		if(widget.name == widgetName) {
            return widget;
		}
	}
}

Control.prototype.showToolbar = function() {
	this.tabBarHidden = false;
	$(".ftr").css("visibility", "visible");
}

Control.prototype.hideToolbar = function() {
	this.tabBarHidden = true;
	//window.uicontrols.hideTabBar();
	//window.plugins.nativeControls.hideTabBar();
	//console.log($("#interfaceFooter"));
	//console.log("oOEUBROUEBRONSnodnosd");

	$(".ftr").css("visibility", "hidden");	
}

Control.prototype.setWidgetValueWithMIDIMessage = function(midiType, midiChannel, midiNumber, value) {
	if(typeof this.constants != "undefined") {
		for(var i = 0; i < this.constants.length; i++) {
			var w = this.constants[i];
			if(w.midiType == midiType && w.channel == midiChannel && w.midiNumber == midiNumber) {
				w.setValue(value, false);
				break;
			}else{
				if(w.widgetType == "MultiButton" || w.widgetType == "MultiSlider") { // TODO: optimize so that it looks at address - last digit
					for(var j = 0; j < w.children.length; j++) {
						var child = w.children[j];
						if(child.midiType == midiType && child.channel == midiChannel && child.midiNumber == midiNumber) {
							child.setValue(value, false);
							return;
						}
					}
				}// TODO: MultiTouchXY
			}	
		}
	}
	for(var i = 0; i < this.widgets.length; i++) {
		var w = this.widgets[i];
		if(w.midiType == midiType && w.channel == midiChannel && w.midiNumber == midiNumber) { // TODO: optimize so that it looks at address - last digit
			w.setValue(value, false);
			break;
		}else{
			if(w.widgetType == "MultiButton" || w.widgetType == "MultiSlider") {
				for(var j = 0; j < w.children.length; j++) {
					var child = w.children[j];
					if(child.midiType == midiType && child.channel == midiChannel && child.midiNumber == midiNumber) {
						child.setValue(value, false);
						return;
					}
				}
			}// TODO: MultiTouchXY 
		}	
	}		
}

Control.prototype.unloadWidgets = function() {
	for(var page = 0; page < control.pages.length; page++) {
		for(var j = 0; j < control.pages[page].length; j++) {
			var widget = control.pages[page][j];
			if(typeof widget.unload != "undefined") {
				widget.unload();
			}
			widget = null;
		}
	}
	control.pages = [];
	
	for(var i = 0; i < control.constants.length; i++) {
		var widget = control.constants[i];
		if(typeof widget.unload != "undefined") {
			widget.unload();
		}
		widget = null;
	}
	control.constants = [];
}

Control.prototype.loadConstants = function(_constants) {
	this.isAddingConstants = true;
	if(_constants != null) {
		constants = _constants;

		this.constants = new Array();
		for(var i = 0; i < constants.length; i++) {
			var w = constants[i];
			var _w = this.makeWidget(w);						
			this.constants.push(_w);
			eval("this.addConstantWidget(" + w.name + ");"); // PROBLEM
		}
	}
}
	
Control.prototype.makeWidget = function(w) {
	var _w;
	if(w.type != "Accelerometer" && w.type != "Compass" && w.type != "Gyro") {
		_w = eval(w.name + " = new " + w.type + "(interfaceDiv,w);");
//		_w = eval(w.name + " = new " + w.type + "(interfaceDiv,w,this.ctx);");  
		if(_w.init != null) { 
			_w.init();
		}
	}else{
		if (w.type == "Accelerometer") {
            //acc = null;
            _w = eval(w.name + " = new ControlAccelerometer(w);");
            acc = _w;
		}else if(w.type == "Compass") {
            //compass = null;
            _w = eval(w.name + " = new ControlCompass(w);");
            compass = _w;
		}else if(w.type == "Gyro") {
            //gyro = null;
            _w = eval(w.name + " = new ControlGyro(w);");
            gyro = _w;
		}
        _w.start();        
	}
	_w.widgetID = this.widgetCount++;
	_w.name = w.name;
	return _w;
}

Control.prototype.loadWidgets = function() {
	this.isAddingConstants = false;
	this.widgets = new Array();
	this.pages = new Array();
	var oldCurrentPage = this.currentPage;
	for(this.currentPage = 0; this.currentPage < pages.length; this.currentPage++) {
		this.pages.push(new Array());
        var page = pages[this.currentPage];

		for(var i=0; i < page.length; i++) {
			var w = page[i];
			var _w = this.makeWidget(w);
			this.widgets.push(_w);
			eval("this.addWidget(" + w.name + ", this.currentPage);"); // PROBLEM
		}
	}

	this.currentPage = oldCurrentPage;
}

Control.prototype.getValues = function() { return control.valuesString; }

Control.prototype.clearValuesString = function() { control.valuesString = ""; }

Control.prototype.addConstantWidget = function(widget) {
	if(widget.show != null)
		widget.show();
	
	if(widget.draw != null)
		widget.draw();
		
	eval(widget.oninit);
}

Control.prototype.addWidget = function(widget, page) {
	this.pages[page].push(widget);
	if(page == 0) { // TODO: SHOULD THIS BE VARIABLE?
		if(widget.show != null)
			widget.show();
		
		if(widget.draw != null)
			widget.draw();

	}else{
		if(widget.hide != null)
			widget.hide();
	}
	eval(widget.oninit);
	//widget.oninit();
}


Control.prototype.removeWidget = function(widgetID) {
	shouldRefresh = false;
	
	for(i in this.widgets) {
		widget = this.widgets[i];
		if(widget.id == widgetID) {
			this.widgets.splice(i,1);
			shouldRefresh = true;
			break;
		}
	}
	
	if(shouldRefresh) {
		this.refresh();
	}
}
 
Control.prototype.refresh = function() {
	//this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

	for(i in control.widgets) {
		widget = control.widgets[i];
		//console.log("widget " + widget.widgetID + " not redrawing");
	  
		//if(widget.shouldDraw) {
			widget.draw();
			//widget.shouldDraw = false;
		//}
	}
}

Control.prototype.onRotation = function(event) { control.orientation = event.orientation; }

// multitouch works when a drag has occurred after the each touchdown. It doesn't work if touchdowns occur back to back with nothing in between
Control.prototype.event = function(event) {
  // REMEMBER : IN EVENT METHODS TRIGGERED FROM THE WEBVIEW "THIS" REFERS TO THE HTML OBJECT THAT GENERATED THE EVENT
	var page = control.currentPage;
    
    for (var j = 0; j < event.changedTouches.length; j++) {
		var touch = event.changedTouches.item(j);
        // console.log("touch id:: " + touch.identifier + " || x = " + touch.pageX + " || y = " + touch.pageY);
	}
	//console.log("length = " + control.pages[page].length);
	if(typeof control.pages[page] != "undefined") {
	    for(var i = 0; i < control.pages[page].length; i++) {
    		var widget = control.pages[page][i];
    		//console.log("widget event for " + widget.name);
    		widget.event(event);
    	}
    }
	
	for(var i = 0; i < control.constants.length; i++) {
		var widget = control.constants[i];
		widget.event(event);
	}
}

Control.prototype.drawWidgetsOnPage = function(page) {
	for(i in this.pages[page]) {
		var w = this.pages[page][i];
		w.draw();
	}
}

Control.prototype.changeTab = function(tab) {
    var oldTab = this.currentTab;
	this.currentPage = 0;

    this.currentTab = tab;
    
	if(this.currentTab.id == "selectedInterface") {
		this.tabBarHidden = true;
		control.hideToolbar();
    }else{
      if(this.tabBarHidden) {
        this.tabBarHidden = false;	  
        control.showToolbar();
      }
	  if(oldTab.id == "selectedInterface") {
		control.unloadWidgets();
		$("#SelectedInterfacePage").css({
                            'width':  0,
                            'height': 0,
                            'display': 'block',
                            'top':  0,
                            'left': 0
                        });
		//if(device.platform == 'iPhone') 
          PhoneGap.exec(null,null,"DeviceFeatures","setOrientation2", ["portrait"]); //setOrientation2 doesn't call into interfaceManager after loading widgets
		//window.plugins.nativeControls.showTabBar({"orientation":"portrait",  "position":"bottom"});
	  }
    }
    
    //TODO : make it work to change from landscape selected interface to portrait main menus	
}

Control.prototype.changePage = function(newPage) {
	if(typeof newPage === 'string') {
		if(newPage === 'next') {
		  newPage = this.currentPage + 1;
		}else if(newPage === 'previous') {
		  newPage = this.currentPage - 1;
		}
	}
  
	if(newPage < this.pages.length && newPage >= 0) {
		for(var i = 0; i < this.pages[this.currentPage].length; i++) {
			var w = this.pages[this.currentPage][i];
			if(typeof w.hide != "undefined")
				w.hide();
		}

		this.currentPage = newPage;

		for(var i = 0; i < this.pages[this.currentPage].length; i++) {
			var w = this.pages[this.currentPage][i];
			//console.log("name: " + w.name + " || page : " + this.currentPage);
			if(typeof w.show != "undefined")							
				w.show();
			if(typeof w.draw != "undefined")				
				w.draw();
		}
	}
}