export class Delivery {
  public id: string;
  public orderId: string;
  public deltas: number[];
  public pending: boolean;

  public timestamp: Date;
  public fingerprint: string;
  public signaturePharmacist: string;
  public signatureRecipient: string;
}
