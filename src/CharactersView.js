'use strict';

function CharactersView() {
  this._views = {};
}

CharactersView.prototype._visibleFeatures = [
  'name',
  'party',
  'initiative',
  'defense',
  'hp',
  'mp',
  'maxHp',
  'maxMp'
];

CharactersView.prototype.all = function () {
  return Object.keys(this._views).reduce(function (copy, id) {
    copy[id] = this._views[id];
    return copy;
  }.bind(this), {});
};

CharactersView.prototype.allFrom = function (party) {
  return Object.keys(this._views).reduce(function (copy, id) {
    if (this._views[id].party === party) {
      copy[id] = this._views[id];
    }
    return copy;
  }.bind(this), {});
};

CharactersView.prototype.get = function (id) {
  return this._views[id] || null;
};

CharactersView.prototype.set = function (characters) {
  this._views = Object.keys(characters).reduce(function (views, id) {
    views[id] = this._getViewFor(characters[id]);
    return views;
  }.bind(this), {});
};

CharactersView.prototype._getViewFor = function (character) {
  var view = {};
  // Usa la lista de características visibles y Object.defineProperty() para
  // devolver un objeto de JavaScript con las características visibles pero
  // no modificables.

  for (var obj in this._visibleFeatures){
    obj = this._visibleFeatures[obj];
    view[obj] = character.obj;
  }
  this._visibleFeatures.forEach(function(feature){
    Object.defineProperty(view, feature, {
      get: function () {  
        return character[feature];
        // ¿Cómo sería este getter para reflejar la propiedad del personaje?
      },
      set: function (value) {
        // ¿Y este setter para ignorar cualquier acción?
      },
      enumerable: true
    });
  
  });
  /*Object.defineProperty(view, 'name', {
    get: function () {  
      return character.name;
      // ¿Cómo sería este getter para reflejar la propiedad del personaje?
    },
    set: function (value) {
      // ¿Y este setter para ignorar cualquier acción?
    },
    enumerable: true
  });

  Object.defineProperty(view, 'party', {
    get: function () {
      return character.party;
      // ¿Cómo sería este getter para reflejar la propiedad del personaje?
    },
    set: function (value) {
      // ¿Y este setter para ignorar cualquier acción?
    },
    enumerable: true
  });

  Object.defineProperty(view, 'initiative', {
    get: function () {
      return character.initiative;
      // ¿Cómo sería este getter para reflejar la propiedad del personaje?
    },
    set: function (value) {
      // ¿Y este setter para ignorar cualquier acción?
    },
    enumerable: true 
  });

  Object.defineProperty(view, 'defense', {
    get: function () {
      return character.defense;
      // ¿Cómo sería este getter para reflejar la propiedad del personaje?
    },
    set: function (value) {
      // ¿Y este setter para ignorar cualquier acción?
    },
    enumerable: true
  });

  Object.defineProperty(view, 'hp', {
    get: function () {
      return character.hp;
      // ¿Cómo sería este getter para reflejar la propiedad del personaje?
    },
    set: function (value) {
      // ¿Y este setter para ignorar cualquier acción?
    },
    enumerable: true
  });

  Object.defineProperty(view, 'mp', {
    get: function () {
      return character.mp;
      // ¿Cómo sería este getter para reflejar la propiedad del personaje?
    },
    set: function (value) {  
      // ¿Y este setter para ignorar cualquier acción?
    },
    enumerable: true
  });

  Object.defineProperty(view, 'maxHp', {
    get: function () {
      return character.maxHp;
      // ¿Cómo sería este getter para reflejar la propiedad del personaje?
    },
    set: function (value) {
      // ¿Y este setter para ignorar cualquier acción?
    },
    enumerable: true
  });

  Object.defineProperty(view, 'maxMp', {
    get: function () {
      return character.maxMp;
      // ¿Cómo sería este getter para reflejar la propiedad del personaje?
    },
    set: function (value) {
      // ¿Y este setter para ignorar cualquier acción?
    },
    enumerable: true
  });*/
  return view;
  // Acuérdate de devolver el objeto.
};

module.exports = CharactersView;
