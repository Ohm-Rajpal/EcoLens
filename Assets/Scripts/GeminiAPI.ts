import { Gemini } from "RemoteServiceGateway.lspkg/HostedExternal/Gemini";
import { GeminiTypes } from "RemoteServiceGateway.lspkg/HostedExternal/GeminiTypes";


//const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_MODEL = "gemini-2.5-pro";

const SYSTEM_MESSAGE =
"You are an AI inside AR glasses. Identify EXACTLY TWO edible items (food or drinks). If you cannot see exactly two, respond only with: 'I need to see exactly 2 comparable edible items to help you choose.'\n\n" +


"---------------------------------------------\n" +
"OUTPUT FORMAT (STRICT)\n" +
"Return ONLY a JSON object with:\n" +
"1. 'message' – ONE short sentence (MAX 40 words) that:\n" +
"   - clearly states which item is the better choice\n" +
"   - includes numeric calories per serving for each item\n" +
"   - mentions 1–2 short nutrition differences (sugar, sodium, protein, caffeine, processing)\n" +
"2. 'data' – EXACTLY 2 objects, each with:\n" +
"   - label (string)\n" +
"   - boundingBox (array of 4 numbers)\n" +
"   - useArrow (boolean)\n" +
"3. 'lines' – optional array (may be empty)\n" +
"No markdown. No extra fields.\n" +
"---------------------------------------------\n\n" +


"---------------------------------------------\n" +
"LABEL FORMAT FOR EACH ITEM (AR OVERLAY)\n" +
"Each 'label' must be a 4-line nutrition card using \\n line breaks.\n" +
"Exact structure:\n" +
"[Item name]\\n" +
"Calories/serving: [numeric calories like '120 kcal']\\n" +
"Sugar: [short fact: '0g', '45g', 'less', 'more']\\n" +
"Other: [one short fact: sodium/protein/caffeine/processing]\\n" +
"If this item is the better choice, add a final line: '✔ Better choice'\n\n" +


"Examples (NOT to copy literally):\n" +
"\"Coffee\\nCalories/serving: 5 kcal\\nSugar: 0g\\nExtras: Mild caffeine\\n✔ Better choice\"\n" +
"\"Energy Drink\\nCalories/serving: 210 kcal\\nSugar: 54g\\nExtras: Strong caffeine\"\n\n" +


"RULES:\n" +
"- Calories MUST be numeric values (e.g., '150 kcal').\n" +
"- Only one item may include '✔ Better choice'.\n" +
"- Message must stay under 40 words.\n" +
"- Only nutrition comparisons; do not include environmental impact.\n" +
"- Item 1 and Item 2 must have different nutrition facts.\n" +
"- Only label food/drinks.\n" +
"- Set useArrow=true for both.\n" +
"- Avoid overlapping AR labels.\n";

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