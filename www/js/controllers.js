angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, $http) {

  $scope.things = [{
    label: "Garage Door",
    state: "unknown",
    init: function() {
      var self = this;
      console.log('inited');
      var fetchState = function() {
        $http.post('http://garage:4000/digital_read/4')
        .success(function(res) {
          if (res.value === 1) {
            self.state = "Open"
          } else if (res.value === 0) {
            self.state = "Closed"
          }
        })
      }
      fetchState();
      setInterval(fetchState, 5000);
    },
    toggle: function() {
      $http.post('http://garage:4000/digital_write/18/1').success(function() {
        console.log('wrote 1');
        setTimeout(function() {
          $http.post('http://garage:4000/digital_write/18/0').success(function() {
            console.log('wrote 0');
          })
        }, 800)
      })
    }
  }];
})
