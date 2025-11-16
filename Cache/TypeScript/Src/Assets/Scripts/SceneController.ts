import { GeminiAPI } from "./GeminiAPI";
import { SpeechUI } from "./SpeechUI";
import { ResponseUI } from "./ResponseUI";
import { Loading } from "./Loading";
import { DepthCache } from "./DepthCache";
import { DebugVisualizer } from "./DebugVisualizer";


@component
export class SceneController extends BaseScriptComponent {
  @input
  @hint("Show debug visuals in the scene")
  showDebugVisuals: boolean = false;
  @input
  @hint("Visualizes 2D points over the camera frame for debugging")
  debugVisualizer: DebugVisualizer;
  @input
  @hint("Handles speech input and ASR")
  speechUI: SpeechUI;
  @input
  @hint("Calls to the Gemini API using Smart Gate")
  gemini: GeminiAPI;
  @input
  @hint("Displays AI speech output")
  responseUI: ResponseUI;
  @input
  @hint("Loading visual")
  loading: Loading;
  @input
  @hint("Caches depth frame and converts pixel positions to world space")
  depthCache: DepthCache;


  private isRequestRunning = false;


  onAwake() {
    this.createEvent("OnStartEvent").bind(this.onStart.bind(this));
  }


  onStart() {
    //listen to new speech input
    this.speechUI.onSpeechReady.add((text) => {
      this.onSpeechRecieved(text);
    });
  }


  onSpeechRecieved(text: string) {
    this.speechUI.activateSpeechButton(false);
    if (this.isRequestRunning) {
      print("REQUEST ALREADY RUNNING");
      return;
    }
    print("MAKING REQUEST~~~~~");
    this.isRequestRunning = true;
    this.loading.activateLoder(true);
    //reset everything
    this.responseUI.clearLabels();
    this.responseUI.closeResponseBubble();
    //save depth frame
    let depthFrameID = this.depthCache.saveDepthFrame();
    let camImage = this.depthCache.getCamImageWithID(depthFrameID);
    //take capture
    this.sendToGemini(camImage, text, depthFrameID);
    if (this.showDebugVisuals) {
      this.debugVisualizer.updateCameraFrame(camImage);
    }
  }


  private sendToGemini(
    cameraFrame: Texture,
    text: string,
    depthFrameID: number
  ) {
    this.gemini.makeGeminiRequest(cameraFrame, text, (response) => {
      this.isRequestRunning = false;
      this.speechUI.activateSpeechButton(true);
      this.loading.activateLoder(false);

      // Open the response bubble with the comparison message
      this.responseUI.openResponseBubble(response.message || response.aiMessage);

      // Check if we have comparison data with exactly 2 items
      const dataArray = response.data || response.points || [];
      print("Response data LENGTH: " + dataArray.length);

      // Create labels for each detected item
      for (var i = 0; i < dataArray.length; i++) {
        var itemData = dataArray[i];

        let pixelPos = itemData.pixelPos;

        if (!pixelPos && itemData.coordinates && itemData.coordinates.length >= 4) {
          print("Item " + i + " has coordinates but no pixelPos - skipping to avoid bad world position");
          continue;
        }

        if (!pixelPos) {
          print("No position data for item " + i);
          continue;
        }

        if (this.showDebugVisuals) {
          this.debugVisualizer.visualizeLocalPoint(pixelPos, cameraFrame);
        }

        var worldPosition = this.depthCache.getWorldPositionWithID(
          pixelPos,
          depthFrameID
        );

        if (worldPosition != null) {
          // Pass the full message to loadWorldLabel so it can extract item-specific data
          this.responseUI.loadWorldLabel(
            itemData.label,
            worldPosition,
            itemData.showArrow || false,
            response.message || response.aiMessage
          );
        }
      }
      this.depthCache.disposeDepthFrame(depthFrameID);
    });
  }
}