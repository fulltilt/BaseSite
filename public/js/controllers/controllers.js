(function() {
  angular.module('BaseSite.controllers', ['ui.bootstrap'])
    .controller('mainController', ['$scope', '$http', '$window', '$location', '$cookieStore', 'limitToFilter', 'filterFilter', function($scope, $http, $window, $location, $cookieStore, limitToFilter, filterFilter) {
      $scope.loggedIn = false;  // determine if user is logged in
      $scope.post = $cookieStore.get('post');     // get state from cookie in case User refreshes on the individual Post page
      $scope.sub = $cookieStore.get('sub');     // get state from cookie in case User refreshes on the individual Post page
      
      // determine if a User is logged in
      $http.get('/api/userData').success(function(user) {
        if (user._id !== undefined) {
          $scope.loggedIn = true;
          $scope.user = user;
        }
      }).error(function(data) {
        console.log('IsLogged User Error: ' + data);
      });

    }]);
})();