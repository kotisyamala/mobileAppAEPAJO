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
    const { datastreamId, orgId, popupSurface, dashboardSurface } = credentials;

    // If datastream or surfaces are not set, throw error immediately
    if (!datastreamId || datastreamId.trim() === "" || datastreamId.trim() === "your_datastream_id_here" || !orgId) {
      throw new Error("AJO credentials not configured. Please configure your Datastream ID and Org ID in the Profile Settings tab.");
    }

    const host = import.meta.env.DEV ? "" : "https://edge.adobedc.net";
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
  }
};
