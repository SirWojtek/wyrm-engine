import uuid from 'uuid-random';

import { IEcounterLog, IEngineCharacter } from '.';
import { CharacterCreator } from './CharacterCreator';
import { Encounter } from './Encounter';
import { ICharacter } from './interfaces/ICharacter';
import { IEncounterConfig } from './interfaces/IEncounterConfig';
import { IEngineConfig } from './interfaces/IEngineConfig';
import { IEngineStats } from './interfaces/IEngineStats';
import { TeamEnum } from './interfaces/TeamEnum';

/**
 * The main class responsible for high-level interaction with engine.
 * Single instance of this object encapsulates single engine configuration.
 * The simplest way to obtain instance is to call [[createEngine]] function.
 */
export class WyrmEngine {
  private characterCreator = new CharacterCreator(this.engineConfig);

  /**
   * Constructor can be used to inject own engine configuration.
   * If you don't want to customize engine parameters, use [[createEngine]]
   * @param engineConfig Engine internal configuration
   */
  constructor(private engineConfig: IEngineConfig) {}

  /**
   * Creates encounter between given two teams.
   * @param teamA array with all characters belongs to team A
   * @param teamB array with all characters belongs to team B
   * @param logMessageCallback invoked when encounter message is emitted
   * @returns encouter object to interact with
   */
  createEncounter(
    teamA: ICharacter[],
    teamB: ICharacter[],
    logMessageCallback?: () => IEcounterLog,
  ): Encounter {
    if (!teamA.length || !teamB.length) {
      throw Error('At least one of team is empty');
    }

    const encounterTeamA: IEngineCharacter[] = teamA.map(c =>
      this.toCharacter(c, TeamEnum.teamA),
    );
    const encounterTeamB: IEngineCharacter[] = teamB.map(c =>
      this.toCharacter(c, TeamEnum.teamB),
    );

    const config: IEncounterConfig = {
      id: uuid(),
      teamA: encounterTeamA,
      teamB: encounterTeamB,
      logMessageCallback,
    };

    return new Encounter(config);
  }

  /**
   * Returns current engine configuration
   */
  getConfig(): IEngineConfig {
    return this.engineConfig;
  }

  /**
   * Gets character creator
   */
  getCharacterCreator(): CharacterCreator {
    return this.characterCreator;
  }

  private toCharacter(baseChar: ICharacter, team: TeamEnum): IEngineCharacter {
    if (baseChar.currentHp <= 0) {
      throw new Error('Character have 0 or less HP');
    }

    const { stats } = baseChar;
    const { statsModifiers } = this.engineConfig;

    const engineStats: IEngineStats = {
      damage: stats.damage,
      attackPower: statsModifiers.attackPower * stats.power,
      armorPenetration: statsModifiers.armorPenetration * stats.power,
      hitRating: statsModifiers.hitRating * stats.dexterity,
      initiative: statsModifiers.initiative * stats.dexterity,
      dodge: statsModifiers.dodge * stats.dexterity,
      dmgReduction: statsModifiers.dmgReduction * stats.armor,
    };

    return {
      ...baseChar,
      engineStats,
      team,
    };
  }
}
