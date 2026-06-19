import { Component, signal } from '@angular/core';
import { Client } from './client/client';

@Component({
  selector: 'app-root',
  imports: [Client],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('gym-app');
}