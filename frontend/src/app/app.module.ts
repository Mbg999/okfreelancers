// ANGULAR MODULES
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// NG-BOOTSTRAP
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

// LOCATION
import { registerLocaleData, CurrencyPipe } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import localEn from '@angular/common/locales/en';
registerLocaleData(localeEs, 'es');
registerLocaleData(localEn, 'en');

//COMPONENTS
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
// ---- USER COMPONENTS
import { UserAuthModalComponent } from './components/user/user-auth-modal/user-auth-modal.component';
import { UserAuthSecurityLoginComponent } from './components/user/user-auth-security-login/user-auth-security-login.component';
import { LoginComponent } from './components/user/user-auth-modal/login/login.component';
import { RegisterComponent } from './components/user/user-auth-modal/register/register.component';
import { VerifyComponent } from './components/user/verify/verify.component';
import { ForgottenPasswordComponent } from './components/user/user-auth-modal/forgotten-password/forgotten-password.component';
import { PasswordResetComponent } from './components/user/password-reset/password-reset.component';
import { AdminUserComponent } from './components/user/admin-user/admin-user.component';
import { AdminUserModalComponent } from './components/user/admin-user-modal/admin-user-modal.component';
import { UpdateUserAsAdminComponent } from './components/user/admin-user-modal/update-user-as-admin/update-user-as-admin.component';
import { UpdateUserFormComponent } from './components/user/update-user-form/update-user-form.component';
// ---- ROLES
import { RolesComponent } from './components/roles/roles.component';
// ---- shareds COMPONENTS
import { FormErrorMessagesComponent } from './components/shareds/form-error-messages/form-error-messages.component';
import { PasswordErrorMessagesComponent } from './components/shareds/password-error-messages/password-error-messages.component';
import { FooterComponent } from './components/shareds/footer/footer.component';
import { EditImageModalComponent } from './components/shareds/edit-image-modal/edit-image-modal.component';
// ---- shareds/NAVBAR COMPONENTS
import { NavbarComponent } from './components/shareds/navbar/navbar.component';
import { FreelancerComponent } from './components/shareds/navbar/freelancer/freelancer.component';
import { CompanyComponent } from './components/shareds/navbar/company/company.component';
import { DefaultComponent } from './components/shareds/navbar/default/default.component';
import { AdministratorComponent } from './components/shareds/navbar/administrator/administrator.component';
import { StarterComponent } from './components/shareds/navbar/starter/starter.component';
// ---- shareds/ADMIN COMPONENTS
import { AdminUserSearchComponent } from './components/shareds/admin/admin-user-search/admin-user-search.component';
import { BanModalComponent } from './components/shareds/admin/ban-modal/ban-modal.component';
// ---- shareds/FILES COMPONENTS
import { AudioComponent } from './components/shareds/audio/audio.component';
import { VideoComponent } from './components/shareds/video/video.component';
import { UploadFileComponent } from './components/shareds/upload-file/upload-file.component';
// ---- CATEGORIES COMPONENTS
import { AdminCategoriesComponent } from './components/categories/admin-categories/admin-categories.component';
import { AdminCategoryModalComponent } from './components/categories/admin-category-modal/admin-category-modal.component';
// ---- SKILLS COMPONENTS
import { AdminSkillsComponent } from './components/skills/admin-skills/admin-skills.component';
import { AdminSkillModalComponent } from './components/skills/admin-skill-modal/admin-skill-modal.component';
// ---- COMPANIES
import { CompanyFormComponent } from './components/companies/company-form/company-form.component';
import { AdminCompaniesComponent } from './components/companies/admin-companies/admin-companies.component';
import { AdminCompaniesModalComponent } from './components/companies/admin-companies-modal/admin-companies-modal.component';
import { AuthCompanyComponent } from './components/companies/auth-company/auth-company.component';
// ---- FREELANCERS
import { FreelancerFormComponent } from './components/freelancers/freelancer-form/freelancer-form.component';
import { AdminFreelancersComponent } from './components/freelancers/admin-freelancers/admin-freelancers.component';
import { AdminFreelancersModalComponent } from './components/freelancers/admin-freelancers-modal/admin-freelancers-modal.component';
// ---- FREELANCERS/PORTFOLIO
import { PortfolioFormComponent } from './components/freelancers/portfolio/portfolio-form/portfolio-form.component';
import { AdminPortfolioModalComponent } from './components/freelancers/portfolio/admin-portfolio-modal/admin-portfolio-modal.component';

