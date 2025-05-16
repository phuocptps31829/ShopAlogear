import SidebarMenu from "./SidebarMenu";
import MainBanner from "./MainBanner";
import PromoAds from "./PromoAds";

export default function HomeTopSection() {
  return (
    <div className="mx-auto max-w-screen-xl px-3 md:px-5 py-4">
      <div className="grid xl:grid-cols-[235px_auto_235px] lg:grid-cols-[235px_auto] grid-cols-1 gap-4">
        <SidebarMenu />
        <MainBanner />
        <PromoAds />
      </div>
    </div>
  );
}
