import { ChangeDetectionStrategy, Component, ElementRef, HostListener, inject, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FlipdotService } from '../flipdot.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private readonly service = inject(FlipdotService);
  private readonly eRef = inject(ElementRef);

  protected showLogin = signal(false);
  protected showPassword = model(false);
  protected error = signal<string|null>(null);
  protected passwordText = model('');
  protected loggedIn = toSignal(this.service.readyForRequests$)

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  enterPassword(event: SubmitEvent) {
    event.preventDefault();
    const password = this.passwordText();
    if (this.showLogin() && password.length > 0) {
      this.service.getPasswordError(password).subscribe(error => {
        if (!error) {
          this.service.login(password);
          this.close();
        } else {
          this.error.set(error);
        }
      });
    }
  }

  logout() {
    this.service.logout();
  }

  private close() {
    this.error.set(null);
    this.showLogin.set(false);
    this.showPassword.set(false);
    this.passwordText.set('');
  }
}
