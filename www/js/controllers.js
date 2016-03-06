var templateOfLoading = {template: '<ion-spinner></ion-spinner><br/>Yükleniyor...'};

  // TODO: DenizDem - Retrieve these from web api

  var testOperator = {
    Id: 3,
    Name: 'DevranTest',
    Surname: 'KaramanTest',
    Phone: '(123)4567890',
    Phone2: '(321)4567890',
    FullName: 'DevranTest KaramanTest'
  };

  var testOperator2 = {
    Id: 5,
    Name: 'OpTest',
    Surname: 'OpSurTest',
    Phone: '(123)0987654',
    Phone2: '(321)0987654',
    FullName: 'OpTest OpSurTest'
  };

  var testClient = {
    Id: 101,
    Name: 'Demo1',
    FullName: 'Demo1 A.S.',
    Phone: '(890)1234567',
    Phone2: '(890)7654321',
    Phone3: '(098)1234567',
    Address: 'Demo Address',
    AddressDescription: 'Adres tarifi for Demo1 restaurant',
    ContactName: 'Ali',
    ContactPhone: '(345)1267890'
  };

  var testClient = {
    Id: 102,
    Name: 'Demo2',
    FullName: 'Demo2 A.S.',
    Phone: '(890)1234567',
    Phone2: '(890)7654321',
    Phone3: '(098)1234567',
    Address: 'Demo Address2',
    AddressDescription: 'Adres tarifi for Demo2 restaurant',
    ContactName: 'Veli',
    ContactPhone: '(543)1267890'
  };

  var testPackages = [{
    Id: 1,
    EntryDate: new Date(),
    ClientArrivalDate: new Date(),
    ClientDepartureDate: new Date(),
    ProposedTotal: 15.15,
    Total: 16.16,
    ProposedPaymentMethod: { Id: 1, Name: 'Nakit'},
    PaymentMethod: { Id: 2, Name: 'Kredi Karti'},
    DeliveryAddress: 'Flan filan adresi. Sekizinci kat.',
    ClientNotes: 'Notes client has entered for the order.',
    Operator: testOperator,
    Client: testClient,
    EndUserPhone: '(098)7654321'
  },{
    Id: 2,
    EntryDate: new Date(),
    ClientArrivalDate: new Date(),
    ClientDepartureDate: new Date(),
    ProposedTotal: 23.23,
    Total: 22.22,
    ProposedPaymentMethod: { Id: 2, Name: 'Kredi Karti'},
    PaymentMethod: { Id: 1, Name: 'Nakit'},
    DeliveryAddress: 'Adres 2.',
    ClientNotes: 'Notes2 client has entered for the order.',
    Operator: testOperator2,
    Client: testClient,
    EndUserPhone: '(098)7654321'
  }];


// IMPORTANT: Until we figure out a better way to do this, keep this enum in sync
// with the enums on the server.
var OrderStatusEnum = {
  Received: 0,
  CancelRequested: 1,
  Canceled: 2,
  CourierAssigned: 3,
  CourierWithClient: 4,
  CourierLeftClient: 5,
  Delivered: 6,
};

var PackageStatusEnum = {
  NotAssigned: 1,
  Assigned: 2,
  OutForDelivery: 3,
  Delivered: 4,
  CancelRequested: 5,
  Canceled: 6,
};

function assert(condition, message) {
    if (!condition) {
        message = message || "Assertion failed";
        if (typeof Error !== "undefined") {
            throw new Error(message);
        }
        throw message; // Fallback
    }
}
function checkCourierOrderStateAndNavigate($state, $rootScope) {
  assert($rootScope.courier != null, 'We should have set a courier before asking for its state');
  if ($rootScope.courier.Order == null)
  {
    $state.go('app.order.notAssigned');
  }
  else
  {
    switch($rootScope.courier.Order.Status)
    {
      case OrderStatusEnum.Received:
      case OrderStatusEnum.CancelRequested:
      case OrderStatusEnum.Canceled:
      case OrderStatusEnum.Delivered:
        assert(false, 'Unexpected order status: ' + $rootScope.courier.Order.Status);
        break;

      case OrderStatusEnum.CourierAssigned:
        $state.go('app.order.courierAssigned');
        break;

      case OrderStatusEnum.CourierWithClient:
        $state.go('app.order.courierWithClient');
        break;

      case OrderStatusEnum.CourierLeftClient:
        $state.go('app.order.courierLeftClient');
        break;

      default:
        assert(false, 'Unknown order status: ' + $rootScope.courier.Order.Status);
        break;
    }
  }
}

