import { SamsungTVHomebridgePlatform } from './samsungTVHomebridgePlatform';

const DEFAULTS = {
  ARROW_UP       : 'KEY_UP',
  ARROW_DOWN     : 'KEY_DOWN',
  ARROW_LEFT     : 'KEY_LEFT',
  ARROW_RIGHT    : 'KEY_RIGHT',
  SELECT         : 'KEY_ENTER',
  BACK           : 'KEY_RETURN',
  PLAY_PAUSE     : 'KEY_PLAY_BACK',
  INFORMATION    : 'KEY_INFO',
};

export default (config:any, platfrom: SamsungTVHomebridgePlatform) => {
  const keys = DEFAULTS;
  const output = {};

  for (const index in config.keys) {
    const key = index.toString().toUpperCase();
    const value = config.keys[index];

    if (platfrom.Characteristic.RemoteKey[key] !== undefined) {
      keys[key] = value;
    }
  }

  for (const key in keys) {
    output[platfrom.Characteristic.RemoteKey[key]] = keys[key];
  }

  return output;
};