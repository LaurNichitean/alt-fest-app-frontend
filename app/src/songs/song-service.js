/**
 * Created by laur on 18.10.2015.
 */
(function () {
  'use strict';
  angular.module('altFest').factory('SongService', SongService);

  function SongService($resource) {
    return {
      getListFromArtist: getListFromArtist,
      song: song
    };

    function getListFromArtist() {
      return $resource('http://localhost:3000/api/artists/:id/songs', {id: '@id'})
    }

    function song() {
      return $resource('http://localhost:3000/api/songs/:id', {id: '@id'}, {
        update: {method: 'PUT'}
      })
    }
  }

  SongService.$inject = ['$resource'];
})();