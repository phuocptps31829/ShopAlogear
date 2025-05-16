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
        Schema::create('coupon', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('code')->nullable();
            $table->integer('discount')->nullable();
            $table->double('percent')->nullable();
            $table->timestamp('startTime')->nullable()->index();
            $table->timestamp('endTime')->nullable()->index();
            $table->integer('type')->nullable()->index()->comment('1: giảm trên giá, 2: giảm theo %');
            $table->boolean('status')->nullable()->index()->comment('1: hiển thị, 0: ẩn');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coupon');
    }
};
