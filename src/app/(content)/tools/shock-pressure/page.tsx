"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { ReportRequestForm } from "@/components/features/tools/ReportRequestForm";

type RidingStyle = "xc" | "trail" | "enduro" | "dh";
type TubeType = "tubeless" | "tubed";
type MtbTerrain = "hardpack" | "loam" | "loose_rocky" | "mud" | "mixed";
type TyreCasing = "lightweight" | "trail_casing" | "enduro_dh";

/* ================================================================== */
/*  FORK BRAND / MODEL DATA                                            */
/*  Official manufacturer lookup tables (2025 model year)              */
/*  Sources:                                                            */
/*  - Fox: tech.ridefox.com 2025 owners manuals                       */
/*  - RockShox: SRAM 2025 Front Suspension Specifications PDF          */
/*  - Marzocchi: Fox subsidiary, similar internals to Fox 36 Rhythm    */
/*  Each entry: [riderWeightLbs, PSI]                                  */
/*  Interpolation used between points.                                 */
/* ================================================================== */

type DataPoint = [number, number]; // [rider weight lbs, PSI]

interface ForkModel {
  name: string;
  /** Lookup table: [riderWeightLbs, PSI] pairs from manufacturer chart */
  pressureTable: DataPoint[];
  maxPSI: number;
  travelRange: string;
  setupNotes: string;
}

interface ForkBrand {
  name: string;
  models: ForkModel[];
}

/**
 * Fox fork pressure tables — directly from tech.ridefox.com 2025 manuals.
 * Weight values use midpoint of each 10lb band (e.g., 120-130 → 125).
 * Sag target: 15-20% of total fork travel (Fox recommendation).
 */
const FORK_BRANDS: ForkBrand[] = [
  {
    name: "Fox",
    models: [
      {
        name: "32 Taper-Cast",
        pressureTable: [
          [125, 100], [135, 104], [145, 108], [155, 113], [165, 117],
          [175, 121], [185, 125], [195, 129], [205, 133], [215, 138],
          [225, 142], [235, 146], [245, 150],
        ],
        maxPSI: 150,
        travelRange: "100-120mm",
        setupNotes: "XC race fork. High pressures due to small air spring volume. Use volume spacers to tune end-stroke progression.",
      },
      {
        name: "32 Step-Cast",
        pressureTable: [
          [125, 65], [135, 70], [145, 74], [155, 80], [165, 85],
          [175, 90], [185, 96], [195, 101], [205, 106], [215, 111],
          [225, 116], [235, 121], [245, 126],
        ],
        maxPSI: 140,
        travelRange: "100-120mm",
        setupNotes: "Lightweight XC fork. Step-Cast lowers use less material for weight savings. Same air spring as 32 Rhythm.",
      },
      {
        name: "34 FLOAT",
        pressureTable: [
          [125, 64], [135, 69], [145, 74], [155, 78], [165, 83],
          [175, 88], [185, 92], [195, 97], [205, 102], [215, 106],
          [225, 111], [235, 116], [245, 120],
        ],
        maxPSI: 120,
        travelRange: "120-140mm",
        setupNotes: "Trail fork with FLOAT air spring and GRIP/GRIP2 damper. Good balance of weight and performance for trail riding.",
      },
      {
        name: "34 Step-Cast",
        pressureTable: [
          [125, 65], [135, 70], [145, 74], [155, 80], [165, 85],
          [175, 90], [185, 96], [195, 101], [205, 106], [215, 111],
          [225, 116], [235, 121], [245, 126],
        ],
        maxPSI: 120,
        travelRange: "110-120mm",
        setupNotes: "Lightweight downcountry fork. Step-Cast lowers for weight savings.",
      },
      {
        name: "34 Rhythm",
        pressureTable: [
          [125, 58], [135, 63], [145, 68], [155, 72], [165, 77],
          [175, 82], [185, 86], [195, 91], [205, 96], [215, 100],
          [225, 105], [235, 110], [245, 114],
        ],
        maxPSI: 120,
        travelRange: "120-140mm",
        setupNotes: "Budget-friendly trail fork. Same chassis as 34 FLOAT but with GRIP damper. Slightly lower pressures than FLOAT due to different air spring tune.",
      },
      {
        name: "36 FLOAT",
        pressureTable: [
          [125, 66], [135, 70], [145, 74], [155, 78], [165, 82],
          [175, 86], [185, 89], [195, 94], [205, 99], [215, 105],
          [225, 109], [235, 113], [245, 117],
        ],
        maxPSI: 120,
        travelRange: "140-160mm",
        setupNotes: "The trail/enduro benchmark. FLOAT air spring with GRIP2 damper. Equalise air chambers by cycling through 25% travel 10 times with pump attached.",
      },
      {
        name: "36 Rhythm",
        pressureTable: [
          [125, 55], [135, 59], [145, 63], [155, 67], [165, 72],
          [175, 76], [185, 80], [195, 85], [205, 89], [215, 93],
          [225, 97], [235, 102], [245, 106],
        ],
        maxPSI: 120,
        travelRange: "140-160mm",
        setupNotes: "Budget trail/enduro fork. Same chassis as 36 FLOAT but with GRIP damper. Lower pressures than FLOAT variant.",
      },
      {
        name: "38 FLOAT",
        pressureTable: [
          [125, 72], [135, 76], [145, 80], [155, 84], [165, 89],
          [175, 93], [185, 97], [195, 102], [205, 106], [215, 110],
          [225, 114], [235, 119], [245, 123],
        ],
        maxPSI: 140,
        travelRange: "160-180mm",
        setupNotes: "Enduro/DH fork. 38mm stanchions for maximum stiffness. FLOAT air spring with GRIP2 damper.",
      },
      {
        name: "38 Rhythm",
        pressureTable: [
          [125, 59], [135, 63], [145, 67], [155, 72], [165, 76],
          [175, 80], [185, 84], [195, 88], [205, 92], [215, 97],
          [225, 101], [235, 105], [245, 109],
        ],
        maxPSI: 120,
        travelRange: "160-180mm",
        setupNotes: "Budget enduro fork. Same 38mm chassis as FLOAT but with GRIP damper.",
      },
      {
        name: "40 FLOAT",
        pressureTable: [
          [125, 55], [135, 58], [145, 61], [155, 64], [165, 70],
          [175, 73], [185, 76], [195, 82], [205, 85], [215, 88],
          [225, 94], [235, 97], [245, 101],
        ],
        maxPSI: 120,
        travelRange: "180-203mm",
        setupNotes: "Downhill dual-crown fork. 40mm stanchions for maximum stiffness at speed. Lowest pressures of any Fox fork due to very large air spring volume.",
      },
    ],
  },
  {
    name: "RockShox",
    models: [
      {
        name: "SID (DebonAir+)",
        pressureTable: [
          [90, 35], [110, 45], [130, 58], [150, 70], [170, 82],
          [190, 93], [210, 103],
        ],
        maxPSI: 150,
        travelRange: "100-120mm",
        setupNotes: "XC race fork with DebonAir+ air spring. Very low pressures — this is normal for DebonAir+. Cycle through full travel 20 times after setting pressure to equalise chambers.",
      },
      {
        name: "SID SL (DebonAir)",
        pressureTable: [
          [110, 63], [130, 80], [150, 98], [170, 113], [190, 128],
          [210, 138],
        ],
        maxPSI: 195,
        travelRange: "100-110mm",
        setupNotes: "Lightweight XC fork. Higher pressures than SID due to standard DebonAir (not DebonAir+). Check the sticker on the back of your fork for model-specific pressure recommendations.",
      },
      {
        name: "Reba (Solo Air)",
        pressureTable: [
          [110, 63], [130, 80], [150, 98], [170, 113], [190, 128],
          [210, 138],
        ],
        maxPSI: 195,
        travelRange: "100-120mm",
        setupNotes: "Trail fork with Solo Air spring. Higher pressures than DebonAir+ models. Good all-round fork for XC/light trail.",
      },
      {
        name: "Pike (DebonAir+, 120mm)",
        pressureTable: [
          [110, 55], [130, 65], [150, 75], [170, 85], [190, 95],
          [210, 105], [230, 113],
        ],
        maxPSI: 163,
        travelRange: "120mm",
        setupNotes: "Trail fork with DebonAir+ air spring and Charger 3.1 RC2 damper. Cycle through full travel 20 times after setting pressure. Lower travel = slightly higher pressure.",
      },
      {
        name: "Pike (DebonAir+, 130-140mm)",
        pressureTable: [
          [110, 45], [130, 55], [150, 65], [170, 75], [190, 85],
          [210, 95], [230, 103],
        ],
        maxPSI: 163,
        travelRange: "130-140mm",
        setupNotes: "Trail fork with DebonAir+ air spring. Higher travel = lower pressure needed. Charger 3.1 RC2 damper on Ultimate/Select+ models.",
      },
      {
        name: "Lyrik (DebonAir+, 140mm)",
        pressureTable: [
          [110, 55], [130, 65], [150, 75], [170, 85], [190, 95],
          [210, 105], [230, 113],
        ],
        maxPSI: 163,
        travelRange: "140mm",
        setupNotes: "Aggressive trail/enduro fork. DebonAir+ air spring with Charger 3.1 RC2 damper (Ultimate). Same pressure curve as Pike at 120mm travel.",
      },
      {
        name: "Lyrik (DebonAir+, 150-160mm)",
        pressureTable: [
          [110, 45], [130, 55], [150, 65], [170, 75], [190, 85],
          [210, 95], [230, 103],
        ],
        maxPSI: 163,
        travelRange: "150-160mm",
        setupNotes: "Enduro fork. Higher travel = lower pressure. DebonAir+ air spring with Charger 3.1 damper. Cycle through full travel 20 times after setting pressure.",
      },
      {
        name: "Zeb (DebonAir+, 150-160mm)",
        pressureTable: [
          [110, 40], [130, 50], [150, 58], [170, 66], [190, 74],
          [210, 83], [230, 90],
        ],
        maxPSI: 148,
        travelRange: "150-160mm",
        setupNotes: "Heavy-duty enduro fork. 38mm stanchions. DebonAir+ runs very low pressures — this is normal. Cycle through full travel 20 times after setting pressure.",
      },
      {
        name: "Zeb (DebonAir+, 170-180mm)",
        pressureTable: [
          [110, 32], [130, 41], [150, 50], [170, 58], [190, 66],
          [210, 74], [230, 82],
        ],
        maxPSI: 148,
        travelRange: "170-180mm",
        setupNotes: "Long-travel enduro fork. Very low pressures at higher travel settings. DebonAir+ air spring with Charger 3.1 damper.",
      },
      {
        name: "Zeb (DebonAir+, 190mm)",
        pressureTable: [
          [110, 25], [130, 33], [150, 42], [170, 50], [190, 58],
          [210, 66], [230, 73],
        ],
        maxPSI: 148,
        travelRange: "190mm",
        setupNotes: "Maximum travel Zeb. Extremely low pressures — this is normal for 190mm DebonAir+. Do not be alarmed.",
      },
      {
        name: "Boxxer (DebonAir+, 180mm)",
        pressureTable: [
          [110, 108], [130, 128], [150, 153], [170, 178], [190, 203],
          [210, 228], [230, 248],
        ],
        maxPSI: 300,
        travelRange: "180mm",
        setupNotes: "DH dual-crown fork. Much higher pressures than single-crown forks. DebonAir+ with ButterCups and Charger 3 RC2 damper.",
      },
      {
        name: "Boxxer (DebonAir+, 190-200mm)",
        pressureTable: [
          [110, 83], [130, 100], [150, 120], [170, 143], [190, 160],
          [210, 180], [230, 195],
        ],
        maxPSI: 300,
        travelRange: "190-200mm",
        setupNotes: "Long-travel DH fork. Lower pressures than 180mm due to larger air volume at higher travel. DebonAir+ with Charger 3 RC damper.",
      },
      {
        name: "Domain (DebonAir, 130-150mm)",
        pressureTable: [
          [110, 40], [130, 50], [150, 58], [170, 66], [190, 74],
          [210, 83], [230, 90],
        ],
        maxPSI: 148,
        travelRange: "130-180mm",
        setupNotes: "Budget enduro/freeride fork. DebonAir air spring. Similar pressure curve to Zeb at 150-160mm.",
      },
      {
        name: "Recon Gold (DebonAir)",
        pressureTable: [
          [110, 50], [130, 63], [150, 75], [170, 88], [190, 100],
          [210, 113], [230, 123],
        ],
        maxPSI: 225,
        travelRange: "100-150mm",
        setupNotes: "Mid-range trail fork. DebonAir air spring with Motion Control RL damper.",
      },
    ],
  },
  {
    name: "Marzocchi",
    models: [
      {
        name: "Bomber Z2 (Fox 34 Rhythm)",
        // Marzocchi is Fox subsidiary — Bomber Z2 uses Fox 34 Rhythm internals
        pressureTable: [
          [125, 58], [135, 63], [145, 68], [155, 72], [165, 77],
          [175, 82], [185, 86], [195, 91], [205, 96], [215, 100],
          [225, 105], [235, 110], [245, 114],
        ],
        maxPSI: 120,
        travelRange: "120-140mm",
        setupNotes: "Marzocchi is a Fox subsidiary. Bomber Z2 uses identical internals to Fox 34 Rhythm. Setup procedure is the same.",
      },
      {
        name: "Bomber Z1 (Fox 36 Rhythm)",
        // Bomber Z1 uses Fox 36 Rhythm internals
        pressureTable: [
          [125, 55], [135, 59], [145, 63], [155, 67], [165, 72],
          [175, 76], [185, 80], [195, 85], [205, 89], [215, 93],
          [225, 97], [235, 102], [245, 106],
        ],
        maxPSI: 120,
        travelRange: "140-170mm",
        setupNotes: "Marzocchi is a Fox subsidiary. Bomber Z1 uses identical internals to Fox 36 Rhythm. Setup procedure is the same.",
      },
    ],
  },
];

