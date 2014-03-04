#!/bin/sh
set -u    # Don't use undefined variables
set -e    # Exit on error

java -jar compiler.jar --js=Background.js --js=Dest.js --js=GeneralConfig.js --js=ImageCanvas.js --js=IniFile.js --js=KeyboardController.js  --js=Landscape.js --js=MapData.js --js=MathUtils.js --js=MazeGlobals.js --js=Maze.js --js=MazeConfig.js --js=MazeLoader.js --js=OpeningCredits.js --js=Overlay.js --js=PropData.js --js=PropHitItem.js --js=Question.js --js=QuestionHitItem.js --js=QuestionPosData.js --js=Questions.js --js=TextAreaBox.js --js=Trap.js --js=Trig.js --js=WallHitItem.js --js_output_file=EM.js --compilation_level=ADVANCED_OPTIMIZATIONS



                                          

