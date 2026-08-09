# README questions — needs Cole's input

1. **Problem provenance (PM line).** One sentence on how you knew this was a
   real problem (own experience? friends handing passwords to tracker apps?).
   `<!-- TODO: verify -->` sits in the draft where it belongs.

2. **License.** The old README and its badge claim MIT, but there is no
   LICENSE file in the repo. The draft omits the claim. Add the file or leave
   it unlicensed?

3. **Google ranking claim.** The old README said "ranks #2 on Google for
   target queries." Not verifiable from the repo, so it's cut. If you want a
   discoverability line, it needs a source (Search Console screenshot, dated).

4. **Where is the Flask service deployed?** The README describes it as the
   live analytics collector (the 278-analyses figure implies events are being
   recorded somewhere). No deploy config exists in the repo — confirm it's
   actually running in production and where, or I should soften that wording.