/* ================================================================== */
/*  SHOCK BRAND / MODEL DATA                                            */
/*  Lookup tables calibrated against manufacturer published charts      */
/* ================================================================== */

interface ShockModel {
  name: string;
  type: "air" | "coil";
  pressureTable: DataPoint[];
  maxPSI: number;
  setupNotes: string;
}

interface ShockBrand {
  name: string;
  models: ShockModel[];
}

const SHOCK_BRANDS: ShockBrand[] = [
  {
    name: "Fox",
    models: [
      {
        name: "Float DPS",
        type: "air",
        // Smaller air can — runs slightly lower than rider weight in lbs
        pressureTable: [
          [100, 130], [120, 150], [140, 170], [160, 190],
          [180, 210], [200, 230], [220, 250],
        ],
        maxPSI: 300,
        setupNotes: "Equalise air chambers by cycling through 25% travel 10 times with pump attached. Use volume spacers to tune end-stroke progression — add spacers if you bottom out frequently.",
      },
      {
        name: "Float X / DPX2",
        type: "air",
        // Fox official: "Set air pressure to match body weight in lbs" as starting point
        // DPX reference chart: 100=140, 120=160, 140=180, 160=200, 180=220, 200=240
        pressureTable: [
          [100, 140], [120, 160], [140, 180], [160, 200],
          [180, 220], [200, 240], [220, 260],
        ],
        maxPSI: 350,
        setupNotes: "Equalise air chambers by cycling through 25% travel 10 times with pump attached. Starting point is approximately your body weight in lbs. Adjust volume spacers for end-stroke support.",
      },
      {
        name: "Float X2",
        type: "air",
        // Larger air can — runs similar to Float X but with more damping adjustment
        pressureTable: [
          [100, 140], [120, 160], [140, 180], [160, 200],
          [180, 220], [200, 240], [220, 260],
        ],
        maxPSI: 350,
        setupNotes: "High-end air shock with independent high/low speed compression and rebound. Equalise air chambers by cycling through 25% travel 10 times. Extremely tuneable — start with all dials in the middle.",
      },
      {
        name: "DHX Air",
        type: "air",
        // Larger negative spring volume — runs higher pressures
        pressureTable: [
          [100, 150], [120, 175], [140, 195], [160, 215],
          [180, 240], [200, 260], [220, 280],
        ],
        maxPSI: 350,
        setupNotes: "DHX has a larger negative chamber. Cycle through full travel 10 times with pump attached to equalise. Higher pressures are normal compared to Float models.",
      },
    ],
  },
  {
    name: "RockShox",
    models: [
      {
        name: "Super Deluxe Ultimate",
        type: "air",
        // Official SRAM chart: <100=<110, 100-120=110-130, 120-140=130-150, etc.
        pressureTable: [
          [100, 110], [120, 130], [140, 150], [160, 170],
          [180, 190], [200, 210], [220, 230],
        ],
        maxPSI: 300,
        setupNotes: "Cycle through full travel 20 times to equalise chambers. MegNeg air can upgrade available for improved small-bump sensitivity. Adjust Thru Shaft hydraulic bottom-out for end-stroke control.",
      },
      {
        name: "Super Deluxe Select+",
        type: "air",
        pressureTable: [
          [100, 110], [120, 130], [140, 150], [160, 170],
          [180, 190], [200, 210], [220, 230],
        ],
        maxPSI: 300,
        setupNotes: "Same air spring as Super Deluxe Ultimate but with simpler damper. Cycle through full travel 20 times to equalise.",
      },
      {
        name: "Deluxe",
        type: "air",
        // Smaller air can — runs ~10-15 PSI higher
        pressureTable: [
          [100, 125], [120, 145], [140, 165], [160, 185],
          [180, 205], [200, 225], [220, 245],
        ],
        maxPSI: 300,
        setupNotes: "Smaller air can than Super Deluxe — expect higher pressures for equivalent sag. Cycle through full travel 20 times to equalise. Consider DebonAir+ air spring upgrade.",
      },
      {
        name: "Vivid",
        type: "air",
        // Similar to Super Deluxe but optimised for longer travel
        pressureTable: [
          [100, 105], [120, 125], [140, 145], [160, 165],
          [180, 185], [200, 205], [220, 225],
        ],
        maxPSI: 300,
        setupNotes: "Long-travel air shock for enduro/DH. DebonAir+ air spring with Charger damper. Slightly lower pressures than Super Deluxe due to larger air can.",
      },
      {
        name: "SID Luxe",
        type: "air",
        // XC shock — smaller and lighter, runs higher pressures
        pressureTable: [
          [100, 130], [120, 150], [140, 170], [160, 190],
          [180, 210], [200, 230], [220, 250],
        ],
        maxPSI: 300,
        setupNotes: "XC/downcountry rear shock. Compact design with lockout. Higher pressures than trail shocks due to smaller air can. Cycle through full travel to equalise.",
      },
    ],
  },
  {
    name: "Cane Creek",
    models: [
      {
        name: "DBair / Air IL",
        type: "air",
        pressureTable: [
          [100, 140], [120, 165], [140, 190], [160, 215],
          [180, 240], [200, 260], [220, 280],
        ],
        maxPSI: 350,
        setupNotes: "Use the Cane Creek Dialed app for fine-tuning. Independent high/low speed compression and rebound — start with all dials in the middle. Adjust air pressure first, then damping.",
      },
      {
        name: "DBcoil / Coil IL",
        type: "coil",
        pressureTable: [],
        maxPSI: 0,
        setupNotes: "Coil shock — no air pressure needed. Choose spring rate based on rider weight: multiply your weight in lbs by the leverage ratio midpoint. Contact Cane Creek or use their Dialed app for spring rate recommendations.",
      },
    ],
  },
  {
    name: "DVO",
    models: [
      {
        name: "Topaz T3 Air",
        type: "air",
        // DVO runs much lower pressures — large air can
        pressureTable: [
          [100, 45], [120, 58], [140, 68], [160, 77],
          [180, 86], [200, 95], [220, 105],
        ],
        maxPSI: 200,
        setupNotes: "DVO Topaz runs much lower pressures than Fox or RockShox — this is normal. Inflate to 50 PSI first and cycle several times, then set to target. Bladder pressure should be 170-200 PSI (lighter riders lower, heavier riders higher). Use OTT dial to adjust off-the-top sensitivity.",
      },
      {
        name: "Jade X Coil",
        type: "coil",
        pressureTable: [],
        maxPSI: 0,
        setupNotes: "Coil shock — no air pressure setting. Select coil spring rate based on rider weight and leverage ratio. DVO recommends contacting their support for spring rate advice specific to your frame.",
      },
    ],
  },
  {
    name: "EXT",
    models: [
      {
        name: "Storia V3",
        type: "air",
        // EXT runs ~5% lower than Fox Float X
        pressureTable: [
          [100, 133], [120, 152], [140, 171], [160, 190],
          [180, 209], [200, 228], [220, 247],
        ],
        maxPSI: 300,
        setupNotes: "EXT shocks are custom-valved to your order specification. These pressures are starting points — your shock may have been tuned for different sag targets. Refer to the setup card shipped with your shock.",
      },
    ],
  },
  {
    name: "Marzocchi",
    models: [
      {
        name: "Bomber Air",
        type: "air",
        // Fox subsidiary — similar internals to Fox Float DPS
        pressureTable: [
          [100, 130], [120, 150], [140, 170], [160, 190],
          [180, 210], [200, 230], [220, 250],
        ],
        maxPSI: 300,
        setupNotes: "Marzocchi is a Fox subsidiary — Bomber Air uses similar internals to Fox Float. Setup procedure is identical to Fox Float shocks.",
      },
      {
        name: "Bomber CR (Coil)",
        type: "coil",
        pressureTable: [],
        maxPSI: 0,
        setupNotes: "Coil shock — no air pressure needed. Use a spring rate calculator: rider weight in lbs multiplied by your frame's leverage ratio midpoint gives approximate spring rate in lb/in.",
      },
    ],
  },
  {
    name: "Ohlins",
    models: [
      {
        name: "TTX Air",
        type: "air",
        // Mondraker guide: 70psi at ~125lb to 130psi at ~240lb
        pressureTable: [
          [100, 60], [120, 70], [140, 82], [160, 93],
          [180, 105], [200, 117], [220, 128],
        ],
        maxPSI: 200,
        setupNotes: "Ohlins TTX Air runs significantly lower pressures than Fox or RockShox — this is normal due to the large air can volume. Start at 170 PSI when first filling, then release to target.",
      },
    ],
  },
  {
    name: "SR Suntour",
    models: [
      {
        name: "Edge / Triair",
        type: "air",
        // Budget shock — smaller air can — runs ~15% higher than Fox
        pressureTable: [
          [100, 150], [120, 175], [140, 198], [160, 220],
          [180, 242], [200, 265], [220, 285],
        ],
        maxPSI: 300,
        setupNotes: "SR Suntour Edge runs higher pressures than premium shocks due to a smaller air spring volume. Never exceed 300 PSI. Cycle through full travel several times after setting pressure.",
      },
    ],
  },
];

