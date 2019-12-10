import { CharacterCreator } from '../src/CharacterCreator';
import { createEngine } from '../src/create-engine';

import { Engine } from '../src/Engine';
import {
  IAction,
  IWinEncounterLogEntry,
  LogEntryTypeEnum,
  TeamEnum,
} from '../src/interfaces/index';

// tslint:disable:no-console

function pickFirstActionStrategy(actions: IAction[]): IAction | undefined {
  if (!actions.length) {
    return undefined;
  }

  return actions[0];
}

function getResults(engine: Engine): { winner: TeamEnum; roundCount: number } {
  const characterCreator = new CharacterCreator(engine.getConfig());

  const kyle = characterCreator.strongCharacter({
    name: 'Kyle',
    level: 5,
    damage: { min: 10, max: 12 },
    armor: 20,
    controllerCallback: pickFirstActionStrategy,
  });

  const jenny = characterCreator.toughtCharacter({
    name: 'Jenny',
    level: 5,
    damage: { min: 10, max: 12 },
    armor: 20,
    controllerCallback: pickFirstActionStrategy,
  });

  const encounter = engine.createEncounter([kyle], [jenny]);

  while (encounter.tick()) {
    // noop
  }

  encounter.getEncounterLog().forEach(l => console.log(l.message));

  const winner = encounter
    .getEncounterLog()
    .find(l => l.entryType === LogEntryTypeEnum.Win) as IWinEncounterLogEntry;
  if (!winner) {
    throw new Error('Cannot find win message');
  }
  return { winner: winner.wictoryTeam, roundCount: winner.encounterRound };
}

const wyrmEngine = createEngine();

let winnerA = 0;
let rounds = 0;
const encounters = 1000;

for (let i = 0; i < encounters; i++) {
  const results = getResults(wyrmEngine);
  rounds += results.roundCount;
  if (results.winner === TeamEnum.teamA) {
    winnerA++;
  }
}

console.log('=============================================');
console.log(`Win team ratio: ${winnerA / encounters}`);
console.log(`Avg rounds: ${rounds / encounters}`);
