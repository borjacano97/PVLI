'use strict';

function TurnList() {

}

TurnList.prototype.reset = function (charactersById) {
  this._charactersById = charactersById;

  this._turnIndex = -1;
  this.turnNumber = 0;
  this.activeCharacterId = null;
  this.list = this._sortByInitiative();
};

TurnList.prototype.next = function () {
 /* var obj = {number: 0, party: null, activeCharacterId: null};
  for(var o in this._charactersById) {
    if (this._charactersById[o]._isDead === true){
      this.list.splice(o,1)
    }
  }

  this.turnNumber++;
  obj.number = this.turnNumber;
  if (this.list.length > 1)
    this.activeCharacterId = this.list[(this.turnNumber%this.list.length)-1];
  else 
    this.activeCharacterId =  this.list[0];
  obj.activeCharacterId = this.activeCharacterId;
  obj.party = this._charactersById[this.activeCharacterId].party;
  
  return obj;*/

  //Arriba nuestro codigo escrito, el que funciona lo escribieron David y Toni para su practica
  var i = this.turnNumber;
  var found = false;
  var len = this.list.length;
  this.turnNumber++;

  while(!found){
    i = (i % len);

    var aux = this._charactersById[this.list[i]].isDead();
    if (!aux){
      this.activeCharacterId = this.list[i];
      found = true;
    }
    i++;
  }

  var turn = {
    number: this.turnNumber,
    party: this._charactersById[this.activeCharacterId].party,
    activeCharacterId: this.activeCharacterId
  };

  return turn;
  // Haz que calcule el siguiente turno y devuelva el resultado
  // según la especificación. Recuerda que debe saltar los personajes
  // muertos.
};

TurnList.prototype._sortByInitiative = function () {
  var arr = [];
  var self = this;
  var aux = [];
  for(var o in this._charactersById) {
    aux.push(this._charactersById[o].initiative);
    arr.push(o);
  }
  return arr.sort(function(a,b){
    if(self._charactersById[a].initiative > self._charactersById[b].initiative)
      return -1;
    else if (self._charactersById[a].initiative < self._charactersById[b].initiative)
      return 1;
    else
      return 0;
  });
  // Utiliza la función Array.sort(). ¡No te implementes tu propia
  // función de ordenación!
};

module.exports = TurnList;
