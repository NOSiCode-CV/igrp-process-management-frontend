# Patterns — copy-paste templates

Each section gives a minimal, compilable, minified JSON skeleton. Replace placeholder ids/tags and extend.

---

## 1. List page (filters + table + modal dialog for create/edit)

Best starting point for any parametrization or CRUD list.

```json
{"type":"page","pageName":"<NAME>","path":"<PATH>","description":"<DESC>","forceDynamic":false,"id":"<10CHAR>","types":[{"componentId":"table_t1","name":"Table1","path":"","fields":[{"componentId":"tabletextcell_nome","name":"nomeTbl","type":"string","required":false,"defaultValue":"","isList":false},{"componentId":"tablehiddencell_id","name":"idTbl","type":"string","required":false,"defaultValue":"","isList":false},{"componentId":"tablebadgecell_estado","name":"estadoTbl","type":"string","required":false,"defaultValue":"","isList":false}]},{"componentId":"form_f1","name":"Form1","path":"","fields":[{"componentId":"inputtext_nome","name":"nome","type":"string","required":true,"defaultValue":"","isList":false}]}],"states":[{"id":"state_sv","name":"searchValue","type":"string","defaultValue":"''","imports":[],"isArray":false},{"id":"state_sf","name":"showFilters","type":"boolean","defaultValue":"false","imports":[],"isArray":false},{"id":"state_st","name":"status","type":"string","defaultValue":"''","imports":[],"isArray":false},{"id":"state_op","name":"open","type":"boolean","defaultValue":"false","imports":[],"isArray":false,"isOptional":false},{"id":"state_td","name":"tableData","type":"any","defaultValue":"[]","imports":[],"isArray":true,"isOptional":false},{"id":"state_ci","name":"currentItem","type":"any","defaultValue":"","imports":[],"isArray":false,"isOptional":true},{"id":"state_mt","name":"modalDialogTitle1Content","type":"string","imports":[],"defaultValue":"'Criar'"}],"functions":[{"id":"fnc_clr","name":"clearFilter","code":"setSearchValue('')\nsetStatus('')\nrefetch()","returnValue":{"type":"void","isNullable":true,"isList":false},"imports":[],"isAsync":true,"arguments":[]},{"id":"fnc_sub","name":"handleSubmit","code":"if (currentItem) {\n  update({ id: currentItem.idTbl, data: values })\n} else {\n  create({ ...values, estado: 'A' })\n}","returnValue":{"type":"void","isNullable":false,"isList":false},"imports":[],"arguments":[{"id":"1","name":"values","type":"any","isList":false,"isOptional":false,"isInterface":false,"isFunction":false,"isState":false,"functionParameters":[]}],"isAsync":true}],"args":[],"components":{"id":"page_root","componentName":"page","label":"page","properties":{"variant":"default","commonProperties":{"generateReference":false}},"children":[{"id":"section_main","componentName":"section","label":"section","properties":{"spaceY":"6","commonProperties":{"generateReference":false},"spaceX":""},"children":[{"id":"pageheader_1","tag":"pageHeader1","componentName":"pageHeader","label":"Page Header","type":"group","children":[{"id":"btn_new","tag":"button1","componentName":"button","label":"Button","type":"group","children":[],"interactions":{"onClick":{"type":"function","function":{"fnCustomCode":{"imports":[]},"fnCustomSet":"()=>{setOpen(!open); setCurrentItem(undefined)}"}}},"allowTypes":false,"data":{},"properties":{"content":"Novo","variant":"default","size":"default","iconProperties":{"showIcon":true,"iconName":"Plus"},"commonProperties":{"generateReference":false}},"childProperties":{}}],"interactions":{},"allowTypes":false,"data":{},"properties":{"title":"<TITLE>","description":"<DESC>","variant":"h3","iconProperties":{"iconBackButton":"Search"},"commonProperties":{"generateReference":false},"params":[]},"childProperties":{}},{"id":"table_t1","tag":"table1","componentName":"table","label":"Table","type":"group","children":[{"id":"tablecolumns_1","tag":"tableColumns1","componentName":"tableColumns","label":"Table Column","children":[{"id":"tabletextcell_nome","tag":"nomeTbl","componentName":"tableTextCell","label":"Text Column","type":"","children":[],"interactions":{},"allowTypes":false,"data":{},"properties":{"headerTitle":"Nome","dataProperties":{"isVirtual":false,"isType":true},"variant":"default","commonProperties":{"generateReference":false},"headerType":"sortToggle"},"childProperties":{}},{"id":"tablehiddencell_id","tag":"idTbl","componentName":"tableHiddenCell","label":"Hidden Column","type":"","children":[],"interactions":{},"allowTypes":false,"data":{},"properties":{"headerTitle":"idTbl","dataProperties":{"isVirtual":false,"isType":true},"commonProperties":{"generateReference":false}},"childProperties":{}},{"id":"tablebadgecell_estado","tag":"estadoTbl","componentName":"tableBadgeCell","label":"Badge Column","type":"","children":[],"interactions":{"customize":{"type":"function","function":{"type":"function","fnCustomCode":{"imports":[{"namespace":"import {getStatusBadge} from '@/app/(myapp)/functions/shared'","id":"imp_sb1234567"}]},"fnName":"getStatusBadge"},"action":{}}},"allowTypes":false,"data":{},"properties":{"headerTitle":"Estado","dataProperties":{"isVirtual":false,"isType":true},"iconProperties":{"showIcon":false,"iconName":"Info","iconPlacement":"start"},"variant":"soft","commonProperties":{"generateReference":false}},"childProperties":{}},{"id":"tableactionlistcell_1","tag":"tableActionListCell1","componentName":"tableActionListCell","label":"Actions Column","type":"","children":[{"id":"tablelinkaction_edit","tag":"tableLinkAction1","componentName":"tableLinkAction","label":"Link Action","type":"","children":[],"interactions":{"action":{"type":"function","function":{"fnCustomSet":"()=>{setOpen(!open); setCurrentItem(rowData)}","type":"function","fnCustomCode":{"imports":[]}},"action":{}}},"allowTypes":false,"data":{},"properties":{"labelTrigger":"Editar","iconProperties":{"iconName":"SquarePen"},"variant":"ghost","href":"","commonProperties":{"generateReference":false},"segments":[],"params":[]},"childProperties":{}},{"id":"tablealertaction_st","tag":"tableAlertAction1","componentName":"tableAlertAction","label":"Alert Action","type":"","children":[],"interactions":{"onClickConfirm":{"type":"function","function":{"fnCustomSet":"()=>updateStatus(rowData.idTbl)","fnCustomCode":{"imports":[]},"type":"function"},"action":{}}},"allowTypes":false,"data":{},"properties":{"labelTrigger":"Alterar Estado","iconProperties":{"iconName":"ArrowRightLeft"},"variant":"ghost","title":"Alterar Estado","showCancel":true,"labelCancel":"Cancelar","variantCancel":"ghost","showConfirm":true,"labelConfirm":"Confirmar","variantConfirm":"secondary","commonProperties":{"generateReference":false},"segments":[],"params":[],"content":"Deseja alterar o estado deste registo?"},"childProperties":{}}],"interactions":{},"allowTypes":false,"data":{},"properties":{"headerTitle":"","type":"inline","commonProperties":{"generateReference":false}},"childProperties":{}}],"interactions":{},"allowTypes":false,"data":{},"properties":{"commonProperties":{"generateReference":false}},"childProperties":{}},{"id":"tablefilters_1","tag":"tableFilters1","componentName":"tableFilters","label":"Table Filter","children":[],"interactions":{},"allowTypes":false,"data":{},"properties":{"commonProperties":{"generateReference":false}}}],"interactions":{},"allowTypes":true,"data":{"data":{"state":{"id":"","name":"tableData","type":"","imports":[],"generate":false}}},"properties":{"commonProperties":{"generateReference":false},"showFilter":false,"showPagination":true,"isNumericPagination":true},"dataType":"Table1","childProperties":{}},{"id":"modaldialog_1","tag":"modalDialog1","componentName":"modalDialog","label":"Modal Dialog","type":"group","children":[{"id":"modaldialogcontent_1","tag":"modalDialogContent1","componentName":"modalDialogContent","label":"Modal Dialog Content","children":[{"id":"modaldialogheader_1","tag":"modalDialogHeader1","componentName":"modalDialogHeader","label":"Modal Dialog Header","children":[{"id":"modaldialogtitle_1","tag":"modalDialogTitle1","componentName":"modalDialogTitle","label":"Modal Dialog Title","children":[],"interactions":{},"allowTypes":false,"data":{"content":{"state":{"id":"","name":"modalDialogTitle1Content","type":"","imports":[],"generate":false}}},"properties":{"content":"","commonProperties":{"generateReference":false}},"childProperties":{"className":""}}],"interactions":{},"allowTypes":false,"data":{},"properties":{"commonProperties":{"generateReference":false}},"childProperties":{}},{"id":"form_f1","tag":"form1","componentName":"form","label":"Form","type":"group","children":[{"id":"inputtext_nome","tag":"nome","componentName":"inputText","label":"Input Text","type":"group","children":[],"interactions":{},"allowTypes":false,"data":{},"properties":{"label":"Nome","iconProperties":{"showIcon":false},"required":true,"dataProperties":{"isVirtual":false,"isType":true},"commonProperties":{"generateReference":false}},"childProperties":{}}],"interactions":{"onSubmit":{"type":"function","function":{"fnCustomSet":"() => {}","type":"function","fnCustomCode":{"imports":[]},"fnName":"handleSubmit"},"action":{}}},"allowTypes":true,"data":{"defaultValues":{"state":{"id":"state_fd","type":"any","name":"form1Data","defaultValue":"initForm1","imports":[],"generate":true}}},"properties":{"validationMode":"onBlur","commonProperties":{"generateReference":false}},"dataType":"Form1","childProperties":{}},{"id":"modaldialogfooter_1","tag":"modalDialogFooter1","componentName":"modalDialogFooter","label":"Modal Dialog Footer","children":[{"id":"btn_cancel","tag":"button5","componentName":"button","label":"Button","type":"group","children":[],"interactions":{"onClick":{"type":"function","function":{"fnCustomSet":"()=>setOpen(false)","fnCustomCode":{"imports":[]},"type":"function"},"action":{}}},"allowTypes":false,"data":{},"properties":{"content":"Cancelar","variant":"outline","size":"default","iconProperties":{"showIcon":true,"iconName":"X"},"commonProperties":{"generateReference":false}},"childProperties":{}},{"id":"btn_save","tag":"button4","componentName":"button","label":"Button","type":"group","children":[],"interactions":{"onClick":{"type":"formSubmit","function":{"fnCustomSet":"() => {}","type":"function","fnCustomCode":{"imports":[]}},"action":{},"formSubmit":{"formId":"","targetForm":"form1"}}},"allowTypes":false,"data":{},"properties":{"content":"Guardar","variant":"default","size":"default","iconProperties":{"showIcon":true,"iconName":"Save"},"commonProperties":{"generateReference":false}},"childProperties":{}}],"interactions":{},"allowTypes":false,"data":{},"properties":{"commonProperties":{"generateReference":false}},"childProperties":{}}],"interactions":{},"allowTypes":false,"data":{},"properties":{"size":"md","commonProperties":{}}},{"id":"modaldialogtrigger_1","tag":"modalDialogTrigger1","componentName":"modalDialogTrigger","label":"Modal Dialog Trigger","children":[],"interactions":{"onClick":{"type":"function","function":{"fnCustomSet":"() => {}","type":"function"},"action":{}}},"allowTypes":false,"data":{},"properties":{"commonProperties":{}}}],"interactions":{"onOpenChange":{"type":"function","function":{"fnCustomCode":{"imports":[]},"fnCustomSet":"setOpen"}}},"allowTypes":false,"data":{"open":{"state":{"id":"","name":"open","type":"","imports":[],"generate":false}}},"properties":{"commonProperties":{"generateReference":false}},"childProperties":{}}],"tag":"section2","data":{},"interactions":{},"childProperties":{}}],"tag":"page2","data":{},"interactions":{"onLoad":{"type":"function","function":{"type":"function","fnCustomCode":{"imports":[{"id":"imp_pn","namespace":"import { usePathname } from \"next/navigation\";"},{"id":"imp_pc","namespace":"import {useParametrizacaoCrud} from '@/app/(myapp)/hooks/use-parametrizacao-crud'"}],"fnCode":"const pathname = usePathname();\nconst routeName = pathname?.split('/').pop() || '';\n\nconst { data, isLoading: loading, refetch, create, update, updateStatus, isCreateSuccess, isUpdateSuccess, isUpdateStatusSuccess } = useParametrizacaoCrud(routeName, { params: { nome: searchValue, estado: status } });\n\nuseEffect(() => {\n  if (data) setTableData(data.content.map((item: any) => ({ ...item, nomeTbl: item.nome, idTbl: item.id, estadoTbl: item.estadoDesc })));\n}, [data, loading]);\n\nuseEffect(() => {\n  setModalDialogTitle1Content(currentItem ? 'Editar' : 'Criar');\n  setForm1Data({ ...currentItem });\n}, [currentItem]);\n\nuseEffect(() => {\n  if (isCreateSuccess || isUpdateSuccess || isUpdateStatusSuccess) {\n    setOpen(false); setCurrentItem(undefined); refetch();\n  }\n}, [isCreateSuccess, isUpdateSuccess, isUpdateStatusSuccess, refetch]);"}},"action":{}}},"childProperties":{}},"imports":[]}
```

