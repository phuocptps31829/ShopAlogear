<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'fullName',
        'phone',
        'email',
        'address',
        'code',
        'time',
        'shippingCode',
        'link',
        'unit',
        'type',
        'status',
        'userID',
        'success'
    ];
    public function productOrder()
    {
        return $this->hasMany(ProductOrder::class, 'orderID', 'id');
    }
    public function user()
    {
        return $this->belongsTo(User::class, 'userID', 'id');
    }
    protected $table = 'order';
}
