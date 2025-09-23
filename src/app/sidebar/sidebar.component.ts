import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Concept } from '../models';
import { ConceptsComponent } from "../concepts/concepts.component";

@Component({
  selector: 'app-sidebar',
  imports: [FormsModule, ConceptsComponent],
  templateUrl: './sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {
  loadConcept = output<Concept>();
}
