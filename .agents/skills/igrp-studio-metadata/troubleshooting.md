# Troubleshooting — diagnosing generated code failures

Load this file when a build fails, a runtime error appears, or a page renders incorrectly.

---

## Golden rule before debugging: did the user **save** the JSON?

When the user reports a runtime error that contradicts what you see in the JSON file (e.g. `Invalid input: expected string, received number` on a field you already changed to `number`), the most common cause is **the JSON wasn't saved before regenerating the TSX**.

iGRP Studio in the browser keeps unsaved JSON edits in memory; the generated TSX still reflects the LAST saved version. Runtime data flows through the new schema while Zod parses with the old → type mismatch.

**Always ask first**: "did you save the JSON in iGRP Studio (or commit the file edit) and re-generate?". After confirmation, if the error persists, dig into the actual code. Don't burn time defensive-coding the hook for a stale-state bug.

---

## Golden rule: fix the JSON, not the TSX

Files under `src/app/(igrp)/(generated)/` are rewritten each time iGRP Studio regenerates. Editing them directly is a dead end — the fix won't survive. Always trace errors back to the source JSON and fix there.

**Exception**: if the user cannot trigger regeneration and needs a build to pass NOW, patch the TSX AFTER fixing the JSON. Tell the user both were touched, and the TSX patch will be overwritten by the next regeneration (which should be correct because the JSON is now fixed).

---

## Build-time errors (webpack / TypeScript)

### `Module parse failed: Identifier 'X' has already been declared`

Two declarations of the same variable name in the generated file. Sources:

| Variable | Source of duplicate | Fix |
|---|---|---|
| `router` | Both `type:"navigate"` button (engine auto-emits `const router = useRouter()`) AND onLoad fnCode has `const router = useRouter()` | Remove from onLoad fnCode |
| `igrpToast` | Function imports include `useIGRPToast` AND onLoad has `const { igrpToast } = useIGRPToast()` | Remove the import and the declaration from onLoad — engine always auto-provides these |
| `useIGRPToast` | Same as above | Remove any explicit import of `useIGRPToast` from function imports |
| `refreshList` (or similar) | `functions[]` contains a function with this name, AND onLoad destructures `const { refreshList } = useSomeHook()` | Rename one: alias in destructure (`const { refreshList: doRefresh } = useSomeHook()`) or rename the JSON function |
| State name | Two states with the same `name` in `states[]` | Rename one |

### `X is not defined` (compile error in generated TSX)

Usually missing import. Check:
- Did the handler function call something it didn't import? Add the import to the function's `imports` array.
- Does a hook get invoked without being imported? Add to onLoad `imports`.
- Is a `router.push()` call present but no `useRouter` import AND no navigate button? Either add `useRouter` import + `const router = useRouter()` in onLoad, OR change the invoking button to `type:"navigate"`.

### `Type X is not assignable to Y`

- Check if you typed a state as `number` but set it with a string value.
- Check combobox value type matches state type (`variant:"multiple"` → `string[]`, not `string`).

### `Property 'text' does not exist on type ... z` / `z.text is not a function`

Generated TSX has `z.text()` instead of `z.string()` — invalid Zod method. Root cause: `types[].fields[]` (or nested `fields[]` inside list/object fields like `anexos[].url`) uses `"type": "text"`. **The engine emits the field's `type` verbatim into `z.<type>()`** — only valid Zod types compile.

**Valid `type` values for `types[].fields[]`:**
- `"string"` (NOT `"text"`)
- `"number"`
- `"boolean"`
- `"date"` (emits `z.coerce.date()`)
- `"file"`
- `"object"` (with nested `fields[]`)

**Fix:** find every `"type": "text"` in the JSON `types[]` (including nested fields inside `formList`/array fields) and replace with `"type": "string"`.

Quick scan:
```bash
python3 -c "
import json
with open('intake.v1.json') as f: d=json.load(f)
def walk(fs):
    for f in fs or []:
        if f.get('type')=='text': print('❌', f['name'])
        walk(f.get('fields'))
for t in d.get('types',[]): walk(t.get('fields'))
"
```

