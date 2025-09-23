"use client";
import { Hero } from "./(site)/components/Hero";
import { UploadCard } from "@/components/UploadCard";
// import { GoogleAIBadge } from "@/components/GoogleAIBadge";
import { Timeline } from "@/components/Timeline";
import { FAQ } from "@/components/FAQ";
import { InsightsRow } from "@/components/InsightsRow";
import { PrivacyNext } from "@/components/PrivacyNext";

export default function Home() {
  return (
    <>
      <Hero />
      <UploadCard onFilesReady={(files) => {
        const usernames: string[] = [];
        window.dispatchEvent(new CustomEvent("unfollowr-dataset", { detail: usernames.map(u=>({ username:u })) }));
        location.href = "/results";
      }} />
      {null}
      <InsightsRow />
      <Timeline />
      {null}
      <FAQ />
      <PrivacyNext />
      {null}
    </>
  );
}
