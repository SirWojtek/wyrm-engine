import { IDamage } from './IDamage';

export interface IBaseStats {
  damage: IDamage;
  attackPower: number;
  armorPenetration: number;
  hitRating: number;
  initiative: number;
  dodge: number;
  dmgReduction: number;
}
