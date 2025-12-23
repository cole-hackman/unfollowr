"use client";
import { Hero } from "@/app/(site)/components/Hero";
import { UploadCard } from "@/components/UploadCard";
import { Timeline } from "@/components/Timeline";
import { FAQ } from "@/components/FAQ";
import { InsightsRow } from "@/components/InsightsRow";
import { PrivacyNext } from "@/components/PrivacyNext";
import type { ReactNode } from "react";

type Props = {
  seoIntro: ReactNode;
};

export function HomeClient({ seoIntro }: Props) {
  return (
    <>
      <Hero />
      {seoIntro}
      <UploadCard onFilesReady={(files) => {
        const usernames: string[] = [];
        window.dispatchEvent(new CustomEvent("unfollowr-dataset", { detail: usernames.map(u=>({ username:u })) }));
        location.href = "/results";
      }} />
      <InsightsRow />
      <Timeline />
      <FAQ />
      <PrivacyNext />
    </>
  );
}
