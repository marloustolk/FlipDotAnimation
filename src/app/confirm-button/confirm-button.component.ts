import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-button',
  imports: [],
  template: `
    <button type="button" (click)="handleClick()"><ng-content></ng-content></button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmButtonComponent {
  warning = input.required<string>();
  confirm = output<void>();

  handleClick() {
    const shouldContinue = window.confirm(this.warning());
    if (!shouldContinue) {
        return;
    }

    this.confirm.emit();
  }
}
