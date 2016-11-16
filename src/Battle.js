'use strict';

var EventEmitter = require('events').EventEmitter;
var CharactersView = require('./CharactersView');
var OptionsStack = require('./OptionsStack');
var TurnList = require('./TurnList');
var Effect = require('./items').Effect;


var utils = require('./utils');
var listToMap = utils.listToMap;
var mapValues = utils.mapValues;

function Battle() {
  EventEmitter.call(this);
  this.histogram = {};
  this._grimoires = {};
  this._charactersById = {};
  this._turns = new TurnList();

  this.options = new OptionsStack();
  this.characters = new CharactersView();
}
Battle.prototype = Object.create(EventEmitter.prototype);
Battle.prototype.constructor = Battle;

Object.defineProperty(Battle.prototype, 'turnList', {
  get: function () {
    return this._turns ? this._turns.list : null;
  }
});

Battle.prototype.setup = function (parties) {
  this.histogram = {};
  this._grimoires = this._extractGrimoiresByParty(parties);
  this._charactersById = this._extractCharactersById(parties);
  this._states = this._resetStates(this._charactersById);
  this._turns.reset(this._charactersById);

  this.characters.set(this._charactersById);
  this.options.clear();
};

Battle.prototype.start = function () {
  this._inProgressAction = null;
  this._stopped = false;
  this.emit('start', this._getCharIdsByParty());
  this._nextTurn();
};

Battle.prototype.stop = function () {
  this._stopped = true;
};

Object.defineProperty(Battle.prototype, '_activeCharacter', {
  get: function () {
    return this._charactersById[this._turns.activeCharacterId];
  }
});

Battle.prototype._extractGrimoiresByParty = function (parties) {
  var grimoires = {};
  var partyIds = Object.keys(parties);
  partyIds.forEach(function (partyId) {
    var partyGrimoire = parties[partyId].grimoire || [];
    grimoires[partyId] = listToMap(partyGrimoire, useName);
  });
  return grimoires;

  function useName(scroll) {
    return scroll.name;
  }
};

Battle.prototype._extractCharactersById = function (parties) {
  var idCounters = {};
  var characters = [];
  var self = this;
  var partyIds = Object.keys(parties);
  partyIds.forEach(function (partyId) {
    var members = parties[partyId].members;
    assignParty(members, partyId);
    characters = characters.concat(members);
  });
  return listToMap(characters, useUniqueName);

  function assignParty(characters, party) {
    // Cambia la party de todos los personajes a la pasada como parámetro.
    for (var i = 0; i < characters.length; i++) {
      characters[i].party = party;
    }
   
  }

  function useUniqueName(character) {
    // Genera nombres únicos de acuerdo a las reglas
    // de generación de identificadores que encontrarás en
    // la descripción de la práctica o en la especificación.
    if(!self.histogram.hasOwnProperty(character.name)){
        self.histogram[character.name] = 0;
        self.histogram[character.name] ++;
        return character.name;
    }
	else{
		self.histogram[character.name] ++;
		return character.name + ' ' + (self.histogram[character.name]);
	}
  }
  
};

Battle.prototype._resetStates = function (charactersById) {
  return Object.keys(charactersById).reduce(function (map, charId) {
    map[charId] = {};
    return map;
  }, {});
};

Battle.prototype._getCharIdsByParty = function () {
  var charIdsByParty = {};
  var charactersById = this._charactersById;
  Object.keys(charactersById).forEach(function (charId) {
    var party = charactersById[charId].party;
    if (!charIdsByParty[party]) {
      charIdsByParty[party] = [];
    }
    charIdsByParty[party].push(charId);
  });
  return charIdsByParty;
};

Battle.prototype._nextTurn = function () {
  if (this._stopped) { return; }
  setTimeout(function () {
    var endOfBattle = this._checkEndOfBattle();
    if (endOfBattle) {
      this.emit('end', endOfBattle);
    } else {
      var turn = this._turns.next();
      this._showActions();
      this.emit('turn', turn);
    }
  }.bind(this), 0);
};

Battle.prototype._checkEndOfBattle = function () {
  var allCharacters = mapValues(this._charactersById);
  var aliveCharacters = allCharacters.filter(isAlive);
  var commonParty = getCommonParty(aliveCharacters);
  return commonParty ? { winner: commonParty } : null;

  function isAlive(character) {
    return !character.isDead();
  }

  function getCommonParty(characters) {
    // Devuelve la party que todos los personajes tienen en común o null en caso
    // de que no haya común.
    var comun = true;
    var firstTime = true;
    var party;
    for (var i = 0; i < characters.length; i++){
        if (firstTime){
          party = characters[i].party;
          firstTime = false;
        } 
        else {
          if (characters[i].party !== party){
            comun = false;
          }
        }
    }
    //console.log(party);
    if (!comun) { return null;  }
    else { return party }
  }
};

