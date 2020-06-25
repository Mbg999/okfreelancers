<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateJobsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('jobs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('project_id');
            $table->unsignedBigInteger('freelancer_id');
            $table->unsignedSmallInteger('hours')->default(0);
            $table->float('price_hour',10,2,1)->default(0);
            $table->timestamp('finished')->nullable();
            $table->unsignedTinyInteger('rate')->nullable();
            $table->string('assessment', 500)->nullable();
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
        Schema::dropIfExists('jobs');
    }
}
