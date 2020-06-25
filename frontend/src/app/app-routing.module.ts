import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// ---- COMPONENTS
import { AuthUserComponent } from './components/user/auth-user/auth-user.component';
import { HomeComponent } from './components/home/home.component';
import { VerifyComponent } from './components/user/verify/verify.component';
import { PasswordResetComponent } from './components/user/password-reset/password-reset.component';
import { AdminCategoriesComponent } from './components/categories/admin-categories/admin-categories.component';
import { AdminSkillsComponent } from './components/skills/admin-skills/admin-skills.component';
import { RolesComponent } from './components/roles/roles.component';
import { AdminUserComponent } from './components/user/admin-user/admin-user.component';
import { AdminCompaniesComponent } from './components/companies/admin-companies/admin-companies.component';
import { AdminFreelancersComponent } from './components/freelancers/admin-freelancers/admin-freelancers.component';
import { AuthCompanyComponent } from './components/companies/auth-company/auth-company.component';
import { ShowCompanyComponent } from './components/companies/show-company/show-company.component';
import { ShowFreelancerComponent } from './components/freelancers/show-freelancer/show-freelancer.component';
import { AuthAllFreelancersComponent } from './components/freelancers/auth-all-freelancers/auth-all-freelancers.component';
import { AuthFreelancerComponent } from './components/freelancers/auth-freelancer/auth-freelancer.component';
import { ShowUserComponent } from './components/user/show-user/show-user.component';
import { ShowCategoryComponent } from './components/categories/show-category/show-category.component';
import { ShowSkillComponent } from './components/skills/show-skill/show-skill.component';
import { AdminCompanyProjectsComponent } from './components/projects/admin-company-projects/admin-company-projects.component';
import { AuthAllCompanyProjectsComponent } from './components/projects/auth-all-company-projects/auth-all-company-projects.component';
import { AuthCompanyProjectsComponent } from './components/projects/auth-company-projects/auth-company-projects.component';
import { ShowCompanyProjectComponent } from './components/projects/show-company-project/show-company-project.component';
import { MyBalanceComponent } from './components/myBalance/my-balance/my-balance.component';
import { ChatComponent } from './components/chats/chat/chat.component';
import { FreelancerProjectsComponent } from './components/freelancers/freelancer-projects/freelancer-projects.component';
// ---- GUARDS
import { AuthGuard } from './guards/auth.guard';
import { IsAdminGuard } from './guards/is-admin.guard';
import { IsCompanyGuard } from './guards/is-company.guard';
import { IsFreelancerGuard } from './guards/is-freelancer.guard';

//pruebas

const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'messages', canActivate: [AuthGuard], children: [
    { path: '', component: ChatComponent },
    { path: ':id', component: ChatComponent }
  ]},
  { path: 'freelancer/:id', component: ShowFreelancerComponent },
  { path: 'MyFreelancerProfiles', canActivate: [AuthGuard], children: [
    { path: '', component: AuthAllFreelancersComponent, canActivate: [IsFreelancerGuard] },
    { path: ':action', component: AuthFreelancerComponent },
    { path: ':id/:action', component: AuthFreelancerComponent, canActivate: [IsFreelancerGuard] }
  ]},
  { path: 'projects', component: FreelancerProjectsComponent, canActivate: [AuthGuard, IsFreelancerGuard]},
  { path: 'category/:name', children: [
    { path: '', component: ShowCategoryComponent },
    { path: ':filter', component: ShowCategoryComponent }
  ]},
  { path: 'skill/:name', children: [
    { path: '', component: ShowSkillComponent },
    { path: ':filter', component: ShowSkillComponent }
  ]},
  { path: 'MyCompany/projects', canActivate: [AuthGuard, IsCompanyGuard], children: [
    { path: '', component: AuthAllCompanyProjectsComponent },
    { path: ':action', component: AuthCompanyProjectsComponent },
    { path: ':id/:action', component: AuthCompanyProjectsComponent }
  ]},
  { path: 'company/:name', component: ShowCompanyComponent },
  { path: 'company/project/:id', component: ShowCompanyProjectComponent },
  { path: 'MyCompany/:action', component: AuthCompanyComponent, canActivate: [AuthGuard, IsCompanyGuard] },
  { path: 'MyProfile/:action', component: AuthUserComponent, canActivate: [AuthGuard] },
  { path: 'user/:email', component: ShowUserComponent },
  { path: 'MyBalance', component: MyBalanceComponent, canActivate: [AuthGuard] },
  { path: 'verify/:token', component: VerifyComponent },
  { path: 'passwordReset/:email/:token', component: PasswordResetComponent },
  { path: 'admin/users', component: AdminUserComponent, canActivate: [IsAdminGuard] },
  { path: 'admin/companies/:userId', component: AdminCompaniesComponent, canActivate: [IsAdminGuard] },
  { path: 'admin/companies/projects/:companyId', component: AdminCompanyProjectsComponent, canActivate: [IsAdminGuard] },
  { path: 'admin/freelancers/:userId', component: AdminFreelancersComponent, canActivate: [IsAdminGuard] },
  { path: 'admin/categories', component: AdminCategoriesComponent, canActivate: [IsAdminGuard] },
  { path: 'admin/skills', component: AdminSkillsComponent, canActivate: [IsAdminGuard] },
  { path: 'admin/roles', component: RolesComponent, canActivate: [IsAdminGuard] },
  { path: '**', component: HomeComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