// ---- ordenar estos
import { ShowCompanyComponent } from './components/companies/show-company/show-company.component';
import { AuthAllFreelancersComponent } from './components/freelancers/auth-all-freelancers/auth-all-freelancers.component';
import { AuthFreelancerComponent } from './components/freelancers/auth-freelancer/auth-freelancer.component';
import { ShowFreelancerComponent } from './components/freelancers/show-freelancer/show-freelancer.component';
import { AuthUserComponent } from './components/user/auth-user/auth-user.component';
import { ShowUserComponent } from './components/user/show-user/show-user.component';
import { FreelancerCardComponent } from './components/freelancers/freelancer-card/freelancer-card.component';
import { ShowCategoryComponent } from './components/categories/show-category/show-category.component';
import { PaginatorComponent } from './components/shareds/paginator/paginator.component';
import { ShowSkillComponent } from './components/skills/show-skill/show-skill.component';
import { ProjectFormComponent } from './components/projects/project-form/project-form.component';
import { AdminCompanyProjectsComponent } from './components/projects/admin-company-projects/admin-company-projects.component';
import { AdminCompanyProjectsModalComponent } from './components/projects/admin-company-projects-modal/admin-company-projects-modal.component';
import { AuthAllCompanyProjectsComponent } from './components/projects/auth-all-company-projects/auth-all-company-projects.component';
import { ProjectCardComponent } from './components/projects/project-card/project-card.component';
import { AuthCompanyProjectsComponent } from './components/projects/auth-company-projects/auth-company-projects.component';
import { ShowCompanyProjectComponent } from './components/projects/show-company-project/show-company-project.component';
import { MyBalanceModalComponent } from './components/myBalance/my-balance-modal/my-balance-modal.component';
import { OfferFormComponent } from './components/projects/offers/offer-form/offer-form.component';
import { MyOffersComponent } from './components/projects/offers/my-offers/my-offers.component';
import { OffersOfMyProjectComponent } from './components/projects/offers/offers-of-my-project/offers-of-my-project.component';
import { JobFormComponent } from './components/projects/jobs/job-form/job-form.component';
import { FreelancerProjectsComponent } from './components/freelancers/freelancer-projects/freelancer-projects.component';
import { ProcessMessagePipe } from './pipes/process-message.pipe';
import { AvailableOfferComponent } from './components/projects/offers/offers-of-my-project/available-offer/available-offer.component';
import { PendingOfferComponent } from './components/projects/offers/offers-of-my-project/pending-offer/pending-offer.component';
import { InProgressOfferComponent } from './components/projects/offers/offers-of-my-project/in-progress-offer/in-progress-offer.component';
import { FinishedOfferComponent } from './components/projects/offers/offers-of-my-project/finished-offer/finished-offer.component';
import { ToastComponent } from './components/shareds/toast/toast.component';
import { ConsentCookiesComponent } from './components/shareds/cookies/consent-cookies/consent-cookies.component';

// PRIMENG
// --- TABLE
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { EditorModule } from 'primeng/editor';

// NGX COLORPICKER
import { ColorPickerModule } from '@iplab/ngx-color-picker';

// PIPES
import { ImagePipe } from './pipes/image.pipe';
import { SafePipe } from './pipes/safe.pipe';
import { AudioPipe } from './pipes/audio.pipe';
import { VideoPipe } from './pipes/video.pipe';

