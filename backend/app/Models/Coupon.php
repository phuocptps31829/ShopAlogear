<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'code',
        'discount',
        'percent',
        'status',
        'type',
        'startTime',
        'endTime',
    ];

    protected $table = 'coupon';
}
