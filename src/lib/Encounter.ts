import { groupBy, random, remove, round, sortBy, sumBy } from 'lodash';
import { IEngineCharacter } from '.';
import { IAction } from './interfaces/IAction';
import { IEncounterConfig } from './interfaces/IEncounterConfig';
import {
  IEcounterLog,
  IEncounterLogEntry,
  LogEntryTypeEnum,
} from './interfaces/IEncounterLog';
import { TeamEnum } from './interfaces/TeamEnum';
import {
  deathMessage,
  encounterSummaryMessage,
  hitMessage,
  hpMessage,
  missMessage,
  winMessage,
} from './utils/log-messages';

/**
 * ## Overview
 * Encapsulates battle logic. Each instance of class represents single, independent battle between two teams.
 *
 * ## General rules
 * Encounters are round based - calling method [[tick]] triggers simulation of single round.
 * Encounter lasts as long as there is at least one member with some hit points in both teams.
 * When battle is over, [[tick]] starts to return `undefined`.
 *
 * ## Logic
 * Encounter's [[tick]] is performing the following scenario:
 * 1. Check if one of team win, return if so
 * 2. Determine order of the round
 * 3. Trigger [[controllerCallback]] for both parties to plan actions
 * 4. For each of ordered characters perform an action and check for winner
 *
 * ## Round order
 * Order of battle participants is determined in each turn,
 * characters with more initiative are more likely to start first (see [[EngineStats]]).
 *
 * ## Controlling characters
 * There are two ways of controling how characters acts during encounter:
 * 1. By using method [[addAction]] before invoking [[tick]].
 * Actions planned by this method are "one shots" - they queue only for one round. This method is designed for non-AI players.
 * 2. By defining [[controllerCallback]] for character.
 * Callback is invoked repeatedly to determine what action should be performed. This way allows to set AI logic.
 *
 * ## Gathering output
 * Information about encounter is stored in encounter log which is array of [[IEncounterLogEntry]].
 * There are several types of messages generated during battle:
 * * round summary message ([[IEncounterSummaryLogEntry]]) - emitted at beginning of each round, contains information about round order
 * * action message ([[IActionEncounterLogEntry]]) - emitted when one of characters is perforrming action,
 * can contains info about damage if character hits opponent
 * * death message ([[IDeathEncounterLogEntry]]) - emitted when one of encounter player hit points drop below 1
 * * win message ([[IWinEncounterLogEntry]]) - emitted when all of teams' members hit points drop below 1,
 * which means that team was defeate. This is always the last message emitted during encounter.
 *
 * These are ways to get encounter log messages:
 * * by gathering output from [[tick]] method - each call returns logs for round performed (or `undefined` if one of parties win)
 * * by calling [[getEncounterLog]] - this returns all generated messages
 * * by defining [[logMessageCallback]] - callback function will be invoked with single encounter message as argument
 *
 */
export class Encounter {
  private roundActions: { [characterId: string]: IAction | undefined } = {};
  private encunterLog: IEcounterLog = [];
  private encounterRound = 1;

  /**
   * Constructs encounter using given configuration
   */
  constructor(private encounterConfig: IEncounterConfig) {}

  /**
   * Performs single encouter round. Invoke repeatedly to schedule battle.
   * @returns logs for performed round or `undefined` if battle is over
   */
  tick(): IEcounterLog | undefined {
    if (this.encunterLog.find(l => l.entryType === LogEntryTypeEnum.Win)) {
      return undefined;
    }

    const roundLog: IEcounterLog = [];
    const orderedCharacters = this.getRoundOrder();

    this.addToLog(
      roundLog,
      encounterSummaryMessage(orderedCharacters, this.encounterRound),
    );

    this.triggerAIActions();

    orderedCharacters.forEach((character, _, orderedCharactersInner) => {
      const action = this.roundActions[character.id];
      if (!action) {
        return;
      }

      if (!!roundLog.find(l => l.entryType === LogEntryTypeEnum.Win)) {
        return;
      }

      const opponent = this.pickOpponent(character);

      if (!this.checkHit(character, opponent)) {
        this.addToLog(
          roundLog,
          missMessage(character, opponent, action, this.encounterRound),
        );
        return;
      }

      const damageDone = this.getActionDamage(action, character, opponent);
      opponent.currentHp -= damageDone;
      this.addToLog(
        roundLog,
        hitMessage(character, opponent, action, damageDone, this.encounterRound),
      );
      this.addToLog(roundLog, hpMessage(opponent, this.encounterRound));

      const deadCharacters = orderedCharactersInner.filter(
        ch => ch.currentHp <= 0,
      );
      deadCharacters
        .map(ch => deathMessage(ch, this.encounterRound))
        .forEach(message => this.addToLog(roundLog, message));
      remove(orderedCharactersInner, orderedChar =>
        deadCharacters.find(deadChar => deadChar.id === orderedChar.id),
      );

      const aliveCharacters = orderedCharactersInner.filter(
        char => char.currentHp > 0,
      );
      const aliveByTeam = groupBy(aliveCharacters, char => char.team);
      if (!aliveByTeam[TeamEnum.teamA]) {
        this.addToLog(
          roundLog,
          winMessage(TeamEnum.teamB, this.encounterRound),
        );
      } else if (!aliveByTeam[TeamEnum.teamB]) {
        this.addToLog(
          roundLog,
          winMessage(TeamEnum.teamA, this.encounterRound),
        );
      }
    });

    this.encunterLog = [...this.encunterLog, ...roundLog];
    this.resetRoundActions();
    this.encounterRound += 1;

    return roundLog;
  }

