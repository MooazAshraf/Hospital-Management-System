import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { RouterModule } from '@angular/router';
import { routes } from './app/components/app.routes';
import { App } from './app/components/app';

bootstrapApplication(App, {
	providers: [importProvidersFrom(RouterModule.forRoot(routes))],
}).catch((err) => console.error(err));
