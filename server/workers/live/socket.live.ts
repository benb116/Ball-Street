// Socket utility functions

import liveState from './state.live'; // WS server

import type MessageType from '../../../types/messages';

export type MessageMapType = Map<number, MessageType>;

/** Send a message to a specific user */
export function sendToUser(userID: number, msg: MessageType) {
  const thews = liveState.connmap.get(userID);
  if (!thews) { liveState.connmap.delete(userID); return; }
  thews.send(JSON.stringify(msg));
}

/** Send messages to users in specific contests Input as a map of contestID: messageObj */
export function sendToContests(msgMap: MessageMapType) {
  msgMap.forEach((msg, cID) => {
    const wsSet = liveState.contestmap.get(cID);
    if (!wsSet) return;
    wsSet.forEach((ws) => {
      if (ws.readyState !== 1) {
        wsSet.delete(ws);
      } else {
        ws.send(JSON.stringify(msg));
      }
    });
  });
}

/** Send message to all users */
export function sendToAll(msg: MessageType) {
  liveState.connmap.forEach((thews) => {
    if (!thews) { liveState.contestmap.delete(thews); return; }
    if (thews.readyState === 1) thews.send(JSON.stringify(msg));
  });
}
