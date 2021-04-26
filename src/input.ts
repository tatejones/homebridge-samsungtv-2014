import { AccessoryPlugin, Service } from 'homebridge';
import { Remote } from './remote';
import { SamsungTVHomebridgePlatform } from './samsungTVHomebridgePlatform';


export class Input implements AccessoryPlugin {
  public service: Service;
  constructor(
    private readonly platform: SamsungTVHomebridgePlatform,
    private readonly remote: Remote,
    private readonly config: any,
  ) {

    this.service = new this.platform.Service.InputSource(this.config.name, `input_${this.config.identifier}`)
      .setCharacteristic(this.platform.Characteristic.Identifier, this.config.identifier)
      .setCharacteristic(this.platform.Characteristic.ConfiguredName, this.config.displayName)
      .setCharacteristic(this.platform.Characteristic.IsConfigured, this.platform.Characteristic.IsConfigured.CONFIGURED)
      .setCharacteristic(this.platform.Characteristic.InputSourceType,
        this.platform.Characteristic.InputSourceType[this.config.type === 'app' ? 'APPLICATION' : 'OTHER'])
      .setCharacteristic(this.platform.Characteristic.TargetVisibilityState, this.platform.Characteristic.TargetVisibilityState.SHOWN)
      .setCharacteristic(this.platform.Characteristic.CurrentVisibilityState, this.platform.Characteristic.CurrentVisibilityState.SHOWN);

  }

  getServices(): Service[] {
    return [this.service];
  }
}
