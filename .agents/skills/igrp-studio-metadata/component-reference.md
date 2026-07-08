# Component Reference — Detailed

Complete component catalogue with typical properties. Reference this when writing component JSON nodes.

## Core layout

### `page`
Root wrapper for `type: "page"` files.
```json
{ "componentName": "page", "properties": { "variant": "default", "commonProperties": { "generateReference": false } } }
```

### `component`
Root wrapper for `type: "component"` files. Usually just wraps children.

### `processStep`
Root wrapper for `type: "processStep"` files.

### `section`
```json
"properties": { "spaceX": "3", "spaceY": "6", "commonProperties": {} }
```

### `container` / `column`
Plain `<div>`. Properties: `className`, `commonProperties`.

### `grid`
```json
"properties": {
  "gap": 4,
  "variant": { "default": "cols4", "md": "cols2", "lg": "cols4" },
  "commonProperties": { "generateReference": false }
}
```
Valid `cols` values: `"cols1"`, `"cols2"`, `"cols3"`, `"cols4"`.

### `flex`
```json
"style": {
  "layout": {
    "type": "flex",
    "flex": {
      "direction": "row", "wrap": "wrap",
      "alignItems": "center", "justifyContent": "space-between", "gap": "2"
    }
  }
}
```

---

## Inputs

### `inputText`
```json
{
  "componentName": "inputText",
  "tag": "nome",
  "properties": {
    "label": "Nome",
    "placeholder": "Insira o nome",
    "required": true,
    "iconProperties": { "showIcon": false },
    "dataProperties": { "isVirtual": false, "isType": true },
    "commonProperties": { "generateReference": false }
  }
}
```

### `inputNumber`
```json
"properties": {
  "label": "Montante",
  "required": true,
  "min": 1, "step": 1,
  "placeholder": "Insira o montante"
}
```

### `inputTextarea`
```json
"properties": {
  "label": "Observações",
  "placeholder": "...",
  "rows": 4
}
```

### `inputDatePicker`
```json
"properties": {
  "label": "Data",
  "placeholder": "Selecione a data...",
  "required": true,
  "gridSize": "full",
  "dateFormat": "dd/MM/yyyy"
}
```

### `inputHidden` — USE FOR IDs
```json
{
  "componentName": "inputHidden",
  "tag": "idFoo",
  "properties": {
    "label": "idFoo",
    "required": true,
    "dataProperties": { "isVirtual": false, "isType": true }
  }
}
```

### `inputSearch` — for list page headers
```json
"properties": {
  "placeholder": "Pesquisar...",
  "showSubmitButton": true,
  "submitButtonLabel": "Pesquisar",
  "iconProperties": { "showStartIcon": true, "startIcon": "Search", "submitIcon": "ArrowRight" },
  "className": "flex-1 min-w-[240px]"
}
```
Interactions typically use `onSearch`:
```json
"interactions": {
  "onSearch": { "type": "function", "function": { "fnCustomCode": { "imports": [] }, "fnCustomSet": "(value) => setSearchValue(value as string)" } }
}
```

### `inputFile`
For multipart uploads. Consumed by `form` as binary/file data.

**New in `0.2.0-beta.18` — dropzone variant.** Set `variant: "dropzone"` to render an interactive drag-and-drop area instead of the default file button:

```json
"properties": {
  "label": "Upload files",
  "variant": "dropzone",
  "accept": "image/*,application/pdf",
  "acceptTypes": "image/*,application/pdf",
  "maxSize": 5242880,               // bytes; 5 MB
  "maxFiles": 10,
  "multiple": true,
  "dropzoneLabel": "Drag files here",
  "dropzoneHint": "PNG, JPG or PDF up to 5 MB",
  "dragActiveLabel": "Drop to upload",
  "dragRejectLabel": "File type not accepted",
  "maxSizeLabel": "File too large",
  "maxFilesLabel": "Too many files",
  "removeLabel": "Remove",
  "removeAllLabel": "Remove all",
  "rejectedAlertTitle": "Some files were rejected"
}
```

For `variant: "default"` (the classic file button), only `accept`, `multiple`, `disabled` matter — ignore the dropzone-only props.

