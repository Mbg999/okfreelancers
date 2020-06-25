<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('email', 191)->unique(); // mysql server throws an error for longer lengths
            $table->string('password', 80);
            $table->string('name', 100);
            $table->string('surnames', 100);
            $table->date('born_date');
            $table->string('phone', 25)->nullable();
            $table->string('picture', 100)->nullable();
            $table->float('balance', 10,2, 1)->default(0);
            $table->string('address', 100)->nullable();
            $table->string('address_description', 500)->nullable();
            $table->string('zip', 12)->nullable();
            $table->string('town', 80)->nullable();
            $table->string('region', 80)->nullable();
            $table->string('country', 80)->nullable();
            $table->string('github', 100)->nullable();
            $table->string('linkedin', 100)->nullable();
            $table->string('twitter', 100)->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->boolean('ban')->default(0);
            $table->string('ban_reason', 500)->nullable();
            // $table->rememberToken(); // i don't need this one, i won't use sessions https://laravel.com/docs/5.1/authentication
            $table->timestamps();
            $table->timestamp('last_password_update')->useCurrent();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('users');
    }
}
