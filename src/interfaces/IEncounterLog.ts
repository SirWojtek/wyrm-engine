import { IAction } from './IAction';
import { ICharacter, TeamEnum } from './ICharacter';

export enum LogEntryTypeEnum {
  General,
  Action,
  Death,
  Win,
}

export interface IGeneralEncounterLogEntry {
  entryType: LogEntryTypeEnum;
  encounterRound: number;
  message: string;
}

export interface IActionEncounterLogEntry extends IGeneralEncounterLogEntry {
  action: IAction;
  missed: boolean;
  damageDone: number;
}

export interface IDeathEncounterLogEntry extends IGeneralEncounterLogEntry {
  killed: ICharacter;
}

export interface IWinEncounterLogEntry extends IGeneralEncounterLogEntry {
  wictoryTeam: TeamEnum;
}

export type IEcounterLog = Array<
  | IGeneralEncounterLogEntry
  | IActionEncounterLogEntry
  | IDeathEncounterLogEntry
  | IWinEncounterLogEntry
>;
