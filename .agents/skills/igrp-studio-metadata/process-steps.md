# Authoring `processStep` JSON files

> Companion to `SKILL.md`. Load this when you need to create or edit anything under `.igrpstudio/process/`.
>
> The page/component rules in `SKILL.md` still apply (uppercase type names, unique tags, `args[].id` strings, no deprecated components, etc.). This file documents the **delta** for process steps: the engine wiring, the file layout, the runtime contract, and the patterns that have shipped successfully.

---

## 1. Mental model

A "process" in iGRP is a BPMN flow (defined in iGRP Process Studio). Each user-task in the BPMN diagram is rendered as a `processStep`:

```
BPMN diagram (in Process Studio)            ───▶  one process per project
  └─ User Task "Pedido"  formKey: ui:form:pedido@1   ───▶  one .igrpstudio/process/<processKey>/pedido.v1.json
  └─ User Task "Cálculo" formKey: ui:form:calculo@1  ───▶  one .igrpstudio/process/<processKey>/calculo.v1.json
  └─ User Task "Autorização" formKey: ui:form:autorizacao@1 ───▶  ... etc
```

The `formKey` from the API (`ui:form:<step>@<version>`) directly maps to the JSON filename (`<step>.v<version>.json`):

| API `formKey`           | JSON file path                                              |
|--------------------------|-------------------------------------------------------------|
| `ui:form:pedido@1`       | `.igrpstudio/process/<processKey>/pedido.v1.json`           |
| `ui:form:calculo@1`      | `.igrpstudio/process/<processKey>/calculo.v1.json`          |
| `ui:form:autorizacao@2`  | `.igrpstudio/process/<processKey>/autorizacao.v2.json`      |
| `calculo` (no `ui:form:` prefix) | Treat as `calculo.v1` — the engine still resolves it; raise with backend if you suspect the `formKey` is mistyped in the BPMN. |

The engine (`IGRPProcessProvider` + `IGRPProcessPage` from `@igrp/platform-process-management-client-ui`) resolves the step at runtime from the URL segments:

```
src/app/(igrp)/(generated)/process/[...process]/page.tsx
URL: /process/<processKey>/<processInstanceId>/<userTaskKey>/<userTaskInstanceId>
                                                ^^^^^^^^^^^ form.page → e.g. "pedido.v1"
                ↓ dynamic import
src/app/(igrp)/(generated)/process/[...process]/(<processKey>)/<step>.v<n>.tsx
```

That generated `.tsx` is produced by the engine from `.igrpstudio/process/<processKey>/<step>.v<n>.json`. Never edit the generated file by hand.

---

## 2. File layout per process

```
.igrpstudio/process/<processKey>/
  ├── <processKey>.json              # ROOT — process descriptor (see §3)
  ├── pedido.v1.json                 # one step file per BPMN user task
  ├── calculo.v1.json
  └── autorizacao.v1.json
```

The companion runtime files live under `src/app/(myapp)/process/`:

```
src/app/(myapp)/process/
  ├── use-process-<X.Y.Z>.ts           # main hook for the process (data wiring, save/complete handlers)
  ├── use-process-<X.Y.Z>-validator.ts # optional — extracted Zod schemas reused across steps
  └── use-process-<X.Y>-shared.ts      # optional — cross-process shared logic (rare)
```

**Naming:** prefer dots (`use-process-3.1.1.ts`) — matches the majority. A handful of older files use dashes (`use-process-2-1-1.ts`); don't replicate that.

The generated TSX lands at `src/app/(igrp)/(generated)/process/[...process]/(<processKey>)/<step>.v<n>.tsx`.

---

## 3. The root `<processKey>.json` (process descriptor)

Single-line minified. Shape:

```json
{
  "type": "process",
  "processKey": "P3.1.1",
  "name": "P3.1.1",
  "processVersion": "2",
  "description": "Pedido de Subsídio de Doença",
  "id": "<10-char alphanum unique>",
  "steps": [
    {"id": "<10-char>", "key": "pedido.v1",       "name": "Pedido"},
    {"id": "<10-char>", "key": "calculo.v1",      "name": "Calculo"},
    {"id": "<10-char>", "key": "autorizacao.v1",  "name": "Autorizacao"},

    {"id": "<10-char>", "key": "pedido.v1",       "name": "Task_pedido"},
    {"id": "<10-char>", "key": "calculo.v1",      "name": "Task_calculo"},
    {"id": "<10-char>", "key": "autorizacao.v1",  "name": "Task_autorizacao"}
  ]
}
```

