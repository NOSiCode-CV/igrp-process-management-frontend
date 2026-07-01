// Compatibility shim.
//
// iGRP Studio regenerates the task-detail page importing `useTaskDetails` from
// `@/app/(myapp)/taskmanagement/hooks/use-task-details` (no hyphen), while the
// real hook lives under `task-management/` (with hyphen). Re-export it here so
// the generated page resolves regardless of the Studio import path.
//
// Proper fix: correct the onLoad import in Studio to `.../task-management/...`,
// then this shim can be removed.
export { useTaskDetails } from "../../task-management/hooks/use-task-details";
