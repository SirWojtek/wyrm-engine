import { IEncounterLogEntry } from './IEncounterLog';
import { IEngineCharacter } from './IEngineCharacter';

export interface IEncounterConfig {
  id: string;
  teamA: IEngineCharacter[];
  teamB: IEngineCharacter[];
  logMessageCallback?: (messsage: IEncounterLogEntry) => void;
}
