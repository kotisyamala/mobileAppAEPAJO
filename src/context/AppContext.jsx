import React, { createContext, useContext, useState, useEffect } from "react";
import { plans, faqResponses, defaultBotResponse } from "../data/plans";
import { AjoService } from "../services/AjoService";

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

// Initialize emulated AEP Web SDK and Data Layer on page load
if (typeof window !== "undefined") {
  window.adobeDataLayer = window.adobeDataLayer || [];
  
  // Emulate standard Web SDK alloy queue
  window.alloy = window.alloy || function() {
    window.alloy.q = window.alloy.q || [];
    window.alloy.q.push(arguments);
    
    const cmdName = arguments[0];
    const cmdArgs = arguments[1];
    
    console.log(`[Alloy Web SDK] Command executed: "${cmdName}"`, cmdArgs);
    
    if (window.onAlloyCommandExecuted) {
      window.onAlloyCommandExecuted({
        id: Date.now() + Math.random().toString(36).substr(2, 5),
        timestamp: new Date().toLocaleTimeString(),
        command: cmdName,
        args: cmdArgs
      });
    }
  };
  window.alloy.q = window.alloy.q || [];
}

// Synthesize high-fidelity double electronic chime for simulated notifications in code
const playNotificationChime = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Tone 1 (High bell chime)
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880, audioCtx.currentTime); 
    gain1.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start();
    osc1.stop(audioCtx.currentTime + 0.6);

    // Tone 2 (Higher tone, slightly delayed)
    setTimeout(() => {
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1320, audioCtx.currentTime); 
      gain2.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.start();
      osc2.stop(audioCtx.currentTime + 0.8);
    }, 120);
  } catch (e) {
    console.warn("Audio Context notification chime failed to play:", e);
  }
};

