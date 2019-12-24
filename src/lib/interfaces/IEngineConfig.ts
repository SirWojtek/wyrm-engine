import { IEngineStats } from './IEngineStats';

/**
 * Map contains modifiers to translate between general and engine statistics
 */
export type IStatsModifiers = { [stat in keyof IEngineStats]: number };

/**
 * Describes damage related engine parameters
 */
export interface IDamageConfig {
  /**
   * minimum damage character can deal
   */
  startDamage: number;
  /**
   * how much damage character gain per level
   */
  damagePerLevel: number;
}

/**
 * Describes armor related engine parameters
 */
export interface IArmorConfig {
  /**
   * minimum armor character can have
   */
  startArmor: number;
  /**
   * how much armor character gain per level
   */
  armorPerLevel: number;
}

/**
 * Describes configuration used to configure engine
 */
export interface IEngineConfig {
  /**
   * how many skill points gain character per level
   */
  statPointsPerLevel: number;
  /**
   * how many hit points gain character per level
   */
  maxHpModifier: number;
  /**
   * modifiers describing mapping between general and internal statistics
   */
  statsModifiers: IStatsModifiers;
  /**
   * damage configuration parameters
   */
  damageConfig: IDamageConfig;
  /**
   * armor configuration parameters
   */
  armorConfig: IArmorConfig;
}