### `inputColor`
**Prop shape changed in `0.2.0-beta.17`.** `showHexValue` was **removed** and replaced by a multi-format API:

```json
"properties": {
  "label": "Cor",
  "value": "#0066cc",
  "format": "hex",           // "hex" | "rgb" | "hsl"
  "defaultFormat": "hex",
  "showFormatValue": true,
  "formatOptions": "hex,rgb,hsl"    // comma-list of formats the picker offers
}
```

**Migration note.** Any legacy JSON still setting `showHexValue` is silently ignored — the picker falls back to `format: "hex"`. Replace `showHexValue: true` with `format: "hex", showFormatValue: true`. `showHexValue: false` corresponds to `showFormatValue: false`.

---

## Selection

### `combobox`
See Pattern 5 in SKILL.md. Key properties:
- `variant`: `"single"` or `"multiple"`
- `showSearch`: boolean
- `gridSize`: `"full"` or omit
- `required`: boolean
- `placeholder`, `selectLabel` (empty state text)
- `options`: `[]` when dynamically populated; OR static `[{value, label}]` array

### `select`
Simpler than combobox — no search. Same options shape.

### `radio` / `checkbox` / `switch`
Standard toggle inputs. `switch` is an alternative to checkbox for boolean data.

---

## Date pickers

| Component | Generated import | Description |
|---|---|---|
| `inputDatePicker` | `IGRPDatePicker` | Single date, formatted input |
| `inputDatePickerSingle` | `IGRPDatePickerInputSingle` | **Prefer this for single date in process steps** — verified working in P3.2.7. ⚠️ Do NOT confuse with `IGRPDatePickerSingle` (a different design-system component, mapped from a different JSON name) |
| `datePickerRange` | `IGRPDatePickerRange` | Date interval (start + end) |
| `datePickerMultiple` | `IGRPDatePickerMultiple` | Multiple independent dates |
| `calendarSingle` | — | Inline calendar, single date |
| `calendarRange` | — | Inline calendar, range |
| `calendarMultiple` | — | Inline calendar, multiple |
| `calendarSingleTime` | — | Single date + time |
| `calendarRangeTime` | — | Range + time |
| `calendarMultipleTime` | — | Multiple + time |
| `inputTime` | — | Time only |
| `datePicker` | — | **DEPRECATED — NEVER USE** |

> The design system exports both `IGRPDatePickerSingle` (`./components/horizon/input/date-picker/single`) and `IGRPDatePickerInputSingle` (`./components/horizon/input/date-picker/input-single`). They render differently. The componentName → import mapping is what the engine emits — pick the JSON name based on the component you actually want.

Range picker interaction:
```json
"interactions": {
  "onDateChange": {
    "type": "function",
    "function": { "fnCustomCode": { "imports": [] }, "fnCustomSet": "setDatePickerRangeDate" }
  }
}
```

---

## Buttons

### `button`
```json
{
  "componentName": "button",
  "properties": {
    "content": "Guardar",
    "variant": "default",      // "default" | "outline" | "ghost" | "destructive" | "secondary" | "link"
    "size": "default",          // "xs" | "sm" | "default" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg"
    "iconProperties": { "showIcon": true, "iconName": "Save" },
    "iconClassName": "h-4 w-4",   // fine-tune icon styling
    "disabled": false,
    "loading": false,             // spinner + disabled while true
    "loadingText": "A guardar…",  // content replacement while loading; falls back to content
    "asChild": false,             // render as its child element (rare; used with tooltip triggers etc.)
    "type": "button",             // "button" | "submit" | "reset"
    "ariaLabel": "Save form"      // required when the button is icon-only
  }
}
```

**New in `0.2.0-beta.18`:** `loading`, `loadingText`, `asChild`, `type`, `iconClassName`, `ariaLabel`, and the extended `size` scale (`xs`, `icon-xs`, `icon-sm`, `icon-lg`). For submit buttons inside a `form`, prefer `type: "submit"` + `interactions.onClick.type: "formSubmit"` over a manual `router.push` handler — the engine wires the form ref for you.

### `copyTo`
Click-to-copy widget.

---

## Cards & stats

