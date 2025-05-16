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
        Schema::create('image', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('productID');
            $table->unsignedBigInteger('colorID')->nullable();
            $table->string('image');
            $table->integer('number');
            $table->boolean('status')->nullable()->index()->comment('1: hiển thị, 0: ẩn');
            $table->timestamps();
            $table->foreign('productID')->references('id')->on('product')->onDelete('cascade');
            $table->foreign('colorID')->references('id')->on('color')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('image');
    }
};
