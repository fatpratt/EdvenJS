//----------------------------------------------------------------------------------------------------------------------
// Contains the question position data for the maze.  Essentially this is a map which represents an aerial
// view of the where the questions are placed in the maze.  QuestionPosData also contains a collection of images
// associated with the various props of the maze.
//
// The routines here that set object state can be time consuming so listener callback notification
// patterns are used to keep the caller informed.  To create and use a QuestionPosData object, you must
// first call the constructor, then call loadDataFile(), wait for the callback notification, then
// call loadAssociatedImages() and again wait for the callback notification.
//
// TODO: Some code here is very similar to the MapData, so we should consolidate in the future.
// @author brianpratt
//----------------------------------------------------------------------------------------------------------------------

// Namespace: QuestionPosData
if (QuestionPosData == null || typeof(QuestionPosData) != "object") {var QuestionPosData = new Object();}

//-----------------------------------------------------------------------------------------
// Constructor - pass in width and height values from the mapData since QuestionPosData
// and mapData must jive.
//-----------------------------------------------------------------------------------------
QuestionPosData = function(document, mazeId, textAreaBox, mapHeight, mapWidth, mapWidthShift) {
    'use strict';
    this.document = document;
    this.mazeId = mazeId;
    this.textAreaBox = textAreaBox;

    // initialize values using defaults or values passed in
    this.mapWidth = mapWidth;
    this.mapWidthShift = mapWidthShift;
    this.mapHeight = mapHeight;

    this.questionToPosMap = {};
    this.questionCanvasImgs = {};   // array of question images, indexed by '?', 'A', 'B', 'C', 'D'

    // Here is the arial view or map of the questions with initial default values for demo purposes.
    // 1 , 2, 3 represent different Questions at various locations
    // These are default values which change as data is read in from the QuestionPosData.txt file.
    this.questionPosData = ['0','0','0','0','0','0','0','0',
                            '0','0','0','0','0','0','0','0',
                            '0','0','1','0','0','0','0','0',
                            '0','0','0','0','0','0','0','0',
                            '0','0','0','0','0','0','0','0',
                            '0','0','0','2','0','0','0','0',
                            '0','0','0','0','0','0','3','0',
                            '0','0','0','0','0','0','0','0'];
}

QuestionPosData.prototype.QUESTION_POS_DATA_FILE = "QuestionPosData.txt";
QuestionPosData.prototype.mapWidth = 8;
QuestionPosData.prototype.mapHeight = 8;
QuestionPosData.prototype.mapWidthShift = 3;

//----------------------------------------------------------------------------------------------------------------------
// Loads and parses the QuestionPosData file.
//   callBackFunction - Function to call when done loading.
//----------------------------------------------------------------------------------------------------------------------
QuestionPosData.prototype.loadDataFile = function(callBackFunction) {
    'use strict';
    var callBackPresent = (typeof(callBackFunction) != "undefined");
    var xmlHttp = this.createXMLHttpRequest();
    var ajaxCall = MazeGlobals.MAZE_DIR + "/" + this.mazeId + "/" + this.QUESTION_POS_DATA_FILE;
    var that = this;
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState >= 4) {  // ready state 4 is 'Complete'
            if (xmlHttp.status == 200) {
                var rawText = xmlHttp.responseText;
                QuestionPosData.parseQuestionPosData(that, rawText);
                if (callBackPresent) callBackFunction(true, "success loading question pos data");     // tell caller we are all done loading and all is positive
            }
            if (xmlHttp.status == 404) {
                // tell caller we are all done, but we failed to load due to file not found
                if (callBackPresent) callBackFunction(false, "File not found: " + that.QUESTION_POS_DATA_FILE);
            }
        }
    };
    xmlHttp.open('GET', ajaxCall);
    xmlHttp.send(null);
};

