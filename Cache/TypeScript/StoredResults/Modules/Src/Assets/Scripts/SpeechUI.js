"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpeechUI = void 0;
var __selfType = requireType("./SpeechUI");
function component(target) {
    target.getTypeName = function () { return __selfType; };
    if (target.prototype.hasOwnProperty("getTypeName"))
        return;
    Object.defineProperty(target.prototype, "getTypeName", {
        value: function () { return __selfType; },
        configurable: true,
        writable: true
    });
}
const animate_1 = require("SpectaclesInteractionKit.lspkg/Utils/animate");
const Event_1 = require("SpectaclesInteractionKit.lspkg/Utils/Event");
const UI_CAM_DISTANCE = 50;
const UI_CAM_HEIGHT = -9;
const UI_TEXT_DISTANCE = 55;
const UI_TEXT_HEIGHT = -9;
let SpeechUI = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var SpeechUI = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.mainCamObj = this.mainCamObj;
            this.speecBocAnchor = this.speecBocAnchor;
            this.micRend = this.micRend;
            this.speechText = this.speechText;
            this.asrVoiceController = this.asrVoiceController;
            this.speechButtonCollider = this.speechButtonCollider;
            this.tutorialObject = this.tutorialObject; // The 3D object to show/hide
            // @input celebration: SceneObject;
            this.onSpeechReady = new Event_1.default();
            this.hasShownTutorial = false;
        }
        __initialize() {
            super.__initialize();
            this.mainCamObj = this.mainCamObj;
            this.speecBocAnchor = this.speecBocAnchor;
            this.micRend = this.micRend;
            this.speechText = this.speechText;
            this.asrVoiceController = this.asrVoiceController;
            this.speechButtonCollider = this.speechButtonCollider;
            this.tutorialObject = this.tutorialObject; // The 3D object to show/hide
            // @input celebration: SceneObject;
            this.onSpeechReady = new Event_1.default();
            this.hasShownTutorial = false;
        }
        onAwake() {
            this.speechBubbleTrans = this.speecBocAnchor.getTransform();
            this.speechBubbleTrans.setLocalScale(vec3.zero());
            this.trans = this.getSceneObject().getTransform();
            this.mainCamTrans = this.mainCamObj.getTransform();
            // this.celebration.enabled = false;
            this.animateSpeechIcon(false);
            this.speechText.text = "";
            this.createEvent("OnStartEvent").bind(this.onStart.bind(this));
            this.createEvent("UpdateEvent").bind(this.onUpdate.bind(this));
        }
        onStart() {
            this.asrVoiceController.onPartialVoiceEvent.add((text) => {
                this.speechText.text = text;
            });
            this.asrVoiceController.onFinalVoiceEvent.add((text) => {
                this.speechText.text = text;
                this.stopListening();
                // Hide tutorial object after first use
                if (!this.hasShownTutorial && this.tutorialObject) {
                    this.tutorialObject.enabled = false;
                    this.hasShownTutorial = true;
                }
                // Delay the API call by 15 seconds
                var delayEvent = this.createEvent("DelayedCallbackEvent");
                delayEvent.bind(() => {
                    // display the button after the use
                    // if (this.celebration) {
                    //   this.celebration.enabled = true;
                    // }
                    // Invoke speech ready event (triggers API call) after 15 second delay
                    this.onSpeechReady.invoke(text);
                });
                delayEvent.reset(15.0); // 15 second delay
            });
        }
        activateSpeechButton(activate) {
            this.speechButtonCollider.enabled = activate;
        }
        onSpeechButtonDown() {
            print("Speech button Down!");
            this.speechText.text = "";
            this.animateSpeechBubble(true);
            this.animateSpeechIcon(true);
            this.asrVoiceController.startListening();
        }
        stopListening() {
            print("Disabling speech UI");
            this.animateSpeechIcon(false);
            this.asrVoiceController.stopListening();
        }
        onUpdate() {
            var camPos = this.mainCamTrans.getWorldPosition();
            var desiredPosition = camPos.add(this.mainCamTrans.forward.uniformScale(-UI_CAM_DISTANCE));
            desiredPosition = desiredPosition.add(this.mainCamTrans.up.uniformScale(UI_CAM_HEIGHT));
            this.trans.setWorldPosition(vec3.lerp(this.trans.getWorldPosition(), desiredPosition, getDeltaTime() * 10));
            var desiredRotation = quat.lookAt(this.mainCamTrans.forward, vec3.up());
            this.trans.setWorldRotation(quat.slerp(this.trans.getWorldRotation(), desiredRotation, getDeltaTime() * 10));
        }
        animateSpeechIcon(active) {
            this.micRend.mainPass.Tweak_N23 = active ? 3 : 0;
            this.micRend.mainPass.Tweak_N33 = active ? 3 : 0;
            this.micRend.mainPass.Tweak_N37 = active ? 0.2 : 0;
        }
        animateSpeechBubble(open) {
            var currScale = this.speechBubbleTrans.getLocalScale();
            var desiredScale = open ? vec3.one() : vec3.zero();
            (0, animate_1.default)({
                easing: "ease-out-elastic",
                duration: 1,
                update: (t) => {
                    this.speechBubbleTrans.setLocalScale(vec3.lerp(currScale, desiredScale, t));
                },
                ended: null,
                cancelSet: new animate_1.CancelSet(),
            });
        }
    };
    __setFunctionName(_classThis, "SpeechUI");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SpeechUI = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SpeechUI = _classThis;
})();
exports.SpeechUI = SpeechUI;
//# sourceMappingURL=SpeechUI.js.map