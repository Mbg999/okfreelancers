import { Validators, ValidationErrors, AbstractControl, FormGroup, ValidatorFn } from '@angular/forms';

/**
 * Dedicated class for custom validations
 */
export class CustomValidators extends Validators {

    /**
     * Overrides the Validators required, for returns error at whitespaces only
     * 
     * @param c AbstractControl
     */
    public static required(c: AbstractControl): ValidationErrors | null {
        return c.value && /.*[^ ].*/.test(c.value) ? null : {
            required: true
        };
    }

    /**
     * Looks if the data is in the available one
     * 
     * @param data array of non object data type
     */
    public static in(data: any[], itsNumber: boolean=false): ValidatorFn {
        return (c: AbstractControl): ValidationErrors | null => {
            if(CustomValidators.required(c)) return null;
            return (data.indexOf((itsNumber) ? parseInt(c.value) : c.value) > -1) ? null : {
                in: true
            }
        }
    }

    /**
     * At least one lowercase letter
     * 
     * @param c AbstractControl
     */
    public static missingLowerCases(c: AbstractControl): ValidationErrors | null {
        return /^(?=.*?[a-zá-ü]).{1,}$/.test(c.value) ? null : {
            missingLowerCases: true
        };
    }

    /**
     * At least one uppercase letter
     * 
     * @param c AbstractControl
     */
    public static missingUpperCases(c: AbstractControl): ValidationErrors | null {
        return /^(?=.*?[A-ZÁ-Ü]).{1,}$/.test(c.value) ? null : {
            missingUpperCases: true
        };
    }

    /**
     * At least one number
     * 
     * @param c AbstractControl
     */
    public static missingNumbers(c: AbstractControl): ValidationErrors | null {
        return /^(?=.*?[0-9]).{1,}$/.test(c.value) ? null : {
            missingNumbers: true
        };
    }

    /**
     * At least one special character
     * 
     * @param c AbstractControl
     */
    public static missingSpecialChars(c: AbstractControl): ValidationErrors | null {
        return /^(?=.*?[#?á-üÁ-Ü!@$%^&*-.:]).{1,}$/.test(c.value) ? null : {
            missingSpecialChars: true
        };
    }

    /**
     * a valid date:
     *  - yyyy-MM-dd
     * - yyyy MM dd
     * - yyyy/MM/dd
     * 
     * @param c AbstractControl
     */
    public static date(c: AbstractControl): ValidationErrors | null {
        if(!c.value) return;
        
        // \\ -> save \ in a string
        const aux:any = '^(?:19|20)\\d{2}[\\-\\/\\s]?((((0[13578])|(1[02]))[\\-\\/\\s]?(([0-2][0-9])|(3[01])))|(((0[469])|(11))[\\-\\/\\s]?(([0-2][0-9])|(30)))|(02[\\-\\/\\s]?[0-2][0-9]))$';
                
        return (new RegExp(aux).test(c.value)) ? null :  {
            invalidDateFormat: true
        };
    }

    /**
     * Calculates the years old from the born date
     * born date < 18 years old -> error
     * 
     * @param c AbstractControl
     */
    public static bornDate(c: AbstractControl): ValidationErrors | null {
        let aux = CustomValidators.date(c);
        if(aux){ // date format error
            return aux;
        }
        aux = c.value.replace(/(\/|\s)/, '-');
        aux = aux.split('-');
        aux = new Date(parseInt(aux[0]), parseInt(aux[1])-1, parseInt(aux[2]));

        return (Math.trunc(Math.trunc((new Date().getTime()-aux.getTime())/1000/60/60/24) / 365.2427) < 18) ? {
                tooYoung: true
            } : null;
    }

    /**
     * Compares 2 form fields, and try to match them
     * 
     * @param controlName string
     * @param matchingControlName string
     */
    public static MustMatch(controlName: string, matchingControlName: string) {
        return (formGroup: FormGroup) => {
            const control = formGroup.controls[controlName];
            const matchingControl = formGroup.controls[matchingControlName];

            if (matchingControl.errors && !matchingControl.errors.mustMatch) {
                // return if another validator has already found an error on the matchingControl
                return;
            }

            // set error on matchingControl if validation fails
            if (control.value !== matchingControl.value) {
                matchingControl.setErrors({ mustMatch: true });
            } else {
                matchingControl.setErrors(null);
            }
        }
    }
}
