<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCategoriesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('father_id')->nullable();
            $table->string('name_es', 50);
            $table->string('name_en', 50);
            $table->string('description_es', 255);
            $table->string('description_en', 255);
            $table->string('title_color',30);
            $table->string('text_color', 30);
            $table->string('background_color', 30);
            $table->string('image', 100)->nullable();
            $table->string('portfolio_type', 15)->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('father_id')
                ->references('id')->on('categories')
                ->onDelete('cascade');

            $table->unique(['father_id', 'name_es']);
            $table->unique(['father_id', 'name_en']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('categories');
    }
}
