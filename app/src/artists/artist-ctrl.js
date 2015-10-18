/**
 * Created by laur on 17.10.2015.
 */
(function () {
  'use strict';
  angular.module('altFest').controller('ArtistCtrl', ArtistCtrl);

  function ArtistCtrl($scope, $mdSidenav, ArtistService) {
    ArtistService.query(function (result) {
      $scope.artists = result;
      $scope.selectedArtist = result[0];
    });

    $scope.selectArtist = function (artist) {
      $scope.selectedArtist = angular.isNumber(artist) ? $scope.artists[artist] : artist;
    };

    $scope.toggleSideNav = function () {
      $mdSidenav('left').toggle();
    };
  }

  ArtistCtrl.$inject = ['$scope', '$mdSidenav', 'ArtistService'];
})();