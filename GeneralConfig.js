/**
 * @license Copyright 2014 EdVentureMaze.com
 */

//--------------------------------------------------------------------------------------------------
// Holds all general configuration information as established in the GeneralConfig.ini file.
// Defines globals used throughout.
//
// The routines that set object state here can be time consuming so listener callback
// notification patterns are used to keep the caller informed.  To create and use a MapData object,
// you must first call the constructor, then call loadConfigFile(), wait for the callback notification,
// then call loadAssociatedImages() and again wait for the callback notification.
//
// @author brianpratt
//--------------------------------------------------------------------------------------------------

// Namespace: GeneralConfig
if (GeneralConfig == null || typeof(GeneralConfig) != "object") {var GeneralConfig = new Object();}

//----------------------------------------------------------------------------------------------------------------------
// Constructor
//----------------------------------------------------------------------------------------------------------------------
GeneralConfig = function(document, mazeId, textAreaBox) {
    'use strict';

    GeneralConfig.MAUTH_VER_NUM = "1.3";
    GeneralConfig.FULL_MAUTH_VER_NUM = "01.30";

    this.document = document;
    this.mazeId = mazeId;
    this.textAreaBox = textAreaBox;
};

GeneralConfig.prototype.GENERAL_CONFIG_INI_FILE = "GeneralConfig.ini";

GeneralConfig.prototype.openingCreditImg = null;

GeneralConfig.prototype.titleLine1 = null;
GeneralConfig.prototype.titleLine2 = null;
GeneralConfig.prototype.titleLine3 = null;
GeneralConfig.prototype.titleLine4 = null;

GeneralConfig.prototype.line1Clr = null;
GeneralConfig.prototype.line2Clr = null;
GeneralConfig.prototype.line3Clr = null;
GeneralConfig.prototype.line4Clr = null;

GeneralConfig.prototype.yPosLine1 = null;
GeneralConfig.prototype.yPosLine2 = null;
GeneralConfig.prototype.yPosLine3 = null;
GeneralConfig.prototype.yPosLine4 = null;

GeneralConfig.prototype.fontSizeLine1 = null;
GeneralConfig.prototype.fontSizeLine2 = null;
GeneralConfig.prototype.fontSizeLine3 = null;
GeneralConfig.prototype.fontSizeLine4 = null;

GeneralConfig.prototype.backGroundClr = null;           // TODO: add this feature later
GeneralConfig.prototype.textClr = null;                 // TODO: add this feature later
GeneralConfig.prototype.usingBackroundMusic = null;     // TODO: add this feature later

//----------------------------------------------------------------------------------------------------------------------
// Loads and parses the GeneralConfig file.
//   callBackFunction - Function to call when done loading.
//----------------------------------------------------------------------------------------------------------------------
GeneralConfig.prototype.loadConfigFile = function(callBackFunction) {
    'use strict';
    var callBackPresent = (typeof(callBackFunction) != "undefined");

    var iniFile = new IniFile(this.mazeId, this.GENERAL_CONFIG_INI_FILE);

    var that = this;

    iniFile.loadFile(function(statusGood, message) {
        if (!statusGood) {
            that.textAreaBox.dumpError('error: ' + message);
            if (callBackPresent) callBackFunction(false, message);
            return;
        }
        console.log('GeneralConfig.js: GeneralConfig.ini successfully loaded.');

        that.iniObj = iniFile.iniObj;
        var ver = that.iniObj.General.Ver;
        if (ver != GeneralConfig.MAUTH_VER_NUM) {
            console.log('GeneralConfig.js: GeneralConfig.ini file may be out of date. ' +
                'Expected version: ' + GeneralConfig.MAUTH_VER_NUM +
                'Version found: ' + ver);
        }

        if (callBackPresent) callBackFunction(true);
    });
};