function checkIfCanDeliverPackage(package) {
  // Allow only packages with status Assigned or OutForDelivery to be shown
  return ((package.Status == PackageStatusEnum.Assigned) || (package.Status == PackageStatusEnum.OutForDelivery));
}

angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $rootScope, $state, $ionicHistory, CourierService) {

  $scope.logout = function() {
    CourierService.logoutCourier($rootScope);

    $ionicHistory.clearHistory();
    $ionicHistory.nextViewOptions({disableBack: true});

    $state.go('welcome.login');
  };

})

.controller('RedirectCtrl', function($rootScope, $scope, $ionicLoading, $ionicHistory, $state, $http, $localstorage, LoginService, CourierService, HttpHeaderService) {
  $scope.$on('$ionicView.enter', function(e) {
    
    $ionicHistory.clearHistory();
    $ionicHistory.nextViewOptions({
      disableBack: true
    });

    // Clear the current courier from the root scope
    $rootScope.courier = null;
    $ionicLoading.show(templateOfLoading);

    var credentials = LoginService.loadCredentials();
    var authToken = LoginService.loadAuthToken();
    if(authToken && credentials)
    {
      // We have saved token, try to directly get the courier in case it is cached
      // First, set the default auth headers
      HttpHeaderService.addDefaultAuthHeader(authToken);

      CourierService.getCourier($rootScope).then(function(courier) {
        // resolve

        console.log('kurye alma basarili');
        $ionicHistory.clearHistory();
        $ionicHistory.nextViewOptions({disableBack: true});

        $ionicLoading.hide();

        checkCourierOrderStateAndNavigate($state, $rootScope, false);
      }, function() {
        // reject

        // getCourier has failed. Maybe auth token has expired. Request user to login again.
        console.log('kurye alma bararisiz');
        $ionicHistory.clearHistory();
        $ionicHistory.nextViewOptions({disableBack: true});

        $ionicLoading.hide();

        $state.go('welcome.login');
      });
    }
    else
    {
      CourierService.logoutCourier($rootScope);

      $ionicHistory.clearHistory();
      $ionicHistory.nextViewOptions({disableBack: true});

      $ionicLoading.hide();

      $state.go('welcome.login');
    }
  });

})

.controller('LoginCtrl', function($scope, $ionicLoading, $ionicHistory, LoginService, $ionicPopup, $state) {
  $scope.data = {};

  // TODO: !!!!!!! Test data
  $scope.data.userName = 'kurye@pratikkurye.com';
  $scope.data.password = '1234';

  $scope.login = function() {

    $ionicHistory.clearHistory();
    $ionicHistory.nextViewOptions({disableBack: true});

    $ionicLoading.show(templateOfLoading);

    LoginService.loginUser($scope.data.userName, $scope.data.password).success(function(data) {
        // We have retrieved the user successfully. Go to the welcome page, and then redirect appropriately
        $ionicHistory.clearHistory();
        $ionicHistory.nextViewOptions({disableBack: true});

        $ionicLoading.hide();

        $state.go('welcome.redirect');
    }).error(function(data, status, headers) {
      $ionicLoading.hide();
      var alertPopup = $ionicPopup.alert({
          title: 'Sisteme girilemedi!',
          template: 'Girdiginiz bilgileri kontrol edin. Status: ' + String(status) + '. Headers:' + String(headers)
      });
    });
  }
})

.controller('OrderNotAssignedCtrl', function($rootScope, $scope, $ionicPopup, $ionicHistory, $ionicLoading, $state, CourierService) {

  $scope.refresh = function() {

    $ionicLoading.show(templateOfLoading);

    CourierService.getCourier($rootScope).then(function(courier) {
      // resolve

      console.log('kurye alma basarili');
      $ionicHistory.clearHistory();
      $ionicHistory.nextViewOptions({disableBack: true});

      $ionicLoading.hide();

      checkCourierOrderStateAndNavigate($state, $rootScope, false);
    }, function() {
      // reject

      // getCourier has failed. Maybe auth token has expired. Request user to login again.
      console.log('kurye alma bararisiz');
      $ionicHistory.clearHistory();
      $ionicHistory.nextViewOptions({disableBack: true});

      $ionicLoading.hide();

      $state.go('account.login');
    });

  }
})

