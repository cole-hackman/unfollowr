export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-2 text-3xl font-bold text-[#0F172A]">Terms of Service</h1>
      <p className="mb-6 text-sm text-[#475569]">Last updated: {new Date().toLocaleDateString()}</p>

      <section className="mb-6">
        <h2 className="mb-2 text-xl font-semibold text-[#0F172A]">Acceptance of Terms</h2>
        <p className="text-[#475569]">By using Unfollowr, you agree to these Terms and our Privacy Policy.</p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-xl font-semibold text-[#0F172A]">Use of the Service</h2>
        <ul className="list-disc space-y-1 pl-5 text-[#475569]">
          <li>You must comply with Instagram’s terms and all applicable laws.</li>
          <li>You may not misuse the service or attempt to disrupt it.</li>
          <li>The tool is provided for personal analytics of your exported data.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-xl font-semibold text-[#0F172A]">Disclaimers</h2>
        <p className="text-[#475569]">The service is provided “as is” without warranties of any kind. We do not guarantee accuracy or availability.</p>
      </section>

      <section>
        <h2 className="mb-2 text-xl font-semibold text-[#0F172A]">Contact</h2>
        <p className="text-[#475569]">Questions about these terms? Email <a className="text-[#2563EB] underline" href="mailto:hello@unfollowr.app">hello@unfollowr.app</a>.</p>
      </section>
    </main>
  );
}


