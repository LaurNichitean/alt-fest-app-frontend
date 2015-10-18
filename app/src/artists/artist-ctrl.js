/**
 * Created by laur on 17.10.2015.
 */
(function () {
  'use strict';
  angular.module('altFest').controller('ArtistCtrl', ArtistCtrl);

  function ArtistCtrl($scope, $mdSidenav, ArtistService, SongService) {
    ArtistService.query(function (result) {
      $scope.artists = result;
      $scope.selectedArtist = result[0];
      // get list of songs for current selected artist
      getArtistSongList();
    });

    function getArtistSongList() {
      SongService.getListFromArtist().query({id: $scope.selectedArtist._id}).$promise.then(function (result) {
        angular.extend($scope.selectedArtist, {
          songs: result
        });
        $scope.selectedArtist.songs = $scope.selectedArtist.songs.filter(function (song) {
          // modify url's to embed
          return song.urlYoutube = song.urlYoutube.replace('watch?v=', 'embed/');
        });
      });
    }

    $scope.addVote = function (song, value) {
      song.likes += value;
      SongService.song().update({id: song._id}, {"likes": song.likes});
    };

    $scope.$watch('selectedArtist', function (newValue, oldValue) {
      if (angular.isDefined(oldValue) && !angular.equals(newValue, oldValue)) {
        getArtistSongList();
      }
    });

    $scope.selectArtist = function (artist) {
      $scope.selectedArtist = angular.isNumber(artist) ? $scope.artists[artist] : artist;
    };

    $scope.toggleSideNav = function () {
      $mdSidenav('left').toggle();
    };
  }

  ArtistCtrl.$inject = ['$scope', '$mdSidenav', 'ArtistService', 'SongService'];
})();