### `card` + children
```json
{
  "componentName": "card",
  "children": [
    { "componentName": "cardHeader", "children": [{ "componentName": "headline", "properties": { "title": "Título" } }] },
    { "componentName": "cardContent", "children": [...] },
    { "componentName": "cardFooter", "children": [...] }
  ]
}
```

### `statsCard`
```json
{
  "componentName": "statsCard",
  "tag": "totalFoo",
  "data": {
    "value": { "state": { "name": "statstotalFooValue", "type": "string | number", "defaultValue": "0", "generate": true } }
  },
  "properties": {
    "cardBorderPosition": "top",
    "cardBorder": "rounded-md",
    "cardVariant": "info",      // "info" | "success" | "warning" | "indigo" | "secondary"
    "iconBackground": "rounded",
    "title": "Total",
    "titleSize": "sm", "valueSize": "sm",
    "iconProperties": { "showIcon": true, "iconName": "Building", "iconSize": "md", "iconVariant": "info", "iconPlacement": "end" },
    "itemPlacement": "start",
    "showIconBackground": true
  }
}
```

### `infoCard` / `infoSection` / `infoItem`
Sectioned info display, used in view pages.

### `cardDetails` / `cardDetailsItem`
Alternative details layout.

### `statusBanner`
Top-of-page status indicator — use in view pages.
```json
"data": { "color": { "state": { "name": "bannerColor", ... } } }
```

---

## Typography

### `headline`
```json
"properties": {
  "title": "Ações Rápidas",
  "description": "",
  "variant": "h6",           // h1..h6
  "roleColor": "solid",
  "color": "primary",
  "iconProperties": { "showIcon": true, "iconName": "Wallet" }
}
```

### `text`, `span`, `paragraph`, `label`
Simple text wrappers. `paragraph` → `<p>`.

### `badge`
Inline status marker. Has `variant`.

### `icon`
Lucide icon renderer.

---

## Tables

### `table` (root)
```json
{
  "componentName": "table",
  "tag": "table1",
  "dataType": "Table1",
  "data": {
    "data": {
      "state": { "name": "tableData", "generate": false }   // bind to existing state
    }
  },
  "properties": {
    "showFilter": false,
    "showPagination": true,
    "isNumericPagination": true,
    "tableClassName": "rounded-none",
    "paginationClassName": "px-3 pb-3",
    "commonProperties": { "generateReference": false }
  },
  "rules": [{ "type": "visibility", "condition": "!isLoading" }],
  "children": [
    { "componentName": "tableColumns", "children": [/* cells */] },
    { "componentName": "tableFilters", "children": [/* optional filters */] }
  ]
}
```

### Cells

#### `tableHiddenCell` — essential for row identity
```json
{
  "componentName": "tableHiddenCell",
  "tag": "id",
  "properties": { "headerTitle": "id" }
}
```

#### `tableTextCell`
```json
"properties": {
  "headerTitle": "Nome",
  "headerType": "sortToggle",   // enables click-to-sort
  "variant": "default"
}
```

#### `tableBadgeCell`
```json
{
  "componentName": "tableBadgeCell",
  "tag": "estado",
  "properties": {
    "headerTitle": "Estado",
    "variant": "soft",
    "iconProperties": { "showIcon": false }
  },
  "interactions": {
    "customize": {
      "type": "function",
      "function": {
        "type": "function",
        "fnCustomCode": { "imports": [{ "namespace": "import {getStatusBadge} from '@/app/(myapp)/functions/shared'", "id": "<10char>" }] },
        "fnName": "getStatusBadge"
      }
    }
  }
}
```
The `customize` function signature:
```ts
function getStatusBadge(rowData: any): {
  bgClass: string;
  textClass: string;
  iconName: string;
  label: string;
  className: string;
}
```

#### `tableAmountCell`
```json
"properties": {
  "headerTitle": "Montante",
  "currency": "XOF",
  "language": "pt-PT"
}
```

#### `tableDateCell`
Locale-aware date rendering. **Always prefer this over `tableTextCell` for date/datetime fields** — the cell handles parsing & formatting natively so you don't pre-format in `onLoad`.

```json
{
  "componentName": "tableDateCell",
  "label": "Date Column",
  "tag": "dataEnvio",
  "properties": {
    "headerTitle": "Data",
    "dateFormat": "dd/MM/yyyy",        // or "dd/MM/yyyy HH:mm" for datetime
    "variant": "default",
    "headerType": "sortToggle"
  }
}
```

