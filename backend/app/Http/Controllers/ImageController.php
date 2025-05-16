<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ImageController extends Controller
{
    function uploadImages(Request $request)
    {
        try {
            if (!$request->hasFile('file')) {
                return createError(400, 'Không có ảnh tải lên!');
            }

            $images = $request->file('file');
            $uploadedImages = [];

            foreach ($images as $image) {
                if (checkValidImage($image)) {
                    return createError(400, 'Không có ảnh tải lên!');
                }
                $uploadedImages[] = uploadImage($image);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Thêm ảnh thành công!',
                'data' => $uploadedImages,
            ], 201);
        } catch (\Exception $e) {

            return handleException($e);
        }
    }
}
