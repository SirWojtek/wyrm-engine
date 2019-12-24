import { IDamage } from './IDamage';

/**
 * Describes internal engine parameters which are used directly in encounters
 * This stats are converted from [[IStats]] before encounter
 */
export interface IEngineStats {
  /**
   * base damage which character can deal
   */
  damage: IDamage;
  /**
   * bonus damage of attacks
   * converted from [[power]]
   */
  attackPower: number;
  /**
   * used against opponent [[dmgReduction]] to determine damage absorbtion
   * converted from [[power]]
   */
  armorPenetration: number;
  /**
   * used agains opponent [[dodge]] to determine hit chance
   * converted from [[dexterity]]
   */
  hitRating: number;
  /**
   * increases chance character will be before others in round order
   * converted from [[dexterity]]
   */
  initiative: number;
  /**
   * chance to avoid attacks, used against [[hitRating]]
   * converted from [[dexterity]]
   */
  dodge: number;
  /**
   * describes abillity to absorb damage, used against [[armorPenetration]]
   * converted from [[stamina]]
   */
  dmgReduction: number;
}
