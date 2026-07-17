# Project-specific conventions

Concrete conventions and primitives that emerged in a production reference iGRP project. Treat them as **patterns to mirror**, not as fixed identities — names like `useMultipleComboBoxOptions`, `callApi`, `Search<Entity>` are illustrative of the **shape** of solutions a mature iGRP frontend converges on (centralized combobox loader, proxied API caller, search-with-dropdown component). Adapt freely to your project's domain.

---

## Combobox options — load from API via `useMultipleComboBoxOptions`

**Don't hardcode combobox options or leave them as empty `[]` arrays in process hooks.** This project has a centralised combobox loader that calls `/api/v1/combobox/<type>` endpoints and a typed enum of supported types in [`src/app/(myapp)/types/combobox.ts`](../../../src/app/(myapp)/types/combobox.ts).

### Pattern (from `use-process-<family>-shared.ts` — canonical reference)

```ts
import { useMultipleComboBoxOptions } from "../hooks/use-combobox-options";

const shouldLoadOptions = step === "pedido";
const { options, isLoading } = useMultipleComboBoxOptions(
  shouldLoadOptions
    ? [
        { type: "direitos" },
        { type: "entity-subtypes" },
        { type: "tipos-documento-inscricao" },
        { type: "tipos-contacto" },
        { type: "operadoras" },
        { type: "tipos-documento-processo", params: { codigoProcesso: PROCESS_KEY } },
      ]
    : [],
);

return {
  optionsTipoSubsidioLuto: (options["direitos"] || []).filter(o => o.value === "SF" || o.value === "SUBL"),
  optionsEntitySubType:        options["entity-subtypes"] || [],
  optionsTipoContacto:      options["tipos-contacto"] || [],
  optionsOperadora:         options["operadoras"] || [],
  // ...
  isLoading,
};
```

The step JSON's `onLoad.fnCode` then destructures `optionsXxx` from the hook and seeds combobox state via `setSelect<tag>Options(optionsXxx || [])` inside a `useEffect` keyed on `[isLoading]`.

### Available `ComboBoxType` values

The typed enum in `src/app/(myapp)/types/combobox.ts` catalogues every combobox endpoint the project exposes (typical entries: entity-type enums, document-type enums, address-type enums, geographic-region lookups, status enums, currency/payment-form enums, motive/reason lookups, etc.). Add a new entry there when you need a new endpoint; the type gives IDE autocomplete on the `type` field of `useMultipleComboBoxOptions` / `useComboBoxOptions`.

### Two parametrized combobox types

Some combobox endpoints take extra parameters — the enum entry declares this:

```ts
{ type: "documents-for-process", params: { processCode: "<processKey>" } }
{ type: "reasons",                params: { group: "<group>" } }
```

### `useComboBoxOptions` vs `useParametrizacaoOptions` — when each

The project has TWO different sources for combobox data:

| Hook | Endpoint | Option `value` is | Use when |
|---|---|---|---|
| `useComboBoxOptions(type)` / `useMultipleComboBoxOptions` | `/api/v1/combobox/<type>` | typically the **code** (`"SF"`, `"BI"`, etc.) | combobox enum-like lookups (sexo, tipos-contacto, estados) |
| `useParametrizacaoOptions(routeName)` / `useMultipleParametrizacaoOptions` | `/api/v1/parameterizacoes/<routeName>` | the **id** (`"1"`, `"2"`, ...) | parametrizações editáveis (direitos, regimes, motivos, taxas) — id is what the API expects when submitting forms |

**The DTO field name hints at which to use:** if the DTO field is `<thing>Id: number`, the option value must be a numeric id ⇒ use `useParametrizacaoOptions`. If the DTO field is `<thing>: string` (codes/enums), use `useComboBoxOptions`.

Example — `SubsidioLutoDTO.tipoSubsidioId: number` → must use `useParametrizacaoOptions("direitos")` so the option value is the id, not the code "SF"/"SUBL".

### Filtering parametrização by `codigo`

`mapParametrizacaoToOptions` only keeps `{ value, label }`. To filter by `codigo` (or any other field — note: parametrização APIs in this ecosystem typically use Portuguese `codigo`, not English `code`), grab `rawData?.content` and filter+map manually:

```ts
const { rawData, isLoading } = useParametrizacaoOptions("direitos", { enabled });

const filtered = ((rawData as any)?.content || []).filter(
  (it: any) => it.codigo === "SF" || it.codigo === "SUBL"
);
const options: IGRPOptionsProps[] = filtered.map((it: any) => ({
  value: String(it.id),
  label: it.label ?? it.nome ?? it.descricao ?? it.codigo,
}));
```

