import { readFileSync, writeFileSync } from 'fs';
import { render } from 'mustache';
import {
  CharacterCreator,
  CharacterSubtypeEnum,
  CharacterTypeEnum,
  ICharacterData,
} from '../src/CharacterCreator';
import { createEngine } from '../src/create-engine';

import { range } from 'lodash';
import { Engine } from '../src/Engine';
import {
  IAction,
  IWinEncounterLogEntry,
  LogEntryTypeEnum,
  TeamEnum,
} from '../src/interfaces/index';

// tslint:disable:no-console

function combinations<T>(array: T[]): T[][] {
  const results = [];

  for (let i = 0; i < array.length - 1; i++) {
    for (let j = i + 1; j < array.length; j++) {
      results.push([array[i], array[j]]);
    }
  }

  return results;
}

function variations<T>(array: T[]): T[][] {
  const results = [];

  for (const i of array) {
    for (const j of array) {
      results.push([i, j]);
    }
  }

  return results;
}

function pickFirstActionStrategy(actions: IAction[]): IAction | undefined {
  if (!actions.length) {
    return undefined;
  }

  return actions[0];
}

function simulate(
  engine: Engine,
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
      .forEach(console.log);
  }

  const winner = encounter
    .getEncounterLog()
    .find(l => l.entryType === LogEntryTypeEnum.Win) as IWinEncounterLogEntry;
  if (!winner) {
    throw new Error('Cannot find win message');
  }
  return { winner: winner.wictoryTeam, roundCount: winner.encounterRound };
}

function simulateLoop(
  engine: Engine,
  level: number,
  firstCharType: CharacterTypeEnum,
  firstCharSubtype: CharacterSubtypeEnum,
  secondCharType: CharacterTypeEnum,
  secondCharSubtype: CharacterSubtypeEnum,
  count: number,
): { winRatio: number; avgRounds: number } {
  let winnerA = 0;
  let rounds = 0;

  console.log(`simulateLoop:\tlevel: ${level}\tcount:${count}`);

  const kyle = {
    name: 'Kyle',
    level,
    type: firstCharType,
    subtype: firstCharSubtype,
    overrideCharacter: {
      controllerCallback: pickFirstActionStrategy,
    },
  };
  const jenny = {
    name: 'Jenny',
    level,
    type: secondCharType,
    subtype: secondCharSubtype,
    overrideCharacter: {
      controllerCallback: pickFirstActionStrategy,
    },
  };

  for (let i = 0; i < count; i++) {
    const results = simulate(engine, kyle, jenny);
    rounds += results.roundCount;
    if (results.winner === TeamEnum.teamA) {
      winnerA++;
    }
  }

  return { winRatio: winnerA / count, avgRounds: rounds / count };
}

function generateChart(
  outputFilePath: string,
  data: { winData: number[][]; roundsData: number[][] },
) {
  const winData = data.winData.reduce(
    (res, point) => (res += JSON.stringify(point) + ','),
    '',
  );
  const roundsData = data.roundsData.reduce(
    (res, point) => (res += JSON.stringify(point) + ','),
    '',
  );

  const template = readFileSync('./tools/line-chart.mustache').toString();
  const output = render(template, { winData, roundsData });
  writeFileSync(outputFilePath, output);
}

const wyrmEngine = createEngine({
  statPointsPerLevel: 5,
  statsModifiers: {
    damage: 1,
    attackPower: 1.2,
    armorPenetration: 1,
    hitRating: 1,
    initiative: 1,
    dodge: 1,
    dmgReduction: 1,
  },
  maxHpModifier: 5,
  damageConfig: {
    startDamage: 10,
    damagePerLevel: 2,
  },
  armorConfig: {
    startArmor: 20,
    armorPerLevel: 10,
  },
});

const typeCombinations: CharacterTypeEnum[][] = combinations(
  Object.values(CharacterTypeEnum),
);
const subtypeCombinations: CharacterSubtypeEnum[][] = variations(
  Object.values(CharacterSubtypeEnum),
);

typeCombinations.forEach(typeCombination =>
  subtypeCombinations.forEach(subtypeCombination => {
    console.log(
      `Simulating ${typeCombination[0]}_${subtypeCombination[0]} vs ${typeCombination[1]}_${subtypeCombination[1]}`,
    );

    const data = range(1, 61).map(lvl => ({
      lvl,
      data: simulateLoop(
        wyrmEngine,
        lvl,
        typeCombination[0],
        subtypeCombination[0],
        typeCombination[1],
        subtypeCombination[1],
        1000,
      ),
    }));

    const winRatioData = data.map(point => [point.lvl, point.data.winRatio]);
    const avgRoundsData = data.map(point => [point.lvl, point.data.avgRounds]);

    generateChart(
      `./out/${typeCombination[0]}_${subtypeCombination[0]}_vs_${typeCombination[1]}_${subtypeCombination[1]}.html`,
      {
        winData: winRatioData,
        roundsData: avgRoundsData,
      },
    );
  }),
);
