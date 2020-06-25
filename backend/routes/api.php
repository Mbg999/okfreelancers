<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// USER ROUTES
Route::group(['prefix' => 'users'], function () {
    // all can access to this routes
    Route::get('email/{user}', 'UserController@showByEmail');
    Route::get('{email}', 'UserController@showByEmail');

    // only auth users can access to this routes
    Route::group(['middleware' => 'jwt.verify'], function (){
        Route::put('', 'UserController@updateAsAuth');
        Route::put('role/freelancer', 'UserController@addFreelancerRole');
        Route::put('role/company', 'UserController@addCompanyRole');
        Route::post('picture', 'UploadController@uploadUserPictureAsAuth');
        Route::delete('role/freelancer', 'UserController@removeFreelancerRole');
        Route::delete('role/company', 'UserController@removeCompanyRole');
        Route::delete('deactivate', 'UserController@deactivateAsAuth');
        Route::delete('{emailForPaypalPayment}', 'UserController@destroyAsAuth');

        // only admins can access to this routes
        Route::group(['prefix' => 'admin', 'middleware' => 'admin'], function () {
            Route::get('all', 'UserController@getUsers');
            Route::get('{id}', 'UserController@showAsAdmin');
            Route::get('{id}/activate', 'UserController@activate');
            Route::get('email/{search}', 'UserController@searchByEmailAsAdmin');
            Route::post('{id}/picture', 'UploadController@uploadUserPicture');
            Route::put('{id}', 'UserController@update');
            Route::put('{id}/role/{role}', 'UserController@addRoleAsAdmin');
            Route::put('{id}/ban', 'UserController@deactivate');
            Route::delete('{id}/{emailForPaypalPayment?}', 'UserController@destroy');
            Route::delete('{id}/role/{role}', 'UserController@removeRoleAsAdmin');
        });
    });
});


// PASSWORD RESET ROUTES
Route::group(['prefix' => 'password'], function() {
    Route::put('reset', 'PasswordResetController@resetPassword');
    Route::post('reset', 'PasswordResetController@sendPasswordReset')->name('password.reset');
});


// AUTH USER ROUTES
Route::group(['prefix' => 'auth'], function () {
    // oll can access to this routes
    Route::post('login', 'AuthController@login');
    Route::post('register', 'AuthController@register');
    Route::post('verify/resend', 'AuthController@resendVerificationEmail');
    Route::get('verify/{token}', 'AuthController@verifyUser');

    // only auth users can access to this routes
    Route::group(['middleware' => 'jwt.verify'], function(){
        Route::get('refresh', 'AuthController@refresh');
        Route::get('me', 'AuthController@me');
        Route::get('logout', 'AuthController@logout');
    });
});

// TRANSACTIONS ROUTES
Route::group(['prefix' => 'transactions', 'middleware' => 'jwt.verify'], function (){
    Route::group(['prefix' => 'myTransactions'], function (){
        Route::get('', 'TransactionController@getMyTransactions');
        Route::get('generatePDF', 'TransactionController@generatePDF');
        Route::post('addBalance/stripe', 'TransactionController@addBalanceWithStripe');
        Route::post('addBalance/paypal', 'TransactionController@addBalanceWithPaypal');
        Route::post('withdrawBalance/paypal', 'TransactionController@withdrawBalanceWithPaypalAsAuth');
    });

    // only admin users can access to this routes
    Route::group(['prefix' => 'admin', 'middleware' => 'admin'], function (){
        Route::get('{id}/all', 'TransactionController@getTransactionsAsAdmin');
    });
});


// ROLES ROUTES, only admin
Route::group(['prefix' => 'roles', 'middleware' => ['jwt.verify', 'admin']], function(){
    Route::get('', 'RoleController@index');
});