When the validation needs the codigo (e.g. "se for SUBL, parentesco é obrigatório"), keep an `id → codigo` map in a ref so the validator closure can look it up:

```ts
const codigoByIdRef = useRef<Record<string, string>>({});
useEffect(() => {
  codigoByIdRef.current = Object.fromEntries(
    filtered.map((it: any) => [String(it.id), it.codigo ?? ""])
  );
}, [filtered]);
// validator: codigoByIdRef.current[String(formData.tipoSubsidioId)] === "SUBL"
```

### Combobox option mapper — tolerate inconsistent backend field names

Different backend endpoints return option-shaped payloads with **wildly different field names**: some use `value`/`label`, others `code`/`description`, Portuguese-backed APIs return `codigo`/`descricao`/`designacao`/`nome`, generic ones `id`/`valor`. Hardcoding any one of these will silently break the moment you point the same combobox at a different endpoint.

The canonical mapper tries multiple field names in priority order and sorts alphabetically:

```ts
type RawComboBoxItem = Record<string, unknown>;

export function mapComboBoxToOptions(items: RawComboBoxItem[]): IGRPOptionsProps[] {
  return items
    .map((it) => {
      const rawValue =
        it.value ?? it.code ?? it.codigo ?? it.valor ?? it.id ?? "";
      const rawLabel =
        it.label ?? it.description ?? it.descricao ?? it.designacao ?? it.nome ?? String(rawValue);
      return { value: String(rawValue), label: String(rawLabel) };
    })
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
}
```

Rules:
- **Always coerce `value` to string** — comboboxes feed `<select>` markup, which requires strings.
- **Sort by label** — alphabetic order is the only deterministic UI the user can scan; payload order is rarely meaningful.
- **Don't pre-filter inside the mapper** — keep the mapper pure; filter in the calling hook (see `Filtering parametrização by codigo` above).

Apply this mapper to **any** raw backend list before binding it to a `combobox` or `select`. Avoids the "combobox shows blank labels" / "value is `undefined`" class of bugs.

### When the type doesn't exist yet

Some combos may need data the API doesn't expose yet (e.g. `grauParentesco` for the funeral subsidy). Three valid approaches:
1. Add the new type to `ComboBoxType` enum + extend the backend `/api/v1/combobox/<type>` endpoint
2. Use `useEnumOptions(<EnumType>)` if the data is a fixed enum (see `use-enum-options.ts`)
3. Temporary fallback: return `[] as IGRPOptionsProps[]` from the hook with a `// TODO: backend type` comment, plus a note in the SPEC §"Pending input"

Never hardcode option arrays inline (e.g. `[{ value: "MAIL", label: "Email" }, ...]`) — even for fixed enums like `tipoContacto`, use `useEnumOptions("TipoContacto")` or the `tipos-contacto` combobox type so changes propagate from one source.

### Per-entity subset combobox — derive from the picked entity, NOT global parametrização

When a process step has a search widget (`Search<Entity>`) followed by a combobox whose valid options depend on **the specific entity that was picked** (typical example: `<Entity>` has a nested array of related sub-types, and only that subset is valid for the current entity), the combobox options MUST come from the search result — never from the global parametrização endpoint as a fallback.

**Why**: each entity has its own subset of valid sub-types (an entity may be classified as A + B but not C, while another is B + D). The global parametrização lists every possible sub-type in the system, so using it as the combobox source lets the user select something that's invalid for the current entity, and the backend rejects on submit.

**Pattern in JSON `onLoad` fnCode**:
```ts
useEffect(() => {
  const subtypes = (currentEntity?.subTypes || []) as Array<{
    id: number | string; code?: string; description?: string;
  }>;
  const opts = subtypes.map((s) => ({
    value: String(s.id),
    label: s.description ?? s.code ?? String(s.id),
  }));
  setSelectsubTypeIdOptions(opts);
  // Reset selection when the entity changes
  setSelectsubTypeIdValue('');
  formform1Ref.current?.setValue('subTypeId', 0);
}, [currentEntity]);
```

**Hook**: keep a parallel global list from `useParametrizacaoOptions("<sub-type-enum>")` ONLY for **label resolution** in card-detail snapshots on downstream steps where `currentEntity` is no longer in memory — never as the combobox source. The labels match because both arrays describe the same domain enum.

**Initial render** (before the user has searched): set the options to `[]`. The combobox stays empty with a helpful placeholder until a search result arrives. Empty + placeholder is far better than a misleading global list.

---

## Backend API calls — go through the Next.js proxy, not the gateway directly

