import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/components/app';
import { appConfig } from './app/components/app.config';

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
