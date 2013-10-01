//--------------------------------------------------------------------------------------------------
// Used to define a cache of pixels which define the overlay image in the view.
// @author brianpratt
//--------------------------------------------------------------------------------------------------

// Namespace: Overlay
if (Overlay == null || typeof(Overlay) != "object") {var Overlay = new Object();}

//--------------------------------------------------------------------------------------------------
// Constructor
//--------------------------------------------------------------------------------------------------
Overlay = function(canvasContext) {
    'use strict';
    this.memPixels = canvasContext.createImageData(MazeGlobals.PROJECTIONPLANEWIDTH, MazeGlobals.PROJECTIONPLANEHEIGHT);
};

Overlay.prototype.overlayFile = "";
Overlay.prototype.usingOverlay = false;

Overlay.prototype.memPixels = [];

//--------------------------------------------------------------------------------------------------
// Sets overlay based upon the trap object passed in.
//--------------------------------------------------------------------------------------------------
Overlay.prototype.setOverlayFromTrap = function(document, mazeId, trap) {
    'use strict';
    if (!trap.usingOverlay) {
        return;
    }

    this.document = document;
    this.mazeId = mazeId;

    this.usingOverlay = trap.usingOverlay;
    this.overlayFile = trap.overlayFile;

    if (this.usingOverlay) {
        this.createOverlayFromFile();
    }
};

//--------------------------------------------------------------------------------------------------
// Creates an overlay based upon image.
//--------------------------------------------------------------------------------------------------
Overlay.prototype.createOverlayFromFile = function() {
    var imageCanvas = new ImageCanvas(this.document, this.mazeId, this.overlayFile,
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
                    var alpha = imageCanvas.imageData.data[index + 3];
                    that.setPixel(col, row, red, green, blue, alpha);
                }
            }
        } else console.log(message);
    });
};

//--------------------------------------------------------------------------------------------------
// Copies the overlay pixels to the destination.  Assumes the width and height of the destination
// matches the overlay's dimensions.
// destination - Destination pixel buffer.
//--------------------------------------------------------------------------------------------------
Overlay.prototype.copyOverlayTo = function(destination) {
    'use strict';
    for (var row = 0; row < (MazeGlobals.PROJECTIONPLANEHEIGHT); row++) {
        for (var col = 0; col < MazeGlobals.PROJECTIONPLANEWIDTH; col++) {
            var index = (col + row * this.memPixels.width) * 4;
            if (this.memPixels.data[index + 3] != 0) {     // check to make sure pixel is not transparent
                destination.data[index + 0] = this.memPixels.data[index + 0];
                destination.data[index + 1] = this.memPixels.data[index + 1];
                destination.data[index + 2] = this.memPixels.data[index + 2];
                destination.data[index + 3] = this.memPixels.data[index + 3];
            }
        }
    }
};

//------------------------------------------------------------------------------
// Sets a pixel in the image data buffer based upon the x and y
// position with the specified rgb values.
//------------------------------------------------------------------------------
Overlay.prototype.setPixel = function(x, y, r, g, b, a) {
    'use strict';
    var index = (x + y * this.memPixels.width) * 4;
    this.memPixels.data[index + 0] = r;
    this.memPixels.data[index + 1] = g;
    this.memPixels.data[index + 2] = b;
    this.memPixels.data[index + 3] = a;
};





