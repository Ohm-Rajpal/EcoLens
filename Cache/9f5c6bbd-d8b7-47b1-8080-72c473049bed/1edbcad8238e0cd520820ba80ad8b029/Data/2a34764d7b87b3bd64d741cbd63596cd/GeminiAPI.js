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
exports.GeminiAPI = void 0;
var __selfType = requireType("./GeminiAPI");
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
const Gemini_1 = require("RemoteServiceGateway.lspkg/HostedExternal/Gemini");
//const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_MODEL = "gemini-2.5-pro";
const SYSTEM_MESSAGE = 
//Goal
"You are an AI inside of augmented reality glasses. " +
    //Return Format
    "Return bounding boxes as a JSON array with labels, your answer should be a JSON object with 3 keys: 'message', 'data' and 'lines. The 'data' key should contain an array of objects, each with a label and coordinates of a bounding box. " +
    "if the user asks about a specific area, where something is, or how to do a task, you can set showArrow to true and that will create a arrow visual in the scene. This should be set to true most of the time.\n" +
    //Warnings
    "Return bounding boxes as a JSON array with labels. Never return masks or code fencing. Limit to 25 objects.\n" +
    "If an object is present multiple times, name them according to their unique characteristic (colors, size, position, unique characteristics, etc..). \n" +
    //Context Dump
    "The label and arrow can be useful for tasks, if user asks how to use something, maybe use an arrow and set the label to Step #1, Step #2, etc. \n" +
    "Dont label anything over 20 feet away from the camera. \n" +
    "Do not label objects that you already labled! Make sure the AR content you add doesnt overlap each other, but feel free to make as many as you see fit! You are the AR and AI BOSS!\n";
let GeminiAPI = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var GeminiAPI = _classThis = class extends _classSuper {
        constructor() {
            super();
        }
        __initialize() {
            super.__initialize();
        }
        onAwake() { }
        makeGeminiRequest(texture, userQuery, callback) {
            Base64.encodeTextureAsync(texture, (base64String) => {
                print("Making image request...");
                this.sendGeminiChat(userQuery, base64String, texture, callback);
            }, () => {
                print("Image encoding failed!");
            }, CompressionQuality.HighQuality, EncodingType.Png);
        }
        sendGeminiChat(request, image64, texture, callback) {
            var respSchema = {
                type: "object",
                properties: {
                    message: { type: "string" },
                    data: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                boundingBox: {
                                    type: "array",
                                    items: { type: "number" },
                                },
                                label: { type: "string" },
                                useArrow: { type: "boolean" },
                            },
                            required: ["boundingBox", "label", "useArrow"],
                        },
                    },
                },
                required: ["message", "data"],
            };
            const reqObj = {
                model: GEMINI_MODEL,
                type: "generateContent",
                body: {
                    contents: [
                        {
                            role: "user",
                            parts: [
                                {
                                    inlineData: {
                                        mimeType: "image/png",
                                        data: image64,
                                    },
                                },
                                {
                                    text: request,
                                },
                            ],
                        },
                    ],
                    systemInstruction: {
                        parts: [
                            {
                                text: SYSTEM_MESSAGE,
                            },
                        ],
                    },
                    generationConfig: {
                        temperature: 0.5,
                        responseMimeType: "application/json",
                        response_schema: respSchema,
                    },
                },
            };
            print(JSON.stringify(reqObj.body));
            Gemini_1.Gemini.models(reqObj)
                .then((response) => {
                var responseObj = JSON.parse(response.candidates[0].content.parts[0].text);
                this.onGeminiResponse(responseObj, texture, callback);
            })
                .catch((error) => {
                print("Gemini error: " + error);
                if (callback != null) {
                    callback({
                        points: [],
                        lines: [],
                        aiMessage: "reponse error...",
                    });
                }
            });
        }
        onGeminiResponse(responseObj, texture, callback) {
            let geminiResult = {
                points: [],
                aiMessage: "no response",
            };
            print("GEMINI RESPONSE: " + responseObj.message);
            geminiResult.aiMessage = responseObj.message;
            try {
                //load points
                var data = responseObj.data;
                print("Data: " + JSON.stringify(data));
                print("POINT LENGTH: " + data.length);
                for (var i = 0; i < data.length; i++) {
                    var centerPoint = this.boundingBoxToPixels(data[i].boundingBox, texture.getWidth(), texture.getHeight());
                    var lensStudioPoint = {
                        pixelPos: centerPoint,
                        label: data[i].label,
                        showArrow: data[i].useArrow,
                    };
                    geminiResult.points.push(lensStudioPoint);
                }
            }
            catch (error) {
                print("Error parsing points!: " + error);
            }
            if (callback != null) {
                callback(geminiResult);
            }
        }
        boundingBoxToPixels(boxPoints, width, height) {
            var x1 = MathUtils.remap(boxPoints[1], 0, 1000, 0, width);
            var y1 = MathUtils.remap(boxPoints[0], 0, 1000, height, 0); //flipped for lens studio
            var topLeft = new vec2(x1, height - y1);
            var x2 = MathUtils.remap(boxPoints[3], 0, 1000, 0, width);
            var y2 = MathUtils.remap(boxPoints[2], 0, 1000, height, 0);
            var bottomRight = new vec2(x2, height - y2);
            var center = topLeft.add(bottomRight).uniformScale(0.5);
            return center;
        }
    };
    __setFunctionName(_classThis, "GeminiAPI");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        GeminiAPI = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return GeminiAPI = _classThis;
})();
exports.GeminiAPI = GeminiAPI;
//# sourceMappingURL=GeminiAPI.js.map