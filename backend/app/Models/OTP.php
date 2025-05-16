<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OTP extends Model
{
    use HasFactory;
    protected $fillable = [
        'otp',
        'email',
        'time'
    ];

    protected $table = 'otp';
}