export const AppProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState("usage");
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem("aether_view_mode") || "pwa";
  });

  const toggleViewMode = () => {
    setViewMode(prev => {
      const next = prev === "pwa" ? "web" : "pwa";
      localStorage.setItem("aether_view_mode", next);
      return next;
    });
  };
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

  const [ajoSimulationSettings, setAjoSimulationSettings] = useState(() => {
    const saved = localStorage.getItem("aether_ajo_sim_settings");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse AJO simulation settings");
      }
    }
    return {
      useSimulation: true,
      popupOffer: {
        badge: "Special eSIM Discount",
        title: "Get 50% Off First 3 Months",
        description: "Experience ultra-high speed cellular connectivity. Claim now to receive promo code AETHER50.",
        code: "AETHER50"
      },
      dashboardOffer: {
        title: "Earn $25 Statement Credit",
        description: "Invite a colleague to provision their priority network eSIM profile and unlock credit on both statements.",
        actionText: "Share Invite Link",
        type: "referral"
      },
      mockPush: {
        title: "Exclusive eSIM Priority Upgrade!",
        body: "Redeem speed booster addon modifications for free. Toggle settings inside the profile tab."
      }
    };
  });

  const saveAjoSimulationSettings = (newSettings) => {
    setAjoSimulationSettings(newSettings);
    localStorage.setItem("aether_ajo_sim_settings", JSON.stringify(newSettings));
    showToast("AJO simulation settings saved!", "success");
  };

  const [pushListenerTopic, setPushListenerTopic] = useState(() => {
    const saved = localStorage.getItem("aether_push_listener_topic");
    if (saved) return saved;
    let ecid = localStorage.getItem("aether_ecid");
    if (!ecid) {
      ecid = Math.random().toString().substring(2, 12);
    }
    const topic = `aether_ajo_push_${ecid.substring(0, 8)}`;
    localStorage.setItem("aether_push_listener_topic", topic);
    return topic;
  });

  const [pushListenerEnabled, setPushListenerEnabled] = useState(() => {
    const saved = localStorage.getItem("aether_push_listener_enabled");
    return saved !== null ? saved === "true" : true;
  });

  const savePushListenerTopic = (topic) => {
    setPushListenerTopic(topic);
    localStorage.setItem("aether_push_listener_topic", topic);
  };

  const savePushListenerEnabled = (enabled) => {
    setPushListenerEnabled(enabled);
    localStorage.setItem("aether_push_listener_enabled", enabled ? "true" : "false");
    showToast(enabled ? "AJO Webhook Listener Enabled" : "AJO Webhook Listener Disabled", "info");
  };

  const [sdkMode, setSdkMode] = useState(() => {
    return localStorage.getItem("aether_sdk_mode") || "emulated";
  });

  const [launchEmbedUrl, setLaunchEmbedUrl] = useState(() => {
    return localStorage.getItem("aether_launch_embed_url") || "";
  });

  const [sdkVersion, setSdkVersion] = useState(() => {
    return localStorage.getItem("aether_sdk_version") || "2.19.0";
  });

  const [sdkScriptStatus, setSdkScriptStatus] = useState("idle");
  const [launchScriptStatus, setLaunchScriptStatus] = useState("idle");

  const saveSdkSettings = (mode, url, version) => {
    setSdkMode(mode);
    setLaunchEmbedUrl(url);
    setSdkVersion(version);
    localStorage.setItem("aether_sdk_mode", mode);
    localStorage.setItem("aether_launch_embed_url", url);
    localStorage.setItem("aether_sdk_version", version);
    showToast("SDK integration settings saved!", "success");
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

      if (ajoSimulationSettings.useSimulation) {
        // Resolve immediately to simulation settings mapping
        setTimeout(() => {
          setAjoOffers({
            popupOffer: ajoSimulationSettings.popupOffer,
            dashboardOffer: ajoSimulationSettings.dashboardOffer,
            rawResponse: {
              status: "Simulation Mode Active",
              info: "These propositions are generated locally inside the configuration settings simulator.",
              timestamp: new Date().toISOString(),
              handle: [
                {
                  type: "personalization:decisions",
                  payload: [
                    {
                      scope: ajoCredentials.popupSurface || "mobileapp://aether-connect/reload-popup",
                      items: [
                        {
                          id: "sim-offer-popup-9042",
                          data: {
                            content: ajoSimulationSettings.popupOffer
                          }
                        }
                      ]
                    },
                    {
                      scope: ajoCredentials.dashboardSurface || "mobileapp://aether-connect/dashboard-banner",
                      items: [
                        {
                          id: "sim-offer-dashboard-9042",
                          data: {
                            content: ajoSimulationSettings.dashboardOffer
                          }
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          });
          setIsAjoLoading(false);
        }, 300);
        return;
      }

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
  }, [ajoCredentials, assuranceSessionId, refetchTrigger, ajoSimulationSettings]);

  // Testing Sandbox Profile, Logging, and Cart States
  const [activeProfile, setActiveProfile] = useState(() => {
    const saved = localStorage.getItem("aether_active_profile");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse active profile");
      }
    }
    return {
      crmId: "crm-john-doe-12345",
      email: "john.doe@aethertelecom.com",
      firstName: "John",
      lastName: "Doe",
      phone: "+15550199283"
    };
  });

  const [alloyLogs, setAlloyLogs] = useState([]);
  
  const addAlloyLog = (log) => {
    setAlloyLogs((prev) => [log, ...prev].slice(0, 50));
  };
  
  const clearAlloyLogs = () => {
    setAlloyLogs([]);
    showToast("Alloy Web SDK command logs cleared", "info");
  };

  // Connect global window.alloy command callback into React state
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.onAlloyCommandExecuted = (log) => {
        addAlloyLog(log);
      };
    }
    return () => {
      if (typeof window !== "undefined") {
        delete window.onAlloyCommandExecuted;
      }
    };
  }, []);

  // Inject and configure Adobe Web SDK / Tags scripts based on settings
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Helper to clean up script tags
    const removeScript = (id) => {
      const el = document.getElementById(id);
      if (el) el.remove();
    };

    // Remove any previously injected scripts
    removeScript("aep-sdk-script");
    removeScript("adobe-launch-script");

    // Clean up status
    setSdkScriptStatus("idle");
    setLaunchScriptStatus("idle");

    if (sdkMode === "real_sdk") {
      console.log(`[AEP Web SDK] Loading official alloy.js v${sdkVersion} from CDN...`);
      setSdkScriptStatus("loading");

      // Initialize the queue array if not present
      window.alloy = window.alloy || function() {
        window.alloy.q = window.alloy.q || [];
        window.alloy.q.push(arguments);
        
        const cmdName = arguments[0];
        const cmdArgs = arguments[1];
        if (window.onAlloyCommandExecuted) {
          window.onAlloyCommandExecuted({
            id: Date.now() + Math.random().toString(36).substr(2, 5),
            timestamp: new Date().toLocaleTimeString(),
            command: cmdName,
            args: cmdArgs
          });
        }
      };
      window.alloy.q = window.alloy.q || [];

      const script = document.createElement("script");
      script.id = "aep-sdk-script";
      script.src = `https://cdn1.adobemediaserver.com/alloy/${sdkVersion}/alloy.js`;
      script.async = true;
      script.onload = () => {
        console.log("[AEP Web SDK] Official alloy.js library loaded successfully.");
        setSdkScriptStatus("ready");

        // Wrap the overridden window.alloy to capture logs
        if (typeof window.alloy === "function" && !window.alloy._isWrapped) {
          const originalAlloy = window.alloy;
          window.alloy = function() {
            const cmdName = arguments[0];
            const cmdArgs = arguments[1];
            console.log(`[Real Alloy SDK Command] "${cmdName}"`, cmdArgs);
            
            if (window.onAlloyCommandExecuted) {
              window.onAlloyCommandExecuted({
                id: Date.now() + Math.random().toString(36).substr(2, 5),
                timestamp: new Date().toLocaleTimeString(),
                command: cmdName,
                args: cmdArgs
              });
            }
            return originalAlloy.apply(this, arguments);
          };
          window.alloy._isWrapped = true;
          Object.assign(window.alloy, originalAlloy);
        }

        // Configure real instance
        window.alloy("configure", {
          datastreamId: ajoCredentials.datastreamId || "not-configured",
          orgId: ajoCredentials.orgId || "not-configured",
          edgeDomain: "adobedc.net",
          assuranceSessionId: assuranceSessionId || undefined,
          defaultConsent: "in"
        });
      };
      script.onerror = (e) => {
        console.error("[AEP Web SDK] Failed to load official alloy.js script tag", e);
        setSdkScriptStatus("error");
        showToast("Failed to load alloy.js from CDN. Verify internet or adblockers.", "error");
      };
      document.head.appendChild(script);

    } else if (sdkMode === "adobe_launch") {
      if (!launchEmbedUrl || !launchEmbedUrl.trim()) {
        console.warn("[Adobe Launch] Script Embed URL is empty.");
        return;
      }

      console.log(`[Adobe Launch] Loading Tags container: ${launchEmbedUrl}...`);
      setLaunchScriptStatus("loading");

      const script = document.createElement("script");
      script.id = "adobe-launch-script";
      script.src = launchEmbedUrl.trim();
      script.async = true;
      script.onload = () => {
        console.log("[Adobe Launch] Tag container script loaded successfully.");
        setLaunchScriptStatus("ready");
      };
      script.onerror = (e) => {
        console.error("[Adobe Launch] Failed to load Tag container script", e);
        setLaunchScriptStatus("error");
        showToast("Failed to load Launch script container.", "error");
      };
      document.head.appendChild(script);

    } else {
      // Emulated mode
      console.log("[AEP Web SDK] Running in Emulated mode.");
      
      // Ensure the emulated queue is restored
      window.alloy = window.alloy || function() {
        window.alloy.q = window.alloy.q || [];
        window.alloy.q.push(arguments);
        
        const cmdName = arguments[0];
        const cmdArgs = arguments[1];
        if (window.onAlloyCommandExecuted) {
          window.onAlloyCommandExecuted({
            id: Date.now() + Math.random().toString(36).substr(2, 5),
            timestamp: new Date().toLocaleTimeString(),
            command: cmdName,
            args: cmdArgs
          });
        }
      };
      window.alloy.q = window.alloy.q || [];

      window.alloy("configure", {
        datastreamId: ajoCredentials.datastreamId || "not-configured",
        orgId: ajoCredentials.orgId || "not-configured",
        edgeDomain: "adobedc.net",
        assuranceSessionId: assuranceSessionId || "none"
      });
    }

    return () => {
      // Script cleanup is handled by subsequent effect triggers re-removing tags
    };
  }, [sdkMode, launchEmbedUrl, sdkVersion, ajoCredentials, assuranceSessionId]);


  const saveProfile = (newProfile) => {
    setActiveProfile(newProfile);
    localStorage.setItem("aether_active_profile", JSON.stringify(newProfile));
    showToast("Testing profile updated!", "success");

    // Dynamic push to Adobe Data Layer
    if (typeof window !== "undefined" && window.adobeDataLayer) {
      window.adobeDataLayer.push({
        event: "profile-login",
        profile: {
          crmId: newProfile.crmId,
          email: newProfile.email,
          phone: newProfile.phone,
          firstName: newProfile.firstName,
          lastName: newProfile.lastName
        },
        timestamp: new Date().toISOString()
      });
    }

    // Emulate Alloy identity login event
    if (typeof window !== "undefined" && window.alloy) {
      window.alloy("sendEvent", {
        xdm: {
          eventType: "user.login",
          identityMap: {
            CRM: [{ id: newProfile.crmId, authenticatedState: "authenticated" }],
            Email: [{ id: newProfile.email, authenticatedState: "authenticated" }],
            Phone: [{ id: newProfile.phone, authenticatedState: "authenticated" }]
          }
        }
      });
    }

    // Trigger identity login XDM payload automatically
    if (ajoCredentials.datastreamId && ajoCredentials.orgId) {
      AjoService.trackIdentityLogin(ajoCredentials, newProfile, addXdmEventLog)
        .catch(err => console.error("XDM Identity autolog failed:", err));
    }
  };

  const [xdmEventLogs, setXdmEventLogs] = useState([]);
  const addXdmEventLog = (logEntry) => {
    setXdmEventLogs((prev) => {
      const exists = prev.some((item) => item.id === logEntry.id);
      if (exists) {
        return prev.map((item) => item.id === logEntry.id ? logEntry : item);
      }
      return [logEntry, ...prev].slice(0, 50);
    });
  };
  const clearXdmEventLogs = () => {
    setXdmEventLogs([]);
    showToast("XDM event logs cleared", "info");
  };

  const [notificationLogs, setNotificationLogs] = useState([]);
  const [activeBanner, setActiveBanner] = useState(null);

  const addNotificationLog = (notif) => {
    setNotificationLogs((prev) => [notif, ...prev].slice(0, 50));
  };
  const clearNotificationLogs = () => {
    setNotificationLogs([]);
    showToast("Notification logs cleared", "info");
  };
  const triggerNotification = (title, body) => {
    const notif = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      title,
      body
    };
    setNotificationLogs((prev) => [notif, ...prev].slice(0, 50));
    setActiveBanner(notif);
    playNotificationChime();
  };

  // SSE Webhook background listener subscribing to ntfy.sh topic
  useEffect(() => {
    if (!pushListenerEnabled || !pushListenerTopic) return;

    let eventSource = null;
    let reconnectTimeout = null;

    const connectSse = () => {
      const sseUrl = `https://ntfy.sh/${pushListenerTopic}/sse`;
      console.log(`SSE: Subscribing to ntfy topic: ${pushListenerTopic}`);
      
      eventSource = new EventSource(sseUrl);

      eventSource.onopen = () => {
        console.log("SSE: Channel connection established.");
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event === "message") {
            const title = data.title || "AJO Push Notification";
            const message = data.message || data.text || "Campaign triggered from Adobe Journey Optimizer";
            
            console.log("SSE: Inbound webhook notification:", data);
            
            triggerNotification(title, message);
            showToast("AJO trigger received!", "success");
          }
        } catch (err) {
          console.error("SSE: JSON parse error:", err);
        }
      };

      eventSource.onerror = (err) => {
        console.warn("SSE: Stream error. Reconnecting in 5s...", err);
        eventSource.close();
        
        reconnectTimeout = setTimeout(() => {
          connectSse();
        }, 5000);
      };
    };

    connectSse();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [pushListenerEnabled, pushListenerTopic]);

  const [cart, setCart] = useState([]);
  const addToCart = (item, type = "plan") => {
    setCart((prev) => {
      const exists = prev.find((cartItem) => cartItem.id === item.id);
      const quantity = exists ? exists.quantity + 1 : 1;

      // Push to Adobe Client Data Layer
      if (typeof window !== "undefined" && window.adobeDataLayer) {
        window.adobeDataLayer.push({
          event: "cart-add",
          cartItem: {
            id: item.id,
            name: item.name,
            price: item.price,
            type: type,
            quantity: quantity
          },
          timestamp: new Date().toISOString()
        });
      }

      // Emulate Web SDK cart addition event
      if (typeof window !== "undefined" && window.alloy) {
        window.alloy("sendEvent", {
          xdm: {
            eventType: "commerce.cartAdds",
            commerce: {
              cartAdds: { value: 1 }
            },
            productListItems: [{
              SKU: item.id,
              name: item.name,
              priceTotal: item.price,
              quantity: 1
            }]
          }
        });
      }

      if (exists) {
        showToast(`Increased quantity of ${item.name}!`, "success");
        return prev.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      showToast(`${item.name} added to cart!`, "success");
      return [...prev, { ...item, type, quantity: 1 }];
    });
  };
  const removeFromCart = (itemId) => {
    setCart((prev) => {
      const target = prev.find((cartItem) => cartItem.id === itemId);
      if (!target) return prev;
      if (target.quantity > 1) {
        showToast(`Decreased quantity of ${target.name}`, "info");
        return prev.map((cartItem) =>
          cartItem.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        );
      }
      showToast(`${target.name} removed from cart`, "info");
      return prev.filter((cartItem) => cartItem.id !== itemId);
    });
  };
  const clearCart = () => {
    setCart([]);
    showToast("Cart cleared", "info");
  };

  // JSON configuration importer & exporter
  const exportSettingsToJson = () => {
    const configData = {
      ajoCredentials,
      activeProfile,
      assuranceSessionId,
      assuranceSessionPin,
      ajoSimulationSettings,
      pushListenerTopic,
      pushListenerEnabled,
      sdkMode,
      launchEmbedUrl,
      sdkVersion
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(configData, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `aether_ajo_sandbox_config_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Sandbox config exported successfully!", "success");
  };

  const importSettingsFromJson = (jsonConfig) => {
    try {
      const parsed = typeof jsonConfig === "string" ? JSON.parse(jsonConfig) : jsonConfig;
      
      if (parsed.ajoCredentials) {
        setAjoCredentials(parsed.ajoCredentials);
        localStorage.setItem("aether_ajo_creds", JSON.stringify(parsed.ajoCredentials));
      }
      if (parsed.activeProfile) {
        setActiveProfile(parsed.activeProfile);
        localStorage.setItem("aether_active_profile", JSON.stringify(parsed.activeProfile));
      }
      if (parsed.ajoSimulationSettings) {
        setAjoSimulationSettings(parsed.ajoSimulationSettings);
        localStorage.setItem("aether_ajo_sim_settings", JSON.stringify(parsed.ajoSimulationSettings));
      }
      if (parsed.assuranceSessionId !== undefined) {
        setAssuranceSessionId(parsed.assuranceSessionId);
        if (parsed.assuranceSessionId) {
          localStorage.setItem("aether_assurance_session_id", parsed.assuranceSessionId);
        } else {
          localStorage.removeItem("aether_assurance_session_id");
        }
      }
      if (parsed.assuranceSessionPin !== undefined) {
        setAssuranceSessionPin(parsed.assuranceSessionPin);
        if (parsed.assuranceSessionPin) {
          localStorage.setItem("aether_assurance_session_pin", parsed.assuranceSessionPin);
        } else {
          localStorage.removeItem("aether_assurance_session_pin");
        }
      }

      if (parsed.pushListenerTopic !== undefined) {
        setPushListenerTopic(parsed.pushListenerTopic);
        localStorage.setItem("aether_push_listener_topic", parsed.pushListenerTopic);
      }
      if (parsed.pushListenerEnabled !== undefined) {
        setPushListenerEnabled(parsed.pushListenerEnabled);
        localStorage.setItem("aether_push_listener_enabled", parsed.pushListenerEnabled ? "true" : "false");
      }

      if (parsed.sdkMode !== undefined) {
        setSdkMode(parsed.sdkMode);
        localStorage.setItem("aether_sdk_mode", parsed.sdkMode);
      }
      if (parsed.launchEmbedUrl !== undefined) {
        setLaunchEmbedUrl(parsed.launchEmbedUrl);
        localStorage.setItem("aether_launch_embed_url", parsed.launchEmbedUrl);
      }
      if (parsed.sdkVersion !== undefined) {
        setSdkVersion(parsed.sdkVersion);
        localStorage.setItem("aether_sdk_version", parsed.sdkVersion);
      }

      showToast("Sandbox config imported and applied!", "success");
      return true;
    } catch (err) {
      console.error("Failed to import settings:", err);
      showToast("Invalid JSON config file", "error");
      return false;
    }
  };


  // Automatically track tab-swaps inside AEP XDM & Adobe Data Layer
  useEffect(() => {
    if (typeof window !== "undefined" && window.adobeDataLayer) {
      window.adobeDataLayer.push({
        event: "page-view",
        pageName: `Tab: ${activeTab}`,
        pageUrl: window.location.href,
        timestamp: new Date().toISOString(),
        profile: {
          crmId: activeProfile.crmId,
          email: activeProfile.email
        }
      });
    }

    if (typeof window !== "undefined" && window.alloy) {
      window.alloy("sendEvent", {
        xdm: {
          eventType: "web.webpagedetails.pageViews",
          web: {
            webPageDetails: {
              name: `Tab: ${activeTab}`,
              URL: window.location.href
            }
          }
        }
      });
    }

    if (ajoCredentials.datastreamId && ajoCredentials.orgId) {
      AjoService.trackPageView(ajoCredentials, `Tab: ${activeTab}`, addXdmEventLog)
        .catch(err => console.log("PageView XDM autolog skipped/failed:", err.message));
    }
  }, [activeTab, ajoCredentials]);

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
        viewMode,
        setViewMode,
        toggleViewMode,
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
        activeProfile,
        saveProfile,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        xdmEventLogs,
        addXdmEventLog,
        clearXdmEventLogs,
        notificationLogs,
        addNotificationLog,
        clearNotificationLogs,
        exportSettingsToJson,
        importSettingsFromJson,
        ajoSimulationSettings,
        saveAjoSimulationSettings,
        activeBanner,
        setActiveBanner,
        triggerNotification,
        pushListenerTopic,
        savePushListenerTopic,
        pushListenerEnabled,
        savePushListenerEnabled,
        alloyLogs,
        clearAlloyLogs,
        sdkMode,
        launchEmbedUrl,
        sdkVersion,
        sdkScriptStatus,
        launchScriptStatus,
        saveSdkSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
