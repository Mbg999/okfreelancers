<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFreelancerSkillTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('freelancer_skill', function (Blueprint $table) {
            $table->unsignedBigInteger('skill_id');
            $table->unsignedBigInteger('freelancer_id');

            $table->foreign('skill_id')
                ->references('id')->on('skills')
                ->onDelete('cascade');

            $table->foreign('freelancer_id')
                ->references('id')->on('freelancers')
                ->onDelete('cascade');

            $table->primary(['skill_id', 'freelancer_id']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('skill_freelancer');
    }
}
