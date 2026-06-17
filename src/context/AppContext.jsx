import React, { createContext, useContext, useState, useEffect } from "react";
import { plans, faqResponses, defaultBotResponse } from "../data/plans";
import { AjoService } from "../services/AjoService";

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState("usage");
  const [activePlan, setActivePlan] = useState(plans[1]); // Defaults to 5G Pro Unlimited
  
  // Usage Telemetry (Seeded with realistic mid-month data)
  const [dataUsed, setDataUsed] = useState(34.2);
  const [dataLimit, setDataLimit] = useState(plans[1].dataLimit);
  const [minsUsed, setMinsUsed] = useState(210);
  const [minsLimit, setMinsLimit] = useState(500);
  const [smsUsed, setSmsUsed] = useState(142);
  const [smsLimit, setSmsLimit] = useState(1000);
  
  // Billing Telemetry
  const [nextBillDate, setNextBillDate] = useState("June 30, 2026");
  const [nextBillAmount, setNextBillAmount] = useState(plans[1].price);
  const [isAutoPayEnabled, setIsAutoPayEnabled] = useState(true);
  
  // AJO Configuration State
  const [ajoCredentials, setAjoCredentials] = useState(() => {
    const saved = localStorage.getItem("aether_ajo_creds");
    let creds = {
      datastreamId: import.meta.env.VITE_AEP_DATASTREAM_ID || "",
      orgId: import.meta.env.VITE_AEP_ORG_ID || "",
      popupSurface: import.meta.env.VITE_AJO_SURFACE_POPUP || "mobileapp://aether-connect/reload-popup",
      dashboardSurface: import.meta.env.VITE_AJO_SURFACE_DASHBOARD || "mobileapp://aether-connect/dashboard-banner",
      edgeHost: import.meta.env.VITE_AEP_EDGE_HOST || "https://edge.adobedc.net"
    };

    if (saved) {
      try {
        creds = { ...creds, ...JSON.parse(saved) };
      } catch (e) {
        console.error("Failed to parse AJO credentials from local storage");
      }
    }

    // Auto-detect local network IP hosts (e.g. when testing on mobile) and map default edgeHost to the dev server proxy
    if (typeof window !== "undefined" && window.location) {
      const hostname = window.location.hostname;
      const isLocal = /localhost|127\.0\.0\.1|192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\./i.test(hostname);
      if (isLocal && (!creds.edgeHost || creds.edgeHost === "https://edge.adobedc.net")) {
        creds.edgeHost = `http://${window.location.host}/api/ajo-edge`;
      }
    }

    return creds;
  });

  const [ajoOffers, setAjoOffers] = useState(null);
  const [isAjoLoading, setIsAjoLoading] = useState(false);
  const [ajoError, setAjoError] = useState(null);

  const [assuranceSessionId, setAssuranceSessionId] = useState(() => {
    return localStorage.getItem("aether_assurance_session_id") || "";
  });

  const [assuranceSessionPin, setAssuranceSessionPin] = useState(() => {
    return localStorage.getItem("aether_assurance_session_pin") || "";
  });

  // Listen for AEP Assurance session parameter in deep links on initialization
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let sessionParam = "";
    for (const [key, value] of params.entries()) {
      if (key.toLowerCase() === "adb_validation_sessionid") {
        sessionParam = value;
        break;
      }
    }

    if (sessionParam) {
      console.log("AEP Assurance: Session ID detected from deep link:", sessionParam);
      setAssuranceSessionId(sessionParam);
      localStorage.setItem("aether_assurance_session_id", sessionParam);
      showToast("Connected to AEP Assurance session!", "success");

      // Clean the query parameter from URL to maintain a clean address bar
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  const connectAssuranceSession = (linkOrId, pin = "") => {
    if (!linkOrId || !linkOrId.trim()) {
      showToast("Please enter a valid Assurance Session Link or ID", "error");
      return false;
    }

    let sessionId = linkOrId.trim();

    // Check if the input is a URL containing the session ID query param
    try {
      if (sessionId.includes("?")) {
        const queryPart = sessionId.split("?")[1];
        const urlParams = new URLSearchParams(queryPart);
        for (const [key, value] of urlParams.entries()) {
          if (key.toLowerCase() === "adb_validation_sessionid") {
            sessionId = value;
            break;
          }
        }
      } else if (sessionId.includes("/session/")) {
        const parts = sessionId.split("/session/");
        if (parts.length > 1) {
          sessionId = parts[1].split(/[?#]/)[0];
        }
      }
    } catch (e) {
      console.error("AEP Assurance: Failed to parse session link:", e);
    }

    setAssuranceSessionId(sessionId);
    localStorage.setItem("aether_assurance_session_id", sessionId);

    if (pin && pin.trim()) {
      const sanitizedPin = pin.trim();
      setAssuranceSessionPin(sanitizedPin);
      localStorage.setItem("aether_assurance_session_pin", sanitizedPin);
    } else {
      setAssuranceSessionPin("");
      localStorage.removeItem("aether_assurance_session_pin");
    }

    showToast("Connected to AEP Assurance session!", "success");
    return true;
  };

  const clearAssuranceSession = () => {
    setAssuranceSessionId("");
    setAssuranceSessionPin("");
    localStorage.removeItem("aether_assurance_session_id");
    localStorage.removeItem("aether_assurance_session_pin");
    showToast("Disconnected from Assurance session", "info");
  };

  const saveAjoCredentials = (newCreds) => {
    setAjoCredentials(newCreds);
    localStorage.setItem("aether_ajo_creds", JSON.stringify(newCreds));
    showToast("AJO configurations saved!");
  };

  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const refetchOffers = () => {
    setRefetchTrigger((prev) => prev + 1);
  };

  // Trigger AJO propositions fetch, including Assurance ID for tracing
  useEffect(() => {
    const fetchOffers = async () => {
      setIsAjoLoading(true);
      setAjoError(null);
      try {
        const offers = await AjoService.fetchOffers(ajoCredentials, assuranceSessionId);
        setAjoOffers(offers);
      } catch (err) {
        console.error("Error fetching AJO propositions:", err);
        setAjoError(err.message || "Failed to fetch offers from Adobe Experience Edge");
        setAjoOffers(null);
      } finally {
        setIsAjoLoading(false);
      }
    };
    fetchOffers();
  }, [ajoCredentials, assuranceSessionId, refetchTrigger]);

  // States
  const [boostersActive, setBoostersActive] = useState([]);
  const [theme, setTheme] = useState("dark"); // Default to dark mode for sleek tech aesthetic
  const [isAddonOpen, setIsAddonOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Chat Support Logs
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Hello! Welcome to Aether Connect Priority Support. Ask me anything about your network speed, billing invoices, or eSIM QR codes.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Toast notifier
  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // Change Plan
  const changePlan = (plan) => {
    setActivePlan(plan);
    setDataLimit(plan.dataLimit);
    setNextBillAmount(plan.price);
    showToast(`Successfully subscribed to ${plan.name}`);
  };

  // Buy Booster Addon
  const buyBooster = (booster) => {
    setBoostersActive((prev) => [...prev, booster]);
    
    // Add charges to next bill
    setNextBillAmount((prev) => prev + booster.price);

    // Apply effects based on type
    if (booster.type === "data") {
      setDataLimit((prev) => prev + booster.value);
      showToast(`Added +${booster.value}GB high-speed data!`);
    } else if (booster.type === "roaming") {
      showToast(`Global Travel Pass activated for 7 days!`);
    } else if (booster.type === "hotspot") {
      showToast("Hotspot feature unlocked for 30 days!");
    }
    
    setIsAddonOpen(false);
  };

  // Chat Support Input Processing
  const sendChatMessage = (text) => {
    if (!text.trim()) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { id: Date.now(), sender: "user", text, timestamp };
    setChatMessages((prev) => [...prev, userMsg]);

    // Bot response calculation
    const query = text.toLowerCase();
    let botReplyText = "";

    const matchedFAQ = faqResponses.find((faq) =>
      faq.keywords.some((keyword) => query.includes(keyword))
    );

    if (matchedFAQ) {
      botReplyText = matchedFAQ.response;
    } else {
      botReplyText = defaultBotResponse;
    }

    // Delayed bot response simulation (for premium native feel)
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: botReplyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 800);
  };

  // Theme switcher
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Auto-Pay Toggle
  const toggleAutoPay = () => {
    setIsAutoPayEnabled((prev) => !prev);
    showToast(isAutoPayEnabled ? "Auto-Pay disabled" : "Auto-Pay enabled", "info");
  };

  // Apply theme class to document body
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark-mode");
    } else {
      root.classList.remove("dark-mode");
    }
  }, [theme]);

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        activePlan,
        changePlan,
        dataUsed,
        setDataUsed,
        dataLimit,
        setDataLimit,
        minsUsed,
        minsLimit,
        smsUsed,
        smsLimit,
        nextBillDate,
        nextBillAmount,
        setNextBillAmount,
        isAutoPayEnabled,
        toggleAutoPay,
        boostersActive,
        buyBooster,
        chatMessages,
        sendChatMessage,
        theme,
        toggleTheme,
        isAddonOpen,
        setIsAddonOpen,
        toasts,
        showToast,
        ajoCredentials,
        saveAjoCredentials,
        ajoOffers,
        isAjoLoading,
        ajoError,
        refetchOffers,
        assuranceSessionId,
        clearAssuranceSession,
        assuranceSessionPin,
        connectAssuranceSession,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
