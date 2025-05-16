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

        Schema::create('image_upload', function (Blueprint $table) {
            $table->id();
            $table->string('image')->nullable();
            $table->double('size')->nullable()->index()->comment('giá trị kb');
            $table->integer('status')->nullable()->index()->comment('1: sử dụng, 0: đã xóa, 2: đã xóa khỏi dự án');
            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('image_upload');
    }
};
