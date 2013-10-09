//----------------------------------------------------------------------------------------------------------------------
// Simple object to hold Question info.
// @author brianpratt
//----------------------------------------------------------------------------------------------------------------------

// Namespace: Question
if (Question == null || typeof(Question) != "object") {var Question = new Object();}

//----------------------------------------------------------------------------------------------------------------------
// Constructor
//----------------------------------------------------------------------------------------------------------------------
Question = function() {
    'use strict';
    this.questionNum = 0;
    this.totalQuestions = "0";

    this.id       = "";
    this.question = "";

    this.answerA  = "";
    this.answerB  = "";
    this.answerC  = "";
    this.answerD  = "";

    this.xRelAnswerA = "";
    this.yRelAnswerA = "";
    this.xRelAnswerB = "";
    this.yRelAnswerB = "";
    this.xRelAnswerC = "";
    this.yRelAnswerC = "";
    this.xRelAnswerD = "";
    this.yRelAnswerD = "";
};