.controller('OrderCourierAssignedCtrl', function($rootScope, $scope, $ionicPopup, $ionicLoading, $ionicHistory, $state, OrderService) {

  $scope.isClientDetailsExpanded = true;
  $scope.isOpDetailsExpanded = false;

  $scope.arriveAtClient = function() {

    $ionicLoading.show(templateOfLoading);

    OrderService.updateOrderStateToCourierWithClient($rootScope).then(function(order) {
      // resolve

      $ionicHistory.clearHistory();
      $ionicHistory.nextViewOptions({ disableBack: true });

      $ionicLoading.hide();

      checkCourierOrderStateAndNavigate($state, $rootScope, false);
    }, function(status) {
      // reject

      $ionicLoading.hide();

      var alertPopup = $ionicPopup.alert({
        title: 'Bir hata oluştu.',
        template: 'Hata: ' + status
      });

    });
  },

  $scope.toggleOpDetailsExpanded = function() {
    $scope.isOpDetailsExpanded = !$scope.isOpDetailsExpanded;
  },
  
  $scope.toggleClientDetailsExpanded = function() {
    $scope.isClientDetailsExpanded = !$scope.isClientDetailsExpanded;
  }

})

.controller('OrderCourierWithClientCtrl', function($scope, $ionicPopup, $ionicLoading, $ionicHistory, $state, $stateParams, OrderService, PackageService) {

  $scope.currentPackages = [];

  $scope.$on('$ionicView.enter', function(e) {

    // Go ahead and retrieve all of the open packages of this client if we need to
    // Check if the current order still has the same orderId as the stored packages. If not,
    // they are probably stale, so re-check them.
    var shouldRetrievePackages = true;
    if ($scope.currentPackages.length == 0)
      shouldRetrievePackages = true;
    else if ($stateParams.keepPackages)
      shouldRetrievePackages = false;

    if (shouldRetrievePackages) {
      $scope.refreshCurrentPackages();
    }
  });

  $scope.getIndexOfSelectedPackage = function(package) {

    for (var i = 0; i < $scope.currentPackages.length; ++i) {
      if ($scope.currentPackages[i].Id == package.Id)
        return i;
    }

    return -1;
  },

  $scope.isPackageSelected = function(package) {
    return ($scope.getIndexOfSelectedPackage(package) != -1)
  },

  $scope.packageHeaderClicked = function(package) {
    $scope.togglePackageSelectedState(package);
  },

  $scope.togglePackageSelectedState = function(package) {
    var index = $scope.getIndexOfSelectedPackage(package);
    if (index != -1)
      $scope.currentPackages.splice(index, 1)
    else
      $scope.currentPackages.push(package);

    assert($scope.currentPackages.length >= 0, 'Number of selected packages cannot drop below 0');
  },

  $scope.refreshCurrentPackages = function() {

    // Reset vars
    $scope.currentPackages = [];
    if ($scope.packages) {
      for (var i = 0, len = $scope.packages.length; i < len; ++i) {
        $scope.packages[i].isLocallySelected = false;
      }
    }

    $ionicLoading.show(templateOfLoading);

    PackageService.getAllClientPackages().then(function(packages) {
      // Store the list of current pacakges
      $scope.packages = packages;
      $ionicLoading.hide();
    }, function(status) {
      // reject

      $ionicLoading.hide();

      var alertPopup = $ionicPopup.alert({
        title: 'Bir hata oluştu.',
        template: 'Hata: ' + status
      });
    });
  },

  $scope.advanceToVerifyPackages = function() {

    assert($scope.currentPackages.length > 0, 'We should have chosen at least one package before allowing the click.');

    var chosenPackagesString = JSON.stringify($scope.currentPackages);
    $state.go('app.order.verifyChosenOrderPackages', { chosenPackagesJson: chosenPackagesString});

  }

})

.controller('OrderVerifyChosenOrderPackagesCtrl', function($rootScope, $scope, $ionicPopup, $ionicLoading, $ionicHistory, $state, $stateParams, OrderService, PackageService) {

  $scope.packages = JSON.parse($stateParams.chosenPackagesJson || null);
  assert($scope.packages.length > 0, 'We should have chosen at least some packages.');

  $scope.isPackageSelected = function(package) {
    return true;
  },

  $scope.chosePackagesAgain = function() {
    $state.go('app.order.courierWithClient', {keepPackages: true});
  },

  $scope.advanceToOutForDelivery = function() {

    $ionicLoading.show(templateOfLoading);

    // TODO: DenizDem - Go ahead and update the order with the chosen packages $scope.packages
    PackageService.assignPackagesToOrder($rootScope, $scope.packages).then(function(packages) {

      // TODO: DenizDem - updateOrderStateToCourierLeftClient needs to be called seperately then assignPackagesToOrder
      // and that is bad. In case of any failure in the second, we are left in a bad state with no way out,
      // where packages are assigned to an order but courier can't leave the client because he can't
      // choose packages the next time. Talk to Altinok and fix this.
      OrderService.updateOrderStateToCourierLeftClient($rootScope).then(function(order) {
        $ionicHistory.clearHistory();
        $ionicHistory.nextViewOptions({ disableBack: true });

        $ionicLoading.hide();

        $state.go('app.order.courierLeftClient');
      }, function(status) {
        $ionicLoading.hide();

        var alertPopup = $ionicPopup.alert({
          title: 'Kritik hata oluştu!',
          template: 'Hata: ' + status
        });
      });

    }, function(status) {
      var alertPopup = $ionicPopup.alert({
        title: 'Bir hata oluştu.',
        template: 'Hata: ' + status
      });
    });
  }

})