Replace:
- `<NAME>`, `<PATH>`, `<DESC>`, `<TITLE>`, `<10CHAR>` — placeholders
- 6-char suffixes on ids (`_nome`, `_t1`, etc.) — keep unique across the file
- Extend with more filter comboboxes, columns, form fields as needed

---

## 2. Form component (reusable, page-scoped)

```json
{"type":"component","scope":"page","pagePath":"<PARENT_PAGE_PATH>","pageName":"<parentPageName>","description":"<DESC>","name":"<formName>","id":"cmp_<6char>","args":[{"id":"1","name":"shouldSubmit","type":"boolean","isList":false,"isOptional":false,"isInterface":false,"isFunction":false,"isState":false},{"id":"2","name":"onAfterSubmit","type":"void","isList":false,"isOptional":false,"isInterface":false,"isFunction":true,"isState":false}],"components":{"id":"component_root","tag":"component_root","componentName":"component","label":"component","properties":{"commonProperties":{"generateReference":false}},"children":[{"id":"form_main","tag":"form1","componentName":"form","label":"Form","type":"group","children":[{"id":"inputtext_nome","tag":"nome","componentName":"inputText","label":"Input Text","type":"group","children":[],"interactions":{},"allowTypes":false,"data":{},"properties":{"label":"Nome","required":true,"dataProperties":{"isVirtual":false,"isType":true},"commonProperties":{"generateReference":false}},"childProperties":{}}],"interactions":{"onSubmit":{"type":"function","function":{"fnName":"handleFormSubmit","type":"function","fnCustomCode":{"imports":[]}},"action":{"actionCustomSet":"(e) => {}"}}},"allowTypes":true,"data":{"defaultValues":{"state":{"id":"state_fd","type":"any","name":"formDataState","defaultValue":"initFormData","imports":[],"generate":true}}},"properties":{"commonProperties":{"generateReference":false}},"dataType":"FormData","childProperties":{}}],"interactions":{"onLoad":{"type":"function","function":{"type":"function","fnCustomCode":{"imports":[{"id":"imp_rtr","namespace":"import { useRouter } from 'next/navigation'"}],"fnCode":"const router = useRouter();\n\nuseEffect(() => {\n  if (!shouldSubmit) return;\n  formform1Ref.current?.submit();\n  onAfterSubmit?.();\n}, [shouldSubmit, onAfterSubmit]);"}},"action":{}}},"allowTypes":false,"data":{},"childProperties":{}},"functions":[{"id":"fnc_sub","name":"handleFormSubmit","code":"try {\n  // submit logic\n  router.push('/somewhere');\n} catch (error: any) {\n  igrpToast({ title: 'Erro', description: error.message, type: 'error' });\n}","returnValue":{"type":"void","isNullable":true,"isList":false},"imports":[],"isAsync":true,"arguments":[{"id":"10","name":"values","type":"z.infer<any>","isList":false,"isOptional":false,"isInterface":false,"isFunction":false,"isState":false,"functionParameters":[]}]}],"types":[{"componentId":"form_main","name":"FormData","path":"","fields":[{"componentId":"inputtext_nome","name":"nome","type":"string","required":true,"defaultValue":"","isList":false}]}],"states":[],"imports":[]}
```

