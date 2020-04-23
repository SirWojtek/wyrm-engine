import { IEngineCharacter } from './IEngineCharacter';

export interface ICharacterState
  extends Omit<IEngineCharacter, 'controllerCallback'> {}
