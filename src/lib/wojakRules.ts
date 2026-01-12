/**
 * Wojak Generator Rules Engine
 *
 * Enforces valid layer combinations and auto-corrects invalid states.
 * Ported from wojak-ink-mobile/src/utils/wojakRules.js
 */

import type { GeneratorLayerName } from './memeLayers';

export type SelectedLayers = Partial<Record<GeneratorLayerName, string>>;

// UI-visible layer names only
export type UILayerName =
  | 'Background'
  | 'Base'
  | 'Clothes'
  | 'FacialHair'
  | 'MouthBase'
  | 'MouthItem'
  | 'Mask'
  | 'Eyes'
  | 'Head';

export interface RuleResult {
  disabledLayers: UILayerName[];
  reason?: string;
  clearSelections?: UILayerName[];
  forceSelections?: Partial<Record<UILayerName, string>>;
  disabledOptions?: Partial<Record<UILayerName, string[]>>;
  /** Reasons for specific disabled options: { LayerName: { OptionName: "reason" } } */
  disabledOptionReasons?: Partial<Record<UILayerName, Record<string, string>>>;
}

export interface DisabledLayersResult {
  disabledLayers: UILayerName[];
  reasons: Record<string, string>;
  clearSelections: UILayerName[];
  forceSelections: Partial<Record<UILayerName, string>>;
  disabledOptions: Partial<Record<UILayerName, string[]>>;
  /** Reasons for specific disabled options: { LayerName: { OptionName: "reason" } } */
  disabledOptionReasons: Partial<Record<UILayerName, Record<string, string>>>;
}

/**
 * Check if a path contains a specific identifier (case-insensitive)
 */
function pathContains(path: string | undefined, identifier: string): boolean {
  if (!path) return false;
  return path.toLowerCase().includes(identifier.toLowerCase());
}

// ============ Rules ============

/**
 * Base must never be None - auto-default to Classic
 */
function ruleBaseNeverNone(selectedLayers: SelectedLayers): RuleResult {
  const basePath = selectedLayers['Base'];
  const isBaseEmpty = !basePath || basePath === '' || basePath === 'None';

  const hasAnyOtherTrait = Object.keys(selectedLayers).some((layerName) => {
    if (layerName === 'Base') return false;
    const layerValue = selectedLayers[layerName as GeneratorLayerName];
    return layerValue && layerValue !== '' && layerValue !== 'None';
  });

  if (isBaseEmpty && hasAnyOtherTrait) {
    return {
      disabledLayers: [],
      forceSelections: {
        Base: '/assets/wojak-layers/BASE/BASE_Base-Wojak_classic.png',
      },
    };
  }

  return { disabledLayers: [] };
}

/**
 * MouthBase must never be None - auto-default to Numb
 */
function ruleMouthBaseNeverNone(selectedLayers: SelectedLayers): RuleResult {
  const mouthBasePath = selectedLayers['MouthBase'];
  const isMouthBaseEmpty = !mouthBasePath || mouthBasePath === '' || mouthBasePath === 'None';

  if (isMouthBaseEmpty) {
    return {
      disabledLayers: [],
      forceSelections: {
        MouthBase: '/assets/wojak-layers/MOUTH/MOUTH_numb.png',
      },
    };
  }

  return { disabledLayers: [] };
}

/**
 * Clothes must never be None - auto-default to Tee blue
 */
function ruleClothesNeverNone(selectedLayers: SelectedLayers): RuleResult {
  const clothesPath = selectedLayers['Clothes'];
  const isClothesEmpty = !clothesPath || clothesPath === '' || clothesPath === 'None';

  if (isClothesEmpty) {
    return {
      disabledLayers: [],
      forceSelections: {
        Clothes: '/assets/wojak-layers/CLOTHES/CLOTHES_Tee_blue.png',
      },
    };
  }

  return { disabledLayers: [] };
}

/**
 * Astronaut disables Head layer and clears any existing head selection
 */
