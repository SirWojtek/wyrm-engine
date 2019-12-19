import { countBy, range } from 'lodash';
import {
  CharacterCreator,
  CharacterSubtypeEnum,
  CharacterTypeEnum,
  ICharacterData,
} from '../CharacterCreator';
import { Engine } from '../Engine';
import {
  createEngine,
  Encounter,
  IBaseCharacter,
  ICharacter,
  IDeathEncounterLogEntry,
  IEncounterSummaryLogEntry,
  IGeneralEncounterLogEntry,
  IWinEncounterLogEntry,
  LogEntryTypeEnum,
  TeamEnum,
} from '../wyrm-engine';

const DEFAULT_CHARACTER_CONFIG: ICharacterData = {
  name: 'Unknown',
  level: 10,
  type: CharacterTypeEnum.Strong,
  subtype: CharacterSubtypeEnum.Balanced,
};

const TEST_ITERATIONS = 100;

describe('Encounter', () => {
  let engine: Engine;
  let characterCreator: CharacterCreator;

  beforeEach(() => {
    engine = createEngine();
    characterCreator = engine.getCharacterCreator();
  });

  function createEncounter(
    template1: Partial<ICharacterData>,
    template2: Partial<ICharacterData>,
  ) {
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

  describe('actions', () => {
    let encounter: Encounter;
    let kyle: IBaseCharacter;
    let jenny: IBaseCharacter;

    beforeEach(() => {
      const encounterData = createEncounter(
        { name: 'Kyle' },
        { name: 'Jenny' },
      );
      encounter = encounterData.encounter;
      kyle = encounterData.character1;
      jenny = encounterData.character2;
    });

    test('do nothing if actions are not set', () => {
      encounter.tick();
      expect(encounter.getEncounterLog().length).toEqual(1);

      encounter.tick();
      expect(encounter.getEncounterLog().length).toEqual(2);
    });

    test('character with action set won', () => {
      encounter.addAction(kyle.id, kyle.actions[0]);

      while (encounter.tick()) {
        encounter.addAction(kyle.id, kyle.actions[0]);
      }

      const winMessage: IWinEncounterLogEntry = encounter
        .getEncounterLog()
        .find(
          l => l.entryType === LogEntryTypeEnum.Win,
        ) as IWinEncounterLogEntry;
      const deathMessage: IDeathEncounterLogEntry = encounter
        .getEncounterLog()
        .find(
          l => l.entryType === LogEntryTypeEnum.Death,
        ) as IDeathEncounterLogEntry;

      expect(winMessage).toBeDefined();
      expect(winMessage.wictoryTeam).toEqual(TeamEnum.teamA);

      expect(deathMessage).toBeDefined();
      expect(deathMessage.killed.id).toEqual(jenny.id);
    });

    test('AI character with action set won', () => {
      const encounterData = createEncounter(
        {
          name: 'Kyle',
          overrideCharacter: { controllerCallback: actions => actions[0] },
        },
        { name: 'Jenny' },
      );
      encounter = encounterData.encounter;
      kyle = encounterData.character1;
      jenny = encounterData.character2;

      while (encounter.tick()) {
        // noop
      }

      const winMessage: IWinEncounterLogEntry = encounter
        .getEncounterLog()
        .find(
          l => l.entryType === LogEntryTypeEnum.Win,
        ) as IWinEncounterLogEntry;
      const deathMessage: IDeathEncounterLogEntry = encounter
        .getEncounterLog()
        .find(
          l => l.entryType === LogEntryTypeEnum.Death,
        ) as IDeathEncounterLogEntry;

      expect(winMessage).toBeDefined();
      expect(winMessage.wictoryTeam).toEqual(TeamEnum.teamA);

      expect(deathMessage).toBeDefined();
      expect(deathMessage.killed.id).toEqual(jenny.id);
    });
  });

  describe('order', () => {
    test('swift characters are first more often', () => {
      const swiftCharacterName = 'Jenny';
      const otherCharacterName = 'Kyle';
      const { encounter } = createEncounter(
        { name: otherCharacterName },
        { name: swiftCharacterName, type: CharacterTypeEnum.Swift },
      );

      range(TEST_ITERATIONS).forEach(() => encounter.tick());

      const roundOrderMessages = encounter
        .getEncounterLog()
        .filter(
          log => (log as IEncounterSummaryLogEntry).orderedCharacters,
        ) as IEncounterSummaryLogEntry[];
      const countedFirstCharacters = countBy(
        roundOrderMessages,
        log => log.orderedCharacters[0].name,
      );

      expect(countedFirstCharacters[otherCharacterName]).toBeGreaterThan(0);
      expect(countedFirstCharacters[swiftCharacterName]).toBeGreaterThan(
        countedFirstCharacters[otherCharacterName],
      );
    });
  });
});
