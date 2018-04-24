import { Prescription } from "./prescriptions.model";

export class Order {
  public id: string;
  public createdAt: number;
  public validity: number;
  public issuer: string;
  public recipient: string;
  public prescriptions: Prescription[];
  public version: number;

  public fingerprint: string;
  public signatureIssuer: string;
  public signatureRecipient: string;
}
