import { ICharacter } from './ICharacter';
import { IEncounterLogEntry } from './IEncounterLog';

export interface IEncounterConfig {
  id: string;
  teamA: ICharacter[];
  teamB: ICharacter[];
  logMessageCallback?: (messsage: IEncounterLogEntry) => void;
}
