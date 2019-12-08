import { v4 as uuid } from 'uuid';

import { round } from 'lodash';
import { IBaseCharacter } from './interfaces/ICharacter';
import { IDamage } from './interfaces/IDamage';
import { IEngineConfig } from './interfaces/IEngineConfig';
import { IAction, IStats } from './wyrm-engine';

const ATTACK_ACTION: IAction = {
  id: uuid(),
  name: 'Attack',
  damageModifiers: {
    addFactor: 0,
    multiplyFactor: 1,
  },
};

interface ICharacterData {
  name: string;
  level: number;
  damage: IDamage;
  armor: number;
  controllerCallback?: (actions: IAction[]) => IAction | undefined;
}

export class CharacterCreator {
  constructor(private engineConfig: IEngineConfig) {}

  strongCharacter(data: ICharacterData): IBaseCharacter {
    const statsSum = data.level * this.engineConfig.statPointsPerLevel;

    const stats: IStats = {
      damage: data.damage,
      armor: data.armor,
      power: round((2 * statsSum) / 4),
      dexterity: round(statsSum / 4),
      stamina: round(statsSum / 4),
    };

    const maxHp = round(stats.stamina * this.engineConfig.maxHpModifier);

    return {
      id: uuid(),
      name: data.name,
      level: data.level,
      stats,
      maxHp,
      currentHp: maxHp,
      actions: [ATTACK_ACTION],
      controllerCallback: data.controllerCallback,
    };
  }

  swiftCharacter(data: ICharacterData): IBaseCharacter {
    const statsSum = data.level * this.engineConfig.statPointsPerLevel;

    const stats: IStats = {
      damage: data.damage,
      armor: data.armor,
      power: round(statsSum / 4),
      dexterity: round((2 * statsSum) / 4),
      stamina: round(statsSum / 4),
    };

    const maxHp = stats.stamina * this.engineConfig.maxHpModifier;

    return {
      id: uuid(),
      name: data.name,
      level: data.level,
      stats,
      maxHp,
      currentHp: maxHp,
      actions: [ATTACK_ACTION],
      controllerCallback: data.controllerCallback,
    };
  }

  toughtCharacter(data: ICharacterData): IBaseCharacter {
    const statsSum = data.level * this.engineConfig.statPointsPerLevel;

    const stats: IStats = {
      damage: data.damage,
      armor: data.armor,
      power: round(statsSum / 4),
      dexterity: round(statsSum / 4),
      stamina: round((2 * statsSum) / 4),
    };

    const maxHp = stats.stamina * this.engineConfig.maxHpModifier;

    return {
      id: uuid(),
      name: data.name,
      level: data.level,
      stats,
      maxHp,
      currentHp: maxHp,
      actions: [ATTACK_ACTION],
      controllerCallback: data.controllerCallback,
    };
  }
}
