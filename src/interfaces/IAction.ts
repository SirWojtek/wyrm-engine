import { IModifiers } from './IModifers';

export interface IAction {
  id: string;
  name?: string;
  damageModifiers: IModifiers;
}
