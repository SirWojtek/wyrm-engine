import { IBaseStats } from './IBaseStats';

export type IStatsModifiers = { [stat in keyof IBaseStats]: number };

export interface IDamageConfig {
  startDamage: number;
  damagePerLevel: number;
}

export interface IArmorConfig {
  startArmor: number;
  armorPerLevel: number;
}

export interface IEngineConfig {
  statPointsPerLevel: number;
  maxHpModifier: number;
  statsModifiers: IStatsModifiers;
  damageConfig: IDamageConfig;
  armorConfig: IArmorConfig;
}