Type entry stays `"type": "string"` (backend still delivers an ISO string). Do **not** map the field through `formatDateBR`/`formatDateTimeBR` in the onLoad — the cell expects the raw ISO value.

Use `formatDateBR` / `formatDateTimeBR` from `@/app/(myapp)/lib/utils` only for places that are *not* a date column — e.g. stats-card values, modal headers, toast messages.

### Row actions

#### `tableActionListCell` (wrapper)
```json
{
  "componentName": "tableActionListCell",
  "tag": "tableActionListCell1",
  "children": [
    /* tableLinkAction, tableAlertAction, tableModalAction, tableDropdownMenuCell */
  ],
  "properties": {
    "headerTitle": "",
    "type": "inline",
    "className": "text-center"
  }
}
```

#### `tableLinkAction`
```json
{
  "componentName": "tableLinkAction",
  "properties": {
    "labelTrigger": "Visualizar",
    "iconProperties": { "iconName": "Eye" },
    "variant": "ghost",
    "href": "entities/[uuid]",
    "segments": [{ "name": "[uuid]", "tag": "contribuinteId", "context": "column" }],
    "params": []
  }
}
```
Can have `rules: [{type:"visibility", condition:"rowData.estado === 'ACT'"}]` for conditional display.

#### `tableAlertAction`
```json
{
  "componentName": "tableAlertAction",
  "interactions": {
    "onClickConfirm": {
      "type": "function",
      "function": {
        "type": "function",
        "fnCustomCode": { "imports": [] },
        "fnCustomSet": "() => deleteItem(rowData.id)"
      }
    }
  },
  "properties": {
    "labelTrigger": "Eliminar",
    "iconProperties": { "iconName": "Trash" },
    "variant": "ghost",
    "title": "Eliminar",
    "content": "Tem certeza?",
    "showCancel": true, "labelCancel": "Cancelar", "variantCancel": "outline",
    "showConfirm": true, "labelConfirm": "Confirmar", "variantConfirm": "destructive",
    "segments": [], "params": []
  }
}
```

#### `tableModalAction`
Opens a modal on click. Props are same as link but with modal ref rather than href.

#### `tableDropdownMenuCell` (wrapper for many actions)
```json
{
  "componentName": "tableDropdownMenuCell",
  "children": [
    /* tableCustomDropdownItem, tableLinkDropdownItem, tableAlertDropdownItem, tableModalDropdownItem */
  ],
  "properties": {
    "labelTrigger": "Ações",
    "iconProperties": { "iconName": "ArrowRight" },
    "variant": "default"
  }
}
```

Items mirror the action variants but as dropdown items. Use dropdown only when you have 3+ actions. For 1-2 simple actions prefer inline `tableAlertAction`/`tableLinkAction`.

### Filters (inside `tableFilters`)
- `tableInputFilter` — text search
- `tableSelectFilter` — enum dropdown
- `tableDropdownFilter` — multi-select enum
- `tableFacetedFilter` — faceted multi-value filter
- `tableDateFilter` — single date
- `tableMinMaxFilter` — numeric range

---

## Forms & modals

### `form`
```json
{
  "componentName": "form",
  "tag": "form1",
  "dataType": "Form1",
  "data": {
    "defaultValues": {
      "state": { "id": "<10char>", "type": "any", "name": "form1Data", "defaultValue": "initForm1", "imports": [], "generate": true }
    }
  },
  "interactions": {
    "onSubmit": {
      "type": "function",
      "function": { "fnName": "handleSubmit", "type": "function", "fnCustomCode": { "imports": [] } },
      "action": { "actionCustomSet": "(e) => {}" }
    }
  },
  "properties": {
    "validationMode": "onBlur",
    "commonProperties": { "generateReference": false }
  },
  "children": [ /* input components */ ]
}
```

**`dataType` must match a `types[]` entry.** Empty dataType → runtime `'_def' in undefined` error.

### `formList`
Repeatable form for array fields in API request bodies.