// CATEGORIES ROUTES
Route::group(['prefix' => 'categories'], function(){
    Route::get('', 'CategoryController@categories');
    Route::get('{name}', 'CategoryController@show');
    Route::get('{name}/freelancers', 'CategoryController@categoryAndItsFreelancers');

    // only admin can create, modify and delete categories
    Route::group(['prefix' => 'admin', 'middleware' => ['jwt.verify', 'admin']], function(){
        Route::get('all', 'CategoryController@categoriesAsAdmin');
        Route::get('{name}', 'CategoryController@showAsAdmin');
        Route::get('{id}/activate', 'CategoryController@activate');
        Route::post('', 'CategoryController@store');
        Route::post('{id}', 'CategoryController@update'); // should be put but laravel put doesn't catch form data files
        Route::delete('{id}/deactivate', 'CategoryController@deactivate');
        Route::delete('{id}', 'CategoryController@destroy');
    });
});

// SUBCATEGORIES ROUTES
Route::group(['prefix' => 'subcategories'], function(){
    Route::get('{name}', 'CategoryController@subcategories');

    Route::group(['prefix' => 'admin', 'middleware' => ['jwt.verify', 'admin']], function(){
        Route::get('{name}', 'CategoryController@subcategoriesAsAdmin');
    });
});

// SKILLS ROUTES
Route::group(['prefix' => 'skills'], function(){
    Route::get('', 'SkillController@getSkills');
    Route::get('{name}', 'SkillController@show');
    Route::get('category/{category}', 'SkillController@getSkillsOfACategory');
    Route::post('category/multiple', 'SkillController@getSkillsOfMultipleCategories');

    // only admin can create, modify and delete categories
    Route::group(['prefix' => 'admin', 'middleware' => ['jwt.verify', 'admin']], function(){
        Route::get('all', 'SkillController@getSkillsAsAdmin');
        Route::get('{name}', 'SkillController@showAsAdmin');
        Route::get('{id}/activate', 'SkillController@activate');
        Route::post('', 'SkillController@store');
        Route::put('{id}', 'SkillController@update');
        Route::delete('{id}/deactivate', 'SkillController@deactivate');
        Route::delete('{id}', 'SkillController@destroy');
    });
});

// COUNTRIES ROUTES
Route::group(['prefix' => 'countries'], function(){
    Route::get('', 'CountryController@index');
    // https://stackoverflow.com/questions/21552604/how-to-define-a-laravel-route-with-a-parameter-that-contains-a-slash-character
    Route::get('{name?}', 'CountryController@show')->where('name', '(.*)');
});

// REGIONS ROUTES
Route::group(['prefix' => 'regions'], function(){
    Route::get('{name?}', 'RegionController@show')->where('name', '(.*)');
});

// COMPANIES
Route::group(['prefix' => 'companies'], function(){
    Route::get('', 'CompanyController@getCompanies');
    Route::get('{name}', 'CompanyController@show');
    Route::get('user/{email}', 'CompanyController@getCompanyByUser');

    Route::group(['middleware' => 'jwt.verify'], function(){
        Route::group(['prefix' => 'myCompany'], function(){
            Route::post('','CompanyController@storeAsAuth');

            Route::group(['middleware' => 'company'], function(){
                Route::get('get', 'CompanyController@showWithTrashedAsAuth');
                Route::get('activate','CompanyController@activateAsAuth');
                Route::post('update','CompanyController@updateAsAuth'); // should be put but laravel put doesn't catch form data files
                Route::delete('deactivate','CompanyController@deactivateAsAuth');
                Route::delete('','CompanyController@destroyAsAuth');
            });
        });

        Route::group(['prefix' => 'admin', 'middleware' => 'admin'], function(){
            Route::get('all', 'CompanyController@getCompaniesAsAdmin');
            Route::get('{id}', 'CompanyController@showWithTrashed');
            Route::get('{id}/activate','CompanyController@activate');
            Route::get('user/{id}', 'CompanyController@getCompanyByUserAsAdmin');
            Route::post('','CompanyController@store');
            Route::post('{id}/update','CompanyController@update'); // should be put but laravel put doesn't catch form data files
            Route::put('{id}/ban','CompanyController@deactivate');
            Route::delete('{id}','CompanyController@destroy');
        });
    });
});

