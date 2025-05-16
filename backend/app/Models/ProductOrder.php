<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductOrder extends Model
{
    use HasFactory;
    protected $fillable = [
        'productID',
        'orderID',
        'colorID',
        'quantity',
        'price',
    ];
    public function product()
    {
        return $this->belongsTo(Product::class, 'productID');
    }
    protected $table = 'product_order';
}
