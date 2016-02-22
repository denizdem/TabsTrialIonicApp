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

.controller('OrderNotAssignedCtrl', function($scope, $ionicPopup, $ionicLoading, $state, OrderService) {

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

.controller('OrderCourierAssignedCtrl', function($scope, $ionicLoading, $ionicHistory, $state, OrderService) {

  $scope.$on('$ionicView.enter', function(e) {
    $scope.order = OrderService.getCurrentOrder();
  });

  $scope.isClientDetailsExpanded = true;
  $scope.isOpDetailsExpanded = false;

  $scope.arriveAtClient = function() {

    $ionicLoading.show(templateOfLoading);

    OrderService.updateOrderStateToCourierWithClientAsync().then(function(order) {
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

.controller('OrderCourierWithClientCtrl', function($scope, $ionicLoading, $ionicHistory, $state, OrderService) {

  $scope.$on('$ionicView.enter', function(e) {
    $scope.order = OrderService.getCurrentOrder();
  });

  $scope.isClientDetailsExpanded = true;
  $scope.isOpDetailsExpanded = false;

  $scope.arriveAtClient = function() {

    $ionicLoading.show(templateOfLoading);

    OrderService.updateOrderStateToCourierWithClientAsync().then(function(order) {
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


;
