// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'starter.constants'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.order', {
    url: '/order',
    abstract: true,
    views: {
      'tab-order': {
      templateUrl: 'templates/tab-order.html',
      }
    }
  })

  .state('tab.order.notAssigned', {
    url: '/notAssigned',
    views: {
      'tab-order-master': {
      templateUrl: 'templates/tab-order-notAssigned.html',
      controller: 'OrderNotAssignedCtrl'
      }
    }
  })

  .state('tab.order.courierAssigned', {
    url: '/courierAssigned',
    views: {
      'tab-order-master': {
      templateUrl: 'templates/tab-order-courierAssigned.html',
      controller: 'OrderCourierAssignedCtrl'
      }
    }
  })

  .state('tab.order.courierWithClient', {
    url: '/courierWithClient',
    views: {
      'tab-order-master': {
      templateUrl: 'templates/tab-order-courierWithClient.html',
      controller: 'OrderCourierWithClientCtrl'
      }
    }
  })

  .state('tab.order.courierLeftClient', {
    url: '/courierLeftClient',
    views: {
      'tab-order-master': {
      templateUrl: 'templates/tab-order-courierLeftClient.html',
      controller: 'OrderCourierLeftClientCtrl'
      }
    }
  })

  .state('tab.order.paymentDetails', {
    url: '/paymentDetails',
    params: { proposedTotal:null, proposedPaymentMethodId:null },
    views: {
      'tab-order-master': {
      templateUrl: 'templates/tab-order-paymentDetails.html',
      controller: 'OrderPaymentDetailsCtrl'
      }
    }
  })

  .state('tab.order.paymentMethod', {
    url: '/paymentMethod',
    views: {
      'tab-order-master': {
      templateUrl: 'templates/tab-order-paymentMethod.html',
      controller: 'OrderPaymentMethodCtrl'
      }
    }
  })

  // .state('tab.chats', {
  //     url: '/chats',
  //     views: {
  //       'tab-chats': {
  //         templateUrl: 'templates/tab-chats.html',
  //         controller: 'ChatsCtrl'
  //       }
  //     }
  //   })
  //   .state('tab.chat-detail', {
  //     url: '/chats/:chatId',
  //     views: {
  //       'tab-chats': {
  //         templateUrl: 'templates/chat-detail.html',
  //         controller: 'ChatDetailCtrl'
  //       }
  //     }
  //   })

  // .state('tab.account', {
  //   url: '/account',
  //   views: {
  //     'tab-account': {
  //       templateUrl: 'templates/tab-account.html',
  //       controller: 'AccountCtrl'
  //     }
  //   }
  // })

  .state('account', {
      url: '/account',
      abstract: true,
      templateUrl: 'templates/accountmaster.html'
    })

  .state('account.login', {
    url: '/login',
    views: {
      'menuContent': {
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
      }
    }
  })

  .state('account.welcome', {
    url: '/welcome',
    views: {
       'menuContent': {
          templateUrl: 'templates/welcome.html',
          controller: 'WelcomeCtrl'
      }
    }
  })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/account/welcome');

});
