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

export class Encounter {
  private roundActions: { [characterId: string]: IAction | undefined } = {};
  private encunterLog: IEcounterLog = [];
  private encounterRound = 1;

  constructor(private encounterConfig: IEncounterConfig) {}

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

  resetRoundActions() {
    this.roundActions = {};
  }

  addAction(characterId: string, action: IAction) {
    this.roundActions[characterId] = action;
  }

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
