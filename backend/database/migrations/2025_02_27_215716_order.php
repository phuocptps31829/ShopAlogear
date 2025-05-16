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
        Schema::create('order', function (Blueprint $table) {
            $table->id();
            $table->string('fullName')->nullable()->index();
            $table->string('phone')->nullable()->index();
            $table->string('email')->nullable()->index();
            $table->string('address')->nullable();
            $table->string('unit')->nullable();
            $table->string('link')->nullable();
            $table->string('shippingCode')->nullable();
            $table->string('code')->nullable()->index();
            $table->unsignedBigInteger('userID')->nullable()->index();
            $table->timestamp('time')->nullable()->index();
            $table->integer('type')->nullable()->index()->comment('Loại thanh toán: 1 tại cửa hàng, 2 là chuyển khoản');
            $table->integer('status')->nullable()->index()->comment('0: Đã hủy, 1: Chờ xử lí, 2: Đợi giao hàng, 3: Đã giao hàng');
            $table->boolean('success')->nullable()->index()->comment(' 0: chưa hoàn tất, 1: Hoàn tất');
            $table->foreign('userID')->references('id')->on('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order');
    }
};
