<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCompaniesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->unique();
            $table->string('name', 100)->unique();
            $table->string('description', 1000)->nullable();
            $table->string('logo', 100)->nullable();
            $table->string('address', 100)->nullable();
            $table->string('address_description', 500)->nullable();
            $table->string('zip', 12)->nullable();
            $table->string('town', 80)->nullable();
            $table->string('region', 80)->nullable();
            $table->string('country', 80)->nullable();
            $table->string('web', 100)->nullable();
            $table->string('github', 100)->nullable();
            $table->string('linkedin', 100)->nullable();
            $table->string('twitter', 100)->nullable();
            $table->boolean('ban')->default(0);
            $table->string('ban_reason', 500)->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('user_id')
                ->references('id')->on('users')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('companies');
    }
}
