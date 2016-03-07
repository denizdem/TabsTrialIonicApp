// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'starter.constants', 'onezone-datepicker'])

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

  $ionicPlatform.on('resume', function(){
      var alertPopup = $ionicPopup.alert({
          title: 'Resume!',
          template: 'Resume happened.'});
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/mainMenu.html',
    controller: 'AppCtrl'
  })

  ///////////////////// ORDER ////////////////////////////
  .state('app.order', {
    url: '/order',
    abstract: true,
    views: {
      'mainMenuContent': {
      templateUrl: 'templates/order.html',
      }
    }
  })

  .state('app.order.notAssigned', {
    url: '/notAssigned',
    views: {
      'orderContent': {
      templateUrl: 'templates/order-notAssigned.html',
      controller: 'OrderNotAssignedCtrl'
      }
    }
  })

  .state('app.order.courierAssigned', {
    url: '/courierAssigned',
    views: {
      'orderContent': {
      templateUrl: 'templates/order-courierAssigned.html',
      controller: 'OrderCourierAssignedCtrl'
      }
    }
  })

  .state('app.order.courierWithClient', {
    url: '/courierWithClient',
    views: {
      'orderContent': {
      templateUrl: 'templates/order-courierWithClient.html',
      controller: 'OrderCourierWithClientCtrl'
      }
    }
  })

  .state('app.order.verifyChosenOrderPackages', {
    url: '/verifyChoosenOrderPackages/:chosenPackagesJson',
    views: {
      'orderContent': {
      templateUrl: 'templates/order-verifyChoosenOrderPackages.html',
      controller: 'OrderVerifyChosenOrderPackagesCtrl'
      }
    }
  })

  .state('app.order.courierLeftClient', {
    url: '/courierLeftClient',
    views: {
      'orderContent': {
      templateUrl: 'templates/order-courierLeftClient.html',
      controller: 'OrderCourierLeftClientCtrl'
      }
    }
  })

  .state('app.order.deliverPackage', {
    url: '/deliverPackage/:packageJson',
    views: {
      'orderContent': {
      templateUrl: 'templates/order-deliverPackage.html',
      controller: 'OrderDeliverPackageCtrl'
      }
    }
  })

  .state('app.order.paymentDetails', {
    url: '/paymentDetails/:packageJson/:resetActuals/:canEditPayment',
    views: {
      'orderContent': {
      templateUrl: 'templates/order-paymentDetails.html',
      controller: 'OrderPaymentDetailsCtrl'
      }
    }
  })

  .state('app.order.paymentMethod', {
    url: '/paymentMethod/:packageJson',
    views: {
      'orderContent': {
      templateUrl: 'templates/order-paymentMethod.html',
      controller: 'OrderPaymentMethodCtrl'
      }
    }
  })

  ///////////////////// ACCOUNT ////////////////////////////
  .state('app.account', {
    url: '/account',
    abstract: true,
    views: {
      'mainMenuContent': {
      templateUrl: 'templates/account.html',
      }
    }
  })

  .state('app.account.history', {
    url: '/history',
    views: {
      'accountContent': {
      templateUrl: 'templates/account-history.html',
      controller: 'AccountHistoryCtrl'
      }
    }
  })

  ///////////////////// WELCOME ////////////////////////////
  .state('welcome', {
      url: '/welcome',
      abstract: true,
      templateUrl: 'templates/welcome.html'
    })

  .state('welcome.login', {
    url: '/login',
    views: {
      'welcomeContent': {
        templateUrl: 'templates/welcome-login.html',
        controller: 'LoginCtrl'
      }
    }
  })

  .state('welcome.loginDetails', {
    url: '/loginDetails',
    views: {
      'welcomeContent': {
        templateUrl: 'templates/welcome-loginDetails.html',
        controller: 'LoginDetailsCtrl'
      }
    }
  })

  .state('welcome.redirect', {
    url: '/redirect',
    views: {
       'welcomeContent': {
          templateUrl: 'templates/welcome-redirect.html',
          controller: 'RedirectCtrl'
      }
    }
  })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/welcome/redirect');

});
