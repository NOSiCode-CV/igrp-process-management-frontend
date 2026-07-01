/**
 * Configuration registry for custom elements categorized by UI context.
 *
 * This file serves as the central declaration point for registering:
 * - **Types**: TypeScript interfaces/type aliases for structured data models
 * - **Actions**: Actions logic for operations
 * - **Functions**: Custom functions logic for application
 * - **Components**: Custom React components for application
 *
 * ### Registration Rules
 * 1. All entries must be arrays of importable paths (no extensions)
 * 2. Paths are relative to `src/app/[locale]/(myapp)`
 * 3. Categories are optional but must contain at least one valid entry
 *
 * ✅ **Examples**:
 * ```ts
 * {
 *   types: ['types/User'],
 *   actions: ['server/actions/saveUser'],
 *   functions: ['client/forms/useUserForm'],
 *   components: ['components/userInfoCard']
 * }
 * ```
 *
 * ❌ **Invalid**:
 * - `'./types/User.ts'` → do not use relative paths or file extensions.
 * - `'src/app/[locale]/(myapp)/types/User'` → the `src/app/[locale]/(myapp)` prefix is implied.
 *
 * ### Location Requirement
 * All registered files must exist **under `src/app/[locale]/(myapp)`**. Files outside of this folder
 * will not be parsed or loaded.
 *
 * ### Path Resolution
 * - Paths resolve to `@/app/[locale]/(myapp)/[your-path]`
 * - Files must exist under `src/app/[locale]/(myapp)`
 * - Missing files will trigger build warnings
 *
 * ### Purpose
 * This registry allows code automation and analysis tools to locate, extract, and expose metadata
 * such as type definitions, function signatures, and input/output schemas in a structured format (e.g., JSON).
 *
 */

export default {
  types: ["process-map/types/index"],
  actions: [],
  functions: [
    "process-map/hooks/use-process-map",
    "available-tasks/hooks/use-available-tasks",
    "process-instances/hooks/use-process-instances",
    "my-tasks/hooks/use-my-tasks",
    "dashboard/hooks/use-dashboard",
    "dashboard/hooks/use-dashboard-data",
    "utils/url-config",
    "utils/status-badge",
    "process-instances/hooks/use-process-details",
    "task-management/hooks/use-task-details",
    "components/processtaksfilter/hooks/use-process-tasks-filter",
    "config/hooks/use-config-page",
  ],
  components: [
    "process-map/components/process-tree-node",
    "components/recent-items-card",
    "components/loading-page",
    "components/stat-card",
    "components/activity-timeline",
    "components/filter-data",
    "components/task-history",
    "components/variables-view",
    "task-management/components/task-information",
    "components/task-instance-events-view",
    "components/filter-actives",
    "components/empty",
    "config/components/process-item",
    "config/components/process-list",
    "config/components/add-item",
    "config/components/add-checklist-item",
    "config/components/selected-items",
    "config/components/actions-item",
    "config/components/priority-form",
    "process-map/components/area/area-tree-node",
    "process-map/components/area/area-details",
  ],
};
