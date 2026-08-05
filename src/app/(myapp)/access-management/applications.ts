"use server";

import type { ApplicationDTO } from "@igrp/platform-access-management-client-ts";
import { getClientAccess } from "./access-client";

export async function getApplications(): Promise<ApplicationDTO[]> {
  const client = await getClientAccess();

  try {
    const result = await client.users.getCurrentUserApplications();
    return result.data as ApplicationDTO[];
  } catch (error) {
    console.error("[apps] Não foi possível obter os dados:", error);
    throw error;
  }
}

export async function getApplication(appCode: string): Promise<ApplicationDTO> {
  const client = await getClientAccess();

  try {
    const result = await client.applications.getApplicationByCode(appCode);
    const application = result.data as ApplicationDTO;

    // Temporary cluster diagnostics: slug/url feed the process app route, so a
    // missing or unexpected value explains a failed task redirect.
    console.log("[apps:discover] getApplication", {
      appCode,
      code: application?.code,
      slug: application?.slug,
      url: application?.url,
    });

    return application;
  } catch (error: unknown) {
    console.error("[apps:discover] getApplication failed", { appCode, error });
    console.error("[apps] Não foi possível obter os dados:", error);
    throw error;
  }
}
