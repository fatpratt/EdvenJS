//----------------------------------------------------------------------------------------------------------------------
// Holds all general configuration information as established in the MazeConfig.ini file which primarily contains
// traps and destinations.
// @author brianpratt
//----------------------------------------------------------------------------------------------------------------------

// Namespace: MazeConfig
if (MazeConfig == null || typeof(MazeConfig) != "object") {var MazeConfig = new Object();}

//------------------------------------------------------------------------------
// Constructor
//------------------------------------------------------------------------------
MazeConfig = function(document, mazeId, textAreaBox, mapHeight, mapWidth){
    'use strict';
    this.document = document;
    this.mazeId = mazeId;
    this.textAreaBox = textAreaBox;
    this.mapHeight = mapHeight;
    this.mapWidth = mapWidth;
    this.numTraps = 0;
    this.numDests = 1;
    this.traps = [];
    this.dests = [];
    this.iniObj = {};   // properties mirroring properties from the ini file
};

MazeConfig.prototype.MAZE_CONFIG_INI_FILE = "MazeConfig.ini";

//----------------------------------------------------------------------------------------------------------------------
// Loads and parses the MazeConfig file.
//   callBackFunction - Function to call when done loading.
//----------------------------------------------------------------------------------------------------------------------
MazeConfig.prototype.loadConfigFile = function(callBackFunction) {
    'use strict';
    var callBackPresent = (typeof(callBackFunction) != "undefined");

    var iniFile = new IniFile(this.mazeId, this.MAZE_CONFIG_INI_FILE);
    var that = this;
    iniFile.loadFile(function(statusGood, message) {
        if (!statusGood) {
            this.textAreaBox.dumpError('error: ' + message);
            if (callBackPresent) callBackFunction(false, message);
            return;
        }
        console.log('MazeConfig.js: MazeConfig.ini successfully loaded.');

        that.iniObj = iniFile.iniObj;
        var ver = that.iniObj.General.Ver;
        if (ver != GeneralConfig.MAUTH_VER_NUM) {
            console.log('MazeConfig.js: MazeConfig.ini file may be out of date. ' +
                'Expected version: ' + GeneralConfig.MAUTH_VER_NUM +
                'Version found: ' + ver);
        }

        that.numTraps = that.iniObj.General.NumTraps;
        that.numDests = that.iniObj.General.NumDests;

        if (that.numTraps <= 0) {
            that.textAreaBox.dumpError("Number of destinations ('NumDests') in MazeConfig.ini file " +
                 "is zero.  You must have at least one for starting coordinates.");
        }

        for (var i = 0; i < that.numDests; i++)
            that.dests.push(that.getDest(i, that.mapWidth, that.mapHeight));
        for (var i = 0; i < that.numTraps; i++)
            that.traps.push(that.getTrap(i, that.mapWidth, that.mapHeight, that.numDests));

        // TODO: add code for sound, backgrounds, overlays, and landscapes

        if (callBackPresent) callBackFunction(true);
    });
};

//----------------------------------------------------------------------------------------------------------------------
// After all the information is read in from file, this method is called by maze routines
// to get the destination specified by number.
//----------------------------------------------------------------------------------------------------------------------
MazeConfig.prototype.advanceToDest = function(destNum) {
    if (destNum >= 0 && destNum < this.numDests)
        return this.dests[destNum];
    else return null;
};