/* ================================================================== */
/*  INTERPOLATION                                                       */
/* ================================================================== */

function interpolateTable(
  table: DataPoint[],
  value: number
): number {
  if (table.length === 0) return 0;
  if (value <= table[0][0]) return table[0][1];

  const n = table.length;
  if (value >= table[n - 1][0]) {
    // Extrapolate above using last two points
    const dX = table[n - 1][0] - table[n - 2][0];
    const dY = table[n - 1][1] - table[n - 2][1];
    const extra = value - table[n - 1][0];
    return table[n - 1][1] + (dY / dX) * extra;
  }

  for (let i = 0; i < n - 1; i++) {
    if (value >= table[i][0] && value <= table[i + 1][0]) {
      const t = (value - table[i][0]) / (table[i + 1][0] - table[i][0]);
      return table[i][1] + t * (table[i + 1][1] - table[i][1]);
    }
  }

  return table[n - 1][1];
}

/* ================================================================== */
/*  SUSPENSION CALCULATOR                                               */
/* ================================================================== */

interface SuspensionResult {
  forkPSI: number;
  forkBrand: string;
  forkModel: string;
  forkMaxPSI: number;
  forkSetupNotes: string;
  forkTravel: string;
  rearPSI: number;
  shockBrand: string;
  shockModel: string;
  shockMaxPSI: number;
  shockSetupNotes: string;
  isCoil: boolean;
  sagTarget: string;
  sagDescription: string;
  forkSagTarget: string;
  volumeSpacerNote: string;
}