.controller('OrderCourierLeftClientCtrl', function($rootScope, $scope, $ionicPopup, $ionicLoading, $ionicHistory, $state, $stateParams, OrderService, PackageService) {

  $scope.countOfDeliverablePackages = function() {
    var count = 0;

    for (var i = 0; i < $rootScope.courier.Order.Packages.length; ++i) {
      var canDeliver = checkIfCanDeliverPackage($rootScope.courier.Order.Packages[i]);
      if (canDeliver)
        ++count;
    }

    return count;
  },

  $scope.canDeliverPackage = function(packageId) {
    for (var i = 0; i < $rootScope.courier.Order.Packages.length; ++i) {
      if ($rootScope.courier.Order.Packages[i].Id == packageId) {
        var canDeliver = checkIfCanDeliverPackage($rootScope.courier.Order.Packages[i]);
        return canDeliver;
      }
    }

    return false;
  },

  $scope.packageClicked = function(package) {

    var packageString = JSON.stringify(package);
    $state.go('app.order.deliverPackage', { packageJson: packageString});

  }

})

.controller('OrderDeliverPackageCtrl', function($rootScope, $scope, $ionicPopup, $ionicLoading, $ionicHistory, $state, $stateParams, OrderService) {

  $scope.package = JSON.parse($stateParams.packageJson || null);

  $scope.isDeliveryDetailsExpanded = true;
  $scope.isClientDetailsExpanded = false;
  $scope.isOpDetailsExpanded = false;

  $scope.choosePaymentDetails = function() {

    $ionicLoading.show(templateOfLoading);

    // Get the latest payment methods
    OrderService.refreshPaymentMethodsIfNecessary().then(function(paymentMethods) {
      // resolve

      $ionicLoading.hide();

      // Go to the payment details page
      var packageString = JSON.stringify($scope.package);

      $state.go('app.order.paymentDetails', { packageJson: packageString, resetActuals: true, canEditPayment: false });
    }, function(status) {
      // reject

      $ionicLoading.hide();
      var alertPopup = $ionicPopup.alert({
        title: 'Ödeme tiplerini alırken hata oluştu.',
        template: 'Hata: ' + status
      });
    });
  },

  $scope.toggleOpDetailsExpanded = function() {
    $scope.isOpDetailsExpanded = !$scope.isOpDetailsExpanded;
  },

  $scope.toggleDeliveryDetailsExpanded = function() {
    $scope.isDeliveryDetailsExpanded = !$scope.isDeliveryDetailsExpanded;
  },

  $scope.toggleClientDetailsExpanded = function() {
    $scope.isClientDetailsExpanded = !$scope.isClientDetailsExpanded;
  }

})

