export class Delivery {

  /**
   * Smart-contract mapped properties.
   */
  public id: string;
  public orderId: string;
  public deltas: number[];
  public pending: boolean;

  /**
   * Angular "extended" properties.
   */
  public timestamp: Date;
  public fingerprint: string;
  public signaturePharmacist: string;
  public signatureRecipient: string;
}
