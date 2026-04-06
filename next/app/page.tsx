import { HomeClient } from "@/components/HomeClient";
import { SEOIntro } from "@/components/SEOIntro";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Instagram Unfollowers Tracker — Free, No Login | Unfollowr",
  description: "See who unfollows you on Instagram using your own data export. Unfollowr analyzes JSON/HTML offline—no login, 100% private. Upload your Instagram export today.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return <HomeClient seoIntro={<SEOIntro />} />;
}
