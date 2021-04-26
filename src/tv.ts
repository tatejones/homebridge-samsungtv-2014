import { platform } from 'node:os';
import { Service, CharacteristicValue,
  CharacteristicGetCallback, CharacteristicSetCallback, AccessoryPlugin, PlatformAccessory } from 'homebridge';
import { SamsungTVHomebridgePlatform } from './samsungTVHomebridgePlatform';
import RemoteKeys from './remoteKeys';
import { Remote } from './remote';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class TV implements AccessoryPlugin {
  public tvService: Service;
  private remoteKeys: any;
  /**
   * These are just used to create a working example
   * You should implement your own code to track the state of your accessory
   */
  private states = {
    On: false,
  };

  constructor(
    private readonly platform: SamsungTVHomebridgePlatform,
    private readonly remote: Remote,
    private readonly config: any,
    private platformAccessory: PlatformAccessory,
  ) {
    this.remoteKeys = RemoteKeys(config, platform);

    this.platform.log.info(`Configuring Samsung TV with ${JSON.stringify(this.config)}`);

    // set accessory information
    const informationService = platformAccessory.getService(this.platform.Service.AccessoryInformation)!;

    informationService
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Samsung')
      .setCharacteristic(this.platform.Characteristic.Model, 'Smart TV Prior 2014')
      .setCharacteristic(this.platform.Characteristic.Name, config.displayName)
      .setCharacteristic(this.platform.Characteristic.SerialNumber, this.config.ip);

    this.platform.log.info(`Setting the TV name to [${config.displayName}]`);

    this.tvService = platformAccessory.getService(this.platform.Service.Television) ||
      new this.platform.Service.Television(config.displayName);

    this.tvService
      .setCharacteristic(this.platform.Characteristic.Name, config.displayName)
      .setCharacteristic(this.platform.Characteristic.SleepDiscoveryMode,
        this.platform.Characteristic.SleepDiscoveryMode.ALWAYS_DISCOVERABLE)
      .setCharacteristic(this.platform.Characteristic.ActiveIdentifier, 1);

    this.tvService.getCharacteristic(this.platform.Characteristic.Active)
      .on('get', this.getOn.bind(this))
      .on('set', this.setOn.bind(this));

    this.tvService.getCharacteristic(this.platform.Characteristic.RemoteKey)
      .on('set', this.setRemote.bind(this));

    // this.service.getCharacteristic(this.platform.Characteristic.ActiveIdentifier)
    //   .on('get', this.getInput.bind(this))
    //   .on('set', this.setInput.bind(this));

    /**
     * Creating multiple services of the same type.
     *
     * To avoid "Cannot add a Service with the same UUID another Service without also defining a unique 'subtype' property." error,
     * when creating multiple services of the same type, you need to use the following syntax to specify a name and subtype id:
     * this.accessory.getService('NAME') || this.accessory.addService(this.platform.Service.Lightbulb, 'NAME', 'USER_DEFINED_SUBTYPE_ID');
     *
     * The USER_DEFINED_SUBTYPE must be unique to the platform accessory (if you platform exposes multiple accessories, each accessory
     * can use the same sub type id.)
     */

    // // Example: add two "motion sensor" services to the accessory
    // const motionSensorOneService = this.accessory.getService('Motion Sensor One Name') ||
    //   this.accessory.addService(this.platform.Service.MotionSensor, 'Motion Sensor One Name', 'YourUniqueIdentifier-1');

    // const motionSensorTwoService = this.accessory.getService('Motion Sensor Two Name') ||
    //   this.accessory.addService(this.platform.Service.MotionSensor, 'Motion Sensor Two Name', 'YourUniqueIdentifier-2');

    /**
     * Updating characteristics values asynchronously.
     *
     * Example showing how to update the state of a Characteristic asynchronously instead
     * of using the `on('get')` handlers.
     * Here we change update the motion sensor trigger states on and off every 10 seconds
     * the `updateCharacteristic` method.
     *
     */
    // let motionDetected = false;
    setInterval(() => {
      // EXAMPLE - inverse the trigger
      // motionDetected = !motionDetected;

      // // push the new value to HomeKit
      // motionSensorOneService.updateCharacteristic(this.platform.Characteristic.MotionDetected, motionDetected);
      // motionSensorTwoService.updateCharacteristic(this.platform.Characteristic.MotionDetected, !motionDetected);

      // this.platform.log.debug('Triggering motionSensorOneService:', motionDetected);
      // this.platform.log.debug('Triggering motionSensorTwoService:', !motionDetected);
    }, 10000);
  }

  getServices(): Service[] {
    return [this.tvService];
  }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, turning on a Light bulb.
   */

  async setRemote(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    try {
      await this.remote.sendCommand(this.remoteKeys[value.toString()]);
      callback();
    } catch (error) {
      callback(error);
    }
  }

  async setOn(on: CharacteristicValue, callback: CharacteristicSetCallback) {
    try {
      await this.remote.sendCommand( on ? 'KEY_POWERON' : 'KEY_POWEROFF');
      callback();
      this.states.On = on as boolean;
    } catch (error) {
      callback(error);
    }
  }

  /**
   * Handle the "GET" requests from HomeKit
   * These are sent when HomeKit wants to know the current state of the accessory, for example, checking if a Light bulb is on.
   *
   * GET requests should return as fast as possbile. A long delay here will result in
   * HomeKit being unresponsive and a bad user experience in general.
   *
   * If your device takes time to respond you should update the status of your device
   * asynchronously instead using the `updateCharacteristic` method instead.

   * @example
   * this.service.updateCharacteristic(this.platform.Characteristic.On, true)
   */
  async getOn(callback: CharacteristicGetCallback) {
    callback(null, this.tvService.getCharacteristic(this.platform.Characteristic.ActiveIdentifier).value || false);
    try {
      const alive = await this.remote.isAlive();
      this.states.On = alive;
      this.tvService.getCharacteristic(this.platform.Characteristic.Active).updateValue(this.states.On);
    } catch (error) {
      this.states.On = false;
      this.tvService.getCharacteristic(this.platform.Characteristic.Active).updateValue(this.states.On);
    }

    // if you need to return an error to show the device as "Not Responding" in the Home app:
    // throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);

  }

}