//----------------------------------------------------------------------------------------------------------------------
// Creates and returns an ajax xhr object.
//----------------------------------------------------------------------------------------------------------------------
QuestionPosData.prototype.createXMLHttpRequest = function() {
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
// Returns true if the specified map item is a question.
//------------------------------------------------------------------------------
QuestionPosData.prototype.isQuestionPosItem = function(mapPos) {
    'use strict';
	return(!(this.questionPosData[mapPos] == '0'));
};

//------------------------------------------------------------------------------
// Returns the value at the specified position
//------------------------------------------------------------------------------
QuestionPosData.prototype.getValue = function(mapPos) {
    'use strict';
	if (mapPos < 0 || mapPos >= this.mapHeight << this.mapWidthShift) return('0');
	else return(this.questionPosData[mapPos]);
};

//------------------------------------------------------------------------------
// Walk through the entire question position array and set up a position map,
// so if given a question number we can get it's position immediately.
//------------------------------------------------------------------------------
QuestionPosData.prototype.setupPositionList = function() {
    'use strict';
    for (var i = 0; i < this.questionPosData.length; i++) {
        if (this.questionPosData[i] != '0') {   // only add real questions to list
            var indexStr = this.questionPosData[i];
            this.questionToPosMap[indexStr] = i;
        }
    }
};

//------------------------------------------------------------------------------
// Takes x, y coordinates and converts them to a position in the one
// dimensional array representing the aerial view of the maze map
//------------------------------------------------------------------------------
QuestionPosData.prototype.convertPointToMapPos = function(x, y) {
    'use strict';
	return ((y << this.mapWidthShift) + x);    // shifting makes this go faster
};

//----------------------------------------------------------------------------------------------------------------------
// Returns either a '?', 'A', 'B', 'C', 'D' or '0' telling what the item type is at the given position.
// @param mapIndex The position we are evaluating in this call.
// @param questions Questions and ABCD answers with positions relative to question mark.
// @param curQuestionChar Current question, if we are on a question, otherwise zero.
// @return Returns either a '?', 'A', 'B', 'C', 'D' or '0' telling what the item type is at the given position.
//----------------------------------------------------------------------------------------------------------------------
QuestionPosData.prototype.getQuestionItemTypeAt = function(mapIndex, questions, curQuestionChar) {
    'use strict';
    if (this.getValue(mapIndex) != '0') return '?';
    if ('0' == curQuestionChar) return '0';

    // If curQuestion is anything other than '0' this denotes we are currently on a question looking for an
    // answer.  We look at all answer positions for the current question and see if they represent the same
    // location as that passed in as mapIndex.  Note:  The ABCD positions are relative positions tracked in the
    // Questions file as relative positions from the question mark.

    var arialNumPos = this.questionToPosMap[curQuestionChar];
    var row = arialNumPos >> this.mapWidthShift;       // convert numPos to a row column
    var col = arialNumPos % this.mapWidth;

    var curQuest = questions.returnQuestion(curQuestionChar);

    var rowA = row + curQuest.yRelAnswerA;
    var rowB = row + curQuest.yRelAnswerB;
    var rowC = row + curQuest.yRelAnswerC;
    var rowD = row + curQuest.yRelAnswerD;

    var colA = col + curQuest.xRelAnswerA;
    var colB = col + curQuest.xRelAnswerB;
    var colC = col + curQuest.xRelAnswerC;
    var colD = col + curQuest.xRelAnswerD;

    if (colA > this.mapWidth) return '0';
    if (colB > this.mapWidth) return '0';
    if (colC > this.mapWidth) return '0';
    if (colD > this.mapWidth) return '0';

    if (rowA > this.mapHeight) return '0';
    if (rowB > this.mapHeight) return '0';
    if (rowC > this.mapHeight) return '0';
    if (rowD > this.mapHeight) return '0';

    var mapPosA = ((rowA << this.mapWidthShift) + colA);
    var mapPosB = ((rowB << this.mapWidthShift) + colB);
    var mapPosC = ((rowC << this.mapWidthShift) + colC);
    var mapPosD = ((rowD << this.mapWidthShift) + colD);

    if (mapPosA == mapIndex)
        return 'A';
    if (mapPosB == mapIndex)
        return 'B';
    if (mapPosC == mapIndex)
        return 'C';
    if (mapPosD == mapIndex)
        return 'D';

    return '0';
};

//----------------------------------------------------------------------------------------------------------------------
// Returns either a '?', 'A', 'B', 'C', 'D' or '0' telling what the item type is at the given position.
// This is a special version of getQuestionItemTypeAt() motivated by the need to drop rendering of the
// question mark when you have currently activated a question mark and are examining answers.  This
// method behaves exactly as the original, except with this special version, if the item hit is a
// question mark, then the question mark is ignored if it is the exact same question we currently activated.
// @param mapIndex The position we are evaluating in this call.
// @param questions Questions and ABCD answers with positions relative to question mark.
// @param curQuestionChar Current question, if we are on a question, otherwise zero.
// @return Returns either a '?', 'A', 'B', 'C', 'D' or '0' telling what the item type is at the given position.
//----------------------------------------------------------------------------------------------------------------------
QuestionPosData.prototype.getQuestionItemTypeAtSpecial = function(mapIndex, questions, curQuestionChar) {
    'use strict';
    var questItemTypeHit = this.getQuestionItemTypeAt(mapIndex, questions, curQuestionChar);

    // if item hit is an answer image, then there is no special case
    if (questItemTypeHit != '?') return questItemTypeHit;

    // else we are dealing with a question
    var questNumberHit = this.getValue(mapIndex);
    if (questNumberHit == curQuestionChar) return '0';  // ignore if it is the current question
    else return '?';
};

//----------------------------------------------------------------------------------------------------------------------
// Loads each and every image associated with the questions.
//   callBackFunction - Function to inform the caller that we are done loading.
//----------------------------------------------------------------------------------------------------------------------
QuestionPosData.prototype.loadAssociatedImages = function(callBackFunction) {
    'use strict';
    var callBackPresent = (typeof(callBackFunction) != "undefined");
    var questionIndex = new Array();
    var questionFileNames = new Array();

    questionIndex[0] = '?';   questionFileNames['?'] = "QuestionMark.gif";
    questionIndex[1] = 'A';   questionFileNames['A'] = "AnswerA.gif";
    questionIndex[2] = 'B';   questionFileNames['B'] = "AnswerB.gif";
    questionIndex[3] = 'C';   questionFileNames['C'] = "AnswerC.gif";
    questionIndex[4] = 'D';   questionFileNames['D'] = "AnswerD.gif";

    var curImageNum = 0;
    var that = this;

    var loadImageCanvasFunction = function() {
        var indexChar = questionIndex[curImageNum];
        var questionFileName = questionFileNames[indexChar];
        var imageCanvas = new ImageCanvas(that.document, that.mazeId, questionFileName, 64, 64);

        // this is a loop through recursion and callback
        // ... once an image is loaded this inline function below is called (as a callback)
        // ... we then increment and move to the next image through recursion
        imageCanvas.loadFile(function(statusGood, message) {
            if (statusGood === false) console.log(message);
            that.questionCanvasImgs[indexChar] = imageCanvas; // save this image to a map of images indexed by '?', 'A', 'B', 'C', or 'D'
            curImageNum++;                          // move on to next image
            if (curImageNum >= questionIndex.length){
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
QuestionPosData.prototype.getCanvasImage = function(ch) {
    'use strict';
    if (this.questionCanvasImgs.hasOwnProperty(ch)) {
        return this.questionCanvasImgs[ch];
    }
    return null;
};

//------------------------------------------ Non-Prototype Functions -----------------------------------------------

//----------------------------------------------------------------------------------------------------------------------
// Parses the data from the QuestionPosData file
//----------------------------------------------------------------------------------------------------------------------
QuestionPosData.parseQuestionPosData = function(that, data) {
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
            if (QuestionPosData.isLineLengthGood(that.mapWidth)) {
                that.mapWidthShift = MathUtils.logarithmBaseTwo(that.mapWidth);
            } else {
                that.mapWidth = -1;     // flag indicates something is wrong
                break;
            }
        } else {
            if (cleanLine.length != that.mapWidth) {
                var errStr = "Line # " + lineNum + " in file '" + that.QUESTION_POS_DATA_FILE + "' is inconsistent with the first line of the file. ";
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
        var errStr = "The number of lines in the file '" + that.QUESTION_POS_DATA_FILE + "' doesn't match the ";
        errStr += "number of lines in the wall file .";
        that.textAreaBox.dumpError(errStr);
    }

    if (that.mapWidth != -1) {      // -1 indicates something is messed  up
        that.mapHeight = lineNum;
        that.questionPosData = completeFile.split('');
        that.setupPositionList();
    }
};

//----------------------------------------------------------------------------------------------------------------------
// Checks to make sure the line width is good - it must be a power of two so we can do the fast div and mult.
//----------------------------------------------------------------------------------------------------------------------
QuestionPosData.isLineLengthGood = function(width)  {
    'use strict';
    if ((width != 16) && (width != 32) && (width != 64) && (width != 128) && (width != 256)) {
        var errStr = "The length of the first line in file '" + that.QUESTION_POS_DATA_FILE + "' is " + width + ".";
        errStr += "Line length must be 16, 32, 64, 128, or 256.";
        that.textAreaBox.dumpError(errStr);
        return false;
    }
    return true;
};
