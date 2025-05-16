<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'slug',
        'description',
        'detail',
        'price',
        'discount',
        'percent',
        'status',
        'quantity',
        'code',
        'viewCount',
        'iframe',
        'type',
        'brandID'
    ];
    public function images()
    {
        return $this->hasMany(Image::class, 'productID', 'id');
    }
    public function options()
    {
        return $this->hasMany(Option::class, 'productID', 'id');
    }
    public function brand()
    {
        return $this->belongsTo(Brand::class, 'brandID', 'id')->select(['id', 'name']);
    }
protected $table = 'product';
}
