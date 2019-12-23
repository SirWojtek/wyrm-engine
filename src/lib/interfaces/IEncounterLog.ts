import { IAction } from './IAction';
import { IEngineCharacter } from './IEngineCharacter';
import { TeamEnum } from './TeamEnum';

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

export interface IEncounterSummaryLogEntry extends IGeneralEncounterLogEntry {
  orderedCharacters: IEngineCharacter[];
}

export interface IActionEncounterLogEntry extends IGeneralEncounterLogEntry {
  attacker: IEngineCharacter;
  defender: IEngineCharacter;
  action: IAction;
  missed: boolean;
  damageDone: number;
}

export interface IDeathEncounterLogEntry extends IGeneralEncounterLogEntry {
  killed: IEngineCharacter;
}

export interface IWinEncounterLogEntry extends IGeneralEncounterLogEntry {
  wictoryTeam: TeamEnum;
}

export type IEncounterLogEntry =
  | IGeneralEncounterLogEntry
  | IActionEncounterLogEntry
  | IDeathEncounterLogEntry
  | IWinEncounterLogEntry;

export type IEcounterLog = IEncounterLogEntry[];
