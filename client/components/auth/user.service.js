'use strict';

export function UserResource($resource) {
  'ngInject';

  return $resource('/api/users/:id/:controller', {
    id: '@_id'
  }, {
    changePassword: {
      method: 'PUT',
      params: {
        controller: 'password'
      }
    },
    getUserChannels: {
     method: 'GET',
     isArray: true,
     params: {
       controller: 'getUserChannels'
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