function ruleAstronautNoHead(selectedLayers: SelectedLayers): RuleResult {
  const clothesPath = selectedLayers['Clothes'];
  const headPath = selectedLayers['Head'];

  if (pathContains(clothesPath, 'Astronaut')) {
    const hasHead = headPath && headPath !== '' && headPath !== 'None';
    return {
      disabledLayers: ['Head'],
      reason: 'Deselect Astronaut',
      clearSelections: hasHead ? ['Head'] : [],
      forceSelections: hasHead ? { Head: '' } : {},
    };
  }

  return { disabledLayers: [] };
}

/**
 * Astronaut disables MouthItem traits (Cig, Joint, Cohiba) and some MouthBase options
 * Allowed MouthBase: Gold teeth, teeth, Numb, screaming, smiling
 * Disabled MouthBase: Pipe, Pizza, Bubble-Gum
 */
function ruleAstronautDisablesMouthOptions(selectedLayers: SelectedLayers): RuleResult {
  const clothesPath = selectedLayers['Clothes'];

  if (pathContains(clothesPath, 'Astronaut')) {
    const mouthBasePath = selectedLayers['MouthBase'];
    const disabledMouthOptions = ['Pipe', 'Pizza', 'Bubble-Gum', 'Bubble Gum'];

    // Check if current MouthBase is one of the disabled options
    const hasDisabledMouth = disabledMouthOptions.some(opt =>
      pathContains(mouthBasePath, opt.replace(' ', '-'))
    );

    const result: RuleResult = {
      disabledLayers: ['MouthItem'],
      reason: 'Deselect Astronaut',
      forceSelections: { MouthItem: '' },
      clearSelections: ['MouthItem'],
      disabledOptions: {
        MouthBase: disabledMouthOptions,
      },
    };

    // If current mouth is disabled, force to Numb
    if (hasDisabledMouth) {
      result.forceSelections = {
        ...result.forceSelections,
        MouthBase: '/assets/wojak-layers/MOUTH/MOUTH_numb.png',
      };
    }

    return result;
  }

  return { disabledLayers: [] };
}

/**
 * Astronaut and Copium Mask are mutually exclusive
 * Other masks can be used with Astronaut (with different rendering orders)
 */
function ruleAstronautCopiumMaskMutualExclusion(selectedLayers: SelectedLayers): RuleResult {
  const clothesPath = selectedLayers['Clothes'];
  const maskPath = selectedLayers['Mask'];

  const hasAstronaut = pathContains(clothesPath, 'Astronaut');
  const hasCopiumMask = pathContains(maskPath, 'Copium');

  // If Astronaut is selected, only disable Copium Mask
  if (hasAstronaut) {
    // If user currently has Copium Mask selected, clear it
    if (hasCopiumMask) {
      return {
        disabledLayers: [],
        reason: 'Deselect Astronaut first',
        forceSelections: { Mask: '' },
        clearSelections: ['Mask'],
        disabledOptions: { Mask: ['Copium', 'Copium-Mask', 'Copium Mask'] },
        disabledOptionReasons: {
          Mask: {
            Copium: 'Remove Astronaut',
            'Copium-Mask': 'Remove Astronaut',
            'Copium Mask': 'Remove Astronaut',
          },
        },
      };
    }
    // Just disable Copium Mask option
    return {
      disabledLayers: [],
      disabledOptions: { Mask: ['Copium', 'Copium-Mask', 'Copium Mask'] },
      disabledOptionReasons: {
        Mask: {
          Copium: 'Remove Astronaut',
          'Copium-Mask': 'Remove Astronaut',
          'Copium Mask': 'Remove Astronaut',
        },
      },
    };
  }

  // If Copium Mask is selected, disable Astronaut
  if (hasCopiumMask) {
    return {
      disabledLayers: [],
      disabledOptions: { Clothes: ['Astronaut'] },
      disabledOptionReasons: {
        Clothes: { Astronaut: 'Remove Copium Mask' },
      },
      reason: 'Deselect Copium Mask first',
    };
  }

  return { disabledLayers: [] };
}

/**
 * FacialHair requires compatible MouthBase
 */
