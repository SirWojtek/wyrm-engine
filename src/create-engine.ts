import { merge } from 'lodash';
import { IEngineConfig } from './interfaces/IEngineConfig';
import { WyrmEngine } from './WyrmEngine';

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

export function createEngine(
  engineConfig?: Partial<IEngineConfig>,
): WyrmEngine {
  const config = merge(DEFAULT_CONFIG, engineConfig);
  return new WyrmEngine(config);
}
