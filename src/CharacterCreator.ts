import { v4 as uuid } from 'uuid';

import { round } from 'lodash';
import { IAction } from './interfaces/IAction';
import { ICharacter } from './interfaces/ICharacter';
import { IEngineConfig } from './interfaces/IEngineConfig';
import { IStats } from './interfaces/IStats';

const ATTACK_ACTION: IAction = {
  id: uuid(),
  name: 'Attack',
  damageModifiers: {
    addFactor: 0,
    multiplyFactor: 1,
  },
};

export enum CharacterTypeEnum {
  Strong = 'Strong',
  Swift = 'Swift',
  Tought = 'Tought',
}

export enum CharacterSubtypeEnum {
  Attacker = 'Attacker',
  Balanced = 'Balanced',
  Defender = 'Defender',
}

export interface ICharacterData {
  name: string;
  level: number;
  type: CharacterTypeEnum;
  subtype: CharacterSubtypeEnum;
  overrideCharacter?: Partial<ICharacter>;
}

type Stats = 'power' | 'dexterity' | 'stamina';
type StatModifiers = { [stat in Stats]: number };
type CharacterTypeModifiers = {
  [characterType in CharacterTypeEnum]: StatModifiers;
};

export class CharacterCreator {
  private subtypeModifiers = {
    good: 1.2,
    normal: 1,
    bad: 0.8,
  };
  private minDamageModifier = 0.9;
  private characterTypeModifiers: CharacterTypeModifiers = {
    [CharacterTypeEnum.Strong]: {
      power: 0.5,
      dexterity: 0.25,
      stamina: 0.25,
    },
    [CharacterTypeEnum.Swift]: {
      power: 0.25,
      dexterity: 0.5,
      stamina: 0.25,
    },
    [CharacterTypeEnum.Tought]: {
      power: 0.25,
      dexterity: 0.25,
      stamina: 0.5,
    },
  };

  constructor(private engineConfig: IEngineConfig) {}

  createCharacter(data: ICharacterData): ICharacter {
    const characterModifiers = this.characterTypeModifiers[data.type];
    return this.createCharacterInner(data, characterModifiers);
  }

  private createCharacterInner(
    data: ICharacterData,
    modifiers: StatModifiers,
  ): ICharacter {
    const { maxHpModifier } = this.engineConfig;
    const maxDamage = this.getMaxDamage(data.level, data.subtype);
    const minDamage = round(maxDamage * this.minDamageModifier);
    const armor = this.getArmor(data.level, data.subtype);
    const statsSum = data.level * this.engineConfig.statPointsPerLevel;

    const stats: IStats = {
      damage: { min: minDamage, max: maxDamage },
      armor,
      power: modifiers.power * statsSum,
      dexterity: modifiers.dexterity * statsSum,
      stamina: modifiers.stamina * statsSum,
    };

    const maxHp = round(stats.stamina * maxHpModifier);

    return {
      id: uuid(),
      name: data.name,
      level: data.level,
      stats,
      maxHp,
      currentHp: maxHp,
      actions: [ATTACK_ACTION],
      ...data.overrideCharacter,
    };
  }

  private getMaxDamage(level: number, subtype: CharacterSubtypeEnum): number {
    const { damageConfig } = this.engineConfig;
    const baseDmg =
      damageConfig.startDamage + level * damageConfig.damagePerLevel;

    switch (subtype) {
      case CharacterSubtypeEnum.Attacker:
        return round(this.subtypeModifiers.good * baseDmg);
      case CharacterSubtypeEnum.Balanced:
        return round(this.subtypeModifiers.normal * baseDmg);
      case CharacterSubtypeEnum.Defender:
        return round(this.subtypeModifiers.bad * baseDmg);
      default:
        throw Error('Unknown enum value');
    }
  }

  private getArmor(level: number, subtype: CharacterSubtypeEnum): number {
    const { armorConfig } = this.engineConfig;
    const baseArmor = round(
      armorConfig.startArmor + level * armorConfig.armorPerLevel,
    );

    switch (subtype) {
      case CharacterSubtypeEnum.Attacker:
        return round(this.subtypeModifiers.bad * baseArmor);
      case CharacterSubtypeEnum.Balanced:
        return round(this.subtypeModifiers.normal * baseArmor);
      case CharacterSubtypeEnum.Defender:
        return round(this.subtypeModifiers.good * baseArmor);
      default:
        throw Error('Unknown enum value');
    }
  }
}
