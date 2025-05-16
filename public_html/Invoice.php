<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Mongodb\Laravel\Eloquent\Model;
use MongoDB\BSON\ObjectId;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'appointmentID',
        'prescriptionID',
        'price',
        'arisePrice',
        "invoiceCode",
        "prescriptionID"
    ];

    protected $casts = [
        'price' => 'integer',
        'arisePrice' => 'integer'
    ];
    const CREATED_AT = 'createdAt';
    const UPDATED_AT = 'updatedAt';

    public function setAppointmentIDAttribute($value)
    {
        $this->attributes['appointmentID'] = new ObjectId($value);
    }
    public function setPrescriptionIDAttribute($value)
    {
        $this->attributes['prescriptionID'] = new ObjectId($value);
    }
    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            $model->invoiceCode = generateInvoiceCode();
        });

        static::deleting(function ($model) {
                throw new \App\Exceptions\DataExistsException('Không thể xóa!');
        });
    }
    public function getTable()
    {
        return 'Invoice';
    }

}
