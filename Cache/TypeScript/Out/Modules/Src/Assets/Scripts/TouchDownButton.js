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
exports.TouchDownButton = void 0;
var __selfType = requireType("./TouchDownButton");
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
const Event_1 = require("SpectaclesInteractionKit.lspkg/Utils/Event");
const Interactable_1 = require("SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable");
const NativeLogger_1 = require("SpectaclesInteractionKit.lspkg/Utils/NativeLogger");
const InspectorCallbacks_1 = require("SpectaclesInteractionKit.lspkg/Utils/InspectorCallbacks");
const TAG = "PinchDownButton";
let TouchDownButton = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var TouchDownButton = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.editEventCallbacks = this.editEventCallbacks;
            this.customFunctionForOnButtonPinchedDown = this.customFunctionForOnButtonPinchedDown;
            this.customFunctionForOnButtonPinchedUp = this.customFunctionForOnButtonPinchedUp;
            this.onButtonPinchedDownFunctionNames = this.onButtonPinchedDownFunctionNames;
            this.onButtonPinchedUpFunctionNames = this.onButtonPinchedUpFunctionNames;
            this.interactable = null;
            this.onButtonPinchedEventDown = new Event_1.default();
            this.onButtonPinchedDown = this.onButtonPinchedEventDown.publicApi();
            this.onButtonPinchedEventUp = new Event_1.default();
            this.onButtonPinchedUp = this.onButtonPinchedEventUp.publicApi();
            // Native Logging
            this.log = new NativeLogger_1.default(TAG);
        }
        __initialize() {
            super.__initialize();
            this.editEventCallbacks = this.editEventCallbacks;
            this.customFunctionForOnButtonPinchedDown = this.customFunctionForOnButtonPinchedDown;
            this.customFunctionForOnButtonPinchedUp = this.customFunctionForOnButtonPinchedUp;
            this.onButtonPinchedDownFunctionNames = this.onButtonPinchedDownFunctionNames;
            this.onButtonPinchedUpFunctionNames = this.onButtonPinchedUpFunctionNames;
            this.interactable = null;
            this.onButtonPinchedEventDown = new Event_1.default();
            this.onButtonPinchedDown = this.onButtonPinchedEventDown.publicApi();
            this.onButtonPinchedEventUp = new Event_1.default();
            this.onButtonPinchedUp = this.onButtonPinchedEventUp.publicApi();
            // Native Logging
            this.log = new NativeLogger_1.default(TAG);
        }
        onAwake() {
            this.interactable = this.getSceneObject().getComponent(Interactable_1.Interactable.getTypeName());
            this.createEvent("OnStartEvent").bind(() => {
                if (!this.interactable) {
                    throw new Error("Pinch Button requires an Interactable Component on the same Scene object in order to work - please ensure one is added.");
                }
                this.interactable.onTriggerStart.add((interactorEvent) => {
                    try {
                        if (this.enabled) {
                            this.onButtonPinchedEventDown.invoke(interactorEvent);
                        }
                    }
                    catch (e) {
                        this.log.e("Error invoking onButtonPinchedEvent!");
                        print(e);
                    }
                });
                this.interactable.onTriggerEnd.add((interactorEvent) => {
                    try {
                        if (this.enabled) {
                            this.onButtonPinchedEventUp.invoke(interactorEvent);
                        }
                    }
                    catch (e) {
                        this.log.e("Error invoking onButtonPinchedEvent!");
                        print(e);
                    }
                });
            });
            if (this.editEventCallbacks && this.customFunctionForOnButtonPinchedDown) {
                this.onButtonPinchedDown.add((0, InspectorCallbacks_1.createCallback)(this.customFunctionForOnButtonPinchedDown, this.onButtonPinchedDownFunctionNames));
                if (this.editEventCallbacks && this.customFunctionForOnButtonPinchedUp) {
                    this.onButtonPinchedUp.add((0, InspectorCallbacks_1.createCallback)(this.customFunctionForOnButtonPinchedUp, this.onButtonPinchedUpFunctionNames));
                }
            }
        }
    };
    __setFunctionName(_classThis, "TouchDownButton");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        TouchDownButton = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return TouchDownButton = _classThis;
})();
exports.TouchDownButton = TouchDownButton;
//# sourceMappingURL=TouchDownButton.js.map