'use strict';

export function EmojiResource($resource) {
  'ngInject';

  return $resource('/api/emojiss', {
    id:'@_id'
  },
  {
    getEmojis : {
      method : 'GET'
    }
  });
}
