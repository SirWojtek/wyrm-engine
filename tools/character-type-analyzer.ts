import { readFileSync, writeFileSync } from 'fs';
import { render } from 'mustache';
import {
  CharacterSubtypeEnum,
  CharacterTypeEnum,
} from '../src/lib/CharacterCreator';
import { createEngine } from '../src/lib/create-engine';

import { flatten, range } from 'lodash';
import { combinations, simulateLoop, variations } from './functions';

// tslint:disable:no-console

function generateChart(
  outputFilePath: string,
  chartDef: {
    data: Array<Array<string | number>>;
    title: string;
    hMinValue: number;
    hMaxValue: number;
  },
) {
  const data = JSON.stringify(chartDef.data);
  const title = JSON.stringify(chartDef.title);
  const hMinValue = chartDef.hMinValue;
  const hMaxValue = chartDef.hMaxValue;

  const template = readFileSync('./tools/line-chart.mustache').toString();
  const output = render(template, { data, title, hMinValue, hMaxValue });
  writeFileSync(outputFilePath, output);
}

const wyrmEngine = createEngine({
  statPointsPerLevel: 3,
  statsModifiers: {
    damage: 1,
    attackPower: 1.5,
    armorPenetration: 1,
    hitRating: 1,
    initiative: 1,
    dodge: 0.7,
    dmgReduction: 1,
  },
  maxHpModifier: 5,
  damageConfig: {
    startDamage: 10,
    damagePerLevel: 1,
  },
  armorConfig: {
    startArmor: 20,
    armorPerLevel: 3,
  },
});

const typeCombinations: CharacterTypeEnum[][] = combinations(
  Object.values(CharacterTypeEnum),
);
const subtypeCombinations: CharacterSubtypeEnum[][] = variations(
  Object.values(CharacterSubtypeEnum),
);

const titleRow: string[] = ['Level'];
typeCombinations.forEach(typeCombination =>
  subtypeCombinations.forEach(subtypeCombination =>
    titleRow.push(
      `${typeCombination[0]}_${subtypeCombination[0]} vs. ${typeCombination[1]}_${subtypeCombination[1]}`,
    ),
  ),
);

const levelAndSimulationData = range(1, 61).map(lvl => {
  const simulationData = typeCombinations.map(typeCombination =>
    subtypeCombinations.map(subtypeCombination =>
      simulateLoop(
        wyrmEngine,
        lvl,
        lvl,
        typeCombination[0],
        subtypeCombination[0],
        typeCombination[1],
        subtypeCombination[1],
        100,
      ),
    ),
  );

  return { lvl, simulationData };
});

const winRatioData = [
  titleRow,
  ...levelAndSimulationData.map(levelAndData => {
    const flattenData = flatten(levelAndData.simulationData);
    const winRatio = flattenData.map(d => d.winRatio);

    return [levelAndData.lvl, ...winRatio];
  }),
];

generateChart(`./out/win_ratio.html`, {
  title: 'Win ratio for level',
  data: winRatioData,
  hMinValue: 0,
  hMaxValue: 1,
});

const avgRoundsData = [
  titleRow,
  ...levelAndSimulationData.map(levelAndData => {
    const flattenData = flatten(levelAndData.simulationData);
    const avgRounds = flattenData.map(d => d.avgRounds);

    return [levelAndData.lvl, ...avgRounds];
  }),
];

generateChart(`./out/avg_rounds.html`, {
  title: 'Avg. rounds for level',
  data: avgRoundsData,
  hMinValue: 0,
  hMaxValue: 10,
});