// MULTILANGUAGE
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, "assets/i18n/", ".json");
}

// NGX-STRIPE
import { NgxStripeModule } from 'ngx-stripe';
import { MyBalanceComponent } from './components/myBalance/my-balance/my-balance.component';
import { MyBalanceTableComponent } from './components/myBalance/my-balance-table/my-balance-table.component';
import { AdminUserTransactionsModalComponent } from './components/user/admin-user-transactions-modal/admin-user-transactions-modal.component';

// NGX-PAYPAL
import { NgxPayPalModule } from 'ngx-paypal';
import { ChatComponent } from './components/chats/chat/chat.component';

// INFINITE SCROLL
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

// STAR RATTING (i have no time D:)
import { StarRatingModule } from '@sreyaj/ng-star-rating';
import { PEditorModelDirective } from './directives/p-editor-model.directive';

@NgModule({
  declarations: [
    AppComponent,
    UserAuthModalComponent,
    NavbarComponent,
    FooterComponent,
    LoginComponent,
    RegisterComponent,
    FormErrorMessagesComponent,
    PasswordErrorMessagesComponent,
    FreelancerComponent,
    CompanyComponent,
    DefaultComponent,
    AdministratorComponent,
    StarterComponent,
    ImagePipe,
    HomeComponent,
    UserAuthSecurityLoginComponent,
    VerifyComponent,
    ForgottenPasswordComponent,
    PasswordResetComponent,
    AdminCategoriesComponent,
    AdminCategoryModalComponent,
    AdminSkillsComponent,
    AdminSkillModalComponent,
    RolesComponent,
    AdminUserComponent,
    AdminUserModalComponent,
    UpdateUserAsAdminComponent,
    EditImageModalComponent,
    SafePipe,
    UpdateUserFormComponent,
    CompanyFormComponent,
    FreelancerFormComponent,
    AdminCompaniesComponent,
    AdminCompaniesModalComponent,
    AdminUserSearchComponent,
    AdminFreelancersComponent,
    AdminFreelancersModalComponent,
    BanModalComponent,
    PortfolioFormComponent,
    AudioComponent,
    VideoComponent,
    AudioPipe,
    VideoPipe,
    UploadFileComponent,
    AdminPortfolioModalComponent,
    AuthCompanyComponent,
    ShowCompanyComponent,
    AuthAllFreelancersComponent,
    AuthFreelancerComponent,
    ShowFreelancerComponent,
    AuthUserComponent,
    ShowUserComponent,
    FreelancerCardComponent,
    ShowCategoryComponent,
    PaginatorComponent,
    ShowSkillComponent,
    ProjectFormComponent,
    AdminCompanyProjectsComponent,
    AdminCompanyProjectsModalComponent,
    AuthAllCompanyProjectsComponent,
    ProjectCardComponent,
    AuthCompanyProjectsComponent,
    ShowCompanyProjectComponent,
    MyBalanceModalComponent,
    MyBalanceComponent,
    MyBalanceTableComponent,
    AdminUserTransactionsModalComponent,
    OfferFormComponent,
    ChatComponent,
    MyOffersComponent,
    OffersOfMyProjectComponent,
    JobFormComponent,
    FreelancerProjectsComponent,
    ProcessMessagePipe,
    AvailableOfferComponent,
    PendingOfferComponent,
    InProgressOfferComponent,
    FinishedOfferComponent,
    ToastComponent,
    ConsentCookiesComponent,
    PEditorModelDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    NgxStripeModule.forRoot('pk_test_duH4ApCy6zmtKUU9KlKNwYsH00bHKgloN7'),
    NgxPayPalModule,
    ColorPickerModule,
    TableModule,
    PaginatorModule,
    StarRatingModule,
    EditorModule,
    BrowserAnimationsModule,
    InfiniteScrollModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    CurrencyPipe
    // {provide:LOCALE_ID, useValue:'es'}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
