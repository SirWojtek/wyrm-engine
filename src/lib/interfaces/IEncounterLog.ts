import { IAction } from './IAction';
import { IEngineCharacter } from './IEngineCharacter';
import { TeamEnum } from './TeamEnum';

/**
 * Types of encounter messages
 */
export enum LogEntryTypeEnum {
  /**
   * General encounter information, used by [[IGeneralEncounterLogEntry]], [[IEncounterSummaryLogEntry]]
   */
  General,
  /**
   * Message contains information about character action, used by [[IActionEncounterLogEntry]]
   */
  Action,
  /**
   * Informs about death of one of chracters, used by [[IDeathEncounterLogEntry]]
   */
  Death,
  /**
   * Contains information about winner, used by [[IWinEncounterLogEntry]]
   */
  Win,
}

/**
 * Contains base properties of encounter log messages
 */
export interface IGeneralEncounterLogEntry {
  /**
   * type of message
   */
  entryType: LogEntryTypeEnum;
  /**
   * round of encounter
   */
  encounterRound: number;
  /**
   * human readable message
   */
  message: string;
}

/**
 * Contains general message describing each encounter round
 */
export interface IEncounterSummaryLogEntry extends IGeneralEncounterLogEntry {
  /**
   * Order of characters in current round
   */
  orderedCharacters: IEngineCharacter[];
}

/**
 * Contains information about action performed by one of characters in encounter
 */
export interface IActionEncounterLogEntry extends IGeneralEncounterLogEntry {
  /**
   * attacking character
   */
  attacker: IEngineCharacter;
  /**
   * defending character
   */
  defender: IEngineCharacter;
  /**
   * attacker's action
   */
  action: IAction;
  /**
   * do action hit opponent?
   */
  missed: boolean;
  /**
   * damage done by attacker's action
   */
  damageDone: number;
}

/**
 * Contains message about character who died during battle
 */
export interface IDeathEncounterLogEntry extends IGeneralEncounterLogEntry {
  /**
   * character who has been killed
   */
  killed: IEngineCharacter;
}

/**
 * Contains information about the winner.
 * This message is always last message emitted in encounter
 */
export interface IWinEncounterLogEntry extends IGeneralEncounterLogEntry {
  /**
   * team who win encounter
   */
  wictoryTeam: TeamEnum;
}

/**
 * Type beholds all available log messages
 */
export type IEncounterLogEntry =
  | IGeneralEncounterLogEntry
  | IActionEncounterLogEntry
  | IDeathEncounterLogEntry
  | IWinEncounterLogEntry;

/**
 * Array of encounter messages
 */
export type IEcounterLog = IEncounterLogEntry[];
