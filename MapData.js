//----------------------------------------------------------------------------------------------------------------------
// Contains the data which defines the walls of the map.  Essentially this map represents an aerial
// view of the maze showing which blocks are walls and which are open spaces.  MapData also contains
// a collection of images associated with the various walls of the maze.
//
// The routines here that set object state can be time consuming so listener callback notification
// patterns are used to keep the caller informed.  To create and use a MapData object, you must
// first call the constructor, then call loadDataFile(), wait for the callback notification, then
// call loadAssociatedImages() and again wait for the callback notification.
//
// @author brianpratt
//----------------------------------------------------------------------------------------------------------------------

// Namespace: MapData
if (MapData == null || typeof(MapData) != "object") {var MapData = new Object();}

//------------------------------------------------------------------------------
// Constructor
//------------------------------------------------------------------------------
MapData = function(document, mazeId, textAreaBox) {
    'use strict';
    this.document = document;
    this.mazeId = mazeId;
    this.textAreaBox = textAreaBox;

    // initialize to default values for demo purposes
    this.mapWidth = 8;          // width should always be a power of 2
    this.mapWidthShift = 3;     // this must be in sync with width for easy division
    this.mapHeight = 8;         // height doesn't have to be a power of 2
    this.numWallImgs = 0;       // number of different wall images
    this.wallCanvasImgs = {};   // associative array of wall images
                                // ... think of this as a map of images indexed by base36 number

    // Here is the arial view or map of the maze with initial values for demo purposes.
    // 1 represents walls and 0 represents open spaces.
    // These are default values which change as data is read in from the WallData.txt file.
    this.mapData = ['1','1','1','1','1','1','1','1',
                    '1','0','0','0','0','0','0','1',
                    '1','0','0','0','0','0','0','1',
                    '1','0','0','0','0','1','1','1',
                    '1','0','0','0','1','1','0','1',
                    '1','0','0','0','0','0','0','1',
                    '1','0','0','0','0','0','0','1',
                    '1','1','1','1','1','1','1','1'];
};

MapData.prototype.MAP_DATA_FILE = "WallData.txt";
MapData.prototype.mapWidth = 8;
MapData.prototype.mapWidthShift = 3;
MapData.prototype.mapHeight = 8;
MapData.prototype.numWallImgs = 0;

//----------------------------------------------------------------------------------------------------------------------
// Loads and parses the MapData file.
//   callBackFunction - Function to call when done loading.
//----------------------------------------------------------------------------------------------------------------------
MapData.prototype.loadDataFile = function(callBackFunction) {
    'use strict';
    var callBackPresent = (typeof(callBackFunction) != "undefined");
    var xmlHttp = this.createXMLHttpRequest();
    var ajaxCall = MazeGlobals.MAZE_DIR + "/" + this.mazeId + "/" + this.MAP_DATA_FILE;
    var that = this;
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState >= 4) {  // ready state 4 is 'Complete'
            if (xmlHttp.status == 200) {
                var rawText = xmlHttp.responseText;
                MapData.parseMapData(that, rawText);
                if (callBackPresent) callBackFunction(true);     // tell caller we are all done loading and all is positive
            }
            if (xmlHttp.status == 404) {
                // tell caller we are all done, but we failed to load due to file not found
                if (callBackPresent) callBackFunction(false, "File not found: " + that.MAP_DATA_FILE);
            }
        }
    };
    xmlHttp.open('GET', ajaxCall);
    xmlHttp.send(null);
};