Battle.prototype._showActions = function () {
  this.options.current = {
    'attack': true,
    'defend': true,
    'cast': true
  };
  this.options.current.on('chose', this._onAction.bind(this));
};

Battle.prototype._onAction = function (action) {
  this._action = {
    action: action,
    activeCharacterId: this._turns.activeCharacterId
  };
  // Debe llamar al método para la acción correspondiente:
  // defend -> _defend; attack -> _attack; cast -> _cast
  switch (action){
    case 'defend':
      this.emit(this._action, this._defend());
      break;
    case 'attack':
      this.emit(this._action, this._attack());
      break;
    case 'cast':
      this.emit(this._action, this._cast());
      break;
  }
 
};

Battle.prototype._defend = function () {
  var activeCharacterId = this._action.activeCharacterId;
  var newDefense = this._improveDefense(activeCharacterId);
  this._action.targetId = this._action.activeCharacterId;
  this._action.newDefense = newDefense;
  this._executeAction();
};

Battle.prototype._improveDefense = function (targetId) {
  if (!this._states[targetId].defense){
  this._states[targetId].defense = this._charactersById[targetId].defense;
  }
   // Implementa la mejora de la defensa del personaje.
 var defense = this._charactersById[targetId].defense;
 defense = Math.ceil(defense * 1.1);
 this._charactersById[targetId].defense = defense;
  return (defense);
};

Battle.prototype._restoreDefense = function (targetId) {
  // Restaura la defensa del personaje a cómo estaba antes de mejorarla.
  // Puedes utilizar el atributo this._states[targetId] para llevar tracking
  // de las defensas originales.
  this._charactersById[targetId].defense = this._states[targetId].defense;

};

Battle.prototype._attack = function () {
  var self = this;
  self._showTargets(function onTarget(targetId) {
    // Implementa lo que pasa cuando se ha seleccionado el objetivo.
    var activeCharacterId = self._action.activeCharacterId;
    self._action.targetId = targetId;
    self._action.effect = self._charactersById[activeCharacterId].weapon.effect;
    self._executeAction();
    self._restoreDefense(targetId);
  });
};

Battle.prototype._cast = function () {
  var self = this;
  self._showScrolls(function onScroll(scrollId, scroll) {
    // Implementa lo que pasa cuando se ha seleccionado el hechizo.
    self._showTargets(function onTarget(targetId) {
    // Implementa lo que pasa cuando se ha seleccionado el objetivo.
    var activeCharacterId = self._action.activeCharacterId;
    self._action.targetId = targetId;
    self._action.scrollName = scrollId;
    self._action.effect = scroll.effect;
    self._charactersById[activeCharacterId].mp -= scroll.cost;
    self._executeAction();
    self._restoreDefense(targetId);
  });
  });
};

Battle.prototype._executeAction = function () {
  var action = this._action;
  var effect = this._action.effect || new Effect({});
  var activeCharacter = this._charactersById[action.activeCharacterId];
  var targetCharacter = this._charactersById[action.targetId];
  var areAllies = activeCharacter.party === targetCharacter.party;

  var wasSuccessful = targetCharacter.applyEffect(effect, areAllies);
  this._action.success = wasSuccessful;

  this._informAction();
  this._nextTurn();
};

Battle.prototype._informAction = function () {
  this.emit('info', this._action);
};

Battle.prototype._showTargets = function (onSelection) {
  // Toma ejemplo de la función ._showActions() para mostrar los identificadores
  // de los objetivos.
  var opt = {};
  for (var id in this._charactersById){
     if (this._charactersById[id].hp > 0){
        opt[id] = true;
     }
  }
  
  this.options.current = opt;
  this.options.current.on('chose', onSelection);
};

Battle.prototype._showScrolls = function (onSelection) {
  // Toma ejemplo de la función anterior para mostrar los hechizos. Estudia
  // bien qué parámetros se envían a los listener del evento chose.
  var party = this._charactersById[this._action.activeCharacterId].party;
  var opt = {};

  for (var id in this._grimoires[party]){
    if (this._charactersById[this._action.activeCharacterId].mp >= this._grimoires[party][id].cost){
     opt[id] = this._grimoires[party][id];
    }
  }
  this.options.current = opt;
  this.options.current.on('chose', onSelection);
};

module.exports = Battle;

