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
        Schema::create('product', function (Blueprint $table) {
            $table->id();
            $table->string('name')->index();
            $table->string('slug')->index();
            $table->text('description')->nullable();
            $table->text('detail')->nullable();
            $table->integer('price')->nullable()->index();
            $table->integer('discount')->nullable()->index();
            $table->double('percent')->nullable();
            $table->boolean('status')->nullable()->index()->comment('1: hiển thị, 0: ẩn');
            $table->integer('quantity')->nullable();
            $table->integer('viewCount')->default(0)->index();
            $table->string('code')->nullable()->index()->unique();
            $table->text('iframe')->nullable();
            $table->unsignedBigInteger('brandID')->nullable();
            $table->integer('type')->index()->comment("2: Sp liên hệ, 1: Sp có giá, 3: dịch vụ");
            $table->foreign('brandID')->references('id')->on('brand')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product');
    }
};
