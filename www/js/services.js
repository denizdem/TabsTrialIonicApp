angular.module('starter.services', [])

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
    webApiOrderPackage : function() {
      return this.webApiOrder() + '/package';
    },
    webApiOrderPackages : function() {
      return this.webApiOrder() + '/packages';
    },
    webApiClient : function() {
      return this.webApiCourier() + '/client';
    },
    webApiClientPackages : function() {
      return this.webApiClient() + '/packages';
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
      }

    }
})

// .factory('UserService', function($q) {

//   var currentUser = null;

//   return {

//     /////////////////////////////////////////////////
//     setAsCurrent: function(user) {
//       currentUser = user;
//       return user;
//     },

//     /////////////////////////////////////////////////
//     getCurrent: function() {
//       return user;
//     }
//   }
// })

.factory('CourierService', function($q, $http, ConstantsService, LoginService, HttpHeaderService) {

  return {

    /////////////////////////////////////////////////
    getCourier: function($rootScope) {
      // var scope = $rootScope;
      return $q(function(resolve, reject) {
        $http.get(ConstantsService.webApiCourier()).success(function(data, status, headers, config) {
          console.log(data);
          // Set this courier as the default courier for going forward, until logout
          $rootScope.courier = data;
          resolve(data);
        }).error(function(data, status, headers, config) {
          console.log(data);
          $rootScope.courier = null;
          reject();
        });
      });
    },

    /////////////////////////////////////////////////
    logoutCourier: function($rootScope) {
      // Don't delete credentials, so we can auto-fill it next time again
      LoginService.deleteAuthToken();

      HttpHeaderService.removeDefaultAuthHeader();

      // Clear the globally set courier
      $rootScope.courier = null;

      // TODO: More cleanup about current user etc.
    }
  }
})

.factory('OrderService', function($q, $http, ConstantsService) {

  var self = this;
  // TODO: DenizDem !!!!!!!!! Remove this
  var currentOrder = null;
  var paymentMethods = null;

  return {

    /////////////////////////////////////////////////
    getPaymentMethods: function() {
      return self.paymentMethods;
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
    updateOrderStateToCourierWithClient: function($rootScope) {
      return $q(function(resolve, reject) {

        var postData = OrderStatusEnum.CourierWithClient;

        $http.post(ConstantsService.webApiOrder(), postData).success(function(data, status, headers, config) {
          console.log(data);
          // TODO: DenizDem - Should the request return the order again, so that we can be sure?
          $rootScope.courier.Order.Status = OrderStatusEnum.CourierWithClient;
          resolve($rootScope.courier.Order);
        }).error(function(data, status, headers, config) {
          console.log(data);
          reject(status);
        });
      });
    },

    /////////////////////////////////////////////////
    updateOrderStateToCourierLeftClient: function($rootScope) {
      return $q(function(resolve, reject) {

        var postData = OrderStatusEnum.CourierLeftClient;

        $http.post(ConstantsService.webApiOrder(), postData).success(function(data, status, headers, config) {
          console.log(data);
          // TODO: DenizDem - Should the request return the order again, so that we can be sure?
          $rootScope.courier.Order.Status = OrderStatusEnum.CourierLeftClient;
          resolve($rootScope.courier.Order);
        }).error(function(data, status, headers, config) {
          console.log(data);
          reject(status);
        });
      });
    }

  }
})

.factory('PackageService', function($q, $http, ConstantsService) {

  return {

    /////////////////////////////////////////////////
    getAllClientPackages: function() {
      return $q(function(resolve, reject) {
        $http.get(ConstantsService.webApiClientPackages()).success(function(data, status, headers, config) {
          console.log(data);
          resolve(data);
        }).error(function(data, status, headers, config) {
          console.log(data);
          reject();
        });
      });
    },

    /////////////////////////////////////////////////
    updatePackageStageToDelivered: function(package) {

      var postData = {packageId: package.Id, status: PackageStatusEnum.Delivered, total: package.Total, paymentMethodId: package.PaymentMethod.Id};

      return $q(function(resolve, reject) {
        $http.post(ConstantsService.webApiOrderPackage(), postData).success(function(data, status, headers, config) {
          console.log(data);
          package.Status = PackageStatusEnum.Delivered;
          resolve(package);
        }).error(function(data, status, headers, config) {
          console.log(data);
          reject();
        });
      });
    },

    /////////////////////////////////////////////////
    assignPackagesToOrder: function($rootScope, packages) {

      assert(packages.length > 0 , 'There should be at least one package we are assigning to order');
      var postData = [];
      for (var i = 0; i < packages.length; ++i)
        postData.push(packages[i].Id);

      return $q(function(resolve, reject) {
        $http.post(ConstantsService.webApiOrderPackages(), postData).success(function(data, status, headers, config) {
          console.log(data);
          // Store the list of packages as the order packages of the current courier
          for (var i = 0; i < packages.length; ++i) {
            packages[i].Status = PackageStatusEnum.Assigned;
          }

          $rootScope.courier.Order.Packages = packages;

          resolve(packages);
        }).error(function(data, status, headers, config) {
          console.log(data);
          reject();
        });
      });
    }

  }
})

;
