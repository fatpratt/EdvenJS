//--------------------------------------------------------------------------------------------------
// Helper class used to draw opening credits including the background image and text.
//
// Additionally methods below (startTheStopWatch and getStopWatchTimeRemaining) provide
// a mechanism for timing the opening credits so the opening credits can appear
// while other resources are loading and yet the opening credits will appear for a minimal set
// time.
//
// @author brianpratt
//--------------------------------------------------------------------------------------------------

// Namespace: OpeningCredits
if (OpeningCredits == null || typeof(OpeningCredits) != "object") {var OpeningCredits = new Object();}

//----------------------------------------------------------------------------------------------------------------------
// Constructor - Establish member variables used to in drawing routine.
//----------------------------------------------------------------------------------------------------------------------
OpeningCredits = function(generalConfig) {
    'use strict';
    OpeningCredits.STOP_WATCH_DURATION = 4500;    // how long should the opening credits appear
    this.generalConfig = generalConfig;
    this.startTime = -1;
};

//----------------------------------------------------------------------------------------------------------------------
// Draws the opening credits (bitmap and text) on the specified context.
//----------------------------------------------------------------------------------------------------------------------
OpeningCredits.prototype.drawOpeningCredits = function(canvasContext) {
    'use strict';
    var memPixels = canvasContext.createImageData(MazeGlobals.PROJECTIONPLANEWIDTH, MazeGlobals.PROJECTIONPLANEHEIGHT);
    var imageCanvas = this.generalConfig.openingCreditImg;

    for (var row = 0; row < (MazeGlobals.PROJECTIONPLANEHEIGHT); row++) {
        for (var col = 0; col < MazeGlobals.PROJECTIONPLANEWIDTH; col++) {
            var index = (col + row * MazeGlobals.PROJECTIONPLANEWIDTH) * 4;
            var red = imageCanvas.imageData.data[index + 0];
            var green = imageCanvas.imageData.data[index + 1];
            var blue = imageCanvas.imageData.data[index + 2];

            var destIndex = (col + row * memPixels.width) * 4;
            memPixels.data[destIndex + 0] = red;
            memPixels.data[destIndex + 1] = green;
            memPixels.data[destIndex + 2] = blue;
            memPixels.data[destIndex + 3] = 0xff;  // 0xff is opaque
        }
    }
    canvasContext.putImageData(memPixels, 0, 0);

    canvasContext.font = '' + this.generalConfig.fontSizeLine1 + 'px Arial';
    canvasContext.fillStyle = '' + this.generalConfig.line1Clr;
    var metrics = canvasContext.measureText(this.generalConfig.titleLine1);
    var metricWidth = metrics.width;
    var leftDisplaceForCentering = (MazeGlobals.PROJECTIONPLANEWIDTH / 2) - (metricWidth / 2);
    canvasContext.fillText(this.generalConfig.titleLine1, leftDisplaceForCentering, this.generalConfig.yPosLine1);

    canvasContext.font = '' + this.generalConfig.fontSizeLine2 + 'px Arial';
    canvasContext.fillStyle = '' + this.generalConfig.line2Clr;
    metrics = canvasContext.measureText(this.generalConfig.titleLine2);
    metricWidth = metrics.width;
    leftDisplaceForCentering = (MazeGlobals.PROJECTIONPLANEWIDTH / 2) - (metricWidth / 2);
    canvasContext.fillText(this.generalConfig.titleLine2, leftDisplaceForCentering, this.generalConfig.yPosLine2);

    canvasContext.font = '' + this.generalConfig.fontSizeLine3 + 'px Arial';
    canvasContext.fillStyle = '' + this.generalConfig.line3Clr;
    metrics = canvasContext.measureText(this.generalConfig.titleLine3);
    metricWidth = metrics.width;
    leftDisplaceForCentering = (MazeGlobals.PROJECTIONPLANEWIDTH / 2) - (metricWidth / 2);
    canvasContext.fillText(this.generalConfig.titleLine3, leftDisplaceForCentering, this.generalConfig.yPosLine3);

    canvasContext.font = '' + this.generalConfig.fontSizeLine4 + 'px Arial';
    canvasContext.fillStyle = '' + this.generalConfig.line4Clr;
    metrics = canvasContext.measureText(this.generalConfig.titleLine4);
    metricWidth = metrics.width;
    leftDisplaceForCentering = (MazeGlobals.PROJECTIONPLANEWIDTH / 2) - (metricWidth / 2);
    canvasContext.fillText(this.generalConfig.titleLine4, leftDisplaceForCentering, this.generalConfig.yPosLine4);
};

//----------------------------------------------------------------------------------------------------------------------
// To be called right after calling drawOpeningCredits(), this method records the starting time.
//----------------------------------------------------------------------------------------------------------------------
OpeningCredits.prototype.startTheStopWatch = function () {
    this.startTime = (new Date()).getTime();
};

//----------------------------------------------------------------------------------------------------------------------
// Returns the time remaining on the stop watch, telling the caller how much longer the opening credits should remain.
//----------------------------------------------------------------------------------------------------------------------
OpeningCredits.prototype.getStopWatchTimeRemaining = function () {
    if (this.startTime === -1) return OpeningCredits.STOP_WATCH_DURATION;  // stop watch not started
    var curTime = (new Date()).getTime();
    var runningTime = curTime - this.startTime;
    if (runningTime > OpeningCredits.STOP_WATCH_DURATION) return 0;
    else return OpeningCredits.STOP_WATCH_DURATION - runningTime;
};

