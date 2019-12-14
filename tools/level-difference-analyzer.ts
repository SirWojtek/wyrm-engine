import { readFileSync, writeFileSync } from 'fs';
import { render } from 'mustache';
import {
  CharacterSubtypeEnum,
  CharacterTypeEnum,
} from '../src/CharacterCreator';
import { createEngine } from '../src/create-engine';

import { range } from 'lodash';
import { simulateLoop } from './functions';

function generateChart(
  outputFilePath: string,
  chartDef: {
    data: number[][];
    title: string;
  },
) {
  const data = JSON.stringify(chartDef.data);
  const title = JSON.stringify(chartDef.title);

  const template = readFileSync('./tools/surface-chart.mustache').toString();
  const output = render(template, { data, title });
  writeFileSync(outputFilePath, output);
}

const wyrmEngine = createEngine({
  statPointsPerLevel: 3,
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
    damagePerLevel: 1,
  },
  armorConfig: {
    startArmor: 20,
    armorPerLevel: 1,
  },
});

const winRatioData: number[][] = range(1, 61).map(firstLevel =>
  range(1, 61).map(
    secondLevel =>
      simulateLoop(
        wyrmEngine,
        firstLevel,
        secondLevel,
        CharacterTypeEnum.Strong,
        CharacterSubtypeEnum.Balanced,
        CharacterTypeEnum.Strong,
        CharacterSubtypeEnum.Balanced,
        1000,
      ).winRatio,
  ),
);

generateChart(`./out/win_ratio_diff.html`, {
  title: 'Win ratio level difference',
  data: winRatioData,
});
