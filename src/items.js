'use strict';

function Item(name, effect) {
  this.name = name;
  this.effect = effect;
}

function Weapon(name, damage, extraEffect) {
  extraEffect = extraEffect || new Effect({});
  if (!extraEffect.hp){
    extraEffect.hp = damage * -1;
  }
  else{
    extraEffect.hp += damage * -1;
  }
  Item.call(this, name, extraEffect);
  
  // Haz que Weapon sea subtipo de Item haciendo que llame al constructor de
  // de Item.
}
Weapon.prototype = Object.create(Item.prototype);
Weapon.prototype.constructor = Weapon;
// Termina de implementar la herencia haciendo que la propiedad prototype de
// Item sea el prototipo de Weapon.prototype y recuerda ajustar el constructor.

function Scroll(name, cost, effect) {
  this.cost = cost;
  Item.call(this, name, effect);
  
}
Scroll.prototype = Object.create(Item.prototype);
Scroll.prototype.constructor = Scroll;

Scroll.prototype.canBeUsed = function (mp) {
  return (mp >= this.cost);
};

function Effect(variations) {
  variations = variations || {};

  this.initiative = variations.initiative || 0;
  this.defense = variations.defense || 0;
  this.hp = variations.hp || 0;
  this.maxHp = variations.maxHp || 0;
  this.mp = variations.mp || 0;
  this.maxMp = variations.maxMp || 0;
  // Copia las propiedades que se encuentran en variations como propiedades de
  // este objeto.
}

module.exports = {
  Item: Item,
  Weapon: Weapon,
  Scroll: Scroll,
  Effect: Effect
};
