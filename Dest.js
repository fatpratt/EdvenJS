/**
 * @license Copyright 2014 EdVentureMaze.com
 */

//----------------------------------------------------------------------------------------------------------------------
// Simple object to hold Dest info.
// @author brianpratt
//----------------------------------------------------------------------------------------------------------------------

// Namespace: Dest
if (Dest == null || typeof(Dest) != "object") {var Dest = new Object();}

//----------------------------------------------------------------------------------------------------------------------
// Constructor
//----------------------------------------------------------------------------------------------------------------------
Dest = function() {
    'use strict';
    this.xPos = 0;
    this.yPos = 0;
    this.angle = 0;
    this.useExistingAngle = false;       // no angle specified--use player's existing angle

    this.backgroundFromFile = false;     // true --background file specified,  false--RGB values specified
    this.backgroundFromRGB = true;       // false--background file specified,  true--RGB values specified
    this.useExistingBackground = false;  // no background specified--use existing background

    this.backgroundFile = "";            // if fBackgroundFromFile here is its file name

    this.skyRed = 40;                     // if fBackgroundFromRGB here are the RGB specifics
    this.skyGreen = 125;
    this.skyBlue = 225;
    this.skyRedStep = 2;
    this.skyGreenStep = 0;
    this.skyBlueStep = 0;
    this.groundRed = 100;
    this.groundGreen = 80;
    this.groundBlue = 40;
    this.groundRedStep = 1;
    this.groundGreenStep = 1;
    this.groundBlueStep = 1;

    this.usingALandscape = false;
    this.useExistingLandscape = false;  // no landscape specified--use existing landscape
    this.landscapeFile = false;
    this.landscapeOffsetFromTop = 0;
    this.landscapeStartAngle = 0;
};