// FREELANCERS
Route::group(['prefix' => 'freelancers'], function(){
    Route::get('', 'FreelancerController@getFreelancers');
    Route::get('{id}', 'FreelancerController@show');
    Route::get('{freelancer}/portfolio','PortfolioController@show');
    Route::get('user/{email}', 'FreelancerController@getFreelancersByUser');
    Route::get('category/{name}/{limit}/{page?}', 'FreelancerController@getFreelancersByCategory');
    Route::get('skill/{name}/{limit}/{page?}', 'FreelancerController@getFreelancersBySkill');
    Route::get('top/{limit}/latest/{page?}', 'FreelancerController@getTopLatest');

    Route::group(['middleware' => 'jwt.verify'], function(){
        Route::group(['prefix' => 'myProfiles'], function(){
            Route::post('','FreelancerController@storeAsAuth');

            Route::group(['middleware' => 'freelancer'], function(){
                Route::get('all', 'FreelancerController@getFreelancersAsAuth');
                Route::get('{id}/get', 'FreelancerController@showWithTrashedAsAuth');
                Route::get('{id}/portfolio','PortfolioController@showWithTrashedAsAuth');
                Route::get('{id}/activate','FreelancerController@activateAsAuth');
                Route::post('{id}/update','FreelancerController@updateAsAuth'); // should be put but laravel put doesn't catch form data files
                Route::post('{id}/update/portfolio','PortfolioController@updateAsAuth'); // should be put but laravel put doesn't catch form data files
                Route::delete('{id}/deactivate','FreelancerController@deactivateAsAuth');
                Route::delete('{id}','FreelancerController@destroyAsAuth');
            });
        });

        Route::group(['prefix' => 'admin', 'middleware' => 'admin'], function(){
            Route::get('all', 'FreelancerController@getFreelancersAsAdmin');
            Route::get('{id}', 'FreelancerController@showWithTrashed');
            Route::get('{id}/portfolio','PortfolioController@showWithTrashed');
            Route::get('{id}/activate','FreelancerController@activate');
            Route::get('user/{id}', 'FreelancerController@getFreelancersByUserAsAdmin');
            Route::get('category/{id}', 'FreelancerController@getFreelancersByCategoryAsAdmin');
            Route::post('','FreelancerController@store');
            Route::post('{id}/update','FreelancerController@update'); // should be put but laravel put doesn't catch form data files
            Route::post('{id}/update/portfolio','PortfolioController@update');
            Route::put('{id}/ban','FreelancerController@deactivate');
            Route::delete('{id}','FreelancerController@destroy');
        });
    });
});