Note `formform1Ref` — the engine names form refs as `form<formTag>Ref`.

---

## 3. View/detail page (no form, just display)

```json
{"type":"page","pageName":"<NAME>","path":"<PATH>","description":"<DESC>","forceDynamic":false,"id":"<10CHAR>","args":[{"id":"1","name":"uuid","type":"string","isList":false,"isOptional":false,"isInterface":false,"isFunction":false,"isState":false}],"types":[],"states":[{"id":"state_n","name":"nameValue","type":"string","defaultValue":"''","imports":[]},{"id":"state_bc","name":"bannerColor","type":"any","defaultValue":"'info'","imports":[]}],"functions":[],"components":{"id":"page_root","componentName":"page","label":"page","properties":{"variant":"default","commonProperties":{"generateReference":false}},"children":[{"id":"section_1","componentName":"section","label":"section","properties":{"spaceY":"6","commonProperties":{}},"children":[{"id":"pageheader_1","tag":"pageHeader1","componentName":"pageHeader","label":"Page Header","children":[],"properties":{"title":"Detalhes","description":"","variant":"h3","showBackButton":true,"urlBackButton":"<PARENT_PATH>","iconProperties":{"iconBackButton":"ArrowLeft"}}},{"id":"statusbanner_1","tag":"statusBanner1","componentName":"statusBanner","label":"Status Banner","children":[],"data":{"color":{"state":{"id":"","name":"bannerColor","generate":false}}},"properties":{}},{"id":"infocard_1","tag":"infoCard1","componentName":"infoCard","label":"Info Card","children":[{"id":"infosection_1","componentName":"infoSection","children":[{"id":"infoitem_1","componentName":"infoItem","properties":{"label":"Nome"},"data":{"value":{"state":{"name":"nameValue","generate":false}}}}]}]}],"tag":"section1","data":{},"interactions":{}}],"tag":"page1","data":{},"interactions":{"onLoad":{"type":"function","function":{"type":"function","fnCustomCode":{"imports":[{"id":"imp_hook","namespace":"import {useGetItem} from '@/app/(myapp)/hooks/use-item'"}],"fnCode":"const { data } = useGetItem(uuid);\n\nuseEffect(() => {\n  if (!data) return;\n  setNameValue(data.name || '');\n  setBannerColor(data.estado === 'ACT' ? 'success' : 'secondary');\n}, [data]);"}},"action":{}}},"childProperties":{}},"imports":[]}
```