**`callApi` from the frontend never calls the backend gateway URL directly.** Always call a Next.js route handler under `src/app/api/...` that proxies to the gateway via `callGateway`. Two reasons:
- The gateway URL is server-only env (`BACKEND_API_URL`); the browser shouldn't see it
- Auth headers (access token) are injected server-side inside `callGateway`

### Frontend path = backend path **without `/v1/`**

Backend exposes `/api/v1/<x>`. Frontend calls `/api/<x>`. The `/v1` prefix lives in `BACKEND_API_URL` (set on the server). The Next.js proxy forwards `${BACKEND_API_URL}${path}` — it doesn't strip or add anything.

| Backend endpoint | Frontend `callApi(...)` | Next.js route file |
|---|---|---|
| `/api/v1/search/<entity>` | `/api/search/<entity>` | `src/app/api/search/[...source]/route.ts` (catch-all) |
| `/api/v1/<module>/<resource>` | `/api/<module>/<resource>` | `src/app/api/<module>/<resource>/route.ts` |
| `/api/v1/<module>/<parent>/{id}/<child>` | `/api/<module>/<parent>/{id}/<child>` | `src/app/api/<module>/<parent>/[id]/<child>/route.ts` |

### Two proxy patterns

**Catch-all (preferred when many endpoints share the same prefix):** e.g. `src/app/api/search/[...source]/route.ts` — forwards any `/api/search/<X>` to `${API_URL}/search/<X>`. New search endpoints work automatically without a new route file.

**Specific route (preferred for typed handlers, validation, or POST bodies):** e.g. `src/app/api/<module>/<parent>/[id]/<child>/route.ts`. Boilerplate:

```ts
import { type NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error-handler";
import { callGateway } from "@/lib/api-gateway";

const API_URL = process.env.BACKEND_API_URL || "";
const API_ENDPOINT = "/prestacoes/<your-path>";

export async function GET(req: NextRequest) {
  try {
    if (!API_URL) return NextResponse.json({ message: "...not configured" }, { status: 500 });
    const queryString = req.nextUrl.search;
    const response = await callGateway<YourResponseType>(
      `${API_URL}${API_ENDPOINT}${queryString}`,
      { method: "GET" },
    );
    return NextResponse.json(response);
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Common mistakes

- ❌ `callApi("/api/v1/...")` — leaves `/v1` in the frontend path; gateway double-prefixes → 404
- ❌ `callApi("https://backend.example.com/...")` — absolute external URL bypasses the Next.js proxy entirely; CORS + missing auth
- ✅ `callApi("/api/<path>")` — Next.js proxy → gateway resolves backend URL

### Where the `callApi` lives — wrappers in `functions/<modulo>.ts`, NEVER inline in hooks

**Process hooks (`process/use-process-X.Y.Z.ts`) and components don't call `callApi` directly.** Wrap each backend endpoint in a typed function under `src/app/(myapp)/functions/<modulo>.ts` and import that. Reasons:
- The hook stays focused on orchestration/state, not URL strings + query encoding
- Types live next to the wrapper (single source of truth for request/response shapes)
- The function is reusable from multiple steps + tests + other hooks
- Refactoring backend paths touches one file, not every caller

✅ Canonical pattern (one wrapper file per module under `functions/<module>.ts` — e.g. one per domain entity + one for cross-cutting search endpoints):

```ts
// src/app/(myapp)/functions/prestacoes.ts
export async function getValorSubsidioLuto(params: {
  idTipoDireito: number | string;
  entitySubTypeId: number | string;
}): Promise<DetalhesCalculoSubsidioLutoDTO> {
  const query = buildQueryParam(params);
  return await callApi<DetalhesCalculoSubsidioLutoDTO>(
    `/api/prestacoes/subsidios/luto/valor${query.toString()}`,
    { method: "GET" },
  );
}
```

```ts
// In the hook:
import { getValorSubsidioLuto } from "../functions/prestacoes";

const detalhes = await getValorSubsidioLuto({
  idTipoDireito: pedido.tipoSubsidioId,
  entitySubTypeId: form.entitySubTypeId,
});
```

❌ Avoid: inline `callApi` calls in process hooks with hand-rolled query string and untyped responses. Move them to `functions/<modulo>.ts` and import.

**Don't forget**: every new file under `(myapp)/functions/` MUST be registered in `src/app/igrp.config.ts` under `functions: [...]`.

### Asset URL helpers — `Link` vs `Url` duality (basePath aware)

When the frontend is deployed under a non-root basePath (cluster / sub-path mounts), there are **two distinct URL forms** for any backend-served asset (uploaded files, generated documents, image previews):

```ts
// src/app/(myapp)/functions/<asset>.ts