  /**
   * Resets actions planned for current round.
   * This function does not affect potential actions from [[controllerCallback]].
   */
  resetRoundActions() {
    this.roundActions = {};
  }

  /**
   * Schedule action for current round.
   * @param characterId id of character for which action should be registered
   * @param action action to be perfomed
   */
  addAction(characterId: string, action: IAction) {
    this.roundActions[characterId] = action;
  }

  /**
   * Gets logs for current state of encounter
   * @returns array of messages contains information about battle
   */
  getEncounterLog(): IEcounterLog {
    return this.encunterLog;
  }

  private getRoundOrder(): IEngineCharacter[] {
    let allCharacters = [
      ...this.encounterConfig.teamA.filter(char => char.currentHp > 0),
      ...this.encounterConfig.teamB.filter(char => char.currentHp > 0),
    ];

    const ordered: IEngineCharacter[] = [];

    while (!!allCharacters.length) {
      const pickedCharacter = this.pickCharacterBasingOnInitiative(
        allCharacters,
      );
      allCharacters = allCharacters.filter(
        char => char.id !== pickedCharacter.id,
      );
      ordered.push(pickedCharacter);
    }

    return ordered;
  }

  private pickCharacterBasingOnInitiative(
    characters: IEngineCharacter[],
  ): IEngineCharacter {
    const sortedByInitiative = sortBy(
      characters,
      char => char.engineStats.initiative,
    );
    const initiativeSum = sumBy(
      sortedByInitiative,
      char => char.engineStats.initiative,
    );

    const randomNumber = random(initiativeSum - 1);
    let cumulative = 0;

    for (const character of sortedByInitiative) {
      cumulative += character.engineStats.initiative;
      if (randomNumber < cumulative) {
        return character;
      }
    }

    throw new Error('Picking by initiative failed. This should never happen.');
  }

  private triggerAIActions() {
    [...this.encounterConfig.teamA, ...this.encounterConfig.teamB]
      .filter(character => !!character.controllerCallback)
      .forEach(
        aiCharacter =>
          (this.roundActions[aiCharacter.id] =
            aiCharacter.controllerCallback &&
            aiCharacter.controllerCallback(aiCharacter.actions)),
      );
  }

  private pickOpponent(character: IEngineCharacter): IEngineCharacter {
    const oppositeTeamEnum =
      character.team === TeamEnum.teamA ? TeamEnum.teamB : TeamEnum.teamA;
    const oppositeTeam = this.encounterConfig[oppositeTeamEnum];

    return oppositeTeam[random(oppositeTeam.length - 1)];
  }

  private checkHit(
    attacker: IEngineCharacter,
    defender: IEngineCharacter,
  ): boolean {
    const rollSum = attacker.engineStats.hitRating + defender.engineStats.dodge;
    const randomNumber = random(rollSum);

    return randomNumber < attacker.engineStats.hitRating;
  }

  private getActionDamage(
    action: IAction,
    character: IEngineCharacter,
    opponent: IEngineCharacter,
  ): number {
    const characterBaseStats = character.engineStats;
    const opponentBaseStats = opponent.engineStats;
    const baseDamage =
      action.damageModifiers.multiplyFactor *
        random(characterBaseStats.damage.min, characterBaseStats.damage.max) +
      action.damageModifiers.addFactor;
    const damageReductionFactor =
      characterBaseStats.armorPenetration /
      (characterBaseStats.armorPenetration + opponentBaseStats.dmgReduction);

    return round(
      damageReductionFactor * baseDamage + characterBaseStats.attackPower,
    );
  }

  private addToLog(log: IEcounterLog, entry: IEncounterLogEntry) {
    log.push(entry);
    if (this.encounterConfig.logMessageCallback) {
      this.encounterConfig.logMessageCallback(entry);
    }
  }
}
