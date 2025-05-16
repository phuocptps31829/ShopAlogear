<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
class RevokedToken extends Model
{
    use HasFactory;
    protected $fillable = [
        'token',
    ];
    protected $table = 'revoked_token';
}