---

## 4. Filter pattern for list pages (contribuintes-style)

Embed this block inside `section.children` between pageHeader and table:

```json
{"id":"cntr_flt","tag":"container4","componentName":"container","label":"Container","type":"group","children":[{"id":"cntr_srchRow","tag":"container1","componentName":"container","label":"Container","type":"group","children":[{"id":"cntr_srchWrap","tag":"container2","componentName":"container","label":"Container","type":"group","children":[{"id":"cntr_srchInner","tag":"container3","componentName":"container","label":"Container","type":"group","children":[{"id":"isrc_1","tag":"inputSearch2","componentName":"inputSearch","label":"Input Search","type":"group","children":[],"interactions":{"onSearch":{"type":"function","function":{"fnCustomCode":{"imports":[]},"fnCustomSet":"(value) => setSearchValue(value)"}}},"allowTypes":false,"data":{"value":{"state":{"id":"","name":"searchValue","type":"","imports":[],"generate":false}}},"properties":{"placeholder":"Pesquisar...","showSubmitButton":true,"submitButtonLabel":"Pesquisar","iconProperties":{"showStartIcon":true,"startIcon":"Search","submitIcon":"ArrowRight"},"className":"py-1","commonProperties":{"generateReference":false}},"childProperties":{}}],"interactions":{},"allowTypes":false,"data":{},"properties":{"commonProperties":{"generateReference":false},"className":"flex-1 min-w-[240px]"},"childProperties":{}},{"id":"flex_toggle","tag":"flex1","componentName":"flex","label":"Flex","type":"group","children":[{"id":"btn_toggle","tag":"button3","componentName":"button","label":"Button","type":"group","children":[],"interactions":{"onClick":{"type":"function","function":{"fnCustomSet":"() => setShowFilter(!showFilter)","fnCustomCode":{"imports":[]},"type":"function"},"action":{}}},"allowTypes":false,"data":{},"properties":{"content":"Filtros","variant":"outline","size":"default","iconProperties":{"showIcon":true,"iconName":"SlidersHorizontal"},"commonProperties":{"generateReference":false}},"childProperties":{}}],"interactions":{},"allowTypes":false,"data":{},"properties":{"commonProperties":{}},"childProperties":{},"style":{"layout":{"type":"flex","flex":{"direction":"row","wrap":"wrap","alignItems":"stretch","justifyContent":"flex-end","gap":"2"}}}}],"interactions":{},"allowTypes":false,"data":{},"properties":{"commonProperties":{},"className":""},"childProperties":{},"style":{"layout":{"type":"flex","flex":{"direction":"row","wrap":"wrap","alignItems":"center","justifyContent":"space-between","gap":"2"}}}}],"interactions":{},"allowTypes":false,"data":{},"properties":{"commonProperties":{},"className":""},"childProperties":{}},{"id":"sep_flt","tag":"separator1","componentName":"separator","label":"Separator","type":"group","children":[],"interactions":{},"allowTypes":false,"data":{},"properties":{"orientation":"horizontal","className":"my-3"},"childProperties":{},"rules":[{"type":"visibility","condition":"showFilter"}]},{"id":"grid_flts","tag":"grid2","componentName":"grid","label":"Grid","type":"group","children":[],"interactions":{},"allowTypes":false,"data":{},"properties":{"gap":4,"variant":{"default":"cols4","md":"cols2","lg":"cols4"},"commonProperties":{"generateReference":false}},"childProperties":{"className":"col-span-1"},"rules":[{"type":"visibility","condition":"showFilter"}]},{"id":"flex_clr","tag":"flex2","componentName":"flex","label":"Flex","type":"group","children":[{"id":"btn_clr","tag":"button5","componentName":"button","label":"Button","type":"group","children":[],"interactions":{"onClick":{"type":"function","function":{"fnCustomSet":"() => {}","type":"function","fnCustomCode":{"imports":[]},"fnName":"clearFilters"},"action":{}}},"allowTypes":false,"data":{},"properties":{"content":"Limpar Filtros","variant":"outline","size":"default","iconProperties":{"showIcon":true,"iconName":"X"},"commonProperties":{"generateReference":false}},"childProperties":{}}],"interactions":{},"allowTypes":false,"data":{},"properties":{"commonProperties":{}},"childProperties":{},"style":{"layout":{"type":"flex","flex":{"direction":"row","wrap":"wrap","alignItems":"stretch","justifyContent":"flex-end","gap":"2"}}},"rules":[{"type":"visibility","condition":"showFilter"}]}],"interactions":{},"allowTypes":false,"data":{},"properties":{"className":"px-4 pt-2 space-y-3","commonProperties":{}},"childProperties":{}}
```

