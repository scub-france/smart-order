import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-about-view',
  templateUrl: './about.view.component.html',
  styleUrls: ['./about.view.component.less'],
  encapsulation: ViewEncapsulation.None
})

export class AboutViewComponent implements OnInit {

  public constructor(private router: Router) {

  }

  public ngOnInit(): void {

  }
}
