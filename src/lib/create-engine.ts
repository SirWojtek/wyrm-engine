import { merge } from 'lodash';
import { IEngineConfig } from './interfaces/IEngineConfig';
import { WyrmEngine } from './WyrmEngine';

/**
 * It contains default engine parameters which are tuned to ensure each
 * character type have less or more equal chance to win encounter.
 */
export const DEFAULT_CONFIG: IEngineConfig = {
  statPointsPerLevel: 3,
  statsModifiers: {
    damage: 1,
    attackPower: 1.5,
    armorPenetration: 1,
    hitRating: 1,
    initiative: 1,
    dodge: 0.7,
    dmgReduction: 1,
  },
  maxHpModifier: 5,
  damageConfig: {
    startDamage: 10,
    damagePerLevel: 1,
  },
  armorConfig: {
    startArmor: 20,
    armorPerLevel: 3,
  },
};

/**
 * Creates instance of wyrm engine object which is facade to `wyrm-engine` library.
 * @param engineConfig if provided, overrides the default settings defined in [[DEFAULT_CONFIG]]
 * @returns instance of engine facade
 */
export function createEngine(
  engineConfig?: Partial<IEngineConfig>,
): WyrmEngine {
  const config = merge(DEFAULT_CONFIG, engineConfig);
  return new WyrmEngine(config);
}
