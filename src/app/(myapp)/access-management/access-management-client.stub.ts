/**
 * TEMPORARY build stub for `@igrp/platform-access-management-client-ts`.
 *
 * The framework 0.2 migration removed that dependency from package.json, but
 * several files under `access-management/` still import it, which breaks
 * `next build` (module-not-found). This stub keeps the pipeline green: it
 * exposes the same surface those files use and returns empty results, so
 * access-management-backed data (candidate groups / users / applications) is
 * simply inert until the real client is restored.
 *
 * TODO: remove this stub and re-import `@igrp/platform-access-management-client-ts`
 * (re-add the dependency) once the 0.2 migration settles, or rewrite these
 * modules against the framework's access-management API.
 */

export interface RoleDTO {
  code: string;
  name?: string;
  departmentCode: string;
}

export interface IGRPUserDTO {
  id?: string | number;
  name?: string | null;
  username?: string | null;
  email: string;
  status?: string;
}

export interface ApplicationDTO {
  id?: string;
  code: string;
  name: string;
  slug?: string;
  url?: string;
}

interface AccessResult<T> {
  data: T;
  status: number;
}

class AccessManagementM2M {
  async getRolesForBusiness(
    _identifiers: string[],
    _options?: unknown,
  ): Promise<AccessResult<RoleDTO[]>> {
    return { data: [], status: 0 };
  }

  async getUsersForBusiness(
    _identifiers: string[],
    _query?: unknown,
  ): Promise<AccessResult<IGRPUserDTO[]>> {
    return { data: [], status: 0 };
  }
}

class AccessManagementUsers {
  async getCurrentUserApplications(): Promise<AccessResult<ApplicationDTO[]>> {
    return { data: [], status: 0 };
  }
}

export class AccessManagementClient {
  readonly m2m = new AccessManagementM2M();
  readonly users = new AccessManagementUsers();

  static create(
    _config: { baseUrl: string; headers?: Record<string, string> },
    _m2m?: {
      clientId?: string;
      clientSecret?: string;
      serviceId?: string;
    },
  ): AccessManagementClient {
    return new AccessManagementClient();
  }
}