Add filter comboboxes into `grid_flts.children`. Bind states `showFilter`, `searchValue`, filter values.

---

## 5. Stats cards grid (4 cards)

```json
{"id":"grid_stats","tag":"gridStats","componentName":"grid","label":"Grid","type":"group","children":[{"id":"stc_1","tag":"totalGeral","componentName":"statsCard","label":"Stats Card","type":"group","children":[],"interactions":{"onClick":{"type":"function","function":{"fnCustomSet":"() => {}","type":"function"},"action":{}}},"allowTypes":false,"data":{"value":{"state":{"id":"","type":"string | number","name":"statstotalGeralValue","defaultValue":"0","imports":[],"generate":true}}},"properties":{"cardBorderPosition":"top","cardBorder":"rounded-md","cardVariant":"info","iconBackground":"rounded","title":"Total","titleSize":"sm","valueSize":"sm","iconProperties":{"showIcon":true,"iconName":"Building","iconSize":"md","iconVariant":"info","iconPlacement":"end"},"itemPlacement":"start","commonProperties":{"generateReference":false},"showIconBackground":true},"childProperties":{}}],"interactions":{},"allowTypes":false,"data":{},"properties":{"gap":4,"variant":{"default":"cols4","md":"cols2","lg":"cols4"},"commonProperties":{"generateReference":false}},"childProperties":{"className":"col-span-1"}}
```

