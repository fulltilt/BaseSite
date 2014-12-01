(function() {
  angular.module('BaseSite.directives', [])
    .directive('igLogin', [function () {
      return {
        restrict: 'E',
        replace: true,
        templateUrl:'/partials/modal.html',
        controller: function ($scope) {
          $scope.cancel = function() {
            $scope.loggingIn = false;
            $("#loginModal").modal('hide');
          };
          
          $scope.$watch('loggingIn', function() {
            if ($scope.loggingIn) {
              $scope.loggingIn = false;
              $("#loginModal").modal('show');
            }
          });
        }
      };
    }])
    .directive('isValidSub', ['$http', function($http) {
      return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {
          function validate(value) {
            if (scope.subs && scope.subs.indexOf(ngModel.$viewValue) !== -1) {
              ngModel.$setValidity('unique', true);
            } else {
              ngModel.$setValidity('unique', false);
            }
          }

          $http.get('/api/subs').success(function(data) {
            var names = [];
            for (var index in data) {
              names.push(scope.subs[index].name);
            }
            scope.subs = names;
            validate(ngModel.$viewValue);
          });
          
          scope.$watch( function() {
            return ngModel.$viewValue;
          }, validate);
        }
      };
    }]);
})();