import { ICharacter } from './ICharacter';

export interface IEncounterConfig {
  id: string;
  teamA: ICharacter[];
  teamB: ICharacter[];
}
