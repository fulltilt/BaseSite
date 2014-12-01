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

      // get all posts
      $scope.getPosts = function() {
        $http.get('/api/posts').success(function(data) {
          $scope.post = {};
          $cookieStore.remove('post');

          $scope.posts = data;
          $scope.listLength = $scope.posts.length;
          $scope.numberOfPages = Math.ceil($scope.posts.length / $scope.pageSize);

          // check to see if User has voted on these posts
          for (var i = 0; i < data.length; i++) {
            $scope.voteUpOn[i] = data[i].upVotes.indexOf($scope.user._id) !== -1;
            $scope.voteDownOn[i] = data[i].downVotes.indexOf($scope.user._id) !== -1;
          }
          
        }).error(function(data) {
            console.log('Get All Posts Error: ' + data);
          });
        };

      // get single post
      $scope.getPost = function(id) {
        $http.get('/api/posts/' + id.toString()).success(function(data) {
          $cookieStore.put('post', data);   // save the state of the Post in case user refreshes on individual Post page
          $scope.post = data;
        }).error(function(data) {
          console.log('Get Single Post Error: ' + data);
        });
      };

      // create new post
      $scope.createPost = function() {
        $http.post('/api/posts/new', { user: $scope.user.facebook.name, post: $scope.post }).success(function(data) {
          $scope.post = data;

          //$window.location.href = '/post/edit/' + data._id;  // this didn't work as for some reason $scope.path didn't update
          //$location.path('/post/edit/' + data._id);
          $location.path('/post/' + data._id);
        }).error(function(data) {
          console.log('Create Post Error: ' + data);
        });
      };

      // update post
      $scope.updatePost = function(id) {
        $http.post('/api/posts/' + id, $scope.post).success(function(data) {
          $scope.post = data;
          $scope.getPost(id);
        }).error(function(data) {
          console.log('Update Post Error: ' + data);
        });
      };

      // delete post
      $scope.deletePost = function(id) {
        $http.delete('/api/posts/' + id).success(function(data) {
          $scope.posts = data;
        }).error(function(data) {
          console.log('Delete Post Error: ' + data);
        });
      };

      $scope.getProfile = function() {
        if (!$scope.loggedIn) {}
      };

      $scope.showLogin = function(message) {
        $scope.loggingIn = true;
        $scope.message = message;
      };
    }]) //;
    .filter('startFrom', function() {
      return function(input, start) {
        start = +start; //parse to int
        return input.slice(start);
      };
    });
})();