import { groupBy, random, remove, sortBy, sumBy } from 'lodash';
import { IAction } from './interfaces/IAction';
import { ICharacter, TeamEnum } from './interfaces/ICharacter';
import { IEncounterConfig } from './interfaces/IEncounterConfig';
import { IEcounterLog, LogEntryTypeEnum } from './interfaces/IEncounterLog';
import {
  deathMessage,
  hitMessage,
  hpMessage,
  missMessage,
  winMessage,
} from './utils/log-messages';

export class Encounter {
  roundActions: { [characterId: string]: IAction | undefined } = {};
  encunterLog: IEcounterLog = [];
  encounterRound = 1;

  constructor(private encounterConfig: IEncounterConfig) {}

  tick(): IEcounterLog {
    const winLog = this.encunterLog.find(
      l => l.entryType === LogEntryTypeEnum.Win,
    );
    if (winLog) {
      return [];
    }

    const roundLog: IEcounterLog = [];
    const orderedCharacters = this.getRoundOrder();

    this.triggerAIActions();

    orderedCharacters.forEach((character, _, orderedCharactersInner) => {
      const action = this.roundActions[character.id];
      if (!action) {
        return;
      }
      const opponent = this.pickOpponent(character);

      if (!this.checkHit(character, opponent)) {
        roundLog.push(
          missMessage(character, opponent, action, this.encounterRound),
        );
        return;
      }

      const damageDone = this.getActionDamage(action, character, opponent);
      opponent.currentHp -= damageDone;
      roundLog.push(
        hitMessage(character, opponent, action, damageDone, this.encounterRound),
      );
      roundLog.push(hpMessage(opponent, this.encounterRound));

      const deadCharacters = orderedCharactersInner.filter(
        ch => ch.currentHp <= 0,
      );
      roundLog.push(
        ...deadCharacters.map(ch => deathMessage(ch, this.encounterRound)),
      );
      remove(orderedCharactersInner, orderedChar =>
        deadCharacters.find(deadChar => deadChar.id === orderedChar.id),
      );

      const aliveCharacters = orderedCharactersInner.filter(
        char => char.currentHp > 0,
      );
      const aliveByTeam = groupBy(aliveCharacters, char => char.team);
      if (aliveByTeam[TeamEnum.teamA].length === 0) {
        roundLog.push(winMessage(TeamEnum.teamB, this.encounterRound));
      } else if (aliveByTeam[TeamEnum.teamB].length === 0) {
        roundLog.push(winMessage(TeamEnum.teamA, this.encounterRound));
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

  private getRoundOrder(): ICharacter[] {
    let allCharacters = [
      ...this.encounterConfig.teamA.filter(char => char.currentHp > 0),
      ...this.encounterConfig.teamB.filter(char => char.currentHp > 0),
    ];

    const ordered: ICharacter[] = [];

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
    characters: ICharacter[],
  ): ICharacter {
    const sortedByInitiative = sortBy(
      characters,
      char => char.baseStats.initiative,
    );
    const initiativeSum = sumBy(
      sortedByInitiative,
      char => char.baseStats.initiative,
    );

    const randomNumber = random(initiativeSum);
    let cumulative = 0;

    for (const character of sortedByInitiative) {
      cumulative += character.baseStats.initiative;
      if (randomNumber < cumulative) {
        return character;
      }
    }

    throw new Error('Picking by initiative failed. This should never happen.');
  }

  private triggerAIActions() {
    [...this.encounterConfig.teamA, ...this.encounterConfig.teamB].forEach(
      aiCharacter =>
        (this.roundActions[aiCharacter.id] =
          aiCharacter.controllerCallback &&
          aiCharacter.controllerCallback(aiCharacter.actions)),
    );
  }

  private pickOpponent(character: ICharacter): ICharacter {
    const oppositeTeamEnum =
      character.team === TeamEnum.teamA ? TeamEnum.teamB : TeamEnum.teamA;
    const oppositeTeam = this.encounterConfig[oppositeTeamEnum];

    return oppositeTeam[random(oppositeTeam.length - 1)];
  }

  private checkHit(attacker: ICharacter, defender: ICharacter): boolean {
    const rollSum = attacker.baseStats.hitRating + defender.baseStats.dodge;
    const randomNumber = random(rollSum);

    return randomNumber < attacker.baseStats.hitRating;
  }

  private getActionDamage(
    action: IAction,
    character: ICharacter,
    opponent: ICharacter,
  ): number {
    const characterBaseStats = character.baseStats;
    const opponentBaseStats = opponent.baseStats;
    const baseDamage =
      action.damageModifiers.multiplyFactor *
        random(characterBaseStats.damage.min, characterBaseStats.damage.max) +
      action.damageModifiers.addFactor;
    const damageReductionFactor =
      characterBaseStats.attackPower / characterBaseStats.attackPower +
      opponentBaseStats.dmgReduction;
    return damageReductionFactor * baseDamage;
  }
}
