import { IAction } from './IAction';
import { IStats } from './IStats';

/**
 * Describes character entity.
 */
export interface ICharacter {
  /**
   * id of character
   */
  id: string;
  /**
   * name of character
   */
  name?: string;
  /**
   * level of character
   */
  level: number;
  /**
   * battle statistics of character
   */
  stats: IStats;
  /**
   * actual count of hit points
   */
  currentHp: number;
  /**
   * maximum allowed hit points
   */
  maxHp: number;
  /**
   * actions which character can perform during encounter
   */
  actions: IAction[];
  /**
   * callback for AI controlled characters
   * if provided, will be invoked during battle to determine character action
   */
  controllerCallback?: (actions: IAction[]) => IAction | undefined;
}
