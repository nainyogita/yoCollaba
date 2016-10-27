'use strict';

export function WallResource($resource) {
  'ngInject';

  return $resource('/api/walls/:domain/:controller', {
    id: '@_id'
  }, {
    addWallPost: {
      method: 'PUT',
      params: {
        controller: 'addWallPost'
      }
    },
    getWalls: {
      method: 'GET',
      isArray: true,
      params: {
        controller: 'getWalls'
      }
    },
    get: {
      method: 'GET',
      params: {
        id: 'me'
      }
    }
  });
}
