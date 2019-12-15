import { CharacterSubtypeEnum, CharacterTypeEnum } from '../CharacterCreator';
import { Engine } from '../Engine';
import { DEFAULT_CONFIG, IBaseCharacter } from '../wyrm-engine';

describe('Engine', () => {
  let engine: Engine;
  let kyle: IBaseCharacter;
  let jenny: IBaseCharacter;

  beforeEach(() => {
    engine = new Engine(DEFAULT_CONFIG);
    kyle = engine.getCharacterCreator().createCharacter({
      name: 'Kyle',
      level: 5,
      type: CharacterTypeEnum.Strong,
      subtype: CharacterSubtypeEnum.Balanced,
    });
    jenny = engine.getCharacterCreator().createCharacter({
      name: 'Jenny',
      level: 5,
      type: CharacterTypeEnum.Swift,
      subtype: CharacterSubtypeEnum.Balanced,
    });
  });

  test('should return config passed in constructor', () => {
    expect(engine.getConfig()).toEqual(DEFAULT_CONFIG);
  });

  test('should throw during encounter creation if team is empty', () => {
    expect(() => engine.createEncounter([], [jenny])).toThrowError();
    expect(() => engine.createEncounter([kyle], [])).toThrowError();
    expect(() => engine.createEncounter([], [])).toThrowError();
  });

  test('should throw if character hp is zero or less', () => {
    kyle.currentHp = 0;
    expect(() => engine.createEncounter([kyle], [jenny])).toThrowError();
    kyle.currentHp = -10;
    expect(() => engine.createEncounter([kyle], [jenny])).toThrowError();
  });

  test('should return encounter object for valid input teams', () => {
    const encounter = engine.createEncounter([kyle], [jenny]);
    expect(encounter).toBeDefined();
  });
});
