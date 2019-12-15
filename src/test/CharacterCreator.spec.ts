import {
  CharacterCreator,
  CharacterSubtypeEnum,
  CharacterTypeEnum,
} from '../CharacterCreator';
import { Engine } from '../Engine';
import { createEngine } from '../wyrm-engine';

describe('Encounter', () => {
  let engine: Engine;
  let characterCreator: CharacterCreator;

  beforeEach(() => {
    engine = createEngine();
    characterCreator = engine.getCharacterCreator();
  });

  test('should create strong character', () => {
    const level = 10;
    const kyle = characterCreator.createCharacter({
      name: 'Kyle',
      level,
      type: CharacterTypeEnum.Strong,
      subtype: CharacterSubtypeEnum.Balanced,
    });

    expect(kyle.id).toBeDefined();
    expect(kyle.level).toEqual(level);
    expect(kyle.currentHp).toEqual(kyle.maxHp);
    expect(kyle.stats.power).toBeGreaterThan(kyle.stats.dexterity);
    expect(kyle.stats.power).toBeGreaterThan(kyle.stats.stamina);
  });

  test('should create swift character', () => {
    const level = 10;
    const kyle = characterCreator.createCharacter({
      name: 'Kyle',
      level,
      type: CharacterTypeEnum.Swift,
      subtype: CharacterSubtypeEnum.Balanced,
    });

    expect(kyle.id).toBeDefined();
    expect(kyle.level).toEqual(level);
    expect(kyle.currentHp).toEqual(kyle.maxHp);
    expect(kyle.stats.dexterity).toBeGreaterThan(kyle.stats.power);
    expect(kyle.stats.dexterity).toBeGreaterThan(kyle.stats.stamina);
  });

  test('should create tought character', () => {
    const level = 10;
    const kyle = characterCreator.createCharacter({
      name: 'Kyle',
      level,
      type: CharacterTypeEnum.Tought,
      subtype: CharacterSubtypeEnum.Balanced,
    });

    expect(kyle.id).toBeDefined();
    expect(kyle.level).toEqual(level);
    expect(kyle.currentHp).toEqual(kyle.maxHp);
    expect(kyle.stats.stamina).toBeGreaterThan(kyle.stats.power);
    expect(kyle.stats.stamina).toBeGreaterThan(kyle.stats.dexterity);
  });

  test('should create character with respecting subtypes', () => {
    const level = 10;
    const attacker = characterCreator.createCharacter({
      name: 'Kyle',
      level,
      type: CharacterTypeEnum.Swift,
      subtype: CharacterSubtypeEnum.Attacker,
    });
    const balanced = characterCreator.createCharacter({
      name: 'Kyle',
      level,
      type: CharacterTypeEnum.Swift,
      subtype: CharacterSubtypeEnum.Balanced,
    });
    const defender = characterCreator.createCharacter({
      name: 'Kyle',
      level,
      type: CharacterTypeEnum.Swift,
      subtype: CharacterSubtypeEnum.Defender,
    });

    expect(attacker.stats.damage.min).toBeGreaterThan(
      balanced.stats.damage.min,
    );
    expect(balanced.stats.damage.min).toBeGreaterThan(
      defender.stats.damage.min,
    );

    expect(defender.stats.armor).toBeGreaterThan(balanced.stats.armor);
    expect(balanced.stats.armor).toBeGreaterThan(attacker.stats.armor);
  });
});
