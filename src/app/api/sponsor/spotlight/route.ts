import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { BASE_RATES } from "@/lib/inventory";
import type { InventoryType } from "@/lib/inventory";

/**
 * POST /api/sponsor/spotlight
 *
 * Creates a Stripe Checkout Session for a Spotlight purchase.
 * Full payment upfront for the selected slot type.
 */

const SPOTLIGHT_TYPES: Record<string, { label: string; inventoryType: InventoryType }> = {
  podcast_endroll: { label: "Spotlight End-Roll", inventoryType: "podcast_endroll" },
  podcast_midroll: { label: "Spotlight Mid-Roll", inventoryType: "podcast_midroll" },
  newsletter_classified: { label: "Spotlight Newsletter Classified", inventoryType: "newsletter_classified" },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slotType, brandName, productService, keyMessage, showNotesUrl, wordsToAvoid } = body;

    // Validate slot type
    const slotConfig = SPOTLIGHT_TYPES[slotType];
    if (!slotConfig) {
      return NextResponse.json(
        { error: "Invalid slot type" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!brandName?.trim() || !productService?.trim() || !keyMessage?.trim()) {
      return NextResponse.json(
        { error: "Missing required fields: brandName, productService, keyMessage" },
        { status: 400 }
      );
    }

    const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
    if (!STRIPE_SECRET_KEY) {
      console.error("STRIPE_SECRET_KEY not configured");
      return NextResponse.json(
        { error: "Payment service not configured" },
        { status: 500 }
      );
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY);

    // Price in pence (GBP)
    const unitAmount = BASE_RATES[slotConfig.inventoryType] * 100;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      currency: "gbp",
      line_items: [
        {
          price_data: {
            currency: "gbp",
            unit_amount: unitAmount,
            product_data: {
              name: slotConfig.label,
              description: `Roadman Cycling ${slotConfig.label} — single placement, scripted by Anthony.`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "spotlight",
        slotType,
        brandName,
        productService,
        keyMessage,
        showNotesUrl: showNotesUrl || "",
        wordsToAvoid: wordsToAvoid || "",
      },
      success_url: `${getBaseUrl(request)}/sponsor?checkout=success`,
      cancel_url: `${getBaseUrl(request)}/sponsor?checkout=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Spotlight checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

function getBaseUrl(request: NextRequest): string {
  const host = request.headers.get("host") ?? "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}
