import {inject, TestBed} from "@angular/core/testing";

import {FactoryService, OrderService} from "./order.service";

describe("OrderService", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OrderService]
    });
  });

  it("should be created", inject([OrderService], (service: OrderService) => {
    expect(service).toBeTruthy();
  }));
});
