import { HomeClient } from "@/components/HomeClient";
import { SEOIntro } from "@/components/SEOIntro";
import { SEOBottom } from "@/components/SEOBottom";
import { LearnMoreLinks } from "@/components/LearnMoreLinks";

export default function Home() {
  return (
    <>
      {/* Interactive client components with server-rendered SEO intro passed as children */}
      <HomeClient seoIntro={<SEOIntro />} />
      
      {/* Server-rendered SEO content at bottom */}
      <LearnMoreLinks />
      <SEOBottom />
    </>
  );
}