// 1) Path WITHOUT basePath — for components that handle basePath themselves
export const getAssetLink = (fileId: string): string =>
  `/api/<asset-route>?fileId=${encodeURIComponent(fileId)}`;

// 2) Full URL WITH basePath — for raw browser APIs
export const getAssetUrl = (fileId: string): string => {
  const BASEPATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return `${BASEPATH}${getAssetLink(fileId)}`;
};
```

**Which to use:**

| Consumer | Use |
|---|---|
| Next.js `<Link>`, `<Image>`, `<a href>` inside the React tree | `getAssetLink()` — Next.js prepends `basePath` automatically |
| `<iframe src>`, `<embed>`, PDF viewer src prop, `window.open()`, `fetch()`, `new URL()` | `getAssetUrl()` — these bypass Next.js routing |

Swapping them causes 404 on cluster (basePath missing from `<iframe>`) or **double-basePath** (`/myapp/myapp/api/...`) on `<a href>`. Both are silent in dev (basePath is empty locally) and only break in deployed environments.

Define the pair side-by-side in the same `functions/` file and name them with the `Link`/`Url` suffix — the convention makes the choice obvious at call sites.

---

## Idempotency — business POSTs inside `completeStep` MUST send `Idempotency-Key`

The typical iGRP process-step runner performs a **two-phase submit**: first the domain POST (`completeStep()` handler), then the BPMN engine call (`completeTask()`). Without an idempotency key, a double click or a retry after a `completeTask` failure duplicates records on the backend side. If your backend implements the standard `Idempotency-Key` header contract (client-generated key, lock-first PENDING/COMPLETED, replay cached responses), the frontend MUST wire it on every write inside `completeStep`.

**Deterministic key derivation, not stored.** Derive a UUID from `hash(userTaskInstanceId | intent | payload)` — no client-side storage involved. Properties this gives you:

- Same task + same data (double click, retry after `completeTask` failure, page reload) → same key → backend dedupes.
- User corrects the data and resubmits → payload changes → new key → re-executes. This matters: a strict backend IGNORES a different payload sent with a reused key and replays the original response, so a stable per-task key would silently drop corrections.
- Legitimate task re-execution (retake cycle → new task instance) → new scope → new key. **Scope MUST be `userTaskInstanceId`**, never `processInstanceId`.

Four frontend pieces to wire (follow this pattern on every NEW process step that persists data in `completeStep`):

1. **Key helper** — `src/app/(myapp)/lib/idempotency.ts`:
   ```ts
   export function getIdempotencyKey(scope: string, intent: string, payload: unknown): string {
     // deterministic UUID derived from scope|intent|hash(payload); no storage.
   }
   export function idempotencyHeaders(key?: string): Record<string, string> {
     return key ? { "Idempotency-Key": key } : {};
   }
   ```
2. **Transport** — the `callGateway` implementations (both server-side and app-side variants) forward the incoming `Idempotency-Key` header via `next/headers`. No per-proxy-route work needed once wired centrally.
3. **Function wrapper** — every `functions/<modulo>.ts` write wrapper takes an optional trailing `idempotencyKey?: string` and passes `headers: idempotencyHeaders(idempotencyKey)` to `callApi`.
4. **Hook call site** — inside `completeStep`, always pass the DTO as the payload:
   ```ts
   import { getIdempotencyKey } from "../lib/idempotency";

   // userTaskInstanceId comes from the step's `process` prop (task-runner hooks)
   // or from useIGRPProcessContext() (embedded step hooks — context exposes it).
   const dto = buildDTO(payload);
   await postDomain(dto, getIdempotencyKey(userTaskInstanceId, "domainIntent", dto));
   ```

**Rules learned wiring dozens of call sites:**

- **One intent name per write call site.** Use distinct intents for mutually exclusive branches (`"pay-out"`, `"refund"`, `"grant"`) so cached responses never cross intents.
- **Loops need one key per iteration.** If a shared hook iterates a collection and posts once per item, pass a `makeIdempotencyKey(payload)` factory to the callback and include the per-item id in the payload — otherwise every iteration hashes to the same key and only the first item's response is replayed.
- **Never key on `processInstanceId`.** A retake cycle produces a new `userTaskInstanceId` but the same `processInstanceId`; keying on the latter blocks legitimate re-executions.

---

## React Query key factory pattern

When a hook owns more than one query for the same entity (list + detail + stats + nested resources), declare a **single `keys` factory** at the top of the hook file and reference it from every `useQuery`/`useMutation`. Hardcoded query-key strings scatter cache state and make selective invalidation impossible.

```ts
// src/app/(myapp)/hooks/use-<entity>.ts
const entityKeys = {
  all:        ["entity"] as const,
  lists:      ()                  => [...entityKeys.all, "list"] as const,
  list:       (filters: Filters)  => [...entityKeys.all, "list", filters] as const,
  detail:     (id: string)        => [...entityKeys.all, "detail", id] as const,
  stats:      ()                  => [...entityKeys.all, "stats"] as const,
  children:   (id: string)        => [...entityKeys.all, "children", id] as const,
} as const;

