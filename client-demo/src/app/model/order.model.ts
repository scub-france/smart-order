import { Prescription } from "./prescriptions.model";

export class Order {

  /**
   * Smart-contract mapped properties.
   */
  public id: string;
  public createdAt: number;
  public validity: number;
  public issuer: string;
  public recipient: string;
  public prescriptions: Prescription[];
  public version: number;

  /**
   * Angular "extended" properties.
   */
  public fingerprint: string;
  public signatureIssuer: string;
  public signatureRecipient: string;
  public timestamp: string;
}
