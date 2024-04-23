//=============================================================================
// Learning JS for RPGMMZ
// AUTMOUSE_Learning.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc Used to teach plugin syntax for RPG Maker MZ
 * @author AutMouse Labs
 *
 * @command MyCommand
 * @text Greetings
 * @desc Shows a greeting based on Person arguement
 *
 * @arg whoGreet
 * @text Person to greet
 * @desc Greet a person of your choice.
 * @type text
 * @default Penny
 *
 * @arg whoSpeak
 * @text Speaker:
 * @desc Person who greets
 * @type text
 * @default Reid
 *
 * @param luckyNumber
 * @text Lucky Number:
 * @desc Your Lucky Number
 * @type text
 * @default 7
 *
 * @help
 *
 * Any help that needs to be here. Remember the character limit.
 *
 * License: MIT
 */

const AUTMOUSE_learning = {};
AUTMOUSE_learning.pluginName = "AUTMOUSE_Learning";

// Get all parameters for this function.
AUTMOUSE_learning.parameters = PluginManager.parameters(
  AUTMOUSE_learning.pluginName
);

AUTMOUSE_learning.luckyNumber = String(
  AUTMOUSE_learning.parameters["luckyNumber"] || "7"
);

PluginManager.registerCommand(
  AUTMOUSE_learning.pluginName,
  "MyCommand",
  (args) => {
    console.log(args);
    AUTMOUSE_learning.nameBeingGreeted = String(args.whoGreet || "Penny");
    AUTMOUSE_learning.nameOfSpeaker = String(args.whoSpeak || "Reid");
    $gameMessage.setSpeakerName(AUTMOUSE_learning.nameOfSpeaker);
    $gameMessage.add(`Hello ${AUTMOUSE_learning.nameBeingGreeted}!`);
  }
);