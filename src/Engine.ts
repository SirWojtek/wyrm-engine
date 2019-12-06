import { v4 as uuid } from 'uuid';

import { Encounter } from './Encounter';
import { IBaseStats } from './interfaces/IBaseStats';
import { IBaseCharacter, ICharacter } from './interfaces/ICharacter';
import { IEncounterConfig } from './interfaces/IEncounterConfig';
import { IEngineConfig } from './interfaces/IEngineConfig';

export class Engine {
  constructor(private engineConfig: IEngineConfig) {}

  createEncounter(teamA: IBaseCharacter[], teamB: IBaseCharacter[]): Encounter {
    const encounterTeamA: ICharacter[] = teamA.map(c => this.toCharacter(c));
    const encounterTeamB: ICharacter[] = teamB.map(c => this.toCharacter(c));

    const config: IEncounterConfig = {
      id: uuid(),
      teamA: encounterTeamA,
      teamB: encounterTeamB,
    };

    return new Encounter(config);
  }

  private toCharacter(baseChar: IBaseCharacter): ICharacter {
    const { stats } = baseChar;
    const { statsModifiers } = this.engineConfig;

    const baseStats: IBaseStats = {
      damage: statsModifiers.damage * stats.power,
      hitRating: statsModifiers.hitRating * stats.power,
      initiative: statsModifiers.initiative * stats.power,
      dodge: statsModifiers.dodge * stats.power,
      dmgReduction: statsModifiers.dmgReduction * stats.power,
      hp: statsModifiers.hp * stats.power,
    };

    return {
      ...baseChar,
      baseStats,
    };
  }
}