function calculateSuspension(
  riderWeightKg: number,
  ridingStyle: RidingStyle,
  forkBrandIdx: number,
  forkModelIdx: number,
  shockBrandIdx: number,
  shockModelIdx: number,
  volumeSpacers: number
): SuspensionResult {
  const riderWeightLbs = riderWeightKg * 2.205;

  const forkBrand = FORK_BRANDS[forkBrandIdx];
  const forkModel = forkBrand.models[forkModelIdx];
  const shockBrand = SHOCK_BRANDS[shockBrandIdx];
  const shockModel = shockBrand.models[shockModelIdx];

  // Style config: sag targets differ by riding style
  // Fox recommends 15-20% fork sag; RockShox recommends similar
  // Rear shock: 25-30% is standard; XC runs less, DH runs more
  const styleConfig: Record<
    RidingStyle,
    {
      rearSag: [number, number];
      forkSag: [number, number];
      rearMult: number; // multiplier on rear shock base PSI
      forkMult: number; // multiplier on fork base PSI
    }
  > = {
    xc:     { rearSag: [20, 25], forkSag: [15, 18], rearMult: 1.08, forkMult: 1.05 },
    trail:  { rearSag: [25, 30], forkSag: [18, 22], rearMult: 1.00, forkMult: 1.00 },
    enduro: { rearSag: [28, 33], forkSag: [20, 25], rearMult: 0.95, forkMult: 0.95 },
    dh:     { rearSag: [30, 35], forkSag: [22, 28], rearMult: 0.90, forkMult: 0.90 },
  };

  const config = styleConfig[ridingStyle];

  // Fork pressure: direct lookup from manufacturer table, then adjust for style
  // The manufacturer tables are calibrated for ~20% sag (trail baseline)
  let forkPSI = interpolateTable(forkModel.pressureTable, riderWeightLbs);
  forkPSI *= config.forkMult;
  // Volume spacers increase progression — need ~1-2% more pressure per spacer
  // to maintain the same sag point (spacers reduce air volume, making spring more progressive)
  forkPSI *= (1 + volumeSpacers * 0.015);
  forkPSI = Math.round(forkPSI);
  forkPSI = Math.min(forkPSI, forkModel.maxPSI);

  // Rear shock pressure: brand-specific lookup with style multiplier
  let rearPSI = 0;
  const isCoil = shockModel.type === "coil";
  if (!isCoil && shockModel.pressureTable.length > 0) {
    rearPSI = interpolateTable(shockModel.pressureTable, riderWeightLbs);
    rearPSI *= config.rearMult;
    // Volume spacers on rear shock: similar small adjustment
    rearPSI *= (1 + volumeSpacers * 0.012);
    rearPSI = Math.round(rearPSI);
    rearPSI = Math.min(rearPSI, shockModel.maxPSI);
  }

  const descriptions: Record<RidingStyle, string> = {
    xc: "Cross-country: firmer setup for efficiency on climbs. Less sag = more pedalling platform. Use lockout on smooth climbs.",
    trail: "Trail riding: balanced setup for climbing and descending. The all-rounder. Adjust rebound to match trail conditions.",
    enduro: "Enduro: softer setup to absorb big hits on descents. More sag for better small-bump sensitivity and grip.",
    dh: "Downhill: maximum plushness for high-speed impacts. Run more sag and slower rebound. Climbing efficiency doesn't matter here.",
  };

  let volumeSpacerNote = "";
  if (volumeSpacers > 0) {
    volumeSpacerNote = `Running ${volumeSpacers} volume spacer${volumeSpacers > 1 ? "s" : ""}/token${volumeSpacers > 1 ? "s" : ""}. This increases end-stroke progression — you may need slightly higher pressure to maintain the same sag. If you're bottoming out easily, add more spacers rather than just adding pressure.`;
  }

  return {
    forkPSI,
    forkBrand: forkBrand.name,
    forkModel: forkModel.name,
    forkMaxPSI: forkModel.maxPSI,
    forkSetupNotes: forkModel.setupNotes,
    forkTravel: forkModel.travelRange,
    rearPSI,
    shockBrand: shockBrand.name,
    shockModel: shockModel.name,
    shockMaxPSI: shockModel.maxPSI,
    shockSetupNotes: shockModel.setupNotes,
    isCoil,
    sagTarget: `${config.rearSag[0]}–${config.rearSag[1]}%`,
    sagDescription: descriptions[ridingStyle],
    forkSagTarget: `${config.forkSag[0]}–${config.forkSag[1]}%`,
    volumeSpacerNote,
  };
}

/* ================================================================== */
/*  MTB TYRE PRESSURE CALCULATOR                                        */
/*  Lookup table + adjustments for terrain, casing, rim width           */
/*  Calibrated against Bike Faff, CushCore, and Enve reference data    */
/* ================================================================== */

/**
 * Base pressure lookup by riding style and rider weight.
 * Reference: 2.4" tyres, tubeless, ~14kg bike, 30mm internal rim.
 * Values from Bike Faff, cross-referenced with SILCA MTB and Enve data.
 */
const TYRE_PRESSURE_TABLE: Record<
  RidingStyle,
  Array<{ kg: number; front: number; rear: number }>
> = {
  xc: [
    { kg: 45, front: 17, rear: 21 },
    { kg: 55, front: 18, rear: 22 },
    { kg: 65, front: 20, rear: 23 },
    { kg: 75, front: 22, rear: 24 },
    { kg: 85, front: 25, rear: 26 },
    { kg: 95, front: 26, rear: 28 },
    { kg: 105, front: 28, rear: 30 },
    { kg: 115, front: 30, rear: 32 },
  ],
  trail: [
    { kg: 45, front: 16, rear: 20 },
    { kg: 55, front: 17, rear: 21 },
    { kg: 65, front: 19, rear: 22 },
    { kg: 75, front: 21, rear: 23 },
    { kg: 85, front: 24, rear: 25 },
    { kg: 95, front: 25, rear: 27 },
    { kg: 105, front: 27, rear: 29 },
    { kg: 115, front: 29, rear: 31 },
  ],
  enduro: [
    { kg: 45, front: 15, rear: 19 },
    { kg: 55, front: 16, rear: 20 },
    { kg: 65, front: 18, rear: 21 },
    { kg: 75, front: 20, rear: 22 },
    { kg: 85, front: 23, rear: 24 },
    { kg: 95, front: 24, rear: 26 },
    { kg: 105, front: 26, rear: 28 },
    { kg: 115, front: 28, rear: 30 },
  ],
  dh: [
    { kg: 45, front: 14, rear: 18 },
    { kg: 55, front: 15, rear: 19 },
    { kg: 65, front: 17, rear: 20 },
    { kg: 75, front: 19, rear: 21 },
    { kg: 85, front: 22, rear: 23 },
    { kg: 95, front: 23, rear: 25 },
    { kg: 105, front: 25, rear: 27 },
    { kg: 115, front: 27, rear: 29 },
  ],
};

function interpolateTyreTable(
  table: Array<{ kg: number; front: number; rear: number }>,
  riderKg: number
): { front: number; rear: number } {
  if (riderKg <= table[0].kg) return { front: table[0].front, rear: table[0].rear };

  const n = table.length;
  if (riderKg >= table[n - 1].kg) {
    const dKg = table[n - 1].kg - table[n - 2].kg;
    const slopeF = (table[n - 1].front - table[n - 2].front) / dKg;
    const slopeR = (table[n - 1].rear - table[n - 2].rear) / dKg;
    const extra = riderKg - table[n - 1].kg;
    return {
      front: table[n - 1].front + slopeF * extra,
      rear: table[n - 1].rear + slopeR * extra,
    };
  }

  for (let i = 0; i < n - 1; i++) {
    if (riderKg >= table[i].kg && riderKg <= table[i + 1].kg) {
      const t = (riderKg - table[i].kg) / (table[i + 1].kg - table[i].kg);
      return {
        front: table[i].front + t * (table[i + 1].front - table[i].front),
        rear: table[i].rear + t * (table[i + 1].rear - table[i].rear),
      };
    }
  }

  return { front: table[n - 1].front, rear: table[n - 1].rear };
}

