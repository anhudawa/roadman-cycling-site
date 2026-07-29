"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/admin/ui";
import type { RecommendationProduct } from "@/lib/recommends/types";
import { EVIDENCE_LABELS, EVIDENCE_STATUSES, RECOMMENDATION_STATUSES } from "@/lib/recommends/types";
import type { RecommendsActionState } from "../actions";

type ProductAction = (
  state: RecommendsActionState,
  formData: FormData,
) => Promise<RecommendsActionState>;

interface EditableOffer {
  id?: number;
  retailerName: string;
  affiliateProgram: string;
  destinationUrl: string;
  regions: string[];
  currency: string;
  priceLabel: string;
  promoCode: string;
  priority: number;
  active: boolean;
}

const field =
  "focus-ring w-full rounded-md border border-white/15 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[var(--color-border-focus)]";
const label = "mb-1.5 block text-xs font-semibold text-foreground-muted";

function blankOffer(): EditableOffer {
  return {
    retailerName: "",
    affiliateProgram: "",
    destinationUrl: "",
    regions: ["IE", "GB", "EU", "US"],
    currency: "",
    priceLabel: "",
    promoCode: "",
    priority: 0,
    active: true,
  };
}

export function ProductForm({
  action,
  product,
  categories,
}: {
  action: ProductAction;
  product?: RecommendationProduct;
  categories: Array<{ id: number; name: string }>;
}) {
  // Destination URLs never enter the public product query shape. The protected
  // edit page attaches them specifically for this form.
  const productWithDestinations = product as
    | (RecommendationProduct & { editableOffers?: EditableOffer[] })
    | undefined;
  const [state, formAction, pending] = useActionState(action, {});
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? "");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [offers, setOffers] = useState<EditableOffer[]>(
    productWithDestinations?.editableOffers ??
      product?.offers.map((offer) => ({
        id: offer.id,
        retailerName: offer.retailerName,
        affiliateProgram: offer.affiliateProgram ?? "",
        destinationUrl: "",
        regions: offer.regions,
        currency: offer.currency ?? "",
        priceLabel: offer.priceLabel ?? "",
        promoCode: offer.promoCode ?? "",
        priority: offer.priority,
        active: offer.active,
      })) ??
      [],
  );

  function updateOffer(index: number, patch: Partial<EditableOffer>) {
    setOffers((current) =>
      current.map((offer, offerIndex) =>
        offerIndex === index ? { ...offer, ...patch } : offer,
      ),
    );
  }

  async function uploadImage(file: File | undefined) {
    if (!file) return;
    setUploadingImage(true);
    setUploadError("");
    try {
      const upload = new FormData();
      upload.set("image", file);
      upload.set("productSlug", product?.slug || "recommendation");
      const response = await fetch("/api/admin/recommends/upload-image", {
        method: "POST",
        body: upload,
      });
      const result = (await response.json()) as {
        imageUrl?: string;
        error?: string;
      };
      if (!response.ok || !result.imageUrl) {
        throw new Error(result.error || "Image upload failed.");
      }
      setImageUrl(result.imageUrl);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setUploadingImage(false);
    }
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="offers" value={JSON.stringify(offers)} />

      {state.error ? (
        <p role="alert" className="rounded-md border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p role="status" className="rounded-md border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {state.success}
        </p>
      ) : null}

      <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
        <h2 className="mb-4 text-lg font-semibold text-white">Editorial identity</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label>
            <span className={label}>Product name</span>
            <input className={field} name="name" required defaultValue={product?.name} />
          </label>
          <label>
            <span className={label}>URL slug</span>
            <input className={field} name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" defaultValue={product?.slug} />
          </label>
          <label>
            <span className={label}>Brand</span>
            <input className={field} name="brandName" defaultValue={product?.brandName ?? ""} placeholder="e.g. Continental" />
          </label>
          <label>
            <span className={label}>Category</span>
            <select className={field} name="categoryId" defaultValue={product?.categoryId ?? ""}>
              <option value="">Uncategorised</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </label>
          <label>
            <span className={label}>Workflow status</span>
            <select className={field} name="status" defaultValue={product?.status ?? "draft"}>
              {RECOMMENDATION_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </label>
          <label>
            <span className={label}>Evidence label</span>
            <select className={field} name="evidenceStatus" defaultValue={product?.evidenceStatus ?? "editorial"}>
              {EVIDENCE_STATUSES.map((status) => <option key={status} value={status}>{EVIDENCE_LABELS[status]}</option>)}
            </select>
          </label>
          <label>
            <span className={label}>Badge</span>
            <input className={field} name="badge" defaultValue={product?.badge ?? ""} placeholder="Roadman pick" />
          </label>
          <label>
            <span className={label}>Scheduled publication</span>
            <input className={field} type="datetime-local" name="scheduledAt" defaultValue={product?.scheduledAt ? product.scheduledAt.toISOString().slice(0, 16) : ""} />
          </label>
        </div>
      </section>

      <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
        <h2 className="mb-4 text-lg font-semibold text-white">The recommendation</h2>
        <div className="space-y-4">
          <label>
            <span className={label}>One-line verdict</span>
            <input className={field} name="verdict" required defaultValue={product?.verdict} />
          </label>
          <label>
            <span className={label}>Short description</span>
            <textarea className={field} name="shortDescription" rows={3} required defaultValue={product?.shortDescription} />
          </label>
          <label>
            <span className={label}>Why Roadman recommends it</span>
            <textarea className={field} name="whyRecommend" rows={7} required defaultValue={product?.whyRecommend} />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className={label}>Who it is for</span>
              <textarea className={field} name="whoFor" rows={4} required defaultValue={product?.whoFor} />
            </label>
            <label>
              <span className={label}>Who should skip it</span>
              <textarea className={field} name="whoSkip" rows={4} defaultValue={product?.whoSkip ?? ""} />
            </label>
            <label>
              <span className={label}>Strengths (one per line)</span>
              <textarea className={field} name="strengths" rows={5} defaultValue={product?.strengths.join("\n")} />
            </label>
            <label>
              <span className={label}>Limitations (one per line)</span>
              <textarea className={field} name="limitations" rows={5} defaultValue={product?.limitations.join("\n")} />
            </label>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
        <h2 className="mb-4 text-lg font-semibold text-white">Discovery and media</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label>
            <span className={label}>Use cases (comma or new line)</span>
            <textarea className={field} name="useCases" rows={4} defaultValue={product?.useCases.join("\n")} />
          </label>
          <label>
            <span className={label}>Tags (comma or new line)</span>
            <textarea className={field} name="tags" rows={4} defaultValue={product?.tags.join("\n")} />
          </label>
          <label>
            <span className={label}>Disciplines</span>
            <input className={field} name="disciplines" defaultValue={product?.disciplines.join(", ")} placeholder="Road, gravel" />
          </label>
          <label>
            <span className={label}>Seasons</span>
            <input className={field} name="seasons" defaultValue={product?.seasons.join(", ")} placeholder="All season, winter" />
          </label>
          <label>
            <span className={label}>Price band</span>
            <input className={field} name="priceBand" defaultValue={product?.priceBand ?? ""} placeholder="€50–€70" />
          </label>
          <label>
            <span className={label}>Sort order</span>
            <input className={field} name="sortOrder" type="number" min="0" defaultValue={product?.sortOrder ?? 0} />
          </label>
          <label className="md:col-span-2">
            <span className={label}>Product image URL</span>
            <input className={field} name="imageUrl" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="/images/recommends/product.webp or https://…" />
          </label>
          <label className="md:col-span-2">
            <span className={label}>Upload product image</span>
            <input
              className={field}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              disabled={uploadingImage}
              onChange={(event) => void uploadImage(event.target.files?.[0])}
            />
            <span className="mt-1 block text-xs text-foreground-subtle">
              {uploadingImage ? "Uploading…" : "JPEG, PNG, WebP or AVIF, up to 5 MB."}
            </span>
            {uploadError ? <span role="alert" className="mt-1 block text-xs text-red-300">{uploadError}</span> : null}
          </label>
          <label className="md:col-span-2">
            <span className={label}>Image alt text</span>
            <input className={field} name="imageAlt" defaultValue={product?.imageAlt ?? ""} />
          </label>
          <label className="md:col-span-2">
            <span className={label}>Related Roadman article or tool</span>
            <input className={field} name="relatedArticleUrl" defaultValue={product?.relatedArticleUrl ?? ""} placeholder="/tools/tyre-pressure" />
          </label>
          <label className="md:col-span-2">
            <span className={label}>Specifications (Label: value, one per line)</span>
            <textarea
              className={field}
              name="specifications"
              rows={6}
              defaultValue={Object.entries(product?.specifications ?? {}).map(([key, value]) => `${key}: ${value}`).join("\n")}
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-5 text-sm text-white">
          <label className="flex items-center gap-2"><input type="checkbox" name="featured" defaultChecked={product?.featured} /> Roadman pick</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="bestValue" defaultChecked={product?.bestValue} /> Best value</label>
        </div>
      </section>

      <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Retailer offers</h2>
            <p className="mt-1 text-xs text-foreground-muted">Use the exact approved affiliate URL. Removing an offer deactivates it without deleting historic click data.</p>
          </div>
          <button
            type="button"
            className="rounded-md border border-white/15 px-3 py-2 text-sm text-white hover:bg-white/5"
            onClick={() => setOffers((current) => [...current, blankOffer()])}
          >
            Add retailer
          </button>
        </div>
        <div className="space-y-4">
          {offers.map((offer, index) => (
            <div key={offer.id ?? `new-${index}`} className="rounded-md border border-white/10 bg-black/15 p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <label>
                  <span className={label}>Retailer</span>
                  <input className={field} required value={offer.retailerName} onChange={(event) => updateOffer(index, { retailerName: event.target.value })} />
                </label>
                <label>
                  <span className={label}>Affiliate programme</span>
                  <input className={field} value={offer.affiliateProgram} onChange={(event) => updateOffer(index, { affiliateProgram: event.target.value })} />
                </label>
                <label className="md:col-span-2">
                  <span className={label}>Approved affiliate destination</span>
                  <input className={field} type="url" required value={offer.destinationUrl} onChange={(event) => updateOffer(index, { destinationUrl: event.target.value })} />
                </label>
                <label>
                  <span className={label}>Regions</span>
                  <input className={field} value={offer.regions.join(", ")} onChange={(event) => updateOffer(index, { regions: event.target.value.split(",").map((item) => item.trim().toUpperCase()).filter(Boolean) })} />
                </label>
                <label>
                  <span className={label}>Price label</span>
                  <input className={field} value={offer.priceLabel} onChange={(event) => updateOffer(index, { priceLabel: event.target.value })} placeholder="€54.99 or Check price" />
                </label>
                <label>
                  <span className={label}>Currency</span>
                  <input className={field} value={offer.currency} onChange={(event) => updateOffer(index, { currency: event.target.value.toUpperCase() })} placeholder="EUR" />
                </label>
                <label>
                  <span className={label}>Promo code</span>
                  <input className={field} value={offer.promoCode} onChange={(event) => updateOffer(index, { promoCode: event.target.value.toUpperCase() })} placeholder="CARBS25" />
                </label>
                <label>
                  <span className={label}>Priority</span>
                  <input className={field} type="number" min="0" value={offer.priority} onChange={(event) => updateOffer(index, { priority: Number(event.target.value) })} />
                </label>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-white">
                  <input type="checkbox" checked={offer.active} onChange={(event) => updateOffer(index, { active: event.target.checked })} />
                  Active
                </label>
                <button type="button" className="text-xs text-red-300 hover:text-red-200" onClick={() => setOffers((current) => current.filter((_, offerIndex) => offerIndex !== index))}>
                  Remove
                </button>
              </div>
            </div>
          ))}
          {offers.length === 0 ? <p className="text-sm text-foreground-muted">No retailer offers yet. The editorial page can remain in draft until an approved link is ready.</p> : null}
        </div>
      </section>

      <div className="sticky bottom-4 z-10 flex items-center justify-end rounded-lg border border-white/10 bg-charcoal/95 p-3 shadow-2xl backdrop-blur">
        <Button
          type="submit"
          disabled={pending}
          size="lg"
        >
          {pending ? "Saving…" : product ? "Save recommendation" : "Create recommendation"}
        </Button>
      </div>
    </form>
  );
}
