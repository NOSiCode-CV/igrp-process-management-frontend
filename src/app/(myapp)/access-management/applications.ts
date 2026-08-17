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
  const applications = await getApplications();
  const application = applications.find((app) => app.code === appCode);

  if (!application) {
    throw new Error(`Aplicação não encontrada: ${appCode}`);
  }

  return application;
}
