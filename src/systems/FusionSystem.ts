import { findPossibleFusions, FusionRecipe } from '../data/fusionRecipes';
import { Player } from '../entities/Player';
import { ItemSystem } from './ItemSystem';

export interface FusionResult {
  success: boolean;
  recipe: FusionRecipe | null;
  message: string;
}

export class FusionSystem {
  player: Player;
  itemSystem: ItemSystem;

  constructor(player: Player, itemSystem: ItemSystem) {
    this.player = player;
    this.itemSystem = itemSystem;
  }

  /** Check current skills for possible fusions */
  checkFusions(): { recipe: FusionRecipe; indexA: number; indexB: number }[] {
    return findPossibleFusions(this.player.skills);
  }

  /** Execute a fusion — remove two items, add fused result */
  executeFusion(recipeId: string, indexA: number, indexB: number): FusionResult {
    // Re-validate that the skills at the given indices still match the recipe
    const skills = this.player.skills;
    const possible = this.checkFusions();
    const match = possible.find(f => f.recipe.id === recipeId && f.indexA === indexA && f.indexB === indexB);

    if (!match) {
      return { success: false, recipe: null, message: '无法融合' };
    }

    // Double-check the actual skills at those indices still match
    const skillA = skills[indexA];
    const skillB = skills[indexB];
    if (!skillA || !skillB) {
      return { success: false, recipe: null, message: '无法融合' };
    }
    const recipe = match.recipe;
    const inputIds = [recipe.inputs[0], recipe.inputs[1]];
    const skillIds = [skillA.id, skillB.id];
    if (!(inputIds.includes(skillIds[0]) && inputIds.includes(skillIds[1]))) {
      return { success: false, recipe: null, message: '无法融合' };
    }

    // Remove the higher index first to avoid shifting issues
    const indices = [indexA, indexB].sort((a, b) => b - a);
    for (const idx of indices) {
      this.player.skills.splice(idx, 1);
    }

    // Add the fused result
    this.player.skills.push({ id: recipe.output, level: 1 });

    // Recalculate modifiers
    this.itemSystem.recalculate();

    return {
      success: true,
      recipe,
      message: `融合成功! 获得: ${recipe.name} — ${recipe.description}`,
    };
  }

  /** Auto-fuse the first available fusion */
  autoFuse(): FusionResult | null {
    const possible = this.checkFusions();
    if (possible.length === 0) return null;
    const first = possible[0];
    return this.executeFusion(first.recipe.id, first.indexA, first.indexB);
  }
}
