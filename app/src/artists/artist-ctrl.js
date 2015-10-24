/**
 * Created by laur on 17.10.2015.
 */
(function () {
  'use strict';
  angular.module('altFest').controller('ArtistCtrl', ArtistCtrl);

  function ArtistCtrl($scope, $mdSidenav, ArtistService, SongService) {
    $scope.artists = [];
    ArtistService.query(function (result) {
      if (result.length) {
        $scope.artists = result;
        $scope.selectedArtist = result[0];
        // get list of songs for current selected artist
        getArtistSongList();
      }
    });

    function getArtistSongList() {
      if ($scope.selectedArtist) {
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
    }

    $scope.addArtistInputVisible = false;

    $scope.toggleAddArtist = function () {
      $scope.addArtistInputVisible = !$scope.addArtistInputVisible;
    };

    $scope.artistToAdd = {
      name: ''
    };

    $scope.addArtist = function () {
      ArtistService.save($scope.artistToAdd).$promise.then(function (result) {
        if (result.status === 201) {
          console.log('artist result', result);
          // get newly created artist
          ArtistService.get({id: result.insertedIds[0]}).$promise.then(function (result) {
            // hide add artist input
            $scope.toggleAddArtist();
            // add artist to list
            $scope.artists.push(result);
            // reset artistToAdd object
            $scope.artistToAdd.name = '';
          })
        }
      })
    };

    $scope.deleteArtist = function (artist, index) {
      ArtistService.delete({id: artist._id}).$promise.then(function (result) {
        $scope.artists.splice(index, 1);
        // deselect selected artist
        $scope.selectArtist();
      });
    };

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