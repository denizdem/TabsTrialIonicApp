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
    },
    webApiCourier : function() {
      return this.webApiBase() + '/courier';
    },
    webApiOrder : function() {
      return this.webApiCourier() + '/order';
    },
    webApiPaymentMethods : function() {
      return this.webApiBase() + '/paymentMethods';
    }
  }
})

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

.factory('HttpHeaderService', function($http, ConstantsService) {

  return {
    addDefaultAuthHeader: function(authToken) {
      $http.defaults.headers.common['Authorization'] = 'Baerer ' + authToken.Token;
    },
    removeDefaultAuthHeader: function() {
      $http.defaults.headers.common.Authorization = '';
    }
  }
})

.factory('LoginService', function($q, $http, $localstorage, ConstantsService, HttpHeaderService) {
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
      saveAuthToken: function(token) {
        $localstorage.setObject(TOKEN_KEY, token);
      },

      /////////////////////////////////////////////////
      loadAuthToken: function() {
        return $localstorage.getObject(TOKEN_KEY);
      },

      /////////////////////////////////////////////////
      deleteAuthToken: function() {
        $localstorage.clear(TOKEN_KEY);
      },

      /////////////////////////////////////////////////
      loginUser: function(userName, password) {

        var self = this;
        // var deferred = $q.defer();

        var postData = {Email: userName, Password: password};
        return $http.post(ConstantsService.webApiToken(), postData).success(function(data, status, headers, config) {
            console.log('basarili');

            // Save the credentials for future
            self.saveCredentials(userName, password);

            // Save the token as well
            self.saveAuthToken(data);

            // Add the newly retrieved user credentials for further
            HttpHeaderService.addDefaultAuthHeader(data);

            // deferred.resolve(data);
          }).error(function(data, status, headers, config) {
            console.log('basarisiz');

            // Clean up the token and the credentials
            self.deleteToken();
            self.deleteCredentials();

            // deferred.reject(data);
          });
      },

      /////////////////////////////////////////////////
      logoutUser: function() {
        // Don't delete credentials, so we can auto-fill it next time again
        // this.deleteCredentials();
        this.deleteAuthToken();

        HttpHeaderService.removeDefaultAuthHeader();

        // TODO: More cleanup about current user etc.
      }
    }
})

.factory('UserService', function($q) {

  var currentUser = null;

  return {

    /////////////////////////////////////////////////
    setAsCurrent: function(user) {
      currentUser = user;
      return user;
    },

    /////////////////////////////////////////////////
    getCurrent: function() {
      return user;
    }
  }
})

.factory('CourierService', function($q, $http, ConstantsService) {

  var self = this;
  var currentCourier = null;

  return {

    /////////////////////////////////////////////////
    getCurrentCourier: function() {
      return self.currentCourier;
    },

    /////////////////////////////////////////////////
    getCourier: function() {
      return $q(function(resolve, reject) {
        $http.get(ConstantsService.webApiCourier()).success(function(data, status, headers, config) {
          console.log(data);
          self.currentCourier = data;
          resolve(data);
        }).error(function(data, status, headers, config) {
          console.log(data);
          self.currentCourier = null;
          reject();
        });
      });
    }
  }
})

.factory('OrderService', function($q, $http, ConstantsService) {

  var self = this;
  var currentOrder = null;
  var paymentMethods = null;

  return {

    /////////////////////////////////////////////////
    getCurrentOrder: function() {
      return self.currentOrder;
    },

    /////////////////////////////////////////////////
    getPaymentMethods: function() {
      return self.paymentMethods;
    },

    /////////////////////////////////////////////////
    getOrder: function() {
      return $q(function(resolve, reject) {
        $http.get(ConstantsService.webApiOrder()).success(function(data, status, headers, config) {
          console.log(data);
          self.currentOrder = data;
          resolve(data);
        }).error(function(data, status, headers, config) {
          console.log(data);
          self.currentOrder = null;
          reject();
        });
      });
    },

    /////////////////////////////////////////////////
    refreshPaymentMethods: function() {
      return $q(function(resolve, reject) {
        $http.get(ConstantsService.webApiPaymentMethods()).success(function(data, status, headers, config) {
          console.log(data);
          self.paymentMethods = data;
          resolve(data);
        }).error(function(data, status, headers, config) {
          console.log(data);
          self.paymentMethods = null;
          reject();
        });
      });
    },

    /////////////////////////////////////////////////
    refreshPaymentMethodsIfNecessary: function() {
      return $q(function(resolve, reject) {
        if (self.paymentMethods != null)
        {
          resolve(self.paymentMethods);
        }
        else
        {
          $http.get(ConstantsService.webApiPaymentMethods()).success(function(data, status, headers, config) {
            console.log(data);
            self.paymentMethods = data;
            resolve(data);
          }).error(function(data, status, headers, config) {
            console.log(data);
            self.paymentMethods = null;
            reject(status);
          });
        }
      });
    },

    /////////////////////////////////////////////////
    updateOrderStateToCourierWithClient: function() {
      return $q(function(resolve, reject) {

        var postData = {OrderId: self.currentOrder.Id, Status: OrderStatusEnum.CourierWithClient};

        $http.post(ConstantsService.webApiOrder(), postData).success(function(data, status, headers, config) {
          console.log(data);
          // TODO: DenizDem - Should the request return the order again, so that we can be sure?
          self.currentOrder.Status = OrderStatusEnum.CourierWithClient;
          resolve(self.currentOrder);
        }).error(function(data, status, headers, config) {
          console.log(data);
          reject(status);
        });
      });
    },

    /////////////////////////////////////////////////
    updateOrderStateToCourierLeftClient: function() {
      return $q(function(resolve, reject) {

        var postData = {OrderId: self.currentOrder.Id, Status: OrderStatusEnum.CourierLeftClient};

        $http.post(ConstantsService.webApiOrder(), postData).success(function(data, status, headers, config) {
          console.log(data);
          // TODO: DenizDem - Should the request return the order again, so that we can be sure?
          self.currentOrder.Status = OrderStatusEnum.CourierLeftClient;
          resolve(self.currentOrder);
        }).error(function(data, status, headers, config) {
          console.log(data);
          reject(status);
        });
      });
    },

    /////////////////////////////////////////////////
    updateOrderStateToDelivered: function() {
      return $q(function(resolve, reject) {

        var postData = {
          OrderId: self.currentOrder.Id,
          Status: OrderStatusEnum.Delivered,
          Total: self.currentOrder.Total,
          PaymentMethodId: self.currentOrder.PaymentMethod.Id
        };

        $http.post(ConstantsService.webApiOrder(), postData).success(function(data, status, headers, config) {
          console.log(data);
          // TODO: DenizDem - Should the request return the order again, so that we can be sure?
          self.currentOrder.Status = OrderStatusEnum.Delivered;
          var resultOrder = self.currentOrder;
          self.currentOrder = null;
          resolve(resultOrder);
        }).error(function(data, status, headers, config) {
          console.log(data);
          reject(status);
        });
      });
    }

  }
})

.factory('PackageService', function($q, $http, ConstantsService) {

  var self = this;

  return {

    /////////////////////////////////////////////////
    getAllPackages: function(packages) { // TODO: DenizDem - Remove the parameter
      return $q(function(resolve, reject) {
        // TODO: DenizDem - Do the real call to get the packages
        setTimeout(function() {
          resolve(packages);
        }, 500);
      });
    }
  }
})

;
