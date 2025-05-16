import { Link } from "react-router-dom";
import { FaFacebookSquare, FaYoutube } from "react-icons/fa";
import { AiFillTikTok } from "react-icons/ai";
import "react-loading-skeleton/dist/skeleton.css";
// import dmca from "../../assets/images/dmca-website-logo-2022.png";
import bct from "../../assets/images/logo-da-thong-bao-bo-cong-thuong.webp";

export default function Footer() {
  return (
    <footer className="bg-gray-100 cps-footer">
      <div className="mx-auto max-w-screen-xl px-3 py-2 text-sm text-black sm:px-5 lg:pt-2 lg:pb-3">
        <div className="flex flex-col justify-between gap-2 border-b-[1px] border-slate-300 lg:flex-row lg:gap-5">
          <div className="flex-[2]">
            <ul className="mt-6">
              <li className="pb-3">
                <p>
                  <strong className="font-medium">Hotline: </strong>
                  <span className="text-sm font-normal">096 177 97 95</span>
                </p>
              </li>
              <li className="pb-3">
                <p>
                  <strong className="font-medium">Email: </strong>
                  <span className="text-sm font-normal">
                    alogear.vn@gmail.com
                  </span>
                </p>
              </li>
              <li className="pb-3">
                <div className="flex md:flex-row flex-col gap-2">
                  <strong className="font-medium">Địa chỉ: </strong>
                  <div className="text-sm font-normal flex-col flex">
                    <ul className="ml-5">
                      <li className="list-disc">351/6 ấp Long Thành, Long Trì, Châu Thành, Long An 82200, Việt Nam</li>
                      <li className="list-disc">QL13/108 đường số 10, Khu đô Thị Vạn Phúc, Thủ Đức, Hồ Chí Minh 700000, Việt Nam</li>
                    </ul>
                  </div>
                </div>
              </li>
            </ul>
          </div>
          <div className="flex flex-wrap justify-between gap-3">
            <div>
              <h6 className="pb-2 text-lg font-semibold">Vị trí AloGear:</h6>
              <div className="w-[200px] h-[100px] overflow-hidden shadow-sm border border-gray-300 rounded-sm">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3944.4970534570302!2d106.4444294!3d10.4168695!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x310ab3ee9541ca11%3A0x7d362d92ce9c2dd2!2sAloGear.vn!5e1!3m2!1svi!2s!4v1739966167857!5m2!1svi!2s"
                  width="200"
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>
          <div className="flex  flex-wrap justify-between gap-3">
            <div className="mt-9">
              <ul>
                <li className="pb-2">
                  <Link
                    to=""
                    className="text-sm font-normal"
                  >
                    Hướng dẫn mua hàng
                  </Link>
                </li>
                <li className="pb-2">
                  <Link
                    to=""
                    className="text-sm font-normal"
                  >
                    Chính sách thanh toán
                  </Link>
                </li>
                <li className="pb-2">
                  <Link
                    to=""
                    className="text-sm font-normal"
                  >
                    Chính sách vận chuyển
                  </Link>
                </li>
                <li className="pb-2">
                  <Link
                    to=""
                    className="text-sm font-normal"
                  >
                    Chính sách bảo hành
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-3 pt-3 lg:flex-row lg:gap-10">
          <div className="grow">
            <h6 className="pb-3 font-semibold">
              CÔNG TY TNHH NHẠC CỤ ÂM NHẠC ALOGEAR
            </h6>
            <p className="text-[12px] font-normal text-gray-500">
              Mã số doanh nghiệp: 0103658880. Giấy chứng nhận đăng ký doanh
              nghiệp do Sở Kế hoạch và Đầu tư TP Hà Nội cấp lần đầu ngày
              23/03/2009
            </p>
          </div>
          <div className="flex justify-between gap-10 flex-row flex-wrap sm:flex-nowrap">
            <div className="flex-1 mt-1">
              <h6 className="pb-2 text-md font-semibold whitespace-nowrap">
                ALOGEAR SOCIAL
              </h6>
              <div className="flex gap-3">
                <Link
                  to="https://www.facebook.com/alogear.vn"
                  className="text-sm font-normal"
                  target="_blank"
                >
                  <FaFacebookSquare className="text-2xl" />
                </Link>
                <Link
                  to="https://www.tiktok.com/@alogear.vn"
                  className="text-sm font-normal"
                  target="_blank"
                >
                  <AiFillTikTok className="text-2xl" />
                </Link>
                <Link
                  to="https://www.youtube.com/@AloGear"
                  className="text-sm font-normal"
                  target="_blank"
                >
                  <FaYoutube className="text-2xl" />
                </Link>
              </div>
            </div>
            <div className="flex flex-col flex-1 lg:mt-0 items-end space-y-2">
              <div className="sm:w-[100px] w-[100px]">
                <img src={bct} className="w-full h-auto" alt="Notification" />
              </div>
              <div className="sm:w-[120px] w-[100px] flex justify-end">
                <a target="_blank" href="https://www.dmca.com/Protection/Status.aspx?ID=c385ef26-1cdc-43d5-b18c-65ebaee24ee1&refurl=https://alogear.vn/" title="DMCA.com Protection Status" className="dmca-badge"> <img src ="https://images.dmca.com/Badges/dmca-badge-w100-5x1-09.png?ID=c385ef26-1cdc-43d5-b18c-65ebaee24ee1"  alt="DMCA.com Protection Status" /></a>  <script src="https://images.dmca.com/Badges/DMCABadgeHelper.min.js"> </script>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
