import { createEngine, DEFAULT_CONFIG } from '../create-engine';

describe('createEngine', () => {
  test('should use default setting if no other provided', () => {
    const engine = createEngine();
    expect(engine.getConfig()).toEqual(DEFAULT_CONFIG);
  });

  test('should override engine config', () => {
    const maxHpModifier = 44;
    const engine = createEngine({
      maxHpModifier,
    });
    expect(engine.getConfig()).toEqual({
      ...DEFAULT_CONFIG,
      maxHpModifier,
    });
  });
});
