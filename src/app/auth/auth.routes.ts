
import { Routes } from '@angular/router';


const AuthRoutes: Routes = [
    {
        path: '', redirectTo: 'sign-in', pathMatch: 'full'
    },
    {
        path: 'sign-in', loadComponent: () => import('./sign-in/sign-in.component').then(c => c.SignInComponent)
    },
    {
        path: 'sign-up', loadComponent: () => import('./sign-up/sign-up.component').then(c => c.SignUpComponent)
    },

]

export default AuthRoutes