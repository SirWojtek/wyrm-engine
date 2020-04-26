import { IEngineCharacter } from './IEngineCharacter';

export interface IEncounterState {
  /**
   * id of encounter
   */
  id: string;
  /**
   * first of team forming members who take places in encounter
   */
  teamA: Array<Omit<IEngineCharacter, 'controllerCallback'>>;

  /**
   * second of team forming members who take places in encounter
   */
  teamB: Array<Omit<IEngineCharacter, 'controllerCallback'>>;
}
