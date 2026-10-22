# Demo script (3 minutes)

Before you start: open the live site 5 minutes earlier (wakes the free server), use Chrome, allow the microphone,
and keep a screen recording of a perfect run as a backup.

**0:00 Hook (20s).** "Millions of families miss benefits they qualify for. Not because the schemes don't exist, but
because the information is scattered, in English, and hard to follow. We built Sahaya Setu."

**0:20 Problem (20s).** "Existing portals list schemes one by one and expect you to read and type. The people who miss
out most often can't."

**0:40 Live demo, voice (70s).**
1. Open the site, switch language to Telugu, click **Check my schemes**. Choose **Andhra Pradesh**.
2. Press the mic and say a sentence in your language (or type it in "tell us about yourself").
3. Show answers arriving by voice for the remaining questions. Press 🔊 to read a question aloud.
4. Results: point at the **"you may get up to ₹X per year"** total, open one scheme, show **documents**, **how to apply**,
   **official link** and **last checked** date.
5. Show the **"one more question"** card for a scheme that needed one more answer.

**1:50 Scale (30s).** Go back, choose **Telangana (beta)**. "Same engine, different state. Adding a state means adding
data files, not changing code. Andhra Pradesh is just our starting point."

**2:20 Trust and proof (30s).** "Every scheme shows where its rules came from and when we last checked. Unsure answers
never become false promises. We never ask for Aadhaar or any ID number." Then show your user-testing numbers from
`/feedback/summary`: "N people tested it, X% found it helpful, on average Y schemes found."

**2:50 Close (10s).** "Next: more states, more languages, WhatsApp, and village help-desk kiosks."

## Likely questions
- *How is this different from myScheme?* "myScheme is a portal you browse. We are voice-first, in Telugu, give a
  family-level total, document checklist and next steps, and say honestly when we are unsure."
- *How do you keep data correct?* "Official sources, a last-checked date on each scheme, automated data validation in CI,
  and a monthly re-verification process."
- *Does the AI decide eligibility?* "No. Rules decide. AI only helps turn spoken words into answers."
- *What are the limits?* Say them first: scheme text is English only for now, some rules say "confirm on official site",
  and voice depends on the device having a Telugu voice.
