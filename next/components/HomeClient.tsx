"use client";
import { Hero } from "@/app/(site)/components/Hero";
import { UploadCard } from "@/components/UploadCard";
import { WhyUnfollowr } from "@/components/Timeline";
import { HowItWorks } from "@/components/HowItWorks";
import { FAQ } from "@/components/FAQ";
import { PrivacyNext } from "@/components/PrivacyNext";
import { LearnMoreLinks } from "@/components/LearnMoreLinks";
import type { ReactNode } from "react";

type Props = {
  seoIntro: ReactNode;
};

export function HomeClient({ seoIntro }: Props) {
  return (
    <>
      <Hero />
      <UploadCard onFilesReady={() => {}} />
      <WhyUnfollowr />
      <HowItWorks />
      <FAQ />
      <PrivacyNext />
       <LearnMoreLinks />
      {seoIntro}
    </>
  );
}