Repeat the `statsCard` child 4x with different `tag`, `cardVariant` (`info|success|warning|indigo`), `iconName`, `title`.

---

## 6. Menu entry (in `src/temp/menus/menus.ts`)

```ts
// GROUP (top-level)
{ id: <id>, code: "MY_MODULE", name: "My Module", type: "GROUP", position: <n>, icon: "Settings", status: "ACTIVE", target: "_self", url: null, pageSlug: null, parentCode: null, applicationCode: "CORE", roles: [] },

// FOLDER (subgroup)
{ id: <id>, code: "MY_MODULE_SUB", name: "Sub", type: "FOLDER", position: <n>, icon: "Users", status: "ACTIVE", target: "_self", url: null, pageSlug: null, parentCode: "MY_MODULE", applicationCode: "CORE", roles: [] },

// MENU_PAGE (leaf — links to a page)
{ id: <id>, code: generateCode("My Page"), name: "My Page", type: "MENU_PAGE", position: 0, icon: "", status: "ACTIVE", target: "_self", url: null, pageSlug: "my-page", parentCode: "MY_MODULE_SUB", applicationCode: "CORE", roles: [] },
```

`pageSlug` must match the URL portion of the page's `path` (excluding route groups like `(parametrizacao)`).

---

## 7. Navigation button / link (PREFER over `router.push` handlers)

For any button or link whose sole purpose is to navigate to another page, use `type: "navigate"`. The engine will auto-generate a named function (`goTo<Name>`), auto-import `useRouter`, and auto-emit `const router = useRouter()` — **no manual imports needed**.

```json
{
  "id": "btn_go_dias",
  "tag": "btnGoToDias",
  "componentName": "button",
  "children": [],
  "interactions": {
    "onClick": {
      "type": "navigate",
      "function": {
        "fnCustomSet": "() => router.push('caixa/dias')",
        "type": "function",
        "fnCustomCode": { "imports": [] }
      },
      "action": {},
      "navigate": {
        "path": "caixa/dias",
        "name": "goTocaixaDias",
        "params": []
      }
    }
  },
  "allowTypes": false,
  "data": {},
  "properties": {
    "content": "Ir para Dias",
    "variant": "default",
    "iconProperties": { "showIcon": true, "iconName": "ArrowRight" },
    "commonProperties": { "generateReference": false }
  }
}
```

**Rules:**
- Set `navigate.path` to the target page's `path` (excluding URL-irrelevant route groups like `(parametrizacao)`)
- `navigate.name` is a unique function name in the generated TSX (convention: `goTo<SlugCamelCase>`)
- `navigate.params` holds URL segment substitutions if the path has `[param]` segments (similar to `segments` on `tableLinkAction`)
- **Do NOT add `import { useRouter } from 'next/navigation'`** anywhere — the engine auto-imports whenever the page has at least one `type:"navigate"` button
- **Do NOT add `const router = useRouter();`** in onLoad fnCode — auto-emitted
- Mixing: if a page needs BOTH static navigation (use `type:"navigate"`) AND dynamic `router.push()` in a handler, the auto-import still covers both — you still don't need to add imports/declarations manually

**When `type:"function"` with `router.push(...)` is justified:** only when the navigation target depends on runtime data (e.g. `router.push(\`/item/\${id}\`)` computed inside an event handler). Even then, prefer passing state through `navigate.params` whenever possible.

---

## 8. Common onLoad recipes

