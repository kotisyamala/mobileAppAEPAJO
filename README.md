# Aether Connect - Hybrid Telecom App & AJO Experience Decisioning Integration

Welcome to **Aether Connect**, a hybrid mobile simulator for a premium telecom brand. The app features carrier eSIM profile downloads, real-time voice/data/SMS telemetry circular progress meters, a dynamic network speed diagnosis utility, live FAQ chat support with typing indicators, and a dark/light interface theme.

This repository includes a direct integration with the next-generation **Adobe Journey Optimizer (AJO) Experience Decisioning (ExD)** via the **Adobe Experience Platform (AEP) Edge Network (Experience Edge) API**, enabling real-time offer personalization for the welcome popup and home dashboard banner.

---

## 🛠️ Adobe Experience Platform (AJO) Experience Decisioning Setup Guide

To pull live offers from AJO Experience Decisioning (ExD), you need to configure your Adobe Experience Platform workspace using the following steps:

### 1. Create Decision Items (The Catalog)
Go to **Adobe Journey Optimizer** > **Experience Decisioning** > **Catalog** > **Decision Items** and create your offers:
1. Create a decision item for the **Popup Surface** containing this JSON structure in its custom attributes:
   ```json
   {
     "badge": "AJO Flash Deal",
     "title": "Claim 60% Off This Week",
     "description": "Unlock premium speeds with our exclusive discount.",
     "code": "AETHER60"
     }
   ```
2. Create a decision item for the **Dashboard Surface** containing this JSON structure in its custom attributes:
   ```json
   {
     "type": "promo",
     "title": "Upgrade to Unlimited 5G Extra",
     "description": "Add 50GB high-speed hotspot tethering to your plan.",
     "actionText": "Upgrade Plan Now"
   }
   ```

### 2. Configure Selection Strategies
1. Go to **Selection Strategies** and create your strategies.
2. Define eligibility rules and constraints (e.g. capping rules or target constraints).
3. Specify the ranking criteria (either Rules-based sorting or AI-powered optimization models).

### 3. Setup Decisions (Decision Policies)
1. Go to **Decisions** and create a decision policy.
2. Add your selection strategy and target collection of Decision Items.

### 4. Configure Channel Surfaces (URIs)
1. Go to **Administration** > **Channel Configurations** > **Surfaces** and create your Surfaces.
2. Define two unique Surface URIs:
   - `mobileapp://aether-connect/reload-popup` (for the welcome modal popup)
   - `mobileapp://aether-connect/dashboard-banner` (for the dashboard marketing banner)
3. Associate your campaign or journeys targeting these surfaces with the defined Decisions.

### 5. Configure the Datastream
1. Go to **Data Collection** > **Datastreams**.
2. Select or create your Datastream, and enable the **Adobe Experience Platform** service.
3. Toggle the **Adobe Journey Optimizer** option to active and save.

---

## 📱 Application Configuration

You can configure the application in two ways: via file configuration or interactively inside the running app.

### Option A: Interactive Settings (Recommended)
1. Launch the application locally.
2. Navigate to the **Profile** tab in the bottom bar.
3. Locate the **Adobe Edge / AJO Decisions** form.
4. Input your **Datastream ID**, **IMS Org ID**, and the two **Surface URIs** configured in AJO.
5. Click **Save & Sync Offers** to store configurations in local storage and fetch live promotions.

### Option B: Local Environment Configuration
1. In the root of the project, copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and fill in your AEP Datastream and Experience Decisioning Surface URIs:
   ```env
   VITE_AEP_DATASTREAM_ID="your_datastream_id_here"
   VITE_AEP_ORG_ID="your_org_id_here"
   VITE_AJO_SURFACE_POPUP="mobileapp://aether-connect/reload-popup"
   VITE_AJO_SURFACE_DASHBOARD="mobileapp://aether-connect/dashboard-banner"
   ```
3. Restart the development server.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm`

### Installation
1. Install project dependencies:
   ```bash
   npm install
   ```
2. Start the local development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:5173/](http://localhost:5173/) in your browser.

---

## 🧪 Verification & Fallback Integrity
* **Experience Edge API Query:** When credentials are saved, the application initiates an HTTP POST request targeting:
  `https://edge.adobedc.net/ee/v1/interact?configId={DATASTREAM_ID}`
  containing the exact `surfaces` query parameters configured (e.g. `["mobileapp://aether-connect/reload-popup", "mobileapp://aether-connect/dashboard-banner"]`) and your device's persistent ECID.
* **Local Fallback:** If the Datastream ID is unconfigured or a request fails, the application automatically falls back to rendering local mock offers so the layout remains complete and attractive.