Common offenders: free-text fields (``notes`, `receiver`, `receipt`, `title`, other free-text strings`), readonly entity snapshot fields (`entityCode`, `parentName`, etc.)), and `anexos[].url`.
- Check if API field types in `types[]` don't match what the hook returns.

### Type error in a file you didn't touch (e.g. `process/[...process]/page.ts`)

Pre-existing issue unrelated to your change. Mention but don't attempt to fix unless asked.

---

## Runtime errors

### Backend 400/500: request body keys don't match DTO / "field X is required"

The form is submitting payload keys with suffix-renamed names (e.g. `amountFld`, `categoryIdFld`, `targetIdFld`) that don't exist on the backend DTO.

**Diagnosis**:
1. Log the actual body sent: `body: '{"amountFld": 1234, "target": "5", ...}'` — if any key has a suffix like `Fld`, `Modal`, `Fltr`, `Btn`, that's a renamed tag leaking through `...values`.
2. Check the backend request DTO to see the REAL expected fields.

**Fix**: in the form's `handleFormSubmit`, construct the payload explicitly, re-keying the renamed tags to the API names:

```js
// ❌ Before
const payload = { ...values, source: 'A', target: 'B' };

// ✅ After
const payload = {
  categoryId: selectCategoryFldValue ? Number(selectCategoryFldValue) : undefined,
  targetUser: values.targetUser ? Number(values.targetUser) : undefined,
  amount:     Number(values.amountFld),
  notes:      values.notesFld,
  source:     'A',
  target:     'B',
};
```

Do NOT spread `...values` when any form field uses a renamed tag.

### `Unexpected token 'X', "<some text>..." is not valid JSON` (500 on submit)

The frontend (Next API route) is trying to parse a backend response as JSON but the backend returned a plain text body.

**Diagnosis**:
- Look at the `callApi` invocation for the failing endpoint in `src/app/(myapp)/functions/<module>.ts`
- If it has `isTextResponse: true` but the backend now returns JSON (`{success: true}` or similar), remove that flag and type the response as the JSON shape
- If it omits `isTextResponse` but the backend actually returns plain text, either coordinate with backend to return JSON, or add the flag

**Preferred direction**: coordinate with backend so ALL write endpoints return a small JSON envelope (e.g. `{ success: true }`). Plain text responses make error handling inconsistent.

### `Failed to convert value of type 'java.lang.String' to required type 'java.time.LocalDate'` (or similar 400/500 on date submit)

The frontend sent an ISO datetime like `"2026-04-23T00:00:00.000Z"` but the backend DTO field is `LocalDate` (expects `"2026-04-23"`).

**Fix**: in the form's `handleFormSubmit`, normalize every `LocalDate`-typed field with:
```js
const normalizeDate = (d: any) => {
  if (!d) return undefined;
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  return String(d).slice(0, 10);
};

const payload = { ...values, dia: normalizeDate(values.dia) };
```

Apply to `dia`, `dataEnvio`, `dataInicio`, `dataFim`, any `@NotBlank` date range filter param, etc. The `inputDatePicker` stores the value as a `Date`; JSON-stringifying a `Date` produces ISO datetime, not LocalDate.

### Backend `@NotBlank` filter rejects empty-filter initial list load

The query DTO validates fields like `from`/`to`/`user` as `@NotBlank` but the initial page load has no filters applied.

**Wrong approach** (❌) — do NOT send sentinel values like `0`, `'_'`, `'1900-01-01'`. The backend will interpret them as real filter values (e.g. `categoryId=0` → searches for the record with id 0 → returns nothing).

**Correct approach** (✅) — always send `undefined` for unset filters:
```js
from:       toLocalDate(range?.from),                             // undefined → omitted
to:         toLocalDate(range?.to),                               // undefined → omitted
user:       (searchValue && searchValue.trim()) || undefined,
categoryId: selectCategoryFldValue ? Number(selectCategoryFldValue) : undefined,
```

`buildQueryParam` strips `undefined`/`null`/`""` so those fields don't appear on the query string at all.

**If backend still rejects the request**: it's a backend bug — `@NotBlank` on a filter field whose service code clearly handles `null`. File it for the backend team to change the annotation to optional (`@Nullable` or remove the constraint).

