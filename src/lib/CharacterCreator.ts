import { v4 as uuid } from 'uuid';

import { round } from 'lodash';
import { IAction } from './interfaces/IAction';
import { ICharacter } from './interfaces/ICharacter';
import { IEngineConfig } from './interfaces/IEngineConfig';
import { IStats } from './interfaces/IStats';

/**
 * Simple attack action with no damage bonuses
 */
const ATTACK_ACTION: IAction = {
  id: uuid(),
  name: 'Attack',
  damageModifiers: {
    addFactor: 0,
    multiplyFactor: 1,
  },
};

/**
 * Enumerates types of characters
 */
export enum CharacterTypeEnum {
  /**
   * Deals more damage
   */
  Strong = 'Strong',
  /**
   * Hits more often, has more chance to dodge
   */
  Swift = 'Swift',
  /**
   * Has more hit points
   */
  Tought = 'Tought',
}

/**
 * Enumerates sutypes of characters
 */
export enum CharacterSubtypeEnum {
  /**
   * Has damage bonus and weaker armor
   */
  Attacker = 'Attacker',
  /**
   * Balanced damage and armor
   */
  Balanced = 'Balanced',
  /**
   * Has armor bonus and weaker damage
   */
  Defender = 'Defender',
}

/**
 * Serves as arguments list for character creation method
 */
export interface ICharacterData {
  /**
   * Name of character
   */
  name: string;
  /**
   * Level of character. Higher level -> more powerful character
   */
  level: number;
  /**
   * Type of character to create
   */
  type: CharacterTypeEnum;
  /**
   * Subtype of character to create
   */
  subtype: CharacterSubtypeEnum;
  /**
   * Provided values will override character parameters
   */
  overrideCharacter?: Partial<ICharacter>;
}

type Stats = 'power' | 'dexterity' | 'stamina';
type StatModifiers = { [stat in Stats]: number };
type CharacterTypeModifiers = {
  [characterType in CharacterTypeEnum]: StatModifiers;
};

/**
 * Class to simplify character creation basing on current engine configuration
 */
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

  /**
   * Creates engine character entity basing on given template.
   *
   * If `overrideCharacter` is not specified, the created character will:
   * * have generated `id`
   * * have one action defined
   * * be AI controlled - the first action will be chosen as round action
   *
   * @param data template used to create engine character
   * @returns character compatible with engine
   */
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
      controllerCallback: a => a[0],
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
