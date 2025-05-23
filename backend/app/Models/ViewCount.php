<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ViewCount extends Model
{
    use HasFactory;
    protected $fillable = [
        'productID',
        'count',
    ];
    protected $table = 'view_count';
}
