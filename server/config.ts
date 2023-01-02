// Configuration parameters for the site
export const CallbackURL: string = (process.env['CALLBACK_URL'] || '');
// How long to wait before filling a protected offer
export const ProtectionDelay = (process.env['NODE_ENV'] === 'production' ? 30 : 5); // seconds
// Are offers protected by default?
export const DefaultProtected = false;
// How often to refresh websocket info
export const RefreshTime = 5; // seconds
// Email verification parameters
export const verificationTimeout = 5; // minutes
export const verificationTokenLength = 128;
// Percentage of profit taken as a fee
export const profitFeePercentage = 0.05;
