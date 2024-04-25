//=============================================================================
// EnemyAttackAnimation.js
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Displays enemy attack animations on player face graphics in battle.
 * @author anarchon42069
 * @version 1.1.1
 * @help This plugin displays enemy attack animations on player face graphics
 * in battle.
 *
 * This plugin applies to all battles, including test battles launched from
 * the RPG Maker MZ database.
 */

(() => {
    // Overriding the startDamagePopup method of Sprite_Battler class
    const _Sprite_Battler_startDamagePopup = Sprite_Battler.prototype.startDamagePopup;
    Sprite_Battler.prototype.startDamagePopup = function() {
        _Sprite_Battler_startDamagePopup.call(this); // Calling the original method
        
        // Logging to the console for debugging
        console.log("startDamagePopup called for Sprite_Battler:", this);

        // Checking if the battler is an actor (player character)
        if (this._battler.isActor()) {
            const targetActorId = this._battler.actorId(); // Getting the actor ID
            const animationId = this._battler.attackAnimationId(); // Getting the attack animation ID
            
            // Logging actor ID and animation ID for debugging
            console.log("Actor ID:", targetActorId);
            console.log("Attack Animation ID:", animationId);

            // Finding the corresponding face sprite of the targeted player character
            const targetSprite = BattleManager._spriteset.findTargetFaceSprite(targetActorId);
            
            // Logging the target sprite for debugging
            console.log("Target Sprite:", targetSprite);
            
            // Checking if the target sprite exists and the animation ID is valid
            if (targetSprite && animationId > 0) {
                // Setting up the animation on the target sprite
                targetSprite.setupAnimation(animationId);
                
                // Logging animation setup for debugging
                console.log("Animation setup for Target Sprite");
            }
        }
    };

    // Adding a method to Spriteset_Battle class to find the face sprite of a specific actor
    Spriteset_Battle.prototype.findTargetFaceSprite = function(actorId) {
        // Iterating over face sprites
        for (const sprite of this._faceSprites) {
            // Checking if the sprite belongs to the specified actor
            if (sprite._actor && sprite._actor.actorId() === actorId) {
                return sprite; // Returning the sprite if found
            }
        }
        return null; // Returning null if sprite not found
    };
})();
