/**
 * Organization model events
 */

'use strict';

import {EventEmitter} from 'events';
import Organization from './organization.model';
var OrganizationEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
OrganizationEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
for(var e in events) {
  let event = events[e];
  Organization.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    OrganizationEvents.emit(event + ':' + doc._id, doc);
    OrganizationEvents.emit(event, doc);
  };
}

export default OrganizationEvents;
