# Project-specific conventions

Concrete conventions and primitives that emerged in a production reference iGRP project. Treat them as **patterns to mirror**, not as fixed identities — names like `useMultipleComboBoxOptions`, `callApi`, `SearchGeografia` are illustrative of the **shape** of solutions a mature iGRP frontend converges on (centralized combobox loader, proxied API caller, search-with-dropdown component). Adapt freely to your project's domain.

---

## Combobox options — load from API via `useMultipleComboBoxOptions`

**Don't hardcode combobox options or leave them as empty `[]` arrays in process hooks.** This project has a centralised combobox loader that calls `/api/v1/combobox/<type>` endpoints and a typed enum of supported types in [`src/app/(myapp)/types/combobox.ts`](../../../src/app/(myapp)/types/combobox.ts).

### Pattern (from `use-process-contribuinte-shared.ts` — canonical reference)

```ts
import { useMultipleComboBoxOptions } from "../hooks/use-combobox-options";

const shouldLoadOptions = step === "pedido";
const { options, isLoading } = useMultipleComboBoxOptions(
  shouldLoadOptions
    ? [
        { type: "direitos" },
        { type: "tipos-utente" },
        { type: "tipos-documento-inscricao" },
        { type: "tipos-contacto" },
        { type: "operadoras" },
        { type: "tipos-documento-processo", params: { codigoProcesso: PROCESS_KEY } },
      ]
    : [],
);

return {
  optionsTipoSubsidioLuto: (options["direitos"] || []).filter(o => o.value === "SF" || o.value === "SUBL"),
  optionsTipoUtente:        options["tipos-utente"] || [],
  optionsTipoContacto:      options["tipos-contacto"] || [],
  optionsOperadora:         options["operadoras"] || [],
  // ...
  isLoading,
};
```

The step JSON's `onLoad.fnCode` then destructures `optionsXxx` from the hook and seeds combobox state via `setSelect<tag>Options(optionsXxx || [])` inside a `useEffect` keyed on `[isLoading]`.

### Available `ComboBoxType` values (from `types/combobox.ts`)

`tipos-utente`, `tipos-representacao`, `tipos-relacao`, `tipos-estatuto-juridico`, `tipos-endereco`, `tipos-documento-inscricao`, `tipos-documento-inscricao-utente`, `tipos-documento-inscricao-contribuinte`, `tipos-documento-anexo`, `tipos-contacto`, `tipos-atividade`, `sexo`, `regimes`, `qualificacao`, `profissoes`, `operadoras`, `motivos`, `motivos-suspender-{contribuinte,beneficiario,agregado}`, `motivos-reativar-{...}`, `motivos-cessar-{...}`, `motivos-mudanca-emprego`, `geografia-regiao`, `geografia-pais`, `estados-utente`, `estados-contribuinte`, `estado-civil`, `escalao`, `categorias`, `tipos-documento-processo` (parametrized by `codigoProcesso`), `direitos`, `forma-pagamentos`, `tipos-utente-com-direito`.

### Two parametrized combobox types