function ruleFacialHairRequiresMouthBase(selectedLayers: SelectedLayers): RuleResult {
  const mouthBasePath = selectedLayers['MouthBase'];
  const facialHairPath = selectedLayers['FacialHair'];

  const allowedMouthBases = ['numb', 'teeth', 'gold', 'smile', 'screeming', 'screaming', 'pizza', 'pipe'];

  if (mouthBasePath && mouthBasePath !== '') {
    const isAllowed = allowedMouthBases.some((allowed) => pathContains(mouthBasePath, allowed));
    if (!isAllowed && facialHairPath) {
      return {
        disabledLayers: ['FacialHair'],
        reason: 'Select compatible mouth',
        clearSelections: ['FacialHair'],
      };
    }
  }

  if (facialHairPath) {
    const hasAllowedMouthBase =
      mouthBasePath &&
      mouthBasePath !== '' &&
      allowedMouthBases.some((allowed) => pathContains(mouthBasePath, allowed));

    if (!hasAllowedMouthBase) {
      return {
        disabledLayers: [],
        reason: 'Select mouth first',
        forceSelections: {
          MouthBase: '/assets/wojak-layers/MOUTH/MOUTH_numb.png',
        },
      };
    }
  }

  return { disabledLayers: [] };
}

/**
 * Mask blocks MouthItem and FacialHair
 */
function ruleMaskBlocksOtherLayers(selectedLayers: SelectedLayers): RuleResult {
  const maskPath = selectedLayers['Mask'];

  if (maskPath && maskPath !== '' && maskPath !== 'None') {
    return {
      disabledLayers: ['MouthItem', 'FacialHair'],
      reason: 'Deselect Mask',
    };
  }

  return { disabledLayers: [] };
}

/**
 * Hannibal Mask auto-removes Neckbeard
 */
function ruleHannibalMaskRemovesNeckbeard(selectedLayers: SelectedLayers): RuleResult {
  const maskPath = selectedLayers['Mask'];
  const facialHairPath = selectedLayers['FacialHair'];

  const hasHannibal = pathContains(maskPath, 'hannibal');
  const hasNeckbeard = pathContains(facialHairPath, 'neckbeard');

  if (hasHannibal && hasNeckbeard) {
    return {
      disabledLayers: ['FacialHair'],
      reason: 'Deselect Hannibal Mask',
      clearSelections: ['FacialHair'],
      forceSelections: { FacialHair: '' },
    };
  }

  if (hasHannibal) {
    return {
      disabledLayers: ['FacialHair'],
      reason: 'Deselect Hannibal Mask',
      disabledOptions: {
        FacialHair: ['Neckbeard', 'neckbeard'],
      },
    };
  }

  return { disabledLayers: [] };
}

/**
 * Copium Mask forces valid MouthBase and disables MouthItem
 * - Blocks: Pizza, Bubble Gum, Pipe (MouthBase)
 * - Blocks: All MouthItem (Cigarette, Cohiba, Joint)
 */
