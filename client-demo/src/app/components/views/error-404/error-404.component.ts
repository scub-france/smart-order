import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'error-404-view',
  templateUrl: './error-404.component.html',
  styleUrls: ['./error-404.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class Error404Component implements OnInit {

  public constructor() {
  }

  public ngOnInit(): void {
  }

}
