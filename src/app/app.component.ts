import { Component, computed, inject, model, signal, viewChild } from '@angular/core';
import { Display } from './display/display';
import { Form } from './form/form';
import { FlipdotService } from './flipdot.service';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from "./login/login.component";
import { toSignal } from '@angular/core/rxjs-interop';
import { createAnimation } from './animation';
import { displayColumnCount, displayRowCount } from './constants';
import { SidebarComponent } from "./sidebar/sidebar.component";
import { Concept, MessageFrame, Pixels } from './models';
import { ExecuteAtComponent } from "./execute-at/execute-at.component";

@Component({
  selector: 'app-root',
  imports: [Display, Form, FormsModule, LoginComponent, SidebarComponent, ExecuteAtComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  protected title = 'Flip-dot Animation';
  protected rowCount = displayRowCount;
  protected columnCount = displayColumnCount;
  protected add: 'text' | 'image' | undefined;
  delay = model<number>(500);
  executeAt = signal<string|null>('now');

  executeAtComponent = viewChild(ExecuteAtComponent)

  createAnimation: MessageFrame[] = createAnimation(this.columnCount).map((image) => {
    return {
      delayMs: this.delay(),
      pixels: Pixels.fromPixelString(image).array,
    };
  });

  resetTime() {
    this.executeAtComponent()?.reset();
  }

  flipDotService = inject(FlipdotService);
  display = viewChild.required<Display>('display', {});

  loggedIn = toSignal(this.flipDotService.readyForRequests$);

  loadConcept(concept: Concept) {
    this.display().load(concept);
  }

  sendMessage() {
    const executeAt = this.executeAt();
    if (!executeAt) {
      return;
    }

    this.flipDotService.sendMessage([{ delayMs: this.delay(), pixels: this.display().flipdots() }], executeAt).subscribe()
  }

  sendAnimation() {
    const executeAt = this.executeAt();
    if (!executeAt) {
      return;
    }
    this.flipDotService.sendMessage(this.createAnimation, executeAt).subscribe()
  }

  saveAsConcept() {
    this.flipDotService.createConcept([{ delayMs: 0, pixels: this.display().flipdots() }], new Date().toISOString()).subscribe();
  }
}
