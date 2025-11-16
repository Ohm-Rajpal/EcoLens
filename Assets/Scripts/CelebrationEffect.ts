@component
export class CelebrationEffect extends BaseScriptComponent {
  @input celebrationPrefab: ObjectPrefab; // The celebration prefab
  @input spawnPosition: SceneObject; // Optional: where to spawn the effect
  @input autoDestroyAfterSeconds: number = 3; // Auto-destroy after this many seconds (0 = never)

  private spawnedObjects: SceneObject[] = [];

  onAwake() {
    if (!this.celebrationPrefab) {
      print("CelebrationEffect: No celebration prefab provided!");
    } else {
      print("CelebrationEffect: Prefab ready");
    }
  }

  // Call this function to trigger the celebration effect
  public playCelebration() {
    print("playCelebration called!");

    if (!this.celebrationPrefab) {
      print("ERROR: No celebration prefab assigned!");
      return;
    }

    print("Spawning celebration prefab!");

    // Instantiate the prefab
    const celebrationObj = this.celebrationPrefab.instantiate(this.getSceneObject());

    // Position the effect if spawn position is set
    if (this.spawnPosition) {
      celebrationObj.getTransform().setWorldPosition(
        this.spawnPosition.getTransform().getWorldPosition()
      );
      print("Positioned effect at spawn position");
    }

    print("Celebration prefab spawned successfully!");

    // Track spawned object
    this.spawnedObjects.push(celebrationObj);

    // Optional: Auto-destroy after duration
    if (this.autoDestroyAfterSeconds > 0) {
      const destroyEvent = this.createEvent("DelayedCallbackEvent");
      destroyEvent.bind(() => {
        if (celebrationObj) {
          celebrationObj.destroy();
          print("Celebration prefab destroyed after " + this.autoDestroyAfterSeconds + " seconds");
        }
      });
      destroyEvent.reset(this.autoDestroyAfterSeconds);
    }
  }

  // Clear all spawned celebrations
  public clearAllCelebrations() {
    for (let i = 0; i < this.spawnedObjects.length; i++) {
      if (this.spawnedObjects[i]) {
        this.spawnedObjects[i].destroy();
      }
    }
    this.spawnedObjects = [];
    print("All celebration objects cleared");
  }
}
