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
* can be used in real-time and round based mode,
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

## Usage
To create an ecounter, you first need to prepare battleground, which includes defining characters and sides of conflict.
After obtaining the encounter object you control when is the right time to trigger next round.

The outcome of using wyrm-engine are events (messages) produces during the battle simulation.
They can be used to inform game users about the current state of encounter so they can decide about their next steps.
Output from the engine can also be used to update game internal state, for example HP of game characters.

### Creating engine
The first step is to create wyrm-engine instance, which can be done in this way:
```typescript
import { createEngine } from 'wyrm-engine';

const wyrmEngine = createEngine();
```

The engine instance created using `createEngine` is configured to use the default engine parameters,
tuned to give balanced chance to win for characters on the same level with different sets of stats.
For more details about creating engine with custom parameters, see the [Customising Engine](#customising-engine) section.

### Modeling characters
The simplest way to create a character is to use `CharacterCreator` which can be obtained from the engine instance:
```typescript
const wyrmEngine = createEngine();
const characterCreator = wyrmEngine.getCharacterCreator();
```

There are several ways of using the creator:
```typescript
// creates AI character using predefined template
const kyle: ICharacter = characterCreator.createCharacter({
  name: 'Kyle',
  level: 10,
  type: CharacterTypeEnum.Strong,
  subtype: CharacterSubtypeEnum.Balanced,
});

// creates human controled character using predefined template
const jenny: ICharacter = characterCreator.createCharacter({
  name: 'Jenny',
  level: 10,
  type: CharacterTypeEnum.Swift,
  subtype: CharacterSubtypeEnum.Attacker,
  autoControl: false
});
```

`createCharacter` uses following parameters:

| Name                | Description                                                                                                                     |
|:-------------------:|---------------------------------------------------------------------------------------------------------------------------------|
| `name`              | (optional) A human-readable name of a character, will be used in battle event messages                                          |
| `level`             | Defines general battle proficiency, higher level means more stats points to distribute                                          |
| `type`              | Allows to choose a stats profile. Available values are:                                                                         |
|                     | * `Strong` - prioritise adding stats points to power                                                                            |
|                     | * `Swift` - prioritise adding stats points to dexterity                                                                         |
|                     | * `Strong` - prioritise adding stats points to stamina                                                                          |
|	              | For more info about stats (attributes) see [Stats description](#stats-description)                                              |
| `subtype`           | (optional) Customize damage / armor profile. Available values are:                                                              |
|                     | * `Attacker` - prioritise character damage over armor                                                                           |
|                     | * `Balanced` - balance damage and armor                                                                                         |
|                     | * `Defender` - prioritise character armor over damage                                                                           |
|                     | The default value is `Balanced`. For more info check [Damage and armor](#damage-and-armor)                                      |
| `autoControl`       | (optional) Should the AI controller be generated for the charater?                                                              |
| `overrideCharacter` | (optional) Specify character properties defined in [Character model description](#character-model-description) to override them |


#### Character model description

The character model used in wyrm-engine includes the folowing parameters:
* `id` - this field is used to keep track of a chracter, the id will be returned along with encounter events later,
* `name` - optional, human-readable name, define it to get more user-friendly log messages,
* `level` - level of a character, determines the number of available stats points,
* `stats` - stats used to determine battle potential of a player, see [Stats](#stats) for more details,
* `currentHp` - number of actual hit points, determines vitality,
* `maxHp` - maximum allowed hit points,
* `actions` - an array of moves which can be performed during a battle, see [Actions](#actions) for more details,
* `controllerCallback` - a function which will be invoked before each round to determine which action should be chosed, see [Controling characters](#controling-characters)


### Stats

### Actions




## Controling characters


## Customising engine
