export const plans = [
  {
    id: "eco-lite",
    name: "Eco Lite 5G",
    dataLimit: 10, // GB
    price: 25.00,
    details: [
      "10 GB 5G Speed Data",
      "Unlimited National Talk & Text",
      "eSIM Instant Activation",
      "No Contract / Cancel Anytime"
    ],
    recommended: false
  },
  {
    id: "pro-unlimited",
    name: "5G Pro Unlimited",
    dataLimit: 50, // GB High Speed, then unlimited
    price: 45.00,
    details: [
      "Unlimited 5G Data (50GB High Speed)",
      "Unlimited National Talk & Text",
      "10 GB Hotspot sharing",
      "Free Roaming in Mexico & Canada",
      "Priority Network access"
    ],
    recommended: true
  },
  {
    id: "roam-elite",
    name: "Roam Elite Global",
    dataLimit: 80, // GB
    price: 65.00,
    details: [
      "80 GB 5G National Data",
      "20 GB Global Roaming Data",
      "Unlimited Global Texting",
      "Premium Streaming pass (UHD)",
      "24/7 Priority Support hotline"
    ],
    recommended: false
  }
];

export const boosters = [
  {
    id: "boost-5gb",
    name: "+5GB High Speed Data",
    price: 10.00,
    description: "Adds 5 GB of high-speed 5G data to your current billing cycle.",
    value: 5,
    type: "data"
  },
  {
    id: "boost-roam",
    name: "7-Day Global Travel Pass",
    price: 25.00,
    description: "Enables seamless roaming and 5GB travel data in 120+ countries for 7 days.",
    value: 7,
    type: "roaming"
  },
  {
    id: "boost-hotspot",
    name: "Unlimited Hotspot Pass",
    price: 15.00,
    description: "Unlocks unlimited mobile hotspot sharing for 30 days.",
    value: 30,
    type: "hotspot"
  }
];

export const faqResponses = [
  {
    keywords: ["esim", "activation", "activate", "qr"],
    response: "Aether Connect eSIMs activate instantly. Go to your Profile tab, click 'View eSIM Profile', and scan the generated QR code using your device network settings. Ensure you are on Wi-Fi during the installation process."
  },
  {
    keywords: ["coverage", "network", "signal", "5g", "lte"],
    response: "We provide high-speed 5G coverage covering 98% of the country. If you have low signal, try toggling your phone's Airplane Mode for 5 seconds to force a connection refresh, or check if mobile data is toggled on."
  },
  {
    keywords: ["billing", "bill", "pay", "invoice", "payment", "cost"],
    response: "Your monthly invoice is processed automatically on your billing due date via Auto-Pay. You can review current bills, view payment cards, or download PDF invoices inside the Profile tab."
  },
  {
    keywords: ["roaming", "international", "travel", "abroad", "canada", "mexico"],
    response: "The Roam Elite plan includes global roaming. If you are on Eco Lite or Pro Unlimited, you can purchase the '7-Day Global Travel Pass' addon from your dashboard to activate international usage."
  },
  {
    keywords: ["slow", "throttle", "speed", "boost"],
    response: "If your speed feels slow, you may have exceeded your high-speed monthly allotment. You can purchase a +5GB High Speed Data Booster in the Add-ons drawer to restore full 5G speeds instantly."
  }
];

export const defaultBotResponse = "I'm your Aether Connect Virtual Assistant. Ask me about eSIM activations, data coverage, international roaming passes, or managing invoices.";
