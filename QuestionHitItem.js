//----------------------------------------------------------------------------------------------------
// Represents information for when a ray hits a question item.  Question item hits are treated
// just like PropItemHits with an additional piece of information describing what type of
// question was hit.
//
// FYI... QuestionHitItem inherits from PropHitItem
//
// @author brianpratt
//----------------------------------------------------------------------------------------------------

// Namespace: QuestionHitItem
if (QuestionHitItem == null || typeof(QuestionHitItem) != "object") {var QuestionHitItem = new Object();}

//------------------------------------------------------------------------------
// constructor
//------------------------------------------------------------------------------
QuestionHitItem = function(mapPos, trig, questionItemType){
    'use strict';
    PropHitItem.apply(this, arguments);
    this.questionItemType = questionItemType;
};

QuestionHitItem.prototype = new PropHitItem();           // prototypal inheritance from PropHitItem
QuestionHitItem.prototype.constructor = QuestionHitItem;

QuestionHitItem.prototype.questionItemType = '0';            // '?', 'A', 'B', 'C', or 'D'