//----------------------------------------------------------------------------------------------------------------------
// Creates and returns an ajax xhr object.
//----------------------------------------------------------------------------------------------------------------------
MapData.prototype.createXMLHttpRequest = function() {
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
// Returns true if the specified map item is a wall
//------------------------------------------------------------------------------
MapData.prototype.isWall = function(mapPos) {
    'use strict';
	return(!(this.mapData[mapPos] == '0'));
};

//------------------------------------------------------------------------------
// Returns the value at the specified position
//------------------------------------------------------------------------------
MapData.prototype.getValue = function(mapPos) {
    'use strict';
	if (mapPos < 0 || mapPos >= this.mapHeight << this.mapWidthShift) return('0');
	else return(this.mapData[mapPos]);
};

//------------------------------------------------------------------------------
// Takes x, y coordinates and converts them to a position in the one
// dimensional array representing the aerial view of the maze map
//------------------------------------------------------------------------------
MapData.prototype.convertPointToMapPos = function(x, y) {
    'use strict';
	return ((y << this.mapWidthShift) + x);    // shifting makes this go faster
};

//----------------------------------------------------------------------------------------------------------------------
// Parses the data from the MapData file
//----------------------------------------------------------------------------------------------------------------------
MapData.parseMapData = function(that, data) {
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
            if (MapData.isLineLengthGood(that.mapWidth)) {
                that.mapWidthShift = MathUtils.logarithmBaseTwo(that.mapWidth);
            } else {
                that.mapWidth = -1;     // flag indicates something is wrong
                break;
            }
        } else {
            if (cleanLine.length != that.mapWidth) {
                var errStr = "Line # " + lineNum + " in file '" + that.MAP_DATA_FILE + "' is inconsistent with the first line of the file. ";
                errStr += "Each line in the file must be the exact same length.";
                that.textAreaBox.dumpError(errStr);
                break;
            }
        }
        cleanLine = cleanLine.toLowerCase();
        completeFile += cleanLine;
    }

    console.log('num lines in map file is: ' + lineNum);

    if (that.mapWidth != -1) {      // -1 indicates something is messed  up
        that.mapHeight = lineNum;
        that.mapData = completeFile.split('');
        MapData.setAllTimeHighImageNum(that);
    }
};

//----------------------------------------------------------------------------------------------------------------------
// Sets object property based upon the highest image number encountered in the wall data.
//----------------------------------------------------------------------------------------------------------------------
MapData.setAllTimeHighImageNum = function(that) {
    'use strict';
    for (var i = 0; i < that.mapData.length; i++) {
        var curVal = MathUtils.base36ToBase10(that.mapData[i]);
        that.numWallImgs = Math.max(curVal, that.numWallImgs);
    }
    console.log('MapData.js: number of wall images expected is: ' + that.numWallImgs);
};

//----------------------------------------------------------------------------------------------------------------------
// Checks to make sure the line width is good - it must be a power of two so we can do the fast div and mult.
//----------------------------------------------------------------------------------------------------------------------
MapData.isLineLengthGood = function(width)  {
    'use strict';
    if ((width != 16) && (width != 32) && (width != 64) && (width != 128) && (width != 256)) {
        var errStr = "The length of the first line in file '" + that.MAP_DATA_FILE + "' is " + width + ".";
        errStr += "Line length must be 16, 32, 64, 128, or 256.";
        that.textAreaBox.dumpError(errStr);
        return false;
    }
    return true;
};

//----------------------------------------------------------------------------------------------------------------------
// Loads each and every image associated with the MapData file.
//   callBackFunction - Function to inform the caller that we are done loading.
//----------------------------------------------------------------------------------------------------------------------
MapData.prototype.loadAssociatedImages = function(callBackFunction) {
    'use strict';
    var callBackPresent = (typeof(callBackFunction) != "undefined");
    var curImageNum = 1;
    var that = this;
    var loadImageCanvasFunction = function() {

        var b36 = MathUtils.base10ToBase36(curImageNum);
        //var imageCanvas = new ImageCanvas(that.document, MazeGlobals.MAZE_DIR + "/" + that.mazeId + "/Wall" + b36 + ".gif", 64, 64);
        var imageCanvas = new ImageCanvas(that.document, that.mazeId, "Wall" + b36 + ".gif", 64, 64);

        // this is a loop through recursion and callback
        // ... once an image is loaded this inline function below is called (as a callback)
        // ... we then increment and move to the next image through recursion
        imageCanvas.loadFile(function(statusGood, message) {
            if (statusGood === false) console.log(message);

            that.wallCanvasImgs[b36] = imageCanvas; // save this image to a map of images indexed by base36 number
            curImageNum++;                          // move on to next image
            if (curImageNum > that.numWallImgs){
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
MapData.prototype.getCanvasImage = function(ch) {
    'use strict';
    if (this.wallCanvasImgs.hasOwnProperty(ch)) {
        return this.wallCanvasImgs[ch];
    }
    return null;
}


