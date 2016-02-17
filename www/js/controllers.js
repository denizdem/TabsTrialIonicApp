var templateOfLoading = {template: '<ion-spinner></ion-spinner><br/>Yükleniyor...'};

angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope) {})

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
})

.controller('WelcomeCtrl', function($scope, $ionicLoading, $ionicHistory, $state, $http, LoginService) {
    //   $scope.$on('$ionicView.enter', function(e) {
    //     $ionicHistory.clearHistory();
    //     $ionicHistory.nextViewOptions({
    //       disableBack: true
    //     });

    //     $ionicLoading.show(templateOfLoading);

    //     var token = LoginService.loadToken();
    //     if(token) {
    //       $ionicLoading.hide();
    //       $state.go('tabs.dash');
    //         // var data = {
    //         //    phone: storedData.phone,
    //         //    password: storedData.password
    //         // }
    //         // getToken(data,$http,$scope,$ionicLoading,$localstorage,$state);
    //     }
    //     else {
    //       $ionicLoading.hide();
    //       $state.go('account.login');
    //     }
    // });
})

.controller('LoginCtrl', function($scope, LoginService, $ionicPopup, $state) {
  $scope.data = {};

  // TODO: !!!!!!! Test data
  $scope.data.userName = 'kurye@pratikkurye.com';
  $scope.data.password = '1234';

  $scope.login = function() {
      LoginService.loginUser($scope.data.userName, $scope.data.password).success(function(data) {
          $state.go('tab.dash');
      }).error(function(data) {
          var alertPopup = $ionicPopup.alert({
              title: 'Sisteme girilemedi!',
              template: 'Girdiginiz bilgileri kontrol edin!'
          });
      });
  }
});
