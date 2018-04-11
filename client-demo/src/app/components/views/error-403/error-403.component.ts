import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'error-403-view',
  templateUrl: './error-403.component.html',
  styleUrls: ['./error-403.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class Error403Component implements OnInit {

  public constructor() {
  }

  public ngOnInit(): void {
  }

}
