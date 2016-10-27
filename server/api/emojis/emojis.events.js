/**
 * Emojis model events
 */

'use strict';

import {EventEmitter} from 'events';
import Emojis from './emojis.model';
var EmojisEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
EmojisEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
for(var e in events) {
  let event = events[e];
  Emojis.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    EmojisEvents.emit(event + ':' + doc._id, doc);
    EmojisEvents.emit(event, doc);
  };
}

export default EmojisEvents;
