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
        Schema::create('cooperate', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('detail')->nullable();
            $table->string('description')->nullable();
            $table->text('link')->nullable();
            $table->string('image')->nullable();
            $table->integer('viewCount')->nullable();
            $table->integer('number')->index()->nullable();
            $table->integer('type')->index()->nullable()->comment('1:youtube,2:redirect');
            $table->boolean('status')->nullable()->index()->comment('1: hiển thị, 0: ẩn');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cooperate');
    }
};