function calculateMtbTyrePressure(
  riderWeightKg: number,
  bikeWeightKg: number,
  tyreWidth: number, // inches (e.g., 2.4)
  ridingStyle: RidingStyle,
  tubeType: TubeType,
  terrain: MtbTerrain,
  casing: TyreCasing,
  rimWidth: number // internal mm
): { front: number; rear: number } {
  const table = TYRE_PRESSURE_TABLE[ridingStyle];
  let { front, rear } = interpolateTyreTable(table, riderWeightKg);

  // 1. Bike weight adjustment (reference table assumes ~14kg bike)
  const bikeAdj = (riderWeightKg + bikeWeightKg) / (riderWeightKg + 14);
  front *= bikeAdj;
  rear *= bikeAdj;

  // 2. Tyre width adjustment (reference table calibrated at 2.4")
  //    Approximately -8 PSI per inch of additional tyre width (Bike Faff)
  const widthDelta = -8 * (tyreWidth - 2.4);
  front += widthDelta;
  rear += widthDelta;

  // 3. Tube type: tubes need +4 PSI for pinch flat protection
  if (tubeType === "tubed") {
    front += 4;
    rear += 4;
  }

  // 4. Terrain adjustment
  const terrainMod: Record<MtbTerrain, number> = {
    hardpack: 1.0,     // firm surface — standard pressure
    loam: 0.95,        // soft soil — slightly lower for grip
    loose_rocky: 1.05, // loose rocks — slightly higher to prevent rim strikes
    mud: 0.92,         // mud — lower pressure for maximum contact patch
    mixed: 1.0,        // mixed conditions — no change
  };
  front *= terrainMod[terrain];
  rear *= terrainMod[terrain];

  // 5. Tyre casing adjustment
  // Heavier casings have more puncture protection and sidewall support,
  // allowing lower pressures. Lightweight casings need higher pressure.
  const casingMod: Record<TyreCasing, number> = {
    lightweight: 1.08,   // +8% — less sidewall support, need more air
    trail_casing: 1.0,   // baseline
    enduro_dh: 0.93,     // -7% — heavy casing allows lower pressure
  };
  front *= casingMod[casing];
  rear *= casingMod[casing];

  // 6. Rim width adjustment (reference: 30mm internal)
  // Wider rims spread the tyre, increasing effective volume
  // ~1% pressure reduction per mm of extra rim width beyond 30mm
  const rimDelta = rimWidth - 30;
  const rimFactor = 1 - rimDelta * 0.01;
  front *= rimFactor;
  rear *= rimFactor;

  // Clamp to safe MTB ranges
  front = Math.max(14, Math.min(45, front));
  rear = Math.max(15, Math.min(50, rear));

  return {
    front: Math.round(front * 2) / 2, // round to nearest 0.5
    rear: Math.round(rear * 2) / 2,
  };
}

/* ================================================================== */
/*  VALIDATION                                                          */
/* ================================================================== */

const VALIDATION = {
  riderWeight: { min: 30, max: 200, label: "Rider weight", unit: "kg" },
  bikeWeight: { min: 5, max: 30, label: "Bike weight", unit: "kg" },
} as const;

function getValidationError(value: string, field: keyof typeof VALIDATION): string | null {
  if (!value) return null;
  const num = parseFloat(value);
  if (isNaN(num)) return "Please enter a valid number";
  const { min, max, label, unit } = VALIDATION[field];
  if (num < min) return `${label} must be at least ${min}${unit}`;
  if (num > max) return `${label} must be under ${max}${unit}`;
  return null;
}

/* ================================================================== */
/*  PAGE COMPONENT                                                      */
/* ================================================================== */

