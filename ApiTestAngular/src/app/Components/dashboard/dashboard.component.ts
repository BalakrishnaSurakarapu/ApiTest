import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/Services/api.service';
import { AuthenticationService } from 'src/app/Services/authentication.service';
import { UserStoreService } from 'src/app/Services/user-store.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  public users: any = [];
  public role!: string;
  public userImage!: string;
  public fullName: string = "";

  constructor(private api: ApiService, private auth: AuthenticationService, private userStore: UserStoreService, private router: Router) { }

  ngOnInit() {
    this.userStore.getFullNameFromStore()
      .subscribe((val: any) => {
        const fullNameFromToken = this.auth.getFullNameFromToken();
        this.fullName = val || fullNameFromToken
      });

    this.userStore.getRoleFromStore()
      .subscribe((val: any) => {
        const roleFromToken = this.auth.getRoleFromToken();
        this.role = val || roleFromToken;
      })
    this.userStore.getimageFromStore()
      .subscribe((val: any) => {
        const ImageFromToken = this.auth.getImageFromToken();
        this.userImage = val || ImageFromToken;
      })
    this.loadUsers();
  }
  editUser(id: number): void {
    console.log('Navigating to edit user:', id);
    this.router.navigate(['/register', id]);
  }

  loadUsers() {
    this.api.getAllUsers().subscribe((data: any) => {
      this.users = data;
      console.log(data);
    })
  }

  deleteUser(id: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.api.deleteUser(id).subscribe({
        next: () => {
          alert('User deleted successfully');
          this.loadUsers(); // refresh your dashboard
        },
        error: (err) => {
          console.error(err);
          alert('Failed to delete user');
        }
      });
    }
  }


  logout() {
    this.auth.signOut();
  }
}
