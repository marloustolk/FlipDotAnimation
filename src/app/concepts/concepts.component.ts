import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FlipdotService } from '../flipdot.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { PreviewComponent } from "../preview/preview.component";
import { Concept } from '../models';
import { ConfirmButtonComponent } from "../confirm-button/confirm-button.component";

@Component({
  selector: 'app-concepts',
  imports: [FormsModule, PreviewComponent, ConfirmButtonComponent],
  templateUrl: './concepts.component.html',
  styleUrl: './concepts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConceptsComponent {
  private readonly service = inject(FlipdotService);

  loggedIn = toSignal(this.service.readyForRequests$);
  concepts = toSignal(this.service.concepts$);

  loadConcept = output<Concept>();

  load(concept: Concept) {
    this.loadConcept.emit(concept);
  }

  delete(conceptId: number) {
    this.service.deleteConcept(conceptId).subscribe();
  }
}
