import { v4 as uuid } from 'uuid';

import { Encounter } from './Encounter';
import { IBaseStats } from './interfaces/IBaseStats';
import { IBaseCharacter, ICharacter, TeamEnum } from './interfaces/ICharacter';
import { IEncounterConfig } from './interfaces/IEncounterConfig';
import { IEngineConfig } from './interfaces/IEngineConfig';

export class Engine {
  constructor(private engineConfig: IEngineConfig) {}

  createEncounter(teamA: IBaseCharacter[], teamB: IBaseCharacter[]): Encounter {
    const encounterTeamA: ICharacter[] = teamA.map(c =>
      this.toCharacter(c, TeamEnum.teamA),
    );
    const encounterTeamB: ICharacter[] = teamB.map(c =>
      this.toCharacter(c, TeamEnum.teamB),
    );

    const config: IEncounterConfig = {
      id: uuid(),
      teamA: encounterTeamA,
      teamB: encounterTeamB,
    };

    return new Encounter(config);
  }

  getConfig(): IEngineConfig {
    return this.engineConfig;
  }

  private toCharacter(baseChar: IBaseCharacter, team: TeamEnum): ICharacter {
    if (baseChar.currentHp <= 0) {
      throw new Error('Character have 0 or less HP');
    }

    const { stats } = baseChar;
    const { statsModifiers } = this.engineConfig;

    const baseStats: IBaseStats = {
      damage: stats.damage,
      attackPower: statsModifiers.attackPower * stats.power,
      hitRating: statsModifiers.hitRating * stats.dexterity,
      initiative: statsModifiers.initiative * stats.dexterity,
      dodge: statsModifiers.dodge * stats.dexterity,
      dmgReduction: statsModifiers.dmgReduction * stats.armor,
    };

    return {
      ...baseChar,
      baseStats,
      team,
    };
  }
}
