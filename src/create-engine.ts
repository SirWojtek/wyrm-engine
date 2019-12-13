import { merge } from 'lodash';
import { Engine } from './Engine';
import { IEngineConfig } from './interfaces/IEngineConfig';

const DEFAULT_CONFIG: IEngineConfig = {
  statPointsPerLevel: 5,
  statsModifiers: {
    damage: 1,
    attackPower: 1.2,
    armorPenetration: 1,
    hitRating: 1,
    initiative: 1,
    dodge: 1,
    dmgReduction: 1,
  },
  maxHpModifier: 5,
  damageConfig: {
    startDamage: 10,
    damagePerLevel: 2,
  },
  armorConfig: {
    startArmor: 20,
    armorPerLevel: 10,
  },
};

export function createEngine(engineConfig?: Partial<IEngineConfig>): Engine {
  const config = merge(DEFAULT_CONFIG, engineConfig);
  return new Engine(config);
}
