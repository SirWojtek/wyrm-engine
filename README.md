# wyrm-engine
[![Build Status](https://travis-ci.com/SirWojtek/wyrm-engine.svg?branch=master)](https://travis-ci.com/SirWojtek/wyrm-engine)
[![codecov](https://codecov.io/gh/SirWojtek/wyrm-engine/branch/master/graph/badge.svg)](https://codecov.io/gh/SirWojtek/wyrm-engine)
![npm](https://img.shields.io/npm/v/wyrm-engine)


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

## Instalation
### Via npm
```
npm install wyrm-engine
```
### Via yarn
```
yarn wyrm-engine
```

## API docs
API documentation is available here: [Docs](https://wyrm-engine-docs.s3.eu-central-1.amazonaws.com/index.html)

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

#### `CharacterCreator.createCharacter`
This method is the simplest way of creating a character.
It automates stats generationm, provides actions and AI logic.

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
| `type`              | Allows to choose a stats profile. Available values are:<br>`Strong` - prioritise adding stats points to power <br>`Swift` - prioritise adding stats points to dexterity<br>`Tought` - prioritise adding stats points to stamina<br>For more info about stats (attributes) see [Stats description](#stats-description)                                              |
| `subtype`           | (optional) Customize damage / armor profile. Available values are:<br>`Attacker` - prioritise character damage over armor<br>`Balanced` - balance damage and armor<br>`Defender` - prioritise character armor over damage<br>The default value is `Balanced`. For more info check [Damage and armor](#damage-and-armor)                                      |
| `autoControl`       | (optional) Should the AI controller be generated for the charater?                                                              |
| `overrideCharacter` | (optional) Specify character properties defined in [Character model description](#character-model-description) to override them |

#### Manual character creation
If you find the standard method involving `createCharacter` unsufficient,
you can use other helper methods from `CharacterCreator` to achieve the goal.

```typescript
const level = 10;

// computes stats for the given character type and level
const stats = characterCreator.getStats({
  type: CharacterTypeEnum.Strong,
  level
});

// gets maxHp for the stats block
const maxHp = characterCreator.getMaxHp(stats);

// retrieve standard attack action
const attackAction = characterCreator.getAttackAction();

// manual character creation
const kyle: ICharacter = {
  id: 'kyle-id',
  level,
  stats,
  maxHp,
  // character with only half of its HP
  currentHp: maxHp / 2,
  actions: [
    attackAction,
    // additional character action
    {
      id: 'power-smash-id',
      name: 'Power Smash',
      damageModifiers: {
        addFactor: 10,
        multiplyFactor: 1
      }
    }
  ],
};
```

#### Character model description
The character model (`ICharacter`) used in wyrm-engine includes the folowing parameters:

| Name			| Description																		|
|:---------------------:|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| `id`			| this field is used to keep track of a chracter, the id will be returned along with encounter events later						|
| `name`		| (optional) human-readable name, define it to get more user-friendly log messages									|
| `level`		| level of a character, determines the number of available stats points											|
| `stats`		| stats used to determine battle potential of a player, see [Stats](#stats) for more details								|
| `currentHp`		| number of actual hit points, determines vitality													|
| `maxHp`		| maximum allowed hit points																|
| `actions`		| an array of moves which can be performed during a battle, see [Actions](#actions) for more details							|
| `controllerCallback`	| a function which will be invoked before each round to determine which action should be chosed, see [Controling characters](#controling-characters)	|

#### Stats
Stats describes attributes which define battle abilities of characters. Each attribute is responsible for the different set of skills:

##### Damage
* defines base damage of all attacks, for example damage of a welded weapon

##### Armor
* defines damage reduction, can be sum of armor values from character equipment

##### Power
* bonus damage for each hit
* higher values means better armor penetration, used to calculate damage reduction

##### Dexterity
* better chance to hit the target
* higher probability to dodge an attack
* more chance to attack before opponent in round

##### Stamina
* more hit points

#### Actions
Each character should have at least one action defined to be capable to fight during an encounter.
The below snippet illustrates how to define an action:
```typescript
const action: IAction = {
  id: 'some-action-id',
  name: 'Some action',  // optional
  damageModifiers: {
    addFactor: 10,
    multiplyFactor: 1
  }
};
```

The damage of an action is computed using the formula:
```
total_damage = action_multiply_factor * base_damage + action_add_factor
```

### Encounter
You can obtain an encounter object using a `wyrmEngine` instance. To create it,
you need to form teams containing characters.

```typescript
// creatiion of 1 vs. 1 encpunter
const encounter = wyrmEngine.createEncounter([ kyle ], [ jenny ]);

// creation of 2 vs. 2 encpunter
const encounter = wyrmEngine.createEncounter([ kyle, jenny ], [ coral, jeff ]);
```

`createEncounter` takes the following arguments:

| Name			| Description									|
|:---------------------:|-------------------------------------------------------------------------------|
| `team1`		| Array of characters defining the first of the conflict side 			|
| `team2`		| Array of characters defining the second of the conflict side 			|
| `logMessageCallback`	| (optional) Function which will be invoked if event occurs during the battle 	|

#### Ticks
Encounters in wyrm-engine are round based and the progress of the battle (simulating round).
The tasks performed during te one round of encounter:
1. Winner check
2. Determine order of the round, basing on the character stats
3. Trigger characters' `controllerCallback` for both parties to plan AI actions
4. For each of ordered characters perform an action and check for winner
Events, which occur during a round, are reported via return value and `logMessageCallback` if defined.

##### Round-based battles
To use wyrm-engine's encounter in the round-based systems, plug `tick` function as a callback for an event
which should advance a round:

```typescript
// TODO: improve

roundButton.onClick(() => {
  const roundMessages = encounter.tick();
  console.log(roundMessages);
);

actionButton.onClick((actionIndex) => {
  encounter.addAction(player.id, player.action[actionIndex]);
});
```
For more information about planning actions, see [Controling characters](#controling-characters).

##### Real-time battles
It is possible to use wyrm-engine in real-time battles. In order to achieve that,
invoke `tick` in the time-based loop:

```typescript
actionButton.onClick((actionIndex) => {
  encounter.addAction(player.id, player.action[actionIndex]);
});

// NOTE: this will be invoked in TICK_FOR_ROUND interval
function tickMain() {
  setTimeout(
    () => {
      const roundLogs = encounter.tick();
      console.log(roundLogs);
      tickMain();
    },
    TIME_FOR_ROUND
  );
}

tickMain();

```

#### Logs (events)
The best way to get know what is happening during the battle is to put your hands on the log messages.
The messages returned by wyrm-engine are always annotated with the round on which the event occurs
and a human readable text.

There are three ways to get battle logs:
1. Through `logMessageCallback` defined during the encounter creation. The callback will be invoked for each event independently.
2. By saving output from `tick()`. The returned array contains logs for the round currently performed.
3. By calling `getEncounterLogs` on the encounter instance. With this method you can get whole battle history.

##### Message types

| Name			| Description											|
|:---------------------:|-----------------------------------------------------------------------------------------------|
| Summary message	| Emitted at the beginning of each round, contains information about the round order		|
| Miss message		| Informs about character's attack that missed the opponent					|
| Hit message		| Informs about character's attack that hit the opponent, includes information about damage	|
| HP message 		| This message is emitted wheen one of characters HP changes, usually because of attack		|
| Death message		| Emitted when one of the player HP drops below 0						|
| Win message		| Informs that one of the team won the battle. This is always the last message emitted		|

### Controling characters
In wyrm-engine controlling a charater means scheduling an action for each encounter round.
There are two ways to apply an action to the player:

#### Manual control
In this method, you schedule an action before playing a round. After the round is ended,
you need to schedule action again.

```typescript
const [ action1, actions 2 ] = player.actions;

// schedules an action for 1st round
encounter.addAction(player.id, action1);

// play 1st round
encounter.tick();

// schedules an action for 2nd round
encounter.addAction(player.id, action2);

// play 2nd round
encounter.tick();
```

#### Automated control
If you want to automate action choosing so you don't need to schedule actions for each round,
you can add `controllerCallback` in character definition.
That callback will be invoked before each round to determine what character should do.

```typescript
const powerSmash: IAction = {
  id: 'power-smash-id',
  damageModifiers: {
    addFactor: 10,
    multiplyFactor: 1,
  },
};

const aiCharacter = characterCreator.createCharacter({
  type: CharacterTypeEnum.Strong,
  level: 10,
  overrideCharacter: {
    actions: [characterCreator.getAttackAction(), powerSmash],
    // NOTE: randomly pick between available actions
    controllerCallback: actions => actions[Math.round(2* Math.random())]
  },
});

wyrmEngine.createEncounter([ kyle ], [ aiCharacter ]);
```

## Customising engine
Work in progress :)

## Contact

Email: momatoku@gmail.com

Discord: SirWojtek#3331
