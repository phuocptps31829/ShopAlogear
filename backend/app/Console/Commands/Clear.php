<?php

namespace App\Console\Commands;

use App\Models\ImageUpload;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductOrder;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class Clear extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:clear';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->createSiteMap();
        $this->imageDelete();
        $this->deleteOldOrders();
    }
    public function imageDelete()
    {
        // Lấy danh sách ảnh có type = 2
        $imageDelete = ImageUpload::where("status", "=", 2)->get();
        if ($imageDelete->isNotEmpty()) {
            foreach ($imageDelete as $image) {
                $imagePath = public_path('images/' . $image->image);

                if (File::exists($imagePath)) {
                    File::delete($imagePath);
                }

                $image->delete();
            }
        }
    }

    public function deleteOldOrders()
    {
        $orders = Order::where('success', '!=', 1)
            ->where('created_at', '<', Carbon::now()->subDays(2))
            ->whereNull('userID')
            ->get();

        if ($orders->isNotEmpty()) {
            foreach ($orders as $order) {
                ProductOrder::where("orderID", $order->id)->delete();
                $order->delete();
            }
        }

    }
    public function createSiteMap()
    {
        // Đường dẫn của file sitemap cần lưu
        $sitemapPath = 'E:\www\alogear/public_html/sitemap.xml'; // Đảm bảo đây là đường dẫn ngoài thư mục Laravel
//        $sitemapPath = '/home/awsoslvv/public_html/sitemap.xml'; // URL hosting

        // Dữ liệu cho sitemap (2 đường dẫn ưu tiên)
        $urls = [
            'https://alogear.vn',
            'https://alogear.vn/category/products',
        ];

        // Thêm các sản phẩm vào sitemap
        $products = Product::all(); // Lấy tất cả sản phẩm, tùy vào cách bạn lấy danh sách sản phẩm

        foreach ($products as $product) {
            if($product->type==3){
                $urls[] = 'https://alogear.vn/services/' . $product->slug;
            }else{
                $urls[] = 'https://alogear.vn/products/' . $product->slug;
            }
        }

        // Tạo nội dung cho sitemap
        $sitemapContent = $this->generateSitemapXml($urls);

        // Lưu file sitemap vào public_html
        File::put($sitemapPath, $sitemapContent);

        $this->info('Sitemap generated and submitted to Google!');
    }
    private function generateSitemapXml(array $urls)
    {
        $xmlContent = '<?xml version="1.0" encoding="UTF-8"?>';
        $xmlContent .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

        foreach ($urls as $url) {
            $xmlContent .= '<url>';
            $xmlContent .= '<loc>' . $url . '</loc>';
            $xmlContent .= '<lastmod>' . now()->toAtomString() . '</lastmod>'; // Cập nhật thời gian hiện tại
            $xmlContent .= '</url>';
        }

        $xmlContent .= '</urlset>';

        return $xmlContent;
    }

}
