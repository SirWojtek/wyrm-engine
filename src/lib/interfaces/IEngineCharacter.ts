import { ICharacter } from './ICharacter';
import { IEngineStats } from './IEngineStats';
import { TeamEnum } from './TeamEnum';

/**
 * Describes internal engine character representation
 */
export interface IEngineCharacter extends ICharacter {
  /**
   * internal battle statistics
   */
  engineStats: IEngineStats;
  /**
   * team, character belongs to
   */
  team: TeamEnum;
}
