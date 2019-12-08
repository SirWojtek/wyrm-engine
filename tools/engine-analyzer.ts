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

function getWinnerTeam(engine: Engine): TeamEnum {
  const characterCreator = new CharacterCreator(engine.getConfig());

  const strongKyle = characterCreator.strongCharacter({
    name: 'Strong Kyle',
    level: 5,
    damage: { min: 10, max: 12 },
    armor: 20,
    controllerCallback: pickFirstActionStrategy,
  });

  const strongJenny = characterCreator.strongCharacter({
    name: 'Strong Jenny',
    level: 5,
    damage: { min: 10, max: 12 },
    armor: 20,
    controllerCallback: pickFirstActionStrategy,
  });

  const encounter = engine.createEncounter([strongKyle], [strongJenny]);

  while (encounter.tick()) {
    // noop
  }

  const winner = encounter
    .getEncounterLog()
    .find(l => l.entryType === LogEntryTypeEnum.Win) as IWinEncounterLogEntry;
  if (!winner) {
    throw new Error('Cannot find win message');
  }
  return winner.wictoryTeam;
}

const wyrmEngine = createEngine();

let winnerA = 0;
const encounters = 10000;

for (let i = 0; i < encounters; i++) {
  console.log(`Simulation round ${i + 1}`);
  if (getWinnerTeam(wyrmEngine) === TeamEnum.teamA) {
    winnerA++;
  }
}

console.log(`Win team ratio: ${winnerA / encounters}`);
