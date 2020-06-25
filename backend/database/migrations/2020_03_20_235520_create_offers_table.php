<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateOffersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('offers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('project_id');
            $table->unsignedBigInteger('freelancer_id');
            $table->float('price',10,2, 1)->default(0);
            $table->unsignedSmallInteger('approx_hours')->default(10);
            $table->unsignedSmallInteger('approx_term')->default(7);
            $table->string('message', 1000);
            $table->float('company_deposit', 10,2,1)->default(0);
            $table->float('freelancer_deposit', 10,2,1)->default(0);
            $table->timestamps();

            $table->foreign('project_id')
                ->references('id')->on('projects')
                ->onDelete('cascade');

            $table->foreign('freelancer_id')
                ->references('id')->on('freelancers')
                ->onDelete('cascade');

            $table->unique(['project_id', 'freelancer_id']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('offers');
    }
}