### `Cannot use 'in' operator to search for '_def' in undefined`

**Diagnosis**: A `<form>` component is receiving `schema={undefined}` — Zod resolver can't handle it.

**Root cause**: The form's `dataType` is empty string `""` in the JSON.

**Fix**:
1. Add a new entry to `types[]` with `componentId` matching the form's `id`, a `name` (e.g. `"formXyz"`), and a `fields` array matching the form inputs.
2. Set `dataType: "formXyz"` on the form component.

Every `<form>` in a modal or otherwise MUST have a valid `dataType` referencing a schema.

### Combobox shows no options

- Is the hook being called in onLoad? (Open the generated TSX to confirm.)
- Is `setSelectXOptions()` inside a `useEffect` with proper deps? A bare `setSelectXOptions(...)` at body level causes infinite re-render and React may bail.
- Does the hook return `{ value, label }` shape? Map it in the useEffect: `.map(d => ({ value: String(d.value), label: d.label }))`.

### Table rows show but actions do nothing / wrong row

- Make sure there's a `tableHiddenCell` with the id field — row actions reference it.
- Check `segments` in `tableLinkAction` use the correct `tag` (must match a field in the table's type).
- Handlers use `rowData.idTbl` or `rowData.<field>` — confirm the mapping useEffect is aliasing correctly.

### Infinite re-render / page hangs

Caused by calling a state setter directly at component body level (outside useEffect). Example:
```js
// BAD
const opts = [...];
setSelectXOptions(opts);

// GOOD
useEffect(() => {
  setSelectXOptions([...]);
}, []);
```

**Subtler variant — re-applying a prefill on every render** (process steps with normalized BPMN variables):

```js
// BAD — `normalized` is a new object reference every render → setForm runs every render
const normalized = normalizeFormVariables(variables, "Task_xData", spec);
useEffect(() => { setFormXData(normalized); }, [normalized]);
```

`normalized` is recomputed each render → new reference → `useEffect` deps see a "change" → `setFormXData` runs → state update triggers re-render → loop.

Two fixes — pick one:

```js
// FIX A — memoize the input
const normalized = useMemo(
  () => normalizeFormVariables(variables, "Task_xData", spec),
  [variables]   // stable reference unless variables actually change
);
useEffect(() => { setFormXData(normalized); }, [normalized]);

// FIX B — dedup via hash of content
const appliedHashRef = useRef<string>("");
useEffect(() => {
  const hash = JSON.stringify(normalized);
  if (appliedHashRef.current === hash) return;  // skip if content unchanged
  appliedHashRef.current = hash;
  setFormXData(normalized);
}, [normalized]);
```

Fix A is preferred (cheaper, idiomatic React). Fix B is the escape hatch when the upstream value really is a fresh object every render and you can't memoize at the source.

### Custom component does not appear in the Studio list / renders as zebra — object-literal default in destructuring

**Symptom:** a new custom component is registered in `igrp.config.ts`, has both `export function <Name>` and `export default <Name>` (correct pattern), but **doesn't appear in the Studio component list** and the JSON node renders as the **yellow zebra-tape placeholder** even after reopening the project and regenerating.

**Root cause (confirmed against the real engine):** `parseComponents` in the nextjs-engine extracts components via **regex**, and drops the component when it can't extract props nor an interface (`if (props.length === 0 && !argumentsInterface) return;`). The destructuring regex is:

```
/^{\s*([^}]*)\s*}\s*:\s*([A-Z][a-zA-Z0-9_]*)/
```

`[^}]*` **does not traverse inner `}`**. A default with an object/array-of-objects literal inside the destructuring breaks the match:

```ts
// ❌ NOT registered — inner braces in the default break the regex
export function MyComponent({
  value = [],
  optionsYesNo = [
    { value: "Y", label: "Yes" },   // ← inner `}` → regex fails → 0 props → dropped
    { value: "N", label: "No" },
  ],
}: MyComponentProps) { ... }
```

**Fix:** move the complex default to a module-level constant + fallback in the body. The destructuring stays free of inner braces and the parser extracts props + `argumentsInterface`:

```ts
// ✅ REGISTERS
const DEFAULT_YES_NO: IGRPOptionsProps[] = [
  { value: "Y", label: "Yes" },
  { value: "N", label: "No" },
];

export function MyComponent({
  value = [],
  optionsYesNo,          // no default in destructuring
}: MyComponentProps) {
  const opts = optionsYesNo?.length ? optionsYesNo : DEFAULT_YES_NO;
  ...
}
```

**General rule:** in the destructuring of custom-component props, defaults may only be **primitives or `[]`** (`= []`, `= ""`, `= false`, `= 0`). Never `= { ... }` nor `= [{ ... }]`.

**Quick diagnostic** (uses the real parser, no Studio needed):

```bash
node -e "
const e = require('@igrp/igrp-studio-nextjs-engine');
e.loadAppExports(process.argv[1]).then(c =>
  console.log(c.components.map(x => x.name).sort().join('\n'))
);
" /path/to/project
```

If a component's function is exported but its name doesn't appear in the list, it was silently dropped — check for object-literal defaults first.

### Custom component renders as a yellow placeholder

**Symptom**: the page mounts but where your custom component (e.g. `SearchEntity`, `ProcessReviewView`) should appear, you see a yellow striped/zebra div with the component name in red text inside it:

```html
<div className="bg-stripes-yellow ...">
  <span className="text-red-500">SearchEntity</span>
</div>
```

**Four possible root causes (check in order):**

1. **`id` prefix mismatch** — the JSON node's `id` doesn't start with the lowercased `componentName`. `searchentity_main` ✅; `sru_main` or `falecido_main` ❌. The engine resolves the import path from the `id` prefix, not from `componentName`.

2. **Component not registered in `src/app/igrp.config.ts`** — even with the correct `id`, the engine refuses to import a path that's not whitelisted in the registry. Fix:
   ```ts
   // src/app/igrp.config.ts
   export default {
     components: [
       ...existing,
       "components/search-entity/search-entity",   // ← ADD THIS
     ],
   }
   ```
   Path rules: relative to `src/app/(myapp)/`, kebab-case, no extension. After editing, rebuild.

3. **`.tsx` file missing or misnamed** — the file at `src/app/(myapp)/components/<kebab>/<kebab>.tsx` doesn't exist, OR the exported function name doesn't match the PascalCase `componentName`. Named exports only (`export function SearchEntity` — never `export default`).

4. **Component-detection scanner rejected the file** — added in `0.2.0-beta.21`. The engine now scans each `.tsx` under `(myapp)/components/` for top-level React components with a strict shape check. Rejections that surface as the yellow placeholder:
   - **Not PascalCase** — `export function searchEntity(…)` or `export const searchEntity = (…)`. React convention: first letter uppercase. Rename → `SearchEntity`.
   - **Bad props signature** — the scanner needs a destructured props object (`{ a, b }: SearchEntityProps`) or a single typed argument (`(props: SearchEntityProps)`). Positional args (`(a: string, b: number) => …`) are treated as helpers, not components. Fix: rewrap the signature.
   - **Props-less component with bare `function X()`** — conservatively rejected. Fix: give it an empty destructure `function SearchEntity({}: {})` (or add a `_?: unknown` prop) so the scanner recognises the shape.
   - **Not top-level** — the scanner ignores functions declared inside another function's body. Move the declaration to module scope.

   Companion issue: **inner helpers no longer leak into the palette**. If you had an older beta emit a `updateRow` or `toggleImediato` custom-component tile that shouldn't be there, the `beta.21+` scanner filters them out — the Studio palette should show only the outer PascalCase component now.

Quick scan to find every custom component referenced but not registered:
```bash
node -e '
const fs=require("fs"),path=require("path");
const registered = new Set(
  require("./src/app/igrp.config.ts").default?.components ?? []
);
const referenced = new Set();
const walk = (n) => {
  if (!n || typeof n !== "object") return;
  if (Array.isArray(n)) return n.forEach(walk);
  if (n.componentName && /^[A-Z]/.test(n.componentName)) referenced.add(n.componentName);
  Object.values(n).forEach(walk);
};
for (const dir of [".igrpstudio/pages", ".igrpstudio/components"]) {
  for (const f of fs.readdirSync(dir)) walk(JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
}
console.log("referenced custom names:", [...referenced]);
console.log("registered paths:", [...registered]);
'
```

