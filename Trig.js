//----------------------------------------------------------------------------------------------------------------------
// This file defines pre-calculated trigonometry values for a set of select angles relevant to ray casting.
// Also contained, herein are helpful trigonometric methods.
//
// @author brianpratt
//----------------------------------------------------------------------------------------------------------------------

// Namespace: Trig
if (Trig == null || typeof(Trig) != "object") {var Trig = new Object();}

//------------------------------------------------------------------------------
// Constructor -- Gets the maze up and running by building the needed math
// tables in memory, sets up the player's initial position and prepares memory
// image for drawing.
//------------------------------------------------------------------------------
Trig = function() {
    'use strict';
    this.createTables();
};

Trig.prototype.ANGLE60 = MazeGlobals.PROJECTIONPLANEWIDTH;            // field of view for player is 60 degrees and it follows
                                                                      // ...that 5.33 is the ratio of proj plan pixels and angle
Trig.prototype.ANGLE30  = Math.round(Trig.prototype.ANGLE60 / 2);
Trig.prototype.ANGLE90  = Math.round(Trig.prototype.ANGLE30 * 3);
Trig.prototype.ANGLE180 = Math.round(Trig.prototype.ANGLE90 * 2);
Trig.prototype.ANGLE270 = Math.round(Trig.prototype.ANGLE90 * 3);
Trig.prototype.ANGLE360 = Math.round(Trig.prototype.ANGLE60 * 6);
Trig.prototype.ANGLE0   = 0;
Trig.prototype.ANGLE5   = Math.round(Trig.prototype.ANGLE30 / 6);
Trig.prototype.ANGLE10  = (Trig.prototype.ANGLE5 * 2);
Trig.prototype.ANGLE45  = Trig.prototype.ANGLE5 + Trig.prototype.ANGLE10 + Trig.prototype.ANGLE10 + Trig.prototype.ANGLE10 + Trig.prototype.ANGLE10;
Trig.prototype.ANGLE135 = Trig.prototype.ANGLE90 + Trig.prototype.ANGLE45;
Trig.prototype.ANGLE225 = Trig.prototype.ANGLE180 + Trig.prototype.ANGLE45;
Trig.prototype.ANGLE315 = Trig.prototype.ANGLE270 + Trig.prototype.ANGLE45;
Trig.prototype.ANGLE85  = Trig.prototype.ANGLE90 - Trig.prototype.ANGLE5;
Trig.prototype.ANGLE95  = Trig.prototype.ANGLE90 + Trig.prototype.ANGLE5;
Trig.prototype.ANGLE265 = Trig.prototype.ANGLE270 - Trig.prototype.ANGLE5;
Trig.prototype.ANGLE275 = Trig.prototype.ANGLE270 + Trig.prototype.ANGLE5;
Trig.prototype.ANGLE355 = Trig.prototype.ANGLE360 - Trig.prototype.ANGLE5;
Trig.prototype.ANGLE175 = Trig.prototype.ANGLE180 - Trig.prototype.ANGLE5;
Trig.prototype.ANGLE185 = Trig.prototype.ANGLE180 + Trig.prototype.ANGLE5;

// large precomputed trig and math tables for every possible angle making life easier at runtime
Trig.prototype.sinTable = [];
Trig.prototype.iSinTable = [];   // inverse sin table -- 1/sin(alpha)
Trig.prototype.cosTable = [];
Trig.prototype.iCosTable = [];   // inverse cosine table -- 1/cos(alpha)
Trig.prototype.tanTable = [];
Trig.prototype.iTanTable = [];   // inverse tangent table -- 1/tan(alpha)
Trig.prototype.fishTable = [];   // corrects fish eye view
Trig.prototype.xStepTable = [];  // for each possible angle, here is how far X spans when Y spans by 64
Trig.prototype.yStepTable = [];  // for each possible angle, here is how far Y spans when X spans by 64

