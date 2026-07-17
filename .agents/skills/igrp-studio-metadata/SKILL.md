---
name: igrp-studio-metadata
description: Author iGRP Studio JSON metadata files (pages, components, process steps) that compile correctly through the iGRP engine into Next.js/React code. Use when creating or editing files under `.igrpstudio/pages/`, `.igrpstudio/components/`, or `.igrpstudio/process/` — or when troubleshooting generated code under `src/app/(igrp)/(generated)/`.
---

# iGRP Studio Metadata Authoring

## Companion reference files

Load these only when needed — don't preload:
- **`component-reference.md`** — complete component catalog with typical properties for every supported `componentName`
- **`patterns.md`** — copy-paste JSON templates for list pages, forms, modals, filter blocks, stats cards, menu entries, onLoad recipes
- **`process-steps.md`** — the full contract for `processStep` JSONs (BPMN-driven steps under `.igrpstudio/process/`): file layout, root descriptor shape, `IGRPStepComponentConfig` wiring, `onRegisterMethods`, naming conventions
- **`troubleshooting.md`** — diagnostic workflows for build errors, runtime errors, and JSON validation
- **`project-conventions.md`** — reference iGRP project conventions: hooks, helper functions, status color functions, path conventions, and learned quirks (illustrative, adapt to your project)

**Load `patterns.md` when starting a new page** — it has ready-to-adapt skeletons.
**Load `process-steps.md` when authoring or editing anything under `.igrpstudio/process/`** — page/component rules in this file alone are NOT sufficient for process steps.
**Load `troubleshooting.md` when fixing an error** — it has mappings from error messages to JSON causes.
**Load `component-reference.md` when choosing which component to use** — it has all valid componentName values with properties.
**Load `project-conventions.md` before integrating any hook, function, or custom component** — to use existing primitives instead of reinventing.

## When to use this skill

**TRIGGER this skill when:**
- User asks to create, edit, or fix a page, component, or process step in `.igrpstudio/`
- The task involves generating JSON metadata that the iGRP engine will compile into `.tsx`
- A build/runtime error traces back to a file under `src/app/(igrp)/(generated)/` (those files are auto-generated from the JSONs — fix the JSON, not the TSX directly, unless the user confirms they cannot regenerate)
- User mentions "pageSlug", "componentName", "tableActionListCell", "iGRP Studio", "igrpstudio", "parametrizacao" page, or similar engine concepts

**DON'T use this skill for:**
- Plain React/Next.js work outside `.igrpstudio/`
- Backend code (Spring Boot / sibling backend repo) — those have their own skills
- Pure TypeScript modules (hooks, functions, validators) — those are hand-written

---

## Core principles — these explain WHY every rule below exists

Read these once, then let them frame every decision you make in the JSON.

### 1. The manifest is the handoff artifact

The JSON you emit will be checked in, reviewed by other developers, consumed by other Studios, and one day wired to a real backend. Treat it like production source code:

- **Never inline mock data** (no hardcoded `setTableData([...])` arrays inside `onLoad.fnCode`). The Studio runs a separate post-engine step that generates `<page>.mock.json` and a sibling `_preview.ts` file specifically for the preview, leaving the manifest clean.
- **Leave a commented stub** where the production hook will live (`// const { data } = useInvoicesQuery(); useEffect(...) `). That comment is the dev's signpost; they delete the comment and uncomment the hook when wiring the backend.
- **No demo-only props** in the manifest — no "this is just for showcase" content, no fake URLs, no placeholder customer names. Use realistic field shapes and let the seeder fill values.

### 2. The engine fails silently — every rule below preempts one such failure

The iGRP engine accepts most invalid input WITHOUT raising a validation error. It writes the `.tsx` and only then does the browser explode at runtime, or worse, the page renders but with empty cells / dead buttons / no data. There's no useful AJV path on `/types/0/path` to guide you back. The only defense is to know the rules upfront.

Every "STRICT rule" and every "Baseline" section in this skill exists because we hit a silent failure: column headers that didn't show up, state defaults that started as `"All"` (with quotes), action buttons that crashed `React.Children.only`, variants that rendered `<default>` as an HTML tag. Don't try to be clever about the shape — match the patterns verbatim.

### 3. The chat will auto-retry — your JSON is your only output

The Studio runs the LLM in a retry loop (up to 3 attempts). When the engine rejects a manifest, the Studio automatically re-prompts you with the error + the manifest verbatim and asks for a fix. You DO NOT need to chat through the fix, ask the user, or explain — your only deliverable each turn is the corrected `PageConfig` JSON inside ONE fenced ```json``` block. No prose, no markdown commentary outside the fence.

### 4. Field name = cell tag = data key — pick a name once and reuse it everywhere

The trinity `types[].fields[].name` ⇄ cell `tag` ⇄ data-table column id MUST all be the same string. Diverging them is the single most common cause of "the table renders but every column is empty". When the spec says "Customer", the field is `customer`, the cell tag is `customer`, the mock key is `customer`, the column id is `customer`. Same string, four places.

### 5. Maximise the design system; escalate to custom components only when it can't express the UI

iGRP's foundation is the **`@igrp/igrp-framework-react-design-system`** package. It is the **single source** for every UI primitive you reach for:

- Every IGRP-specific component (`IGRPPageHeader`, `IGRPDataTable`, `IGRPInfoCard`, `IGRPDataTableButtonLink`, …).
- Every shadcn primitive (`Button`, `Input`, `Select`, `Dialog`, `Sheet`, `Popover`, `Card`, `Tabs`, `Tooltip`, `Toast`, etc.) — the design system **re-exports** the full shadcn set, themed and prop-aligned with IGRP.

**Import rule (zero exceptions):**

```ts
// ✅ ALWAYS:
import { Button, Input, Card, IGRPPageHeader, IGRPDataTable } from '@igrp/igrp-framework-react-design-system';

// ❌ NEVER:
import { Button } from '@/components/ui/button';        // raw shadcn — not themed for IGRP
import { Button } from 'shadcn/ui';                      // wrong package
import { Button } from '@radix-ui/react-button';         // bare Radix — no styling
// And NEVER hand-roll <button className="bg-blue-500 px-4 py-2 rounded">Click</button> for anything covered above.
```

