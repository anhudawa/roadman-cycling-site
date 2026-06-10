/**
 * Fuel Planner — Dietary preference labels & guidance.
 *
 * Label-only: the macro targets are identical whatever the rider eats.
 * These notes flag how to hit the same carbohydrate, protein and fat
 * numbers with compatible food sources.
 */

import type { DietaryPreference } from './types';

export interface DietaryMeta {
  value: DietaryPreference;
  label: string;
  /** Short chip label. */
  short: string;
  /** One-line guidance shown alongside the plan. */
  guidance: string;
}

export const DIETARY_OPTIONS: readonly DietaryMeta[] = [
  {
    value: 'vegetarian',
    label: 'Vegetarian',
    short: 'Veggie',
    guidance:
      'Hit protein with eggs, dairy, soy and legumes. Stack two sources per meal to cover the full amino-acid profile.',
  },
  {
    value: 'vegan',
    label: 'Vegan',
    short: 'Vegan',
    guidance:
      'Lean on tofu, tempeh, seitan, legumes and a quality plant protein. Watch B12, iron and leucine — aim a little higher on total protein.',
  },
  {
    value: 'gluten_free',
    label: 'Gluten-free',
    short: 'GF',
    guidance:
      'Swap wheat carbs for rice, potato, oats (certified GF), maize and buckwheat. Check gels and bars — most are GF, but confirm the label.',
  },
] as const;

export function dietaryMeta(pref: DietaryPreference): DietaryMeta {
  const found = DIETARY_OPTIONS.find((o) => o.value === pref);
  // Fallback keeps the UI safe if an unknown value is ever persisted.
  return (
    found ?? {
      value: pref,
      label: pref,
      short: pref,
      guidance: '',
    }
  );
}