```ts
{ type: "tipos-documento-processo", params: { codigoProcesso: "P3.2.7" } }
{ type: "motivos",                  params: { agrupador: "..." } }
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

### `tipoUtenteId` — derive from `currentUtente.tiposUtente`, NOT global parametrização

When a process step has `SearchUtente` (or `SearchFalecido` for funeral-style flows) followed by a `tipoUtenteId` combobox, the options must come **exclusively** from the search result's `tiposUtente` array — never from `useParametrizacaoOptions("tipos-utente")` or `useMultipleComboBoxOptions([{type:"tipos-utente"}])` as fallback.

**Why**: each utente has a specific subset of tipos that are valid for them (e.g. a Beneficiário may also be Reformado but not Pensionista). The global parametrização lists ALL tipos in the system, so using it as a combobox source lets the user select an invalid tipo for that utente, and the backend rejects on submit.

**Backend shape (search result)**:
```ts
type Utente = {
  id: string; numero: string; nome: string;
  tiposUtente: Array<{
    id: number;
    codigo: string;
    descricao: string;
    estado: string;
    estadoDesc: string;
  }>;
  /* ... other fields */
};
```

**Pattern in JSON `onLoad` fnCode** (canonical: `P3.2.4/pedido.v1.json`):
```ts
useEffect(() => {
  const tipos = (currentUtente?.tiposUtente || []) as Array<{
    id: number | string; codigo?: string; descricao?: string;
  }>;
  const opts = tipos.map((t) => ({
    value: String(t.id),
    label: t.descricao ?? t.codigo ?? String(t.id),
  }));
  setSelecttipoUtenteIdOptions(opts);
  // Reset selecionado quando utente muda
  setSelecttipoUtenteIdValue('');
  formform1Ref.current?.setValue('tipoUtenteId', 0);
}, [currentUtente]);
```

**Hook**: keep a `optionsTipoUtente` from `useParametrizacaoOptions("tipos-utente")` ONLY for label resolution in card-detail snapshots in later steps (Cálculo / Autorização) where `currentUtente` is no longer available — never as the combobox source. The labels match because both arrays describe the same domain entity (`T_TIPO_UTENTE`).

**Pre-pedido seed** (initial render before user does a search): set `setSelecttipoUtenteIdOptions([])` — combobox stays empty until a search result arrives. Empty + helpful placeholder is far better than a misleading global list.

This rule applies to ANY process step where a `tipoUtenteId` (or analogous per-utente subset field, e.g. `direitoUtenteId`) is selected after a utente search.

---

## Backend API calls — go through the Next.js proxy, not the gateway directly

**`callApi` from the frontend never calls the backend gateway URL directly.** Always call a Next.js route handler under `src/app/api/...` that proxies to the gateway via `callGateway`. Two reasons:
- The gateway URL is server-only env (`INSS_CORE_SERVICE_URL`); the browser shouldn't see it
- Auth headers (access token) are injected server-side inside `callGateway`

### Frontend path = backend path **without `/v1/`**

Backend exposes `/api/v1/<x>`. Frontend calls `/api/<x>`. The `/v1` prefix lives in `INSS_CORE_SERVICE_URL` (set on the server). The Next.js proxy forwards `${INSS_CORE_SERVICE_URL}${path}` — it doesn't strip or add anything.

| Backend endpoint | Frontend `callApi(...)` | Next.js route file |
|---|---|---|
| `/api/v1/search/utente-falecido` | `/api/search/utente-falecido` | `src/app/api/search/[...source]/route.ts` (catch-all) |
| `/api/v1/prestacoes/subsidios/luto/valor` | `/api/prestacoes/subsidios/luto/valor` | `src/app/api/prestacoes/subsidios/luto/valor/route.ts` |
| `/api/v1/prestacoes/utentes/{id}/pagamentos` | `/api/prestacoes/utentes/{id}/pagamentos` | `src/app/api/prestacoes/utentes/[utenteId]/pagamentos/route.ts` |

### Two proxy patterns

**Catch-all (preferred when many endpoints share the same prefix):** see `src/app/api/search/[...source]/route.ts` — forwards any `/api/search/<X>` to `${API_URL}/search/<X>`. New search endpoints work automatically without a new route file.

**Specific route (preferred for typed handlers, validation, or POST bodies):** see `src/app/api/prestacoes/utentes/[utenteId]/pagamentos/route.ts`. Boilerplate:

```ts
import { type NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error-handler";
import { callGateway } from "@/lib/api-gateway";

const API_URL = process.env.INSS_CORE_SERVICE_URL || "";
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

✅ Canonical pattern (see `functions/prestacoes.ts`, `functions/contribuinte.ts`, `functions/utente.ts`, `functions/search.ts`):

```ts
// src/app/(myapp)/functions/prestacoes.ts
export async function getValorSubsidioLuto(params: {
  idTipoDireito: number | string;
  idTipoUtente: number | string;
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
  idTipoUtente: pedido.tipoUtenteId,
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

- **Parametrization pages**: `(parametrizacao)/<slug>` — e.g. `motivos`, `regimes`, `ups`
- **Module pages**: direct path — e.g. `caixa/dias`, `contribuintes`, `imoveis`
- **Subpages**: include uuid param — `caixa/dias/[uuid]/atendedores`

Route groups in parentheses don't appear in URLs but enable folder organization.

### API proxy paths

Next API routes under `src/app/api/` proxy to `INSS_CORE_SERVICE_URL` backend. Important quirk:
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

### `SearchGeografia`
Located: `src/app/(myapp)/components/search/search-geografia.tsx`

Props: `labelInput`, `title`, `description`, `onClose`, `onItemSelected`, `geografiaId` (optional filter).

Use for location picking. See `imovelForm.json` for reference. To also persist the ID (not just label), add an `inputHidden idGeografia` and in `onItemSelected` handler call `formform1Ref.current?.setValue('idGeografia', Number(geografia?.value))`.

### `LoadingPage`
Located: `src/app/(myapp)/components/loading-page.tsx`

Used via `componentName: "LoadingPage"` with `data.isLoading.value.code: "isLoading"`. Renders a loading spinner bound to a hook's isLoading flag.

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
Load multiple combobox options in one call. Used in contribuintes, imoveis. Pass an array of `{ type: "enum-name" }` configs.

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

Located under `src/app/(myapp)/functions/`:

- `global.ts`:
  - `getStatusColor(contribuinte)` — contribuinte estados (ATIVO/SUSPENSO/BAIXA)
  - `getStatusBadge(item)` — generic A/I estado
  - `getStatusColorUtente(utente)` — utente estados
  - `getStatusColorImovel(imovel)`, `getStatusColorFracao`, `getStatusColorManifestacao`
  - `getStatusContribuinteBanner`, `getStatusUtenteBanner` — banner variant strings
- `caixa-utils.ts`:
  - `getCaixaEstadoColor(rowData)` — dias ABERTO/FECHADO
  - `getCaixaMovimentoEstadoColor(rowData)` — movimentos POR_CONFIRMAR/CONFIRMADO (reads `rowData.estado`; falls back to legacy `rowData.estadoMovimento`)
  - `getCaixaAtendedorEstadoColor(rowData)` — atendedor ABERTA/FECHADA
  - `getTipoTransferenciaColor(rowData)` — tipo ENVIO (blue) / DEVOLUCAO (orange)
  - `getPontoTransferenciaColor(rowData, field)` — `UPS` (indigo) / `FINANCEIRO` (purple) / `ATENDEDOR` (teal). Convenience variants: `getPontoDeColor`, `getPontoParaColor`.
  - `getCaixaEstadoBanner(rowData)` — banner variant
  - Enum label maps (for reuse outside badge context): `ESTADO_MOVIMENTO_LABEL`, `ESTADO_CAIXA_LABEL`, `PONTO_TRANSFERENCIA_LABEL`, `TIPO_TRANSFERENCIA_LABEL`

All color functions return `{ bgClass, textClass, iconName, label, className }`.

Badge customize in `tableBadgeCell.interactions.customize.function`:
```json
{
  "type":"function",
  "fnCustomCode":{"imports":[{"namespace":"import {getCaixaEstadoColor} from '@/app/(myapp)/functions/caixa-utils'","id":"<10char>"}]},
  "fnName":"getCaixaEstadoColor"
}
```

---

## Validators

Located under `src/app/(myapp)/lib/`:

- `caixaValidators.ts`: `validateAbrirDia`, `validateAbrirCaixaAtendedor`, `validateTransferirFundos`
- `imoveisValidators.ts`, other entity validators

Signature: `(values: Partial<Request>) => { isValid: boolean, error?: { title, description } }`.

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
- `caixa.ts` — CaixaDia, CaixaAtendedor, TransferirFundosRequest, etc.
- `share-types.ts` — PaginatedResponse<T>
- `parametrizacao.ts` — ParametrizacaoItem generic
- Domain-specific: contribuinte.ts, imovel.ts, utente.ts, etc.

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

Groups by top-level area:
- `CADASTRO` (apps CADASTRO) — root cadastro features
- `CONTRIBUICOES` (apps CORE) — contributions, declarações, entregas
- `IMOBILIARIA_GROUP` — imóveis
- `PARAMETRIZACAO` — parametrization entities (folders for Utentes, Contribuintes, Documentos, Atividade Económica, Outros, Direitos, Saúde, Caixa)
- `GESTAO_CAIXA` — Caixa module (folders for GAF, Movimentos, Operações)

When adding a new parametrization, place under the appropriate `PARAMETRIZACAO_*` folder. If no folder fits, either use `PARAMETRIZACAO_OUTROS` or create a new folder.

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

1. **The typo `parameterizacoes` is intentional** — don't "fix" the backend path.
2. **Path for parametrizations uses route group** `(parametrizacao)/` — other pages use direct paths.
3. **`useIGRPToast` is always auto-imported and instantiated** — never import it yourself.
4. **`useRouter` is only auto-emitted when a `type:"navigate"` button exists** — import manually otherwise.
5. **Named functions in `functions[]` collide with destructured hook vars** — rename on one side if `useXxxHook()` returns something with same name (e.g. `refreshList`).
6. **Form without `dataType` → runtime `'_def' in undefined` error**.
7. **`tableAlertDropdownItem` is valid but `tableAlertAction` is preferred** for simple row-level confirmations (fewer clicks, simpler UX).
8. **`SearchGeografia` doesn't capture the ID by default** — wire the hidden `idGeografia` input manually in the `onItemSelected` handler.
9. **Combobox for ID selection must bind both `value.state` and `options.state`** — a common mistake is to skip `options.state`, leading to empty options.
10. **Body-level state setters cause infinite re-renders** — always wrap in `useEffect`.
11. **Lucide icon names follow the `Verb-Noun` → `Noun-Verb` rename** — the icons the design system ships are lucide-react. Common correct names: `CircleCheck` (not `CheckCircle`), `CircleX` (not `XCircle`), `CircleAlert` (not `AlertCircle`), `CircleCheckBig` (distinct icon). If you see a `?` placeholder in the UI, the icon name is wrong — check [lucide.dev/icons](https://lucide.dev/icons).
12. **Dates belong in `tableDateCell`, amounts in `tableAmountCell`** — leave the row data raw (ISO string / number) and let the cell component render. Pre-formatting in the onLoad only applies to values consumed by non-table components (stats cards, toast messages, modal subheadings).

---

## Cross-step labels — id/code → descrição

Combobox/parametrização values are stored as **id** (number) or **code** (string) — never as the descrição. To show the human label in cardDetails of a downstream step (Cálculo, Autorização, …):

**Use `mapPedidoDataWithLabels` from [use-process-1.1-shared.ts](../../src/app/(myapp)/process/use-process-1.1-shared.ts)** — never hand-roll lookups:

```ts
import { mapPedidoDataWithLabels } from "./use-process-1.1-shared";

const dadosDoPedido = useMemo(() => {
  const allOptions = { ...options, ...parametrizacaoOptions };
  return mapPedidoDataWithLabels(previousTaskData, allOptions, {
    single: {
      tipoSubsidioId: "direitos",
      tipoDocumentoRequerente: "tipos-documento-inscricao-utente",
      grauParentesco: "tipos-relacao",
      // field → optionsKey
    },
    docsKey: "tipos-documento-processo",
  });
}, [previousTaskData, options, parametrizacaoOptions]);
```

The helper internally:
1. **Prefers `<field>_desc` if persisted** (Convenção `_desc`, ver abaixo)
2. Senão faz `getLabelFromOptions(options[optKey], base[field])`
3. Trata `actividadesEconomicas`, `enderecos`, `contactos`, `dadosBancarios`, `pagamentos` automaticamente
4. Para anexos, resolve `desc` via `tipos-documento-processo`

### Convenção `_desc` — quando o lookup global falha

Para campos cujas opções **não vêm da parametrização global** mas sim da entidade pesquisada (ex: `tipoUtenteId` em P3.2.7/P3.2.3 vem de `currentFalecido.tiposUtente` / `currentUtente.tiposUtente`):

- No `completeStep<Step>`: além do `<field>` no `forms[]`, gravar também `<field>_desc` com o label correspondente.
  ```ts
  const tipoUtenteIdDesc = (utente?.tiposUtente || []).find(
    (t) => String(t.id) === String(formData.tipoUtenteId),
  )?.descricao ?? "";

  const form = [
    ...Object.entries(formattedFormData).map(([k, v]) => ({ name: k, value: String(v) })),
    ...(tipoUtenteIdDesc ? [{ name: "tipoUtenteId_desc", value: tipoUtenteIdDesc }] : []),
  ];
  ```
- O `mapPedidoDataWithLabels` lê `_desc` automaticamente — basta o `single` map listar o campo.
- Helpers manuais devem fazer `p.<field>_desc ?? lookup ?? raw`.

**Regra**: `_desc` é exceção, **não default**. Aplica-se apenas quando as opções não estão num `ComboBoxType` global ou parametrização. Para tudo o resto, deixa o `mapPedidoDataWithLabels` resolver via options.

---

## Workflow for new tasks

When asked to create or modify a page:

1. Identify the closest existing file that matches the pattern (use `.igrpstudio/pages/` examples).
2. Copy that file's structure.
3. Update: pageName, path, id, tags, types, states, functions, onLoad.
4. Register the page in `src/temp/menus/menus.ts` with `pageSlug` matching the URL path.
5. If new API endpoints are needed, add proxy routes under `src/app/api/`.
6. If new hooks/functions/types are needed, add them under `src/app/(myapp)/`.
7. Validate JSON (no dup tags/IDs, string arg IDs, proper dataType).
8. Run build; verify only known/unrelated errors remain.
9. If necessary, patch the generated TSX temporarily so build passes while the user regenerates.
