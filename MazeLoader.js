
//----------------------------------------------------------------------------------------------------------------------
// Gets maze up and running.  Warning: So much of the maze loading relies on asynchronous methods and callbacks,
// so much of the code here is "callback spaghetti."
// @author brianpratt
//----------------------------------------------------------------------------------------------------------------------

// Namespace: MazeLoader
if (MazeLoader == null || typeof(MazeLoader) != "object") {var MazeLoader = new Object();}

MazeLoader.maze = null;
MazeLoader.mazeId = null;
MazeLoader.mapData = null;
MazeLoader.propData = null;
MazeLoader.mazeConfig = null;
MazeLoader.textAreaBox = null;
MazeLoader.questions = null;
MazeLoader.questionPosData = null;
MazeLoader.openingCredits = null;
MazeLoader.ctx = null;

// CallBack: called when delay for showing the opening credits is complete
var openingCreditsDelayCompleteCallBack = function() {
    'use strict';
    console.log('MazeLoader.js: Opening credits complete.');

    MazeLoader.maze = new Maze(MazeLoader.ctx,           // load maze
        MazeLoader.textAreaBox,
        MazeLoader.mapData,
        MazeLoader.propData,
        MazeLoader.mazeConfig,
        MazeLoader.questions,
        MazeLoader.questionPosData
    );
    MazeLoader.maze.renderOneFrame();
};

// CallBack: when question pos associated images are loaded, keep displaying the opening credits a while longer
var questionPosDataLoadAssociatedImagesCallBack = function(statusGood, message) {
    'use strict';
    if (statusGood) {
        console.log('MazeLoader.js: successfully loaded Questions pos data images ');
        // delay for a short time giving the user time enough to read opening credits
        setTimeout(openingCreditsDelayCompleteCallBack, MazeLoader.openingCredits.getStopWatchTimeRemaining());
    } else {
        MazeLoader.textAreaBox.dumpError('MazeLoader.js: successfully loaded Questions pos data images: ' + message);
        return;
    }
};

// CallBack: when questions are loaded, load question pos data and associated images
var loadQuestionsCallback = function(statusGood, message) {
    'use strict';
    if (statusGood) {
         console.log('MazeLoader.js: successfully loaded Questions file');
         MazeLoader.questionPosData = new QuestionPosData(
             document,
             MazeLoader.mazeId,
             MazeLoader.textAreaBox,
             MazeLoader.mapData.mapHeight,
             MazeLoader.mapData.mapWidth,
             MazeLoader.mapData.mapWidthShift
         );
         MazeLoader.questionPosData.loadDataFile(function(statusGood2, message2) {
             console.log('MazeLoader.js: question pos file load status:' + statusGood2 + " " + message2);
             MazeLoader.questionPosData.loadAssociatedImages(questionPosDataLoadAssociatedImagesCallBack);
         });

     } else {
        MazeLoader.textAreaBox.dumpError('error unable to load Questions file: ' + message);
        return;
     }
};

// CallBack: when associated images are loaded, load questions
var propDataLoadAssociatedImagesCallBack = function(statusGood, message) {
    'use strict';
    if (statusGood) {
        console.log('MazeLoader.js: successfully loaded associated prop image files');
        MazeLoader.questions = new Questions(document, MazeLoader.mazeId, MazeLoader.textAreaBox);
        MazeLoader.questions.loadQuestionsFile(loadQuestionsCallback);
    } else {
        MazeLoader.textAreaBox.dumpError('error unable to load associated images: ' + message);
        return;
    }
};

// CallBack: when data is loaded, load associated images
var loadDataFileCallBack = function(statusGood, message) {
    'use strict';
    if (statusGood) {
        console.log('MazeLoader.js: Prop Data file successfully loaded.');
        MazeLoader.propData.loadAssociatedImages(propDataLoadAssociatedImagesCallBack);                                     // happy path
    }
    else {
        MazeLoader.textAreaBox.dumpError('error unable to load Prop Data file: ' + message);
        return;
    }
};