//----------------------------------------------------------------------------------------------------------------------
// Reads the specified trap information from the appropriate section of the ini file.
//----------------------------------------------------------------------------------------------------------------------
MazeConfig.prototype.getTrap = function(num, mapWidth, mapHeight, numDests) {
    'use strict';
    var trap = new Trap();
    var section = "Trap" + num;

    // -- trap's position --

    var leftTile = this.getValueCheckingRange(section, "LeftTile", 15, 0, this.mapWidth - 1,
        "This constraint is based upon the map width.");
    var rightTile = this.getValueCheckingRange(section, "RightTile", 16, 0, mapWidth - 1,
        "This constraint is based upon the map width.");
    var topTile = this.getValueCheckingRange(section, "TopTile", 15, 0, mapHeight - 1,
        "This constraint is based upon the map height.");
    var bottomTile = this.getValueCheckingRange(section, "BottomTile", 16, 0, mapHeight - 1,
        "This constraint is based upon the map height.");

    var leftTileOffset = this.getValueCheckingRange(section, "LeftTileOffset", 0, 0, MazeGlobals.TILE_SIZE - 1, "");
    var rightTileOffset = this.getValueCheckingRange(section, "RightTileOffset", 0, 0, MazeGlobals.TILE_SIZE - 1, "");
    var topTileOffset = this.getValueCheckingRange(section, "TopTileOffset", 0, 0, MazeGlobals.TILE_SIZE - 1, "");
    var bottomTileOffset = this.getValueCheckingRange(section, "BottomTileOffset", 0, 0, MazeGlobals.TILE_SIZE - 1, "");

    trap.leftSide = (parseInt(leftTile, 10) *     MazeGlobals.TILE_SIZE) + parseInt(leftTileOffset, 10);
    trap.rightSide = (parseInt(rightTile, 10) *   MazeGlobals.TILE_SIZE) + parseInt(rightTileOffset, 10);
    trap.topSide = (parseInt(topTile, 10) *       MazeGlobals.TILE_SIZE) + parseInt(topTileOffset, 10);
    trap.bottomSide = (parseInt(bottomTile, 10) * MazeGlobals.TILE_SIZE) + parseInt(bottomTileOffset, 10);

    // -- dest --

    trap.gotoDest = this.getValueCheckingRange(section, "GotoDest", -1, 0, numDests - 1, "");
    trap.usingDest = (trap.gotoDest != -1);

    // -- sound --

    trap.usingSound = false;
    trap.soundFile = this.iniObj[section]["SoundEffect"];
    if (trap.soundFile === null) trap.soundFile = "";
    // TODO: write code to make sure we are using the correct sound file

    // -- overlay --

    trap.overlayFile.usingOverlay = false;
    trap.overlayFile = this.iniObj[section]["Overlay"];
    if (trap.overlayFile == null) trap.overlayFile = "";
    trap.usingOverlay = (trap.overlayFile.length > 0);
    // TODO: write code to load the overlay file

    return trap;
};

