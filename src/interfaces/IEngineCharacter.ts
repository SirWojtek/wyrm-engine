import { ICharacter } from './ICharacter';
import { IEngineStats } from './IEngineStats';
import { TeamEnum } from './TeamEnum';

export interface IEngineCharacter extends ICharacter {
  engineStats: IEngineStats;
  team: TeamEnum;
}
