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
 * **Version 2.4** (Fix for missing actor face sprite and invalid animation data)
 * 
 * Changelog:
 * - Version 2.4: Retry mechanism for loading player face sprites, improved sprite validation.
 * - Version 2.3: Improved error handling for face sprite and animation fetching.
 * - Version 2.2: Fix for invalid animation data handling.
 * 
 * Plugin Commands: None
 */

(() => {
    const DEFAULT_ANIMATION_ID = 65;  // Fallback animation (Death)
    const MAX_RETRIES = 5;            // Maximum retries for loading face sprites
    let retries = 0;                  // Retry counter

    // Override BattleManager's invokeAction method to handle animations for all actions.
    const _BattleManager_invokeAction = BattleManager.invokeAction;
    BattleManager.invokeAction = function(subject, target) {
        _BattleManager_invokeAction.call(this, subject, target);

        let animationId = this._action.item().animationId;

        if (!animationId || !$dataAnimations[animationId]) {
            console.warn("No valid animation ID found. Using default (Death) animation.");
            animationId = DEFAULT_ANIMATION_ID;
        }

        displayAnimationOnTarget(subject, target, animationId);
    };

    // Display the correct animation on the target (either actor or enemy).
    function displayAnimationOnTarget(subject, target, animationId) {
        if (target.isActor()) {
            console.log("Displaying animation on actor:", target.name());
            displayAnimationOnFace(target, animationId);
        } else if (target.isEnemy()) {
            console.log("Displaying animation on enemy:", target.name());
            displayAnimationOnEnemy(target, animationId);
        }
    }

    // Display animation on actor's face sprite.
    function displayAnimationOnFace(target, animationId) {
        const faceSprite = getFaceSprite(target);

        if (faceSprite && animationId && $dataAnimations[animationId]) {
            const animationData = $dataAnimations[animationId];
            
            if (isValidAnimation(animationData)) {
                const sprite = new Sprite_Animation();
                sprite.setup(animationData, false, 0, 0);

                faceSprite.addChild(sprite);

                sprite.x = faceSprite.width / 2;
                sprite.y = faceSprite.height / 2;
                sprite.start();

                sprite.update = function() {
                    Sprite_Animation.prototype.update.call(this);
                    if (this._finished) {
                        faceSprite.removeChild(this);
                    }
                };
            } else {
                console.error("Invalid animation data for actor:", target.name());
            }
        } else {
            console.error("Missing face sprite or animation data for actor:", target.name());

            // Retry loading face sprite if not found
            if (retries < MAX_RETRIES) {
                console.warn("Retrying to find face sprite... Attempt:", retries + 1);
                retries++;
                setTimeout(() => {
                    displayAnimationOnFace(target, animationId); // Retry after delay
                }, 200);  // 200ms delay
            } else {
                console.error("Exceeded maximum retries for finding face sprite.");
            }
        }
    }

    // Display animation on enemy sprite.
    function displayAnimationOnEnemy(target, animationId) {
        const enemySprite = getEnemySprite(target);

        if (enemySprite && $dataAnimations[animationId]) {
            const animationData = $dataAnimations[animationId];

            if (isValidAnimation(animationData)) {
                const sprite = new Sprite_Animation();
                sprite.setup(animationData, false, 0, 0);
                enemySprite.addChild(sprite);
                sprite.start();

                sprite.update = function() {
                    Sprite_Animation.prototype.update.call(this);
                    if (this._finished) {
                        enemySprite.removeChild(this);
                    }
                };
            } else {
                console.error("Invalid animation data for enemy:", target.name());
            }
        } else {
            console.warn("Missing enemy sprite or animation data.");
        }
    }

    // Helper function to validate animation data.
    function isValidAnimation(animationData) {
        return animationData && animationData.frames && animationData.timings;
    }

    // Helper function to retrieve the face sprite from the battle status window.
    function getFaceSprite(target) {
        const statusWindow = SceneManager._scene._statusWindow;
        
        // Check status window and face sprites
        if (statusWindow && statusWindow._faceSprites && Array.isArray(statusWindow._faceSprites)) {
            const actorIndex = $gameParty.members().indexOf(target);
            return statusWindow._faceSprites[actorIndex];
        } else {
            console.warn("Status window or face sprites not found.");
            return null;  // Face sprite not found
        }
    }

    // Helper function to get the enemy sprite.
    function getEnemySprite(target) {
        const spriteset = SceneManager._scene._spriteset;
        if (spriteset && spriteset._enemySprites) {
            const enemyIndex = $gameTroop.members().indexOf(target);
            return spriteset._enemySprites[enemyIndex];
        }
        return null;
    }
})();
