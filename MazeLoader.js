
//----------------------------------------------------------------------------------------------------------------------
// Gets maze up and running.
// @author brianpratt
//----------------------------------------------------------------------------------------------------------------------

// Namespace: MazeLoader
if (MazeLoader == null || typeof(MazeLoader) != "object") {var MazeLoader = new Object();}

MazeLoader.maze = null;
MazeLoader.mapData = null;
MazeLoader.propData = null;
MazeLoader.mazeConfig = null;
MazeLoader.textAreaBox = null;
MazeLoader.ctx = null;

// CallBack
var propDataLoadAssociatedImagesCallBack = function(statusGood2, message2) {
    if (statusGood2) {
        console.log('MazeLoader.js: successfully loaded associated prop image files');
        MazeLoader.maze = new Maze(MazeLoader.ctx, MazeLoader.mapData, MazeLoader.propData, MazeLoader.mazeConfig);       // happy path
        MazeLoader.maze.renderOneFrame();
    } else {
        MazeLoader.textAreaBox.dumpError('error unable to load associated images: ' + message2);
        return;
    }
};

// CallBack
var loadDataFileCallBack = function(statusGood, message) {
    if (statusGood) console.log('MazeLoader.js: Prop Data file successfully loaded.');
    else {
        MazeLoader.textAreaBox.dumpError('error unable to load Prop Data file: ' + message);
        return;
    }
    MazeLoader.propData.loadAssociatedImages(propDataLoadAssociatedImagesCallBack);
};

//----------------------------------------------------------------------------------------------------------------------
// Constructor
//----------------------------------------------------------------------------------------------------------------------
MazeLoader = function() {
};

//--------------------------------------------------------------------------------------------------
// Creates and returns canvas.
//--------------------------------------------------------------------------------------------------
MazeLoader.prototype.createCanvas = function() {
    var targetDiv = document.getElementById("targetCanvasDiv");
    var canvas = document.createElement('canvas');
    canvas.setAttribute("width",  640);
    canvas.setAttribute("height", 200);
    targetDiv.appendChild(canvas);

    // older internet explorer support for canvas... must have excanvas.min.js present and referenced
    if (typeof(G_vmlCanvasManager) != 'undefined') {
        canvas = G_vmlCanvasManager.initElement(canvas);
    }
    return canvas;
};


//--------------------------------------------------------------------------------------------------
// Loads map files, config files and starts things up.
//--------------------------------------------------------------------------------------------------
MazeLoader.prototype.loadAndStart = function(mazeId) {
    MazeLoader.mapData = new MapData(document, mazeId, MazeLoader.textAreaBox);
    MazeLoader.mapData.loadDataFile(function(statusGood, message) {
        if (statusGood) console.log('Maze.html: Map Data file successfully loaded.');
        else {
            MazeLoader.textAreaBox.dumpError('error unable to load Map Data file: ' + message);
            return;
        }
        MazeLoader.mapData.loadAssociatedImages(function(statusGood2, message2) {
            if (statusGood2) console.log('Maze.html: successfully loaded associated wall image files');
            else {
                MazeLoader.textAreaBox.dumpError('error unable to load associated images: ' + message2);
                return;
            }
        });

        MazeLoader.mazeConfig = new MazeConfig(document, mazeId, MazeLoader.textAreaBox, MazeLoader.mapData.mapHeight, MazeLoader.mapData.mapWidth);
        MazeLoader.mazeConfig.loadConfigFile(function(){
            MazeLoader.propData = new PropData(document, mazeId, MazeLoader.textAreaBox, MazeLoader.mapData.mapHeight, MazeLoader.mapData.mapWidth, MazeLoader.mapData.mapWidthShift);
            MazeLoader.propData.loadDataFile(loadDataFileCallBack);

        });
    });
};

//--------------------------------------------------------------------------------------------------
// Main entry point.
//--------------------------------------------------------------------------------------------------
MazeLoader.prototype.init = function() {
    var canvas = this.createCanvas();
    MazeLoader.ctx = canvas.getContext('2d');

    var mazeIdTextFld = document.getElementById("mazeId");
    var mazeId = mazeIdTextFld.value;

    MazeLoader.textAreaBox = new TextAreaBox(MazeLoader.ctx, "black", "#aaaaaa",
        MazeGlobals.PROJECTIONPLANEWIDTH, MazeGlobals.TEXTBOXWIDTH, MazeGlobals.TEXTBOXHEIGHT);
    MazeLoader.textAreaBox.dumpText('test test test');

    if (MazeLoader.ctx.createImageData == null) {
        MazeLoader.textAreaBox.dumpError('Please upgrade your browser. Sorry, your browser is out of date for this viewer to function properly.');
        return;
    }

    this.loadAndStart(mazeId);

    KeyboardController({
        37: function() {            // left
            MazeLoader.maze.rotateLeft();
            MazeLoader.maze.renderOneFrame();
        },
        38: function() {            // up
            MazeLoader.maze.moveForward();
            MazeLoader.maze.renderOneFrame();
        },
        39: function() {            // right
            MazeLoader.maze.rotateRight();
            MazeLoader.maze.renderOneFrame();
        },
        40: function() {            // down
            MazeLoader.maze.moveBackward();
            MazeLoader.maze.renderOneFrame();
        }
    }, 100);
};



