<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class TranslationController extends Controller
{
    /**
     * Return the required fields for a correclty data translation
     *
     * @return array string
     */
    public static function getTranslatedFields($description=true, $prefix='', $table=''){
        if($description){
            switch(app()->getLocale()){ // switch for easier implementation of future translations
                case 'es': return [$table.'name_es as '.$prefix.'name', $table.'description_es as '.$prefix.'description'];
                default: return [$table.'name_en as '.$prefix.'name', $table.'description_en as '.$prefix.'description'];
            }
        } else {
            switch(app()->getLocale()){ // switch for easier implementation of future translations
                case 'es': return $table.'name_es as '.$prefix.'name';
                default: return $table.'name_en as '.$prefix.'name';
            }
        }
    }

    /**
     * Returns the correct name translation
     *
     * @return string
     */
    public static function getTranslatedFieldsName(){
        switch (app()->getLocale()) { // switch for easier implementation of future translations
            case 'es':
                return 'name_es';
            default:
                return 'name_en';
        }
    }

}
