export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-2 text-3xl font-bold text-[#0F172A]">Privacy Policy</h1>
      <p className="mb-6 text-sm text-[#475569]">Last updated: {new Date().toLocaleDateString()}</p>
      <section className="mb-6">
        <h2 className="mb-2 text-xl font-semibold text-[#0F172A]">Local-first processing</h2>
        <p className="text-[#475569]">Your Instagram export files are processed directly in your browser. We don’t upload or store your files on our servers.</p>
      </section>
      <section className="mb-6">
        <h2 className="mb-2 text-xl font-semibold text-[#0F172A]">AI usage</h2>
        <p className="text-[#475569]">When enabled, we may use Google AI to enrich labels. This does not store your files and is optional. The assistant feature is coming soon.</p>
      </section>
      <section className="mb-6">
        <h2 className="mb-2 text-xl font-semibold text-[#0F172A]">Data retention</h2>
        <p className="text-[#475569]">We do not retain your export files. Any anonymous usage metrics contain no personal data.</p>
      </section>
      <section>
        <h2 className="mb-2 text-xl font-semibold text-[#0F172A]">Contact</h2>
        <p className="text-[#475569]">Questions? Email <a className="text-[#2563EB] underline" href="mailto:hello@unfollowr.app">hello@unfollowr.app</a>.</p>
      </section>
    </main>
  );
}