// PROJECTS
Route::group(['prefix' => 'projects'], function(){
    // ALL ZONE
    Route::get('', 'ProjectController@getProjects');
    Route::get('{id}', 'ProjectController@show');
    Route::get('freelancer/{id}', 'ProjectController@getAFreelancerAcceptedProjects');
    Route::get('company/{name}', 'ProjectController@getProjectsByCompany');
    Route::get('category/{name}/{limit}/{page?}', 'ProjectController@getProjectsByCategory');
    Route::get('skill/{name}/{limit}/{page?}', 'ProjectController@getProjectsBySkill');
    Route::get('top/{limit}/latest/{page?}', 'ProjectController@getTopLatest');

    // VERIFIED ZONE
    Route::group(['middleware' => 'jwt.verify'], function(){
        // FREELANCER ZONE
        Route::group(['prefix' => 'freelancers', 'middleware' => 'freelancer'], function(){
            Route::get('all', 'ProjectController@getAllMyFreelancersInProgressProjects');
        });

        // COMPANIES ZONE
        Route::group(['prefix' => 'companies', 'middleware' => 'company'], function(){
            Route::get('all', 'ProjectController@getCompanyProjectsAsAuth');
            Route::get('{id}/get', 'ProjectController@showWithTrashedAsAuth');
            Route::get('{id}/activate','ProjectController@activateAsAuth');
            Route::post('','ProjectController@storeAsAuth');
            Route::put('{id}','ProjectController@updateAsAuth');
            Route::put('{id}/toggleFinish', 'ProjectController@toggleProjectFinished');
            Route::delete('{id}/deactivate','ProjectController@deactivateAsAuth');
            Route::delete('{id}','ProjectController@destroyAsAuth');
        });

        // ADMIN ZONE
        Route::group(['prefix' => 'admin', 'middleware' => 'admin'], function(){
            // ADMIN COMPANIES ZONE
            Route::group(['prefix' => 'companies'], function(){
                Route::get('all', 'ProjectController@getProjectsAsAdmin');
                Route::get('{id}', 'ProjectController@showWithTrashed');
                Route::get('{id}/activate','ProjectController@activate');
                Route::get('company/{id}', 'ProjectController@getProjectsByCompanyAsAdmin');
                Route::get('category/{id}', 'ProjectController@getProjectsByCategoryAsAdmin');
                Route::post('{id}','ProjectController@store'); // comapny id
                Route::put('{id}','ProjectController@update');
                Route::put('{id}/ban','ProjectController@deactivate');
                Route::delete('{id}','ProjectController@destroy');
            });

        });
    });

});

// OFFERS
Route::group(['prefix' => 'offers', 'middleware' => 'jwt.verify'], function(){
    // FREELANCERs routes
    Route::group(['prefix' => 'freelancers', 'middleware' => 'freelancer'], function(){
        Route::get('{project}/myProfiles', 'OfferController@getMyOffersToAProject');
        Route::post('', 'OfferController@store');
        Route::put('{offer}', 'OfferController@update');
        Route::put('{offer}/take','OfferController@acceptOfferAsFreelancer');
        Route::put('{offer}/refuse','OfferController@refuseProjectAsFreelancer');
        Route::delete('{offer}','OfferController@destroy');
    });

    // COMPANIES routes
    Route::group(['prefix' => 'companies', 'middleware' => 'company'], function(){
        Route::get('{id}', 'OfferController@getMyProjectOffers');
        Route::put('{offer}/accept','OfferController@acceptOfferAsProjectOwner');
        Route::put('{offer}/cancel','OfferController@cancelOfferAsProjectOwner');
    });
});

// JOBS
Route::group(['prefix' => 'jobs', 'middleware' => 'jwt.verify'], function(){
    // FREELANCERS routes
    Route::group(['prefix' => 'freelancers', 'middleware' => 'freelancer'], function(){
      Route::put('{job}/hours', 'JobController@updateHours');
      Route::put('{offer}/{job}/cancel', 'JobController@cancelJobAsFreelancer');
    });
    // COMPANIES routes
    Route::group(['prefix' => 'companies', 'middleware' => 'company'], function(){
        Route::put('{offer}/{job}/finish', 'JobController@markAsFinished');
        Route::put('{offer}/{job}/cancel', 'JobController@cancelJobAsCompany');
        Route::put('{job}/rate', 'JobController@rate');
    });
});

// MESSAGES
Route::group(['prefix' => 'messages', 'middleware' => 'jwt.verify'], function(){
    Route::get('chats','MessageController@getChats');
    Route::get('unreads/count', 'MessageController@getUnreadsCount');
    Route::get('user/{user}', 'MessageController@getUserForNewChat');
    Route::get('{id}', 'MessageController@getMessages');
    Route::post('', 'MessageController@store');
    Route::put('{message}/read', 'MessageController@markAsRead');
    Route::put('chat/{id}/read', 'MessageController@markChatAsRead');
});

Route::group(['prefix' => 'internal', 'middleware' => ['jwt.verify','admin']], function(){
    Route::get('sockets/serve', 'InternalCommandController@socketsServe');
});
