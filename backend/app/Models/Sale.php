<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'startTime',
        'endTime',
        'type',
        'number',
        'status'
    ];
    public function productSales()
    {
        return $this->hasMany(ProductSale::class, 'saleID', 'id');
    }
    protected $table = 'sale';

}
