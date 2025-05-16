<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('banner', function (Blueprint $table) {
            $table->id();
            $table->string('image')->nullable();
            $table->integer('number')->nullable()->index();
            $table->string('link')->nullable()->index();
            $table->integer('type')->nullable()->index()->comment('1: banner slide, 2: banner phụ, 3: logo');
            $table->boolean('status')->nullable()->index()->comment('1: hiển thị, 0: ẩn');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('banner');
    }
};
