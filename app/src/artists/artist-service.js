/**
 * Created by laur on 17.10.2015.
 */
(function () {
  'use strict';
  angular.module('altFest').factory('ArtistService', ArtistService);

  function ArtistService($resource) {
    return $resource('http://localhost:3000/api/artists/:id', {id: '@id'})
  }

  ArtistService.$inject = ['$resource'];
})();