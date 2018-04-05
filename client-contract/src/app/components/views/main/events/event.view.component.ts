import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { EventService } from '../../../../services/event/event.service';

@Component({
  selector: 'app-event-view',
  templateUrl: './event.view.component.html',
  styleUrls: ['./event.view.component.less'],
  encapsulation: ViewEncapsulation.None
})

export class EventViewComponent implements OnInit {

  public constructor(private router: Router,
                     private eventService: EventService) {
  }

  public ngOnInit(): void {
  }

  public getEvents(): Array<Object> {
    return this.eventService.getEvents();
  }

  public getHTML(event: Object): string {
    return event['event'] + ' -> ' + JSON.stringify(event['args']);
  }
}