//----------------------------------------------------------------------------------------------------------------------
// Loads associated images, most notably the opening credits.
//   callBackFunction - Function to call when done loading.
//----------------------------------------------------------------------------------------------------------------------
GeneralConfig.prototype.loadAssociatedImages = function(callBackFunction) {
    'use strict';
    var callBackPresent = (typeof(callBackFunction) != "undefined");


    GeneralConfig.prototype.titleLine1 = this.iniObj.OpeningCredits.TitleLine1;
    GeneralConfig.prototype.titleLine2 = this.iniObj.OpeningCredits.TitleLine2;
    GeneralConfig.prototype.titleLine3 = this.iniObj.OpeningCredits.TitleLine3;
    GeneralConfig.prototype.titleLine4 = this.iniObj.OpeningCredits.TitleLine4;

    GeneralConfig.prototype.line1Clr = this.iniObj.OpeningCredits.ColorLine1;
    GeneralConfig.prototype.line2Clr = this.iniObj.OpeningCredits.ColorLine2;
    GeneralConfig.prototype.line3Clr = this.iniObj.OpeningCredits.ColorLine3;
    GeneralConfig.prototype.line4Clr = this.iniObj.OpeningCredits.ColorLine4;

    GeneralConfig.prototype.yPosLine1 = this.iniObj.OpeningCredits.YPosLine1;
    GeneralConfig.prototype.yPosLine2 = this.iniObj.OpeningCredits.YPosLine2;
    GeneralConfig.prototype.yPosLine3 = this.iniObj.OpeningCredits.YPosLine3;
    GeneralConfig.prototype.yPosLine4 = this.iniObj.OpeningCredits.YPosLine4;

    GeneralConfig.prototype.fontSizeLine1 = this.iniObj.OpeningCredits.FontSizeLine1;
    GeneralConfig.prototype.fontSizeLine2 = this.iniObj.OpeningCredits.FontSizeLine2;
    GeneralConfig.prototype.fontSizeLine3 = this.iniObj.OpeningCredits.FontSizeLine3;
    GeneralConfig.prototype.fontSizeLine4 = this.iniObj.OpeningCredits.FontSizeLine4;

    if (GeneralConfig.prototype.titleLine1 == null) GeneralConfig.prototype.titleLine1 = "";
    if (GeneralConfig.prototype.titleLine2 == null) GeneralConfig.prototype.titleLine2 = "";
    if (GeneralConfig.prototype.titleLine3 == null) GeneralConfig.prototype.titleLine3 = "";
    if (GeneralConfig.prototype.titleLine4 == null) GeneralConfig.prototype.titleLine4 = "";

    if (GeneralConfig.prototype.line1Clr == null) GeneralConfig.prototype.line1Clr = "gray";
    if (GeneralConfig.prototype.line2Clr == null) GeneralConfig.prototype.line2Clr = "gray";
    if (GeneralConfig.prototype.line3Clr == null) GeneralConfig.prototype.line3Clr = "gray";
    if (GeneralConfig.prototype.line4Clr == null) GeneralConfig.prototype.line4Clr = "gray";

    if (GeneralConfig.prototype.yPosLine1 == null) GeneralConfig.prototype.yPosLine1 = 58;
    if (GeneralConfig.prototype.yPosLine2 == null) GeneralConfig.prototype.yPosLine2 = 84;
    if (GeneralConfig.prototype.yPosLine3 == null) GeneralConfig.prototype.yPosLine3 = 111;
    if (GeneralConfig.prototype.yPosLine4 == null) GeneralConfig.prototype.yPosLine4 = 140;

    if (GeneralConfig.prototype.fontSizeLine1 == null) GeneralConfig.prototype.fontSizeLine1 = 22;
    if (GeneralConfig.prototype.fontSizeLine2 == null) GeneralConfig.prototype.fontSizeLine2 = 16;
    if (GeneralConfig.prototype.fontSizeLine3 == null) GeneralConfig.prototype.fontSizeLine3 = 16;
    if (GeneralConfig.prototype.fontSizeLine4 == null) GeneralConfig.prototype.fontSizeLine4 = 16;

    GeneralConfig.prototype.line1Clr = GeneralConfig.prototype.line1Clr.toLowerCase();
    GeneralConfig.prototype.line2Clr = GeneralConfig.prototype.line2Clr.toLowerCase();
    GeneralConfig.prototype.line3Clr = GeneralConfig.prototype.line3Clr.toLowerCase();
    GeneralConfig.prototype.line4Clr = GeneralConfig.prototype.line4Clr.toLowerCase();

    var imageCanvas = new ImageCanvas(this.document, this.mazeId,
        this.iniObj.OpeningCredits.OpeningCredits, MazeGlobals.PROJECTIONPLANEWIDTH, MazeGlobals.PROJECTIONPLANEHEIGHT);

    var that = this;
    imageCanvas.loadFile(function(statusGood, message) {
        if (statusGood === false) console.log(message);

        that.openingCreditImg = imageCanvas;
        if (callBackPresent) callBackFunction(true);    // we are all done ... inform the listener
    });
};