function ruleCopiumMaskForcesValidMouthBase(selectedLayers: SelectedLayers): RuleResult {
  const mask = selectedLayers?.Mask;
  const mouthBase = selectedLayers?.MouthBase;
  const mouthItem = selectedLayers?.MouthItem;

  const isCopium = typeof mask === 'string' && pathContains(mask, 'Copium-Mask');

  if (!isCopium) return { disabledLayers: [] };

  const isPizza = typeof mouthBase === 'string' && pathContains(mouthBase, 'Pizza');
  const isBubbleGum = typeof mouthBase === 'string' && pathContains(mouthBase, 'Bubble-Gum');
  const isPipe = typeof mouthBase === 'string' && pathContains(mouthBase, 'Pipe');
  const isEmpty = !mouthBase || mouthBase === '' || mouthBase === 'None';
  const hasMouthItem = mouthItem && mouthItem !== '' && mouthItem !== 'None';

  // Blocked MouthBase options for Copium Mask
  const blockedMouthBase = ['Pizza', 'Bubble-Gum', 'Bubble Gum', 'Pipe'];

  // If current MouthBase is invalid, force to Numb
  if (isPizza || isBubbleGum || isPipe || isEmpty) {
    return {
      disabledLayers: ['MouthItem'],
      reason: 'Remove Copium Mask',
      forceSelections: {
        MouthBase: '/assets/wojak-layers/MOUTH/MOUTH_numb.png',
        MouthItem: '',
      },
      clearSelections: ['MouthItem'],
      disabledOptions: {
        MouthBase: blockedMouthBase,
      },
      disabledOptionReasons: {
        MouthBase: {
          Pizza: 'Remove Copium Mask',
          'Bubble-Gum': 'Remove Copium Mask',
          'Bubble Gum': 'Remove Copium Mask',
          Pipe: 'Remove Copium Mask',
        },
      },
    };
  }

  // Clear MouthItem if selected
  if (hasMouthItem) {
    return {
      disabledLayers: ['MouthItem'],
      reason: 'Remove Copium Mask',
      forceSelections: { MouthItem: '' },
      clearSelections: ['MouthItem'],
      disabledOptions: {
        MouthBase: blockedMouthBase,
      },
      disabledOptionReasons: {
        MouthBase: {
          Pizza: 'Remove Copium Mask',
          'Bubble-Gum': 'Remove Copium Mask',
          'Bubble Gum': 'Remove Copium Mask',
          Pipe: 'Remove Copium Mask',
        },
      },
    };
  }

  // Just disable the options
  return {
    disabledLayers: ['MouthItem'],
    disabledOptions: {
      MouthBase: blockedMouthBase,
    },
    disabledOptionReasons: {
      MouthBase: {
        Pizza: 'Remove Copium Mask',
        'Bubble-Gum': 'Remove Copium Mask',
        'Bubble Gum': 'Remove Copium Mask',
        Pipe: 'Remove Copium Mask',
      },
    },
  };
}

/**
 * Mask forces MouthBase to Numb (except Copium)
 */
function ruleMaskForcesNumbMouth(selectedLayers: SelectedLayers): RuleResult {
  const mask = selectedLayers?.Mask;

  const hasMask = mask && mask !== '' && mask !== 'None';
  const isCopium = typeof mask === 'string' && pathContains(mask, 'Copium-Mask');

  if (isCopium || !hasMask) return { disabledLayers: [] };

  return {
    disabledLayers: [],
    reason: 'Deselect Mask',
    forceSelections: {
      MouthBase: '/assets/wojak-layers/MOUTH/MOUTH_numb.png',
      MouthItem: '',
    },
  };
}

/**
 * Pipe disables MouthItem
 */
function rulePipeDisablesMouthItem(selectedLayers: SelectedLayers): RuleResult {
  const mouthBase = selectedLayers?.MouthBase;
  const isPipe = typeof mouthBase === 'string' && pathContains(mouthBase, 'Pipe');

  if (!isPipe) return { disabledLayers: [] };

  return {
    disabledLayers: ['MouthItem'],
    reason: 'Deselect Pipe',
    clearSelections: ['MouthItem'],
  };
}

/**
 * Cig/Joint/Cohiba requires MouthBase
 */
function ruleCigJointCohibaRequiresMouthBase(selectedLayers: SelectedLayers): RuleResult {
  const mouthItem = selectedLayers?.MouthItem;
  const mouthBase = selectedLayers?.MouthBase;

  const isCig = typeof mouthItem === 'string' && pathContains(mouthItem, 'Cig');
  const isJoint = typeof mouthItem === 'string' && pathContains(mouthItem, 'Joint');
  const isCohiba = typeof mouthItem === 'string' && pathContains(mouthItem, 'Cohiba');

  if (!isCig && !isJoint && !isCohiba) return { disabledLayers: [] };

  const isMouthBaseNone = !mouthBase || mouthBase === '' || mouthBase === 'None';

  if (isMouthBaseNone) {
    return {
      disabledLayers: [],
      reason: 'Select mouth first',
      forceSelections: {
        MouthBase: '/assets/wojak-layers/MOUTH/MOUTH_numb.png',
      },
    };
  }

  return { disabledLayers: [] };
}

/**
 * Pizza disables MouthItem
 */