**Why two entries per step?** Existing processes (P1.1.1, P2.1.1, etc.) declare each step **twice** in `steps[]`:
1. once with `name: "<HumanLabel>"` (used for navigation/breadcrumb display)
2. once with `name: "Task_<step>"` (matches the `name` field inside the step JSON; used by the engine to bind the step component)

Mirror this convention in new processes. The two entries share the same `key`; only the `name` and `id` differ.

**Field rules:**
- `processKey` MUST match the API's `processKey` (e.g. `P3.1.1`) and the folder name.
- `processVersion` is a **string** (`"2"`, not `2`) — the engine compares as string.
- `id` is a 10-char alphanumeric, unique within the file. Each step `id` is also unique.
- `description` is human-readable Portuguese — used in lists/UI. Avoid trailing tabs/whitespace (some legacy files have them).

---

## 4. The step `<step>.v<n>.json`

This is where the actual UI for that BPMN task lives. Single-line minified.

Top-level skeleton:

```json
{
  "type": "processStep",
  "key": "pedido.v1",
  "processKey": "P3.1.1",
  "processVersion": "2",
  "version": "1",
  "name": "Task_pedido",
  "description": "Pedido",
  "id": "<10-char unique, must equal one of the Task_* ids in the root file>",
  "forceDynamic": false,
  "projectArtifactId": "",
  "taskKey": "Task_pedido",
  "artifactVariables": [],
  "args": [
    {
      "id": "config_arg",
      "type": "IGRPStepComponentConfig",
      "name": "config",
      "isList": false,
      "isOptional": false,
      "isInterface": true,
      "isFunction": false,
      "isState": false
    }
  ],
  "imports": [
    { "id": "process_imports",
      "namespace": "import { IGRPStepComponentConfig, IGRPStepMethods } from '@igrp/platform-process-management-client-ui'"
    }
  ],
  "types": [ /* see §5 */ ],
  "states": [ /* see §6 */ ],
  "functions": [
    { "id": "handleSave_fnc",     "name": "handleSave",     "isAsync": true,
      "code": "return await saveStep<Step>()",
      "arguments": [], "returnValue": {"type":"any","isNullable":false},
      "imports": [], "actions": {"deletable": false, "editable": true} },
    { "id": "handleComplete_fnc", "name": "handleComplete", "isAsync": true,
      "code": "return await completeStep<Step>()",
      "arguments": [], "returnValue": {"type":"any","isNullable":false},
      "imports": [], "actions": {"deletable": false, "editable": true} }
  ],
  "components": { /* see §7 */ }
}
```

### Mandatory fields (different from page/component)

| Field | Why it matters |
|---|---|
| `args` | MUST contain `{ name: "config", type: "IGRPStepComponentConfig", isInterface: true }`. The engine generates the React component as `function Task_X({ config }: { config: IGRPStepComponentConfig })`. Missing this → step crashes at runtime with `config is undefined`. |
| `imports` | MUST include the import for `IGRPStepComponentConfig` AND `IGRPStepMethods` — the engine references `IGRPStepMethods` in the auto-emitted `stepMethods` block (see §8). Even though *you* never write `onRegisterMethods` directly, the type must be in scope. |
| `name` | MUST match a `Task_*` entry in the root file's `steps[]` AND be the React function name (PascalCase preserved). Convention: `Task_<lowercaseStep>` (e.g. `Task_pedido`, `Task_calculo`). |
| `id` | MUST equal the `id` of the matching `Task_*` entry in the root descriptor. The engine uses this to wire the step. |
| `key` | `<step>.v<version>` — must match the filename and the API's `formKey`. |
| `taskKey` | Mirror of `name` (legacy duplication). Keep it equal to `name`. |
| `functions[]` | MUST contain `handleSave` and `handleComplete`. **Their `code` body must call into the hook**, e.g. `"return await saveStepPedido()"` / `"return await completeStepPedido()"`. The names `saveStep<Step>` / `completeStep<Step>` are destructured from the process hook in `onLoad.fnCode` (§7) — they are **not** declared by the JSON. **Do NOT use `code: "null"` (placeholder)** — the engine emits `handleSave()` directly from the auto-generated `stepMethods.saveStep` wrapper, and a `null` body returns `undefined` which the engine interprets as a failed save. |
| **Engine auto-emits `IGRPStepMethods`** | When the `functions[]` array contains `handleSave` and/or `handleComplete`, the engine **automatically generates** a `const stepMethods: IGRPStepMethods = { saveStep: …, completeStep: … }` block plus `useEffect(() => { onRegisterMethods?.(stepMethods); }, []);` in the TSX. **You do NOT add this `useEffect` to `onLoad.fnCode`.** Your job is just to declare `handleSave`/`handleComplete` in `functions[]`. |

