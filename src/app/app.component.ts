import { Component, computed, inject, model } from '@angular/core';
import { Display } from './display/display';
import { Form } from './form/form';
import { FlipdotService } from './flipdot.service';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from "./login/login.component";

@Component({
  selector: 'app-root',
  imports: [Display, Form, FormsModule, LoginComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  protected title = 'Flip-dot Animation';
  protected rowCount = 19;
  protected columnCount = 112;
  protected add: 'text' | 'image' | undefined;
  showError = false;
  password = false;
  error = 'You need to log in';
  delay = model<number>(500);
  execute = model<string>(new Date().toString());

  executeAt = computed(() => {
    let date = new Date(this.execute());
    return date > new Date() ? date.toISOString() : 'now';
  });

  resetTime() {
    this.execute.set(new Date().toString())
  }

  setPassword(password: string) {
    this.flipDotService.setPassword(password);
    this.password = true;
    this.showError = false;
  }

  flipDotService = inject(FlipdotService);
}
