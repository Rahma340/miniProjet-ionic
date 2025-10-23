import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone:false
})
export class DashboardPage {

  constructor(private router: Router, private authService: AuthService) {}

  navigateTo(path: string) {
    this.router.navigate([`/admin/${path}`]);
  }
    isActive(route: string): boolean {
    return this.router.url === route;
  }
    get currentRoute(): string {
    return this.router.url;
  }

  logout() {
    this.authService.logout();
  }
}
