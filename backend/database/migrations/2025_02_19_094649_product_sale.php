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
        Schema::create('product_sale', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('productID')->index();
            $table->unsignedBigInteger('saleID')->index();
            $table->foreign('productID')->references('id')->on('product')->onDelete('cascade');
            $table->foreign('saleID')->references('id')->on('sale')->onDelete('cascade');
            $table->integer('number')->nullable();
            $table->integer('discount')->nullable();
            $table->integer('percent')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_sale');
    }
};
