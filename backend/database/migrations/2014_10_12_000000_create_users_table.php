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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('username')->nullable();
            $table->string('email')->unique()->index()->nullable();
            $table->string('phone')->unique()->index()->nullable();
            $table->string('avatar')->nullable();
            $table->integer('auth')->nullable()->comment('1 -> tài khoản mật khẩu, 2 -> login google');
            $table->integer('isActive')->nullable();
            $table->integer('role')->nullable()->comment('1 - Admin, 0 - User');
            $table->string('address')->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
