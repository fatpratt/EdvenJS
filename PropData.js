//----------------------------------------------------------------------------------------------------------------------
// Contains the data which defines the prop data in the maze.  Essentially this is a map  which represents an aerial
// view of the where the props are placed in the maze.  PropData also contains a collection of images
// associated with the various props of the maze.
//
// The routines here that set object state can be time consuming so listener callback notification
// patterns are used to keep the caller informed.  To create and use a PropData object, you must
// first call the constructor, then call loadDataFile(), wait for the callback notification, then
// call loadAssociatedImages() and again wait for the callback notification.
//
// TODO: Some code here is very similar to the MapData, so we should consolidate in the future.
// @author brianpratt
//----------------------------------------------------------------------------------------------------------------------

// Namespace: PropData
if (PropData == null || typeof(PropData) != "object") {var PropData = new Object();}

//------------------------------------------------------------------------------
// Constructor - pass in width and height values from the mapData since propData
// and mapData must jive.
//------------------------------------------------------------------------------
PropData = function(document, mazeId, textAreaBox, mapHeight, mapWidth, mapWidthShift) {
    'use strict';
    this.document = document;
    this.mazeId = mazeId;
    this.textAreaBox = textAreaBox;

    // initialize values using defaults or values passed in
    this.mapWidth = mapWidth;
    this.mapWidthShift = mapWidthShift;
    this.mapHeight = mapHeight;
    this.numPropImgs = 0;
    this.propCanvasImgs = {};   // associative array of prop images
                                // ... think of this as a map of images indexed by base36 number

    // Here is the arial view or map of the props with initial default values for demo purposes.
    // 1 , 2, 3 represent different props at various locations
    // These are default values which change as data is read in from the PropData.txt file.
    this.propData = ['0','0','0','0','0','0','0','0',
                     '0','0','0','0','0','0','0','0',
                     '0','0','0','0','0','3','0','0',
                     '0','0','0','0','2','0','1','0',
                     '0','0','0','0','0','0','0','0',
                     '0','0','0','0','0','0','0','0',
                     '0','0','0','0','0','0','0','0',
                     '0','0','0','0','0','0','0','0'];
}

PropData.prototype.PROP_DATA_FILE = "PropData.txt";
PropData.prototype.mapWidth = 8;
PropData.prototype.mapHeight = 8;
PropData.prototype.mapWidthShift = 3;
PropData.prototype.numPropImgs = 0;

//----------------------------------------------------------------------------------------------------------------------
// Loads and parses the PropData file.
//   callBackFunction - Function to call when done loading.
//----------------------------------------------------------------------------------------------------------------------
PropData.prototype.loadDataFile = function(callBackFunction) {
    'use strict';
    var callBackPresent = (typeof(callBackFunction) != "undefined");
    var xmlHttp = this.createXMLHttpRequest();
    var ajaxCall = MazeGlobals.MAZE_DIR + "/" + this.mazeId + "/" + this.PROP_DATA_FILE;
    var that = this;
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState >= 4) {  // ready state 4 is 'Complete'
            if (xmlHttp.status == 200) {
                var rawText = xmlHttp.responseText;
                PropData.parsePropData(that, rawText);
                if (callBackPresent) callBackFunction(true);     // tell caller we are all done loading and all is positive
            }
            if (xmlHttp.status == 404) {
                // tell caller we are all done, but we failed to load due to file not found
                if (callBackPresent) callBackFunction(false, "File not found: " + that.PROP_DATA_FILE);
            }
        }
    };
    xmlHttp.open('GET', ajaxCall);
    xmlHttp.send(null);
};

//----------------------------------------------------------------------------------------------------------------------
// Creates and returns an ajax xhr object.
//----------------------------------------------------------------------------------------------------------------------
PropData.prototype.createXMLHttpRequest = function() {
    'use strict';
    var xmlHttp = null;
    if (window.ActiveXObject) {
        xmlHttp = new ActiveXObject('Microsoft.XMLHTTP');
    }
    else if (window.XMLHttpRequest) {
        xmlHttp = new XMLHttpRequest();
    }
    return xmlHttp;
};

//------------------------------------------------------------------------------
// Returns true if the specified map item is a prop.
//------------------------------------------------------------------------------
PropData.prototype.isProp = function(mapPos) {
    'use strict';
	return(!(this.propData[mapPos] == '0'));
};

//------------------------------------------------------------------------------
// Returns the value at the specified position
//------------------------------------------------------------------------------
PropData.prototype.getValue = function(mapPos) {
    'use strict';
	if (mapPos < 0 || mapPos >= this.mapHeight << this.mapWidthShift) return('0');
	else return(this.propData[mapPos]);
};

//------------------------------------------------------------------------------
// Takes x, y coordinates and converts them to a position in the one
// dimensional array representing the aerial view of the maze map
//------------------------------------------------------------------------------
PropData.prototype.convertPointToMapPos = function(x, y) {
    'use strict';
	return ((y << this.mapWidthShift) + x);    // shifting makes this go faster
};

