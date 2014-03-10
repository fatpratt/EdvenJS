#!/bin/sh
set -u    # Don't use undefined variables
set -e    # Exit on error

java -jar compiler.jar --js=JSAddOns.js --js=MazeGlobals.js --js=Trig.js --js=Dest.js --js=Trap.js --js=GeneralConfig.js --js=OpeningCredits.js --js=MazeConfig.js --js=TextAreaBox.js --js=MathUtils.js --js=ImageCanvas.js --js=IniFile.js --js=KeyboardController.js --js=MapData.js --js=PropData.js --js=Maze.js --js=Overlay.js --js=Landscape.js --js=Background.js --js=WallHitItem.js --js=PropHitItem.js --js=Questions.js --js=Question.js --js=QuestionPosData.js --js=QuestionHitItem.js --js=MazeLoader.js --js_output_file=EM.js --compilation_level=SIMPLE_OPTIMIZATIONS



                                          