//------------------------------------------------------------------------------
// Sets up the precalculated trig and math tables in memory which are indexed
// by angle look-ups to make things run smoothly at render time.  Tables are
// set up to handle every possible angle.
//------------------------------------------------------------------------------
Trig.prototype.createTables = function() {
    'use strict';
    var i = 0;
    var radian = 0.0;

    this.sinTable   = new Array(this.ANGLE360 + 1);    // big tables for every possible angle
	this.iSinTable  = new Array(this.ANGLE360 + 1);
	this.cosTable   = new Array(this.ANGLE360 + 1);
	this.iCosTable  = new Array(this.ANGLE360 + 1);
	this.tanTable   = new Array(this.ANGLE360 + 1);
	this.iTanTable  = new Array(this.ANGLE360 + 1);
	this.fishTable  = new Array(this.ANGLE60 + 1);
	this.xStepTable = new Array(this.ANGLE360 + 1);
	this.yStepTable = new Array(this.ANGLE360 + 1);

    for (i = 0; i <= this.ANGLE360; i++) {
	    radian = this.arcToRad(i) + (0.0001);  // convert to radian value for trig calls
	    this.sinTable[i] = Math.sin(radian);
	    this.iSinTable[i] = (1.0 / (this.sinTable[i]));

	    this.cosTable[i] = Math.cos(radian);
	    this.iCosTable[i] = (1.0 / (this.cosTable[i]));

	    this.tanTable[i] = Math.tan(radian);
	   	this.iTanTable[i] = (1.0 / this.tanTable[i]);

	    // west portion of aerial map
	   	if (i >= this.ANGLE90 && i < this.ANGLE270) {
	   		this.xStepTable[i] = (1.0 * MazeGlobals.TILE_SIZE / this.tanTable[i]);
	   		if (this.xStepTable[i] > 0)
	   			this.xStepTable[i] = -this.xStepTable[i];
    	}

	   	// east portion of aerial map
	   	else {
	   		this.xStepTable[i] = (1.0 * MazeGlobals.TILE_SIZE / this.tanTable[i]);
	   		if (this.xStepTable[i] < 0)
	   			this.xStepTable[i] = -this.xStepTable[i];
	   	}

	   	// facing bottom portion of aerial map
	   	if (i >= this.ANGLE0 && i < this.ANGLE180) {
	   		this.yStepTable[i] = (1.0 * MazeGlobals.TILE_SIZE * this.tanTable[i]);
	   		if (this.yStepTable[i] < 0)
	   			this.yStepTable[i] = -this.yStepTable[i];
	   	}

	   	// facing upper portion of aerial map
	   	else {
	   		this.yStepTable[i] = (1.0 * MazeGlobals.TILE_SIZE * this.tanTable[i]);
	   		if (this.yStepTable[i] > 0)
	   			this.yStepTable[i] = -this.yStepTable[i];
	   	}
	}

    // build tables to correct fish eye view
    for (i = -this.ANGLE30; i <= this.ANGLE30; i++) {
    	radian = this.arcToRad(i);
    	this.fishTable[i + this.ANGLE30] = (1.0 / Math.cos(radian));
    }
};

//------------------------------------------------------------------------------
// Convert from arc angles to radians for trig functions.
//------------------------------------------------------------------------------
Trig.prototype.arcToRad = function(arcAngle) {
    'use strict';
	return(1.0 * (arcAngle * Math.PI) / this.ANGLE180);
};

//----------------------------------------------------------------------------------------------------------------------
// Converts from ordinary degrees to the unique maze angle units used throughout.
// For example:    60 (input)   320 (output)
// @param degreesAngle Ordinary degrees such as 60, 320, 360, etc.
// @return  Returns the unique maze angle units such as ANGLE60, ANGLE360
//----------------------------------------------------------------------------------------------------------------------
Trig.degreesToMazeAngleUnits = function(degreesAngle) {
    'use strict';
    // assumes:   ANGLE60 = PROJECTIONPLANEWIDTH
    return ~~((MazeGlobals.PROJECTIONPLANEWIDTH * degreesAngle) / 60.0);
};