function rulePizzaDisablesMouthItem(selectedLayers: SelectedLayers): RuleResult {
  const mouthBase = selectedLayers?.MouthBase;
  const isPizza = typeof mouthBase === 'string' && mouthBase.toLowerCase().includes('pizza');

  if (!isPizza) return { disabledLayers: [] };

  return {
    disabledLayers: ['MouthItem'],
    reason: 'Deselect Pizza',
    clearSelections: ['MouthItem'],
  };
}

/**
 * Bubble Gum disables MouthItem
 */
function ruleBubbleGumDisablesMouthItem(selectedLayers: SelectedLayers): RuleResult {
  const mouthBase = selectedLayers?.MouthBase;
  const isBubbleGum = typeof mouthBase === 'string' && pathContains(mouthBase, 'Bubble-Gum');

  if (!isBubbleGum) return { disabledLayers: [] };

  return {
    disabledLayers: ['MouthItem'],
    reason: 'Deselect Bubble Gum',
    clearSelections: ['MouthItem'],
  };
}

/**
 * Full-face masks (Skull masks, Fake It) disable Laser Eyes
 */
function ruleFullFaceMaskDisablesLaserEyes(selectedLayers: SelectedLayers): RuleResult {
  const maskPath = selectedLayers['Mask'];
  const eyesPath = selectedLayers['Eyes'];

  // Check for full-face masks
  const isFullFaceMask =
    pathContains(maskPath, 'skull_mask') ||
    pathContains(maskPath, 'skull-mask') ||
    pathContains(maskPath, 'fake_it') ||
    pathContains(maskPath, 'fake-it');

  if (!isFullFaceMask) return { disabledLayers: [] };

  // Check if laser eyes are currently selected
  const hasLaserEyes = pathContains(eyesPath, 'laser');

  // If laser eyes are selected, clear them
  if (hasLaserEyes) {
    return {
      disabledLayers: [],
      reason: 'Deselect full-face mask',
      clearSelections: ['Eyes'],
      forceSelections: { Eyes: '' },
      disabledOptions: {
        Eyes: ['Laser', 'Laser-Eyes', 'Laser Eyes'],
      },
      disabledOptionReasons: {
        Eyes: {
          Laser: 'Remove Mask',
          'Laser-Eyes': 'Remove Mask',
          'Laser Eyes': 'Remove Mask',
        },
      },
    };
  }

  // Just disable the laser eyes options
  return {
    disabledLayers: [],
    disabledOptions: {
      Eyes: ['Laser', 'Laser-Eyes', 'Laser Eyes'],
    },
    disabledOptionReasons: {
      Eyes: {
        Laser: 'Remove Mask',
        'Laser-Eyes': 'Remove Mask',
        'Laser Eyes': 'Remove Mask',
      },
    },
  };
}

/**
 * ClothesAddon requires Tee or Tanktop
 */
function ruleClothesAddonRequiresTeeOrTanktop(selectedLayers: SelectedLayers): RuleResult {
  const clothesPath = selectedLayers['Clothes'];
  const clothesAddonPath = selectedLayers['ClothesAddon'];

  const hasChiaFarmerAddon =
    clothesAddonPath && (pathContains(clothesAddonPath, 'Chia-Farmer') || pathContains(clothesAddonPath, 'Chia Farmer'));

  const isTeeOrTanktop =
    clothesPath &&
    (pathContains(clothesPath, 'Tee') || pathContains(clothesPath, 'Tank-Top') || pathContains(clothesPath, 'tank-top')) &&
    !pathContains(clothesPath, 'Chia-Farmer');

  const isSelectingChiaFarmer =
    clothesPath && (pathContains(clothesPath, 'Chia-Farmer') || pathContains(clothesPath, 'Chia Farmer'));

  if (!isTeeOrTanktop && !hasChiaFarmerAddon) {
    return {
      disabledLayers: [],
      disabledOptions: { Clothes: ['Chia Farmer', 'Chia-Farmer'] },
      disabledOptionReasons: {
        Clothes: {
          'Chia Farmer': 'Select Tee or Tank Top',
          'Chia-Farmer': 'Select Tee or Tank Top',
        },
      },
    };
  }

  if ((hasChiaFarmerAddon || isSelectingChiaFarmer) && !isTeeOrTanktop) {
    return {
      disabledLayers: [],
      forceSelections: {
        Clothes: '/assets/wojak-layers/CLOTHES/CLOTHES_Tee_blue.png',
      },
    };
  }

  return { disabledLayers: [] };
}

