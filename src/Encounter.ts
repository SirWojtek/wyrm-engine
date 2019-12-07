import { random, sortBy, sumBy } from 'lodash';
import { ICharacter, TeamEnum } from './interfaces/ICharacter';
import { IEncounterConfig } from './interfaces/IEncounterConfig';
import { IAction } from './interfaces/index';

export class Encounter {
  roundActions: { [characterId: string]: IAction | undefined } = {};

  constructor(private encounterConfig: IEncounterConfig) {}

  tick() {
    const orderedCharacters = this.getRoundOrder();

    this.triggerAIActions();

    orderedCharacters.forEach(character => {
      const action = this.roundActions[character.id];
      if (!action) {
        return;
      }
      const opponent = this.pickOpponent(character);

      if (!this.checkHit(character, opponent)) {
        return;
      }

      this.applyAction(action, character, opponent);
    });

    this.resetRoundActions();
  }

  resetRoundActions() {
    this.roundActions = {};
  }

  addAction(characterId: string, action: IAction) {
    this.roundActions[characterId] = action;
  }

  private getRoundOrder(): ICharacter[] {
    let allCharacters = [
      ...this.encounterConfig.teamA,
      ...this.encounterConfig.teamB,
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

  private applyAction(
    action: IAction,
    character: ICharacter,
    opponent: ICharacter,
  ) {
    const characterBaseStats = character.baseStats;
    const opponentBaseStats = opponent.baseStats;
    const baseDamage =
      action.damageModifiers.multiplyFactor *
        random(characterBaseStats.damage.min, characterBaseStats.damage.max) +
      action.damageModifiers.addFactor;
    const damageReductionFactor =
      characterBaseStats.attackPower / characterBaseStats.attackPower +
      opponentBaseStats.dmgReduction;
    const actionDamage = damageReductionFactor * baseDamage;

    opponent.currentHp -= actionDamage;
  }
}
