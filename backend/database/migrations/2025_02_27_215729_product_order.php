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
        Schema::create('product_order', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('productID');
            $table->foreign('productID')->references('id')->on('product')->onDelete('cascade');
            $table->unsignedBigInteger('orderID');
            $table->foreign('orderID')->references('id')->on('order')->onDelete('cascade');
            $table->unsignedBigInteger('colorID')->nullable();
            $table->foreign('colorID')->references('id')->on('color')->onDelete('cascade');
            $table->integer('quantity')->nullable();
            $table->integer('price')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_order');
    }
};
