//--------------------------------------------------------------------------------------------------
// Used to define a cache of pixels which define the landscape image in the view.
// @author brianpratt
//--------------------------------------------------------------------------------------------------

// Namespace: Landscape
if (Landscape == null || typeof(Landscape) != "object") {var Landscape = new Object();}

//--------------------------------------------------------------------------------------------------
// Constructor
//--------------------------------------------------------------------------------------------------
Landscape = function(canvasContext) {
    'use strict';
    this.canvasContext = canvasContext;
};

Landscape.prototype.landscapeFile = "";
Landscape.prototype.usingALandscape = false;

Landscape.prototype.canvasContext = null;
Landscape.prototype.width = 0;
Landscape.prototype.height = 0;
Landscape.prototype.memPixels = [];

//--------------------------------------------------------------------------------------------------
// Sets landscape based upon the dest object passed in.
//--------------------------------------------------------------------------------------------------
Landscape.prototype.setLandscapeFromDest = function(document, mazeId, dest, callBackFunction) {
    'use strict';

    if (!dest.usingALandscape) {
        return;
    }

    this.document = document;
    this.mazeId = mazeId;

    this.usingALandscape = dest.usingALandscape;
    this.landscapeFile = dest.landscapeFile;
    this.landscapeOffsetFromTop = dest.landscapeOffsetFromTop;
    this.landscapeStartAngle = dest.landscapeStartAngle;

    this.createLandscapeFromFile(callBackFunction);
};

//--------------------------------------------------------------------------------------------------
// Creates a landscape based upon image.
//--------------------------------------------------------------------------------------------------
Landscape.prototype.createLandscapeFromFile = function(callBackFunction) {
    'use strict';
    var callBackPresent = (typeof(callBackFunction) !== "undefined");
    var imageCanvas = new ImageCanvas(this.document, this.mazeId, this.landscapeFile);
    var that = this;
    imageCanvas.loadFile(function(statusGood, message) {
        if (statusGood === true) {
            that.width = imageCanvas.width;
            that.height = imageCanvas.height;
            that.memPixels = that.canvasContext.createImageData(that.width, that.height);
            for (var row = 0; row < (that.height); row++) {
                for (var col = 0; col < that.width; col++) {
                    var index = (col + row * that.width) * 4;
                    var red = imageCanvas.imageData.data[index + 0];
                    var green = imageCanvas.imageData.data[index + 1];
                    var blue = imageCanvas.imageData.data[index + 2];
                    var alpha = imageCanvas.imageData.data[index + 3];
                    that.setPixel(col, row, red, green, blue, alpha);
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
// Used for testing purposes only, this method copies the landscape pixels to the
// destination - Destination pixel buffer.
//--------------------------------------------------------------------------------------------------
Landscape.prototype.copyLandscapeTo = function(destination) {
    'use strict';
    for (var row = 0; row < this.memPixels.height; row++) {
        for (var col = 0; col < this.memPixels.width; col++) {
            var indexSource = (col + row * this.memPixels.width) * 4;
            var indexDest = (col + row * MazeGlobals.PROJECTIONPLANEWIDTH) * 4;
            if (indexDest + 4 < destination.data.length) {
                destination.data[indexDest + 0] = this.memPixels.data[indexSource + 0];
                destination.data[indexDest + 1] = this.memPixels.data[indexSource + 1];
                destination.data[indexDest + 2] = this.memPixels.data[indexSource + 2];
                destination.data[indexDest + 3] = this.memPixels.data[indexSource + 3];
            }
        }
    }
};

//------------------------------------------------------------------------------
// Sets a pixel in the image data buffer based upon the x and y
// position with the specified rgb values.
//------------------------------------------------------------------------------
Landscape.prototype.setPixel = function(x, y, r, g, b, a) {
    'use strict';
    var index = (x + y * this.memPixels.width) * 4;
    this.memPixels.data[index + 0] = r;
    this.memPixels.data[index + 1] = g;
    this.memPixels.data[index + 2] = b;
    this.memPixels.data[index + 3] = a;
};