export default function MtbSetupPage() {
  // Shared inputs
  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [bikeWeight, setBikeWeight] = useState("14");
  const [style, setStyle] = useState<RidingStyle>("trail");

  // Fork brand/model selection
  const [forkBrandIdx, setForkBrandIdx] = useState(0);
  const [forkModelIdx, setForkModelIdx] = useState(5); // Fox 36 FLOAT default

  // Shock brand/model selection
  const [shockBrandIdx, setShockBrandIdx] = useState(0);
  const [shockModelIdx, setShockModelIdx] = useState(1); // Fox Float X / DPX2 default

  // Volume spacers
  const [volumeSpacers, setVolumeSpacers] = useState("0");

  // Tyre inputs
  const [tyreWidth, setTyreWidth] = useState("2.4");
  const [tubeType, setTubeType] = useState<TubeType>("tubeless");
  const [terrain, setTerrain] = useState<MtbTerrain>("mixed");
  const [tyreCasing, setTyreCasing] = useState<TyreCasing>("trail_casing");
  const [rimWidth, setRimWidth] = useState("30");

  // Results
  const [suspensionResult, setSuspensionResult] = useState<SuspensionResult | null>(null);
  const [tyreResult, setTyreResult] = useState<{ front: number; rear: number } | null>(null);
  const [copied, setCopied] = useState(false);

  const selectedForkBrand = FORK_BRANDS[forkBrandIdx];
  const selectedShockBrand = SHOCK_BRANDS[shockBrandIdx];

  const weightError = getValidationError(
    weightUnit === "lbs" && weight ? String(parseFloat(weight) * 0.4536) : weight,
    "riderWeight"
  );
  const bikeWeightError = getValidationError(bikeWeight, "bikeWeight");
  const hasErrors = !!weightError || !!bikeWeightError;

  // Convert weight to kg for calculations
  const getWeightKg = (): number => {
    const w = parseFloat(weight);
    return weightUnit === "lbs" ? w * 0.4536 : w;
  };

  const handleCalculateAll = () => {
    if (hasErrors) return;
    const wKg = getWeightKg();
    const bw = parseFloat(bikeWeight);
    const tw = parseFloat(tyreWidth);
    const spacers = parseInt(volumeSpacers) || 0;
    const riw = parseInt(rimWidth);
    if (wKg > 0) {
      setSuspensionResult(
        calculateSuspension(wKg, style, forkBrandIdx, forkModelIdx, shockBrandIdx, shockModelIdx, spacers)
      );
      if (bw > 0 && tw > 0 && riw > 0) {
        setTyreResult(calculateMtbTyrePressure(wKg, bw, tw, style, tubeType, terrain, tyreCasing, riw));
      }
    }
  };

  const handleCopyResults = async () => {
    if (!suspensionResult && !tyreResult) return;
    const styleLabels: Record<RidingStyle, string> = { xc: "XC", trail: "Trail", enduro: "Enduro", dh: "DH" };
    const displayWeight = weightUnit === "lbs" ? `${weight}lbs` : `${weight}kg`;
    let text = `MTB Setup (${displayWeight}, ${styleLabels[style]})`;
    if (suspensionResult) {
      text += `\nFork: ${suspensionResult.forkBrand} ${suspensionResult.forkModel} — ${suspensionResult.forkPSI} PSI (target sag ${suspensionResult.forkSagTarget})`;
      if (suspensionResult.isCoil) {
        text += `\nShock: ${suspensionResult.shockBrand} ${suspensionResult.shockModel} (coil — see spring rate guide)`;
      } else {
        text += `\nShock: ${suspensionResult.shockBrand} ${suspensionResult.shockModel} — ${suspensionResult.rearPSI} PSI (target sag ${suspensionResult.sagTarget})`;
      }
    }
    if (tyreResult) {
      text += `\nTyres: Front ${tyreResult.front} PSI / Rear ${tyreResult.rear} PSI (${tyreWidth}", ${tubeType})`;
    }
    text += `\n— roadmancycling.com/tools/shock-pressure`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearResults = () => {
    setSuspensionResult(null);
    setTyreResult(null);
  };

  const inputClasses =
    "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-off-white font-heading tracking-wider placeholder:text-foreground-subtle focus:border-coral focus:outline-none transition-colors";
  const errorInputClasses =
    "w-full bg-white/5 border border-red-500/60 rounded-lg px-4 py-3 text-off-white font-heading tracking-wider placeholder:text-foreground-subtle focus:border-red-500 focus:outline-none transition-colors";

  return (
    <>
      <Header />
      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow" className="text-center">
            <p className="text-coral text-sm font-body font-medium uppercase tracking-widest mb-4">
              Free Tool
            </p>
            <h1
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "var(--text-section)" }}
            >
              MTB SETUP CALCULATOR
            </h1>
            <p className="text-foreground-muted text-lg">
              Fork pressure, shock pressure, sag targets, and tyre pressure for your mountain bike.
              Brand-specific data from Fox, RockShox, and more.
            </p>
          </Container>
        </Section>

        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            <div className="bg-background-elevated rounded-xl border border-white/5 p-8 space-y-6">

              {/* ---- Rider Weight ---- */}
              <div>
                <label htmlFor="mtb-rider-weight" className="block font-heading text-lg text-off-white mb-2">
                  RIDER WEIGHT
                </label>
                <p className="text-xs text-foreground-subtle mb-2">
                  Include riding gear (add ~3-5kg / 7-11lbs to body weight).
                </p>
                <div className="flex gap-2">
                  <input
                    id="mtb-rider-weight"
                    type="number" min="40" max={weightUnit === "lbs" ? "440" : "200"} placeholder={weightUnit === "lbs" ? "e.g. 176" : "e.g. 80"}
                    value={weight}
                    onChange={(e) => { setWeight(e.target.value); clearResults(); }}
                    className={`${weightError ? errorInputClasses : inputClasses} text-xl flex-1`}
                  />
                  <div className="flex rounded-lg overflow-hidden border border-white/10">
                    {(["kg", "lbs"] as const).map((u) => (
                      <button
                        key={u} type="button"
                        onClick={() => {
                          if (u !== weightUnit && weight) {
                            const w = parseFloat(weight);
                            if (!isNaN(w)) {
                              setWeight(u === "lbs" ? String(Math.round(w * 2.205)) : String(Math.round(w / 2.205)));
                            }
                          }
                          setWeightUnit(u);
                          clearResults();
                        }}
                        className={`px-4 py-3 font-heading text-sm tracking-wider transition-colors cursor-pointer ${
                          weightUnit === u ? "bg-coral text-off-white" : "bg-white/5 text-foreground-muted hover:bg-white/10"
                        }`}
                      >
                        {u.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                {weightError && <p className="text-red-400 text-xs mt-1" role="alert">{weightError}</p>}
              </div>

              {/* ---- Bike Weight ---- */}
              <div>
                <label htmlFor="mtb-bike-weight" className="block font-heading text-lg text-off-white mb-2">
                  BIKE WEIGHT (KG)
                </label>
                <input
                  id="mtb-bike-weight"
                  type="number" min="8" max="25" step="0.5" placeholder="e.g. 14"
                  value={bikeWeight}
                  onChange={(e) => { setBikeWeight(e.target.value); clearResults(); }}
                  className={bikeWeightError ? errorInputClasses : inputClasses}
                />
                {bikeWeightError && <p className="text-red-400 text-xs mt-1" role="alert">{bikeWeightError}</p>}
              </div>

              {/* ---- Riding Style ---- */}
              <div>
                <label id="riding-style-label" className="block font-heading text-lg text-off-white mb-2">
                  RIDING STYLE
                </label>
                <div className="grid grid-cols-2 gap-2" role="group" aria-labelledby="riding-style-label">
                  {(
                    [
                      ["xc", "Cross-Country"],
                      ["trail", "Trail"],
                      ["enduro", "Enduro"],
                      ["dh", "Downhill"],
                    ] as const
                  ).map(([val, label]) => (
                    <button
                      key={val} type="button"
                      onClick={() => { setStyle(val); clearResults(); }}
                      aria-pressed={style === val}
                      className={`py-3 rounded-lg font-heading text-sm tracking-wider transition-colors cursor-pointer ${
                        style === val ? "bg-coral text-off-white" : "bg-white/5 text-foreground-muted hover:bg-white/10"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ---- Fork Brand ---- */}
              <div>
                <label htmlFor="mtb-fork-brand" className="block font-heading text-lg text-off-white mb-2">
                  FORK BRAND
                </label>
                <p className="text-xs text-foreground-subtle mb-2">
                  Pressure varies significantly between brands and models.
                </p>
                <select
                  id="mtb-fork-brand"
                  value={forkBrandIdx}
                  onChange={(e) => {
                    setForkBrandIdx(parseInt(e.target.value));
                    setForkModelIdx(0);
                    clearResults();
                  }}
                  className={`${inputClasses} appearance-none`}
                >
                  {FORK_BRANDS.map((brand, i) => (
                    <option key={brand.name} value={i} className="bg-charcoal">{brand.name}</option>
                  ))}
                </select>
              </div>

              {/* ---- Fork Model ---- */}
              <div>
                <label htmlFor="mtb-fork-model" className="block font-heading text-lg text-off-white mb-2">
                  FORK MODEL
                </label>
                <select
                  id="mtb-fork-model"
                  value={forkModelIdx}
                  onChange={(e) => { setForkModelIdx(parseInt(e.target.value)); clearResults(); }}
                  className={`${inputClasses} appearance-none`}
                >
                  {selectedForkBrand.models.map((model, i) => (
                    <option key={model.name} value={i} className="bg-charcoal">
                      {model.name} ({model.travelRange})
                    </option>
                  ))}
                </select>
              </div>

              {/* ---- Shock Brand ---- */}
              <div>
                <label htmlFor="mtb-shock-brand" className="block font-heading text-lg text-off-white mb-2">
                  REAR SHOCK BRAND
                </label>
                <select
                  id="mtb-shock-brand"
                  value={shockBrandIdx}
                  onChange={(e) => {
                    setShockBrandIdx(parseInt(e.target.value));
                    setShockModelIdx(0);
                    clearResults();
                  }}
                  className={`${inputClasses} appearance-none`}
                >
                  {SHOCK_BRANDS.map((brand, i) => (
                    <option key={brand.name} value={i} className="bg-charcoal">{brand.name}</option>
                  ))}
                </select>
              </div>

              {/* ---- Shock Model ---- */}
              <div>
                <label htmlFor="mtb-shock-model" className="block font-heading text-lg text-off-white mb-2">
                  REAR SHOCK MODEL
                </label>
                <select
                  id="mtb-shock-model"
                  value={shockModelIdx}
                  onChange={(e) => { setShockModelIdx(parseInt(e.target.value)); clearResults(); }}
                  className={`${inputClasses} appearance-none`}
                >
                  {selectedShockBrand.models.map((model, i) => (
                    <option key={model.name} value={i} className="bg-charcoal">
                      {model.name}{model.type === "coil" ? " (Coil)" : ""}
                    </option>
                  ))}
                </select>
                {selectedShockBrand.models[shockModelIdx]?.type === "coil" && (
                  <p className="text-amber-400 text-xs mt-2">
                    This is a coil shock — no air pressure setting. We&apos;ll show spring rate guidance instead.
                  </p>
                )}
              </div>

              {/* ---- Volume Spacers ---- */}
              <div>
                <label htmlFor="mtb-spacers" className="block font-heading text-lg text-off-white mb-2">
                  VOLUME SPACERS / TOKENS
                </label>
                <p className="text-xs text-foreground-subtle mb-2">
                  Number installed in fork and/or shock. More spacers = more end-stroke progression.
                </p>
                <select
                  id="mtb-spacers"
                  value={volumeSpacers}
                  onChange={(e) => { setVolumeSpacers(e.target.value); clearResults(); }}
                  className={`${inputClasses} appearance-none`}
                >
                  {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n} className="bg-charcoal">
                      {n} spacer{n !== 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* ---- Tyre Width ---- */}
              <div>
                <label htmlFor="mtb-tyre-width" className="block font-heading text-lg text-off-white mb-2">
                  TYRE WIDTH (INCHES)
                </label>
                <select
                  id="mtb-tyre-width"
                  value={tyreWidth}
                  onChange={(e) => { setTyreWidth(e.target.value); clearResults(); }}
                  className={`${inputClasses} appearance-none`}
                >
                  {["2.0", "2.1", "2.2", "2.25", "2.3", "2.35", "2.4", "2.5", "2.6", "2.8", "3.0"].map((w) => (
                    <option key={w} value={w} className="bg-charcoal">
                      {w}&quot;
                    </option>
                  ))}
                </select>
              </div>

              {/* ---- Rim Internal Width ---- */}
              <div>
                <label htmlFor="mtb-rim-width" className="block font-heading text-lg text-off-white mb-2">
                  RIM INTERNAL WIDTH (MM)
                </label>
                <select
                  id="mtb-rim-width"
                  value={rimWidth}
                  onChange={(e) => { setRimWidth(e.target.value); clearResults(); }}
                  className={`${inputClasses} appearance-none`}
                >
                  {[25, 27, 28, 29, 30, 31, 32, 33, 35, 37, 40].map((w) => (
                    <option key={w} value={w} className="bg-charcoal">{w}mm</option>
                  ))}
                </select>
                <p className="text-foreground-subtle text-xs mt-1">
                  Most modern MTB wheels are 28-32mm internal. Check your wheel manufacturer specs.
                </p>
              </div>

              {/* ---- Tyre Setup ---- */}
              <div>
                <label id="mtb-tyre-setup-label" className="block font-heading text-lg text-off-white mb-2">
                  TYRE SETUP
                </label>
                <div className="flex gap-3" role="group" aria-labelledby="mtb-tyre-setup-label">
                  {(
                    [
                      ["tubeless", "Tubeless"],
                      ["tubed", "Tubed"],
                    ] as const
                  ).map(([val, label]) => (
                    <button
                      key={val} type="button"
                      onClick={() => { setTubeType(val); clearResults(); }}
                      aria-pressed={tubeType === val}
                      className={`flex-1 py-3 rounded-lg font-heading text-sm tracking-wider transition-colors cursor-pointer ${
                        tubeType === val ? "bg-coral text-off-white" : "bg-white/5 text-foreground-muted hover:bg-white/10"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ---- Terrain ---- */}
              <div>
                <label id="mtb-terrain-label" className="block font-heading text-lg text-off-white mb-2">
                  TERRAIN
                </label>
                <div className="grid grid-cols-3 gap-2" role="group" aria-labelledby="mtb-terrain-label">
                  {(
                    [
                      ["hardpack", "Hardpack"],
                      ["loam", "Loam"],
                      ["loose_rocky", "Loose / Rocky"],
                      ["mud", "Mud"],
                      ["mixed", "Mixed"],
                    ] as const
                  ).map(([val, label]) => (
                    <button
                      key={val} type="button"
                      onClick={() => { setTerrain(val); clearResults(); }}
                      aria-pressed={terrain === val}
                      className={`py-3 rounded-lg font-heading text-xs tracking-wider transition-colors cursor-pointer ${
                        terrain === val ? "bg-coral text-off-white" : "bg-white/5 text-foreground-muted hover:bg-white/10"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ---- Tyre Casing ---- */}
              <div>
                <label id="mtb-casing-label" className="block font-heading text-lg text-off-white mb-2">
                  TYRE CASING
                </label>
                <div className="grid grid-cols-3 gap-2" role="group" aria-labelledby="mtb-casing-label">
                  {(
                    [
                      ["lightweight", "Lightweight / XC"],
                      ["trail_casing", "Trail"],
                      ["enduro_dh", "Enduro / DH"],
                    ] as const
                  ).map(([val, label]) => (
                    <button
                      key={val} type="button"
                      onClick={() => { setTyreCasing(val); clearResults(); }}
                      aria-pressed={tyreCasing === val}
                      className={`py-3 rounded-lg font-heading text-xs tracking-wider transition-colors cursor-pointer ${
                        tyreCasing === val ? "bg-coral text-off-white" : "bg-white/5 text-foreground-muted hover:bg-white/10"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="text-foreground-subtle text-xs mt-1">
                  Heavier casings (e.g. Maxxis EXO+, Schwalbe Super Gravity) allow lower pressures.
                </p>
              </div>

              <Button onClick={handleCalculateAll} size="lg" className="w-full">
                Calculate Setup
              </Button>
            </div>

            {/* ---- Results ---- */}
            <div aria-live="polite" aria-atomic="false">
            <AnimatePresence mode="wait">
              {(suspensionResult || tyreResult) && (
                <motion.div
                  className="mt-8 space-y-8"
                  key={`${suspensionResult?.forkPSI}-${suspensionResult?.rearPSI}-${tyreResult?.front}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  {/* Copy button */}
                  <div className="flex justify-end">
                    <button
                      onClick={handleCopyResults}
                      aria-label={copied ? "Results copied to clipboard" : "Copy setup results to clipboard"}
                      className="text-sm text-coral hover:text-coral/80 font-heading tracking-wider transition-colors cursor-pointer"
                    >
                      {copied ? "Copied!" : "Copy Results"}
                    </button>
                  </div>

                  {/* ---- Fork Pressure ---- */}
                  {suspensionResult && (
                    <div className="space-y-4">
                      <h2 className="font-heading text-2xl text-off-white">FORK SETUP</h2>
                      <p className="text-foreground-muted text-sm">
                        {suspensionResult.forkBrand} {suspensionResult.forkModel} ({suspensionResult.forkTravel})
                      </p>

                      <div className="grid grid-cols-2 gap-4">
                        <motion.div
                          className="bg-background-elevated rounded-xl border border-white/5 p-5 text-center"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.35, delay: 0.1 }}
                        >
                          <p className="text-xs text-foreground-subtle mb-1">FORK PRESSURE</p>
                          <p className="font-heading text-4xl text-coral">{suspensionResult.forkPSI}</p>
                          <p className="text-foreground-muted text-sm">PSI</p>
                        </motion.div>
                        <motion.div
                          className="bg-background-elevated rounded-xl border border-white/5 p-5 text-center"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.35, delay: 0.18 }}
                        >
                          <p className="text-xs text-foreground-subtle mb-1">FORK SAG TARGET</p>
                          <p className="font-heading text-4xl text-coral">{suspensionResult.forkSagTarget}</p>
                        </motion.div>
                      </div>

                      <motion.div
                        className="bg-deep-purple/30 rounded-xl border border-purple/20 p-5"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: 0.25 }}
                      >
                        <p className="text-foreground-muted text-sm leading-relaxed">
                          {suspensionResult.forkSetupNotes}
                        </p>
                        <p className="text-foreground-subtle text-xs mt-2">
                          Max pressure: {suspensionResult.forkMaxPSI} PSI. Never exceed this.
                        </p>
                      </motion.div>
                    </div>
                  )}

                  {/* ---- Rear Shock ---- */}
                  {suspensionResult && (
                    <div className="space-y-4">
                      <h2 className="font-heading text-2xl text-off-white">REAR SHOCK SETUP</h2>
                      <p className="text-foreground-muted text-sm">
                        {suspensionResult.shockBrand} {suspensionResult.shockModel}
                      </p>

                      {suspensionResult.isCoil ? (
                        <motion.div
                          className="bg-background-elevated rounded-xl border border-amber-500/20 p-6 text-center"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.35, delay: 0.3 }}
                        >
                          <p className="text-xs text-foreground-subtle mb-2">COIL SHOCK</p>
                          <p className="font-heading text-xl text-amber-400 mb-2">No air pressure needed</p>
                          <p className="text-foreground-muted text-sm leading-relaxed">
                            {suspensionResult.shockSetupNotes}
                          </p>
                        </motion.div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          <motion.div
                            className="bg-background-elevated rounded-xl border border-white/5 p-5 text-center"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.35, delay: 0.3 }}
                          >
                            <p className="text-xs text-foreground-subtle mb-1">SHOCK PRESSURE</p>
                            <p className="font-heading text-4xl text-coral">{suspensionResult.rearPSI}</p>
                            <p className="text-foreground-muted text-sm">PSI</p>
                          </motion.div>
                          <motion.div
                            className="bg-background-elevated rounded-xl border border-white/5 p-5 text-center"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.35, delay: 0.38 }}
                          >
                            <p className="text-xs text-foreground-subtle mb-1">REAR SAG TARGET</p>
                            <p className="font-heading text-4xl text-coral">{suspensionResult.sagTarget}</p>
                          </motion.div>
                        </div>
                      )}

                      <motion.div
                        className="bg-deep-purple/30 rounded-xl border border-purple/20 p-5"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: 0.45 }}
                      >
                        <p className="text-foreground-muted text-sm leading-relaxed mb-3">
                          {suspensionResult.shockSetupNotes}
                        </p>
                        <p className="text-foreground-muted text-sm leading-relaxed">
                          {suspensionResult.sagDescription}
                        </p>
                        {suspensionResult.volumeSpacerNote && (
                          <p className="text-foreground-muted text-sm leading-relaxed mt-2 border-t border-white/5 pt-2">
                            {suspensionResult.volumeSpacerNote}
                          </p>
                        )}
                        {!suspensionResult.isCoil && (
                          <>
                            <div className="border-t border-white/5 pt-3 mt-3">
                              <h4 className="font-heading text-sm text-off-white mb-2">HOW TO SET SAG</h4>
                              <ol className="text-foreground-muted text-sm leading-relaxed space-y-1 list-decimal list-inside">
                                <li>Set your shock to the recommended pressure above.</li>
                                <li>Push the sag indicator o-ring down against the shock body.</li>
                                <li>Sit on the bike in riding position — have a mate hold you steady.</li>
                                <li>Carefully dismount without bouncing.</li>
                                <li>Measure the gap between the o-ring and the seal — this is your sag.</li>
                                <li>Compare to your target sag ({suspensionResult.sagTarget} of total stroke).</li>
                                <li>Add or remove 5 PSI at a time until sag is dialled.</li>
                              </ol>
                            </div>
                            <p className="text-foreground-subtle text-xs mt-3">
                              Max pressure: {suspensionResult.shockMaxPSI} PSI. Never exceed this.
                            </p>
                          </>
                        )}
                      </motion.div>
                    </div>
                  )}

                  {/* ---- MTB Tyre Pressure ---- */}
                  {tyreResult && (
                    <div className="space-y-4">
                      <h2 className="font-heading text-2xl text-off-white">TYRE PRESSURE</h2>
                      <div className="grid grid-cols-2 gap-4">
                        <motion.div
                          className="bg-background-elevated rounded-xl border border-white/5 p-6 text-center"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.35, delay: 0.52 }}
                        >
                          <p className="text-xs text-foreground-subtle mb-1">FRONT</p>
                          <p className="font-heading text-4xl text-coral">{tyreResult.front}</p>
                          <p className="text-foreground-muted text-sm">PSI</p>
                        </motion.div>
                        <motion.div
                          className="bg-background-elevated rounded-xl border border-white/5 p-6 text-center"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.35, delay: 0.58 }}
                        >
                          <p className="text-xs text-foreground-subtle mb-1">REAR</p>
                          <p className="font-heading text-4xl text-coral">{tyreResult.rear}</p>
                          <p className="text-foreground-muted text-sm">PSI</p>
                        </motion.div>
                      </div>
                      <motion.div
                        className="bg-deep-purple/30 rounded-xl border border-purple/20 p-5"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: 0.64 }}
                      >
                        <h3 className="font-heading text-lg text-off-white mb-3">TYRE NOTES</h3>
                        <p className="text-foreground-muted text-sm leading-relaxed mb-3">
                          MTB tyre pressure is highly terrain-dependent. These recommendations
                          optimise the balance between grip, rolling resistance, and flat protection
                          for your riding style. The front runs lower than the rear for
                          better cornering grip (front wheel carries ~40% of weight).
                        </p>
                        <p className="text-foreground-muted text-sm leading-relaxed">
                          {tubeType === "tubeless"
                            ? "Tubeless setup allows lower pressures without pinch flat risk. If you're getting tyre burps on hard hits, add 1-2 PSI or consider a tyre insert (CushCore, Tannus, Vittoria Air-Liner)."
                            : "Running tubes means higher minimum pressure to avoid pinch flats. Going tubeless lets you run lower pressures with better grip."}
                        </p>
                        {tyreCasing === "enduro_dh" && (
                          <p className="text-foreground-muted text-sm leading-relaxed mt-2">
                            Heavy-casing tyres (EXO+, Super Gravity, MaxxGrip DD) provide extra sidewall support, allowing the lower pressures shown above.
                          </p>
                        )}
                        {tyreCasing === "lightweight" && (
                          <p className="text-foreground-muted text-sm leading-relaxed mt-2">
                            Lightweight casings (EXO, SpeedGrip) have less sidewall support — the slightly higher pressures above help prevent rim strikes and tyre squirm.
                          </p>
                        )}
                      </motion.div>
                    </div>
                  )}

                  {/* Learn More */}
                  <motion.div
                    className="rounded-xl border border-white/10 p-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.7 }}
                  >
                    <h3 className="font-heading text-lg text-off-white mb-3">LEARN MORE</h3>
                    <ul className="space-y-2">
                      <li>
                        <a href="/blog/mtb-suspension-setup-complete-guide" className="text-coral hover:text-coral/80 text-sm transition-colors">
                          MTB Suspension Setup: The Complete Guide
                        </a>
                      </li>
                      <li>
                        <a href="/blog/mtb-tyre-pressure-guide" className="text-coral hover:text-coral/80 text-sm transition-colors">
                          MTB Tyre Pressure Guide
                        </a>
                      </li>
                      <li>
                        <a href="/blog/mtb-fork-setup-guide" className="text-coral hover:text-coral/80 text-sm transition-colors">
                          MTB Fork Setup Guide
                        </a>
                      </li>
                    </ul>
                  </motion.div>

                  <motion.div
                    className="mt-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.76 }}
                  >
                    {suspensionResult && (
                      <ReportRequestForm
                        tool="shock-pressure"
                        inputs={{
                          weight: weightUnit === "kg" ? parseFloat(weight) : parseFloat(weight) / 2.205,
                          bikeWeight: parseFloat(bikeWeight),
                          ridingStyle: style,
                          terrain,
                          tyreCasing,
                          forkBrand: suspensionResult.forkBrand,
                          forkModel: suspensionResult.forkModel,
                          shockBrand: suspensionResult.shockBrand,
                          shockModel: suspensionResult.shockModel,
                          forkPsi: suspensionResult.forkPSI,
                          shockPsi: suspensionResult.rearPSI,
                        }}
                        heading={`Your MTB setup: ${suspensionResult.forkPSI} psi fork, ${suspensionResult.rearPSI} psi shock`}
                        subheading="The full setup sheet with sag targets, how to tune rebound + compression, and the seasonal adjustments most riders miss. Save it, reference it after every setup change."
                        bullets={[
                          `${suspensionResult.forkBrand} ${suspensionResult.forkModel}: ${suspensionResult.forkPSI} psi baseline`,
                          `${suspensionResult.shockBrand} ${suspensionResult.shockModel}: ${suspensionResult.rearPSI} psi baseline`,
                          "Sag setup protocol (front + rear)",
                          "Rebound + compression tuning by feel",
                          "Winter / wet / bike park adjustments",
                        ]}
                      />
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            </div>
          </Container>
        </Section>

        {/* Coaching CTA */}
        <Section background="charcoal" className="!pt-0 !pb-12">
          <Container width="narrow">
            <motion.div
              className="mt-8 rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/10 via-deep-purple/40 to-charcoal p-6 md:p-8 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.7 }}
            >
              <p className="font-heading text-coral text-xs tracking-widest mb-2">
                MTB SETUP DIALLED?
              </p>
              <p className="text-off-white font-heading text-lg md:text-xl mb-2">
                Coaching builds your off-road training around your actual trails and events.
              </p>
              <p className="text-foreground-muted text-sm mb-5 max-w-md mx-auto">
                Personalised TrainingPeaks plan, weekly calls, five pillars.
                7-day free trial. $195/month.
              </p>
              <a
                href="/apply"
                className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md bg-coral text-off-white hover:bg-coral/90 px-6 py-3 text-sm transition-all"
                data-track="tool_shock_apply"
              >
                Apply for Coaching →
              </a>
            </motion.div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
