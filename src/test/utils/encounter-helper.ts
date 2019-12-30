import { range } from 'lodash';
import {
  CharacterSubtypeEnum,
  CharacterTypeEnum,
  ICharacterData,
} from '../../lib/CharacterCreator';
import { IEcounterLog } from '../../lib/interfaces';
import { WyrmEngine } from '../../lib/WyrmEngine';

const DEFAULT_CHARACTER_CONFIG: ICharacterData = {
  name: 'Unknown',
  level: 10,
  type: CharacterTypeEnum.Strong,
  subtype: CharacterSubtypeEnum.Balanced,
};

export function createEncounter(
  engine: WyrmEngine,
  template1: Partial<ICharacterData>,
  template2: Partial<ICharacterData>,
) {
  const characterCreator = engine.getCharacterCreator();

  const character1 = characterCreator.createCharacter({
    ...DEFAULT_CHARACTER_CONFIG,
    ...template1,
  });
  const character2 = characterCreator.createCharacter({
    ...DEFAULT_CHARACTER_CONFIG,
    ...template2,
  });

  return {
    encounter: engine.createEncounter([character1], [character2]),
    character1,
    character2,
  };
}

export function simulateEncounters(
  engine: WyrmEngine,
  simulations: number,
  template1: Partial<ICharacterData>,
  template2: Partial<ICharacterData>,
): IEcounterLog[] {
  return range(simulations).map(() => {
    const { encounter } = createEncounter(engine, template1, template2);
    while (encounter.tick()) {
      // noop
    }
    return encounter.getEncounterLogs();
  });
}

export function simulateEncounterSingleRound(
  engine: WyrmEngine,
  rounds: number,
  template1: Partial<ICharacterData>,
  template2: Partial<ICharacterData>,
): IEcounterLog {
  return range(rounds).reduce(log => {
    const { encounter } = createEncounter(engine, template1, template2);
    encounter.tick();
    return [...encounter.getEncounterLogs(), ...log];
  }, [] as IEcounterLog);
}
