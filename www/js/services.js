angular.module('starter.services', [])

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'img/ben.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'img/max.png'
  }, {
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'img/adam.jpg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'img/perry.png'
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'img/mike.png'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
})

.factory('ConstantsService', function(WEB_API_BASE_TEST, WEB_API_BASE_PROD, WEB_API_BASE_LOCAL) {
  return {
    webApiBase : function() {
      return WEB_API_BASE_TEST;
    },
    webApiToken : function() {
      return this.webApiBase() + '/token';
    }
  }
})

// .factory('StorageService', function() {
//   return {
//     saveToPath: function(path, data) {
//       window.localStorage.setItem(path, data);
//     },

//     loadFromPath: function(path) {
//       return window.localStorage.getItem(path);
//     },

//     deletePath: function(path) {
//       window.localStorage.removeItem(path);
//     }
//   }
// })

.factory('$localstorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      var json =  JSON.stringify(value);
      $window.localStorage[key] = json;
    },
    getObject: function(key) {
      var obj = $window.localStorage[key];
      return JSON.parse(obj || null);
    },
    clear: function(key){
        $window.localStorage.removeItem(key);
    },
    clearAll: function(){
        $window.localStorage.clear();
    }
  }
}])

.factory('LoginService', function($q, $http, $localstorage, ConstantsService) {
    var CREDENTIALS_KEY = "CREDENTIALS";
    var TOKEN_KEY = "USERTOKEN";

    return {

      /////////////////////////////////////////////////
      saveCredentials: function(userName, password) {
        $localstorage.setObject(CREDENTIALS_KEY, {UserName: userName, Password: password});
      },

      /////////////////////////////////////////////////
      loadCredentials: function() {
        return $localstorage.getObject(CREDENTIALS_KEY);
      },

      /////////////////////////////////////////////////
      deleteCredentials: function() {
        $localstorage.clear(CREDENTIALS_KEY);
      },

      /////////////////////////////////////////////////
      saveToken: function(token) {
        $localstorage.setObject(TOKEN_KEY, token);
      },

      /////////////////////////////////////////////////
      loadToken: function() {
        return $localstorage.getObject(TOKEN_KEY);
      },

      /////////////////////////////////////////////////
      deleteToken: function() {
        $localstorage.clear(TOKEN_KEY);
      },

      /////////////////////////////////////////////////
      loginUser: function(userName, password) {

        var self = this;
        var deferred = $q.defer();

        return $http.post(ConstantsService.webApiToken(), {Email: userName, Password: password}, {headers:{'Content-Type':'application/json'}}).success(function(data, status, headers, config) {
            console.log('basarili');

            // Save the credentials for future
            self.saveCredentials(userName, password);

            // Save the token as well
            self.saveToken(data);

            deferred.resolve(data);
          }).error(function(data, status, headers, config) {
            console.log('basarisiz');

            // Clean up the token and the credentials
            self.deleteToken();
            self.deleteCredentials();

            deferred.reject(data);
          });
      }
    }
});
