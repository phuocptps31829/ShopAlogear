<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cooperate extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'detail',
        'description',
        'link',
        'image',
        'number',
        'viewCount',
        'status',
        'type'
    ];

    protected $table = 'cooperate';
}