---

## 5. `types[]` — Zod schemas for the step's forms

Same rules as page/component (uppercase names, fields match API keys). One type per `<form>` node.

For process steps, the form is the **submission payload** for the BPMN task variable. Spring `LocalDate` fields → `type: "date"` with `defaultValue: "new Date()"` for required ones, `""` for optional, and the standard `YYYY-MM-DD` normalization in the submit handler.

`formList` for repeating sub-rows uses `type: "object"` + `isList: true` + nested `fields[]` (see existing `actividadesEconomicas`, `enderecos`, `contactos` in `P1.1.1/pedido.v1.json` for the canonical shape).

---

## 6. `states[]` — common state for steps

Recurring state variables (declare only the ones the step actually uses):

| State | Purpose |
|---|---|
| `currentContribuinte` (`any`, optional) | Selected/loaded subject of the process |
| `cardDetails1Items` (`any`, default `[]`) | Detail card rows shown in the header |
| `pdfViewer1FileUrl` (`string`, optional) | PDF preview URL |
| `selectedTab` (`string`, default `"'tab1'"`) | Active tab when using `IGRPTabs` |
| `formData` (`any`) | Buffered form values for save/complete |

Avoid declaring states that the engine auto-emits (`form<Name>Data`, `select<id>Value`, `select<id>Options`, `contentTable<tag>`).

---

## 7. `components` — the step UI tree

The root MUST be a single node with `componentName: "processStep"`. Its `children` is the step UI.

```json
"components": {
  "id": "processstep_Task_pedido",
  "componentName": "processStep",
  "label": "Process Step",
  "tag": "processStep_<10-char>",
  "type": "group",
  "properties": { "commonProperties": { "generateReference": false }, "variables": [] },
  "children": [ /* one of patterns 7.A or 7.B */ ],
  "data": {},
  "childProperties": {},
  "interactions": {
    "onLoad": {
      "type": "function",
      "function": {
        "type": "function",
        "fnCustomCode": {
          "imports": [
            { "id": "<10-char>", "namespace": "import { useProcess3_1_1 } from '@/app/(myapp)/process/use-process-3.1.1'" }
          ],
          "fnCode": "/* hook wiring — see §8 */"
        }
      },
      "action": {}
    }
  }
}
```

### 7.A — Custom React wrapper (preferred for complex steps)

Many existing processes delegate to a hand-written React component that owns the form layout. The processStep JSON just renders that component and forwards `config`:

```json
"children": [{
  "id": "registofospedido_pkgl24",
  "tag": "RegistoFosPedido1",
  "componentName": "RegistoFosPedido",
  "label": "Registo Fos Pedido",
  "type": "group",
  "children": [],
  "interactions": {},
  "allowTypes": false,
  "data": { "config": { "value": { "id": "", "code": "config" } } },
  "properties": { "customProperties": { "config": "config" } },
  "childProperties": {}
}]
```

The custom component (e.g. `RegistoFosPedido`) lives under `src/app/(myapp)/components/` and accepts `{ config }: { config: IGRPStepComponentConfig }`. Use this pattern when:
- The step has many fields and complex cross-field logic
- The same UI is reused across multiple processes
- You need granular control over `IGRPFormHandle.current` and the submit flow

### 7.B — Inline tabs/forms inside the JSON

For simpler steps, declare the UI directly: usually `IGRPTabs` with one tab per logical section, each tab containing a `form` whose `dataType` references an entry in `types[]`. See `P1.1.1/pedido.v1.json` for the gold reference (it uses `tabs`, `form`, `formList`, `combobox`, `inputDatePickerSingle`, `inputHidden`, `pdfViewer`, etc., all inline).

The validation checklist from `SKILL.md` §"Validation checklist" applies as-is to forms inside processStep.

---

## 8. `onLoad` for process steps — destructuring the hook

The BPMN engine drives the step lifecycle. When the user clicks **Save** / **Complete** in the engine's chrome, it calls back via the auto-emitted `stepMethods` (see §4 — the engine generates the registration; you don't). What `onLoad` does is **destructure the process hook** to make `saveStep<Step>` / `completeStep<Step>` / `loadStep<Step>` (referenced in `handleSave`/`handleComplete` and `useEffect`) available in scope, plus seed any combobox/state from the hook's loaders.

**Canonical `onLoad.fnCode` (mirror of P1.2.10):**

