<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductSale extends Model
{
    use HasFactory;
    protected $fillable = [
        'productID',
        'saleID',
        'discount',
        'number',
        'percent',
    ];
    public function product()
    {
        return $this->belongsTo(Product::class, 'productID');
    }
    protected $table = 'product_sale';

}
