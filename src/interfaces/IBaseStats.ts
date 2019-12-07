import { IDamage } from './IDamage';

export interface IBaseStats {
  damage: IDamage;
  attackPower: number;
  hitRating: number;
  initiative: number;
  dodge: number;
  dmgReduction: number;
}
