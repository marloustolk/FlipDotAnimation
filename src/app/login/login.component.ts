import { Component, ElementRef, HostListener, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FlipdotService } from '../flipdot.service';
import { catchError } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loggedIn = output<string>();
  login = false;
  showError = false;
  show = false;
  passwordText = '';
  password: string | undefined;
  errorPassword = 'Wrong password';

  constructor(private eRef: ElementRef, private service: FlipdotService) {
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.showError = false;
      this.login = false;
    }
  }

  @HostListener('document:keydown.enter', ['$event'])
  enterPassword() {
    if (this.login && this.passwordText.length > 0) {
      this.service.get(this.passwordText).pipe(
        catchError((err) => {
          console.error('Error:', err);
          this.showError = true;
          return '';
        })).subscribe(() => {
          this.showError = false;
          this.password = this.passwordText;
          this.loggedIn.emit(this.password);
        });
    }
  }
}
