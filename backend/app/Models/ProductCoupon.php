<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductCoupon extends Model
{
    use HasFactory;
    protected $fillable = [
        'productID',
        'couponID',
    ];

    protected $table = 'product_coupon';
}
