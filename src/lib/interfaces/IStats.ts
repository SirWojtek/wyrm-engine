import { IDamage } from './IDamage';

/**
 * Describes general character statistics
 */
export interface IStats {
  /**
   * damage character can deal
   */
  damage: IDamage;
  /**
   * used to calculate damage reduction
   */
  armor: number;
  /**
   * strong characters deals more damage
   */
  power: number;
  /**
   * swift characters hits and dodge more often
   */
  dexterity: number;
  /**
   * tought characters have more hit points
   */
  stamina: number;
}
