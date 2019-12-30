# wyrm-engine

[![Build Status](https://travis-ci.com/SirWojtek/wyrm-engine.svg?branch=master)](https://travis-ci.com/SirWojtek/wyrm-engine)
[![codecov](https://codecov.io/gh/SirWojtek/wyrm-engine/branch/master/graph/badge.svg)](https://codecov.io/gh/SirWojtek/wyrm-engine)

wyrm-engine is fully typed game engine library which is designed to simulate battles between in-game characters.
The main goal of wyrm-engine is to abstract the battle logic from the rest of the game, which makes it usable
for wide pick of virtual worlds, from fantasy to sci-fi. To achieve that, wyrm-engine is using generic parameters
to define sites of battle with keeping the usage as simple as possible.

wyrm-engine main features:
* fully-typed, fully-written in Typescript,
* lightweight, depends only on [lodash](https://lodash.com/) and [uuid](https://www.npmjs.com/package/uuid),
* simple in use,
* customizable engine parameters.

The quickest way to use wyrm-engine could be:
```typescript
// create an engine instance with the default config
const wyrmEngine = createEngine();

// create two characters using the creator
const characterCreator = wyrmEngine.getCharacterCreator();
const kyle = characterCreator.createCharacter({
  name: 'Kyle',
  level: 10,
  type: CharacterTypeEnum.Strong,
  subtype: CharacterSubtypeEnum.Attacker,
});
const jenny = characterCreator.createCharacter({
  name: 'Jenny',
  level: 10,
  type: CharacterTypeEnum.Swift,
  subtype: CharacterSubtypeEnum.Balanced,
});

// form teams and build the encounter object
const teamA = [kyle];
const teamB = [jenny];
const encounter = wyrmEngine.createEncounter(teamA, teamB);

while (encounter.tick()) {
  // battle!
}

// print battle logs in human readable way
const logs = encounter.getEncounterLogs();
logs.forEach(l => console.log(l.message));
```

...and here is the example output:
```
=== Encounter summary ===
Round: 1
Round order:
	Jenny	teamB	HP: 38/38
	Kyle	teamA	HP: 38/38
Jenny's Attack hits Kyle for 14
Kyle current hp: 24
Kyle's Attack misses Jenny
=== Encounter summary ===
Round: 2
Round order:
	Jenny	teamB	HP: 38/38
	Kyle	teamA	HP: 24/38
Jenny's Attack hits Kyle for 14
Kyle current hp: 10
Kyle's Attack hits Jenny for 28
Jenny current hp: 10
=== Encounter summary ===
Round: 3
Round order:
	Kyle	teamA	HP: 10/38
	Jenny	teamB	HP: 10/38
Kyle's Attack hits Jenny for 28
Jenny current hp: -18
Jenny is dead!
teamA won the encounter!
```


