if (script.onAwake) {
    script.onAwake();
    return;
}
function checkUndefined(property, showIfData) {
    for (var i = 0; i < showIfData.length; i++) {
        if (showIfData[i][0] && script[showIfData[i][0]] != showIfData[i][1]) {
            return;
        }
    }
    if (script[property] == undefined) {
        throw new Error("Input " + property + " was not provided for the object " + script.getSceneObject().name);
    }
}
// @input bool showDebugVisuals {"hint":"Show debug visuals in the scene"}
// @input AssignableType debugVisualizer {"hint":"Visualizes 2D points over the camera frame for debugging"}
// @input AssignableType_1 speechUI {"hint":"Handles speech input and ASR"}
// @input AssignableType_2 gemini {"hint":"Calls to the Gemini API using Smart Gate"}
// @input AssignableType_3 responseUI {"hint":"Displays AI speech output"}
// @input AssignableType_4 loading {"hint":"Loading visual"}
// @input AssignableType_5 depthCache {"hint":"Caches depth frame and converts pixel positions to world space"}
if (!global.BaseScriptComponent) {
    function BaseScriptComponent() {}
    global.BaseScriptComponent = BaseScriptComponent;
    global.BaseScriptComponent.prototype = Object.getPrototypeOf(script);
    global.BaseScriptComponent.prototype.__initialize = function () {};
    global.BaseScriptComponent.getTypeName = function () {
        throw new Error("Cannot get type name from the class, not decorated with @component");
    };
}
var Module = require("../../../../Modules/Src/Assets/Scripts/SceneController");
Object.setPrototypeOf(script, Module.SceneController.prototype);
script.__initialize();
let awakeEvent = script.createEvent("OnAwakeEvent");
awakeEvent.bind(() => {
    checkUndefined("showDebugVisuals", []);
    checkUndefined("debugVisualizer", []);
    checkUndefined("speechUI", []);
    checkUndefined("gemini", []);
    checkUndefined("responseUI", []);
    checkUndefined("loading", []);
    checkUndefined("depthCache", []);
    if (script.onAwake) {
       script.onAwake();
    }
});
