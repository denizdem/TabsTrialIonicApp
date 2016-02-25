var templateOfLoading = {template: '<ion-spinner></ion-spinner><br/>Yükleniyor...'};

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

function assert(condition, message) {
    if (!condition) {
        message = message || "Assertion failed";
        if (typeof Error !== "undefined") {
            throw new Error(message);
        }
        throw message; // Fallback
    }
}
function checkCourierOrderStateAndNavigate($state, order) {
  if (order == null)
  {
    $state.go('tab.order.notAssigned');
  }
  else
  {
    switch(order.Status)
    {
      case OrderStatusEnum.Received:
      case OrderStatusEnum.CancelRequested:
      case OrderStatusEnum.Canceled:
      case OrderStatusEnum.Delivered:
        assert(false, 'Unexpected order status: ' + order.Status);
        break;

      case OrderStatusEnum.CourierAssigned:
        $state.go('tab.order.courierAssigned');
        break;

      case OrderStatusEnum.CourierWithClient:
        $state.go('tab.order.courierWithClient');
        break;

      case OrderStatusEnum.CourierLeftClient:
        $state.go('tab.order.courierLeftClient');
        break;

      default:
        assert(false, 'Unknown order status: ' + order.Status);
        break;
    }
  }
}

angular.module('starter.controllers', [])

// .controller('ChatsCtrl', function($scope, Chats) {
//   // With the new view caching in Ionic, Controllers are only called
//   // when they are recreated or on app start, instead of every page change.
//   // To listen for when this page is active (for example, to refresh data),
//   // listen for the $ionicView.enter event:
//   //
//   //$scope.$on('$ionicView.enter', function(e) {
//   //});

//   $scope.chats = Chats.all();
//   $scope.remove = function(chat) {
//     Chats.remove(chat);
//   };
// })

// .controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
//   $scope.chat = Chats.get($stateParams.chatId);
// })

// .controller('AccountCtrl', function($scope) {
//   $scope.settings = {
//     enableFriends: true
//   };
// })