//----------------------------------------------------------------------------------------------------------------------
// Parses the data from the PropData file
//----------------------------------------------------------------------------------------------------------------------
PropData.parsePropData = function(that, data) {
    'use strict';
    var lineNum = 0;
    that.mapWidth = -1;    // denotes first time through loop
    var completeFile = "";

    var lines = data.split(/\r\n|\r|\n/);
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (line == null || line.length == 0) continue;
        var cleanLine = line.replace(/(\/\*([\s\S]*?)\*\/)|(\/\/(.*)$)/g, '');  // clean out double slash comments on side
        if (cleanLine.length == 0) continue;
        lineNum++;
        if (that.mapWidth == -1) {              // set Width/WidthShift fields the first time only
            that.mapWidth = cleanLine.length;   // first line dictates the size of all lines in file
            if (PropData.isLineLengthGood(that.mapWidth)) {
                that.mapWidthShift = MathUtils.logarithmBaseTwo(that.mapWidth);
            } else {
                that.mapWidth = -1;     // flag indicates something is wrong
                break;
            }
        } else {
            if (cleanLine.length != that.mapWidth) {
                var errStr = "Line # " + lineNum + " in file '" + that.PROP_DATA_FILE + "' is inconsistent with the first line of the file. ";
                errStr += "Each line in the file must be the exact same length.";
                that.textAreaBox.dumpError(errStr);
                break;
            }
        }
        cleanLine = cleanLine.toLowerCase();
        completeFile += cleanLine;
    }

    console.log('num lines in map file is: ' + lineNum);
    if (lineNum != that.mapHeight) {
        var errStr = "The number of lines in the file '" + that.PROP_DATA_FILE + "' doesn't match the ";
        errStr += "number of lines in the wall file .";
        that.textAreaBox.dumpError(errStr);
    }

    if (that.mapWidth != -1) {      // -1 indicates something is messed  up
        that.mapHeight = lineNum;
        that.propData = completeFile.split('');
        PropData.setAllTimeHighImageNum(that);
    }
};

//----------------------------------------------------------------------------------------------------------------------
// Sets object property based upon the highest image number encountered in the prop data.
//----------------------------------------------------------------------------------------------------------------------
PropData.setAllTimeHighImageNum = function(that) {
    'use strict';
    for (var i = 0; i < that.propData.length; i++) {
        var curVal = MathUtils.base36ToBase10(that.propData[i]);
        that.numPropImgs = Math.max(curVal, that.numPropImgs);
    }
    console.log('PropData.js: number of prop images expected is: ' + that.numPropImgs);
};

//----------------------------------------------------------------------------------------------------------------------
// Checks to make sure the line width is good - it must be a power of two so we can do the fast div and mult.
//----------------------------------------------------------------------------------------------------------------------
PropData.isLineLengthGood = function(width)  {
    'use strict';
    if ((width != 16) && (width != 32) && (width != 64) && (width != 128) && (width != 256)) {
        var errStr = "The length of the first line in file '" + that.PROP_DATA_FILE + "' is " + width + ".";
        errStr += "Line length must be 16, 32, 64, 128, or 256.";
        that.textAreaBox.dumpError(errStr);
        return false;
    }
    return true;
};

//----------------------------------------------------------------------------------------------------------------------
// Loads each and every image associated with the PropData file.
//   callBackFunction - Function to inform the caller that we are done loading.
//----------------------------------------------------------------------------------------------------------------------
PropData.prototype.loadAssociatedImages = function(callBackFunction) {
    'use strict';
    var callBackPresent = (typeof(callBackFunction) != "undefined");
    var curImageNum = 1;
    var that = this;
    var loadImageCanvasFunction = function() {

        var b36 = MathUtils.base10ToBase36(curImageNum);
        var imageCanvas = new ImageCanvas(that.document, that.mazeId, "Prop" + b36 + ".gif", 64, 64);

        // this is a loop through recursion and callback
        // ... once an image is loaded this inline function below is called (as a callback)
        // ... we then increment and move to the next image through recursion
        imageCanvas.loadFile(function(statusGood, message) {
            if (statusGood === false) console.log(message);

            that.propCanvasImgs[b36] = imageCanvas; // save this image to a map of images indexed by base36 number
            curImageNum++;                          // move on to next image
            if (curImageNum > that.numPropImgs){
                if (callBackPresent) callBackFunction(true);    // we are all done ... inform the listener
            } else {
                loadImageCanvasFunction();     // recursion continues until all images are encountered
            }
        });
    };
    loadImageCanvasFunction();      // get the ball rolling
};

//----------------------------------------------------------------------------------------------------------------------
// Returns the ImageCanvas associated with the specified ch.
//----------------------------------------------------------------------------------------------------------------------
PropData.prototype.getCanvasImage = function(ch) {
    'use strict';
    if (this.propCanvasImgs.hasOwnProperty(ch)) {
        return this.propCanvasImgs[ch];
    }
    return null;
};


