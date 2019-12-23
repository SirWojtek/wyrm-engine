import {
  CharacterCreator,
  CharacterSubtypeEnum,
  CharacterTypeEnum,
  ICharacterData,
} from '../src/lib/CharacterCreator';
import {
  IAction,
  IWinEncounterLogEntry,
  LogEntryTypeEnum,
  TeamEnum,
} from '../src/lib/interfaces';
import { WyrmEngine } from '../src/lib/WyrmEngine';

// tslint:disable:no-console

export function combinations<T>(array: T[]): T[][] {
  const results = [];

  for (let i = 0; i < array.length - 1; i++) {
    for (let j = i + 1; j < array.length; j++) {
      results.push([array[i], array[j]]);
    }
  }

  return results;
}

export function variations<T>(array: T[]): T[][] {
  const results = [];

  for (const i of array) {
    for (const j of array) {
      results.push([i, j]);
    }
  }

  return results;
}

export function pickFirstActionStrategy(
  actions: IAction[],
): IAction | undefined {
  if (!actions.length) {
    return undefined;
  }

  return actions[0];
}

export function simulate(
  engine: WyrmEngine,
  firstChracterData: ICharacterData,
  secondChracterData: ICharacterData,
  debug?: boolean,
): { winner: TeamEnum; roundCount: number } {
  const characterCreator = new CharacterCreator(engine.getConfig());

  const firstCharacter = characterCreator.createCharacter(firstChracterData);
  const secondCharacter = characterCreator.createCharacter(secondChracterData);

  const encounter = engine.createEncounter([firstCharacter], [secondCharacter]);

  while (encounter.tick()) {
    // noop
  }

  if (debug) {
    encounter
      .getEncounterLog()
      .map(log => log.message)
      .forEach(message => console.log(message));
  }

  const winner = encounter
    .getEncounterLog()
    .find(l => l.entryType === LogEntryTypeEnum.Win) as IWinEncounterLogEntry;
  if (!winner) {
    throw new Error('Cannot find win message');
  }
  return { winner: winner.wictoryTeam, roundCount: winner.encounterRound };
}

export function simulateLoop(
  engine: WyrmEngine,
  firstLevel: number,
  secondLevel: number,
  firstCharType: CharacterTypeEnum,
  firstCharSubtype: CharacterSubtypeEnum,
  secondCharType: CharacterTypeEnum,
  secondCharSubtype: CharacterSubtypeEnum,
  count: number,
  debug?: boolean,
): { winRatio: number; avgRounds: number } {
  let winnerA = 0;
  let rounds = 0;

  // console.log(
  // `simulateLoop:\tlevel: ${firstLevel} vs. ${secondLevel}\tcount:${count}`,
  // );

  const kyle = {
    name: 'Kyle',
    level: firstLevel,
    type: firstCharType,
    subtype: firstCharSubtype,
    overrideCharacter: {
      controllerCallback: pickFirstActionStrategy,
    },
  };
  const jenny = {
    name: 'Jenny',
    level: secondLevel,
    type: secondCharType,
    subtype: secondCharSubtype,
    overrideCharacter: {
      controllerCallback: pickFirstActionStrategy,
    },
  };

  for (let i = 0; i < count; i++) {
    const results = simulate(engine, kyle, jenny, debug);
    rounds += results.roundCount;
    if (results.winner === TeamEnum.teamA) {
      winnerA++;
    }
  }

  return { winRatio: winnerA / count, avgRounds: rounds / count };
}
