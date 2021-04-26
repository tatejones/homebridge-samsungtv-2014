import { Remote } from './remote';
import { TV } from './tv';
import { Speaker } from './speaker';
import { API, Logger, PlatformAccessory, PlatformConfig,
  Service, Characteristic, Categories } from 'homebridge';
import { PLATFORM_NAME, PLUGIN_NAME } from './settings';


export class SamsungTVHomebridgePlatform {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  // this is used to track restored cached accessories
  public readonly cachedAccessories: PlatformAccessory[] = [];

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.log.debug('Finished initializing platform:', this.config.name);

    // When this event is fired it means Homebridge has restored all cached accessories from disk.
    // Dynamic Platform plugins should only register new accessories after this event was fired,
    // in order to ensure they weren't added to homebridge already. This event can also be used
    // to start discovery of new accessories.
    this.api.on('didFinishLaunching', this.initialiseTVs.bind(this));
  }

  /**
   * This function is invoked when homebridge restores cached accessories from disk at startup.
   * It should be used to setup event handlers for characteristics and update respective values.
   */
  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);

    // add the restored accessory to the accessories cache so we can track if it has already been registered
    this.cachedAccessories.push(accessory);
  }

  initialiseTVs() {

    if (!this.config || !this.config.tvs) {
      this.log.info('SamsungTV2014 plugin is not configured.  Skipping.');
      return;
    }

    for (const cachedAccessory of this.cachedAccessories) {
      this.log.info('Unregister cached accessories');
      this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [cachedAccessory]);
    }

    // loop over the discovered devices and register each one if it has not already been registered
    for (const config of this.config.tvs) {

      // generate a unique id for the accessory this should be generated from
      // something globally unique, but constant, for example, the device serial
      // number or MAC address
      const uuid = this.api.hap.uuid.generate(config.macAddress);

      // the accessory does not yet exist, so we need to create it
      this.log.info('Adding TV accessory:', config.displayName);

      // create a new TV accessory
      const platformAccessory = new this.api.platformAccessory(config.displayName, uuid, Categories.TELEVISION);

      // store a copy of the device object in the `accessory.context`
      // the `context` property can be used to store any data about the accessory you may need
      platformAccessory.context.device = config;

      // add services to the TV
      const remote = new Remote(config, this.log);
      const tv = new TV(this, remote, config, platformAccessory);
      const speaker = new Speaker(this, remote, config);
      tv.tvService.addLinkedService(speaker.service);

      // this.log.info('Adding Input service');
      // const input = new Input(this, remote, config);
      // tv.tvService.addLinkedService(speaker.service);

      [...tv.getServices(), ...speaker.getServices()]
        .forEach(service => {
          this.log.info(`Adding service ${service.name} / ${service.displayName}`);
          platformAccessory.addService(service);
        });

      config.switches.forEach((element: any, index: number) => {
        this.log.info(`Index [${index}] ${JSON.stringify(element)}`);
        /*
        try {
           let accessory = new SwitchAccessory({
                ...element,
                identifier: parseInt(index) + 1
           }, this, Platform, Homebridge);

            this.accessories.push(accessory);
        } catch(error) {
            this.log.error(error.message);
        }
        */
      });

      // link the accessory to your platform
      // this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [platformAccessory]);
      this.api.publishExternalAccessories(PLUGIN_NAME, [platformAccessory]);
    }
  }
}