<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ImageUpload extends Model
{
    use HasFactory;
    protected $fillable = [
        'image',
        'size',
        'type',
        'status',
    ];

    protected $table = 'image_upload';
}
