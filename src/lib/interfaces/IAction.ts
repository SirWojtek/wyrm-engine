import { IModifiers } from './IModifers';

/**
 * Describes action which characters can perform
 */
export interface IAction {
  /**
   * id of action
   */
  id: string;
  /**
   * human readable name of action
   */
  name?: string;
  /**
   * damage modifiers applicable for action
   */
  damageModifiers: IModifiers;
}
