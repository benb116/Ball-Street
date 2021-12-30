// Socket utility functions

import liveState from './state.live'; // WS server

export interface MessageType {
  event: string,
  [key: string]: any,
}
export interface MessageMapType {
  [key: string]: MessageType,
}

// Send a message to a specific user
export function sendToUser(userID: number, msg: MessageType) {
  const thews = liveState.connmap.get(userID);
  if (!thews) { liveState.connmap.delete(userID); return; }
  thews.send(JSON.stringify(msg));
}

// Send messages to users in specific contests
// Input as a map of contestID: messageObj
export function sendToContests(msgMap: MessageMapType) {
  liveState.contestmap.forEach((cID: number, thews) => {
    if (!msgMap[cID]) { return; }
    if (!thews) { liveState.contestmap.delete(thews); return; }
    if (thews.readyState === 1) {
      thews.send(JSON.stringify(msgMap[cID]));
    }
  });
}

// Send message to all users
export function sendToAll(msg: MessageType) {
  liveState.contestmap.forEach(async (_thecontestID: number, thews) => {
    if (!thews) { liveState.contestmap.delete(thews); return; }
    if (thews.readyState === 1) thews.send(JSON.stringify(msg));
  });
}
