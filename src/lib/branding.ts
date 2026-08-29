import logoAsset from "@/assets/nos-logo.png.asset.json";
import markAsset from "@/assets/nos-mark.png.asset.json";

/**
 * Canonical NOS brand assets — single source of truth.
 *
 * NOS_LOGO: full approved lockup (wordmark + NURSING · OPERATIONS · INTELLIGENCE)
 * NOS_MARK: square icon crop of the same approved artwork, for compact slots
 *
 * Never recreate the wordmark in HTML text; always render these assets.
 */
export const NOS_LOGO = logoAsset.url;
export const NOS_MARK = markAsset.url;
export const NOS_LOGO_ALT = "NOS — Nursing Operations Intelligence";