**The hierarchy of choices (work top-down — only descend if the level above can't express the UI):**

| Level | What | When |
|---|---|---|
| 1 | **Engine primitive** in `component-reference.md` (e.g. `pageHeader`, `inputText`, `table`, `infoCard`) | The catalog has a named match — use it via `componentName` in JSON |
| 2 | **Composition of engine primitives** (`section` + `flex` + `text` + `button`, or `card` + `cardContent` + `paragraph`) | The UI is layout-shaped and no single primitive fits, but 2–4 do |
| 3 | **Custom React component** under `src/app/(myapp)/components/<kebab>/` | Stateful behavior or domain logic the JSON model can't carry — and even THEN, the custom component itself imports from `@igrp/igrp-framework-react-design-system` (including the shadcn primitives) for every button/input/dialog inside it. Never reach for raw HTML or external packages for what the design system already provides. |

**Two opposite failure modes to avoid:**

- ❌ **Inventing engine primitives.** Names like `tableActionView`, `cellAmount`, `userProfileCard` that aren't in `component-reference.md` produce a yellow zebra-tape `<span>Unsupported Component</span>` placeholder which crashes the data-table.
- ❌ **Refusing to create real custom components.** The codebase IS full of legitimate ones (`SearchEntity`, `EntityGroupItem`, `ProcessReviewView`) referenced by `componentName` from JSON, with a `.tsx` file under `(myapp)/components/` and a registry entry in `igrp.config.ts`. These are not "invented" — they're handcrafted React, all composed from the design system. The Studio convention for registering them is already established (see "Custom components — when and how").

Never the middle ground: inventing a primitive name without writing the `.tsx`. The placeholder is fatal in row contexts.

---

## Core mental model

The iGRP engine reads a JSON file under `.igrpstudio/` and emits a `.tsx` file under `src/app/(igrp)/(generated)/`. Your job is to write the JSON; the engine owns the TSX. If the JSON is valid and uses supported components correctly, the TSX compiles.

**Three file kinds, all share the same shape:**
- **page** — `.igrpstudio/pages/*.json` — a full Next page
- **component** — `.igrpstudio/components/*.json` — a reusable piece consumed by pages
- **processStep** — `.igrpstudio/process/*.json` — one step of a workflow

The JSON **must** be a single-line minified document. Multi-line/pretty JSON is NOT supported by the engine.

---

## Top-level structure

```json
{
  "type": "page|component|processStep",
  "pageName"|"name": "<slug>",
  "path": "<route or empty>",
  "description": "<short>",
  "forceDynamic": false,
  "id": "<10-char alphanum, unique in file>",
  "args": [ArgDef, ...],                  // page/component input arguments
  "types": [TypeDef, ...],                 // data interfaces used (tables/forms)
  "states": [StateDef, ...],               // React state variables
  "functions": [FnDef, ...],               // functions generated in the component body
  "components": ComponentNode,             // the component tree (root)
  "imports": [ImportDef, ...]              // top-level imports
}
```

### Field reference

| Key | Purpose | Notes |
|---|---|---|
| `type` | Discriminator: `"page"`, `"component"`, or `"processStep"` | Required |
| `pageName`/`name` | Identifier for the file | `pageName` for pages, `name` for components/process steps |
| `path` | Route path for pages | Use route groups like `(parametrizacao)/ups` — the parenthesized segment is stripped from URL |
| `forceDynamic` | Disable static optimization | Default `false` |
| `id` | 10-char alphanumeric unique ID for this file | Required |
| `args` | Input arguments (URL params for pages, props for components) | Each `id` MUST be a **string** (`"1"`, not `1`) |
| `types` | Data-shape definitions referenced by tables and forms | See [Types](#types) |
| `states` | `useState` declarations | See [States](#states) |
| `functions` | Functions emitted in component body | See [Functions](#functions) |
| `components` | Root component node (the UI tree) | See [Component tree](#component-tree) |
| `imports` | Extra top-level import statements | Rarely needed; most imports go inside `functions` or `onLoad` |

### Icon names — Lucide React naming convention

Every icon name (`iconName`, `icon` properties anywhere in JSON) is an export from `lucide-react`. The `IGRPIconName` type is literally `keyof typeof icons` from that package — only valid icon names compile.

**Lucide changed its naming convention** (~2023): the new convention is **shape-first**, not subject-first. When in doubt, use the new (shape-first) names:

| Subject-first (OLD — frequently rejected) | Shape-first (NEW — use this) |
|---|---|
| `UserCircle` | `CircleUser` ✅ |
| `XCircle` | `CircleX` |
| `CheckCircle` | `CircleCheck` |
| `AlertCircle` | `CircleAlert` |
| `HelpCircle` | `CircleHelp` |
| `MinusCircle` | `CircleMinus` |
| `PlusCircle` | `CirclePlus` |
| `ArrowUpCircle` | `CircleArrowUp` |
| (similar for `Square*`, `Triangle*`, etc.) | shape-first variant |

**To verify** an icon name before using:
- Browse [lucide.dev/icons](https://lucide.dev/icons) — names shown there are exactly what you'd write in `iconName`
- Or grep the bundled types: `grep "Circle" node_modules/lucide-react/dist/lucide-react.d.ts`
- Or grep existing JSONs in this repo: `grep -rE '"icon[a-zA-Z]*":"[A-Z]' .igrpstudio/` — what's already in use is known-good

If you write a stale name (`UserCircle`, `XCircle`, etc.), you'll get a TS compile error in the generated TSX (`Type '"UserCircle"' is not assignable to type 'IGRPIconName'`).

### Component-only extra fields

For `type: "component"`:
- `scope`: one of three values — `"page"`, `"app"`, or `"global"`
  - **`"page"`** — the component is consumed by one specific page (modals, page-local helpers, list-page detail dialogs). Requires `pagePath` + `pageName` so Studio's "Pages" tree shows it nested under its owner.
  - **`"app"`** — the component is reused across many pages or process steps inside the same app (e.g. `SearchEntity`, `EntityGroupItem`). Omit `pagePath`/`pageName`. Studio lists it under the app's shared components tray.
  - **`"global"`** — semantically equivalent to `"app"` (both mean "not tied to a specific page"). Some older manifests use `"global"`; newer ones prefer `"app"`. Either works.
- `pagePath`: path of the consuming page (when `scope: "page"`)
- `pageName`: name of the consuming page (when `scope: "page"`)

```json
// Page-scoped: a modal used only on the entities page
{ "type": "component", "scope": "page", "pagePath": "entities", "pageName": "entities",
  "name": "EntityDetailModal", "fileName": "entityDetailModal", ... }

// App-scoped: a search dialog reused everywhere an entity is picked
{ "type": "component", "scope": "app",
  "name": "SearchEntity", "fileName": "searchEntity", ... }
```

**Rule of thumb:** if the component is only ever rendered from one page or process step, use `scope: "page"`. Anything reused twice or more → `scope: "app"`.

---

## Args (input arguments)

For pages, `args` maps URL dynamic segments. For components, `args` maps props.

```json
{
  "id": "1",                // MUST be string, even if numeric. Unique within the args array.
  "name": "uuid",
  "type": "string",         // TS type
  "isList": false,
  "isOptional": false,
  "isInterface": false,
  "isFunction": false,      // set true for callbacks (e.g. onAfterSubmit)
  "isState": false,
  "functionParameters": []  // for function args: their own parameters
}
```

**Critical**: `id` is always a **string**. Numeric IDs (`"id": 1`) cause the engine to misbehave.

---

## Types

Types define the shape of table rows and form values. Every `<table>` and `<form>` component in the tree MUST point to a type via its `dataType` property, AND that type must exist in the `types` array. **A form without a schema causes the runtime error: `Cannot use 'in' operator to search for '_def' in undefined`**.

```json
{
  "componentId": "table_xyz123",    // must match the id of the <table> or <form>
  "name": "Table1",                  // MUST START UPPERCASE — used by cells as dataType reference
  "path": "",                        // path to existing TS interface if reused; empty for new
  "fields": [
    {
      "componentId": "tabletextcell_abc",  // must match the cell/input id
      "name": "nome",                      // property name in the data object (matches API)
      "type": "string|number|boolean|date|file|object",
      "required": false,
      "defaultValue": "",
      "isList": false
    }
  ]
}
```

**Hidden fields are NEVER `required` at the schema or JSX level — even when they're conceptually mandatory.**

If a hidden field is required by business rules (e.g. `entityId` must be set after `SearchEntity`), enforce it inside `validateStep<Step>` in the hook, NOT via:
- ❌ `types[].fields[].required: true` — Zod adds `.nonempty()` and the form blocks submit with "field is required" alert pointing to a hidden field the user can't see → confusing UX
- ❌ `properties.required: true` on the `inputHidden` JSON node — emits the red asterisk `<label>field *</label>` rendering markup the user shouldn't see anyway

✅ Correct pattern:
```ts
// types[].fields[]:
{ componentId: "inputhidden_entityid", name: "entityId", type: "string", required: false, ... }
```
```json
// inputHidden node:
"properties": { "label": "entityId", "required": false, ... }
```
```ts
// In validateStep<Step> (hook):
if (!formData?.entityId) {
  return { success: false, error: "Identify the subject entity first (use the search widget)." };
}
```

**Naming rules:**
- **Type `name` MUST start with uppercase** (e.g. `Table1`, `FormCaixaDia`, `TableCaixaAtendedores`). The engine uses this name verbatim to emit TypeScript type identifiers (`type Table1 = {...}`, `useState<Table1[]>`, etc.), and TS conventions / the engine's own state-type references (e.g. `"type": "Table1[]"`) expect capitalized names. Lowercase type names produce invalid TS and/or mismatched references.
- Consequently, every `dataType: "..."` reference on a `<table>` or `<form>` component MUST match the `types[].name` (same uppercase-first casing).
- `field.name` MUST match the API JSON key it maps to (e.g. API returns `{id, nome, estado}` → fields named `id`, `nome`, `estado`). These are lowercase/camelCase — they map to data property names, not TS types.
- For table display, a convention is to suffix display-only fields with `Tbl` (e.g. `nomeTbl`, `estadoTbl`) and map them in an `useEffect` onLoad.
- Hidden ID cells use type `string` typically (even for numeric IDs) — the combobox/segment system expects string.

### Nested fields (object / array types)

Real forms regularly carry sub-structures: an `enderecos` object with `{rua, numero, cep, ...}`, a `pagamentos[]` array with line items, an `anexos[]` list of uploads. Encode them with `type: "object"` and a recursive `fields[]` array — the inner `fields[]` has the **exact same shape** as the outer one.

```json
{
  "componentId": "form_novotcp",
  "name": "FormNovoTCP",
  "fields": [
    { "componentId": "inputtext_nome", "name": "nome", "type": "string", "required": true },
    {
      "componentId": "formlist_endereco",
      "name": "enderecos",
      "type": "object",
      "required": false,
      "isList": false,
      "fields": [
        { "componentId": "inputtext_rua",    "name": "rua",    "type": "string", "required": true },
        { "componentId": "inputtext_numero", "name": "numero", "type": "string", "required": false },
        { "componentId": "inputtext_cep",    "name": "cep",    "type": "string", "required": true }
      ]
    },
    {
      "componentId": "formlist_anexos",
      "name": "anexos",
      "type": "object",
      "required": false,
      "isList": true,
      "fields": [
        { "componentId": "inputtext_titulo", "name": "titulo", "type": "string", "required": true },
        { "componentId": "inputtext_url",    "name": "url",    "type": "string", "required": true },
        { "componentId": "inputtext_tipo",   "name": "tipo",   "type": "string", "required": false }
      ]
    }
  ]
}
```

**Rules:**
- An `object` field is a **single** sub-record; the engine emits `enderecos: { rua, numero, cep }` in the TS interface.
- An `object` field with `isList: true` is a **repeatable** sub-record; the engine emits `anexos: Array<{ titulo, url, tipo }>`. In the component tree, this maps to a `formList` wrapper.
- Inner `componentId` MUST match the id of the corresponding component inside the parent `formList` / nested form. Same id-matching discipline as the top level.
- `required` on a nested `object` field controls whether the nested record is mandatory **as a whole**; field-level required still applies to each inner field independently.

Real-world shape: production manifests commonly stack 3–5 nested objects in a single form (e.g. `enderecos`, `contactos`, `pagamentos`, `anexos` on a registration form). The engine handles arbitrarily deep nesting as long as each level keeps the same `fields[]` shape.

**Type name examples:**

| ✅ Do | ❌ Don't |
|---|---|
| `"name": "Table1"` | `"name": "table1"` |
| `"name": "FormCaixaDia"` | `"name": "formCaixaDia"` |
| `"name": "TableCaixaAtendedores"` | `"name": "tableCaixaAtendedores"` |
| `"dataType": "FormTransferirAtendedor"` | `"dataType": "formTransferirAtendedor"` |
| `"dataType": "Form1"` on the form + `"name": "Form1"` in types | `"dataType": "form1"` + `"name": "Form1"` (mismatch) |

---

## States

React state variables emitted as `useState` calls.

**🔑 The `state_` prefix is mandatory; the suffix length is flexible.** What the engine actually checks is the prefix. If you write `"id": "myState"` or `"id": "st_foo"` (anything not starting with `state_`), the engine falls into a broken code path that emits stray `;` after every JSX element in the generated TSX. The suffix can be 5–10 alphanumeric characters — Studio generates 6-char suffixes by default, but production process steps mix `state__mQ5Zh` (5 chars), `state_KBZkPH` (6 chars) and form `defaultValues` 10-char hashes without issue. **What matters is the prefix.**

```json
{
  "id": "state_<5-10char>",     // alphanumeric suffix, prefixed with "state_" — REQUIRED
  "name": "showFilter",          // JS variable name
  "type": "boolean",             // TS type (e.g. "string", "number", "any", "Date | undefined", "string[]")
  "defaultValue": "false",       // literal TS expression — strings need quotes: "''"
  "imports": [],                 // imports needed for the type
  "isArray": false,              // optional hint
  "isOptional": false            // optional hint
}
```

**Reserved automatic states the engine generates (don't redeclare):**
- For each `combobox` with data bindings, states `select<id>Value` and `select<id>Options` are auto-emitted.
- For each `form`, state `form<name>Data` is auto-emitted when `defaultValues.state.generate: true`.
- For each `table`, state `contentTable<tag>` is auto-emitted for the data.

**State `defaultValue` is a TS expression, not a JS string literal:**

The engine emits `defaultValue` verbatim into `useState<T>(<defaultValue>)`. So:
- `"defaultValue": ""` → `useState<string>("")` — empty string ✅
- `"defaultValue": "''"` → `useState<string>('')` — empty string ✅ (sometimes — depends on engine version)
- `"defaultValue": "'foo'"` → `useState<string>('foo')` — string `"foo"` ✅
- `"defaultValue": "0"` → `useState<number>(0)` — number 0 ✅
- `"defaultValue": "[]"` → `useState<any[]>([])` ✅
- `"defaultValue": "new Date()"` → `useState<Date>(new Date())` ✅

⚠️ **Some engine versions emit `"''"` as the literal 2-char string `"''"`** instead of evaluating to an empty string — the user then sees literal `''` characters in any input bound to that state. **Safer pattern**: use `defaultValue: ""` (empty string, parses to empty) + `isOptional: true` so the engine emits `useState<string | null>(null)`. Input renders as empty.

| Use case | Recommended |
|---|---|
| Empty string input bound to state | `"defaultValue": "", "isOptional": true` |
| Empty array | `"defaultValue": "[]"` |
| Numeric counter starting at 0 | `"defaultValue": "0"` |
| Boolean flag default false | `"defaultValue": "false"` |
| Today's date | `"defaultValue": "new Date()"` |
| Pre-filled label string | `"defaultValue": "'My label'"` (single quotes inside) |

**Inline `data.<prop>.state.id` conventions:**
- For most state references inside `data` bindings, `id: ""` (empty) is correct — engine resolves by `name`.
- **Exception**: the form's `data.defaultValues.state.id` MUST be a unique alphanumeric hash 6–10 chars (mirroring P1.2.10's `4eq8f32wzj`, P1.2.11's `tobrj1qr9v`). This id ties the form to the schema generator's state map — empty or non-conforming ids here also trigger the stray-`;` bug. Studio emits 10-char hashes; hand-authored 6-char ids also work as long as they're unique within the page.

---

## Functions

Functions emitted in the component body, callable from interactions.

> ⚠️ **`returnValue` schema is strict**: only `type` + `isNullable` are allowed. Studio rejects `isOptional` / `isList` on save with `"must NOT have additional properties"` and `"must have required property 'isNullable'"`. Use `{ type: "void", isNullable: true }` for void returns and `{ type: "any", isNullable: false }` (mirroring `handleSave`/`handleComplete` in process steps) for typed returns.

```json
{
  "id": "fnc_<6char>",
  "name": "clearFilters",
  "code": "setSearchValue('');\nsetStatus('');\nrefetch();",
  "returnValue": { "type": "void", "isNullable": true },
  "imports": [
    { "id": "<10-char alphanum>", "namespace": "import { x } from 'module'" }
  ],
  "arguments": [
    {
      "id": "1",              // STRING, unique within this function's arguments
      "name": "row",
      "type": "any",
      "isList": false,
      "isOptional": false,
      "isInterface": false,
      "isFunction": false,
      "isState": false,
      "functionParameters": []
    }
  ],
  "isAsync": false
}
```

**Critical rules about engine-autogenerated names — DO NOT redeclare in your fnCode:**
- `const { igrpToast } = useIGRPToast()` — always auto-generated from the `useIGRPToast` import at top; `useIGRPToast` is auto-imported. **Don't import it in function imports.**
- `const router = useRouter()` — auto-generated ONLY when the page has a button with `interactions.onClick.type: "navigate"`. If only plain `router.push()` calls exist, you MUST import `useRouter` yourself and declare `const router = useRouter()` in onLoad.
- Named functions listed in `functions[]` are auto-emitted — NEVER destructure the same name from a hook (e.g. if you declared a `refreshList` function, don't do `const { refreshList } = useSomeHook()` — the name collides).

**State setters are auto-available** as `set<StateName>` — don't destructure, just call them.

---

## Component tree

The `components` root is a single node. Each node has this shape:

```json
{
  "id": "<6char alphanum, prefixed by componentName, unique in file>",
  "tag": "<businessIdentifier>",         // maps to API keys for inputs/cells; unique in file
  "componentName": "<engine component>", // see supported list
  "label": "<short human label>",
  "type": "group" | "",
  "children": [ComponentNode, ...],
  "interactions": { ...event handlers },
  "allowTypes": false,
  "data": { ...state bindings },
  "properties": { ... },
  "childProperties": { ... },
  "rules": [Rule, ...]                   // e.g. visibility
}
```

**Uniqueness constraints (violations break the engine):**
- Every `id` is unique in the entire file
- Every `tag` is unique in the entire file (the engine uses tags as React keys and as API field mappers)
- If a modal form field shares a conceptual name with a table column (e.g. both called `montante`), the form field MUST be renamed (e.g. `montanteFld`) — they cannot share tags

**🔑 `id` naming convention (CRITICAL — engine resolves component imports from `id` prefix):**

`id` MUST start with `<componentName-in-lowercase>` followed by `_<suffix>`. For custom React components (anything outside the built-in component reference, e.g. `SearchEntity`, `SearchEntity`, `EntityGroupItem`, `ProcessReviewView`), the engine **resolves the import path by reading the `id` prefix** — not the `componentName` directly. Mismatched ids cause:
1. Custom components render as a yellow zebra-tape placeholder (`<span className="text-red-500">SearchEntity</span>` inside a striped div) — engine couldn't resolve the import.
2. Stray `;` after every JSX element in the generated TSX — engine falls into a broken code path.

| ✅ Correct | ❌ Broken |
|---|---|
| `"id":"combobox_p017b2"` for `componentName: "combobox"` | `"id":"cbx_tpsub"` |
| `"id":"searchentity_falec327"` for `componentName: "SearchEntity"` | `"id":"src_falec327"` |
| `"id":"inputdatepickersingle_dtnasc"` for `componentName: "inputDatePickerSingle"` | `"id":"dtp_dtnasc"` |
| `"id":"processreviewview_xlaq92"` | `"id":"prv_p327"` |

The same applies to `componentId` references inside `types[].fields[]` — they MUST mirror the renamed component `id`.

### The `tag` is semantic
- In forms: `tag` == the key the value is sent under when the form submits
- In tables: `tag` == the property read from each row's data object
- In segments like `href: "x/[uuid]"` with `segments: [{name: "[uuid]", tag: "id", context: "column"}]`: `tag` refers to the row field name

### `properties` holds component configuration
Always includes `commonProperties: { generateReference: false }`. Other props are component-specific — see [Component reference](#component-reference).

### 🔑 `properties.dataProperties` — required on every form-input component

For a form-input component to register in the form schema (and appear in iGRP Studio's "binding" / form-fields panel), its `properties` MUST include:

```json
"dataProperties": { "isVirtual": false, "isType": true }
```

**Symptom when missing**: the component renders, but its `tag` isn't in the form binding panel; opening the component in Studio and saving "fixes" only that one (Studio injects `dataProperties` on save). For new processes, every form-input must ship with this from day one — otherwise most fields are absent from the form's binding panel and may be dropped on save.

| `componentName` | `dataProperties` |
|---|---|
| `inputHidden`, `inputText`, `inputNumber`, `inputTextarea`, `inputDatePicker`, `inputDatePickerSingle`, `combobox`, `select` | `{ "isVirtual": false, "isType": true }` |
| `inputFile` | `{ "isVirtual": true, "isType": true }` (value is persisted via a sibling `inputHidden url`, not via the file input itself) |
| `formList`, `form`, layout components (`grid`, `card`, `section`, etc.) | omit `dataProperties` |

When mass-authoring or copying components from a reference, run a quick scan:
```bash
python3 -c "import json,sys; d=json.load(open(sys.argv[1])); \
def w(n):\
  if isinstance(n,dict):\
    cn=n.get('componentName');\
    if cn in {'inputText','inputNumber','inputHidden','inputTextarea','inputDatePickerSingle','combobox','select'} and not n.get('properties',{}).get('dataProperties'): print('MISSING dataProperties on',cn,n.get('id'));\
    [w(v) for v in n.values()]\
  elif isinstance(n,list): [w(v) for v in n]\nw(d['components'])" .igrpstudio/process/<X>/<step>.v1.json
```

### `interactions` holds event handlers
```json
"interactions": {
  "onClick": {
    "type": "function",                  // or "navigate", "formSubmit"
    "function": {
      "type": "function",
      "fnName": "handleSubmit",          // named fn from functions[]
      // OR
      "fnCustomSet": "() => setOpen(true)",  // inline arrow
      "fnCustomCode": { "imports": [] }
    },
    "action": {},
    "navigate": { "path": "foo/bar", "name": "goToFoo", "params": [] },  // for type:navigate
    "formSubmit": { "formId": "", "targetForm": "form1" }                // for type:formSubmit
  }
}
```

**Important**: when `onClick.type === "navigate"`, the engine AUTO-imports `useRouter` and emits `const router = useRouter()`. Otherwise it doesn't.

### **PREFER `type: "navigate"` over `type: "function"` + `router.push()` for page navigation**

For any button / link that simply navigates to another page, ALWAYS use the navigate type — never write a handler with `router.push(...)` inline:

```json
// ✅ PREFERRED — declarative navigation
{
  "interactions": {
    "onClick": {
      "type": "navigate",
      "function": { "fnCustomSet": "() => router.push('caixa/gaf/transferencias')", "type": "function", "fnCustomCode": { "imports": [] } },
      "action": {},
      "navigate": { "path": "caixa/gaf/transferencias", "name": "goTogafTransferencias", "params": [] }
    }
  }
}
```

```json
// ❌ AVOID — imperative handler requires manual router import, harder to refactor
{
  "interactions": {
    "onClick": {
      "type": "function",
      "function": { "fnCustomSet": "() => router.push('caixa/gaf/transferencias')", "type": "function", "fnCustomCode": { "imports": [] } },
      "action": {}
    }
  }
}
```

**Benefits of `type: "navigate"`:**
- The target route is declared in `navigate.path` — easy to audit / refactor across JSONs
- Engine auto-imports `useRouter` and declares `const router = useRouter()` — you do NOT need to add the import or declaration in onLoad
- Omitting redundant `useRouter` imports keeps the onLoad lean and avoids `Identifier 'router' has already been declared` compile errors

**When to use `type: "function"` with `router.push()`:** only when the navigation target is **computed dynamically** based on state/row-data at click time and can't be expressed as a static `navigate.path`. In that case, import `useRouter` manually in the onLoad imports.

### `data` value bindings — include `type` for interface generation

When binding a component property to a code expression (read from state/derived value, not a form field), use the `data.<propName>.value.{ id, code, type }` shape **with `type` explicitly set** — without it, the engine may emit the value but the TypeScript interface for the component prop won't be inferred correctly:

```json
"data": {
  "value":    { "value": { "id": "", "code": "currentFalecido?.numero ?? ''", "type": "string"  } },
  "disabled": { "value": { "id": "", "code": "true",                          "type": "boolean" } }
}
```

This is for **value bindings** (read-only expressions). For **state bindings** (read+write to a `useState`), the shape is `data.<propName>.state.{ id, name, type, imports, generate }` — the `type` field there is also required (often `""` for engine-inferred state, e.g. `cardDetails1Items`).

Common code-expression types:
| Bound prop | `type` value |
|---|---|
| Text/string content (e.g. `value`, `description`, `code` rendering name) | `"string"` |
| Boolean toggle (e.g. `disabled`, `isLoading`, `isEmpty`) | `"boolean"` |
| Numeric (e.g. `index`) | `"number"` |
| List/array data passed to a child component | `"any[]"` or specific item type |

Verified pattern: a set of readonly `inputText` fields displaying data from a `current<Entity>` state needed `type` added to both `value.value` and `disabled.value` bindings before the interface generated cleanly.

### `data` binds state / values (older intro)
```json
"data": {
  "value": {
    "state": {
      "id": "",
      "type": "string",
      "name": "select{{id}}Value",        // template: {{id}} resolves to the component id
      "defaultValue": "''",
      "imports": [],
      "generate": true                    // true = engine emits the useState
    }
  },
  "options": {
    "state": { "name": "select{{id}}Options", "type": "IGRPOptionsProps[]", "defaultValue": "[]", "generate": true }
  }
}
```

For simple cases, you bind to an EXISTING state by `name` with `generate: false`:
```json
"data": { "value": { "state": { "name": "searchValue", "generate": false } } }
```

### `rules` for conditional rendering
```json
"rules": [{ "type": "visibility", "condition": "showFilter" }]
```
Emitted as `{ showFilter && (<Component ... />) }`.

---

## Component reference

**Use only these component names. Unknown names cause the engine to skip the node silently.**

### Layout
- `page` — root of pages (always the outermost wrapper for pages)
- `component` — root of component files
- `processStep` — root of process step files
- `section` — logical section (supports `spaceX`, `spaceY`)
- `container` — plain div with className support
- `grid` — CSS grid (`gap`, `variant: {default, md, lg}` — "cols1"/"cols2"/"cols3"/"cols4")
- `flex` — flex container (use `style.layout.flex` for direction/justify/gap)
- `column`, `columns`, `stack`, `fragment`, `aspect`, `separator`

### Typography & visuals
- `headline` — title + description (variants `h1`-`h6`, `roleColor`, `color`)
- `text`, `span`, `paragraph`, `label`
- `badge`, `icon`, `avatar`, `image`, `pdfViewer`, `videoEmbed`

### Input components (use inside `form`)
| Component | Purpose |
|---|---|
| `inputText` | Standard text |
| `inputTextarea` | Multi-line (use for long obs/description) |
| `inputNumber` | Numeric values |
| `inputPhone` | Phone |
| `inputUrl` | URL |
| `inputPassword` | Passwords |
| `inputAddOn` | Input with prepended select |
| `inputColor` | Color picker (hex) |
| `inputFile` | File upload (for multipart) |
| `inputHidden` | **Use for ID fields mapped to/from the API** |
| `inputSearch` | Search with submit button — used in list headers |
| `inputTime` | Time picker |
| `inputDatePicker` | **Standard date picker — use this** |
| `inputDatePickerSingle` | Another valid option for single date |

**DEPRECATED — do NOT use:** `input`, `datePicker`, `slider` (removed from the engine in `0.2.0-beta.17`)

### New in `0.2.0-beta.17`+ — feedback / overlay / primitive components

The engine now exposes these thin wrappers over the design-system primitives:

- **Feedback**: `notification`, `banner`, `progress`, `skeleton`, `spinner`, `empty`, `toaster`, `loadingSpinner`, `fieldDescription`
- **Overlays**: `tooltip`, `hoverCard`, `popover`, `sheet`, `drawer`, `command`
- **Navigation**: `breadcrumb`, `pagination`, `navigationMenu`, `menubar` (+ 15 child components under `menubar/children/`)
- **Forms**: `toggle`, `inputOTP`, `inputGroup`
- **Layout / typography**: `aspectRatio`, `scrollArea`, `kbd`, `pageHeaderBackButton`, `stepperUI`
- **Media**: `imageCropper`
- **Data display**: `statsCardMini`, `statsCardTopBorderColored`, `userAvatar`, `dateTimeInput`

Each maps 1:1 to the equivalent design-system export (`IGRPNotification`, `Tooltip`, `Sheet`, `Popover`, `IGRPBanner`, etc.). Use them the same way as any other engine primitive — set `componentName`, populate `properties`. Consult **`component-reference.md`** for the prop list of each.

**`stepperUI` vs the existing `process` / `processStep`.**
- `stepperUI` (new) → shadcn `<Stepper>` primitive. Low-level linear stepper for multi-step form wizards.
- `process` / `processStep` (existing, unchanged) → BPMN-style workflow steps under `.igrpstudio/process/*.json`. These wire `IGRPStepperProcess` from the design-system.
- Don't mix them. Use `stepperUI` only inside pages that need a UI-only step tracker; use `processStep` for actual workflow authoring.

### Notable prop additions on existing components (`0.2.0-beta.18`)

| Component | New props | Notes |
|---|---|---|
| `button` | `loading`, `loadingText`, `asChild`, `type` (`"button"`/`"submit"`/`"reset"`), `iconClassName`, `ariaLabel` | `loading` disables the button and swaps content for `loadingText`; new sizes: `"xs"`, `"icon-xs"`, `"icon-sm"`, `"icon-lg"` |
| `alert` | `alignment` | `"start"` \| `"center"` \| `"end"` |
| `alertDialog` | `showIcon`, `iconName`, `iconPlacement` | Optional header icon |
| `avatar` | `fallbackIcon`, `hasFallbackIcon`, `badgeShowIcon`, `badgeIconName`, `iconColor`, `iconClassName` | Icon-based fallback + status badge with icon |
| `badge` | `asChild` | shadcn primitive alignment |
| `cardDetails` | `description`, `contentClassName` | |
| `combobox` | `defaultValue` | |
| `dropdown` | `asChild`, `align` (`"start"`/`"center"`/`"end"`), `sideOffset` | |
| `imageCropper` | `cropShape` (`"rect"`/`"round"`), `aspect` | |
| `infoCard` | `titleClassName`, `contentClassName`, `variantSection`, `colorSection`, `orientation` | |
| `inputColor` | `format` / `defaultFormat` (`"hex"`/`"rgb"`/`"hsl"`) — **replaces** `showHexValue`; also new: `showFormatValue`, `formatOptions` | Multi-format color; migrate away from `showHexValue` |
| `inputFile` | `variant` (`"default"`/`"dropzone"`), `maxSize`, `maxFiles`, `acceptTypes`, `dropzoneLabel`, `dropzoneHint`, `removeLabel`, `removeAllLabel`, `dragActiveLabel`, `dragRejectLabel`, `maxSizeLabel`, `maxFilesLabel`, `rejectedAlertTitle`, `helperText`, `error`, `onFilesChange` | Dropzone mode |
| `inputNumber` | `description`, `defaultValue`, `min`, `max`, `step`, `errorMessage`, `error` | |
| `inputPassword` | `showPasswordToggle`, `defaultValue`, `error`, `helperText` | |
| `inputPhone` | `international` | |
| `inputSearch` | `helperText`, `error` | |
| `inputText` | `type` (`"text"`/`"email"`/`"tel"`/`"search"`/`"url"`), `helperText`, `iconSize`, `iconClassName`, `error`, `labelClassName`, `inputClassName` | |
| `inputTextarea` | `helperText`, `error`, `rows` | |
| `checkbox`, `switch` | `helperText`, `labelClassName`, `error`, `required` | |
| `radio` (`RadioGroup`) | `showIcon`, `iconName` | |
| `select` | `defaultValue`, `iconName` | |
| `loadingSpinner` | `parentClassName` | |
| `modalDialogContent` | `contentClassName`, `showCloseButton`, `showCloseButtonClassName` | `showCloseButton` defaults to `true` (was implicit before) |
| `notification` | `showIcon`, `iconName`, `content`, `showClose`, `showLink`, `lableLink`, `actionLink`, `border` | `lableLink` (yes, sic — matches DS prop name) |
| `pageHeader` | `iconBackButton`, `backButtonAriaLabel`, `backButtonShowText`, `backButtonText`, `backButtonClassName`, `backButtonUseBrowserBack`, `headlineContentClassName`, `pageHeaderContentClassName` | Back-button subprops now first-class |
| `pageHeaderBackButton` | `iconName`, `variant`, `size`, `ariaLabel`, `showText`, `text`, `url`, `useBrowserBack` | Standalone back-button |
| `pdfViewer` | `documents`, `defaultDocument` | Documents array with `id`/`url`/`name` |
| `separator` | `decorative` | |
| `statsCardMini` | `titleSize`, `titleClassName`, `valueSize`, `valueClassName`, `iconName`, `iconClassName`, `image`, `imageAlt`, `variant` | |
| `statsCardTopBorderColored` | `cardVariant`, `iconName`, `iconClassName` | |
| `statusBanner` | `text`, `badgeVariant`, `badgeColor`, `badgeText` | |
| `table` | `rowCount` | For server-side pagination |
| `tableExpanderCell` | `field` is **now optional** (was required); new `label` prop | |
| `tabs` | `showScrollIndicators`, `scrollButtonClassName` | Horizontal scroll UX |
| `userAvatar` | `image`, `alt`, `fallbackContent`, `fallbackClass` | |
| `videoEmbed` | `title`, `allowFeatures`, `width`, `height` | |

### `repetitiveList` — dropped and re-added

`repetitiveList` was **removed** in `0.2.0-beta.17` when the design-system dropped `IGRPRepetitiveComponent`, then **restored** in `0.2.0-beta.19` after DS re-introduced it. Any workspace JSON authored between those two versions that referenced `repetitiveList` broke silently; those manifests work again from `beta.19` forward with the same shape as before (`items` string ref, `variable` for loop var, `dataKey` for key path).

### Selection
- `combobox` — searchable select (use for API-loaded options and ID selection)
- `select` — simpler select for static enums
- `checkbox`, `radio`, `switch`, `slider`

### Calendars (dedicated inline pickers)
- `calendarSingle`, `calendarSingleTime`
- `calendarMultiple`, `calendarMultipleTime`
- `calendarRange`, `calendarRangeTime`
- `datePickerSingle`, `datePickerMultiple`, `datePickerRange`

### Buttons
- `button` — standard (variants: `default`, `outline`, `ghost`, `destructive`, `secondary`)
- `copyTo` — click-to-copy

### Cards & info displays
- `card` + `cardHeader` + `cardContent` + `cardFooter`
- `cardDetails` + `cardDetailsItem`
- `infoCard` + `infoSection` + `infoItem`
- `statsCard` — KPI cards (variants `info`, `success`, `warning`, `indigo`, `secondary`)
- `statusBanner` — status alert banner

### Tables (list pages)
`table` is always the outer wrapper. It has two block children:
- `tableColumns` — holds column-cell components
- `tableFilters` — holds filter components (often empty when using external filter container)

**Column cells (allowed inside `tableColumns`):**
| Cell | Purpose |
|---|---|
| `tableHiddenCell` | Carry an ID without rendering — essential for `segments` in links |
| `tableTextCell` | Text with optional `headerType: "sortToggle"` |
| `tableBadgeCell` | Enum/status with customize function (returns `{bgClass, textClass, label, iconName, className}`) |
| `tableAmountCell` | Currency (`currency: "XOF"`, `language: "pt-PT"`) |
| `tableDateCell` | Dates |
| `tableLinkCell` | Link within cell |
| `tableTooltipCell` | Tooltip wrapper |
| `tableCheckboxCell` | Row selector |
| `tableExpanderCell` | Row expander |
| `tableActionListCell` | **Wrapper for inline actions — prefer over dropdowns** |

**Inside `tableActionListCell` (inline row actions):**
- `tableLinkAction` — navigate to URL (uses `href`, `segments`, `params`)
- `tableAlertAction` — confirm then run handler (use for Delete, Change Status, Close, etc.)
- `tableModalAction` — open modal
- `tableDropdownMenuCell` — group multiple actions in a dropdown (use only when there are many actions)
  - Inside: `tableCustomDropdownItem`, `tableLinkDropdownItem`, `tableAlertDropdownItem`, `tableModalDropdownItem`

**DEPRECATED action cells — do NOT use:** `tableLinkButton`, `tableModalButton`, `tableButtonListCell`

**Filters (inside `tableFilters`):**
- `tableInputFilter`, `tableSelectFilter`, `tableDropdownFilter`, `tableFacetedFilter`
- `tableDateFilter`, `tableMinMaxFilter`

### Forms & modals
- `form` — wrapper for a form; `dataType` MUST reference a types array entry
- `formList` — repeatable form instances (for array fields)
- `modalDialog` + `modalDialogContent` + `modalDialogHeader` + `modalDialogTitle` + `modalDialogDescription` + `modalDialogFooter` + `modalDialogTrigger` + `modalDialogClose`
- `alertDialog`, `alert`

### Misc wrappers
- `accordion` + `accordionItem`
- `tabs` + `tabsItem`
- `menuNavigation` + `menuNavigationItem`
- `dropdown` + `dropdownItem`
- `repetitiveList`
- `textList` + `textListItem` + `textListItemContent` + `textListSubItems`
- `chat`, `carousel`
- `pageHeader` — page title + description + action button slot

### Charts
- `areachart`, `linechart`, `piechart`, `radarchart`, `radialbarchart`
- `horizontalbarchart`, `verticalbarchart`

### DEPRECATED / banned entirely
**Never emit these:**
- `input`, `datePicker` (use `inputDatePicker`)
- `process` (use `processStep`)
- `tableLinkButton`, `tableModalButton`, `tableButtonListCell`

---

## Common patterns (copy as templates)

### Pattern 1: List page with filters + stats + table + modal

A typical list-with-filters page follows this shape — mirror an existing page in your `.igrpstudio/pages/` that matches the same category (list-with-filters vs parametrization vs form).

Structure:
```
page
 └── section
      ├── pageHeader (title + description + [Novo] button)
      ├── grid (cols4) [stats cards: statsCard×4]
      ├── container (filters wrapper, className "px-4 pt-2 space-y-3")
      │    ├── flex row (space-between)
      │    │    ├── container (flex-1 min-w-[240px]) → inputSearch
      │    │    └── flex (justify-end) → button "Filtros" toggles showFilter
      │    ├── separator (visibility: showFilter)
      │    ├── grid cols4 (visibility: showFilter) → comboboxes/datePickerRange
      │    └── flex (visibility: showFilter) → button "Limpar Filtros"
      ├── table
      │    ├── tableColumns → cells (hidden ID + data cells + tableActionListCell)
      │    └── tableFilters (empty)
      └── LoadingPage
```

Must-have states: `showFilter (bool)`, `searchValue (string)`, `datePickerRangeDate (any)`.
Must-have functions: `clearFilters()`, `refreshList()`.

### Pattern 2: Form page or form component

Reference: mirror an existing form component under `.igrpstudio/components/` in your project.

Form rules:
- `<form>` node needs `dataType: "FormXxx"` AND a matching type in `types[]` with all field mappings
- Each input child's `tag` MUST match a field `name` in that type
- `interactions.onSubmit.function.fnName` → a function in `functions[]`
- Hidden IDs go through `inputHidden` nodes

### Pattern 3: Parametrization page (single file, list + modal)

Reference: `.igrpstudio/pages/motivos.json`, `.igrpstudio/pages/regimes.json`

Key elements:
- `path: "(parametrizacao)/<slug>"`
- onLoad uses `useParametrizacaoCrud(routeName, { params })` from `@/app/(myapp)/hooks/use-parametrizacao-crud` — generic CRUD inferred from the URL slug
- Standard states: `open`, `tableData`, `currentItem`, `modalDialogTitle1Content`, filter states
- `handleSubmit(values)` branches on `currentItem ? update : create`
- Tables map API fields to `xxxTbl` aliases in an `useEffect`
- Modal title uses state binding: `modalDialogTitle.data.content.state.name: "modalDialogTitle1Content"`

### Pattern 4: Modal dialog inside a page

Structure:
```
modalDialog (data.open.value.code: "openModalName")
 ├── modalDialogContent (size: "md"|"lg"|"full")
 │    ├── modalDialogHeader
 │    │    ├── modalDialogTitle (content: string or data-bound)
 │    │    └── modalDialogDescription
 │    ├── form (dataType: "FormXxx")
 │    │    └── inputs...
 │    └── modalDialogFooter
 │         ├── button "Cancelar" (onClick: () => setOpen(false))
 │         └── button "Confirmar" (onClick: type:formSubmit, formSubmit.targetForm: "FormXxx")
 └── modalDialogTrigger (optional, usually hidden)

interactions.onOpenChange: { function.fnCustomSet: "setOpenModalName" }
```

### Pattern 5: Combobox loading options from an API

```json
{
  "id": "cmbx_xxx",
  "tag": "myFilter",
  "componentName": "combobox",
  "data": {
    "value": { "state": { "name": "select{{id}}Value", "type": "string", "defaultValue": "''", "generate": true } },
    "options": { "state": { "name": "select{{id}}Options", "type": "IGRPOptionsProps[]", "defaultValue": "[]", "generate": true } }
  },
  "interactions": {
    "onChange": {
      "type": "function",
      "function": { "fnCustomSet": "(value) => setSelectmyFilterValue(value as string)", "type": "function", "fnCustomCode": { "imports": [] } }
    }
  },
  "properties": {
    "label": "My Filter", "variant": "single", "showSearch": true, "gridSize": "full",
    "placeholder": "Select...", "selectLabel": "No option found",
    "options": []
  }
}
```

Then in onLoad fnCode:
```js
const { data: opts, isLoading } = useMyHook();
useEffect(() => {
  if (isLoading || !opts) return;
  setSelectmyFilterOptions(opts.map((o: any) => ({ value: String(o.value), label: o.label })));
}, [isLoading, opts]);
```

For multi-select: `variant: "multiple"`, type `string[]`, setter receives `as string[]`.

### Pattern 6: Table row action linking to detail page

```json
{
  "id": "tlka_xxx",
  "tag": "tableLinkActionView",
  "componentName": "tableLinkAction",
  "properties": {
    "labelTrigger": "Visualizar",
    "iconProperties": { "iconName": "Eye" },
    "variant": "ghost",
    "href": "entities/[uuid]",
    "segments": [{ "name": "[uuid]", "tag": "contribuinteId", "context": "column" }],
    "params": []
  },
  "rules": [{ "type": "visibility", "condition": "rowData.estado === 'ACT_REP'" }]
}
```

The `tag` in segments refers to the row's field name (from the table's type fields).

### Pattern 7: Badge customization from status

Table badge cell customize:
```json
"interactions": {
  "customize": {
    "type": "function",
    "function": {
      "type": "function",
      "fnCustomCode": {
        "imports": [{ "namespace": "import {getStatusColor} from '@/app/(myapp)/functions/global'", "id": "<10char>" }]
      },
      "fnName": "getStatusColor"
    },
    "action": {}
  }
}
```

The referenced function must return `{ bgClass, textClass, iconName, label, className }`.

---

## onLoad fnCode — the component body logic

`components.interactions.onLoad` holds the hook wiring emitted at the top of the component body, after state declarations.

```json
"interactions": {
  "onLoad": {
    "type": "function",
    "function": {
      "type": "function",
      "fnCustomCode": {
        "imports": [
          { "id": "<10char>", "namespace": "import {useThing} from '@/app/(myapp)/hooks/use-thing'" }
        ],
        "fnCode": "const { data, isLoading } = useThing();\n\nuseEffect(() => {\n  if (isLoading || !data) return;\n  setTableData(data.content);\n}, [isLoading, data]);"
      }
    },
    "action": {}
  }
}
```

**onLoad rules:**
1. **Do NOT declare `const router = useRouter()`** if the page has a `type: "navigate"` button — the engine does that for you (otherwise you'll get `Identifier 'router' has already been declared`).
2. **Do NOT declare `const { igrpToast } = useIGRPToast()`** — always auto-generated.
3. **Do NOT import `useRouter` or `useIGRPToast`** in function imports — auto-handled. `useIGRPToast` is always auto-imported. `useRouter` is auto-imported when the page has at least one `type:"navigate"` interaction (which is the preferred way to navigate — see above). Only import `useRouter` yourself if you call `router.push` dynamically AND the page has no `type:"navigate"` button.
4. **State setter calls at the component body level cause infinite re-renders.** Always wrap them in `useEffect`. Bad: `setStatusOptions(options)` at top level. Good: `useEffect(() => setStatusOptions(options), [])`.
5. **Named functions collide with destructured vars.** If `functions[]` contains a `refreshList`, do NOT do `const { refreshList } = useSomeHook()` — rename one.

---

## Component children rules

Some containers in the engine enforce **both** a maximum number of children **and** a whitelist of allowed child types. Putting anything else (or too many things) throws `The component X allows only N children.` at codegen time, with no help on which kind of child belongs there. These are the four containers with hard limits:

| Container | Max children | Allowed children (component names) | Common mistake |
|---|---|---|---|
| **`card`** | 3 | `cardHeader`, `cardContent`, `cardFooter` | Dropping `headline`/`flex`/`paragraph` directly under `card`. Wrap them in `cardContent` (or `cardHeader` for the title). |
| **`table`** | 3 | `tableColumns`, `tableFilters`, `tableRowSubcomponent` | Putting `tableTextCell`/`tableBadgeCell` directly under `table`. They go inside `tableColumns`. |
| **`modalDialog`** | 3 | `modalDialogContent`, `modalDialogTrigger` | Putting `form`/`button`/`headline` directly under `modalDialog`. Wrap in `modalDialogContent` (which itself contains `modalDialogHeader`/`modalDialogFooter`/etc). |
| **`textListItem`** | 2 | `textListItemContent`, `textListSubItems` | Putting `text`/`button` directly under `textListItem`. Wrap in `textListItemContent`. |

**Correct shape — `card` with title, body, and footer action:**

```jsonc
{
  "id": "card_summary",
  "componentName": "card",
  "tag": "cardSummary",
  "children": [
    {
      "id": "cardheader_1",
      "componentName": "cardHeader",
      "tag": "cardHeader1",
      "children": [
        { "id": "headline_title", "componentName": "headline", "tag": "headline1", "children": [], "interactions": {}, "data": {}, "properties": { "content": "Summary", "variant": "h4", "commonProperties": {} } }
      ],
      "interactions": {}, "data": {}, "properties": { "commonProperties": {} }
    },
    {
      "id": "cardcontent_1",
      "componentName": "cardContent",
      "tag": "cardContent1",
      "children": [
        { "id": "text_total", "componentName": "text", "tag": "textTotal", "children": [], "interactions": {}, "data": {}, "properties": { "content": "Total: 42", "commonProperties": {} } }
      ],
      "interactions": {}, "data": {}, "properties": { "commonProperties": {} }
    },
    {
      "id": "cardfooter_1",
      "componentName": "cardFooter",
      "tag": "cardFooter1",
      "children": [
        { "id": "btn_view", "componentName": "button", "tag": "buttonView", "children": [], "interactions": {}, "data": {}, "properties": { "content": "View", "variant": "outline", "commonProperties": {} } }
      ],
      "interactions": {}, "data": {}, "properties": { "commonProperties": {} }
    }
  ],
  "interactions": {}, "data": {}, "properties": { "commonProperties": {} }
}
```

**For stat tiles (Total / Paid / Pending / Overdue style), prefer `infoCard` or `statsCard` — NOT `card`.** Those are dedicated dashboard components that accept inline `title`/`value`/`color` properties without requiring header/content/footer wrappers. `card` is for richer layouts where you need explicit sections.

**General rule:** every container has accepted-children rules. If the engine catalog injected in this turn lists `acceptedChildren` for a component, treat it as exhaustive — do not invent new child types.

---

## Component variant gotchas

The `variant` property is **not interchangeable** across components — the engine renders some variants as HTML tag names (`<h3>`, `<h1>`) and an invalid value emits something like `<default>` which the browser rejects (`Console Error: The tag <default> is unrecognized in this browser`). The most common pitfall is defaulting `variant: "default"` for everything because most components accept it — these don't:

| Component(s) | Allowed `variant` values | Default | Notes |
|---|---|---|---|
| **`pageHeader`**, **`headline`** | `"h1"` `"h2"` `"h3"` `"h4"` `"h5"` `"h6"` | `"h3"` | ❌ NEVER `"default"` — renders `<default>` |
| `button`, `link`, `tableLinkAction`, `alertAction`, `tableTextCell` | `"default"` `"secondary"` `"destructive"` `"outline"` `"ghost"` `"link"` | `"default"` | |
| `badge`, `tableBadgeCell`, `statusBanner` | `"solid"` `"soft"` `"outline"` (or `"primary"`/`"secondary"`/`"destructive"`/`"success"`/`"warning"`/`"info"`/`"indigo"` for status colors) | `"soft"` | |
| `infoCard`, `statsCard` | `"solid"` `"soft"` `"outline"` | varies | Use `variantSection`/`colorSection` for the inner color, not `variant` |
| `tabs` | `"default"` `"outline"` `"pills"` `"underline"` `"cards"` | `"default"` | |
| `modalDialog`, `container` | `"default"` `"narrow"` `"wide"` | `"default"` | |
| `flex` | `"row"` `"row-reverse"` `"col"` `"col-reverse"` (NOT a generic variant — controls layout direction) | `"row"` | |
| `accordion` | `"single"` `"multiple"` | `"single"` | |
| `grid` | none — use `variant: "cols-N"` if at all, or omit | — | `grid` mainly takes `gap`, not variant |

**Rule of thumb:** if the component renders a heading or a tag whose name is conceptually part of the design (h-level, layout direction, multi-select mode), the `variant` controls the actual HTML/semantic output — picking an unsupported value renders that string as a tag. For everything else, `variant` is a visual style and `"default"` is safe.

When in doubt, omit `variant` and let the engine use the schema default rather than guessing.

### Color and section props (separate from `variant`)

| Prop on… | Allowed values | Default | Common mistake |
|---|---|---|---|
| `infoCard` / `statsCard` `colorSection` | `"primary"` `"secondary"` `"destructive"` `"success"` `"warning"` `"info"` `"indigo"` | `"primary"` | ❌ Tailwind palette names like `"slate"`, `"green"`, `"amber"`, `"red"`. Map to the engine vocabulary: success-y → `"success"`, neutral/total → `"primary"` or `"info"`, warning/pending → `"warning"`, error/overdue → `"destructive"`. |
| `infoCard` / `statsCard` `variantSection` | `"solid"` `"soft"` `"outline"` | `"soft"` | ❌ `"default"` (use `"soft"` for the muted style). |
| `tableBadgeCell` / `badge` `variant` | `"solid"` `"soft"` `"outline"` | `"soft"` | OK to use `"soft"` here too. |

### Tailwind spacing tokens (`gap`, `spaceY`, `spaceX`, `padding*`)

These props are inlined into Tailwind utility classes (`gap-{x}`, `space-y-{x}`, `p-{x}`, etc.). **Use the Tailwind numeric scale** (`"1"` through `"96"`, plus the named tokens Tailwind ships: `"px"`, `"0.5"`, `"1.5"`, …) — NOT design-system size tokens.

| You want… | ✅ Use | ❌ NOT |
|---|---|---|
| Tight vertical rhythm between sections | `spaceY: "4"` or `"6"` | `spaceY: "md"`, `"sm"`, `"lg"` |
| Grid gap | `gap: "4"` or `"6"` | `gap: "md"` |
| Page padding | `padding: "6"` | `padding: "lg"` |

Outputs as `space-y-6`, `gap-4`, `p-6` — Tailwind atomic classes. Any `md`/`lg`/`xl` token here produces a non-existent class (`space-y-md`) and the browser silently ignores it, so the layout collapses with no error.

### `properties.className` is APPENDED, not replaced

The engine emits `cn('<engineClass>', '<extraVariantClasses>', '<userClassName>')` — meaning your `className` is concatenated with the engine's own classes. DO NOT repeat the component's base class (`"grid grid"` becomes `class="grid grid"`, which is just noise). Use `className` only for fine-tuning, e.g. `"flex-1"` on an input that should grow, or `"w-[180px]"` on a fixed-width select.

---

## Custom components — when and how

Sometimes the engine catalog doesn't carry the right primitive for what the spec asks (a typeahead bound to a domain hook, a multi-step picker, a chart with rule-driven coloring). The engine supports user-authored components from `src/app/(myapp)/components/` — mature iGRP projects often accumulate dozens of these (domain search dialogs, list-item editors, process-rectification views, etc.). When you need one, you produce **three coordinated artefacts in the same turn**:

### A. The JSON manifest references the custom component by PascalCase `componentName`

```json
{
  "id": "searchentity_main",
  "componentName": "SearchEntity",
  "tag": "searchEntity1",
  "label": "Search Entity",
  "children": [],
  "interactions": {},
  "data": {},
  "properties": {
    "title": "Find entity",
    "onItemSelected": "()=>{setCurrentItem(rowData)}",
    "commonProperties": { "generateReference": false }
  },
  "childProperties": {}
}
```

🔑 **`id` MUST start with the lowercased component name** — the engine resolves the import path from the `id` prefix, NOT from `componentName`. `searchentity_main` ✅ — `searchentity` (no suffix) ✅ — `sru_main` or `search_main` ❌ (engine won't find the file). The same applies to `componentId` references inside `types[].fields[]` if the component is form-input-like.

### B. A real `.tsx` file under `src/app/(myapp)/components/<kebab-name>/<kebab-name>.tsx`

The path on disk is **kebab-case** even though the `componentName` is **PascalCase** — that's the convention the engine's import resolver expects:

```tsx
// src/app/(myapp)/components/search-entity/search-entity.tsx
'use client';

import { useState } from 'react';

// EVERY UI primitive — IGRP-specific OR shadcn — imports from the design
// system. The design system re-exports the full shadcn surface (Button,
// Input, Dialog, Sheet, Popover, Card, …) themed for IGRP. NEVER reach
// for `@/components/ui/*`, `shadcn/ui`, raw Radix, or hand-rolled HTML
// for these primitives.
import {
  Input,
  Button,
  Card,
  CardContent,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@igrp/igrp-framework-react-design-system';

import { useSearchEntity } from '@/app/(myapp)/hooks/use-search-entity';

export interface SearchEntityProps {
  title?: string;
  onItemSelected?: (entity: Entity) => void;
}

export function SearchEntity({ title, onItemSelected }: SearchEntityProps) {
  const [query, setQuery] = useState('');
  const { results } = useSearchEntity(query);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">{title ?? 'Search'}</Button>
      </PopoverTrigger>
      <PopoverContent>
        <Input value={query} onChange={(e) => setQuery(e.target.value)} />
        {/* …results list… */}
      </PopoverContent>
    </Popover>
  );
}
```

Component file rules:
- **`'use client'` directive** if it uses state or browser APIs.
- **Named export** matching the `componentName` exactly (`export function SearchEntity`, not `export default`).
- **Component name MUST be PascalCase** — starts with an uppercase ASCII letter. The engine's component-detection scanner (`parseComponents`) rejects any function that starts lowercase — that includes `useSearchEntity` (hook — treated as such), `searchEntity` (typo), `updateRow` (helper), `handleClick` (event handler). Rename to `SearchEntity` and re-export.
- **Props signature MUST be a destructured object** (`{ prop1, prop2 }: SearchEntityProps`) OR a single typed argument (`(props: SearchEntityProps)`). Positional args (`(a: string, b: number) => …`) are treated as helpers and skipped — that's what keeps event handlers like `(idx: number, patch: Partial<X>) => …` from polluting the Studio palette. If your component takes no props, still declare `{}: {}` so it's picked up.
- **Props interface** exported (`SearchEntityProps`) so other consumers can type-check.
- **Only top-level declarations count.** Nested arrow functions and named functions inside the component body (`const updateRow = …`, `function Inner() { … }`) are NOT detected as separate components — even if PascalCase. This is intentional (fixed in `0.2.0-beta.21`). Keep helpers inside the component body freely.
- **Multiple components per file are fine** — declare each as a top-level `export function Xxx` / `export const Xxx = (…) => …` and each will be detected independently. Just don't nest.
- **One import source for primitives:** `@igrp/igrp-framework-react-design-system` carries IGRP components AND the full shadcn set (Button, Input, Card, Dialog, Sheet, Popover, Tabs, Tooltip, Toast, …). Do NOT import from `@/components/ui/*`, `shadcn/ui`, or raw Radix — those bypass IGRP theming and the build will mismatch.
- **Domain hooks** live in `src/app/(myapp)/hooks/use-<name>.ts` and are also registered (see C).

### C. Register in `src/app/igrp.config.ts` under the right key

```ts
export default {
  types: [...existing, "types/entity"],
  hooks: [...existing, "hooks/use-search-entity"],
  functions: [...existing],
  components: [...existing, "components/search-entity/search-entity"],
};
```

Path rules in the registry:
- **Relative to `src/app/(myapp)/`** — no leading `./`, no absolute prefix, no file extension.
- **Kebab-case** matching the folder/file layout.
- The component goes under `components`; the hook (if any) under `hooks`; the prop / row interface under `types`.

**Without registration the file is invisible to the engine** — same symptom as a missing file: yellow zebra-tape placeholder, no IDE autocomplete inside iGRP Studio.

### D. The `iconProperties` / per-prop conventions

If your custom component takes user-facing props that the JSON manifest will populate (icon names, labels, variant), declare them on the `properties` object verbatim. The engine passes them through as JSX props — so `properties.title: "Find entity"` becomes `<SearchEntity title="Find entity" />`. Any prop NOT in the engine's standard set (`commonProperties`, `iconProperties`, `dataProperties`, etc.) is forwarded raw.

### E. Prototype-context caveat

When you're building a **prototype** (the page lives under `prototype/src/app/(igrp)/(generated)/`), creating a brand-new custom component is heavier than the prototype goal warrants. Prefer primitive composition for the first iteration. Only escalate to a real custom component when:
- The same UI block recurs across ≥3 places in the prototype, OR
- The user explicitly asks for a named component ("create a `SearchEntity` widget…"), OR
- The behavior genuinely can't be expressed with `combobox` / `inputText` + `interactions`.

If you can't decide, ship the primitive composition AND mention in the chat reply (before the JSON fence) that a `SearchEntity` custom component could be extracted later if needed.

---

## Dashboard / list cell properties

When a list page or a stats grid renders without visible content (empty header row, "0" everywhere on the tiles, columns aligned but unlabeled), the cells almost always have **the wrong property name**. The engine accepts the JSON without complaining — there's no schema error — but the runtime sees missing values and renders blanks.

### Table cells (`tableTextCell`, `tableBadgeCell`, `tableHiddenCell`, `tableActionListCell`) — `properties` shape

| Prop | Required for | Notes |
|---|---|---|
| `headerTitle` | **all visible columns** | Column header label. ❌ NEVER use `title` — that's for cards. With wrong prop, the generated TSX gets no `header` value and the table renders an unlabeled column. |
| `headerType` | sortable columns | `"sortToggle"` (most common — click to cycle asc/desc), `"sortDropdown"` (multi-option), `"rowsSelect"` (checkbox column). Omit for non-sortable. |
| `dataProperties` | all data-bound columns | `{ "isVirtual": false, "isType": true }` — tells the engine this column reads from a typed row property (NOT a computed value). Without this, the engine may render `undefined`. |
| `variant` | `tableBadgeCell` only | `"solid"`, `"soft"`, `"outline"`. Default `"soft"`. |
| `currency`, `language`, `formatStyle` | `tableAmountCell` only | `currency`: `"CVE"`/`"EUR"`/`"USD"`; `formatStyle`: `"currency"`/`"decimal"`/`"percent"`. |

**Minimal correct `tableTextCell`:**

```json
{
  "id": "tabletextcell_number",
  "componentName": "tableTextCell",
  "tag": "number",
  "label": "Text Column",
  "children": [],
  "interactions": {},
  "data": {},
  "properties": {
    "headerTitle": "Number",
    "headerType": "sortToggle",
    "dataProperties": { "isVirtual": false, "isType": true },
    "commonProperties": { "generateReference": false }
  },
  "childProperties": {}
}
```

### Stats tiles — `statsCard`, NOT `infoCard`

For dashboard count tiles ("Total: 42 invoices", "Paid: 24"), use **`statsCard`**. It has native `title` + `cardVariant` + `iconProperties` + accepts a `value` data binding.

❌ **Don't use `infoCard` for count tiles.** `infoCard` is for grouped key/value displays via `sections[].items[]`. With empty `sections: []`, only the title renders and the count never shows up — exactly what's happening when "Pending: " appears with no number after it.

**Minimal correct `statsCard`:**

```json
{
  "id": "statscard_total",
  "componentName": "statsCard",
  "tag": "statsCardTotal",
  "label": "Stats Card",
  "children": [],
  "interactions": {},
  "data": {
    "value": {
      "state": { "id": "", "name": "totalCount", "type": "", "imports": [], "generate": false }
    }
  },
  "properties": {
    "title": "Total",
    "cardVariant": "primary",
    "valueSize": "2xl",
    "iconProperties": { "showIcon": true, "iconName": "Receipt", "iconVariant": "primary", "iconBackground": "rounded" },
    "commonProperties": { "generateReference": false }
  },
  "childProperties": {}
}
```

`cardVariant` enum: `primary | secondary | destructive | success | warning | info | indigo` (same enum as `colorSection` elsewhere). Map: Total → `"primary"` or `"info"`, Paid → `"success"`, Pending → `"warning"`, Overdue → `"destructive"`. Pick icons that match the domain (`Receipt`, `CheckCircle2`, `Clock`, `AlertCircle` for invoices).

### Wiring counts in the preview

Stats tiles need their count states populated. Two options:

1. **Compute in `onLoad` from `tableData`** (preferred — keeps everything in one place):
   ```
   // In page-root onLoad fnCode (commented as production stub):
   // useEffect(() => {
   //   setTotalCount(tableData.length);
   //   setPaidCount(tableData.filter(r => r.status === 'paid').length);
   //   setPendingCount(tableData.filter(r => r.status === 'pending').length);
   //   setOverdueCount(tableData.filter(r => r.status === 'overdue').length);
   // }, [tableData]);
   ```
   The Studio's preview seeder will mirror this in the auto-injected `_preview` block so the counts populate during preview.

2. **Seed the counts directly** in `<page>.mock.json` (e.g. `totalCount: 6, paidCount: 2, ...`). Simpler but goes stale if the user edits `tableData` in the mock and forgets to update the counters.

---

## Table row actions — `tableActionListCell` children

Row-level actions (the last column of a list with "View / Edit / Delete" buttons) live inside a `tableActionListCell`. Two child components are allowed, one per intent:

| Intent | Component | Trigger interaction | Use when |
|---|---|---|---|
| Open a modal / call a function | `tableLinkAction` | `interactions.action.type: "function"` with `fnCustomSet` | "Edit", "View" (in-page detail), "Reply" — anything that runs JS immediately |
| Navigate to another page | `tableLinkAction` | (no interaction) — use `properties.href` + `segments` + `params` | "View detail page", "Open report" — moves to a Next.js route |
| Confirm-then-act (destructive or state change) | `tableAlertAction` | `interactions.onClickConfirm.type: "function"` | "Delete", "Mark as paid", "Approve", "Send reminder" — anything reversible-only-with-effort |

### Row-action navigation — use Next.js slug segments, NOT query strings

When the row action navigates to a detail page (`/invoices/42`, `/entities/abc-123/children`), build the URL through `href` + `segments`, NOT through a string interpolation in `href` itself. The engine's `resolve-segment-path` walks each entry in `segments[]` and replaces `[name]` placeholders in the href with `${row.original.<tag>}`.

✅ **Correct shape — navigate to `/invoices/[id]` using the row's `id`:**

```json
"properties": {
  "labelTrigger": "View detail",
  "iconProperties": { "iconName": "Eye" },
  "variant": "ghost",
  "href": "invoices/[id]",
  "segments": [
    { "name": "[id]", "tag": "id", "context": "column" }
  ],
  "params": [],
  "commonProperties": { "generateReference": false }
}
```

Engine emits: `` href={`/invoices/${row.original.id}`} `` — the browser navigates to `/invoices/42` for the row with `id: "42"`.

✅ **Multi-segment URL — `/dossiers/[dossierId]/items/[itemId]`:**

```json
"href": "dossiers/[dossierId]/items/[itemId]",
"segments": [
  { "name": "[dossierId]", "tag": "dossierId", "context": "column" },
  { "name": "[itemId]", "tag": "id", "context": "column" }
]
```

✅ **Static segment values (no row interpolation) — `/reports/[type]` with `type="draft"`:**

```json
"href": "reports/[type]",
"segments": [{ "name": "[type]", "value": "draft" }]
```

✅ **Query parameters (rare — segments are the preferred pattern):**

```json
"href": "invoices",
"params": [
  { "name": "status", "tag": "status", "context": "column" },
  { "name": "year", "value": "2026" }
]
```

Engine emits: `` href={`/invoices?status=${row.original.status}&year=2026`} ``.

❌ **NEVER do this** — string interpolation inside the `href` itself is treated as literal text by the engine:

```json
"href": "/invoices?id=rowData.id"        // engine emits href={`/invoices?id=rowData.id`} — literal "rowData.id" string
"href": "/invoices/${row.id}"            // emits href={`/invoices/${row.id}`} — ReferenceError at runtime, `row` is not in scope of the cell's render
"href": "/invoices/{id}"                 // emits href={`/invoices/{id}`} — literal "{id}" string in URL
"href": "/invoices/[id]"  with NO segments[]   // emits href={`/invoices/[id]`} — Next.js dynamic-segment placeholder reaches the browser unfilled, page 404s
```

**`segments[i]` shape (each entry replaces one `[name]` in href):**

| Field | Type | Purpose |
|---|---|---|
| `name` | string | The placeholder in `href` (e.g. `"[id]"`, `"[uuid]"`) — include the brackets |
| `tag` | string (optional) | Row property to interpolate. With `context: "column"`, becomes `row.original.<tag>`; without, becomes plain `<tag>` (a page-level state) |
| `value` | string (optional) | Hardcoded literal — used when the segment is not row-derived |
| `context` | `"column"` for row actions, omitted for page-level | Tells the engine whether to prefix with `row.original.` |

**`params[i]` has the same shape** — produces `?name=${row.original.tag}&...`.

**The detail page must exist (or be generated alongside).** When the list page has a row action pointing to `/invoices/[id]`, the corresponding `.igrpstudio/pages/invoices_detail.json` (or wherever it lives) must:
- Declare `path: "invoices/[id]"` (matching the segment)
- Declare `args: [{ "id": "1", "name": "id", "type": "string", "isList": false, "isOptional": false, "isInterface": false, "isFunction": false, "isState": false }]`
- Receive the param via `const { id } = use(params)` (the engine writes this automatically from `args[]`)

If the detail page doesn't exist yet, mention it in the chat reply BEFORE the JSON fence so the user knows to generate it next — but still emit the row action as if the detail page is wired (the link will 404 until then, but the manifest is correct).

---

**Required properties for `tableLinkAction`:**

```json
{
  "id": "tablelinkaction_edit",
  "componentName": "tableLinkAction",
  "tag": "actionEdit",
  "label": "Link Action",
  "children": [],
  "interactions": {
    "action": {
      "type": "function",
      "function": {
        "fnCustomSet": "()=>{setOpen(!open); setCurrentItem(rowData)}",
        "type": "function",
        "fnCustomCode": { "imports": [] }
      },
      "action": {}
    }
  },
  "data": {},
  "properties": {
    "labelTrigger": "Edit",
    "iconProperties": { "iconName": "SquarePen" },
    "variant": "ghost",
    "href": "",
    "segments": [],
    "params": [],
    "commonProperties": { "generateReference": false }
  }
}
```

**Required properties for `tableAlertAction` (confirm dialog):**

```json
{
  "id": "tablealertaction_markpaid",
  "componentName": "tableAlertAction",
  "tag": "actionMarkPaid",
  "label": "Alert Action",
  "children": [],
  "interactions": {
    "onClickConfirm": {
      "type": "function",
      "function": {
        "fnCustomSet": "()=>markAsPaid(rowData.id)",
        "fnCustomCode": { "imports": [] },
        "type": "function"
      },
      "action": {}
    }
  },
  "data": {},
  "properties": {
    "labelTrigger": "Mark as paid",
    "iconProperties": { "iconName": "Check" },
    "variant": "ghost",
    "title": "Mark as paid",
    "content": "Confirm marking this invoice as paid?",
    "showCancel": true,
    "labelCancel": "Cancel",
    "variantCancel": "ghost",
    "showConfirm": true,
    "labelConfirm": "Confirm",
    "variantConfirm": "default",
    "segments": [],
    "params": [],
    "commonProperties": { "generateReference": false }
  }
}
```

**Common mistakes (each breaks the row action silently or at runtime):**

- ❌ `properties.content: "Edit"` on a `tableLinkAction` — `content` is the alert-dialog question on `tableAlertAction`, NOT the button label. Use `labelTrigger`. Putting it on a link action makes the generated JSX render `<IGRPDataTableButtonLink labelTrigger="">Edit</IGRPDataTableButtonLink>` — empty trigger prop, text as JSX children, often causes `React.Children.only` crashes downstream.
- ❌ `interactions: {}` — without either `action` (link) or `onClickConfirm` (alert), the click is a no-op. The button renders but does nothing.
- ❌ Missing `iconProperties.iconName` — the action loses its visual cue and looks like a bare text link in a row of icons.
- ❌ Using `tableLinkAction` for destructive ops (delete, mark paid, send) without a confirm step — surface area for accidental clicks. Use `tableAlertAction`.

**Icon map for common row actions** (all `iconProperties.iconName` values are `lucide-react` icon names):

| Intent | Icon |
|---|---|
| View / open detail page | `Eye` (read-only) or `ExternalLink` (opens elsewhere) |
| Edit / open form modal | `SquarePen` |
| Delete / remove | `Trash2` (use `variantConfirm: "destructive"`) |
| Approve / accept / mark done | `Check`, `CircleCheck` |
| Reject / cancel | `X`, `CircleX` |
| Send (mail / notification) | `Send`, `Mail` |
| Download | `Download` |
| Print | `Printer` |
| Toggle status | `ArrowRightLeft`, `RefreshCw` |
| More menu | `MoreVertical`, `MoreHorizontal` (use a `dropdownMenu` for >3 actions instead of stacking) |

**When the row has more than 3 actions:** swap the stack for a single `tableLinkAction` with `iconName: "MoreVertical"` that opens a `dropdownMenu` (or `popover`) listing the actions — keeps the row visually clean and matches IGRP convention.

---

## Engine type-definition shape

The engine validates `types[]` with `additionalProperties: false` and the wrapping error message is misleading (`"The types attribute must be an array of valid type definition configuration."`). Hit this rule once and you'll re-emit the whole file — bake it in upfront.

**`types[i]` (one entry per `<table>`/`<form>` component):**

| Prop | Required | Type | Notes |
|---|---|---|---|
| `name` | ✅ | string | Uppercase first char (`Table1`, `FormCriarUtente`) |
| `path` | ✅ | string | Empty string `""` for new types; path to existing TS interface when reusing |
| `fields` | ✅ | array | See below |
| `componentId` | optional | string | Mirrors the table/form `id` |
| `tags` | optional | string[] | |
| `isMainType` | optional | boolean | |
| `isEnum` | optional | boolean | |
| `definitionType` | optional | `"zod-object"`/`"json-schema"`/`"auto"` | |
| `customInstanceName`/`customInitInstanceName` | optional | string | |

**`types[i].fields[j]` (one entry per cell/input under the table/form):**

| Prop | Required | Type | Notes |
|---|---|---|---|
| `name` | ✅ | string | Property name (matches API JSON key) |
| `componentId` | ✅ | string | Mirrors the cell/input `id` |
| `type` | ✅ | string | `string`/`number`/`boolean`/`date`/`file`/`object` (lowercase) |
| `required` | ✅ | boolean | Hidden fields are always `false` |
| `nullable` | optional | boolean | |
| `isList` | optional | boolean | |
| `isKey` | optional | boolean | |
| `validation` | optional | object | |
| `defaultValue` | optional | string | Always a string, even for numbers/booleans (`"0"`, `"false"`) |
| `fields` | optional | array | Nested for `type: "object"` |

**❌ Forbidden inside `types[].fields[]`** (these belong to `args[]`/`arguments[]`, NOT field definitions — `additionalProperties: false` rejects them):

- `isOptional`, `isInterface`, `isFunction`, `isState`, `functionParameters`, `id`, `imports`

If your `args[]` has `{ id: "1", name: "uuid", type: "string", isList: false, isOptional: false, ... }`, do NOT copy that shape into `types[].fields[]`. Field entries are the leaner shape above.

**`types[].fields[].name` MUST equal the corresponding cell `tag`.** The engine derives the data-table column id from each cell's `tag`, and the page does `row.getValue(<tag>)` at runtime. If the field is `name: "number"` but the cell is `tag: "cellNumber"`, the lookup `row.getValue('cellNumber')` resolves against mock/backend data keyed by `number` and returns `undefined`. Always make field name = cell tag = data property key, e.g.:

```json
// type field
{ "componentId": "tabletextcell_number", "name": "number", "type": "string", "required": false, "isList": false }
// cell
{ "id": "tabletextcell_number", "componentName": "tableTextCell", "tag": "number", "label": "Number", ... }
```

✅ tag `number` ⇄ field name `number` ⇄ `row.getValue('number')`

❌ tag `cellNumber` while field name is `number` → column reads `undefined` from rows.

---

### `states[].defaultValue` — the JSON value IS the raw payload, NOT a TS source string

The engine's `resolveStateDefault` runs three rules on `states[i].defaultValue`:

1. **If the value LOOKS like a TS literal already** — `null`, `undefined`, `true`, `false`, a number, `[]`, `{}`, or any string starting with `[`/`{` — it passes through **unwrapped** (e.g. `defaultValue: "[]"` → `useState<…>([])`).
2. **If the value matches an ISO datetime** (`2026-01-15T00:00:00Z`) — it wraps as `new Date("…")`.
3. **Otherwise**, when `type: "string"`, the value is wrapped in **backticks** and double-quotes are escaped: `defaultValue: "Hello"` → `` useState<string>(`Hello`) ``. Critically, an EMPTY backtick template ` `` ` IS the empty string — so `defaultValue: ""` correctly produces an empty-string initial state.

**The JSON value is the raw content** — DO NOT wrap it in extra quotes (single OR double) trying to "be valid TS".

| Initial state value | `defaultValue` JSON | Generated TS |
|---|---|---|
| empty string `""` | `""` ✅ (empty JSON string) | `` useState<string>(``) `` — empty string |
| string `"All"` | `"All"` ✅ | `` useState<string>(`All`) `` — "All" |
| string with a quote in it | `'It''s OK'` is fine; the engine escapes `"` to `\\"` automatically | `` useState<string>(`It's OK`) `` |
| number 0 | `"0"` ✅ | `useState<number>(0)` |
| number 42 | `"42"` ✅ | `useState<number>(42)` |
| boolean false | `"false"` ✅ | `useState<boolean>(false)` |
| `null` | `"null"` ✅ | `useState<…>(null)` |
| empty array | `"[]"` ✅ | `useState<…>([])` |
| empty object | `"{}"` ✅ | `useState<…>({})` |
| array literal | `"[1,2,3]"` ✅ | `useState<…>([1,2,3])` |
| reference to an init function | `"initFormData"` ✅ | `` useState<…>(`initFormData`) `` ⚠️ — backtick-wrapped as STRING, not a function reference. If you need a real identifier, set `defaultValue: ""` here and assign inside `onLoad` instead. |
| ❌ empty string with `"''"` | `"''"` | `` useState<string>(`''`) `` — state starts as the **2 literal chars `'` `'`**, NOT empty |
| ❌ "All" with `"'All'"` | `"'All'"` | `` useState<string>(`'All'`) `` — state starts as `'All'` (with surrounding apostrophes) |
| ❌ "All" with `"\"All\""` | `"\"All\""` | `` useState<string>(`"All"`) `` — state starts as `"All"` (with surrounding quotes) |

**Rule of thumb:** the JSON `defaultValue` string carries **the value, not the syntax**. If you want the variable to start as `"All"`, the JSON says `"All"`. If you want empty string, the JSON says `""`. The engine adds the TS syntax around it. The only exception is when you genuinely need TS literal syntax (numbers, booleans, `[]`, `{}`, etc.) — pass that verbatim since the engine detects and passes them through.

---

**Minimum valid `types[]` for a table+form page:**

```json
"types": [
  {
    "componentId": "table_t1",
    "name": "Table1",
    "path": "",
    "fields": [
      {"componentId": "tabletextcell_nome", "name": "nomeTbl", "type": "string", "required": false, "defaultValue": "", "isList": false}
    ]
  },
  {
    "componentId": "form_f1",
    "name": "Form1",
    "path": "",
    "fields": [
      {"componentId": "inputtext_nome", "name": "nome", "type": "string", "required": true, "defaultValue": "", "isList": false}
    ]
  }
]
```

---

## Engine naming constraints

The engine validates `applicationName`, `pageName`, `name`, `componentName`, `parentPageName` and `description` with strict character classes. The error message it emits is generic (`"X must only contain letters and must not have special characters"`) and doesn't say what's allowed — use this table BEFORE emitting JSON, not after a failed generation:

| Field | Allowed | Notes |
|---|---|---|
| `applicationName` | ASCII letters + hyphen (`-`) | No digits, no spaces, no underscores |
| `pageName` / `name` / `componentName` / `parentPageName` | ASCII letters only | No digits, no spaces, no accents, no underscores, no hyphens |
| `description` | ASCII letters + digits + ASCII spaces | No accents, no punctuation, no Unicode, no newlines |

**Transliteration rule for Portuguese input.** When the user request is in Portuguese (or any language with accents/punctuation), normalize before emitting:

- `ã ç é í ó ú á ê â ô` → `a c e i o u a e a o` (drop diacritics).
- For `pageName` / `name` / `componentName`: also strip digits, spaces, hyphens, underscores. Use camelCase: `"Página de clientes"` → `"paginaClientes"`, `"gestão-users"` → `"gestaoUsers"`.
- For `description`: strip every punctuation char (`, . : ; ( ) [ ] / \ - _ " '`). Keep digits and spaces. `"Página de clientes (gestão)"` → `"Pagina de clientes gestao"`, `"List - filtered v2"` → `"List filtered v2"`.

**Quick examples:**

| User wants | ❌ Reject | ✅ Emit |
|---|---|---|
| Invoice list page | `pageName: "invoice-list"`, `description: "List of invoices"` | `pageName: "invoiceList"`, `description: "List of invoices"` |
| Página de clientes | `pageName: "clientes1"`, `description: "Página de clientes"` | `pageName: "clientes"`, `description: "Pagina de clientes"` |
| Users admin | `description: "Users (admin)"` | `description: "Users admin"` |

---

## Validation checklist — run through before finishing

Before declaring a JSON complete, verify:

- [ ] JSON parses as valid JSON (single line, no trailing commas)
- [ ] All naming/description fields pass the [Engine naming constraints](#engine-naming-constraints) below
- [ ] Every `id` in the file is unique (including component ids, state ids, function ids)
- [ ] Every `tag` on a component is unique
- [ ] Every `args[].id` and `arguments[].id` is a **string** (`"1"` not `1`)
- [ ] Every `form` component has `dataType: "FormXxx"` AND a matching entry in `types[]` with the SAME uppercase name
- [ ] Every `table` component has `dataType: "TableXxx"` AND a matching entry in `types[]` with the SAME uppercase name
- [ ] All `types[].name` values start with an **uppercase letter** (they become TS type identifiers)
- [ ] Every `combobox` with dynamic options has both `value.state` and `options.state` bindings
- [ ] All `componentName` values are in the supported list (see [Component reference](#component-reference))
- [ ] No deprecated components used (`input`, `datePicker`, `tableLinkButton`, etc.)
- [ ] onLoad fnCode doesn't re-declare `router` or `igrpToast`
- [ ] State setters in onLoad are wrapped in `useEffect`
- [ ] If any `router.push()` is used in code: either a `type:navigate` button exists on the page OR `useRouter` is imported + `const router = useRouter()` is in onLoad
- [ ] All static page-to-page navigation uses `type:"navigate"` with `navigate.path` — not `type:"function"` with `router.push(...)` in `fnCustomSet`
- [ ] `useRouter` import is absent from onLoad imports when the page already has at least one `type:"navigate"` interaction (engine auto-imports)
- [ ] Date fields of TS type `date` (Spring `LocalDate`) are normalized to `YYYY-MM-DD` in `handleFormSubmit` before send (e.g. `d instanceof Date ? d.toISOString().slice(0,10) : String(d).slice(0,10)`) — sending ISO datetime (`...T00:00:00.000Z`) breaks Spring `LocalDate` parsing
- [ ] Write endpoints that return JSON from the backend do NOT set `isTextResponse: true` in `callApi` (only set it when the backend actually returns text)
- [ ] List hooks send pagination params (`pageNumber`/`pageSize` or backend's `pagina`/`tamanho`) with sensible defaults (e.g. 0 / 50) — NEVER call a list endpoint without paging when the table may return hundreds of rows
- [ ] Filter parameters are sent as `undefined` when unset (NOT sentinel values like `0`, `'_'`, `'1900-01-01'`) — the backend would misinterpret sentinels as real filter values; `buildQueryParam` drops `undefined`/`null`/`""` automatically, so unset filters simply don't appear on the query string. If the backend rejects the absence with `@NotBlank`/`@NotNull` it's a backend bug — raise with the backend team
- [ ] Form submit payload keys **exactly match** the backend DTO field names. When form input `tag`s had to be renamed (e.g. `montanteFld` to avoid duplicate-tag conflict with a table column), the `handleFormSubmit` MUST re-map those tags to the real API names in the payload (e.g. `{ montante: values.montanteFld, ... }`). NEVER `...values` spread blindly when the form uses renamed tags — the renamed keys will leak into the request body and the backend will either reject the request or ignore the data
- [ ] Modal dialog forms have a valid `dataType` (empty string causes `_def` runtime error)
- [ ] `tableAlertAction` is used instead of `tableAlertDropdownItem` for simple row confirmations
- [ ] Table row `tag` fields match the actual API response keys
- [ ] Hidden ID cells (`tableHiddenCell`) are present for every action that needs row identity
- [ ] **Every new file created under `src/app/(myapp)/...` is registered in `src/app/igrp.config.ts`** under the matching key (`types`/`functions`/`actions`/`components`) — see "Registry" section

---

## Quick fixes for common errors

| Error / symptom | Root cause | Fix |
|---|---|---|
| `Cannot use 'in' operator to search for '_def' in undefined` | Form has no schema | Set `dataType: "FormXxx"` on the form + add to `types[]` |
| `Identifier 'router' has already been declared` | `const router = useRouter()` in onLoad AND page has `type:navigate` button | Remove from onLoad fnCode — engine auto-declares |
| `Identifier 'useIGRPToast' has already been declared` | `useIGRPToast` imported in function imports | Remove — always auto-imported |
| `Identifier 'refreshList' has already been declared` | Function name in `functions[]` collides with destructured hook result | Rename one (e.g. destructure as `doRefetch`) |
| Input shows the literal text `''` / modal title shows `'Create X'` with quotes | State/field `defaultValue` is `"''"` or `"'Create X'"` — the CLI engine wraps `defaultValue` in a template literal, so the quotes become literal | Use `""` for empty (+ `isOptional: true`) and `"Create X"` (no surrounding quotes) for literals. See troubleshooting.md → "CLI engine gotchas" |
| `Cannot find name 'setSelectMyComboValue'. Did you mean 'setSelectmyComboValue'?` | Hand-written onLoad/function references a combobox state with capitalized casing; the engine emits `select<tag>Value` using the tag's **original** casing | Match the exact generated name (no capitalization after `select`) — e.g. tag `myCombo` → `setSelectmyComboValue` |
| `Type 'undefined' is not assignable to type 'number' \| 'Date'` in `initForm…` | Engine emits `initForm: z.infer<T>` (not `Partial<>`); a **required** number/date field with an empty `defaultValue` becomes `undefined` | Give the required field a valid default in `types[].fields[]`: `number → "0"`, `date → "new Date()"` (optional fields may stay empty) |
| `Type 'number' is not assignable to type 'string'` on a `placeholder` | `inputNumber` / `inputText[type=number]` — engine emits the `placeholder` as a number literal | Remove `placeholder` from numeric inputs |
| `X is not defined` at runtime (e.g. router, a hook) | Missing import in onLoad imports OR hook not invoked in onLoad | Add the import + invoke the hook in onLoad fnCode |
| Combobox empty, no options | `setSelectXOptions` called at body level (infinite re-render); OR options hook not wired in onLoad | Wrap in useEffect; ensure hook is called and state setter runs after load |
| Component value binding shows up but TypeScript can't infer the prop type | `data.<prop>.value.code` set without `type` field | Add `"type": "string" \| "boolean" \| "number" \| ...` next to `code` (see SKILL.md "value bindings") |
| Stray `;` after every JSX element in generated TSX (even with correct component-`id` prefixes) | `states[].id` not following `state_<6char>` convention, OR form's `defaultValues.state.id` not a 10-char hash | Rename top-level state ids to `state_<6char>`; rename form `defaultValues.state.id` to a unique 10-char alphanumeric |
| Stray `;` after a single specific element (e.g. `</IGRPButton>;`) while siblings are clean | The component node is missing a "trivial" structural field that the engine expects (e.g. `"style": {}` on `button`, `"type": ""` on `tabsItem`, `className`/`date` defaults on `pdfViewer`) | Diff your node against the canonical reference (`P1.2.10`/`P1.2.11`) — add any keys present there that you omitted, even if they look empty/redundant |
| Action button missing from row | Using deprecated cell like `tableLinkButton` | Migrate to `tableLinkAction` inside a `tableActionListCell` |
| Table data empty | `tag` on column doesn't match API key OR type name mismatch | Align `tag` to API response shape |
| JSON parse error mid-file | Unescaped quotes in function code; multi-line fnCode lost newlines | Use `\n` inside strings; keep the JSON single-line |

---

## Menu integration (`src/temp/menus/menus.ts`)

When creating a new page, register it in the menu:

```ts
{
  id: <next free id>,
  code: generateCode("My Page"),
  name: "My Page",
  type: "MENU_PAGE",           // "FOLDER" for sub-groups, "GROUP" for top-level
  position: 0,
  icon: "",                     // Lucide icon name, empty for children
  status: "ACTIVE",
  target: "_self",
  url: null,
  pageSlug: "my-page",          // MUST match page JSON "path" (without route-group parens)
  parentCode: "PARAMETRIZACAO", // or "null" for root groups
  applicationCode: "CORE",
  roles: [],
}
```

**Critical:** `pageSlug` should match what appears in the URL. For `path: "(parametrizacao)/ups"`, slug is `"ups"`. For `path: "caixa/dias"`, slug is `"caixa/dias"` (keep the slashes).

---

## 🔑 Registry — `src/app/igrp.config.ts` (CRITICAL: register everything created under `(myapp)`)

**Every** type, hook, function, and React component you create under `src/app/(myapp)/...` MUST be added to the registry at [`src/app/igrp.config.ts`](../../../src/app/igrp.config.ts). The iGRP engine + tooling reads this registry to:
- Locate metadata (interfaces, function signatures, component props) for code automation
- Expose the entries to the iGRP Studio when authoring JSON
- Surface build warnings if registered files don't exist

**Without registration, the engine may not see the file even if it's on disk** — same class of issue as the `id` prefix convention for custom components. Symptoms: yellow zebra-tape placeholder for unregistered React components; missing options for hooks; incomplete metadata in iGRP Studio.

### Shape

```ts
export default {
  types: [...],         // TS interfaces / type aliases
  actions: [...],       // server actions
  functions: [...],     // hooks + plain functions
  components: [...],    // React components
};
```

### Path rules

- All paths are relative to `src/app/(myapp)`
- **No file extensions** (`.ts`, `.tsx`)
- **No leading `./` or absolute prefixes**
- File MUST exist under `src/app/(myapp)/...` (not in `src/app/(igrp)/`, not in `src/components/`)

| ✅ Correct | ❌ Wrong |
|---|---|
| `"hooks/use-entity"` | `"./hooks/use-entity.ts"` |
| `"components/search/search-entity"` | `"src/app/(myapp)/components/search/search-entity"` |
| `"process/use-process-3.2.7"` | `"process/use-process-3.2.7.tsx"` |
| `"types/entity"` | `"@/types/entity"` |

### When to register

Register the file in the **same turn** you create it. Categorise:

| Path under `(myapp)/` | Registry key |
|---|---|
| `types/...` | `types` |
| `hooks/...`, `functions/...`, `lib/...`, `process/use-process-X.Y.Z.ts` | `functions` |
| `components/...` | `components` |
| `server/actions/...` | `actions` |

### Verification before declaring a task done

```bash
# Find files not in registry
diff <(find src/app/\(myapp\) -name "*.ts" -o -name "*.tsx" | grep -v ".test." | sort) \
     <(jq -r '[.types, .functions, .actions, .components] | flatten | .[]' src/app/igrp.config.ts | sort)
```

(or just open `igrp.config.ts` and visually scan)

## Engine registry lifecycle (Studio integration only)

These notes are relevant only if you're wiring the engine into a host tool (e.g. iGRP Studio itself). If you're authoring JSON manifests, skip this section.

The engine keeps a **process-global component registry** that accumulates every `registerComponents(config)` call — including custom components registered from opened projects. Without an explicit reset, the palette leaks components across project switches.

**API added in `0.2.0-beta.20`:**

```ts
import * as engine from '@igrp/igrp-studio-nextjs-engine';

// once at startup
await engine.initComponents();
engine.registerComponents(projectAConfig);

// on project switch — fast: only drops non-built-ins
engine.resetComponents();
engine.registerComponents(projectBConfig);

// nuke-all escape hatch (rare) — requires initComponents() before rendering
engine.clearComponents();
```

- `resetComponents()` drops custom / app-registered entries only. Built-ins stay, and no expensive re-registration runs.
- `clearComponents()` drops everything (built-ins + custom); must be followed by `initComponents()` before generating anything.
- Both mutate the internal `registry` object in place — the exported `registry` reference stays valid across calls.
- If `initComponents()` never ran, `resetComponents()` is a no-op (no baseline to preserve). Always init first.

**JSON authoring is unaffected** — the manifests you write don't call these APIs; only the host tool does.

## File layout reference

```
.igrpstudio/
  baseApp.json
  pages/<page>.json           # type: "page"
  components/<name>.json      # type: "component"
  process/<step>.json         # type: "processStep"

src/app/(igrp)/(generated)/   # auto-generated TSX — DO NOT edit by hand
src/app/(myapp)/              # hand-written application code
  hooks/                      # React Query hooks used by onLoad fnCode
  functions/                  # plain TS functions used by JSON interactions
  types/                      # TS interfaces referenced in JSON types[]
  lib/                        # validators, utils
  components/                 # custom React components referenced by componentName
src/app/api/                  # Next.js API routes (proxy to backend)
src/temp/menus/menus.ts       # menu registration
```

---

## Working rhythm for tasks

1. **Understand the target**: is it a list page, form page, modal, processStep, or simple component?
2. **Pick the closest reference** in `.igrpstudio/pages/`: a list-with-filters page, a parametrization list+modal page, a form component that uses a search widget — whatever most resembles the target.
3. **Copy its skeleton** and adapt: rename ids/tags, update `types[]`, update states, adapt onLoad fnCode.
4. **Wire data sources**: create/reuse hooks in `src/app/(myapp)/hooks/` if needed; add Next API routes in `src/app/api/` if proxying a new backend endpoint.
5. **Run the validation checklist** above.
6. **Generate + verify via the CLI loop** — see "Generating the page — CLI + verify loop" below. Author JSON → `igrp gen page` → `npx tsc --noEmit` → if the generated TSX has errors, fix the **JSON** and regenerate. Do NOT depend on the user opening the Studio one page at a time.
7. **Register in the menu** (`src/temp/menus/menus.ts`) if it's a user-facing page.

**Never edit generated TSX under `src/app/(igrp)/(generated)/` as a first move.** Fix the JSON and regenerate via the CLI (below). Only patch TSX directly as a temporary workaround if the user confirms they can't regenerate immediately and understands it'll be overwritten.

---

## Generating the page — CLI + verify loop (REQUIRED)

After authoring or editing any `.igrpstudio/**` JSON, generate the TSX with the **iGRP CLI** (`igrp generate`, alias `igrp gen`) — it invokes the *same* `@igrp/igrp-studio-nextjs-engine` pipeline the Studio runs on "Page Builder save". This is the standard rhythm: **generate JSON → generate page (CLI) → verify TSX → if errors, fix JSON and regenerate.** Do NOT hand-write TSX and do NOT make the user regenerate page-by-page in the Studio.

The loop for every JSON you touch:

1. **Author/edit the JSON** (`.igrpstudio/pages/<pageName>.json`, `components/<name>.json`, or `process/<step>.json`).
2. **Generate via CLI** — writes TSX into `src/app/(igrp)/(generated)/…` and re-persists the manifest (`--project .` auto-detects the `.igrpstudio/` marker):
   ```bash
   igrp gen page         --manifest .igrpstudio/pages/<pageName>.json --project . --quiet
   igrp gen component    --manifest .igrpstudio/components/<name>.json --project . --quiet
   igrp gen process-step --manifest .igrpstudio/process/<step>.json    --project . --quiet
   ```
   (The `--dry-run` summary line prints a misleading `app/pages/...` path — ignore it; the real write lands in `src/app/(igrp)/(generated)/…`.)
3. **Verify the generated TSX**: `npx tsc --noEmit -p .` and grep the output for the page's `(generated)/` path.
4. **If the generated TSX has errors → fix the JSON (never the .tsx) and go back to step 2.** Loop until tsc is clean for that page. The `.tsx` is overwritten on every gen, so hand-edits are always lost.

**Batching many pages (zsh):** zsh does NOT word-split an unquoted `$VAR` — use `while IFS= read -r f; do igrp gen page --manifest "$f" --project . --quiet; done < list.txt`, never `for f in $FILES`.

**Engine parity:** `igrp --version` ships a specific engine build. The repo can contain older pages generated by a previous engine; regenerating them **surfaces latent incompatibilities** that any current-engine regen (CLI or Studio) would hit — fix them forward, don't revert. See `troubleshooting.md` → "CLI engine gotchas (`igrp gen`)" for the concrete divergences (state-default wrapping, combobox casing, non-`Partial` initForm, numeric placeholders) and their JSON fixes.
