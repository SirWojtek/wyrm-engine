import { IEncounterLogEntry } from './IEncounterLog';
import { IEngineCharacter } from './IEngineCharacter';

/**
 * Describes encounter
 */
export interface IEncounterConfig {
  /**
   * id of encounter
   */
  id: string;
  /**
   * first of team forming members who take places in encounter
   */
  teamA: IEngineCharacter[];
  /**
   * second of team forming members who take places in encounter
   */
  teamB: IEngineCharacter[];
  /**
   * function invoked when encounter actions take place
   */
  logMessageCallback?: (messsage: IEncounterLogEntry) => void;
}
