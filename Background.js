/**
 * @license Copyright 2014 EdVentureMaze.com
 */
//--------------------------------------------------------------------------------------------------
// Used to define a cache of pixels which define the background image in the view.
// @author brianpratt
//--------------------------------------------------------------------------------------------------

// Namespace: Background
if (Background == null || typeof(Background) != "object") {var Background = new Object();}

//--------------------------------------------------------------------------------------------------
// Constructor
//--------------------------------------------------------------------------------------------------
Background = function(canvasContext) {
    'use strict';
    this.memPixels = canvasContext.createImageData(MazeGlobals.PROJECTIONPLANEWIDTH, MazeGlobals.PROJECTIONPLANEHEIGHT);
};

Background.prototype.backgroundFile = "";
Background.prototype.backgroundFromFile = false;
Background.prototype.backgroundFromRGB = true;

Background.prototype.memPixels = [];
Background.prototype.skyRed = 40;
Background.prototype.skyGreen = 125;
Background.prototype.skyBlue = 225;
Background.prototype.skyRedStep = 2;
Background.prototype.skyGreenStep = 0;
Background.prototype.skyBlueStep = 0;
Background.prototype.groundRed = 100;
Background.prototype.groundGreen = 80;
Background.prototype.groundBlue = 40;
Background.prototype.groundRedStep = 1;
Background.prototype.groundGreenStep = 1;
Background.prototype.groundBlueStep = 1;

//--------------------------------------------------------------------------------------------------
//  Sets background state based upon the destination object passed in.
//--------------------------------------------------------------------------------------------------
Background.prototype.setBackgroundFromDest = function(document, mazeId, dest, callBackFunction) {
    'use strict';

    if (dest.useExistingBackground) {
        console.log('Background.js: programmer error... check useExistingBackground property before calling createBackgroundFromDest(). ');
    }

    this.document = document;
    this.mazeId = mazeId;

    this.backgroundFile = dest.backgroundFile;
    this.backgroundFromFile = dest.backgroundFromFile;
    this.backgroundFromRGB = dest.backgroundFromRGB;

    this.skyRed = dest.skyRed;
    this.skyGreen = dest.skyGreen;
    this.skyBlue = dest.skyBlue;
    this.groundRed = dest.groundRed;
    this.groundGreen = dest.groundGreen;
    this.groundBlue = dest.groundBlue;

    this.skyRedStep = dest.skyRedStep;
    this.skyGreenStep = dest.skyGreenStep;
    this.skyBlueStep = dest.skyBlueStep;

    this.groundRedStep = dest.groundRedStep;
    this.groundGreenStep = dest.groundGreenStep;
    this.groundBlueStep = dest.groundBlueStep;

    if (this.backgroundFromRGB) {
        this.createGradientBackground(callBackFunction);
    }
    if (this.backgroundFromFile) {
        this.createBackgroundFromFile(callBackFunction);
    }
};

//--------------------------------------------------------------------------------------------------
// Creates a background based upon image.
//--------------------------------------------------------------------------------------------------
Background.prototype.createBackgroundFromFile = function(callBackFunction) {
    'use strict';
    var callBackPresent = (typeof(callBackFunction) !== "undefined");
    var imageCanvas = new ImageCanvas(this.document, this.mazeId, this.backgroundFile,
        MazeGlobals.PROJECTIONPLANEWIDTH, MazeGlobals.PROJECTIONPLANEHEIGHT);
    var that = this;
    imageCanvas.loadFile(function(statusGood, message) {
        if (statusGood === true) {
            for (var row = 0; row < (MazeGlobals.PROJECTIONPLANEHEIGHT); row++) {
                for (var col = 0; col < MazeGlobals.PROJECTIONPLANEWIDTH; col++) {
                    var index = (col + row * MazeGlobals.PROJECTIONPLANEWIDTH) * 4;
                    var red = imageCanvas.imageData.data[index + 0];
                    var green = imageCanvas.imageData.data[index + 1];
                    var blue = imageCanvas.imageData.data[index + 2];
                    that.setPixel(col, row, red, green, blue);
                }
            }
            if (callBackPresent) callBackFunction(true);    // tell caller we are all done
        } else {
            console.log(message);
            if (callBackPresent) callBackFunction(false);    // tell caller we tried
        }
    });
};

//--------------------------------------------------------------------------------------------------
//  Creates a gradient background.
//--------------------------------------------------------------------------------------------------
Background.prototype.createGradientBackground = function(callBackFunction) {
    'use strict';
    var callBackPresent = (typeof(callBackFunction) !== "undefined");
    var red = this.skyRed;
    var green = this.skyGreen;
    var blue = this.skyBlue;

	// paint sky
	var halfHeight = MazeGlobals.PROJECTIONPLANEHEIGHT >> 1;  // ( >> 1 is dividing by 2)
	for (var row = 0; row < halfHeight; row++) {
        for (var col = 0; col < MazeGlobals.PROJECTIONPLANEWIDTH; col++) {
        	this.setPixel(col, row, red, green, blue);
		}
		red += this.skyRedStep; red = red > 255 ? 255 : red; red = red < 0 ? 0 : red;
		green += this.skyGreenStep; green = green > 255 ? 255 : green; green = green < 0 ? 0 : green;
		blue += this.skyBlueStep; blue = blue > 255 ? 255 : blue; blue = blue < 0 ? 0 : blue;
    }

    red = this.groundRed;
    green = this.groundGreen;
    blue = this.groundBlue;

    // paint ground
    for (row = halfHeight; row < MazeGlobals.PROJECTIONPLANEHEIGHT; row++) {
        for (col = 0; col < MazeGlobals.PROJECTIONPLANEWIDTH; col++) {
            this.setPixel(col, row, red, green, blue);
        }
        red += this.groundRedStep; red = red > 255 ? 255 : red; red = red < 0 ? 0 : red;
        green += this.groundGreenStep; green = green > 255 ? 255 : green; green = green < 0 ? 0 : green;
        blue += this.groundBlueStep; blue = blue > 255 ? 255 : blue; blue = blue < 0 ? 0 : blue;
    }
    if (callBackPresent) callBackFunction(true);    // tell caller we are all done
};

//--------------------------------------------------------------------------------------------------
// Copies the background pixels to the destination.  Assumes the width and height of the destination
// matches the background's dimensions.
// destination - Destination pixel buffer.
//--------------------------------------------------------------------------------------------------
Background.prototype.copyBackgroundTo = function(destination) {
    'use strict';
    for (var row = 0; row < (MazeGlobals.PROJECTIONPLANEHEIGHT); row++) {
        for (var col = 0; col < MazeGlobals.PROJECTIONPLANEWIDTH; col++) {
            var index = (col + row * this.memPixels.width) * 4;
            destination.data[index + 0] = this.memPixels.data[index + 0];
            destination.data[index + 1] = this.memPixels.data[index + 1];
            destination.data[index + 2] = this.memPixels.data[index + 2];
            destination.data[index + 3] = this.memPixels.data[index + 3];
        }
    }
};

//------------------------------------------------------------------------------
// Sets a pixel in the image data buffer based upon the x and y
// position with the specified rgb values.
//------------------------------------------------------------------------------
Background.prototype.setPixel = function(x, y, r, g, b) {
    'use strict';
    var index = (x + y * this.memPixels.width) * 4;
    this.memPixels.data[index + 0] = r;
    this.memPixels.data[index + 1] = g;
    this.memPixels.data[index + 2] = b;
    this.memPixels.data[index + 3] = 0xff;  // 0xff is opaque
};