```js
const {
  // Step methods consumed by the JSON's handleSave/handleComplete bodies
  saveStepPedido,
  completeStepPedido,
  loadStepPedido,
  // Loaders & helpers used inside the JSX / state setters
  optionsMotivosUtente,
  optionsTiposDocumentoProcesso,
  isLoading,
  // ... whatever else the hook exposes
} = useProcess3_X_Y({
  formRef: formform1Ref,
  formSchema: form1,
  setFormData: setForm1Data,
  step: "pedido",
  process: { ...config, variables: variables },
});

// Trigger initial load when BPMN variables arrive
useEffect(() => {
  if (variables) {
    loadStepPedido();
  }
}, [variables]);

// Seed combobox options once they're ready
useEffect(() => {
  setSelectidMotivoOptions(optionsMotivosUtente || []);
  setSelectidTipoDocumentoOptions(optionsTiposDocumentoProcesso || []);
}, [isLoading]);
```

**Rules:**
- Hook returns `saveStep<Step>` / `completeStep<Step>` whose names **must match exactly** what `handleSave` / `handleComplete` in `functions[]` call.
- **Do NOT** add `useEffect(() => onRegisterMethods?.(...))` here — engine auto-emits it from the `handleSave`/`handleComplete` declarations (§4). Adding it manually causes `Identifier 'stepMethods' has already been declared` or double-registration.
- State setters in `useEffect` only — bare-body calls cause infinite re-renders (same rule as pages).
- `processKey`, `processInstanceId`, `userTaskInstanceId`, `variables`, `onRegisterMethods` are all destructured from the auto-generated `config` arg. **Do NOT redeclare them.** Pass `config` (or `{ ...config, variables }`) into the hook so it has the full BPMN context.
- The hook decodes `variables` (often base64-JSON) to seed initial form values inside `loadStepPedido()`. See `decodeBase64Json` in `lib/utils`.

## 8.1. The hook contract (`useProcessX_Y_Z`) — what to expose

