'use strict';

export function ChannelResource($resource) {
  'ngInject';

  return $resource('/api/channels/:id/:controller',{
    id : '@_id'
  },
  {
    addChannel: {
      method : 'POST',
      params: {
        controller:'addChannel'
      }
    }
  });
}
