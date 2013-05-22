//----------------------------------------------------------------------------------------------------------------------
// Simple object to hold Trap info.
//----------------------------------------------------------------------------------------------------------------------

// Namespace: Trap
if (Trap == null || typeof(Trap) != "object") {var Trap = new Object();}

//----------------------------------------------------------------------------------------------------------------------
// Constructor
//----------------------------------------------------------------------------------------------------------------------
Trap = function() {
    'use strict';
    this.leftSide = 0;
    this.rightSide = 0;
    this.topSide = 0;
    this.bottomSide = 0;

    this.usingDest = false;
    this.gotoDest = 0;

    this.usingOverlay = false;      // true - overlay exists for this trap
    this.overlayFile = "";          // file name of overlay image file
    this.overlayPixels = null;     // pixels from overlay image file

    this.usingSound = false;
    this.soundFile = "";
};

//----------------------------------------------------------------------------------------------------------------------
// Returns true if the x and y coordinates are inside the trap.
//----------------------------------------------------------------------------------------------------------------------
Trap.prototype.insideThisTrap = function(x, y) {
    'use strict';
    return ((x >= this.leftSide) && (x <= this.rightSide) && (y >= this.topSide) && (y <= this.bottomSide));
};