//----------------------------------------------------------------------------------------------------------------------
// Reads the specified destination information from the appropriate section of the ini file.
//----------------------------------------------------------------------------------------------------------------------
MazeConfig.prototype.getDest = function(num, mapWidth, mapHeight) {
    'use strict';
    var dest = new Dest();
    var section = "Dest" + num;

    //-----position variables------

    var xTile = this.getValueCheckingRange(section, "XTile", 10, 0, this.mapWidth - 1,
        "This constraint is based upon the map width.");
    var yTile = this.getValueCheckingRange(section, "YTile", 10, 0, this.mapHeight - 1,
        "This constraint is based upon the map height.");

    var xTileOffset = this.getValueCheckingRange(section, "XTileOffset", 0, 0, MazeGlobals.TILE_SIZE - 1, "");
    var yTileOffset = this.getValueCheckingRange(section, "YTileOffset", 0, 0, MazeGlobals.TILE_SIZE - 1, "");
    var angle = this.getValueCheckingRange(section, "Angle", -1, 0, 359, "");

    // sometimes maze designers wants to keep player's current angle
    // if no angle specified then just use the player's existing angle
    if (angle == -1) {
        dest.useExistingAngle = true;
        angle = 45;
    } else dest.useExistingAngle = false;

    dest.xPos = (parseInt(xTile, 10) * MazeGlobals.TILE_SIZE) + parseInt(xTileOffset, 10);
    dest.yPos = (parseInt(yTile, 10) * MazeGlobals.TILE_SIZE) + parseInt(yTileOffset, 10);
    dest.angle = Trig.degreesToMazeAngleUnits(parseInt(angle, 10));

    // ----- gather landscape information ------

    dest.landscapeFile = this.iniObj[section]["Landscape"];
    if (dest.landscapeFile == null) dest.landscapeFile = "";
    dest.usingALandscape = (dest.landscapeFile.length > 0);
    dest.useExistingLandscape = !dest.usingALandscape;
    if (dest.usingALandscape) {
        dest.landscapeOffsetFromTop = this.iniObj[section]["LandscapeOffsetFromTop"];
        if (dest.landscapeOffsetFromTop == null) dest.landscapeOffsetFromTop = 0;
        dest.landscapeOffsetFromTop = parseInt(dest.landscapeOffsetFromTop, 10)
        var landscapeStartAngle = this.iniObj[section]["LandscapeStartAngle"];
        if (landscapeStartAngle == null) landscapeStartAngle = 0;
        dest.landscapeStartAngle = Trig.degreesToMazeAngleUnits(parseInt(landscapeStartAngle, 10));
        // TODO: check to make sure the file exists
    }

    // ----- gather background information ------

    dest.backgroundFile = this.iniObj[section]["Background"];
    if (dest.backgroundFile == null || dest.backgroundFile.length <= 0) dest.backgroundFile = "";
    dest.backgroundFromFile = (dest.backgroundFile.length > 0);
    dest.backgroundFromRGB = (!(dest.backgroundFromFile));  // no file specified so assumed RGB

    if (dest.backgroundFromRGB) {   // gather RBG values from ini file
        var MISSING_VALUE = -11;
        var skyRed      = this.getValueCheckingRange(section, "SkyRed",       MISSING_VALUE, 0, 255, "");
        var skyGreen    = this.getValueCheckingRange(section, "SkyGreen",     MISSING_VALUE, 0, 255, "");
        var skyBlue     = this.getValueCheckingRange(section, "SkyBlue",      MISSING_VALUE, 0, 255, "");
        var groundRed   = this.getValueCheckingRange(section, "GroundRed",    MISSING_VALUE, 0, 255, "");
        var groundGreen = this.getValueCheckingRange(section, "GroundGreen",  MISSING_VALUE, 0, 255, "");
        var groundBlue  = this.getValueCheckingRange(section, "GroundBlue",   MISSING_VALUE, 0, 255, "");

        var skyRedStep      = this.getValueCheckingRange(section, "SkyRedStep",       MISSING_VALUE, -10, 10, "");
        var skyGreenStep    = this.getValueCheckingRange(section, "SkyGreenStep",     MISSING_VALUE, -10, 10, "");
        var skyBlueStep     = this.getValueCheckingRange(section, "SkyBlueStep",      MISSING_VALUE, -10, 10, "");
        var groundRedStep   = this.getValueCheckingRange(section, "GroundRedStep",    MISSING_VALUE, -10, 10, "");
        var groundGreenStep = this.getValueCheckingRange(section, "GroundGreenStep",  MISSING_VALUE, -10, 10, "");
        var groundBlueStep  = this.getValueCheckingRange(section, "GroundBlueStep",   MISSING_VALUE, -10, 10, "");

        skyRed      = parseInt(skyRed,      10);
        skyGreen    = parseInt(skyGreen,    10);
        skyBlue     = parseInt(skyBlue,     10);
        groundRed   = parseInt(groundRed,   10);
        groundGreen = parseInt(groundGreen, 10);
        groundBlue  = parseInt(groundBlue,  10);

        skyRedStep      = parseInt(skyRedStep,      10);
        skyGreenStep    = parseInt(skyGreenStep,    10);
        skyBlueStep     = parseInt(skyBlueStep,     10);
        groundRedStep   = parseInt(groundRedStep,   10);
        groundGreenStep = parseInt(groundGreenStep, 10);
        groundBlueStep  = parseInt(groundBlueStep,  10);

        if (skyRed == MISSING_VALUE || skyGreen == MISSING_VALUE || skyBlue == MISSING_VALUE
                || groundRed == MISSING_VALUE     || groundGreen == MISSING_VALUE     || groundBlue == MISSING_VALUE
                || skyRedStep == MISSING_VALUE    || skyGreenStep == MISSING_VALUE    || skyBlueStep == MISSING_VALUE
                || groundRedStep == MISSING_VALUE || groundGreenStep == MISSING_VALUE || groundBlueStep == MISSING_VALUE) {
            dest.useExistingBackground = true;  // no background file specified and missing RGB values
            console.log('MazeConfig.js: In dest: ' + num + ' no background file specified and missing background RGB values.');
        }

        dest.skyRed      = skyRed      == MISSING_VALUE ? 40 : skyRed;       // just revert to default values, if value not present
        dest.skyGreen    = skyGreen    == MISSING_VALUE ? 125 : skyGreen;
        dest.skyBlue     = skyBlue     == MISSING_VALUE ? 225 : skyBlue;
        dest.groundRed   = groundRed   == MISSING_VALUE ? 100 : groundRed;
        dest.groundGreen = groundGreen == MISSING_VALUE ? 80 : groundGreen;
        dest.groundBlue  = groundBlue  == MISSING_VALUE ? 40 : groundBlue;

        dest.skyRedStep      = skyRedStep      == MISSING_VALUE ? 2 : skyRedStep;
        dest.skyGreenStep    = skyGreenStep    == MISSING_VALUE ? 0 : skyGreenStep;
        dest.skyBlueStep     = skyBlueStep     == MISSING_VALUE ? 0 : skyBlueStep;
        dest.groundRedStep   = groundRedStep   == MISSING_VALUE ? 1 : groundRedStep;
        dest.groundGreenStep = groundGreenStep == MISSING_VALUE ? 1 : groundGreenStep;
        dest.groundBlueStep  = groundBlueStep  == MISSING_VALUE ? 1 : groundBlueStep;
    }

    if (dest.backgroundFromFile) {
        // TODO: check for the existence of a background file and log a message if missing
    }

    // if we are getting the first destination, then we do some additional checking
    if (num == 0) {
        console.log("MazeConfig: [Dest0] | fXPos: " + dest.xPos);
        console.log("MazeConfig: [Dest0] | fYPos:"  + dest.yPos);
        console.log("MazeConfig: [Dest0] | fAngle:" + dest.angle);
        if (dest.useExistingBackground) {     // no background file specified and no RGB values
            this.textAreaBox.dumpError("[MazeConfig: [Dest0] in MazeConfig.ini requires either a 'Background' value"
                + " or all Red, Green, Blue background values must be specified.");
        }
    }

    return dest;
};

//----------------------------------------------------------------------------------------------------------------------
// Gets the specified value from the MazeConfig.ini file. If the value isn't found this routine will return the
// specified default value.  This method allows you to specify a range and if the value read in
// does not fall within that range then a message will appear. To suppress a message pass in a default value
// that is itself out of range.
//----------------------------------------------------------------------------------------------------------------------
MazeConfig.prototype.getValueCheckingRange = function(section, key, defaultVal, lowEnd, highEnd, additionalMsg) {
    'use strict';
    var value = this.iniObj[section][key];
    if (value == null) value = defaultVal;
    if (value > highEnd || value < lowEnd) {
        if (value === defaultVal) return value;  // we don't need a message if default is out of range
        this.textAreaBox.dumpError(key + " in " + section + " of MazeConfig.ini "
            + "must be in the range " + lowEnd + " to " + highEnd + ". "
            + additionalMsg
            + " Using default values.");
        value = defaultVal;
    }
    return value;
};

