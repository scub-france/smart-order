import { Injectable } from '@angular/core';

@Injectable()
export class EventService {

  private events: Array<Object> = [];

  constructor() {
  }

  public setEvents(data: Array<Object>) {
    this.events = data;
  }

  public addEvent(data: Object) {
    this.events.unshift(data);
  }

  public getEvents(): Array<Object> {
    return this.events;
  }
}
