// Client → Server
export const CLIENT_EVENTS = {
  LOCATION_UPDATE: 'location:update',
  JOURNEY_START: 'journey:start',
  JOURNEY_END: 'journey:end',
  JOURNEY_JOIN: 'journey:join',
  JOURNEY_LEAVE: 'journey:leave',
  SOS_TRIGGER: 'sos:trigger',
} as const;

// Server → Client
export const SERVER_EVENTS = {
  LOCATION_UPDATED: 'location:updated',
  JOURNEY_UPDATED: 'journey:updated',
  SOS_ALERT: 'sos:alert',
} as const;