// ============ Rules Array ============

const RULES = [
  ruleBaseNeverNone,
  ruleMouthBaseNeverNone,
  ruleClothesNeverNone,
  ruleCopiumMaskForcesValidMouthBase,
  ruleMaskForcesNumbMouth,
  rulePipeDisablesMouthItem,
  ruleCigJointCohibaRequiresMouthBase,
  rulePizzaDisablesMouthItem,
  ruleBubbleGumDisablesMouthItem,
  ruleAstronautDisablesMouthOptions,
  ruleAstronautCopiumMaskMutualExclusion,
  ruleAstronautNoHead,
  ruleFacialHairRequiresMouthBase,
  ruleMaskBlocksOtherLayers,
  ruleHannibalMaskRemovesNeckbeard,
  ruleFullFaceMaskDisablesLaserEyes,
  ruleClothesAddonRequiresTeeOrTanktop,
];

// ============ Public API ============

/**
 * Get all disabled layers based on current selections
 */
export function getDisabledLayers(selectedLayers: SelectedLayers): DisabledLayersResult {
  const disabledSet = new Set<UILayerName>();
  const reasons: Record<string, string> = {};
  const clearSet = new Set<UILayerName>();
  const forceSelections: Partial<Record<UILayerName, string>> = {};
  const disabledOptions: Partial<Record<UILayerName, string[]>> = {};
  const disabledOptionReasons: Partial<Record<UILayerName, Record<string, string>>> = {};

  for (const rule of RULES) {
    const result = rule(selectedLayers);

    if (result.disabledLayers && result.disabledLayers.length > 0) {
      result.disabledLayers.forEach((layerName) => {
        disabledSet.add(layerName);
        if (result.reason) {
          reasons[layerName] = result.reason;
        }
      });
    }

    if (result.clearSelections && result.clearSelections.length > 0) {
      result.clearSelections.forEach((layerName) => clearSet.add(layerName));
    }

    if (result.forceSelections) {
      Object.assign(forceSelections, result.forceSelections);
    }

    if (result.disabledOptions) {
      Object.keys(result.disabledOptions).forEach((layerName) => {
        const key = layerName as UILayerName;
        if (!disabledOptions[key]) {
          disabledOptions[key] = [];
        }
        const newOptions = result.disabledOptions![key];
        if (Array.isArray(newOptions)) {
          newOptions.forEach((option) => {
            if (!disabledOptions[key]!.includes(option)) {
              disabledOptions[key]!.push(option);
            }
          });
        }
      });
    }

    // Merge disabled option reasons
    if (result.disabledOptionReasons) {
      Object.keys(result.disabledOptionReasons).forEach((layerName) => {
        const key = layerName as UILayerName;
        if (!disabledOptionReasons[key]) {
          disabledOptionReasons[key] = {};
        }
        const optionReasons = result.disabledOptionReasons![key];
        if (optionReasons) {
          Object.assign(disabledOptionReasons[key]!, optionReasons);
        }
      });
    }
  }

  return {
    disabledLayers: Array.from(disabledSet),
    reasons,
    clearSelections: Array.from(clearSet),
    forceSelections,
    disabledOptions,
    disabledOptionReasons,
  };
}

/**
 * Check if a specific layer is disabled
 */
export function isLayerDisabled(layerName: UILayerName, selectedLayers: SelectedLayers): boolean {
  const { disabledLayers } = getDisabledLayers(selectedLayers);
  return disabledLayers.includes(layerName);
}

/**
 * Get the reason why a layer is disabled
 */
export function getDisabledReason(layerName: UILayerName, selectedLayers: SelectedLayers): string | null {
  const { reasons } = getDisabledLayers(selectedLayers);
  return reasons[layerName] || null;
}
