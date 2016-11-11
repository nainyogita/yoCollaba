'use strict';

export function TeamleaderResource($resource) {
  'ngInject';

  return $resource('/api/teams/:email/:controller', {
    id: '@_id'
  }, {
    addTeamMember: {
      method: 'PUT',
      params: {
        controller: 'addTeamMember'
      }
    },
    getUserTeams: {
     method: 'GET',
     isArray: true,
     params: {
       controller: 'getUserTeams'
     }
   },
    deleteTeamMember: {
      method: 'PUT',
      params: {
        controller: 'deleteTeamMember'
      }
    },
    getTeams: {
      method: 'GET',
      isArray: true,
      params: {
        controller: 'getTeams'
      }
    },
    teamEdit: {
      method : 'POST',
      params: {
        controller:'teamEdit'
      }
    },
    leaveGroup: {
      method : 'PUT',
      params: {
        controller:'leaveGroup'
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
