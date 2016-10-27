'use strict';

export function OwnerResource($resource) {
  'ngInject';

  return $resource('/api/organizations/:email/:controller', {
    id: '@_id'
  }, {
    createTeam: {
      method: 'PUT',
      params: {
        controller: 'createTeam'
      }
    },
    deleteTeam: {
      method: 'PUT',
      params: {
        controller: 'deleteTeam'
      }
    },
    getTeam: {
      method: 'GET',
      params: {
        controller : 'getTeam'
      }
    }
  });
}
