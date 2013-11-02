
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

MazeLoader.prototype.upArrowEvent = false;
MazeLoader.prototype.downArrowEvent = false;
MazeLoader.prototype.leftArrowEvent = false;
MazeLoader.prototype.rightArrowEvent = false;
MazeLoader.prototype.courtesyCnt = 0;

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

    intervalId = window.setInterval(this.render, 30);
    window.addEventListener('keydown', this.doKeyDown, false);
    window.addEventListener('keyup',   this.doKeyUp,   false);
};

//--------------------------------------------------------------------------------------------------
// On key down event.
//--------------------------------------------------------------------------------------------------
MazeLoader.prototype.doKeyDown = function(evt) {
    if (MazeLoader.maze == null) return;
    switch (evt.keyCode) {
        case 38: // Up arrow was pressed
            this.upArrowEvent = true;
            break;
        case 40: // Down arrow was pressed
            this.downArrowEvent = true;
            break;
        case 37: // Left arrow was pressed
            this.leftArrowEvent = true;
            break;
        case 39: // Right arrow was pressed
            this.rightArrowEvent = true;
            break;
    }
};

//--------------------------------------------------------------------------------------------------
// On key up event.
//--------------------------------------------------------------------------------------------------
MazeLoader.prototype.doKeyUp = function(evt) {
    if (MazeLoader.maze == null) return;
    switch (evt.keyCode) {
        case 38: // Up arrow was released
            this.upArrowEvent = false;
            break;
        case 40: // Down arrow was released
            this.downArrowEvent = false;
            break;
        case 37: // Left arrow was released
            this.leftArrowEvent = false;
            break;
        case 39: // Right arrow was released
            this.rightArrowEvent = false;
            break;
    }
};

//--------------------------------------------------------------------------------------------------
// Render a frame.
//--------------------------------------------------------------------------------------------------
MazeLoader.prototype.render = function() {
    if (MazeLoader.maze == null) return;

    if (this.upArrowEvent) {
        MazeLoader.maze.moveForward();
        MazeLoader.maze.renderOneFrame();
        this.upArrowEvent = false;
        this.courtesyCnt = 0;
    }

    if (this.downArrowEvent) {
        MazeLoader.maze.moveBackward();
        MazeLoader.maze.renderOneFrame();
        this.downArrowEvent = false;
        this.courtesyCnt = 0;
    }

    if (this.leftArrowEvent) {
        MazeLoader.maze.rotateLeft();
        MazeLoader.maze.renderOneFrame();
        this.leftArrowEvent = false;
        this.courtesyCnt = 0;
    }

    if (this.rightArrowEvent) {
        MazeLoader.maze.rotateRight();
        MazeLoader.maze.renderOneFrame();
        this.rightArrowEvent = false;
        this.courtesyCnt = 0;
    }

    // every once in a while you need to do a courtesy render even if there are no events
    if (this.courtesyCnt == 15) {     // assumes this function is called on a regular interval
        MazeLoader.maze.renderOneFrame();
        this.courtesyCnt = 0;
    }
    this.courtesyCnt++;
};


