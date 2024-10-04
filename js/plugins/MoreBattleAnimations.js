/*:
 * @target MZ
 * @plugindesc Displays attack, skill, and item animations on the appropriate target's face or battler graphic in battle. If no animation is found, the "Death" animation (ID: 65) will play.
 * @help 
 * This plugin shows attack, skill, and item animations over the target's face graphic or battler sprite
 * when any action is performed by any entity (enemy or party member).
 * 
 * It automatically fetches and plays the correct animation ID for all actions, including self-targets and item usage.
 * If no valid animation is found, the "Death" animation (ID: 65) will be played as a fallback.
 * 
 * Plugin Commands: None
 * 
 * Version: 1.7 (Improved face graphic targeting and fallback animation handling)
 */

(() => {
    const DEFAULT_ANIMATION_ID = 65;  // Set the fallback animation to "Death" (ID: 65)

    // Store the original method to invoke actions.
    const _BattleManager_invokeAction = BattleManager.invokeAction;

    // Extend the invokeAction method to detect all actions and apply animations to the correct target.
    BattleManager.invokeAction = function(subject, target) {
        // Call the original invokeAction method first.
        _BattleManager_invokeAction.call(this, subject, target);

        // Get the action's animation ID from the item or skill database.
        let animationId = this._action.item().animationId;

        // If no valid animation ID is found, use a default fallback animation.
        if (!animationId || !$dataAnimations[animationId]) {
            console.warn("No valid animation ID found for this action. Using default 'Death' animation.");
            animationId = DEFAULT_ANIMATION_ID;
        }

        // Play the animation over the correct target.
        displayAnimationOnTarget(subject, target, animationId);
    };

    // Function to display animation on the target's face or battler graphic.
    function displayAnimationOnTarget(subject, target, animationId) {
        // Check if the target is an actor (player character) or enemy.
        if (target.isActor()) {
            displayAnimationOnFace(target, animationId);
        } else if (target.isEnemy()) {
            displayAnimationOnEnemy(target, animationId);
        }
    }

    // Function to display animation on the actor's face graphic in the status window.
    function displayAnimationOnFace(target, animationId) {
        // Get the face graphic image of the target.
        const faceName = target.faceName();
        const faceIndex = target.faceIndex();

        // Ensure the target is valid and has a face graphic.
        if (faceName && animationId && $dataAnimations[animationId]) {
            // Validate that animation data exists before trying to set up the animation.
            const animationData = $dataAnimations[animationId];
            if (animationData && animationData.frames && animationData.timings) {
                // Create a new sprite for the animation.
                const sprite = new Sprite_Animation();
                sprite.setup(animationData, false, 0, 0); // Use the dynamic animation ID
                
                // Get the face sprite for the actor in the battle status window.
                const faceSprite = getFaceSprite(target);
                
                // Ensure faceSprite is valid before proceeding.
                if (faceSprite) {
                    faceSprite.addChild(sprite);
                    
                    // Play the animation centered on the face graphic.
                    sprite.x = faceSprite.width / 2;  // Center on face sprite's X axis
                    sprite.y = faceSprite.height / 2;  // Center on face sprite's Y axis
                    sprite.start();

                    // Remove the animation once it's done.
                    sprite.update = function() {
                        Sprite_Animation.prototype.update.call(this);
                        if (this._finished) {
                            faceSprite.removeChild(this);
                        }
                    };
                } else {
                    console.warn("Could not find face sprite for actor: " + target.name());
                }
            } else {
                console.error("Invalid or incomplete animation data for ID: " + animationId);
            }
        } else {
            console.error("Animation or face graphic missing for actor: " + target.name());
        }
    }

    // Function to display animation on the enemy's battler graphic.
    function displayAnimationOnEnemy(target, animationId) {
        // Get the enemy sprite from the battle scene.
        const enemySprite = getEnemySprite(target);
        
        // Ensure enemySprite exists before attempting to add an animation.
        if (enemySprite && $dataAnimations[animationId]) {
            // Validate that animation data exists before trying to set up the animation.
            const animationData = $dataAnimations[animationId];
            if (animationData && animationData.frames && animationData.timings) {
                // Create a new sprite for the animation.
                const sprite = new Sprite_Animation();
                sprite.setup(animationData, false, 0, 0); // Use the dynamic animation ID
                
                // Add the animation sprite to the enemy battler's sprite.
                enemySprite.addChild(sprite);
                
                // Play the animation over the enemy.
                sprite.start();

                // Remove the animation once it's done.
                sprite.update = function() {
                    Sprite_Animation.prototype.update.call(this);
                    if (this._finished) {
                        enemySprite.removeChild(this);
                    }
                };
            } else {
                console.error("Invalid or incomplete animation data for enemy: " + target.name());
            }
        } else {
            console.warn("Enemy sprite or animation data not found for enemy: " + target.name());
        }
    }

    // Function to get the face sprite of the target actor.
    function getFaceSprite(target) {
        // Assuming BattleStatusWindow holds the face graphics in battle.
        const statusWindow = SceneManager._scene._statusWindow;
        if (statusWindow && statusWindow._faceSprites) {
            const actorIndex = $gameParty.members().indexOf(target);
            return statusWindow._faceSprites[actorIndex]; // Assuming faceSprites holds the actors' face sprites.
        }
        return null;
    }

    // Function to get the sprite of the target enemy.
    function getEnemySprite(target) {
        // Assuming enemies are displayed in the current battle scene.
        const spriteset = SceneManager._scene._spriteset;
        if (spriteset && spriteset._enemySprites) {
            const enemySprites = spriteset._enemySprites;
            const enemyIndex = $gameTroop.members().indexOf(target);
            return enemySprites[enemyIndex];
        }
        return null;
    }
})();