.controller('WelcomeCtrl', function($scope, $ionicLoading, $ionicHistory, $state, $http, $localstorage, LoginService, CourierService, OrderService, HttpHeaderService) {
  $scope.$on('$ionicView.enter', function(e) {
    
    $ionicHistory.clearHistory();
    $ionicHistory.nextViewOptions({
      disableBack: true
    });

    $ionicLoading.show(templateOfLoading);

    var credentials = LoginService.loadCredentials();
    var authToken = LoginService.loadAuthToken();
    if(authToken && credentials)
    {
      // We have saved token, try to directly get the courier in case it is cached
      // First, set the default auth headers
      HttpHeaderService.addDefaultAuthHeader(authToken);

      CourierService.getCourier().then(function(courier) {
        // resolve

        console.log('kurye alma basarili');

        // We have a courier. Check the order.
        if (courier.CurrentOrderId != null)
        {
          // Go ahead and check the order
          OrderService.getOrder().then(function(order) {
            // resolve

            $ionicLoading.hide();

            checkCourierOrderStateAndNavigate($state, order);
          }, function() {
            // reject

            // Do nothing
            $ionicLoading.hide();
          });
        }
        else
        {
          // There are no orders assigned to this courier.
          $ionicLoading.hide();
          $state.go('tab.order.notAssigned');
        }
      }, function() {
        // reject

        // getCourier has failed. Maybe auth token has expired. Request user to login again.
        console.log('kurye alma bararisiz');
        $ionicLoading.hide();
        $state.go('account.login');

        // LoginService.loginUser(credentials.UserName, credentials.Password).success(function(data) {
        //   // login also has failed
        //   $ionicLoading.hide();
        // }).error(function(data) {
        //   $ionicLoading.hide();
        //   $state.go('account.login');
        // });
      });
    }
    else
    {
      LoginService.logoutUser();

      $ionicLoading.hide();
      $state.go('account.login');
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
    $ionicHistory.nextViewOptions({
      disableBack: true
    });

    $ionicLoading.show(templateOfLoading);

    LoginService.loginUser($scope.data.userName, $scope.data.password).success(function(data) {
        // We have retrieved the user successfully. Go to the welcome page, and then redirect appropriately
        $ionicLoading.hide();
        $state.go('account.welcome');
    }).error(function(data) {
      $ionicLoading.hide();
      var alertPopup = $ionicPopup.alert({
          title: 'Sisteme girilemedi!',
          template: 'Girdiginiz bilgileri kontrol edin.'
      });
    });
  }
})

.controller('OrderNotAssignedCtrl', function($scope, $ionicPopup, $ionicHistory, $ionicLoading, $state, OrderService) {

  $scope.refresh = function() {

    $ionicLoading.show(templateOfLoading);

    OrderService.getOrder().then(function(order) {
      // resolve

      $ionicHistory.clearHistory();
      $ionicHistory.nextViewOptions({ disableBack: true });

      $ionicLoading.hide();

      checkCourierOrderStateAndNavigate($state, order);
    }, function() {
      // reject

      // Do nothing
      $ionicLoading.hide();
    });
  }
})

.controller('OrderCourierAssignedCtrl', function($scope, $ionicPopup, $ionicLoading, $ionicHistory, $state, OrderService) {

  $scope.$on('$ionicView.enter', function(e) {
    $scope.order = OrderService.getCurrentOrder();
  });

  $scope.isClientDetailsExpanded = true;
  $scope.isOpDetailsExpanded = false;

  $scope.arriveAtClient = function() {

    $ionicLoading.show(templateOfLoading);

    OrderService.updateOrderStateToCourierWithClient().then(function(order) {
      // resolve

      $ionicHistory.clearHistory();
      $ionicHistory.nextViewOptions({ disableBack: true });

      $ionicLoading.hide();

      checkCourierOrderStateAndNavigate($state, order);
    }, function(status) {
      // reject

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

.controller('OrderCourierWithClientCtrl', function($scope, $ionicPopup, $ionicLoading, $ionicHistory, $state, OrderService) {

  $scope.$on('$ionicView.enter', function(e) {
    $scope.order = OrderService.getCurrentOrder();
  });

  $scope.isClientDetailsExpanded = true;
  $scope.isOpDetailsExpanded = false;

  $scope.choosePackages = function() {

    $ionicLoading.show(templateOfLoading);

    // TODO: DenizDem - We would go to the package selection screen here, which we don't
    // have at the moment. For now, go ahead and switch to state to courierLeftClient
    OrderService.updateOrderStateToCourierLeftClient().then(function(order) {
      // resolve

      $ionicHistory.clearHistory();
      $ionicHistory.nextViewOptions({ disableBack: true });

      $ionicLoading.hide();

      checkCourierOrderStateAndNavigate($state, order);
    }, function(status) {
      // reject

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

.controller('OrderCourierLeftClientCtrl', function($scope, $ionicPopup, $ionicLoading, $ionicHistory, $state, OrderService) {

  $scope.$on('$ionicView.enter', function(e) {
    $scope.order = OrderService.getCurrentOrder();
  });

  $scope.isDeliveryDetailsExpanded = true;
  $scope.isClientDetailsExpanded = false;
  $scope.isOpDetailsExpanded = false;

  $scope.choosePaymentDetails = function() {

    $ionicLoading.show(templateOfLoading);

    // Get the latest payment methods
    var self = this;
    OrderService.refreshPaymentMethodsIfNecessary().then(function(paymentMethods) {
      // resolve

      $ionicLoading.hide();
      // Go to the payment details page
      var url = 'tab.order.paymentDetails/' + self.order.ProposedTotal + '/' + self.order.ProposedPaymentMethod.Id;
      $state.go('tab.order.paymentDetails', { proposedTotal: self.order.ProposedTotal, proposedPaymentMethodId: self.order.ProposedPaymentMethod });
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

.controller('OrderPaymentDetailsCtrl', function($scope, $ionicPopup, $ionicLoading, $ionicHistory, $state, OrderService) {

  $scope.$on('$ionicView.enter', function(e) {
    $scope.order = OrderService.getCurrentOrder();
  });

  $scope.order = OrderService.getCurrentOrder();
  // Reset payment variables to proposed ones
  $scope.order.Total = $scope.order.ProposedTotal;
  $scope.order.PaymentMethod = $scope.order.ProposedPaymentMethod;

  $scope.canEditPayment = false;

  $scope.toggleCanEdit = function() {
    $scope.canEditPayment = !$scope.canEditPayment;

    if (!$scope.canEditPayment) {
      $scope.order.Total = $scope.order.ProposedTotal;
      $scope.order.PaymentMethod = $scope.order.ProposedPaymentMethod;
    }
  },

  $scope.paymentMethodClicked = function() {
    if ($scope.canEditPayment)
      $state.go('tab.order.paymentMethod');
  },

  $scope.closePackage = function() {

    // Close the order
    var self = this;

    $ionicLoading.show(templateOfLoading);
    OrderService.updateOrderStateToDelivered().then(function(order) {
      // resolve

      $ionicLoading.hide();

      var alertPopup = $ionicPopup.alert({
        title: 'Sipariş başarıyla kapatıldı.',
        okText: 'Tamam'
      }).then(function() {
        // We redirect to welcome page, which would re-read the courier
        $state.go('account.welcome');
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

.controller('OrderPaymentMethodCtrl', function($scope, $ionicPopup, $ionicLoading, $ionicHistory, $state, OrderService) {

  $scope.$on('$ionicView.enter', function(e) {
    $scope.order = OrderService.getCurrentOrder();
    $scope.paymentMethods = OrderService.getPaymentMethods();
  });

  $scope.selectPaymentMethod = function(paymentMethodId) {

    for(var i = 0; i < $scope.paymentMethods.length; ++i) {
      if ($scope.paymentMethods[i].Id == paymentMethodId) {
        $scope.order.PaymentMethod = $scope.paymentMethods[i];
        break;
      }
    }

    // We have selected the new paymentMethod. Go back.
    $ionicHistory.goBack();
  },

  $scope.isPaymentMethodSelected = function(paymentMethodId) {
    return $scope.order.PaymentMethod.Id == paymentMethodId;
  }
})

.controller('AccountCtrl', function($scope, $ionicPopup, $ionicLoading, $ionicHistory, $state, CourierService, LoginService) {

  $scope.$on('$ionicView.enter', function(e) {
    $scope.courier = CourierService.getCurrentCourier();
  });

  $scope.logoutUser = function() {
    LoginService.logoutUser();

    $ionicHistory.clearHistory();
    $ionicHistory.nextViewOptions({ disableBack: true });

    $state.go('account.login');
  }
})

.controller('AccountHistoryCtrl', function($scope, $ionicPopup, $ionicLoading, $ionicHistory, $state, CourierService, LoginService) {

  $scope.$on('$ionicView.enter', function(e) {
    $scope.courier = CourierService.getCurrentCourier();
  });

  // TODO: DenizDem - Retrieve these from web api
  var testPackages = [
    { Id :1,
      
    },

    {
    }
  ];

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
          // your code
      }
  };

  $scope.logoutUser = function() {
    LoginService.logoutUser();

    $ionicHistory.clearHistory();
    $ionicHistory.nextViewOptions({ disableBack: true });

    $state.go('account.login');
  }
})


;
