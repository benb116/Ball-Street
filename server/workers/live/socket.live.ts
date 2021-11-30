import liveState from './state.live' // WS server

export function sendToUser(userID, msg) {
  const thews = liveState.connmap.get(userID);
  if (!thews) { liveState.connmap.delete(userID); return; }
  thews.send(JSON.stringify(msg));
}

export function sendToContests(msgMap) {
  liveState.contestmap.forEach((cID, thews) => {
    if (!msgMap[cID]) { return; }
    if (!thews) { liveState.contestmap.delete(thews); return; }
    if (thews.readyState === 1) {
      thews.send(JSON.stringify(msgMap[cID]));
    }
  });
}

export function sendToAll(msg) {
  liveState.contestmap.forEach(async (thecontestID, thews) => {
    if (!thews) { liveState.contestmap.delete(thews); return; }
    if (thews.readyState === 1) thews.send(JSON.stringify(msg));
  });
}