import animate, {
  CancelSet,
 } from "SpectaclesInteractionKit.lspkg/Utils/animate";
 import { WorldLabel } from "./WorldLabel";
 
 
 const MAIN_RESPONSE_CHARACTER_COUNT = 999;
 
 
 @component
 export class ResponseUI extends BaseScriptComponent {
  @input responseAIText: Text;
  @input worldLabelPrefab: ObjectPrefab;
  @input worldArrowPrefab: ObjectPrefab;
  @input responseUIObj: SceneObject;
 
 
  private responseBubbleTrans: Transform;
 
 
  onAwake() {
    this.responseBubbleTrans = this.responseUIObj.getTransform();
    this.responseBubbleTrans.setLocalScale(vec3.zero());
  }
 
 
  openResponseBubble(message: string) {
    // Only show the winner message in the main bubble
    const winnerMatch = message.match(/WINNER: ([^\n]+)/);
    if (winnerMatch) {
      this.responseAIText.text = winnerMatch[1];
    } else {
      this.responseAIText.text = message.substring(0, MAIN_RESPONSE_CHARACTER_COUNT);
    }
   
    this.animateResponseBubble(true);
  }
 
 
  closeResponseBubble() {
    this.responseAIText.text = "";
    this.animateResponseBubble(false);
  }
 
 
  loadWorldLabel(label: string, worldPosition: vec3, useArrow: boolean, fullMessage?: string) {
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
    var worldLabel = labelObj.getComponent(WorldLabel.getTypeName());
    worldLabel.textComp.text = tempLabel;
  }
 
 
  extractItemData(itemName: string, fullMessage: string) {
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
 
 
  private animateResponseBubble(open: boolean) {
    var currScale = this.responseBubbleTrans.getLocalScale();
    var desiredScale = open ? vec3.one() : vec3.zero();
    animate({
      easing: "ease-out-elastic",
      duration: 1,
      update: (t) => {
        this.responseBubbleTrans.setLocalScale(
          vec3.lerp(currScale, desiredScale, t)
        );
      },
      ended: null,
      cancelSet: new CancelSet(),
    });
  }
 }
 