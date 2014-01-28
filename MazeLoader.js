
//----------------------------------------------------------------------------------------------------------------------
// Gets maze up and running.  So much of the maze loading relies on a series of asynchronous methods.  Therefore much
// of the code below is implemented as a series of callback chaining to avoid "callback spaghetti" running off into
// the hell of the right margin.
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
MazeLoader.background = null;
MazeLoader.landscape = null;
MazeLoader.ctx = null;

var captureKey = false;

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
        MazeLoader.questionPosData,
        MazeLoader.background,
        MazeLoader.landscape
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
var loadQuestionsCallBack = function(statusGood, message) {
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

// CallBack: when done priming the landscape, we load questions
var loadLandscapeCallBack = function(statusGood) {
    'use strict';
    if (statusGood) {
        console.log('MazeLoader.js: successfully primed the landscape');
        MazeLoader.questions = new Questions(document, MazeLoader.mazeId, MazeLoader.textAreaBox);
        MazeLoader.questions.loadQuestionsFile(loadQuestionsCallBack);
    } else {
        MazeLoader.textAreaBox.dumpError('error priming the landscape: ' + message);
        return;
    }
};

// CallBack: when done priming the background, prime the landscape
var loadBackgroundCallBack = function(statusGood) {
    'use strict';
    if (statusGood) {
        console.log('MazeLoader.js: successfully primed the background');
        var curDest = MazeLoader.mazeConfig.advanceToDest(0);         // peek ahead at first destination to prime landscape image
        MazeLoader.landscape = new Landscape(MazeLoader.ctx);
        MazeLoader.landscape.setLandscapeFromDest(MazeLoader.mazeConfig.document, MazeLoader.mazeConfig.mazeId, curDest, loadLandscapeCallBack);
    } else {
        MazeLoader.textAreaBox.dumpError('error priming the background: ' + message);
        return;
    }
};

// CallBack: when associated images are loaded, load questions
var propDataLoadAssociatedImagesCallBack = function(statusGood, message) {
    'use strict';
    if (statusGood) {
        console.log('MazeLoader.js: successfully loaded associated prop image files');
        var curDest = MazeLoader.mazeConfig.advanceToDest(0);         // peek ahead at first destination to prime background image
        MazeLoader.background = new Background(MazeLoader.ctx);
        MazeLoader.background.setBackgroundFromDest(MazeLoader.mazeConfig.document, MazeLoader.mazeConfig.mazeId, curDest, loadBackgroundCallBack);
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

    // when an alpha num key (1-9, a-z) is hit, it could be a hyperspace request to jump ahead to a question
    var alphaNumKeyHitBehavior = function(questionNum) {
        if (captureKey) {
            MazeLoader.maze.hyperspaceToQuestion(questionNum);
            MazeLoader.maze.renderOneFrame();
        }
        captureKey = false;
    };

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
        },
        191: function() {        // '/' key hit ... capture next key
            captureKey = true;
            setTimeout(function(){
                    captureKey = false
                }, 1500);   // wait only for 1.5 seconds
        },
        49: function() { alphaNumKeyHitBehavior('1') },        // '1' key hit
        50: function() { alphaNumKeyHitBehavior('2') },        // '2' key hit
        51: function() { alphaNumKeyHitBehavior('3') },
        52: function() { alphaNumKeyHitBehavior('4') },
        53: function() { alphaNumKeyHitBehavior('5') },
        54: function() { alphaNumKeyHitBehavior('6') },
        55: function() { alphaNumKeyHitBehavior('7') },
        56: function() { alphaNumKeyHitBehavior('8') },
        57: function() { alphaNumKeyHitBehavior('9') },

        65: function() { alphaNumKeyHitBehavior('a') },
        66: function() { alphaNumKeyHitBehavior('b') },
        67: function() { alphaNumKeyHitBehavior('c') },
        68: function() { alphaNumKeyHitBehavior('d') },
        69: function() { alphaNumKeyHitBehavior('e') },
        70: function() { alphaNumKeyHitBehavior('f') },
        71: function() { alphaNumKeyHitBehavior('g') },
        72: function() { alphaNumKeyHitBehavior('h') },
        73: function() { alphaNumKeyHitBehavior('i') },
        74: function() { alphaNumKeyHitBehavior('j') },
        75: function() { alphaNumKeyHitBehavior('k') },
        76: function() { alphaNumKeyHitBehavior('l') },
        77: function() { alphaNumKeyHitBehavior('m') },
        78: function() { alphaNumKeyHitBehavior('n') },
        79: function() { alphaNumKeyHitBehavior('o') },
        80: function() { alphaNumKeyHitBehavior('p') },
        81: function() { alphaNumKeyHitBehavior('q') },
        82: function() { alphaNumKeyHitBehavior('r') },
        83: function() { alphaNumKeyHitBehavior('s') },
        84: function() { alphaNumKeyHitBehavior('t') },
        85: function() { alphaNumKeyHitBehavior('u') },
        86: function() { alphaNumKeyHitBehavior('v') },
        87: function() { alphaNumKeyHitBehavior('w') },
        88: function() { alphaNumKeyHitBehavior('x') },
        89: function() { alphaNumKeyHitBehavior('y') },
        90: function() { alphaNumKeyHitBehavior('z') }

    }, 100);
};



