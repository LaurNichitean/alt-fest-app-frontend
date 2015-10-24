/**
 * Created by laur on 17.10.2015.
 */
(function () {
  'use strict';
  angular.module('altFest').controller('ArtistCtrl', ArtistCtrl);

  function ArtistCtrl($scope, $mdToast, $mdSidenav, ArtistService, SongService) {
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

    // we need the 'selectedArtist' variable to be defined on the scope
    $scope.$watch('selectedArtist', function (nv, ov) {
      if (nv) {
        $scope.songToAdd = {
          name: '',
          likes: 0,
          urlYoutube: '',
          artistId: $scope.selectedArtist._id
        };
      }
    });

    // track changes on song to be added to list
    $scope.$watch('songToAdd', function (nv, ov) {
      console.log('songToAdd', nv);
    }, true);

    /* Add song */
    $scope.addSongInputVisible = false;

    // toggle visibility of the 'Add song' section
    $scope.toggleAddSong = function () {
      $scope.addSongInputVisible = !$scope.addSongInputVisible;
    };

    // persist creation of a new song
    $scope.saveSong = function () {
      $scope.selectedArtist.songs = $scope.selectedArtist.songs || [];
      // modify url to the 'embed' format
      $scope.songToAdd.urlYoutube = $scope.songToAdd.urlYoutube.replace('watch?v=', 'embed/');
      // send 'POST' request using 'save' method on our service
      SongService.song().save($scope.songToAdd).$promise.then(function (result) {
        var saveSongMessage;
        // if the result has no message, it is successful
        if (result.msg === '' && result.insertedIds[0].length) {
          // get new object from backend
          SongService.song().get({id: result.insertedIds[0]}).$promise.then(function (result) {
            // add newly created song to the beginning of the list
            $scope.selectedArtist.songs.unshift(result);
            // reset model values
            $scope.songToAdd.name = '';
            $scope.songToAdd.urlYoutube = '';
          });
          saveSongMessage = 'Song was successfully added to the list.';
        } else {
          saveSongMessage = 'There was an error adding the song.';
        }
        // show notification with save result
        $mdToast.show(
          $mdToast.simple()
            .content(saveSongMessage)
            .position($scope.getToastPosition())
            .hideDelay(3000)
        );
        $scope.addSongInputVisible = false;
      });
    };

    /* Delete song */

    // persist deletion of a song
    $scope.deleteSong = function (song, index) {
      // send 'DELETE' request using our service
      SongService.song().delete({id: song._id}).$promise.then(function (result) {
        var deleteSongMessage;
        if (result.msg === '') {
          deleteSongMessage = 'Song successfully deleted!';
          // remove song element from array
          $scope.selectedArtist.songs.splice(index, 1);
        } else {
          deleteSongMessage = 'The was an error deleting the song!';
        }
        // show notification with delete result
        $mdToast.show(
          $mdToast.simple()
            .content(deleteSongMessage)
            .position($scope.getToastPosition())
            .hideDelay(3000)
        );
      });
    };

    /* Toast - notifications section */

    var last = {
      bottom: false,
      top: true,
      left: false,
      right: true
    };
    $scope.toastPosition = angular.extend({}, last);
    $scope.getToastPosition = function () {
      sanitizePosition();
      return Object.keys($scope.toastPosition)
        .filter(function (pos) {
          return $scope.toastPosition[pos];
        })
        .join(' ');
    };
    function sanitizePosition() {
      var current = $scope.toastPosition;
      if (current.bottom && last.top) current.top = false;
      if (current.top && last.bottom) current.bottom = false;
      if (current.right && last.left) current.left = false;
      if (current.left && last.right) current.right = false;
      last = angular.extend({}, current);
    }

    /* Artist section */

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

  ArtistCtrl.$inject = ['$scope', '$mdToast', '$mdSidenav', 'ArtistService', 'SongService'];
})();