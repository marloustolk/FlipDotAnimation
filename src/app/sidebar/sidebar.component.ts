import { AfterViewInit, ChangeDetectionStrategy, Component, effect, input, OnInit, output, signal, untracked, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Concept, MessageFrame, Pixels } from '../models';
import { Display } from "../display/display";
import { displayRowCount, displayColumnCount } from '../constants';
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
