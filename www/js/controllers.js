angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, $http, $ionicPopup, $ionicPlatform, $ionicModal, $sce, $timeout, $templateCache) {
  $scope.things = [];

  $scope.doRefresh = function() {
    initThings();
    $scope.$broadcast('scroll.refreshComplete');
  }

  function ImageWidget(src) {
    this.type = 'image';

    this.start = function() {
      this.stop();
      $timeout(function() {
        this.src = src;
      }.bind(this), 1000)
    }

    this.stop = function() {
      this.src = ""
    }
  }

  function ModalWidget(label, url) {
    this.type = 'modal';
    this.label = label;

    this.openModal = function() {
      var modalScope = $scope.$new();
      $ionicModal.fromTemplateUrl(url, {
        scope: modalScope
      }).then(function(modal) {
        modalScope.close = function() {
          modal.hide();
          $timeout(function() {
            $templateCache.remove(url)
          }, 200);
        };
        modal.show();
      });
    }
  }


  function ButtonWidget(label, trigger, confirm) {
    this.type = 'button';
    this.label = label;

    this.action = function() {
      $ionicPopup.confirm(confirm).then(function(yes) {
        if (!yes) return false;
        $http(trigger).then(function(res) {}, function(res) {})
      });
    }
  }

  function PollStateWidget(fetch, map) {
    this.type = 'poll-state';

    this.start = function() {
      var self = this;
      function nullState() { self.state = null }
      function fetchState() {
        $http(fetch).then(function(res) {
          self.state = map[res.data.value]
        }, nullState)
      }
      this.interval = setInterval(fetchState, 5000);
      self.state = "Please wait..."
      fetchState();
    }

    this.stop = function() { clearInterval(this.interval) }
  }

  function createWidget(config) {
    if (config.type === 'poll-state') {
      return new PollStateWidget(config.fetch, config.map);
    } else if (config.type === 'button') {
      return new ButtonWidget(config.label, config.trigger, config.confirm);
    } else if (config.type === 'modal') {
      return new ModalWidget(config.label, config.url);
    } else if (config.type === 'image') {
      return new ImageWidget(config.src);
    }
  }

  function Thing(config) {
    this.loading = true;
    this.label = config.label;
    var widgets = this.widgets = [];

    this.start = function() {
      config.widgets.forEach(function(wconf) {
        var widget = createWidget(wconf);
        widgets.push(widget);
        if (widget.start) widget.start();
      });
      this.loading = false;
    }

    this.stop = function() {
      this.widgets.forEach(function(widget) {
        if (widget.stop) widget.stop();
      });
    }
  }

  function initThings() {
    $scope.things.forEach(function(thing) { thing.stop(); });
    $scope.things = [];
    $http.get("http://lab:8001/things").success(function(configs) {
      configs.forEach(function(config) {
        var thing = new Thing(config);
        $scope.things.push(thing);
        thing.start();
      });
    })
  }

  initThings();

})
