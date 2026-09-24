/*
 * The only file needed for routine invitation edits.
 * Text is always inserted as plain text, never as HTML.
 * Renders: cover → names → countdown → Vishalakshi Mantap setting → the four events.
 * Event sections are built from the events array below; edit event details only there.
 */
window.invitationConfig = {
  couple: {
    firstName: "Aditi",
    secondName: "Arjun",
    separator: "&",
  },

  dates: {
    year: 2026,
    month: 11,
    dateRangeDisplay: "24th, 25th Nov 2026",
    timezone: "Asia/Kolkata",
    // Countdown target: the pheras, 25 November 2026, 11:50 AM India time.
    countdownTarget: "2026-11-25T11:50:00+05:30",
  },

  copy: {
    opening: "With love and joy, we invite you to celebrate our wedding.",
    openButton: "Open invitation", // Accessible name of the bow button.
    tapCue: "Tap to open",
    skipButton: "Skip",
    countdownHeading: "Counting the days",
    countdownDays: "Days",
    countdownHours: "Hours",
    countdownMinutes: "Minutes",
    countdownSeconds: "Seconds",
    countdownDone: "The celebrations have begun",
    coverLabel: "Aditi & Arjun",
    whenWhereHeading: "When & Where",
    mapButton: "View Location",
    eventMapButton: "View Location",
    dressCodeLabel: "Dress code",
    closingLine: "We cannot wait to celebrate with you",
    closingDetails: "With warm invitations from Rana and Gupta families",
    scrollCue: "Scroll down",
    musicOn: "Turn music off", // accessible names for the music button
    musicOff: "Turn music on",
    settingHeading: "The Setting",
    celebrationsHeading: "Our Celebrations",
    attireHeading: "Attire",
    programmeHeading: "Programme",
    settingLabel: "Vishalakshi Mantap",
    closing: "We look forward to celebrating these special moments with you.",
    familyLine: "",
    invocation: "",
    programmeIntroduction: "Four moments, held close.",
  },

  venue: {
    centreName: "Art of Living International Centre, Bangalore",
    landmarkName: "Vishalakshi Mantap",
    landmarkCaption: "Vishalakshi Mantap",
    landmarkAlt: "Embroidered Vishalakshi Mantap with its dome, tiers and front stairway",
    campusMapUrl: "https://maps.app.goo.gl/HfzEFNVEVz69Ac9v7", // Vishalakshi Mantap
    // Stage 1 has no event sections yet, so this says "each event" rather than "each event below".
    explanatoryCopy:
      "This is the place where we found ourselves, and each other, on paths we have walked together in silence, in joy and in love. We warmly invite you to become a part of this magical place we call home, and we hope you find some of its magic for yourself, as countless others have, and as we did.",
  },

  // Confirmed schedule. Each entry renders one event section (title, date/time, venue, dress code, map link).
  // attire is shown as the "Dress code" line; leave it empty to hide the line.
  // An empty mapUrl hides that event's map link.
  events: [
    {
      id: "haldi",
      day: 24,
      month: 11,
      startTime: "13:00",
      title: "Haldi",
      subtitle: "",
      description: "Join us for an afternoon of haldi, laughter, and blessings as the celebrations begin.",
      venue: "Panchamrit Lawns",
      mapUrl: "https://maps.app.goo.gl/jEGDnzqhhD4Xnmoc6",
      attire: "Light pastel shades",
      programmeLabel: "Haldi",
      palette: "haldi",
      image: "assets/art/event-haldi.webp",
      alt: "Embroidered marigolds, jasmine buds and pearls around a brass bowl of turmeric paste",
    },
    {
      id: "sangeet",
      day: 24,
      month: 11,
      startTime: "18:30",
      title: "Sangeet",
      subtitle: "",
      description: "An evening of music, dance, and joyful celebration with our family and friends.",
      venue: "Old Ashram Amphitheatre",
      mapUrl: "https://maps.app.goo.gl/ttvyPNzuitgpvrkJ9",
      attire: "Get your bling on",
      programmeLabel: "Sangeet",
      palette: "sangeet",
      image: "assets/art/event-sangeet.webp",
      alt: "Embroidered sitar wreathed in peacock feathers, blossoms and pearls",
    },
    {
      id: "wedding",
      day: 25,
      month: 11,
      startTime: "09:30",
      title: "Vedic Vivah",
      subtitle: "",
      description: "Join us as we begin our married life together, surrounded by your love and blessings.",
      venue: "Radha Kunj Mantap",
      mapUrl: "https://maps.app.goo.gl/g1T1XfCXn8VHuxcW7",
      attire: "Royal traditionals",
      programmeLabel: "Vedic Vivah",
      palette: "wedding",
      image: "assets/art/event-wedding-lakeside.webp",
      alt: "Embroidered lakeside mandap with draped canopy, sacred fire and lotuses on the water",
    },
  ],

  // RSVP: embroidered heading art plus an optional note.
  rsvp: {
    note: "",
  },

  attire: {
    introduction: "",
    additionalNotes: "",
  },

  guestNotes: [],

  sections: {
    programme: true,
    countdown: true,
  },

  theme: {
    colors: {
      ivory: "#F5F0E5",
      linen: "#EDE3D2",
      ink: "#29432D",
      body: "#3F4A3C",
      sage: "#5F7A63",
      gold: "#9C7F3E",
      blush: "#D8A6A0",
    },
    // Fonts are loaded from Google Fonts in index.html; fallbacks keep the page usable offline.
    fonts: {
      names: "'Fraunces', 'Cormorant Garamond', Georgia, serif", // soft, rounded serif for the couple's names
      display: "'Cormorant Garamond', 'Cormorant', Georgia, 'Times New Roman', serif",
      body: "Jost, 'Avenir Next', 'Segoe UI', system-ui, sans-serif",
    },
    eventPalettes: {
      haldi: { accent: "#D88427", soft: "#FFF3BF" },
      sangeet: { accent: "#20535B", soft: "#E8EFF0" },
      wedding: { accent: "#A64B3C", soft: "#F7E7E3" },
      meditation: { accent: "#718C92", soft: "#E9F0EF" },
    },
  },

  assets: {
    // Served web versions. PNG masters: assets/masters/pastel-v2/ (ChatGPT, 23 Sep 2026).
    linenTile: "assets/art/ivory-linen-tile.webp",
    cover: "assets/art/closed-cover-pastel.webp", // ribbon-free split-door cover
    ribbonLeft: "assets/art/ribbon-left.webp", // falls to the left
    ribbonRight: "assets/art/ribbon-right.webp", // falls to the right with the knot
    ribbonKnot: "assets/art/ribbon-knot.webp",
    namesFrame: "assets/art/names-frame-pastel.webp",
    mantap: "assets/art/mantap-stairs-v2.webp", // master: assets/masters/pastel-v2/vishalakshi-mantap-stairs-only.png
    mantapTransparent: true, // transparent cutout: no edge feathering or tint
    eventDivider: "assets/art/flourish-divider-v2.webp", // gold flourish between events (cut from the RSVP art)
    rsvp: "assets/art/rsvp-lettering.webp", // masters: assets/masters/stage-3/
    endingFrame: "assets/art/ending-garland.webp",
    ganapati: "assets/art/ganapati.webp", // floats above the ribbon knot on the cover
    music: "assets/music.m4a", // AAC 128 kbps from assets/masters/stage-3/music.mp3; "" hides the music button
  },


  // Milliseconds. CSS reads these as custom properties, so JS and CSS share one definition.
  motion: {
    coverAnimation: true, // false = tapping the bow opens instantly.
    ribbonFall: 2000, // bow and ribbon slide down and off the screen
    ribbonLag: 180, // the ribbon band follows the knot slightly later
    labelFade: 450, // "Aditi & Arjun / Tap to open" fades
    doorDelay: 1300, // doors start while the ribbon is still falling
    doorDuration: 2500,
    namesDelay: 4050, // names begin 0.25s after the doors finish (1300 + 2500)
    namesDuration: 1500, // each line takes 1.5s to settle
    namesStagger: 1500, // names → date → rest, each starting as the previous settles
    namesDistance: 36, // px of upward float
    readyTimeout: 3500, // longest wait for artwork/fonts before the cover opens anyway
    revealDuration: 1300, // later sections: slow float up
    revealStagger: 140,
    revealDistance: 24,
  },
};
