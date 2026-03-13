import { HomeClient } from "@/components/HomeClient";
import { SEOIntro } from "@/components/SEOIntro";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Instagram Unfollowers Tracker — Free, No Login | Unfollowr",
  description: "See who unfollowed you on Instagram using your data export. Free, no login, private, processed locally.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return <HomeClient seoIntro={<SEOIntro />} />;
}
