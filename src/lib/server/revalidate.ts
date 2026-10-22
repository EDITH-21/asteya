import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";
import { ADMIN_BASE_PATH } from "@/lib/constants";

/**
 * Revalidates public site pages and cache tags after any admin content mutation.
 * Safe against revalidation errors in non-standard runtimes.
 */
export function revalidatePublicSite(tag?: string) {
  try {
    if (tag) {
      revalidateTag(tag, "default");
    }
    revalidateTag("site-content", "default");
  } catch (err) {
    console.warn("[Revalidate] Tag revalidation notice:", err);
  }

  try {
    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/faq");
    revalidatePath("/privacy");
    revalidatePath("/terms");
    revalidatePath("/services/[slug]", "page");
    revalidatePath(ADMIN_BASE_PATH);
  } catch (err) {
    console.warn("[Revalidate] Path revalidation notice:", err);
  }
}