### Loading enum options into a filter combobox
```js
const { options: statusOptions, isLoading } = useEnumOptions("Status");
useEffect(() => { setSelectstatusOptions(statusOptions || []); }, [isLoading]);
```

### Loading combobox from an API hook
```js
const { data, isLoading } = useMyListHook();
useEffect(() => {
  if (isLoading || !data) return;
  setSelectmyFieldOptions(data.map((d: any) => ({ value: String(d.value), label: d.label })));
}, [isLoading, data]);
```

### Normalizing a date field before sending to the API (LocalDate format)

Spring backends that accept `LocalDate` expect `YYYY-MM-DD` (no time component). `inputDatePicker` stores the value as a `Date` object which JSON-stringifies to `"2026-04-23T00:00:00.000Z"` — the backend rejects that. Normalize in `handleFormSubmit`:

```js
const normalizeDate = (d: any) => {
  if (!d) return undefined;
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  return String(d).slice(0, 10);
};

const payload = {
  ...values,
  dia: normalizeDate(values.dia),
  dataEnvio: normalizeDate(values.dataEnvio),  // apply to every LocalDate field
};
```

The same normalizer applies to date range filter params passed to list hooks.

### Server-side pagination wiring

Expose `pageNumber`/`pageSize` (or backend's equivalent `pagina`/`tamanho`) as page states; pass them into the list hook so it becomes part of the query key and triggers re-fetch on change:

```js
const [pageNumber, setPageNumber] = useState(0);
const [pageSize, setPageSize] = useState(50);

const { data, isLoading } = useMyListHook({
  pageNumber,
  pageSize,
  ...otherFilters,
});
```

- Default `pageSize=50` avoids loading the whole table.
- In the JSON, declare `pageNumber` and `pageSize` in `states[]` with `type: "number"` so the engine emits both the state and its setter.
- The query key must include the pagination states (React Query handles this automatically because the filter object is the query key).
- **Caveat**: `IGRPDataTable` handles pagination UI internally but does NOT expose an `onPaginationChange` callback. Without a custom pagination control, the table displays only the first `pageSize` rows returned by the server — true "next page" navigation requires custom UI (buttons/dropdowns) wired to `setPageNumber`.

### Only send filters that are actually applied

**NEVER send sentinel values** like `idUps: 0`, `utilizador: '_'`, `de: '1900-01-01'` just to satisfy a strict backend validator. The backend will treat those as real filter values, not "no filter". Always send `undefined` for unset filters so `buildQueryParam` omits them from the query string:

```js
const { data } = useMyListHook({
  pageNumber, pageSize,                                        // required pagination
  de: toLocalDate(datePickerRangeDate?.from),                  // undefined → omitted
  ate: toLocalDate(datePickerRangeDate?.to),                   // undefined → omitted
  idUps: selectidUpsFltValue ? Number(selectidUpsFltValue) : undefined,
  utilizador: (searchValue && searchValue.trim()) || undefined,
});
```

The shared `buildQueryParam` utility filters out `null`/`undefined`/`""` automatically, so those entries never appear on the wire.

**Make the filter TS type reflect this:** mark every optional filter field as `field?: T`, not `field: T`. If the backend validates a query field as `@NotBlank` or `@NotNull`, that's a backend bug (the service probably already handles `null` branches — the annotation just forgot). File it for the backend team to relax validation — do NOT paper over it with sentinels on the frontend.

### Mapping renamed form tags back to API field names in `handleFormSubmit`

When a form lives in a page that also has a table showing the same domain entity (e.g. a `montante` column in the table AND a `montante` input in the modal form), the duplicate-tag rule forces one side to be renamed — usually the form input gets a `Fld` or modal-scoped suffix (`montanteTransfFld`, `idUpsModalTa`, `paraFld`). But the backend DTO still expects the clean names.

**The trap**: a `...values` spread leaks the renamed keys into the request body:

```js
// ❌ BROKEN — backend receives {"montanteTransfFld": 1234, "obsTransfFld": "...", ...}
const payload = { ...values, de: 'UPS', para: 'ATENDEDOR' };
await submitMovimentoCaixa('transferir-fundos', payload);
```

**The fix**: build the payload explicitly, re-keying to the API shape:

```js
// ✅ CORRECT — payload matches backend TransferirFundosRequest
const payload = {
  idUps: selectidUpsModalTaValue ? Number(selectidUpsModalTaValue) : undefined,
  userPara: values.userPara ? Number(values.userPara) : undefined,
  montante: Number(values.montanteTransfFld),   // re-key Fld → API
  obs: values.obsTransfFld,                      // re-key Fld → API
  de: 'UPS',
  para: 'ATENDEDOR',
};
await submitMovimentoCaixa('transferir-fundos', payload);
```

**Discipline**:
1. After writing or modifying a form handler, list the backend DTO fields (e.g. `TransferirFundosRequest`) and verify every key in the outgoing payload matches.
2. Never trust `...values` when the form has ANY renamed tag — always re-key explicitly.
3. For every renamed tag, leave a comment `// API: montante` so future readers see the mapping intent.

### Write endpoints returning `{ success: true }` JSON (not plain text)

Backends that originally returned `201 Created` with a `"Dia criado"` body trigger `Unexpected token 'D'` on the frontend because the Next.js proxy tries to parse JSON. If the backend now returns `{ "success": true }`, the client must NOT set `isTextResponse: true`:

```ts
// BEFORE (plain text response)
return await callApi<string>(`/api/caixa/dia`, {
  method: "POST",
  body: JSON.stringify(data),
  isTextResponse: true,    // remove
});

// AFTER (JSON response)
interface SuccessResponse { success: boolean; }
return await callApi<SuccessResponse>(`/api/caixa/dia`, {
  method: "POST",
  body: JSON.stringify(data),
});
```

When coordinating with backend, prefer all write endpoints to return a small JSON envelope (`{ success: true }` or the created entity) rather than plain strings — keeps the error handler uniform.

### Dependent combobox (atendedor depending on UPS)
```js
const { data: ups } = useCaixaComboboxUps();
useEffect(() => {
  if (!ups) return;
  setSelectidUpsOptions(ups.map((u: any) => ({ value: String(u.value), label: u.label })));
}, [ups]);

const { data: atd } = useCaixaComboboxAtendedor(selectidUpsValue || undefined);
useEffect(() => {
  if (!atd) return;
  setSelectatendedorOptions(atd.map((a: any) => ({ value: String(a.value), label: a.label })));
}, [atd]);
```

### Filling a table from paginated API
```js
const { data, isLoading } = useListHook({ search: searchValue });
useEffect(() => {
  if (isLoading || !data?.content) return;
  setContentTabletable1(data.content.map((item: any) => ({ ...item })));
}, [isLoading, data]);
```

### Refetch after mutation
```js
useEffect(() => {
  if (isCreateSuccess || isUpdateSuccess || isDeleteSuccess) {
    setOpen(false);
    setCurrentItem(undefined);
    refetch();
  }
}, [isCreateSuccess, isUpdateSuccess, isDeleteSuccess, refetch]);
```

---

## 9. Status → color/banner mapper (dual-output)

Most domain entities have a `status` (or `estado`/`state`) field that drives both a **table badge** (raw Tailwind classes) and a **page-level banner** (design-system token). Declare both mappers side-by-side so call sites stay decoupled from the colour scheme:

```ts
// src/app/(myapp)/functions/<entity>-status.ts
import type { IGRPStatusBannerVariant } from "@igrp/igrp-framework-react-design-system";

const STATUS = {
  ACTIVE:    { label: "Ativo",    bg: "bg-green-100  text-green-800",  banner: "success"     as IGRPStatusBannerVariant, icon: "CheckCircle" },
  SUSPENDED: { label: "Suspenso", bg: "bg-yellow-100 text-yellow-800", banner: "warning"     as IGRPStatusBannerVariant, icon: "AlertCircle" },
  INACTIVE:  { label: "Inativo",  bg: "bg-red-100    text-red-800",    banner: "destructive" as IGRPStatusBannerVariant, icon: "XCircle" },
  PENDING:   { label: "Pendente", bg: "bg-blue-100   text-blue-800",   banner: "info"        as IGRPStatusBannerVariant, icon: "Clock" },
} as const;

type StatusKey = keyof typeof STATUS;

// 1) Badge for table cells — returns raw Tailwind classes
export function getStatusBadge(entity: { status?: string }) {
  const key = (entity?.status ?? "INACTIVE") as StatusKey;
  const s = STATUS[key] ?? STATUS.INACTIVE;
  return { label: s.label, className: s.bg, iconName: s.icon };
}

// 2) Banner for page-level <IGRPStatusBanner>
export function getStatusBanner(entity: { status?: string }): IGRPStatusBannerVariant | undefined {
  const key = (entity?.status ?? "INACTIVE") as StatusKey;
  return STATUS[key]?.banner;
}
```

**Why two functions, not one:**
- Table cells consume **raw Tailwind classes** (`bgClass`, `textClass`, `iconName`) so the cell renderer can spread them.
- `IGRPStatusBanner` consumes a **design-system variant token** (`success` / `warning` / `destructive` / `info`) and themes itself.
- Mixing them — passing Tailwind classes to the banner, or a variant string to a table cell — breaks theming silently.

Rules:
- The `STATUS` map is the **single source of truth** for label/colour/icon — never hardcode at the call site.
- **Default to a "safe" status** (typically the most restrictive: inactive/error) when the entity is missing or the key is unknown — fail visibly, not invisibly.
- Status keys mirror the backend's enum **exactly**; if the backend changes its enum, this is the one file to update.