export const useEntityList = (filters: Filters) =>
  useQuery({
    queryKey: entityKeys.list(filters),
    queryFn: () => callApi(`/api/entities`, { params: filters }),
  });

export const useEntityDetail = (id: string) =>
  useQuery({
    queryKey: entityKeys.detail(id),
    queryFn: () => callApi(`/api/entities/${id}`),
    enabled: !!id,
  });

// After a mutation succeeds — invalidate only what's affected:
queryClient.invalidateQueries({ queryKey: entityKeys.lists() });  // refetch every list view
queryClient.invalidateQueries({ queryKey: entityKeys.detail(id) }); // refetch just this detail
```

**Rules:**
- Factory lives at the **top of the hook file**, named `<entity>Keys` (camelCase).
- Each entry is a `() => readonly [...]` (or `as const`) so TypeScript narrows the key tuple.
- The `all` root key never changes; sub-keys extend `all` and add discriminators.
- Pass filter objects **by reference** as the last tuple element — React Query handles the deep-equality check.
- For mutations, prefer `invalidateQueries({ queryKey: entityKeys.lists() })` over `refetchQueries` — invalidate is cheaper and lets React Query re-fetch lazily when a consumer mounts.

Without a factory, you get bugs like: detail page updates, list page doesn't refetch; or list with filter A invalidates list with filter B; or two hooks for the same entity use slightly different key arrays and never share cache.

---

## Directory layout

```
<frontend-project>/
  .igrpstudio/
    pages/                    # JSON page configs
    components/               # JSON component configs
    process/                  # JSON process step configs
    baseapp.json
  src/
    app/
      (igrp)/(generated)/     # auto-generated TSX — DO NOT edit by hand
      (myapp)/                # hand-written modules
        hooks/                # React Query hooks
        functions/            # plain TS functions
        types/                # TS interfaces
        lib/                  # validators, utilities
        components/           # React components (custom domain components, helpers)
      api/                    # Next.js API routes (proxy to backend)
    temp/menus/menus.ts       # menu registration
