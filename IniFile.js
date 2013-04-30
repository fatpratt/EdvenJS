//----------------------------------------------------------------------------------------------------------------------
// Routines for handling Windows-style INI files.  To use an IniFile object, you must call the constructor
// then call loadFile(), passing a callback function so the caller knows when it's loaded.
//----------------------------------------------------------------------------------------------------------------------

// Namespace: IniFile
if (IniFile == null || typeof(IniFile) != "object") {var IniFile = new Object();}

//----------------------------------------------------------------------------------------------------------------------
// Constructor
//----------------------------------------------------------------------------------------------------------------------
IniFile = function(mazeId, fileName) {
    this.iniObj = null;             // ini recreation as a js object
    this.mazeId = mazeId;           // dir where file is found
    this.fileName = fileName;       // ini filename
};

//----------------------------------------------------------------------------------------------------------------------
// Loads and parses the INI file.
//   callBackFunction - Function to call when done loading.
//----------------------------------------------------------------------------------------------------------------------
IniFile.prototype.loadFile = function(callBackFunction) {
    var callBackPresent = (typeof(callBackFunction) != "undefined");
    var xmlHttp = this.createXMLHttpRequest();
    var ajaxCall = MazeGlobals.MAZE_DIR + "/" + this.mazeId + "/" + this.fileName;
    console.log("IniFile.js - Load file: " + ajaxCall);
    var that = this;
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState >= 4) {  // ready state 4 is 'Complete'
            if (xmlHttp.status == 200) {
                var rawText = xmlHttp.responseText;
                that.iniObj = IniFile.parseIniString(rawText);
                if (callBackPresent) callBackFunction(true);     // tell caller we are all done loading and all is positive
            }
            if (xmlHttp.status == 404) {
                // tell caller we are all done, but we failed to load due to file not found
                if (callBackPresent) callBackFunction(false, "File not found: " + MazeGlobals.MAZE_DIR + "/" + that.mazeId + "/" + that.fileName);
            }
        }
    };
    xmlHttp.open('GET', ajaxCall);
    xmlHttp.send(null);
};

//----------------------------------------------------------------------------------------------------------------------
// Creates and returns an ajax xhr object.
//----------------------------------------------------------------------------------------------------------------------
IniFile.prototype.createXMLHttpRequest = function() {
    var xmlHttp = null;
    if (window.ActiveXObject) {
        xmlHttp = new ActiveXObject('Microsoft.XMLHTTP');
    }
    else if (window.XMLHttpRequest) {
        xmlHttp = new XMLHttpRequest();
    }
    return xmlHttp;
};

//----------------------------------------------------------------------------------------------------------------------
// Parses windows style INI file and builds a JS object reflecting the properties from the INI file.
// Code source found from the following URL:
//    http://stackoverflow.com/questions/3870019/javascript-parser-for-a-string-which-contains-ini-data
//----------------------------------------------------------------------------------------------------------------------
IniFile.parseIniString = function(data) {
    var regex = {
        section: /^\s*\[\s*([^\]]*)\s*\]\s*$/,
        param: /^\s*([\w\.\-\_]+)\s*=\s*(.*?)\s*$/,
        comment: /^\s*;.*$/
    };
    var iniObj = {};
    var lines = data.split(/\r\n|\r|\n/);
    var section = null;
    lines.forEach(function(line) {
        var cleanLine = line.replace(/(\/\*([\s\S]*?)\*\/)|(\/\/(.*)$)/g, '');  // clean out double slash comments on side
        if (regex.comment.test(cleanLine)) {
            return;
        } else if (regex.param.test(cleanLine)) {
            var match = cleanLine.match(regex.param);
            if (section) {
                iniObj[section][match[1]] = match[2];
            } else {
                iniObj[match[1]] = match[2];
            }
        } else if (regex.section.test(cleanLine)) {
            var match = cleanLine.match(regex.section);
            iniObj[match[1]] = {};
            section = match[1];
        } else if (cleanLine.length == 0 && section) {
            section = null;
        };
    });
    return iniObj;
};
