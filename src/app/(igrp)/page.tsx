// Permission: open to all authenticated users — demo page with no sensitive data.
import { redirect } from "next/navigation";

import { igrpGetClaims } from "@igrp/framework-next";
import { IgrpConfigError } from "@igrp/framework-next/errors";
import { getAuthProviderIdFromEnv } from "@igrp/framework-next-auth";
import { getTranslations } from "next-intl/server";

import { type HomeLayer, HomeOverview } from "@/components/home-overview";
import { getPackageJson } from "@/lib/config/get-pkj";
import { verifySession } from "@/lib/dal";
import { isAuthBypass } from "@/lib/utilities";

export default async function Home() {
  const root = process.env.NEXT_PUBLIC_IGRP_APP_HOME_SLUG || "/";

  // Fail fast with a typed, translatable error rather than a raw `Error`
  // string. Caught by `(igrp)/error.tsx` → `IGRPSegmentError` → copy lookup
  // by `code` in the framework's chrome catalog.
  if (!root.startsWith("/")) {
    throw new IgrpConfigError(
      "IGRP_APP_HOME_SLUG_INVALID",
      `NEXT_PUBLIC_IGRP_APP_HOME_SLUG must start with "/" — received "${root}".`,
      { receivedValue: root },
    );
  }

  if (root !== "/") {
    // Normally unreachable: `next.config.ts` redirects `/` to the home slug
    // before this layout renders. Kept as a fallback.
    redirect(root as Parameters<typeof redirect>[0]);
  }

  // Both are React-cached and already resolved by `(igrp)/layout.tsx` for this
  // request, so this costs no extra session read or token decode.
  const [session, claimsState] = await Promise.all([
    verifySession(),
    igrpGetClaims(),
  ]);
  const t = await getTranslations("home.layers");

  const app = getPackageJson();
  const bypass = isAuthBypass();

  return (
    <HomeOverview
      appName={app.displayName || app.name || "IGRP"}
      appCode={process.env.IGRP_APP_CODE || ""}
      version={app.version ?? ""}
      previewMode={bypass}
      layers={buildLayers({
        bypass,
        userName: session.user?.name || session.user?.email || "",
        claimsState,
        t,
      })}
    />
  );
}

/**
 * The request's path through the framework, in the order it happened. Only
 * plain strings cross to the client — no token, no claim list, no internal
 * URL: this page is visible to every authenticated user. The strings are
 * translated here (`home.layers`), so the client gets final text.
 */
function buildLayers({
  bypass,
  userName,
  claimsState,
  t,
}: {
  bypass: boolean;
  userName: string;
  claimsState: Awaited<ReturnType<typeof igrpGetClaims>>;
  t: Awaited<ReturnType<typeof getTranslations<"home.layers">>>;
}): HomeLayer[] {
  const amConfigured = Boolean(process.env.IGRP_ACCESS_MANAGEMENT_API);

  return [
    {
      id: "middleware",
      icon: "ShieldCheck",
      name: t("middleware.name"),
      value: bypass ? t("middleware.valueBypass") : t("middleware.valueAuth"),
      detail: bypass
        ? t("middleware.detailBypass")
        : t("middleware.detailAuth"),
      file: "src/middleware.ts",
      state: bypass ? "preview" : "ok",
    },
    {
      id: "session",
      icon: "UserRound",
      name: t("session.name"),
      value: userName || t("session.valueEmpty"),
      detail: bypass
        ? t("session.detailBypass")
        : t("session.detailAuth", {
            provider: getAuthProviderIdFromEnv(process.env),
          }),
      file: "src/lib/dal.ts",
      state: bypass ? "preview" : "ok",
    },
    bypass
      ? {
          id: "access-management",
          icon: "Network",
          name: t("accessManagement.name"),
          value: t("accessManagement.valueBypass"),
          detail: t("accessManagement.detailBypass"),
          file: "src/igrp.template.config.ts",
          state: "preview",
        }
      : amConfigured
        ? {
            id: "access-management",
            icon: "Network",
            name: t("accessManagement.name"),
            value: t("accessManagement.valueOk"),
            detail: t("accessManagement.detailOk"),
            file: "src/igrp.template.config.ts",
            state: "ok",
          }
        : {
            id: "access-management",
            icon: "Network",
            name: t("accessManagement.name"),
            value: t("accessManagement.valueMissing"),
            detail: t("accessManagement.detailMissing"),
            file: ".env",
            state: "error",
          },
    claimsState.status === "ok"
      ? {
          id: "permissions",
          icon: "KeyRound",
          name: t("permissions.name"),
          value: claimsState.claims.isSuperAdmin
            ? t("permissions.valueAll")
            : t("permissions.valueCount", {
                count: claimsState.claims.permissions.length,
              }),
          detail: bypass
            ? t("permissions.detailBypass")
            : claimsState.claims.org
              ? t("permissions.detailOrg", { org: claimsState.claims.org })
              : t("permissions.detailNoOrg"),
          file: ".igrpstudio/permissions.json",
          state: bypass ? "preview" : "ok",
        }
      : {
          id: "permissions",
          icon: "KeyRound",
          name: t("permissions.name"),
          value: t("permissions.valueError"),
          detail: t("permissions.detailError"),
          file: "src/app/(igrp)/layout.tsx",
          state: "error",
        },
    {
      id: "page",
      icon: "PanelsTopLeft",
      name: t("page.name"),
      value: t("page.value"),
      detail: t("page.detail"),
      file: "src/app/(igrp)/page.tsx",
      state: "ok",
    },
  ];
}
