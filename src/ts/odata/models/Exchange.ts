import { Edm } from "odata-v4-server";

export class Exchange {
  @Edm.Key
  @Edm.String
  public key: string

  constructor({ key }: { key: string }) {
    Object.assign(this, { key });
  }
}
