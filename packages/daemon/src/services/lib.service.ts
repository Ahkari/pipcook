import { BindingScope, injectable } from "@loopback/core";
import { constants } from "@pipcook/pipcook-core";
import { pathExists } from "fs-extra";
import { join } from "path";
import { execAsync } from "../utils";

@injectable({ scope: BindingScope.SINGLETON })
export class LibService {
  PIPCOOK_BIP: string = join(constants.PIPCOOK_DAEMON, 'node_modules/@pipcook/boa/tools/bip.js');

  async installByName(name: string): Promise<void> {
    if (await pathExists(this.PIPCOOK_BIP)) {
      if (name === 'tvm') {
        await execAsync(`${this.PIPCOOK_BIP} install tlcpack -f https://tlcpack.ai/wheels`, {});
      } else {
        await execAsync(`${this.PIPCOOK_BIP} install ${name}`, {});
      }
    } else {
      throw new Error(`Install ${name} failed`);
    }
  }
}
