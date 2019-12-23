import { countBy, flatMap, groupBy } from 'lodash';
import {
  createEngine,
  Encounter,
  IActionEncounterLogEntry,
  ICharacter,
  IDeathEncounterLogEntry,
  IEncounterSummaryLogEntry,
  IWinEncounterLogEntry,
  LogEntryTypeEnum,
  TeamEnum,
} from '..';
import { CharacterTypeEnum, ICharacterData } from '../CharacterCreator';
import { WyrmEngine } from '../WyrmEngine';
import {
  createEncounter,
  simulateEncounters,
  simulateEncounterSingleRound,
} from './utils/encounter-helper';

const TEST_ITERATIONS = 100;

describe('Encounter', () => {
  let engine: WyrmEngine;

  beforeEach(() => {
    engine = createEngine();
  });

  describe('actions', () => {
    let encounter: Encounter;
    let kyle: ICharacter;
    let jenny: ICharacter;

    beforeEach(() => {
      const encounterData = createEncounter(
        engine,
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
        engine,
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

  describe('swift characters', () => {
    let jenny: Partial<ICharacterData>;
    let kyle: Partial<ICharacterData>;

    beforeEach(() => {
      kyle = {
        name: 'Kyle',
        overrideCharacter: { controllerCallback: actions => actions[0] },
      };
      jenny = {
        name: 'Jenny',
        type: CharacterTypeEnum.Swift,
        overrideCharacter: { controllerCallback: actions => actions[0] },
      };
    });

    test('first more often', () => {
      const messages = simulateEncounterSingleRound(
        engine,
        TEST_ITERATIONS,
        kyle,
        jenny,
      );

      const roundOrderMessages = messages.filter(
        log => (log as IEncounterSummaryLogEntry).orderedCharacters,
      ) as IEncounterSummaryLogEntry[];
      const countedFirstCharacters = countBy(
        roundOrderMessages,
        log => log.orderedCharacters[0].name,
      );

      expect(countedFirstCharacters[kyle.name || '']).toBeGreaterThan(0);
      expect(countedFirstCharacters[jenny.name || '']).toBeGreaterThan(
        countedFirstCharacters[kyle.name || ''],
      );
    });

    test('hits more often', () => {
      const messages = simulateEncounterSingleRound(
        engine,
        TEST_ITERATIONS,
        kyle,
        jenny,
      );

      const notMissedMessages = messages
        .filter(log => log.entryType === LogEntryTypeEnum.Action)
        .filter(
          log => !(log as IActionEncounterLogEntry).missed,
        ) as IActionEncounterLogEntry[];
      const countedNotMissed = countBy(
        notMissedMessages,
        log => log.attacker.name,
      );

      expect(countedNotMissed[kyle.name || '']).toBeGreaterThan(0);
      expect(countedNotMissed[jenny.name || '']).toBeGreaterThan(
        countedNotMissed[kyle.name || ''],
      );
    });

    test('dodges more often', () => {
      const messages = simulateEncounterSingleRound(
        engine,
        TEST_ITERATIONS,
        kyle,
        jenny,
      );

      const missedMessages = messages
        .filter(log => log.entryType === LogEntryTypeEnum.Action)
        .filter(
          log => (log as IActionEncounterLogEntry).missed,
        ) as IActionEncounterLogEntry[];
      const countedMissed = countBy(missedMessages, log => log.defender.name);

      expect(countedMissed[kyle.name || '']).toBeGreaterThan(0);
      expect(countedMissed[jenny.name || '']).toBeGreaterThan(
        countedMissed[kyle.name || ''],
      );
    });
  });

  describe('strong characters', () => {
    let jenny: Partial<ICharacterData>;
    let kyle: Partial<ICharacterData>;

    beforeEach(() => {
      kyle = {
        name: 'Kyle',
        type: CharacterTypeEnum.Strong,
        overrideCharacter: { controllerCallback: actions => actions[0] },
      };
      jenny = {
        name: 'Jenny',
        type: CharacterTypeEnum.Tought,
        overrideCharacter: { controllerCallback: actions => actions[0] },
      };
    });

    test('do more damage', () => {
      const messages = simulateEncounterSingleRound(
        engine,
        TEST_ITERATIONS,
        kyle,
        jenny,
      );

      const notMissedMessages = messages
        .filter(log => log.entryType === LogEntryTypeEnum.Action)
        .filter(
          log => !(log as IActionEncounterLogEntry).missed,
        ) as IActionEncounterLogEntry[];
      const actionsGroupedByAttacker = groupBy(
        notMissedMessages,
        log => log.attacker.name,
      );

      const kyleDamageSum = actionsGroupedByAttacker[kyle.name || ''].reduce(
        (res, log) => (res += log.damageDone),
        0,
      );
      const jennyDamageSum = actionsGroupedByAttacker[jenny.name || ''].reduce(
        (res, log) => (res += log.damageDone),
        0,
      );

      expect(kyleDamageSum).toBeGreaterThan(0);
      expect(jennyDamageSum).toBeGreaterThan(0);
      expect(kyleDamageSum).toBeGreaterThan(jennyDamageSum);
    });
  });

  describe('tought characters', () => {
    let jenny: Partial<ICharacterData>;
    let kyle: Partial<ICharacterData>;

    beforeEach(() => {
      kyle = {
        name: 'Kyle',
        type: CharacterTypeEnum.Tought,
      };
      jenny = {
        name: 'Jenny',
        type: CharacterTypeEnum.Strong,
      };
    });

    test('have more hp', () => {
      const { character1, character2 } = createEncounter(engine, kyle, jenny);

      expect(character1.maxHp).toBeGreaterThan(0);
      expect(character2.maxHp).toBeGreaterThan(0);
      expect(character1.maxHp).toBeGreaterThan(character2.maxHp);
    });
  });

  test('same characters win ratio', () => {
    const iterations = 10000;

    const mergedLog = flatMap(
      simulateEncounters(
        engine,
        iterations,
        { name: 'Kyle', overrideCharacter: { controllerCallback: a => a[0] } },
        { name: 'Jenny', overrideCharacter: { controllerCallback: a => a[0] } },
      ),
    );
    const winMessages = (mergedLog.filter(
      log => log.entryType === LogEntryTypeEnum.Win,
    ) as unknown) as IWinEncounterLogEntry[];

    const countedByTeam = countBy(winMessages, log => log.wictoryTeam);
    expect(
      countedByTeam[TeamEnum.teamA] + countedByTeam[TeamEnum.teamB],
    ).toEqual(iterations);
    expect(
      countedByTeam[TeamEnum.teamA] / countedByTeam[TeamEnum.teamB],
    ).toBeCloseTo(1, 0);
  });
});
