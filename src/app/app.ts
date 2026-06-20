import { Component, signal } from '@angular/core';
import { Member } from './client/member';

@Component({
  selector: 'app-root',
  imports: [Member],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('gym-app');
}
