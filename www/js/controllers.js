angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, $http, $ionicPopup, $ionicPlatform, $ionicModal, $sce) {
  var httpConfig = { timeout: 5000 }

  $scope.doRefresh = function() {
    $scope.things.forEach(function(thing) {
      if (thing.init && !thing.disabled) thing.init();
      setTimeout(function() {
        $scope.$broadcast('scroll.refreshComplete');
      }, 2000);
    });
  }

  $scope.things = [{
    label: "Camera: Entrance",
    state: "Last Event: unknown",
    init: function() {
      var self = this;
      var src = self.imgSrc;
      $scope.events = [];
      self.imgSrc = ''; // for refresh purposes
      self.imgSrc = "http://camera:8080/";
      $http.get("http://lab:8000/movies").success(function(events) {
        if (events.length) {
          events.forEach(function(m) {
            $scope.events.push({
              time: new Date(m.time).toLocaleString(),
              url: "http://lab:8000"+m.path
            })
          })
          self.state = "Last Event: "+$scope.events[0].time
        } else {
          self.state = "Last Event: unknown"
        }
        $scope.setMovieURL = function(url) {
          $scope.movieURL = $sce.trustAsResourceUrl(url);
          $ionicModal.fromTemplateUrl('video-modal.html',{
            scope: $scope
          }).then(function(modal) {
            $scope.closeVideoModal = function() { modal.hide() };
            modal.show();
          });
        }
      })
    },
    buttons: [{
      text: "Events",
      action: function() {
        $ionicModal.fromTemplateUrl('events-modal.html',{
          scope: $scope
        }).then(function(modal) {
          $scope.closeEventsModal = function() {
            modal.hide();
          };
          modal.show();
        });
      }
    }]
  },{
    label: "Garage Door",
    state: "Status: unknown",
    init: function() {
      var self = this;
      function fetchState() {
        $http.post('http://garage:4000/digital_read/4', {}, httpConfig)
        .success(function(res) {
          if (res.value === 1) {
            self.state = "Status: Open"
          } else if (res.value === 0) {
            self.state = "Status: Closed"
          }
        })
        .error(function() {
          self.state = "Status: unknown"
        })
      }
      fetchState();
      if (self.interval) clearInterval(self.interval); // for refresh purposes
      self.interval = setInterval(fetchState, 5000);
    },
    buttons: [{
      text: "Activate",
      action: function() {
        $ionicPopup.confirm({
          title: "Safety Check",
          template: "Are you sure it is safe to activate the garage door?",
          okText: "Yes. Do it."
        }).then(function(yes) {
          if (yes) {
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
            }).error(function() { alert('failed to write 1!') })
          }
        })
      }
    }]
  }];
})