//----------------------------------------------------------------------------------------------------------------------
// Constructor
//----------------------------------------------------------------------------------------------------------------------
MazeLoader = function() {
    'use strict';
};

//--------------------------------------------------------------------------------------------------
// Creates and returns canvas.
//--------------------------------------------------------------------------------------------------
MazeLoader.prototype.createCanvas = function() {
    'use strict';
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
MazeLoader.prototype.loadAndStart = function() {
    'use strict';
    MazeLoader.mapData = new MapData(document, MazeLoader.mazeId, MazeLoader.textAreaBox);
    MazeLoader.mapData.loadDataFile(function(statusGood, message) {
        if (statusGood) console.log('MazeLoader.js: Map Data file successfully loaded.');
        else {
            MazeLoader.textAreaBox.dumpError('error unable to load Map Data file: ' + message);
            return;
        }
        MazeLoader.mapData.loadAssociatedImages(function(statusGood2, message2) {
            if (statusGood2) {

                console.log('MazeLoader.js: successfully loaded associated wall image files');
                MazeLoader.mazeConfig = new MazeConfig(document, MazeLoader.mazeId, MazeLoader.textAreaBox, MazeLoader.mapData.mapHeight, MazeLoader.mapData.mapWidth);
                MazeLoader.mazeConfig.loadConfigFile(function(){
                    MazeLoader.propData = new PropData(document, MazeLoader.mazeId, MazeLoader.textAreaBox, MazeLoader.mapData.mapHeight, MazeLoader.mapData.mapWidth, MazeLoader.mapData.mapWidthShift);
                    MazeLoader.propData.loadDataFile(loadDataFileCallBack);
                });

            } else {
                MazeLoader.textAreaBox.dumpError('error unable to load associated images: ' + message2);
                return;
            }
        });

    });
};

//--------------------------------------------------------------------------------------------------
// Main entry point.
//--------------------------------------------------------------------------------------------------
MazeLoader.prototype.init = function() {
    'use strict';
    var canvas = this.createCanvas();
    MazeLoader.ctx = canvas.getContext('2d');

    var mazeIdTextFld = document.getElementById("mazeId");
    MazeLoader.mazeId = mazeIdTextFld.value;

    MazeLoader.textAreaBox = new TextAreaBox(MazeLoader.ctx, "black", "#aaaaaa",
        MazeGlobals.PROJECTIONPLANEWIDTH, MazeGlobals.TEXTBOXWIDTH, MazeGlobals.TEXTBOXHEIGHT);
    MazeLoader.textAreaBox.dumpText('test test test');

    if (MazeLoader.ctx.createImageData == null) {
        MazeLoader.textAreaBox.dumpError('Please upgrade your browser. Sorry, your browser is out of date for this viewer to function properly.');
        return;
    }

    var that = this;
    var generalConfig = new GeneralConfig(document, MazeLoader.mazeId, MazeLoader.textAreaBox);
    generalConfig.loadConfigFile(function(statusGood, message) {
        if (!statusGood) {
            MazeLoader.textAreaBox.dumpError('error unable to load General Config file: ' + message);
            return;
        }
        console.log('MazeLoader.js: General Config successfully loaded.');
        generalConfig.loadAssociatedImages(function(statusGood2, message2) {
            if (!statusGood2) {
                MazeLoader.textAreaBox.dumpError('error unable to load General Config associated images: ' + message);
                return;
            }
            console.log('MazeLoader.html: successfully loaded associated general config images.');
            MazeLoader.openingCredits = new OpeningCredits(generalConfig);
            MazeLoader.openingCredits.drawOpeningCredits(MazeLoader.ctx);
            // the opening credits needs to stay visible for a while so in the meantime load images
            // ...start the stop watch running while we load everything else, so we know how long to keep opening credits
            MazeLoader.openingCredits.startTheStopWatch();

            that.loadAndStart();
       });
    });

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