### `modalDialog` and children
```json
{
  "componentName": "modalDialog",
  "interactions": {
    "onOpenChange": {
      "type": "function",
      "function": { "fnCustomCode": { "imports": [] }, "fnCustomSet": "setOpen" }
    }
  },
  "data": { "open": { "state": { "name": "open", "generate": false } } },
  "children": [
    {
      "componentName": "modalDialogContent",
      "properties": { "size": "lg" },         // "sm" | "md" | "lg" | "full"
      "children": [
        {
          "componentName": "modalDialogHeader",
          "children": [
            { "componentName": "modalDialogTitle", "properties": { "content": "Título" } },
            { "componentName": "modalDialogDescription", "properties": { "content": "Descrição" } }
          ]
        },
        { "componentName": "form", "tag": "form1", /* ... */ },
        {
          "componentName": "modalDialogFooter",
          "children": [
            { "componentName": "button", "properties": { "content": "Cancelar", "variant": "outline" }, "interactions": { "onClick": { "type": "function", "function": { "fnCustomSet": "() => setOpen(false)", "type": "function", "fnCustomCode": { "imports": [] } } } } },
            { "componentName": "button", "properties": { "content": "Guardar", "variant": "default" }, "interactions": { "onClick": { "type": "formSubmit", "function": { "fnCustomSet": "() => {}", "type": "function", "fnCustomCode": { "imports": [] } }, "action": {}, "formSubmit": { "formId": "", "targetForm": "form1" } } } }
          ]
        }
      ]
    },
    { "componentName": "modalDialogTrigger", "children": [] }   // usually empty
  ]
}
```

Title can be state-bound:
```json
"modalDialogTitle": {
  "data": { "content": { "state": { "name": "modalDialogTitle1Content", "generate": false } } },
  "properties": { "content": "" }   // fallback
}
```

---

## Navigation

### `pageHeader`
```json
{
  "componentName": "pageHeader",
  "tag": "pageHeader1",
  "children": [ /* action buttons (usually one [Novo] button) */ ],
  "properties": {
    "title": "Entities",
    "description": "Manage entities",
    "variant": "h3",
    "iconProperties": { "iconBackButton": "Search" },
    "showBackButton": false,
    "urlBackButton": "..."
  }
}
```

### `menuNavigation` + `menuNavigationItem`
Used to switch sections within a form (side tabs).

### `button` — required "trivial" fields

The engine expects every `button` node to include `"style": {}` even when empty. **Without it, the engine emits a stray `;` after `</IGRPButton>`** in the generated TSX (broken code path). Same class of bug as the state-id convention.

```json
{
  "id": "button_xyz",
  "tag": "buttonXxx",
  "componentName": "button",
  "label": "Button",
  "type": "group",
  "children": [],
  "interactions": { /* ... */ },
  "data": {},
  "properties": { /* ... */ },
  "childProperties": {},
  "style": {}                      // ← REQUIRED, even if empty
}
```

### `alert` — message goes in a `text` child, NOT via `data.children`

The engine has a bug when binding `data.children.value.code` on an `alert` node — it emits:
```jsx
<IGRPAlert children={errorMessage}>
  <></>   {/* empty fragment overrides the children prop */}
</IGRPAlert>
```
Result: alert shows up but the message is empty.

✅ Canonical pattern (from `.igrpstudio/components/FalecimentoUtente.json`): add a **`text` child component** with `data.content.state.name` bound to the message state.

```json
{
  "id": "alert_xyz",
  "tag": "alertXxx",
  "componentName": "alert",
  "type": "group",
  "data": {},   // no children binding
  "children": [
    {
      "id": "text_xyz",
      "tag": "textAlertMessage",
      "componentName": "text",
      "children": [],
      "data": { "content": { "state": { "id": "", "name": "errorMessageStateName", "type": "", "imports": [], "generate": false } } },
      "properties": { "content": "", "variant": "primary", "weight": "normal", "size": "default", "align": "left", "spacing": "normal", "maxLines": 3, "commonProperties": { "generateReference": false } },
      "childProperties": {}
    }
  ],
  "properties": { "color": "destructive", "variant": "soft", "iconProperties": {...}, ... },
  "rules": [{ "type": "visibility", "condition": "errorMessageStateName" }]
}
```

