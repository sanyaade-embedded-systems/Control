// Accelerometer is a singleton object.

function ControlAccelerometer(props) {
	this.name = props.name;

	this.x = 0;
	this.y = 0;
	this.z = 0;
	
	var watchID = null;
	this.updateRate = props.updateRate || 10;
	this.delay = 1000 / this.updateRate;
	var first = true;
	
    this.hardwareMin = -9.81; //    
    this.hardwareMax = 9.81;  // says that the range is [0, 1]. But, it seems more like [-1G, 1G]
    this.hardwareRange = this.hardwareMax - this.hardwareMin;
    
	if(_protocol == "MIDI") {
		this.max = (typeof props.midiMax != "undefined") ? props.midiMax : 127;
		this.min = (typeof props.midiMin != "undefined") ? props.midiMin : 0;
	}else{
		this.max = (typeof props.max != "undefined") ? props.max : this.hardwareMax;
		this.min = (typeof props.min != "undefined") ? props.min : this.hardwareMin;			
	}
    this.userDefinedRange = this.max - this.min;
    
	this.isLocal = (typeof props.isLocal != "undefined") ? props.isLocal : false;
    
	this.midiType   = (typeof props.midiType   != "undefined") ? props.midiType   : "cc";
	this.channel    = (typeof props.channel    != "undefined") ? props.channel    : 1;
	this.midiNumber = (typeof props.midiNumber != "undefined") ? props.midiNumber : 0;
	
	this.address = (typeof props.address != "undefined") ? props.address : "/" + this.name;
    console.log("**********************************  ACCELEROMETER INIT");
	//console.log("setting onvaluechange to: " + props.onvaluechange);
	this.onvaluechange = (typeof props.onvaluechange != "undefined") ? props.onvaluechange : null;
    //console.log("set onvaluechange to: " + this.onvaluechange);
    
	this._onAccelUpdate = function(acceleration) {
	    var x = acceleration.x;
	    var y = acceleration.y;
	    var z = acceleration.z;
        //console.log("x = " + x + " || y = " + y + " || z = " + z);
        //console.log("hr : " + acc.hardwareRange + "|| udr : " + acc.userDefinedRange);
        
        // cannot use this inside the callback... ugh    
        acc.x = acc.min + (((0 - acc.hardwareMin) + x) / acc.hardwareRange ) * acc.userDefinedRange;
		acc.y = acc.min + (((0 - acc.hardwareMin) + y) / acc.hardwareRange ) * acc.userDefinedRange;
		acc.z = acc.min + (((0 - acc.hardwareMin) + z) / acc.hardwareRange ) * acc.userDefinedRange;
		
		if (acc.x < acc.min) acc.x = acc.min; if (acc.x > acc.max) acc.x = acc.max;
		if (acc.y < acc.min) acc.y = acc.min; if (acc.y > acc.max) acc.y = acc.max;
		if (acc.z < acc.min) acc.z = acc.min; if (acc.z > acc.max) acc.z = acc.max;				
		
        //console.log("this.x = " + acc.x + " || this.y = " + acc.y + " || z = " + acc.z);
	    // if (first) {
	    //      //console.log("new values: " + x + ", " + y + ", " + z + "; calling " + this.onvaluechange + " with new accell: " + this.x + ", " + this.y + ", " + this.z);
	    //      first = false;
	    //  }
        if(typeof acc.onvaluechange != "undefined") {
			eval(acc.onvaluechange);
		}
        
		if(!acc.isLocal && _protocol == "OSC") {
			// var valueString = "|" + this.address;
			// valueString += ":" + this.x + "," + this.y + "," + this.z;
			// control.valuesString += valueString;
	        PhoneGap.exec(null, null, 'OSCManager', 'send', [acc.address, 'fff', acc.x, acc.y, acc.z] );
		}else if (!this.isLocal && _protocol == "MIDI") {
            // var valueString = "|" + this.midiType + "," + (this.channel - 1) + "," + this.midiNumber+ "," + Math.round(this.x);          
            // control.valuesString += valueString;
            // valueString = "|" + this.midiType + "," + (this.channel - 1) + "," + (this.midiNumber+ 1) + "," + Math.round(this.y);            
            // control.valuesString += valueString;
            // valueString = "|" + this.midiType + "," + (this.channel - 1) + "," + (this.midiNumber+ 2) + "," + Math.round(this.z);            
            // control.valuesString += valueString; 
		}
	}
	
	this.draw = function() {}
	
	this.event = function() {}

    function onSuccess(acceleration) {
        this._onAccelUpdate(acceleration.x, acceleration.y, acceleration.z);
    }		
	
	this.start = function() {
		//PhoneGap.exec("CNTRL_Accelerometer.start", null);
	    console.log("********************************* STARTING ACC");    
        var options = {frequency: Math.round(this.delay)};

//        options.frequency = this.delay;  //options.frequency is actually the period in milliseconds
        console.log("************************ ACC FREQ = " + options.frequency);
        this.watchID = navigator.accelerometer.watchAcceleration(
                this._onAccelUpdate, 
                function(ex) {
                    alert("accel fail (" + ex.name + ": " + ex.message + ")");
                }, options);
        console.log("started accelerometer: "  +this.watchID);	        
	}
			
	this.unload = function() {
	    console.log("stopping accelerometer");
		//PhoneGap.exec("CNTRL_Accelerometer.stop");
	    if (this.watchID) {
	        navigator.accelerometer.clearWatch(this.watchID);
	        this.watchID = null;
	    }	    
	}
    
    this.setUpdateRate = function(rateInHz) {
        console.log("********************************* SETTING UPDATE RATE");    
		//debug.log("setting accelerometer updateRate " + rateInHz);
        //PhoneGap.exec("CNTRL_Accelerometer.setUpdateRate", rateInHz);
        this.unload();
        this.delay = (1/rateInHz) * 1000;
        this.start();
    }
	
	return this;
}