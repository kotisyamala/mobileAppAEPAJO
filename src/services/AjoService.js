/**
 * AjoService - Adobe Experience Platform Edge Network / AJO Offer Decisioning client.
 * Calls the Adobe Experience Edge interact endpoint to fetch personalization propositions.
 */

// Helper to generate a stable mock ECID (Experience Cloud ID) for this device
const getOrCreateECID = () => {
  let ecid = localStorage.getItem("aether_ecid");
  if (!ecid) {
    // Generate a typical 38-digit Adobe ECID structure or simple random token
    ecid = "44921509312942058190348215903284019284";
    localStorage.setItem("aether_ecid", ecid);
  }
  return ecid;
};

export const AjoService = {
  /**
   * Fetches personalized offers from Adobe Journey Optimizer Offer Decisioning.
   * Falls back to local offers if datastream parameters are missing or requests fail.
   * 
   * @param {Object} credentials - The current user-configured credentials
   * @param {string} [assuranceSessionId] - The active Assurance validation session token
   * @returns {Promise<Object>} Object containing popupOffer and dashboardOffer
   */
  fetchOffers: async (credentials, assuranceSessionId) => {
    const ecid = getOrCreateECID();
    const { datastreamId, orgId, popupSurface, dashboardSurface, edgeHost } = credentials;

    // If datastream or surfaces are not set, throw error immediately
    if (!datastreamId || datastreamId.trim() === "" || datastreamId.trim() === "your_datastream_id_here" || !orgId) {
      throw new Error("AJO credentials not configured. Please configure your Datastream ID and Org ID in the Profile Settings tab.");
    }

    let resolvedHost = "https://edge.adobedc.net";
    if (edgeHost && edgeHost.trim()) {
      let rawHost = edgeHost.trim();
      // Prepend protocol if missing (http for local loopbacks / IPs, https otherwise)
      if (!/^https?:\/\//i.test(rawHost)) {
        const isLocal = /localhost|127\.0\.0\.1|192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\./i.test(rawHost);
        rawHost = `${isLocal ? "http" : "https"}://${rawHost}`;
      }
      // Remove trailing slashes
      while (rawHost.endsWith("/")) {
        rawHost = rawHost.slice(0, -1);
      }
      resolvedHost = rawHost;
    }

    const host = import.meta.env.DEV ? "" : resolvedHost;
    const path = import.meta.env.DEV ? "/api/ajo-edge/ee/v1/interact" : "/ee/v1/interact";
    const endpoint = `${host}${path}?configId=${datastreamId}`;

    const resolvedPopupSurface = popupSurface || "mobileapp://aether-connect/reload-popup";
    const resolvedDashboardSurface = dashboardSurface || "mobileapp://aether-connect/dashboard-banner";

    const requestPayload = {
      events: [
        {
          query: {
            personalization: {
              surfaces: [resolvedPopupSurface, resolvedDashboardSurface]
            }
          },
          xdm: {
            identityMap: {
              ECID: [
                {
                  id: ecid,
                  primary: true
                }
              ]
            }
          }
        }
      ]
    };

    // If connected to an active Assurance session, append verification block to payload metadata
    if (assuranceSessionId) {
      requestPayload.meta = {
        state: {
          entries: [
            {
              key: "assuranceSessionId",
              value: assuranceSessionId
            }
          ]
        }
      };
    }

    const requestHeaders = {
      "Content-Type": "application/json"
    };

    // Attach Assurance session validation token to HTTP headers
    if (assuranceSessionId) {
      requestHeaders["x-adobe-aep-validation-token"] = assuranceSessionId;
    }

    try {
      console.log("AjoService: Fetching offers from AEP Edge Network (Experience Decisioning)...", endpoint, requestPayload);
      const response = await fetch(endpoint, {
        method: "POST",
        headers: requestHeaders,
        body: JSON.stringify(requestPayload)
      });

      if (!response.ok) {
        throw new Error(`AEP Edge Network returned HTTP status ${response.status}`);
      }

      const responseJson = await response.json();
      console.log("AjoService: Received propositions:", responseJson);

      const result = {
        popupOffer: null,
        dashboardOffer: null
      };

      // Parse propositions from handle response payload
      if (responseJson.handle && Array.isArray(responseJson.handle)) {
        responseJson.handle.forEach((item) => {
          if (item.type === "personalization:decisions" && Array.isArray(item.payload)) {
            item.payload.forEach((prop) => {
              const scope = prop.scope;
              const offers = prop.items;

              if (offers && offers.length > 0) {
                // Get first eligible offer item
                const offerItem = offers[0];
                const offerData = offerItem.data;

                if (offerData && offerData.content) {
                  try {
                    // Try parsing content if it's JSON format
                    const parsedContent = typeof offerData.content === "string" 
                      ? JSON.parse(offerData.content) 
                      : offerData.content;

                    // Support both array and single object wrapper schemas
                    let offerObj = parsedContent;
                    if (Array.isArray(parsedContent) && parsedContent.length > 0) {
                      offerObj = parsedContent[0];
                    }

                    if (scope === resolvedPopupSurface) {
                      result.popupOffer = {
                        id: offerItem.id,
                        badge: offerObj.badge || "Summer Network Special",
                        title: offerObj.title || "Get 50% Off First 3 Months",
                        description: offerObj.description || "Experience high-velocity 5G and instant eSIM provisioning. Apply promo code AETHER50 at checkout to redeem.",
                        code: offerObj.code || "AETHER50",
                        claimed: false
                      };
                    } else if (scope === resolvedDashboardSurface) {
                      result.dashboardOffer = {
                        id: offerItem.id,
                        type: offerObj.type || "referral",
                        title: offerObj.title || "Refer a Friend, Get $25",
                        description: offerObj.description || "Earn a $25 credit on your next bill statement when a friend activates their Aether Connect eSIM profile.",
                        actionText: offerObj.actionText || "Share Invite Link",
                        claimed: false
                      };
                    }
                  } catch (parseError) {
                    console.error("AjoService: Failed to parse offer content payload:", parseError);
                  }
                }
              }
            });
          }
        });
      }

      return {
        ...result,
        rawResponse: responseJson
      };

    } catch (error) {
      console.error("AjoService: Error contacting Edge Network:", error);
      throw new Error(`Adobe Experience Edge network request failed: ${error.message}`);
    }
  },

  /**
   * General XDM collection post targeting AEP Edge Network interact endpoint.
   * Logs events inside the console database for trace debugging.
   */
  sendXdmEvent: async (credentials, eventType, xdmData, identityMap = null, logCallback = null) => {
    const { datastreamId, orgId, edgeHost } = credentials;
    if (!datastreamId || datastreamId.trim() === "" || datastreamId.trim() === "your_datastream_id_here" || !orgId) {
      throw new Error("AJO credentials not configured. Please configure your Datastream ID and Org ID in settings.");
    }

    const ecid = getOrCreateECID();

    let resolvedHost = "https://edge.adobedc.net";
    if (edgeHost && edgeHost.trim()) {
      let rawHost = edgeHost.trim();
      if (!/^https?:\/\//i.test(rawHost)) {
        const isLocal = /localhost|127\.0\.0\.1|192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\./i.test(rawHost);
        rawHost = `${isLocal ? "http" : "https"}://${rawHost}`;
      }
      while (rawHost.endsWith("/")) {
        rawHost = rawHost.slice(0, -1);
      }
      resolvedHost = rawHost;
    }

    const host = import.meta.env.DEV ? "" : resolvedHost;
    const path = import.meta.env.DEV ? "/api/ajo-edge/ee/v1/interact" : "/ee/v1/interact";
    const endpoint = `${host}${path}?configId=${datastreamId}`;

    // Consolidate identity map
    const defaultIdentityMap = {
      ECID: [{ id: ecid, primary: true }]
    };
    const finalIdentityMap = identityMap ? { ...defaultIdentityMap, ...identityMap } : defaultIdentityMap;

    const eventPayload = {
      events: [
        {
          xdm: {
            eventType,
            identityMap: finalIdentityMap,
            ...xdmData
          }
        }
      ]
    };

    const headers = {
      "Content-Type": "application/json"
    };

    const startTime = Date.now();
    const logEntry = {
      id: Date.now() + Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toLocaleTimeString(),
      eventType,
      endpoint,
      payload: eventPayload,
      status: "pending",
      duration: 0,
      response: null,
      error: null
    };

    // Callback to push state immediately as pending
    if (logCallback) logCallback(logEntry);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(eventPayload)
      });

      const duration = Date.now() - startTime;
      logEntry.duration = duration;

      if (!response.ok) {
        throw new Error(`AEP Edge Network returned HTTP status ${response.status}`);
      }

      const responseJson = await response.json();
      logEntry.status = "success";
      logEntry.response = responseJson;
      if (logCallback) logCallback(logEntry);

      return responseJson;
    } catch (err) {
      const duration = Date.now() - startTime;
      logEntry.duration = duration;
      logEntry.status = "failed";
      logEntry.error = err.message;
      if (logCallback) logCallback(logEntry);
      throw err;
    }
  },

  trackPageView: async (credentials, pageName, logCallback) => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const xdmData = {
      web: {
        webPageDetails: {
          name: pageName,
          URL: url
        }
      }
    };
    return AjoService.sendXdmEvent(credentials, "web.webpagedetails.pageViews", xdmData, null, logCallback);
  },

  trackCommercePurchase: async (credentials, compiledItems, price, profile, logCallback) => {
    const xdmData = {
      commerce: {
        order: {
          priceTotal: price,
          currencyCode: "USD"
        },
        purchases: {
          value: 1
        }
      },
      productListItems: compiledItems
    };

    const identityMap = profile ? buildIdentityMap(profile) : null;
    return AjoService.sendXdmEvent(credentials, "commerce.purchases", xdmData, identityMap, logCallback);
  },

  trackIdentityLogin: async (credentials, profile, logCallback) => {
    const xdmData = {};
    const identityMap = profile ? buildIdentityMap(profile) : null;
    return AjoService.sendXdmEvent(credentials, "user.login", xdmData, identityMap, logCallback);
  }
};

// Helper to compile dynamic identityMap mapping for user profiles
const buildIdentityMap = (profile) => {
  const map = {};
  if (profile.email) {
    map.Email = [{ id: profile.email, authenticatedState: "authenticated" }];
  }
  if (profile.phone) {
    map.Phone = [{ id: profile.phone, authenticatedState: "authenticated" }];
  }
  if (profile.crmId) {
    map.CRM = [{ id: profile.crmId, authenticatedState: "authenticated" }];
  }
  return map;
};
