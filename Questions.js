/**
 * @license Copyright 2014 EdVentureMaze.com
 */

//----------------------------------------------------------------------------------------------------------------------
// Holds all questions from the Questions.ini file.
// @author brianpratt
//----------------------------------------------------------------------------------------------------------------------

// Namespace: Questions
if (Questions == null || typeof(Questions) != "object") {var Questions = new Object();}

//------------------------------------------------------------------------------
// Constructor
//------------------------------------------------------------------------------
Questions = function(document, mazeId, textAreaBox){
    'use strict';
    this.document = document;
    this.mazeId = mazeId;
    this.textAreaBox = textAreaBox;
    this.numQuestions = 0;
    this.questions = [];
    this.iniObj = {};   // properties mirroring properties from the ini file
};

Questions.prototype.QUESTIONS_INI_FILE = "Questions.ini";

//----------------------------------------------------------------------------------------------------------------------
// Loads and parses the Questions file.
//   callBackFunction - Function to call when done loading.
//----------------------------------------------------------------------------------------------------------------------
Questions.prototype.loadQuestionsFile = function(callBackFunction) {
    'use strict';
    var callBackPresent = (typeof(callBackFunction) != "undefined");

    var iniFile = new IniFile(this.mazeId, this.QUESTIONS_INI_FILE);

    var that = this;
    iniFile.loadFile(function(statusGood, message) {
        if (!statusGood) {
            that.textAreaBox.dumpError('error: ' + message);
            if (callBackPresent) callBackFunction(false, message);
            return;
        }
        console.log('MazeConfig.js: MazeConfig.ini successfully loaded.');

        that.iniObj = iniFile.iniObj;
        var ver = that.iniObj.General.Ver;
        if (ver != GeneralConfig.MAUTH_VER_NUM) {
            console.log('Questions.js: Questions.ini file may be out of date. ' +
                'Expected version: ' + GeneralConfig.MAUTH_VER_NUM +
                'Version found: ' + ver);
        }

        that.numQuestions = that.iniObj.General.NumQuestions;

        for (var i = 0; i < that.numQuestions; i++) {
            var question = that.readQuestion(i);
            that.questions.push(question);
        }
        if (callBackPresent) callBackFunction(true);
    });
};

//--------------------------------------------------------------------------------------------------
// Reads the specified question information from the appropriate section of the ini structure.
//--------------------------------------------------------------------------------------------------
Questions.prototype.readQuestion = function(num) {
    'use strict';

    var question = new Question();
    var strSection = "Question" + num;

    question.questionNum = num;
    question.totalQuestions = this.numQuestions;

    question.id       = this.iniObj[strSection]["ID"];       // note: id is usually num plus one
    question.question = this.iniObj[strSection]["Question"];

    question.answerA  = this.iniObj[strSection]["AnswerA"];
    question.answerB  = this.iniObj[strSection]["AnswerB"];
    question.answerC  = this.iniObj[strSection]["AnswerC"];
    question.answerD  = this.iniObj[strSection]["AnswerD"];

    question.xRelAnswerA = parseInt(this.iniObj[strSection]["XRelAnswerA"], 10);
    question.yRelAnswerA = parseInt(this.iniObj[strSection]["YRelAnswerA"], 10);
    question.xRelAnswerB = parseInt(this.iniObj[strSection]["XRelAnswerB"], 10);
    question.yRelAnswerB = parseInt(this.iniObj[strSection]["YRelAnswerB"], 10);
    question.xRelAnswerC = parseInt(this.iniObj[strSection]["XRelAnswerC"], 10);
    question.yRelAnswerC = parseInt(this.iniObj[strSection]["YRelAnswerC"], 10);
    question.xRelAnswerD = parseInt(this.iniObj[strSection]["XRelAnswerD"], 10);
    question.yRelAnswerD = parseInt(this.iniObj[strSection]["YRelAnswerD"], 10);

    return question;
};

//--------------------------------------------------------------------------------------------------
// Gets question from questions list specified by questionId.
//--------------------------------------------------------------------------------------------------
Questions.prototype.returnQuestion = function(questionId) {
    'use strict';
    for (var i = 0; i < this.numQuestions; i++) {
        var curQuestion = this.questions[i];
        if (curQuestion.id == questionId) return curQuestion;
    }
    console.log('Questions.js: unable to find question ' + num);
    return this.questions[0];       // error... just return any question
};

