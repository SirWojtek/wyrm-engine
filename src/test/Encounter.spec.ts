import {
  CharacterCreator,
  CharacterSubtypeEnum,
  CharacterTypeEnum,
} from '../CharacterCreator';
import { Engine } from '../Engine';
import {
  createEngine,
  Encounter,
  IBaseCharacter,
  IDeathEncounterLogEntry,
  IWinEncounterLogEntry,
  LogEntryTypeEnum,
  TeamEnum,
} from '../wyrm-engine';

describe('Encounter', () => {
  let engine: Engine;
  let characterCreator: CharacterCreator;

  beforeEach(() => {
    engine = createEngine();
    characterCreator = engine.getCharacterCreator();
  });

  describe('actions', () => {
    let kyle: IBaseCharacter;
    let jenny: IBaseCharacter;
    let encounter: Encounter;

    beforeEach(() => {
      kyle = characterCreator.createCharacter({
        name: 'Kyle',
        level: 10,
        type: CharacterTypeEnum.Strong,
        subtype: CharacterSubtypeEnum.Balanced,
      });
      jenny = characterCreator.createCharacter({
        name: 'Jenny',
        level: 10,
        type: CharacterTypeEnum.Strong,
        subtype: CharacterSubtypeEnum.Balanced,
      });
      encounter = engine.createEncounter([kyle], [jenny]);
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
      kyle = characterCreator.createCharacter({
        name: 'Kyle',
        level: 10,
        type: CharacterTypeEnum.Strong,
        subtype: CharacterSubtypeEnum.Balanced,
        overrideCharacter: {
          controllerCallback: actions => actions[0],
        },
      });
      encounter = engine.createEncounter([kyle], [jenny]);

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
});