### Modal doesn't open

- `openModalX` state exists and is wired in `data.open.state`?
- Button onClick sets the state: `() => setOpenModalX(true)`?
- `modalDialog.interactions.onOpenChange.function.fnCustomSet = "setOpenModalX"`?

### Navigation button doesn't work

**Preferred approach**: use `type: "navigate"` with `navigate: { path: "...", name: "goToX", params: [] }` — the engine auto-imports `useRouter` and auto-declares `const router = useRouter()`, so **you don't add any imports or declarations**.

If the button is still using `type: "function"` with an inline `() => router.push(...)`:
- Switch it to `type: "navigate"` (recommended — declarative, refactor-safe, no manual imports needed)
- OR keep the function handler but then import `useRouter` + declare `const router = useRouter()` in onLoad

**Common fix**: if you see a button wired as `type: "function"` with `fnCustomSet: "() => router.push('some/path')"`, it's almost always better to migrate to:

```json
"onClick": {
  "type": "navigate",
  "function": { "fnCustomSet": "() => router.push('some/path')", "type": "function", "fnCustomCode": { "imports": [] } },
  "action": {},
  "navigate": { "path": "some/path", "name": "goTosomePath", "params": [] }
}
```

AND remove any `useRouter` import from onLoad imports (engine auto-imports it once any navigate button exists).

### SearchGeografia doesn't persist idGeografia (submit returns `0`)

