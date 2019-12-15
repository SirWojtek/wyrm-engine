import { CharacterCreator } from '../CharacterCreator';
import { Engine } from '../Engine';
import { createEngine } from '../wyrm-engine';

describe('Encounter', () => {
  let engine: Engine;
  let characterCreator: CharacterCreator;

  beforeEach(() => {
    engine = createEngine();
    characterCreator = engine.getCharacterCreator();
  });

  test('test', () => {
    expect(true).toBeTruthy();
  });
});
