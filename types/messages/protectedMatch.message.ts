
interface ProtectedMatchMessage {
  event: 'protectedMatch',
  offerID: string,
  expire: number,
}

export default ProtectedMatchMessage;
