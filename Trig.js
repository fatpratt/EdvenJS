//----------------------------------------------------------------------------------------------------------------------
// This file defines pre-calculated trigonometry values for a set of select angles relevant to ray casting.
// Also contained, herein are helpful trigonometric methods.
//----------------------------------------------------------------------------------------------------------------------

// Namespace: Trig
if (Trig == null || typeof(Trig) != "object") {var Trig = new Object();}

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