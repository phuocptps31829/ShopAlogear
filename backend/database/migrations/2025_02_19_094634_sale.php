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
        Schema::create('sale', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->dateTime('startTime')->nullable()->index();
            $table->dateTime('endTime')->nullable()->index();
            $table->integer('number')->nullable()->index();
            $table->integer('type')->nullable()->index()->comment('1: Flash Sale, 2: sale đặt biệt');
            $table->boolean('status')->nullable()->index()->comment('1: hiển thị, 0: ẩn');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sale');
    }
};
