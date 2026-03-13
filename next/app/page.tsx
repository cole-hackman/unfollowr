import { HomeClient } from "@/components/HomeClient";
import { SEOIntro } from "@/components/SEOIntro";

export default function Home() {
  return <HomeClient seoIntro={<SEOIntro />} />;
}
