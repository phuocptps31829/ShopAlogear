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
        Schema::create('category', function (Blueprint $table) {
            $table->id();
            $table->string('name')->index();
            $table->string('slug')->index()->unique();
            $table->string('icon')->nullable();
            $table->unsignedBigInteger('parent')->nullable()->index();
            $table->integer('number')->nullable()->index();
            $table->string('sort')->nullable()->index();
            $table->integer('type')->nullable()->comment("1:product, 2:service")->index();
            $table->boolean('status')->nullable()->index()->comment('1: hiển thị, 0: ẩn');
            $table->boolean('display')->nullable()->default(0)->comment('0: không hiển thị , 1: hiển thị danh mục');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('category');
    }
};
