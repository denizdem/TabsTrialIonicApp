angular.module('starter.constants', [])

/*.constant('RESOURCES', (function() {
  var WEB_API_BASE_TEST = 'http://kuryes.azurewebsites.net/api';
  var WEB_API_BASE_PROD = 'http://pratikkurye.azurewebsites.net/api';
  var WEB_API_BASE_LOCAL = 'http://http://localhost:5000/api';

  return {
    WEB_API_BASE: 'http://kuryes.azurewebsites.net/api', //WEB_API_BASE_TEST,
    WEB_API_TOKEN: WEB_API_BASE + '/token'
  }
}))*/

.constant('WEB_API_BASE_TEST', 'http://kuryes.azurewebsites.net/api')
.constant('WEB_API_BASE_PROD', 'http://pratikkurye.azurewebsites.net/api')
.constant('WEB_API_BASE_LOCAL', 'http://http://localhost:5000/api')

.constant('AUTH_EVENTS', {
  notAuthenticated: 'auth-not-authenticated',
  notAuthorized: 'auth-not-authorized'
})

.constant('USER_ROLES', {
  admin: 'admin_role',
  public: 'public_role'
});
