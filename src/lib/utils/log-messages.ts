import { IAction } from '../interfaces/IAction';
import {
  IActionEncounterLogEntry,
  IDeathEncounterLogEntry,
  IEncounterSummaryLogEntry,
  IGeneralEncounterLogEntry,
  IWinEncounterLogEntry,
  LogEntryTypeEnum,
} from '../interfaces/IEncounterLog';
import { IEngineCharacter } from '../interfaces/IEngineCharacter';
import { TeamEnum } from '../interfaces/TeamEnum';

export function encounterSummaryMessage(
  orderedCharacters: IEngineCharacter[],
  encounterRound: number,
): IEncounterSummaryLogEntry {
  const message = `=== Encounter summary ===
Round: ${encounterRound}
Round order: ${orderedCharacters.reduce(
    (res, char) =>
      (res += `\n\t${char.name || char.id}\t${char.team}\tHP: ${
        char.currentHp
      }/${char.maxHp}`),
    '',
  )}`;

  return {
    entryType: LogEntryTypeEnum.General,
    message,
    encounterRound,
    orderedCharacters,
  };
}

export function hpMessage(
  character: IEngineCharacter,
  encounterRound: number,
): IGeneralEncounterLogEntry {
  const message = `${character.name || character.id} current hp: ${
    character.currentHp
  }`;

  return {
    entryType: LogEntryTypeEnum.General,
    message,
    encounterRound,
  };
}

export function missMessage(
  attacker: IEngineCharacter,
  defender: IEngineCharacter,
  action: IAction,
  encounterRound: number,
): IActionEncounterLogEntry {
  const message = `${attacker.name || attacker.id}'s ${action.name ||
    action.id} misses ${defender.name || defender.id}`;

  return {
    entryType: LogEntryTypeEnum.Action,
    encounterRound,
    message,
    attacker,
    defender,
    action,
    missed: true,
    damageDone: 0,
  };
}

export function hitMessage(
  attacker: IEngineCharacter,
  defender: IEngineCharacter,
  action: IAction,
  damageDone: number,
  encounterRound: number,
): IActionEncounterLogEntry {
  const message = `${attacker.name || attacker.id}'s ${action.name ||
    action.id} hits ${defender.name || defender.id} for ${damageDone}`;

  return {
    entryType: LogEntryTypeEnum.Action,
    encounterRound,
    message,
    attacker,
    defender,
    action,
    missed: false,
    damageDone,
  };
}

export function deathMessage(
  killed: IEngineCharacter,
  encounterRound: number,
): IDeathEncounterLogEntry {
  const message = `${killed.name || killed.id} is dead!`;

  return {
    entryType: LogEntryTypeEnum.Death,
    killed,
    encounterRound,
    message,
  };
}

export function winMessage(
  wictoryTeam: TeamEnum,
  encounterRound: number,
): IWinEncounterLogEntry {
  const message = `${wictoryTeam} won the encounter!`;

  return {
    entryType: LogEntryTypeEnum.Win,
    message,
    wictoryTeam,
    encounterRound,
  };
}
