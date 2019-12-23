import { IDamage } from './IDamage';

export interface IEngineStats {
  damage: IDamage;
  attackPower: number;
  armorPenetration: number;
  hitRating: number;
  initiative: number;
  dodge: number;
  dmgReduction: number;
}
