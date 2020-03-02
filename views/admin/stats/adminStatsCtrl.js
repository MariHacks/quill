const moment = require('moment');

angular.module('reg')
  .controller('AdminStatsCtrl',[
    '$scope',
    'UserService',
    function($scope, UserService){

      UserService
        .getStats()
        .then(stats => {
          $scope.stats = stats.data;
          $scope.loading = false;

          // Sort schools data
          let schools = Object.keys(stats.data.schoolsCheckedIn);
          schools.sort((a, b) => schools[a] - schools[b]);
          $scope.stats.schools = schools.map(k => 
            [k, stats.data.schoolsCheckedIn[k]]);
        });

      $scope.fromNow = function(date){
        return moment(date).fromNow();
      };
    }]);
