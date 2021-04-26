import { AccessoryPlugin, CharacteristicSetCallback, CharacteristicValue, Service } from 'homebridge';
import { Remote } from './remote';
import { SamsungTVHomebridgePlatform } from './samsungTVHomebridgePlatform';

export class Speaker implements AccessoryPlugin {
  public service: Service;
  constructor(
        private readonly platform: SamsungTVHomebridgePlatform,
        private readonly remote: Remote,
        private readonly config: any,
  ) {

    this.service = new this.platform.Service.TelevisionSpeaker(this.config.displayName + ' Volume');

    this.service
      .setCharacteristic(
        platform.Characteristic.Active,
        platform.Characteristic.Active.ACTIVE,
      )
      .setCharacteristic(
        platform.Characteristic.VolumeControlType,
        platform.Characteristic.VolumeControlType.ABSOLUTE,
      );

    this.service.getCharacteristic(this.platform.Characteristic.Mute)
      .on('set', this.setMute.bind(this));

    this.service.getCharacteristic(this.platform.Characteristic.VolumeSelector)
      .on('set', this.setVolume.bind(this));
  }

  getServices(): Service[] {
    return [this.service];
  }

  setMute(value: CharacteristicValue, callback:CharacteristicSetCallback) {
    this.remote.sendCommand('KEY_MUTE').then(() => {
      this.service
        .getCharacteristic(this.platform.Characteristic.Mute)
        .updateValue(value);
      callback();
    }).catch((error) => {
      callback(error);
    });
  }

  setVolume(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    this.remote.sendCommand(value ? 'KEY_VOLDOWN' : 'KEY_VOLUP').then(() => {
      this.service
        .getCharacteristic(this.platform.Characteristic.Volume)
        .updateValue(value);
      callback();
    }).catch((error) => {
      callback(error);
    });
  }
}