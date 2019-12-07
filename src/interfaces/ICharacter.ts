import { IAction } from './IAction';
import { IBaseStats } from './IBaseStats';
import { IStats } from './IStats';

export interface IBaseCharacter {
  id: string;
  name?: string;
  level: number;
  stats: IStats;
  currentHp: number;
  actions: IAction[];
  controllerCallback?: (actions: IAction[]) => IAction | undefined;
}

export enum TeamEnum {
  teamA = 'teamA',
  teamB = 'teamB',
}

export interface ICharacter extends IBaseCharacter {
  baseStats: IBaseStats;
  team: TeamEnum;
}
