import { Logger } from 'homebridge';
import SamsungRemote from 'samsung-remote';


export class Remote {
    private remote: any;
    constructor(
        private readonly config: any,
        private readonly log: Logger,
    ) {
      this.log.info(`Initialising remote at IP address ${this.config.ipAddress}`);
      this.remote = new SamsungRemote({
        ip: config.ipAddress,
      });
    }

    sendCommand = async (command: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        this.log.info(`remote command issused [${command}] `);
        this.remote.send(command, (err: Error) => {
          if (err) {
            this.log.error(`Could not send remote command [${command}]: ${err}`);
            reject(err);
          } else {
            this.log.info(`Remote command [${command}] sent`);
            resolve();
          }
        });
      });
    };

    isAlive = async () : Promise<boolean> => {
      return new Promise((resolve, reject) => {
        try {
          this.remote.isAlive((alive: number) => {
            this.log.info(`isAlive returned ${!!alive === false}`);
            resolve(!!alive === false);
          });
        } catch (error) {
          this.log.error('isAlive returned an error', error);
          reject(error);
        }
      });
    };
}

