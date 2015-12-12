angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, $http) {
  var httpConfig = { timeout: 1000 }

  $scope.things = [{
    label: "Garage Door",
    state: "unknown",
    init: function() {
      var self = this;
      var fetchState = function() {
        $http.post('http://garage:4000/digital_read/4', {}, httpConfig)
        .success(function(res) {
          if (res.value === 1) {
            self.state = "Open"
          } else if (res.value === 0) {
            self.state = "Closed"
          }
        })
        .error(function() {
          self.state = "unknown"
        })
      }
      fetchState();
      setInterval(fetchState, 5000);
    },
    toggle: function() {
      $http.post('http://garage:4000/digital_write/18/1', {}, httpConfig).success(function() {
        console.log('wrote 1');
        setTimeout(function() {
          $http.post('http://garage:4000/digital_write/18/0', {}, httpConfig).success(function() {
            console.log('wrote 0');
          })
          .error(function() {
            alert('failed to write 0! stuck in on position!')
          })
        }, 800)
      })
      .error(function() {
        alert('failed to write 1!')
      })
    }
  }];
})
