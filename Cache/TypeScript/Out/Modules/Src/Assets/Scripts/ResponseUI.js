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
exports.ResponseUI = void 0;
var __selfType = requireType("./ResponseUI");
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
const WorldLabel_1 = require("./WorldLabel");
const MAIN_RESPONSE_CHARACTER_COUNT = 999;
let ResponseUI = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var ResponseUI = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.responseAIText = this.responseAIText;
            this.worldLabelPrefab = this.worldLabelPrefab;
            this.worldArrowPrefab = this.worldArrowPrefab;
            this.responseUIObj = this.responseUIObj;
        }
        __initialize() {
            super.__initialize();
            this.responseAIText = this.responseAIText;
            this.worldLabelPrefab = this.worldLabelPrefab;
            this.worldArrowPrefab = this.worldArrowPrefab;
            this.responseUIObj = this.responseUIObj;
        }
        onAwake() {
            this.responseBubbleTrans = this.responseUIObj.getTransform();
            this.responseBubbleTrans.setLocalScale(vec3.zero());
        }
        openResponseBubble(message) {
            // Only show the winner message in the main bubble
            const winnerMatch = message.match(/WINNER: ([^\n]+)/);
            if (winnerMatch) {
                this.responseAIText.text = winnerMatch[1];
            }
            else {
                this.responseAIText.text = message.substring(0, MAIN_RESPONSE_CHARACTER_COUNT);
            }
            this.animateResponseBubble(true);
        }
        closeResponseBubble() {
            this.responseAIText.text = "";
            this.animateResponseBubble(false);
        }
        loadWorldLabel(label, worldPosition, useArrow, fullMessage) {
            let tempLabel = label;
            // If we have a fullMessage, parse it to get item-specific data
            if (fullMessage) {
                const itemData = this.extractItemData(tempLabel, fullMessage);
                if (itemData) {
                    tempLabel = itemData;
                }
            }
            // Create and position label in world space
            var prefab = useArrow ? this.worldArrowPrefab : this.worldLabelPrefab;
            var labelObj = prefab.instantiate(this.getSceneObject());
            labelObj.getTransform().setWorldPosition(worldPosition);
            var worldLabel = labelObj.getComponent(WorldLabel_1.WorldLabel.getTypeName());
            worldLabel.textComp.text = tempLabel;
        }
        extractItemData(itemName, fullMessage) {
            // Parse the message to find this specific item's data
            const lines = fullMessage.split('\n');
            let healthInfo = "";
            let impactInfo = "";
            let reuseInfo = "";
            let isWinner = false;
            // Check if this item is the winner
            const winnerMatch = fullMessage.match(/WINNER: ([^-]+)/);
            if (winnerMatch && winnerMatch[1].includes(itemName)) {
                isWinner = true;
            }
            // Extract health info for this item
            const healthSection = fullMessage.match(/HEALTH:[\s\S]*?(?=IMPACT:|$)/);
            if (healthSection) {
                const healthLines = healthSection[0].split('\n');
                for (const line of healthLines) {
                    if (line.includes(itemName)) {
                        const parts = line.split(' - ');
                        if (parts.length > 1) {
                            healthInfo = parts[1].trim().substring(0, 30);
                        }
                    }
                }
            }
            // Extract impact info (shared for both items)
            const impactMatch = fullMessage.match(/IMPACT:\n([^\n]+)/);
            if (impactMatch) {
                impactInfo = impactMatch[1].trim().substring(0, 30);
            }
            // Extract reuse info for this item
            const reuseSection = fullMessage.match(/REUSE:[\s\S]*?$/);
            if (reuseSection) {
                const reuseLine = reuseSection[0];
                if (reuseLine.includes(itemName)) {
                    // Find the part about this specific item
                    const parts = reuseLine.split('. ');
                    for (const part of parts) {
                        if (part.includes(itemName)) {
                            reuseInfo = part.replace(itemName + " bag can become", "→")
                                .replace(itemName + " works as", "→")
                                .trim().substring(0, 25);
                        }
                    }
                }
            }
            // Format the label with all information
            const winnerTag = isWinner ? "✓ " : "";
            return `${winnerTag}${itemName}\n` +
                `${healthInfo ? healthInfo : ""}\n` +
                `${impactInfo ? impactInfo : ""}\n` +
                `${reuseInfo ? "Reuse" + reuseInfo : ""}`;
        }
        clearLabels() {
            var points = [];
            for (var i = 0; i < this.getSceneObject().getChildrenCount(); i++) {
                var childObj = this.getSceneObject().getChild(i);
                points.push(childObj);
            }
            for (var i = 0; i < points.length; i++) {
                var child = points[i];
                child.destroy();
            }
        }
        animateResponseBubble(open) {
            var currScale = this.responseBubbleTrans.getLocalScale();
            var desiredScale = open ? vec3.one() : vec3.zero();
            (0, animate_1.default)({
                easing: "ease-out-elastic",
                duration: 1,
                update: (t) => {
                    this.responseBubbleTrans.setLocalScale(vec3.lerp(currScale, desiredScale, t));
                },
                ended: null,
                cancelSet: new animate_1.CancelSet(),
            });
        }
    };
    __setFunctionName(_classThis, "ResponseUI");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ResponseUI = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ResponseUI = _classThis;
})();
exports.ResponseUI = ResponseUI;
//# sourceMappingURL=ResponseUI.js.map