```

Backend typically lives in a sibling `<backend-service>/` repo — Spring Boot for projects using the iGRP Spring engine.

---

## Path conventions

### Page paths

- **Parametrization pages**: `(parametrizacao)/<slug>` — e.g. `reasons`, `regimes`, `categories`
- **Module pages**: direct path — e.g. `module/subresource`, `entities`, `resources`
- **Subpages**: include uuid param — e.g. `resource/[uuid]/children`

Route groups in parentheses don't appear in URLs but enable folder organization.

### API proxy paths

Next API routes under `src/app/api/` proxy to `BACKEND_API_URL` backend. Important quirk:
- Backend endpoint: `/api/v1/parameterizacoes/*` (with typo — do not "fix")
- Next proxy: `/api/parametrizacao/*` → backend `/parameterizacoes/*`
- Backend endpoint: `/api/v1/caixa/*`
- Next proxy: `/api/caixa/*` → backend `/caixa/*`
- Backend endpoint: `/api/v1/caixa/combobox/*`
- Next proxy: `/api/caixa/combobox/*` → backend `/caixa/combobox/*`
- Backend endpoint: `/api/v1/combobox/*` (generic combobox)
- Next proxy: `/api/combobox/*` → backend `/combobox/*`

When asked to integrate a new endpoint `/api/v1/<area>/*`:
- Check if a proxy route exists under `src/app/api/<area>/`
- If not, the catch-all patterns at `src/app/api/<area>/[...slug]/route.ts` (if present) may already handle it — common for `caixa/combobox` and `parametrizacao`

---

## Custom components available

The iGRP engine supports standard components AND project-custom ones referenced by `componentName`:

### How the engine passes props to a custom component (JSON → TSX contract)

A custom node receives props from three JSON locations, each with a different emission shape:

| JSON location | Emitted as | Use for |
|---|---|---|
| `properties.customProperties.<k>: "txt"` | `<k>={` `` `txt` `` `}` (wrapped in template literal) | **static** strings / booleans (label, placeholder, required, flags) |
| `data.<prop>.value: { code: "expr", type: "string\|boolean\|any[]\|..." }` | `<prop>={ expr }` (raw expression) | **dynamic** values read from state/derived (value, options, disabled, formData) — always set `type` |
| `interactions.<key>.function.fnName: "fn"` | `<key>={ fn }` | callbacks (`onItemSelected`, `onValueChange`, `onChange`, …) — arbitrary key names work, not just standard DOM events |

The import path is resolved from the **registry** (`igrp.config.ts` `components: []`) by matching the exported symbol = `componentName`; the node `id` must be prefixed with the lowercased `componentName` (e.g. `mycomponent_dom` for `MyComponent`). Register the file or it renders as yellow zebra-tape.

Custom form fields do **not** auto-bind to the `IGRPForm` schema — write the value into the form via the auto-created `formform1Ref.current?.setValue('<tag>', value)` inside the callback handler. Keep the field in `types[]` (componentId → the custom node id) so the Zod field exists.

### Example — search widget with ID persistence

A common project-custom shape is a search dialog (`Search<Entity>`) that returns a picked record from a modal. Typical props: `labelInput`, `title`, `description`, `onClose`, `onItemSelected` (plus optional filter args). To persist the ID (not just the label) into the form, pair the widget with an `inputHidden <entityId>` and in `onItemSelected` call `formform1Ref.current?.setValue('<entityId>', Number(item?.value))`.

### Example — loading-state widget

A `Loading` / `LoadingPage` custom wrapper is another common shape: `data.isLoading.value.code: "isLoading"` binds to a hook's `isLoading` flag; the component renders a spinner while the hook resolves.

---

## Generic hooks

### `useParametrizacaoCrud(routeName, options)`
From `@/app/(myapp)/hooks/use-parametrizacao-crud`

Generic CRUD for parametrization entities. Auto-discovers the endpoint via `routeName` (last URL segment). Returns `{ data, isLoading, refetch, create, update, remove, updateStatus, isCreateSuccess, isUpdateSuccess, ... }`.

Wire in onLoad:
```js
const pathname = usePathname();
const routeName = pathname?.split('/').pop() || '';
const { data, refetch, create, update, updateStatus, isCreateSuccess, isUpdateSuccess } =
  useParametrizacaoCrud(routeName, { params: { nome: searchValue, estado: status } });
```

### `useEnumOptions(enumName)`
From `@/app/(myapp)/hooks/use-enum-options`

Fetches enum values by name from the backend. Returns `{ options: IGRPOptionsProps[], isLoading }`.

Common enums: `"Status"`, other domain enums (check backend).

### `useMultipleComboBoxOptions(configs)`
Load multiple combobox options in one call. Used across many list/CRUD pages. Pass an array of `{ type: "enum-name" }` configs.

### `useParametrizacaoOptions(routeName, options)`
From `@/app/(myapp)/hooks/use-parametrizacao-options`

Get just options (for combobox) from a parametrization endpoint. Returns `{ options, isLoading, refetch, rawData }`.

### Caixa hooks (specific to this module)
From `@/app/(myapp)/hooks/use-caixa`:
- `useCaixaDias(filters)`
- `useCaixaAtendedoresByDia(diaId, filters)`
- `useDetalheCaixaAtendedor(id)`
- `useExtratosAtendedor(filters)`
- `useCaixaComboboxUps()`
- `useCaixaComboboxAtendedor(idUps?)` — optional UPS filter
- `useCaixaComboboxUpsDepartments()`
- Mutation helpers: `submitAbrirDia`, `submitFecharDia`, `submitAbrirCaixaAtendedor`, `submitFecharCaixaAtendedor`, `submitMovimentoCaixa`, `submitConfirmarRecepcaoFundos`

---

## Status/badge color functions

Located under `src/app/(myapp)/functions/` — see `patterns.md` §9 for the canonical dual-output shape (raw Tailwind for table badges + design-system variant token for banners) and the single-source `STATUS` map.

Typical distribution across files:

- **`global.ts`** — status functions for the main domain entities (one `getStatusBadge<Entity>` + one `getStatus<Entity>Banner` per entity).
- **`<module>-utils.ts`** — module-specific status functions when a module has its own enum (e.g. transaction state, workflow state) that doesn't fit into the global entity flavours.
- **Enum label maps** for reuse outside the badge context: `ESTADO_<X>_LABEL`, etc. — resolves an enum code to a human label without loading the whole badge shape.

All colour functions return the same shape: `{ bgClass, textClass, iconName, label, className }` for badges, and `IGRPStatusBannerVariant` for banners.

Badge customize in `tableBadgeCell.interactions.customize.function`:
```json
{
  "type":"function",
  "fnCustomCode":{"imports":[{"namespace":"import {getStatusBadge<Entity>} from '@/app/(myapp)/functions/<module>-utils'","id":"<10char>"}]},
  "fnName":"getStatusBadge<Entity>"
}
```

---

## Validators

Located under `src/app/(myapp)/lib/`:

- One `<module>Validators.ts` file per module (e.g. `<entity>Validators.ts`) exporting one validator function per form action.
- Each validator has the same signature (see below), so a single call site pattern in `handleFormSubmit` works everywhere.

Signature: `(values: Partial<Request>) => { isValid: boolean, error?: { title, description } }` — same shape as the `ValidationResult` for `validateStep<X>` in `process-steps.md` §11.7.

Use in `handleFormSubmit`:
```js
const validation = validateXxx(payload);
if (!validation.isValid) {
  igrpToast({ title: validation.error?.title, description: validation.error?.description, type: 'error' });
  return;
}
```

---

## Types

Located under `src/app/(myapp)/types/`:
- One file per module (`<module>.ts`) exporting the DTOs / request/response shapes for that module.
- `share-types.ts` — cross-cutting utility types: `PaginatedResponse<T>`, `UploadingState`, etc.
- `parametrizacao.ts` — the generic `ParametrizacaoItem` used across every parametrization endpoint.

Import as needed in state/type definitions.

---

## UI/style conventions

- **Currency**: `XOF` with `language: "pt-PT"` in `tableAmountCell`. For stats cards / modals / toasts use `formatCurrency(value, "XOF")` from `@/app/(myapp)/lib/utils` — returns a pt-PT formatted string (`5.000 XOF`). Displayed as "F CFA" where required by passing the currency arg explicitly.
- **Date columns**: use `tableDateCell` with `dateFormat: "dd/MM/yyyy"` (or `"dd/MM/yyyy HH:mm"` for datetime). Do **not** use `tableTextCell` for dates and do **not** pre-format through `formatDateBR` in the onLoad — the cell does both.
- **Date values outside table columns**: `formatDateBR(value)` → `dd/MM/yyyy`, `formatDateTimeBR(value)` → `dd/MM/yyyy HH:mm`. Both from `@/app/(myapp)/lib/utils`, null-safe.
- **Date pickers**: `dateFormat: "dd/MM/yyyy"` prop on `datePickerRange`.
- **Grid of stats cards**: `variant: { default: "cols4", md: "cols2", lg: "cols4" }`
- **Filter grid**: same cols4 pattern, wrapped in container with `className: "px-4 pt-2 space-y-3"`
- **Filter toggle button**: variant `outline`, icon `SlidersHorizontal` (or `SlidersVertical` in some places)
- **Primary action button** ("Novo", "Guardar"): variant `default`, icon `Plus`/`Save`
- **Destructive actions** (Eliminar, Fechar): variant `ghost` on the trigger, `destructive` on the confirm button of `tableAlertAction`
- **Search inputs**: `className: "flex-1 min-w-[240px]"` in list page headers

### Stats card variants by purpose
- `info` — neutral totals
- `success` — positive metrics (received, confirmed, active)
- `warning` — pending / attention items
- `indigo` — secondary info (alt totals)
- `secondary` — amounts / monetary

---

## Menu conventions (`src/temp/menus/menus.ts`)

Group by top-level area — one root code per module (e.g. `<MODULE>_GROUP`), plus a shared `PARAMETRIZACAO` group for lookup/parametrization tables organised into sub-folders by category (`PARAMETRIZACAO_<CATEGORY>`).

When adding a new parametrization page, place it under the matching `PARAMETRIZACAO_<CATEGORY>` folder. If no folder fits, either use `PARAMETRIZACAO_OTHERS` or create a new category folder.

Menu slugs must match page URL paths (excluding route groups).

---

## Form-component contract for modals in CRUD pages

Pattern used repeatedly across the codebase: a parametrization list page with inline modal for create/edit (like motivos.json):
- Single `form` inside the modal with `dataType: "form1"` and type entry in `types[]`
- State `open`, `currentItem`, `tableData`, `modalDialogTitle1Content`
- Functions `clearFilter`, `handleSubmit`
- onLoad uses `useParametrizacaoCrud(routeName, {params})`
- Modal title state-bound to switch between "Criar X" / "Editar X"
- `tableActionListCell` with Edit (opens modal with `setCurrentItem(rowData)`) and Alter Status (`tableAlertAction` calling `updateStatus(rowData.idTbl)`)

This is the go-to pattern for any new simple CRUD entity.

---

## Project-specific engine quirks (learned the hard way)

1. **Beware of "typos" in backend paths that are intentional** — some backends have historical misspellings that would break clients if "corrected". When in doubt, verify with the backend team before altering a proxied path.
2. **Route-group paths vs direct paths** — parametrization pages typically use a `(parametrizacao)/` route group; module pages use direct paths. Mirror the nearest existing page of the same category.
3. **`useIGRPToast` is always auto-imported and instantiated** — never import it yourself.
4. **`useRouter` is only auto-emitted when a `type:"navigate"` button exists** — import manually otherwise.
5. **Named functions in `functions[]` collide with destructured hook vars** — rename on one side if `useXxxHook()` returns something with the same name (e.g. `refreshList`).
6. **Form without `dataType` → runtime `'_def' in undefined` error**.
7. **`tableAlertDropdownItem` is valid but `tableAlertAction` is preferred** for simple row-level confirmations (fewer clicks, simpler UX).
8. **A custom search widget doesn't capture the selected ID by default** — pair it with an `inputHidden <entityId>` and wire the value into the form via `formform1Ref.current?.setValue('<entityId>', Number(item?.value))` inside the widget's `onItemSelected` callback.
9. **Combobox for ID selection must bind both `value.state` and `options.state`** — a common mistake is to skip `options.state`, leading to empty options.
10. **Body-level state setters cause infinite re-renders** — always wrap in `useEffect`.
11. **Lucide icon names follow the `Verb-Noun` → `Noun-Verb` rename** — the icons the design system ships are lucide-react. Common correct names: `CircleCheck` (not `CheckCircle`), `CircleX` (not `XCircle`), `CircleAlert` (not `AlertCircle`), `CircleCheckBig` (distinct icon). If you see a `?` placeholder in the UI, the icon name is wrong — check [lucide.dev/icons](https://lucide.dev/icons).
12. **Dates belong in `tableDateCell`, amounts in `tableAmountCell`** — leave the row data raw (ISO string / number) and let the cell component render. Pre-formatting in the onLoad only applies to values consumed by non-table components (stats cards, toast messages, modal subheadings).

---

## Cross-step labels — id/code → human description

Combobox/parametrização values are stored as **id** (number) or **code** (string) — never as the human label. To show the label in the card-details / summary of a downstream step:

**Centralize the mapping.** Write one shared helper (typically inside a `use-process-<family>-shared.ts`) that consumes the raw form data + the available options maps + a per-family `single`/`docsKey` mapping (field name → options-key), and returns the labelled record. Never hand-roll lookups at each step.

```ts
// signature — put the implementation in a shared hook
mapFormDataWithLabels(
  previousTaskData: unknown,
  allOptions: Record<string, IGRPOptionsProps[]>,
  spec: { single: Record<string, string>; docsKey?: string }
): { <labelled fields> };
```

The helper's resolution order for each field:

1. **Prefer `<field>_desc` if persisted** on the source record (the `_desc` convention, below).
2. Otherwise `getLabelFromOptions(options[optKey], base[field])`.
3. For repeatable groups (`addresses`, `contacts`, `payments`, etc.), map each item recursively.
4. For attachments, resolve `desc` via the document-type options-key declared in `docsKey`.

### The `_desc` convention — when the global lookup can't answer

For fields whose valid options come from the **picked entity** (not global parametrização — see "Per-entity subset combobox" above), the global options map won't have the right label. In those cases, persist a sibling `<field>_desc` alongside the id at the point the entity is still in memory:

```ts
const subTypeDesc = (entity?.subTypes || []).find(
  (t) => String(t.id) === String(formData.subTypeId),
)?.description ?? "";

const form = [
  ...Object.entries(formattedFormData).map(([k, v]) => ({ name: k, value: String(v) })),
  ...(subTypeDesc ? [{ name: "subTypeId_desc", value: subTypeDesc }] : []),
];
```

The shared label mapper reads `_desc` automatically — just list the field in the `single` spec. Manual helpers should do `p.<field>_desc ?? lookup ?? raw`.

**Rule**: `_desc` is the **exception**, not the default. Apply it only when the options aren't in a global `ComboBoxType` or parametrização. For everything else, let the shared mapper resolve via options.

---

## Workflow for new tasks

When asked to create or modify a page:

1. Identify the closest existing file that matches the pattern (mirror an existing `.igrpstudio/pages/<file>.json` of the same category).
2. Copy that file's structure.
3. Update: pageName, path, id, tags, types, states, functions, onLoad.
4. Register the page in `src/temp/menus/menus.ts` with `pageSlug` matching the URL path.
5. If new API endpoints are needed, add proxy routes under `src/app/api/`.
6. If new hooks/functions/types are needed, add them under `src/app/(myapp)/`.
7. Validate JSON (no dup tags/IDs, string arg IDs, proper dataType).
8. Run build; verify only known/unrelated errors remain.
9. If necessary, patch the generated TSX temporarily so build passes while the user regenerates.