The state `errorMessageStateName` is declared in `states[]` (e.g. `string` with `isOptional: true`). The hook sets it via `setErrorMessageStateName(...)`. Visibility rule on the `alert` hides it when the message is empty.

### `tabs` + `tabsItem`
Horizontal tabs with independent content children.

⚠️ **`tabsItem` requires `"type": ""`** (empty string) at the node root level — many other components use `"type": "group"`, but tabsItem uses empty. Mirror the canonical references (`P1.2.10`, `P1.2.11`).

⚠️ **`pdfViewer` properties require `className: ""` and `date: "<YYYY-MM-DD>"`** even when not used — engine has them as required defaults.

> **General rule discovered (Recibo tab incident):** when adding a new component node, copy the canonical reference structure verbatim — including fields that look empty/redundant (`"style": {}`, `"type": ""`, `"className": ""`, etc.). Missing any of these triggers the engine's broken code path → stray `;` in TSX. Don't omit "looks empty so I'll skip it" fields.

**Navigation is built-in.** Tabs are clickable by default — the user moves between them by clicking the tab header. **Do NOT add Seguinte/Voltar buttons** with `setSelectedTab(...)` unless the design REALLY mandates a wizard-style flow with controlled state. The default uncontrolled behaviour (no `data.value.state` binding on the `tabs` node) is what every shipped process uses.

If you need a stepper-style visual (numbered circles connected by lines, e.g. for "Step 1 → Step 2 → Step 3" wizards):
- **New in `0.2.0-beta.18`:** the engine exposes `stepperUI` (`componentName: "stepperUI"`) which wraps the shadcn `<Stepper>` primitive. This is the right choice for a linear multi-step form flow inside a single page. Props: `defaultValue: number`, `value?: number`, `orientation: "horizontal" | "vertical"`. See the "New primitives" section below for the full example.
- The design system also exports `IGRPStepperProcess` at `./components/horizon/process/stepper` — that's the BPMN-style workflow stepper used implicitly by `.igrpstudio/process/*.json` files via the `processStep` type. Don't reference it directly from page JSON; use `stepperUI` or `processStep` instead.
- If you just need a stepper visual and don't care about the underlying pattern, `stepperUI` is the safe default.

### `dropdown` + `dropdownItem`
Click-triggered dropdown (outside of tables).

### `accordion` + `accordionItem`
Collapsible sections.

---

## Charts
- `areachart`, `linechart`, `piechart`
- `horizontalbarchart`, `verticalbarchart`
- `radarchart`, `radialbarchart`

Standard props include chart data state binding and axis configuration.

---

## Misc

