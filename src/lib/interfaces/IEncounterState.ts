import { ICharacterState } from './ICharacterState';

export interface IEncounterState {
  /**
   * id of encounter
   */
  id: string;
  /**
   * first of team forming members who take places in encounter
   */
  teamA: ICharacterState[];
  /**
   * second of team forming members who take places in encounter
   */
  teamB: ICharacterState[];
}
