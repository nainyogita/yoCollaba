/**
 * Wall model events
 */

'use strict';

import {EventEmitter} from 'events';
import Wall from './wall.model';
var WallEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
WallEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
for(var e in events) {
  let event = events[e];
  Wall.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    WallEvents.emit(event + ':' + doc._id, doc);
    WallEvents.emit(event, doc);
  };
}

export default WallEvents;