**Inputs** (called from the step's `onLoad`):

```ts
type ProcessSharedParams = {
  formRef: React.RefObject<IGRPFormHandle<any>>;
  formSchema: z.ZodSchema<any>;
  setFormData: (data: any) => void;
  step: 'pedido' | 'calculo' | 'autorizacao' | ...;
  process: IGRPStepComponentConfig & { variables?: any };
  // Optional callbacks the step provides:
  onUtenteLoaded?: (utente: any) => void;
  onPdfUrl?: (url: string) => void;
  // ... whatever the family of processes needs
};
```

**Outputs** (destructured in `onLoad`):

```ts
{
  // REQUIRED — referenced by handleSave/handleComplete in functions[]
  saveStep<Step>: () => Promise<StepMethodResult>,
  completeStep<Step>: () => Promise<StepMethodResult>,
  loadStep<Step>: () => Promise<void>,        // seeds form from variables on mount

  // Optional — loaders used by useEffects to populate combobox options/state
  optionsXxx, optionsYyy, isLoading,
  // Optional — file upload / recibo / domain helpers
  handleUploadFile, generateRecibo, ...
}
```

**`StepMethodResult` shape** — what `saveStep<Step>` / `completeStep<Step>` MUST return:

```ts
type StepMethodResult = {
  success: boolean;
  variables: { name: string; value: string }[] | undefined;  // BPMN variables to persist
  forms:     { name: string; value: string }[] | undefined;  // Form data to persist
  error?: string;
};
```

The engine consumes this shape via the auto-emitted `stepMethods` wrapper:

```ts
// ENGINE-GENERATED — do not write this in JSON
const stepMethods: IGRPStepMethods = {
  saveStep:     async () => { try { return await handleSave(); }     catch (e: any) { return { success: false, error: e.message ?? 'Failed to save step data' }; } },
  completeStep: async () => { try { return await handleComplete(); } catch (e: any) { return { success: false, error: e.message ?? 'Failed to complete step' };  } },
};
useEffect(() => { onRegisterMethods?.(stepMethods); }, []);
```

So `handleSave` / `handleComplete` only need to *return* the `StepMethodResult`. Throw or reject only for unexpected errors — for validation failures, return `{ success: false, error: '...' }`.

### 8.1.b. Reading data from a previous step — `getFormDataByTaskKey`

`useIGRPProcessContext` exposes 3 methods to read engine state from inside a step hook:

| Method | What it returns | Typical use |
|---|---|---|
| `getFormDataForTask()` | Form data of the **current** task | `loadStep<Step>` to pre-fill the form on retake/draft |
| `getVariableForTask(name)` | A single BPMN variable | Read cross-step refs (`idUtenteFalecido`, `decision`, etc.) |
| `getFormDataByTaskKey(taskKey)` | Form data of **another** task in the same instance | Show summary of previous step (e.g. Cálculo reads Pedido) |

**🔑 The `taskKey` parameter is the JSON's `taskKey` field, NOT the file `key`.**

| ✅ Correct | ❌ Wrong |
|---|---|
| `getFormDataByTaskKey("Task_pedido")` | `getFormDataByTaskKey("pedido.v1")` |
| `getFormDataByTaskKey("Task_calculo")` | `getFormDataByTaskKey("calculo.v1")` |

The convention `Task_<step>` is set in the JSON root: `"taskKey": "Task_pedido", "name": "Task_pedido"`. Pass that string verbatim. Using the file `key` (`"pedido.v1"`) silently returns `undefined`.

### 8.2. Save vs Complete — separation of concerns

| Method | When called | Typical contents |
|---|---|---|
| `saveStep<Step>()` | "Save draft" button in engine chrome | `formRef.submit()` → `safeParse` → return `{ success, forms: [...], variables: undefined }`. **No business validation, no BPMN-variable extras.** |
| `completeStep<Step>()` | "Complete task" button | save + business-rule validation + `formatFormData` (enrich labels) + return `{ success, forms, variables: [/* only cross-step refs */] }` |

**`forms[]` carries the form payload** — the engine persists it per task. On the next step, `getFormDataForTask()` from `useIGRPProcessContext` returns it back. **You do NOT need a separate `taskPedido` (or `task<Step>`) base64-encoded BPMN variable** for the form payload; the engine's task-data API already round-trips it.

**`variables[]` is only for cross-step references** that other steps need without re-fetching the full form (e.g. an `idUtenteFalecido` that the Cálculo step uses to call `GET /subsidios/luto/valor`). Keep this list minimal.

> ⚠️ Older hooks (`use-process-utente-shared.ts`, `use-process-contribuinte-shared.ts`, `use-process-agregado-shared.ts`) emit `taskPedido` as a base64 BPMN variable and decode it on RECTIFICAR retakes. **That pattern is being phased out** — new hooks should rely on `getFormDataForTask()` only. Don't replicate the encode/decode dance.

### 8.3. Family-shared hook pattern

For families of processes that share the same step shape (e.g. all *agregado* processes: P1.2.10 to P1.2.13), put the implementation in `use-process-<family>-shared.ts` and have each `use-process-<X.Y.Z>.ts` thin-wrap it with process-specific `processKey` + callbacks:

```ts
// use-process-3.1.1.ts (thin wrapper, ~30 lines)
const PROCESS_KEY = "P3.1.1" as const;

export const useProcess3_1_1 = (params: ProcessSharedParams) =>
  useProcessShared(
    { ...params, process: { ...params.process, processKey: PROCESS_KEY } },
    { onConfirmXxx: async (...) => { /* per-process side-effect */ } },
  );
```

Reference: `use-process-agregado-shared.ts` + `use-process-1.2.10.ts` / `1.2.11.ts` / etc.

---

## 9. Naming conventions cheat-sheet

| Concept | Convention | Example |
|---|---|---|
| Folder | `<processKey>` (uppercase, dots) | `P3.1.1` |
| Root file | `<processKey>.json` | `P3.1.1.json` |
| Step file | `<lowercaseStep>.v<n>.json` | `pedido.v1.json` |
| Step JSON `name` | `Task_<lowercaseStep>` | `Task_pedido` |
| Step JSON `taskKey` | mirror of `name` | `Task_pedido` |
| Type names | `Pascal/UppercaseFirst` | `FormPedidoDoenca` |
| Hook file | `use-process-<X.Y.Z>.ts` (dots) | `use-process-3.1.1.ts` |
| Hook export | `useProcessX_Y_Z` (underscores, no `P`) | `useProcess3_1_1` |
| Generated route group | `(<processKey>)` | `(P3.1.1)` |

---

## 9.1.b. Custom React components — file resolution

When `componentName` is NOT a built-in (i.e. not in the engine's component reference), the engine treats it as a custom React component and emits an import from `src/app/(myapp)/components/<folder>/<componentName-kebab-case>.tsx`. Two conditions must hold:

1. **File exists** at the kebab-case path (e.g. `componentName: "SearchFalecido"` → `src/app/(myapp)/components/search/search-falecido.tsx`). Without it: yellow zebra-tape placeholder + missing import.
2. **`id` starts with `<componentName-lowercase>_`** (see §9.1). Without it: same placeholder + the engine falls into a broken code path that emits stray `;` after every JSX element in the file.

Custom component file naming convention (verified by inspection of `src/app/(myapp)/components/search/`):
- componentName `SearchUtente` → `search-utente.tsx` — **preferred default** for any "pesquisa de utente" flow (returns full Utente DTO including `tiposUtente: [{ id, codigo, descricao, ... }]` so per-utente combos pull options from the result, not the global parametrização — see `project-conventions.md` §`tipoUtenteId`).
- componentName `SearchFalecido` → `search-falecido.tsx` — funeral-style flows (P3.2.7 etc.)
- componentName `SearchNIF` → `search-nif.tsx`
- ~~componentName `SearchUtenteBeneficiario`~~ → **legacy**, do not use in new flows. The "filter to BENEFICIARIO only" semantic is now expressed by the per-utente `tiposUtente` array returned by `SearchUtente` — the calling step picks the relevant tipo (or rejects in `validateStep<X>`) instead of pre-filtering the list.
- componentName `ProcessRectificationView` → resolved from `@/components/processrectificationview` (a different root)
- componentName `UploadState` → `upload-state.tsx` directly under `components/` (not under `search/`)

The folder isn't predictable from the componentName — the engine seems to scan multiple known directories. **When adding a new custom component, mirror the closest existing pattern** (e.g. for searches, add to `components/search/`; for upload-related, to `components/`) and re-export from the folder's `index.ts` if applicable.

## 9.1. ⚠️ `id` naming convention (engine resolves imports from this!)

The engine reads the `id` prefix to resolve which file to import for **custom** components (anything that's not a built-in like `combobox`, `inputText`, `tabs`, etc.). Mismatched ids cause:
- Custom components rendered as **yellow zebra-tape placeholder** + missing import
- Stray `;` after every JSX element (engine falls into broken code path)

**Rule:** every component's `id` MUST be `<componentName-in-lowercase>_<unique-suffix>`. The `componentId` references inside `types[].fields[]` must mirror the same.

```
✅ "id":"searchfalecido_falec327"          for componentName: "SearchFalecido"
✅ "id":"combobox_tpsub327"                for componentName: "combobox"
✅ "id":"inputdatepickersingle_dtnasc"     for componentName: "inputDatePickerSingle"
✅ "id":"processrectificationview_xyz"     for componentName: "ProcessRectificationView"

❌ "id":"src_falec327"  → engine emits placeholder, no import for SearchFalecido
❌ "id":"cbx_tpsub"     → triggers broken code path with stray `;`
❌ "id":"dtp_dtnasc"    → broken
```

This applies to ALL component types in process step JSONs — not just the custom ones. Following the convention everywhere is the safe default.

## 10. Validation checklist (in addition to `SKILL.md`'s)

Before declaring a process JSON complete, check:

- [ ] Root descriptor has TWO entries per step (one with human label, one with `Task_<step>`)
- [ ] Step `id` equals the `Task_*` entry's `id` from the root descriptor
- [ ] **Every component `id` follows `<componentName-lowercase>_<suffix>`** (see §9.1) — most common build error in process steps
- [ ] Step `name` is `Task_<step>` (not the human label)
- [ ] `args[]` contains the `config: IGRPStepComponentConfig` arg
- [ ] `imports[]` declares **both** `IGRPStepComponentConfig` and `IGRPStepMethods` (one combined import line is fine)
- [ ] `functions[]` includes `handleSave` and `handleComplete` with **real bodies** (`return await saveStep<Step>()` / `return await completeStep<Step>()`) — NOT `code: "null"`
- [ ] `onLoad.fnCode` destructures `saveStep<Step>`, `completeStep<Step>`, `loadStep<Step>` (and other helpers) from `useProcessX_Y_Z(...)` — names exactly match what `handleSave` / `handleComplete` reference
- [ ] **NO manual `useEffect(onRegisterMethods?.(...))`** in `onLoad` — engine auto-emits `stepMethods` and the registration when it sees `handleSave`/`handleComplete`
- [ ] Hook returns `{ success, variables, forms, error? }` shape from `saveStep<Step>` / `completeStep<Step>`
- [ ] No re-declaration of `config`, `processKey`, `processInstanceId`, `userTaskInstanceId`, `variables`, `onRegisterMethods` (auto-destructured)
- [ ] Filename `<step>.v<n>.json` matches the API `formKey` (`ui:form:<step>@<n>`)
- [ ] `processVersion` is a string and matches the API
- [ ] When using `formList` for repeating rows, every nested field has `componentId` AND a `label` (engine renders the label in the row header)
- [ ] All page/component validation rules from `SKILL.md` (uppercase types, unique tags, `args[].id` strings, no deprecated components, `LocalDate` normalization, etc.)

---

## 11. Common pitfalls

| Symptom | Likely cause |
|---|---|
| Custom component renders as yellow zebra-tape placeholder + no import emitted | `id` doesn't start with `<componentName-lowercase>_` (see §9.1) — engine couldn't resolve import path |
| Stray `;` after every JSX element in generated TSX | Same root cause as above — engine fell into broken code path due to mismatched `id` prefix |
| `Cannot read properties of undefined (reading 'processKey')` | Missing `args[].config: IGRPStepComponentConfig` — engine didn't generate the arg destructure |
| `IGRPStepComponentConfig is not defined` | Missing `imports[]` entry for `@igrp/platform-process-management-client-ui` |
| Save/Complete buttons in engine chrome do nothing | `handleSave`/`handleComplete` missing from `functions[]` (engine emits `stepMethods` only when both exist), OR their `code` is `"null"` (returns `undefined` → engine treats as failed save) |
| `Identifier 'stepMethods' has already been declared` | You manually wrote a `stepMethods`/`onRegisterMethods` block in `onLoad.fnCode` — remove it; engine auto-emits |
| `<saveStepXxx> is not defined` at runtime | `handleSave` body references `saveStepXxx` but the hook destructure in `onLoad` doesn't expose that name — align names |
| Step never resolves; engine shows blank | `<step>.v<n>.tsx` not generated — verify the JSON `key` filename, the root descriptor's `Task_*` entry, and that the engine has been re-run |
| Same step renders on every BPMN task | All step JSONs collide on `id` — each `Task_*` id MUST be unique |
| Form data not persisted between Save and Complete | Hook isn't reading `variables` from `config` — must decode and seed `formRef` on mount |
| `Identifier 'config' has already been declared` | Manually destructuring `config` in `onLoad.fnCode` — engine already does it |
| Variables empty when reopening a saved step | `artifactVariables` not declared OR backend not returning them — confirm with backend before assuming JSON bug |

---

## 11.5. Custom components inside process steps

Process steps can embed user-authored components from `src/app/(myapp)/components/` exactly like pages do. A real process step JSON commonly embeds custom views (e.g. a process-rectification panel, an upload-state widget, a custom empty-state) directly inside the step's component tree.

Reference shape:

```json
{
  "id": "processrectificationview_main",
  "componentName": "ProcessRectificationView",
  "tag": "rectificationView1",
  "properties": {
    "commonProperties": { "generateReference": false }
  },
  "children": [],
  "interactions": {},
  "data": {}
}
```

**Rules (identical to pages — repeated here so the process author doesn't have to cross-reference):**
- `id` MUST start with the lowercased `componentName` (`processrectificationview_*` ✅). The engine resolves the import path from the `id` prefix.
- The `.tsx` lives at `src/app/(myapp)/components/<kebab-name>/<kebab-name>.tsx` (e.g. `process-rectification-view/process-rectification-view.tsx`).
- The component MUST be registered in `src/app/igrp.config.ts` under `components: [...]`. Without registration → yellow placeholder.
- Custom components used by process steps are typically `scope: "app"` in their own `.igrpstudio/components/<Name>.json` manifest (they're cross-process, not page-bound).
- Pass step-level data via `properties` — the engine forwards every property verbatim as a JSX prop (`properties.title: "Pedido"` → `<ProcessRectificationView title="Pedido" />`).

When the step is **entirely** a custom React component (no engine-composed form, just a single component owning the whole UI), the step JSON is minimal: one component in `children`, empty `types`, empty `states`, and the hook handles `handleSave`/`handleComplete` referencing methods exposed by the custom component (see P2.1.1's `RegistoFosPedido` for the canonical pattern).

---

## 11.6. Prefilling forms from BPMN variables (`NormalizerSpec`)

When a step is reopened (e.g. RECTIFICAR), the engine provides `variables` (and `forms`) from the prior task instance. Raw BPMN variables are loosely typed — sometimes strings, sometimes JSON-encoded, sometimes nested under a `<TaskKey>Data` array. Resist the urge to write ad-hoc decoders per step; a single declarative normalizer used across all steps keeps prefill consistent.

```ts
// src/app/(myapp)/functions/variables-normalizer.ts

export type FieldType = "string" | "number" | "boolean" | "date" | "array";

export interface NormalizerEntry {
  type: FieldType;
  transform?: (value: unknown, raw?: Record<string, unknown>) => unknown;
}

export type NormalizerSpec = Record<string, NormalizerEntry>;

export function normalizeFormVariables(
  variables: Record<string, unknown> | undefined,
  payloadName: string,
  spec: NormalizerSpec
): Record<string, unknown> {
  if (!variables) return {};

  // 1) Prefer the array payload under <TaskKey>Data — the engine stores form arrays there.
  const arr = variables[payloadName];
  const flat =
    Array.isArray(arr) && arr.length > 0 && typeof arr[0] === "object"
      ? (arr[0] as Record<string, unknown>)
      : variables;

  const out: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(spec)) {
    const raw = flat?.[key];
    let value: unknown = raw;
    if (entry.type === "date" && typeof raw === "string") value = toIsoDate(raw);
    if (entry.type === "array" && raw == null) value = [];
    if (entry.type === "number" && typeof raw === "string") value = Number(raw);
    if (entry.transform) value = entry.transform(value, flat);
    out[key] = value;
  }
  return out;
}
```

Usage inside a hook (replace `<step>` with the actual step name):

```ts
const stepSpec: NormalizerSpec = {
  reasonId:        { type: "string" },
  occurrenceDate:  { type: "date" },
  repeatingItems:  { type: "array" },
  total:           { type: "number" },
  notes:           { type: "string" },
};

useEffect(() => {
  if (!variables) return;
  const prefill = normalizeFormVariables(variables, "Task_<step>Data", stepSpec);
  setForm<Step>Data(prefill);
}, [variables]);
```

Benefits:
- One file owns all variable coercion (dates, arrays, enums) — easy to audit.
- The same `spec` can also drive validation (`Object.keys(spec)`) and `types[]` generation.
- New process families just add a new spec; the engine wiring stays identical.

The function name `normalizeFormVariables` and the file path are conventions — what matters is the declarative spec.

## 11.7. Validation result shape — `{ isValid, error?, success? }`

Every `validateStep<X>` helper called from a step's hook should return the same shape so the engine and toast layer can react uniformly:

```ts
export interface ValidationResult {
  isValid: boolean;
  error?:   { title: string; description: string };
  success?: { title: string; description: string };
}

export function validateStep<Step>(formData: Record<string, unknown>): ValidationResult {
  if (!formData?.entityId) {
    return {
      isValid: false,
      error: {
        title: "Identification missing",
        description: "Find the subject entity before proceeding.",
      },
    };
  }
  // …more rules…
  return { isValid: true };
}

// Async variant when validation needs a backend round-trip:
export async function validateStep<Step>Async(
  formData: Record<string, unknown>
): Promise<ValidationResult> { ... }
```

Rules:
- **Always return the shape — never throw.** Throwing breaks the engine's save/complete pipeline.
- `title` + `description` mirror the iGRP toast shape, so the calling hook can `showToast(result.error!)` without remapping.
- `success` is optional; most validators only need `error` on failure (`{ isValid: true }` is enough on success).
- Async validators return `Promise<ValidationResult>` and the calling `handleSave`/`handleComplete` awaits them: `const v = await validateStep…(); if (!v.isValid) return v;`.
- For multi-rule validators, return on the **first** failure; users fix one thing at a time.

This shape pairs naturally with the soft-validation pattern for hidden fields documented in the main `SKILL.md` (§Types — hidden fields are not `required: true`; enforce inside `validateStep<X>` instead).

---

## 12. Quick-start template — new process step

When the user gives you an API artifact `{ taskKey: "Activity_X", name: "Pedido", formKey: "ui:form:pedido@1" }`:

1. Folder: `.igrpstudio/process/<processKey>/`
2. Root file: `<processKey>.json` with steps array (two entries per artifact: human label + `Task_<step>`)
3. Step file: `pedido.v1.json` with skeleton (§4) + `types[]` + minimal `components` tree
4. Hook: `src/app/(myapp)/process/use-process-<X.Y.Z>.ts` exporting `useProcessX_Y_Z` returning `{ handleSave, handleComplete, ... }`
5. Step `functions[]`: declare `handleSave`/`handleComplete` with `code: "return await saveStep<Step>()"` / `"return await completeStep<Step>()"`. Step `onLoad.fnCode`: destructure those names from `useProcessX_Y_Z(...)`. **Do NOT** add `onRegisterMethods` `useEffect` — engine auto-emits.
6. Run engine to generate TSX, then `npx next build` to verify

---

## 13. References

- Working examples to copy from:
  - `.igrpstudio/process/P1.1.1/` — full inline form with tabs, formList, combobox loaders (richest reference)
  - `.igrpstudio/process/P2.1.1/` — minimal step that delegates to a custom React component (`RegistoFosPedido`)
  - `.igrpstudio/process/P1.2.7/` — uses `useProcess1_2_7` hook pattern
- Engine code: `@igrp/platform-process-management-client-ui` exports `IGRPProcessProvider`, `IGRPProcessPage`, `IGRPStepComponentConfig`, `IGRPStepMethods`
- Layout/router: `src/app/(igrp)/(generated)/process/[...process]/{layout.tsx,page.tsx}` (DO NOT edit — generated)
