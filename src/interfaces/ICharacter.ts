import { IAction } from './IAction';
import { IBaseStats } from './IBaseStats';
import { IStats } from './IStats';

export interface IBaseCharacter {
  id: string;
  level: number;
  stats: IStats;
  actions: IAction[];
}

export interface ICharacter extends IBaseCharacter {
  baseStats: IBaseStats;
}
