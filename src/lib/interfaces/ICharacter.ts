import { IAction } from './IAction';
import { IStats } from './IStats';

export interface ICharacter {
  id: string;
  name?: string;
  level: number;
  stats: IStats;
  currentHp: number;
  maxHp: number;
  actions: IAction[];
  controllerCallback?: (actions: IAction[]) => IAction | undefined;
}