The default pattern in a form component (e.g. an entity form) uses `formform1Ref.current?.setValue(...)` to update hidden fields. This sometimes does NOT propagate to the Zod-backed form submission, resulting in a payload with `idGeografia: 0` (the schema's default).

**Reliable fix** — use a dedicated state + merge in `handleSubmit`:

1. Remove the `inputHidden idGeografia` from the form tree AND from `types[]`
2. Add a state `selectedGeografiaId: number` (default 0)
3. In `handleGeografiaSelect`, set the state:
   ```js
   if (!geografia) return;
   setSelectedGeografiaValue(geografia?.label || '');
   setSelectedGeografiaId(Number(geografia?.value) || 0);
   ```
4. In `handleSubmit`, merge it into the payload:
   ```js
   const payload = { ...values, idGeografia: selectedGeografiaId };
   if (currentItem) update({ id: currentItem.idTbl, data: payload });
   else create({ ...payload, estado: 'A' });
   ```
5. When editing, seed the state from `currentItem` in the onLoad useEffect that reacts to `currentItem`:
   ```js
   setSelectedGeografiaId(currentItem?.idGeografia || 0);
   ```

This applies to any field whose value is chosen via a custom component (SearchGeografia, custom picker) and isn't a real form input the user types into.

---

## Validation-time errors (the file won't even parse)

### Engine error: "X must only contain letters and must not have spaces or special characters"

The engine validates `pageName`, `name`, `componentName`, `parentPageName`, `applicationName` and `description` with strict character classes — but the error message is generic and doesn't tell you what's allowed. The actual rules:

| Field | Allowed |
|---|---|
| `applicationName` | letters + hyphen only |
| `pageName` / `name` / `componentName` / `parentPageName` | **letters only** — no digits, no spaces, no accents, no underscores, no hyphens |
| `description` | **letters, numbers and ASCII spaces only** — no accents, no punctuation, no Unicode |

Common failures and fixes:

| Failing value | Why | Fix |
|---|---|---|
| `pageName: "entities-list"` | hyphen | `"entitiesList"` |
| `pageName: "pagina1"` | digit | `"paginaUm"` or just `"pagina"` |
| `pageName: "página"` | accent | `"pagina"` |
| `description: "Página de clientes"` | accent on `á` | `"Pagina de clientes"` |
| `description: "Users (admin)"` | parentheses | `"Users admin"` |
| `description: "List - filtered"` | hyphen | `"List filtered"` |
| `description: "Gestão, Entidades"` | comma + accent | `"Gestao Entidades"` |

**Rule of thumb when the input is Portuguese:** transliterate to ASCII (`ã→a`, `ç→c`, `é→e`, …) and strip every non-alphanumeric character from `description`. For names, do the same and additionally remove digits, spaces and underscores.

### JSON parse error

- Multi-line string in `fnCode`? Must use `\n` escapes — the JSON file itself is single-line.
- Unescaped quote in string code?
- Trailing comma?
- Unbalanced braces/brackets? Count them.

Quick check:
```bash
node -e "JSON.parse(require('fs').readFileSync('.igrpstudio/pages/xxx.json','utf8'))"
```

### Studio "Save page" rejects with `The types attribute must be an array of valid type definition configuration`

`types[].fields[]` schema is strict — accepts only `{ componentId, name, type, required, defaultValue, isList }` (+ `fields[]`/`label` for nested list fields). Common offenders rejected:

- ❌ `isOptional: true` — not allowed here (it's valid in `args[]`/`arguments[]`, not in `types[].fields[]`)
- ❌ `isNullable: true` — same
- ❌ `isArray: true` — use `isList: true`

**How to make a field optional / nullable**: use `required: false` in the schema + **coerce `null → ''` in the consumer** (e.g. in `onLoad.fnCode` before calling `setForm<X>Data(currentItem)`). The schema doesn't have a native nullable knob — the engine emits `z.string()` regardless of `required`, so the only safe path for nullable values is the consumer coercing them out.

### Duplicate `const [select<tag>Value, …]` — combobox value state declared twice

**Symptom:** generated `.tsx` has the same `const [selectFooValue, setSelectFooValue] = useState(...)` line **twice** → TS2451 "Cannot redeclare block-scoped variable" / build fails.

**Cause:** a `combobox` node with `data.value.state.generate = true` (name `select{{id}}Value`) **already** makes the engine emit that `useState`. If you ALSO add a hand-written `states[]` entry with the same name (e.g. to be able to call `setSelectFooValue(...)` from `onLoad` fnCode), the engine emits it a second time.

**Fix:** do NOT declare `select<tag>Value` in `states[]`. The combobox already generates both the state and its setter, and the setter IS callable from `onLoad` fnCode without any extra declaration. Only declare states in `states[]` for genuinely custom states (cardDetails items, current<Entity>, value-display states for search widgets, pdf url, etc.). If you must drive a combobox's value from code, just reference `setSelect<tag>Value` — it exists.

### Studio "Save page" rejects with `must have required property 'isNullable'` / `must NOT have additional properties` on `/functions/<n>/returnValue`

iGRP Studio's JSON-schema validator runs on save. The `returnValue` shape is strict:

```json
"returnValue": { "type": "void", "isNullable": true }   // ✅
"returnValue": { "type": "any",  "isNullable": false }  // ✅ (mirrors handleSave/handleComplete)
```

Common mistakes:
- ❌ `{ "type": "void", "isOptional": true, "isList": false }` — `isOptional`/`isList` are NOT allowed on `returnValue` (they're only for `args[]` / `arguments[]`).
- ❌ Missing `isNullable` — required.

**Fix:** for every `functions[].returnValue`, replace any other keys with `isNullable` only. The error message includes the function index (`/functions/2/returnValue` → 3rd entry, 0-indexed).

Quick replace across a step JSON:
```bash
sed -i '' 's|"returnValue":{"type":"void","isOptional":true,"isList":false}|"returnValue":{"type":"void","isNullable":true}|g' .igrpstudio/process/<X>/<step>.v1.json
```

### Duplicate tags/IDs

```bash
node -e "
const fs=require('fs');
const j=JSON.parse(fs.readFileSync('.igrpstudio/pages/xxx.json','utf8'));
const tags={}, ids={};
(function walk(o){if(!o||typeof o!=='object')return;if(Array.isArray(o))return o.forEach(walk);
if(o.tag&&o.componentName){tags[o.tag]=(tags[o.tag]||0)+1}
if(o.id&&o.componentName){ids[o.id]=(ids[o.id]||0)+1}
Object.values(o).forEach(v=>v&&typeof v==='object'&&walk(v))})(j);
Object.entries(tags).filter(([,c])=>c>1).forEach(([t,c])=>console.log('DUP TAG',t,c));
Object.entries(ids).filter(([,c])=>c>1).forEach(([i,c])=>console.log('DUP ID',i,c));
"
```

### Numeric argument IDs

```bash
node -e "
const c=require('fs').readFileSync('.igrpstudio/pages/xxx.json','utf8');
const matches=[...c.matchAll(/\"id\"\\s*:\\s*(\\d+)/g)];
matches.forEach(m=>console.log('numeric id:',m[1]));
"
```

Every `arg.id` and `argument.id` MUST be a string (`"1"`).

---

## Diagnostic workflow

When facing an issue:

1. **Read the error message carefully** — does it reference a specific file path? If under `(generated)/`, open that TSX file at the line.
2. **Find the corresponding JSON** — map the TSX path to `.igrpstudio/pages/<name>.json` or `.igrpstudio/components/<name>.json`.
3. **Identify what part of the JSON produces that TSX line**:
   - Top imports → check function `imports[]` and onLoad `imports[]`
   - State declarations → check `states[]`
   - `const router`, `const { igrpToast }` → auto-emitted by the engine
   - Function declarations → `functions[]`
   - onLoad hooks → `components.interactions.onLoad.function.fnCustomCode.fnCode`
   - JSX tree → `components.children[...]`
4. **Fix in JSON**, validate, request regeneration (or patch TSX as a temporary workaround).
5. **Re-run build** to confirm.

---

## Detective tips

### Find all forms missing dataType
```bash
node -e "
const fs=require('fs'),p=require('path');
const dir='.igrpstudio/pages';
fs.readdirSync(dir).filter(f=>f.endsWith('.json')).forEach(f=>{
  const j=JSON.parse(fs.readFileSync(p.join(dir,f),'utf8'));
  (function walk(o){if(!o||typeof o!=='object')return;if(Array.isArray(o))return o.forEach(walk);
  if(o.componentName==='form'&&(!o.dataType||o.dataType==='')){console.log(f,'form tag:',o.tag)}
  Object.values(o).forEach(v=>v&&typeof v==='object'&&walk(v))})(j);
});
"
```

### Find all forbidden deprecated components
```bash
grep -l '\"datePicker\"\|\"tableLinkButton\"\|\"tableButtonListCell\"\|\"process\"' .igrpstudio/pages/*.json .igrpstudio/components/*.json
```

### Check every page has `useRouter` when `router.push` is used
```bash
for f in .igrpstudio/pages/*.json; do
  if grep -q "router\.push" "$f" && ! grep -q "useRouter" "$f"; then
    echo "MISSING useRouter import: $f"
  fi
done
```

### Check state setters aren't called outside useEffect in onLoad
Manual inspection needed — search for `set<Name>(...)` calls in fnCode that are not within `useEffect(() => { ... }, [...])`.

---

## Prevention checklist — run before publishing a new page / step / component

Five quick checks that catch the most common silent failures observed in production:

**1. Every form-input has `dataProperties`** — otherwise the field is dropped from the form schema on save:
```bash
node -e '
const fs=require("fs");
const inputs=new Set(["inputText","inputNumber","inputHidden","inputTextarea","inputDatePicker","inputDatePickerSingle","combobox","select","inputFile"]);
const j=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));
const walk=(n)=>{ if(!n||typeof n!=="object")return; if(Array.isArray(n))return n.forEach(walk);
  if(inputs.has(n.componentName)&&!n.properties?.dataProperties) console.log("MISSING dataProperties:",n.id,n.componentName);
  Object.values(n).forEach(walk); };
walk(j.components);
' .igrpstudio/pages/<file>.json
```

**2. Every custom `componentName` is registered in `igrp.config.ts`** — otherwise yellow placeholder.

**3. Every state `id` starts with `state_`** — otherwise stray `;` in generated TSX:
```bash
node -e '
const fs=require("fs");
const j=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));
(j.states||[]).forEach(s=>{ if(!/^state_/.test(s.id)) console.log("BAD state id:",s.id,s.name) });
' .igrpstudio/pages/<file>.json
```

**4. Every `types[].name` starts with uppercase** — otherwise invalid TS:
```bash
node -e '
const fs=require("fs");
const j=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));
(j.types||[]).forEach(t=>{ if(t.name && t.name[0]!==t.name[0].toUpperCase()) console.log("LOWERCASE type:",t.name) });
' .igrpstudio/pages/<file>.json
```

**5. No duplicate tags inside the same page** — collision means renamed-tag-leak risk (see "Backend 400/500" section). One-shot scan:
```bash
node -e '
const fs=require("fs");
const j=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));
const seen=new Set(),dupes=new Set();
const walk=(n)=>{ if(!n||typeof n!=="object")return; if(Array.isArray(n))return n.forEach(walk);
  if(n.tag){ if(seen.has(n.tag)) dupes.add(n.tag); else seen.add(n.tag); }
  Object.values(n).forEach(walk); };
walk(j.components);
if(dupes.size) console.log("DUPLICATE tags:",[...dupes]);
' .igrpstudio/pages/<file>.json
```

Run all five before considering a manifest done. Each takes < 2 seconds.

---

## CLI engine gotchas (`igrp gen`)

The `igrp gen page` engine differs from older engine builds that may have generated parts of the repo. Regenerating an older page **surfaces latent incompatibilities** — they are real (any current-engine regen, CLI or Studio, hits them), so fix them forward in the **JSON**, then regenerate. Verify with `npx tsc --noEmit -p .` and loop until clean.

The four known divergences and their JSON fixes:

### 1. `defaultValue` is wrapped in a template literal

The engine emits every state/field `defaultValue` as `` useState<string>(`<value>`) `` — the raw string goes **inside backticks**. Consequences:

- `defaultValue: "''"` → renders the literal 2-char string `''` in the input. **Use `""`** (empty) + `isOptional: true`.
- `defaultValue: "'Create X'"` (the old modal-title hack) → title shows `'Create X'` **with quotes**. **Use `"Create X"`** (no surrounding quotes).
- A "today" date default → **use `"new Date()"`** on a `date`-typed field; the engine emits it as a raw expression for `date` fields.

Normalize the whole tree (defaults live both in top-level `states[]` and inline in combobox `data.value.state.defaultValue`).

### 2. Combobox auto-state uses the tag's ORIGINAL casing

The engine generates `select<tag>Value` / `select<tag>Options` from the combobox `tag` **verbatim — no capitalization**. Tag `myCombo` → `selectmyComboValue` / `setSelectmyComboValue`. Hand-written `onLoad`/`functions[]` code that references the state (older engines capitalized: `selectMyCombo…`) must match the exact generated name. Replace any capitalized references (`SelectMyCombo…` → `SelectmyCombo…`) everywhere in the JSON (onLoad **and** functions).

### 3. `initForm` is `z.infer<T>`, not `Partial<z.infer<T>>`

Older engines wrapped the form-init object in `Partial<>`, so `undefined` defaults compiled. The current engine does not. Therefore **every `required` form field must have a type-valid default** in `types[].fields[]`, or you get `Type 'undefined' is not assignable to type 'number' | 'Date'`:

- required `number` → `defaultValue: "0"`
- required `date` → `defaultValue: "new Date()"`
- required `string` → `""` is fine
- `required: false` fields may stay empty (schema is `.optional()`, accepts `undefined`)

Note the UX side effect: a required field now initialises to `0` / today instead of blank. If the page's `onLoad` already resets `form1Data` with explicit `?? ''` on `[currentItem]`, that override wins at runtime and there is no visible change; otherwise the default shows for new records.

### 4. Numeric inputs emit a numeric `placeholder`

For `inputNumber` (and `inputText` with `type: "number"`), the engine emits `placeholder={0}` (a number) even when the JSON `placeholder` is the string `"0"` → `Type 'number' is not assignable to type 'string'`. **Remove `placeholder` from numeric inputs.**

---

## When to escalate / ask the user

- Backend endpoint not implemented (the frontend can't do this alone)
- Business logic unclear (which fields to show, what validations)
- Multiple valid design options (modal vs separate page, inline vs dropdown actions)
- User is on an outdated iGRP Studio version (some components may not exist yet)

Don't guess at business semantics — confirm first.