.controller('OrderPaymentDetailsCtrl', function($rootScope, $scope, $ionicPopup, $ionicLoading, $ionicHistory, $state, $stateParams, PackageService) {


  $scope.$on('$ionicView.enter', function(e) {
    $scope.package = JSON.parse($stateParams.packageJson || null);

    $scope.canEditPayment = ($stateParams.canEditPayment == "true");

    // Reset payment variables to proposed ones
    if ($stateParams.resetActuals == 'true')
    {
      $scope.package.Total = $scope.package.ProposedTotal;
      $scope.package.PaymentMethod = $scope.package.ProposedPaymentMethod;
    }
  });

  $scope.toggleCanEdit = function() {
    $scope.canEditPayment = !$scope.canEditPayment;

    if (!$scope.canEditPayment) {
      $scope.package.Total = $scope.package.ProposedTotal;
      $scope.package.PaymentMethod = $scope.package.ProposedPaymentMethod;
    }
  },

  $scope.paymentMethodClicked = function() {
    if ($scope.canEditPayment)
    {
      var packageString = JSON.stringify($scope.package);
      $state.go('app.order.paymentMethod', { packageJson: packageString });
    }
  },

  $scope.closePackage = function() {

    // Close the package
    $ionicLoading.show(templateOfLoading);
    PackageService.updatePackageStageToDelivered($scope.package).then(function(package) {
      // resolve

      $scope.package = package;

      $ionicLoading.hide();

      var alertPopup = $ionicPopup.alert({
        title: 'Sipariş başarıyla kapatıldı.',
        okText: 'Tamam'
      }).then(function() {

        // Now go ahead and update the original package in the $rootScope
        var hasOtherPackages = false;
        for (var i = 0; i < $rootScope.courier.Order.Packages.length; ++i) {
          if ($rootScope.courier.Order.Packages[i].Id == $scope.package.Id) {
            $rootScope.courier.Order.Packages[i].Status = $scope.package.Status;
          } else if (checkIfCanDeliverPackage($rootScope.courier.Order.Packages[i])) {
            hasOtherPackages = true;
          }
        }

        $ionicHistory.clearHistory();
        $ionicHistory.nextViewOptions({ disableBack: true });

        if (hasOtherPackages) {
          // Has more packages, go to the proper state
          checkCourierOrderStateAndNavigate($state, $rootScope, true);
        } else {
          // No more packages, go to the welcome page
          $state.go('welcome.redirect');
        }
      });;
    }, function(status) {
      // reject

      $ionicLoading.hide();
      var alertPopup = $ionicPopup.alert({
        title: 'Sipariş kapatılırken hata oluştu.',
        template: 'Hata: ' + status
      });
    });
  }
})

.controller('OrderPaymentMethodCtrl', function($scope, $ionicPopup, $ionicLoading, $ionicHistory, $state, $stateParams, OrderService) {

  $scope.$on('$ionicView.enter', function(e) {
    $scope.package = JSON.parse($stateParams.packageJson || null);
    $scope.paymentMethods = OrderService.getPaymentMethods();
  });

  $scope.selectPaymentMethod = function(paymentMethodId) {

    for(var i = 0; i < $scope.paymentMethods.length; ++i) {
      if ($scope.paymentMethods[i].Id == paymentMethodId) {
        $scope.package.PaymentMethod = $scope.paymentMethods[i];
        break;
      }
    }

    // We have selected the new paymentMethod. Replace the package json and go back
    var packageString = JSON.stringify($scope.package);
    $ionicHistory.backView().stateParams = { packageJson: packageString, resetActuals: false, canEditPayment: true };
    $ionicHistory.goBack();
  },

  $scope.isPaymentMethodSelected = function(paymentMethodId) {
    return $scope.package.PaymentMethod.Id == paymentMethodId;
  }
})

.controller('AccountHistoryCtrl', function($scope, $ionicPopup, $ionicLoading, $ionicHistory, $state, PackageService) {

  $scope.packages = null;

  $scope.onezoneDatepicker = {
      date: new Date(),
      mondayFirst: true,
      // months: months,                    
      // daysOfTheWeek: daysOfTheWeek,     
      // startDate: startDate,             
      // endDate: endDate,                    
      // disablePastDays: false,
      // disableSwipe: false,
      // disableWeekend: false,
      // disableDates: disableDates,
      // disableDaysOfWeek: disableDaysOfWeek,
      // showDatepicker: false,
      // showTodayButton: true,
      // calendarMode: false,
      // hideCancelButton: false,
      // hideSetButton: false,
      // highlights: highlights,
      callback: function(value){
        $scope.retrievePackages(value);
      }
  };

  $scope.$on('$ionicView.enter', function(e) {
    if ($scope.packages == null)
      $scope.retrievePackages($scope.onezoneDatepicker.date);
  });

  $scope.retrievePackages = function(date) {
    $scope.packages = [];

    $ionicLoading.show(templateOfLoading);

    PackageService.getPastClientPackages(date).then(function(orders) {

      for (var i = 0; i < orders.length; ++i) {
        if (orders[i].Packages != null) {
          for (var j = 0; j < orders[i].Packages.length; ++j) {
            var package = orders[i].Packages[j];
            package.order = orders[i];
            $scope.packages.push(package);
          }
        }
      }
      $ionicLoading.hide();
    }, function(status) {
      // reject

      $ionicLoading.hide();

      var alertPopup = $ionicPopup.alert({
        title: 'Bir hata oluştu.',
        template: 'Hata: ' + status
      });
    });
  };

})


;