### `repetitiveList`
Repeats its children N times (good for dynamic lists that aren't tables).

### `textList` + `textListItem` + `textListItemContent` + `textListSubItems`
Hierarchical text list.

### `chat`
Chat UI component.

### `carousel`
Slider/carousel.

### `pdfViewer`, `videoEmbed`, `image`
Media renderers.

---

## Customizing child styling

`childProperties` applies to all children uniformly:
```json
"childProperties": { "className": "col-span-1" }
```

---

## New primitives (from `0.2.0-beta.17`+)

These thin wrappers over the design-system primitives were added over `beta.17` → `beta.21`. They all sit inside `properties` — no data bindings needed unless noted. Group them under `overlays`, `feedback`, `forms`, `navigation`, `layout`, `typography`, `media`, `dataDisplay` in the Studio palette.

### `banner` — full-width announcement / cookie banner
```json
"properties": {
  "variant": "announcement",     // "cookie" | "announcement" — REQUIRED
  "message": "New feature available",
  "learnMoreHref": "https://…",
  "learnMoreLabel": "Learn more",
  "acceptLabel": "Accept",
  "declineLabel": "Decline"
}
```
Interactions: `onAccept`, `onDecline`, `onDismiss`.

### `notification` — toast-like inline notification
```json
"properties": {
  "variant": "info",             // "info" | "success" | "warning" | "destructive"
  "title": "Success",
  "description": "Saved.",
  "content": "Optional body text",
  "showIcon": true,
  "iconName": "CircleCheck",
  "showClose": true,
  "showLink": false,
  "lableLink": "Undo",           // note: DS prop is intentionally "lableLink" (sic)
  "actionLink": "/undo",
  "border": false
}
```

### `tooltip`, `hoverCard`, `popover` — anchored overlays
Each takes:
```json
"properties": {
  "content": "Delete this row",      // tooltip content (tooltip only)
  "side": "top",                     // "top" | "right" | "bottom" | "left"
  "align": "center",                 // "start" | "center" | "end"
  "sideOffset": 4,
  "delayDuration": 100                // tooltip only
}
```
Currently scaffolded as parent-only shells — the shadcn-style child parts (`TooltipTrigger`, `PopoverContent`, `PopoverAnchor`, etc.) aren't yet exposed as separate engine components. Use for simple message overlays; for rich anchored menus, use a custom React component.

### `sheet`, `drawer` — slide-in / bottom-drawer panels
```json
"properties": {
  "side": "right",                   // sheet only: "top" | "right" | "bottom" | "left"
  "title": "Filters",
  "description": "Refine your search",
  "open": false                      // usually bound via data.open.state
}
```

### `command` — search / command palette
```json
"properties": {
  "placeholder": "Type a command or search…",
  "emptyText": "No results."
}
```

### `pagination` — standalone pagination bar
```json
"properties": {
  "currentPage": 1,
  "totalPages": 10,
  "previousLabel": "Previous",
  "nextLabel": "Next"
}
```
Prefer the `table` component's built-in pagination for lists — this is for standalone pagination outside a table (e.g. paginated card lists).

### `breadcrumb`
```json
"properties": {
  "items": [
    { "label": "Home", "href": "/" },
    { "label": "Users", "href": "/users" },
    { "label": "John Doe" }
  ]
}
```

### `navigationMenu`
```json
"properties": { "viewport": true }
```
Parent shell only — see note on `tooltip`/`popover` above.

### `menubar` + 15 children
Full compound menubar tree — parent `menubar` accepts `menubarMenu` children, each of which contains a `menubarTrigger` + `menubarContent`; `menubarContent` accepts `menubarItem`, `menubarSeparator`, `menubarLabel`, `menubarCheckboxItem`, `menubarRadioGroup` (with `menubarRadioItem` children), `menubarShortcut`, and `menubarSub` (containing `menubarSubTrigger` + `menubarSubContent`).

Skeleton:
```json
{ "componentName": "menubar", "children": [
  { "componentName": "menubarMenu", "children": [
    { "componentName": "menubarTrigger", "properties": { "content": "File" } },
    { "componentName": "menubarContent", "children": [
      { "componentName": "menubarItem", "properties": { "content": "New" } },
      { "componentName": "menubarSeparator" },
      { "componentName": "menubarSub", "children": [
        { "componentName": "menubarSubTrigger", "properties": { "content": "More" } },
        { "componentName": "menubarSubContent", "children": [ /* nested items */ ] }
      ]}
    ]}
  ]}
]}
```

Item props: `content: string`, `disabled?: boolean` (item), `checked?: boolean` (checkbox item), `value` (radio item), `value` (radio group).

### `progress`
```json
"properties": {
  "value": 65,
  "indicatorClassName": "bg-emerald-500"
}
```

### `skeleton`, `spinner`, `loadingSpinner`, `empty` — feedback / loading state
- `skeleton` — pulsing placeholder box; combine with `className` for size (`h-4 w-32`).
- `spinner` — inline SVG spinner (no props beyond `className`).
- `loadingSpinner` — labeled loading state:
  ```json
  "properties": {
    "size": "md",                  // "sm" | "md" | "lg"
    "label": "Loading…",
    "parentClassName": "flex items-center gap-2"
  }
  ```
- `empty` — empty-state block:
  ```json
  "properties": {
    "title": "No results",
    "description": "Try adjusting your filters.",
    "iconName": "Inbox"
  }
  ```

### `toggle` — Radix-style toggle button
```json
"properties": {
  "variant": "default",          // "default" | "outline"
  "size": "default",             // "default" | "sm" | "lg"
  "pressed": false,
  "disabled": false
}
```

### `aspectRatio` — layout wrapper enforcing a ratio
```json
"properties": { "ratio": 1.78 }   // 16 / 9
```

### `kbd` — keyboard-key badge
```json
"properties": { "content": "Ctrl+K" }
```

### `scrollArea` — scrollable region wrapper
No opinionated props — children scroll with a custom-styled scrollbar. Use `className` for sizing.

### `pageHeaderBackButton` — standalone back button
```json
"properties": {
  "iconName": "ArrowLeft",
  "variant": "ghost",
  "size": "icon",
  "showText": false,
  "text": "Back",
  "ariaLabel": "Go back",
  "url": "/dashboard",
  "useBrowserBack": false
}
```
The `pageHeader` component now has these as `backButton*` subprops (see prop-additions section in SKILL.md) — use `pageHeaderBackButton` only when the back button is decoupled from a page header.

### `dateTimeInput` — combined date + time input
```json
"properties": {
  "label": "When",
  "value": "",
  "placeholder": "Pick a date + time",
  "disabled": false,
  "required": true
}
```

### `stepperUI` — shadcn `Stepper` primitive (linear form wizard)
```json
"properties": {
  "defaultValue": 0,
  "value": 0,
  "orientation": "horizontal"    // "horizontal" | "vertical"
}
```
**Not to be confused** with `IGRPStepperProcess` (BPMN workflow, wired via `process`/`processStep` JSONs). `stepperUI` is a plain UI primitive for multi-step form flows inside a single page.

### `inputOTP` — one-time-password input
```json
"properties": {
  "maxLength": 6,
  "containerClassName": "gap-2"
}
```

### `inputGroup` — grouped-input container
Wrap `inputText`/`inputAddOn`/`button` children to render a Radix-style grouped input (search field with attached submit button, etc.). No opinionated props beyond `className`.

### `imageCropper`
```json
"properties": {
  "variant": "default",          // "default" | "circle" | "square"
  "image": "/path/to/image.jpg",
  "cropShape": "rect",           // "rect" | "round"
  "aspect": 1                     // width / height ratio
}
```

### `fieldDescription` — descriptive text under a form field
```json
"properties": { "content": "Must be at least 8 characters." }
```

### `toaster` — toast notification container
Mount once at the app layout level (usually via a custom component under `(myapp)/`). No props.

### `statsCardMini` — compact stats tile
```json
"properties": {
  "title": "Sales",
  "value": "42",
  "titleSize": "sm",             // "sm" | "md" | "lg"
  "titleClassName": "font-medium",
  "valueSize": "lg",
  "valueClassName": "text-emerald-600",
  "iconName": "TrendingUp",
  "iconClassName": "h-5 w-5",
  "image": "/avatar.png",
  "imageAlt": "…",
  "variant": "soft"              // "default" | "outline" | "soft"
}
```
Use `trend: "up" | "down" | "neutral"` on the child data binding if you want the delta indicator.

### `statsCardTopBorderColored` — stats tile with a coloured top border
```json
"properties": {
  "title": "Revenue",
  "value": "$100k",
  "color": "success",            // "primary" | "secondary" | "destructive" | "success" | "warning" | "info"
  "cardVariant": "soft",
  "iconName": "DollarSign",
  "iconClassName": "text-emerald-600"
}
```

### `userAvatar` — avatar with fallback content
```json
"properties": {
  "image": "/user.jpg",
  "alt": "John Doe",
  "fallbackContent": "JD",
  "fallbackClass": "bg-blue-500 text-white",
  "size": "md"                    // "sm" | "md" | "lg"
}
```

---

## Known icon names (Lucide)

Common icons used in the project: `Plus`, `X`, `Save`, `Eye`, `SquarePen`, `Trash`, `Search`, `ArrowRight`, `ArrowLeft`, `ArrowRightLeft`, `ArrowDownLeft`, `ArrowUpRight`, `ArrowLeftRight`, `CheckCircle`, `CircleCheckBig`, `CircleAlert`, `Info`, `SlidersHorizontal`, `SlidersVertical`, `CornerDownRight`, `Users`, `UsersRound`, `Shield`, `Building`, `Building2`, `Briefcase`, `Wallet`, `CalendarDays`, `FileText`, `FileCheck`, `Heart`, `MapPin`, `Landmark`, `Send`, `RotateCcw`, `Lock`, `Play`, `Clock`, `Settings`, `Package`, `BookText`, `ChartLine`, `Moon`, `Mail`.
