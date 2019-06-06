import { Edm } from "odata-v4-server";

export class Exchange {
  @Edm.String
  public name: string

  constructor({ name }: { name?: string }) {
    Object.assign(this, { name });
  }
}
