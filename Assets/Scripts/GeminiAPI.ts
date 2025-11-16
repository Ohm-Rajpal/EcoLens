import { Gemini } from "RemoteServiceGateway.lspkg/HostedExternal/Gemini";
import { GeminiTypes } from "RemoteServiceGateway.lspkg/HostedExternal/GeminiTypes";


//const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_MODEL = "gemini-2.5-pro";


const SYSTEM_MESSAGE =
"You are an AI assistant inside of augmented reality glasses designed to help users make healthier and more eco-friendly choices. " +
"Return bounding boxes as a JSON array with labels, your answer should be a JSON object with 3 keys: 'message', 'data' and 'lines.' " +
"The 'data' key should contain an array of objects, each with a 'label', 'description', and 'boundingBox' (array of 4 numbers), and optional 'showArrow' boolean. " + // 🔹 changed line
"CRITICAL: You must identify and label exactly 2 comparable edible objects (food or drinks) that the user can choose between. " +
"If there are not exactly 2 comparable edible objects visible, respond with a message saying 'I need to see exactly 2 comparable edible items to help you choose.'\n" +
"Your 'message' field should contain a formatted comparison with line breaks between sections: " +
"Format the message EXACTLY like this with \\n for line breaks: " +
"WINNER: [Item name] is the better choice because [one clear reason]\\n\\n" +
"HEALTH:\\n" +
"[Item 1] - [2 simple health facts in one sentence]\\n" +
"[Item 2] - [2 simple health facts in one sentence]\\n\\n" +
"IMPACT:\\n" +
"Both items [shared environmental impact in relatable terms - 1-2 sentences max]\\n\\n" +
"REUSE:\\n" +
"[Item 1] bag can become [idea]. [Item 2] bag works as [idea].\\n" +
"Use everyday comparisons people can visualize: " +
"- Instead of '150g CO2' say 'like driving 0.5 miles' " +
"- Instead of '500 years to decompose' say 'will exist until year 2524' " +
"- Instead of '200mg sodium' say 'half the salt' " +
"Keep each section scannable in seconds. " +
"Be informative without preaching.\n" +
"The 'data' array must contain exactly 2 objects with labels, descriptions, and bounding box coordinates. " + // 🔹 updated
"Never return masks or code fencing. Return only valid JSON matching the required schema.";

@component
export class GeminiAPI extends BaseScriptComponent {
onAwake() {}


makeGeminiRequest(
  texture: Texture,
  userQuery: string,
  callback: (any) => void
) {
  Base64.encodeTextureAsync(
    texture,
    (base64String) => {
      print("Making image request...");
      this.sendGeminiChat(userQuery, base64String, texture, callback);
    },
    () => {
      print("Image encoding failed!");
    },
    CompressionQuality.HighQuality,
    EncodingType.Png
  );
}


sendGeminiChat(
  request: string,
  image64: string,
  texture: Texture,
  callback: (response: any) => void
) {
var respSchema: GeminiTypes.Common.Schema = {
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
          description: { type: "string" }, // 🔹 NEW
          showArrow: { type: "boolean" },
        },
        required: ["boundingBox", "label", "description"], // 🔹 updated
      },
    },
  },
  required: ["message", "data"],
};


  const reqObj: GeminiTypes.Models.GenerateContentRequest = {
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
        responseSchema: respSchema,
      },
    },
  };


  print(JSON.stringify(reqObj.body));


  Gemini.models(reqObj)
    .then((response) => {
      var responseObj = JSON.parse(
        response.candidates[0].content.parts[0].text
      );
      this.onGeminiResponse(responseObj, texture, callback);
    })
    .catch((error) => {
      print("Gemini error: " + error);
      if (callback != null) {
        callback({
          points: [],
          lines: [],
          aiMessage: "response error...",
          message: "response error...",
          data: []
        });
      }
    });
}


private onGeminiResponse(
  responseObj: any,
  texture: Texture,
  callback: (response: any) => void
) {
  let geminiResult = {
    points: [],
    data: [],
    aiMessage: responseObj.message || "no response",
    message: responseObj.message || "no response"
  };


  print("GEMINI RESPONSE: " + responseObj.message);
   try {
    // Load points/data
    var data = responseObj.data;
    print("Data: " + JSON.stringify(data));
    print("DATA LENGTH: " + data.length);
  
    for (var i = 0; i < data.length; i++) {
      var centerPoint = this.boundingBoxToPixels(
        data[i].boundingBox,
        texture.getWidth(),
        texture.getHeight()
      );

      var lensStudioPoint = {
        pixelPos: centerPoint,
        label: data[i].label,
        description: data[i].description,        // 🔹 NEW
        showArrow: data[i].showArrow || false,
      };
      geminiResult.points.push(lensStudioPoint);

      geminiResult.data.push({
        label: data[i].label,
        description: data[i].description,        // 🔹 NEW
        coordinates: data[i].boundingBox,
        pixelPos: centerPoint,
        showArrow: data[i].showArrow || false,
      });
    }

  } catch (error) {
    print("Error parsing points!: " + error);
  }
   if (callback != null) {
    callback(geminiResult);
  }
}


private boundingBoxToPixels(
  boxPoints: any,
  width: number,
  height: number
): vec2 {
    var x1 = MathUtils.remap(boxPoints[1], 0, 1000, 0, width);
    var y1 = MathUtils.remap(boxPoints[0], 0, 1000, height, 0); //flipped for lens studio
    var topLeft = new vec2(x1, height - y1);
    var x2 = MathUtils.remap(boxPoints[3], 0, 1000, 0, width);
    var y2 = MathUtils.remap(boxPoints[2], 0, 1000, height, 0);
    var bottomRight = new vec2(x2, height - y2);
    var center = topLeft.add(bottomRight).uniformScale(0.5);
    return center;
  }
}
