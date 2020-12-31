import uuid from 'uuid-random';

import { cloneDeep, round } from 'lodash';
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
 * Serves as arguments list for stats creation method
 */
export interface IStatsData {
  /**
   * Type of character to create
   */
  type: CharacterTypeEnum;
  /**
   * Subtype of character to create, default is `Balanced`
   */
  subtype?: CharacterSubtypeEnum;
  /**
   * Level of character. Higher level -> more powerful character
   */
  level: number;
}

/**
 * Serves as arguments list for character creation method
 */
export interface ICharacterData extends IStatsData {
  /**
   * Name of character
   */
  name?: string;
  /**
   * Tells the creator if it should generate AI controller
   */
  autoControl?: boolean;
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
    const autoControl =
      data.autoControl === undefined ? true : data.autoControl;
    const stats = this.getStats(data);
    const maxHp = this.getMaxHp(stats);

    return {
      id: uuid(),
      name: data.name,
      level: data.level,
      stats,
      maxHp: this.getMaxHp(stats),
      currentHp: maxHp,
      actions: [ATTACK_ACTION],
      controllerCallback: autoControl ? a => a[0] : undefined,
      ...data.overrideCharacter,
    };
  }

  /**
   * Computes character attributes basing on given data.
   *
   * @param data metadata needed to compute stats
   * @returns stats compatible with engine
   */
  getStats(data: IStatsData): IStats {
    const subtype = data.subtype || CharacterSubtypeEnum.Balanced;
    const characterModifiers = this.characterTypeModifiers[data.type];
    const maxDamage = this.getMaxDamage(data.level, subtype);
    const minDamage = round(maxDamage * this.minDamageModifier);
    const armor = this.getArmor(data.level, subtype);
    const statsSum = this.getStatsPointsSum(data.level);

    return {
      damage: { min: minDamage, max: maxDamage },
      armor,
      power: characterModifiers.power * statsSum,
      dexterity: characterModifiers.dexterity * statsSum,
      stamina: characterModifiers.stamina * statsSum,
    };
  }

  /**
   * Returns the deafult attack actions without damage bonuses
   *
   * @returns default attack action
   */
  getAttackAction(): IAction {
    return cloneDeep(ATTACK_ACTION);
  }

  /**
   * Computes character maximum hp
   *
   * @param stats stats used to compute HP for
   * @returns maximum allowed character hit points
   */
  getMaxHp(stats: IStats): number {
    const { maxHpModifier } = this.engineConfig;
    return round(stats.stamina * maxHpModifier);
  }

  getMaxDamage(level: number, subtype?: CharacterSubtypeEnum): number {
    const { damageConfig } = this.engineConfig;
    const baseDmg =
      damageConfig.startDamage + level * damageConfig.damagePerLevel;

    switch (subtype || CharacterSubtypeEnum.Balanced) {
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

  getArmor(level: number, subtype?: CharacterSubtypeEnum): number {
    const { armorConfig } = this.engineConfig;
    const baseArmor = round(
      armorConfig.startArmor + level * armorConfig.armorPerLevel,
    );

    switch (subtype || CharacterSubtypeEnum.Balanced) {
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

  getStatsPointsSum(level: number): number {
    return level * this.engineConfig.statPointsPerLevel;
  }
}
