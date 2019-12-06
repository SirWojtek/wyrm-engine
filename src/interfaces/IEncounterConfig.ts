import { IBaseCharacter } from './ICharacter';

export interface IEncounterConfig {
  id: string;
  teamA: IBaseCharacter[];
  teamB: IBaseCharacter[];
}
