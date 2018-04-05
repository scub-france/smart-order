import { async, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Web3Service } from './services/web3/web3.service';
import { RouterModule } from '@angular/router';
import { APP_ROUTES } from './app.routes';
import { MainComponent } from './components/views/main/main.component';
import { MetacoinViewComponent } from './components/views/main/meta-coin/metacoin.view.component';
import { OracleViewComponent } from './components/views/main/oracle/oracle.view.component';
import { FactoryViewComponent } from './components/views/main/factory/factory.view.component';
import { Error404Component } from './components/views/error-404/error-404.component';
import { Error403Component } from './components/views/error-403/error-403.component';
import { AccountViewComponent } from './components/views/main/account/account.view.component';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { EventViewComponent } from './components/views/main/events/event.view.component';
import { FactoryService } from './services/factory/factory.service';
import { ChildService } from './services/factory/child.service';
import { MetaCoinService } from './services/meta-coin/meta-coin.service';
import { EventService } from './services/event/event.service';
import { OracleService } from './services/oracle/oracle.service';
import { APP_BASE_HREF } from '@angular/common';


describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserModule,
        RouterModule.forRoot(APP_ROUTES),
        FormsModule,
        ReactiveFormsModule,
        HttpModule
      ],
      declarations: [
        AppComponent,
        MainComponent,
        AccountViewComponent,
        MetacoinViewComponent,
        OracleViewComponent,
        FactoryViewComponent,
        EventViewComponent,
        Error404Component,
        Error403Component
      ],
      providers: [
        {provide: APP_BASE_HREF, useValue : '/' },

        MetaCoinService,
        OracleService,
        FactoryService,
        ChildService,
        EventService,
        Web3Service
      ]
    }).compileComponents();
  }));

  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
