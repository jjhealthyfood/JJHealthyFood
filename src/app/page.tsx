import type { Metadata } from "next";
import { OrderStatusBar } from "@/components/landing/order-status-bar";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { BrandRibbon, DeliveryRibbon } from "@/components/landing/brand-ribbon";
import { WeeklyMenu } from "@/components/landing/weekly-menu";
import { HowItWorks } from "@/components/landing/how-it-works";
import { MenuSection } from "@/components/landing/menu-section";
import { Difference } from "@/components/landing/difference";
import { Reviews } from "@/components/landing/reviews";
import { CtaBanner } from "@/components/landing/cta-banner";
import { Footer } from "@/components/landing/footer";
import { StickyOrderButton } from "@/components/landing/sticky-order-button";
import { SuggestionBox } from "@/components/landing/suggestion-box";

export const metadata: Metadata = {
  title: "JJ Meals — Fresh, Healthy Meal Prep in Florida",
  description:
    "Build your healthy meal week in minutes. Freshly prepared, fully customizable healthy meal prep with pickup or delivery across Florida.",
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FFFBEA] font-sans text-[#17330A] selection:bg-[#FDC305] selection:text-[#17330A]">
      <OrderStatusBar />
      <Navbar />
      <main className="flex-1">
        <Hero />
        <div className="hidden lg:block">
          <BrandRibbon />
        </div>
        <WeeklyMenu />
        <HowItWorks />
        <MenuSection />
        <Difference />
        <DeliveryRibbon />
        <Reviews />
        <CtaBanner />
        <SuggestionBox />
      </main>
      <Footer />
      <StickyOrderButton />
    </div>
  );
}
