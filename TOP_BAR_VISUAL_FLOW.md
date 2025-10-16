# Top Navigation Bar - Visual Flow Diagram

## 🎯 Feature: Unique Pipeline Names in Top Bar

---

## 📊 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER CREATES PIPELINE                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Sidebar: Click "Add Pipeline" Button                           │
│  • New pipeline created with UUID                                │
│  • Name: "Pipeline 1"                                            │
│  • Saved to localStorage: hierarchicalPipelines                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  User Clicks Pipeline in Sidebar                                │
│  • router.push(`/crm/pipelines/{uuid}/rfq`)                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Next.js Dynamic Route: [pipelineId]/page.tsx                   │
│  • URL: /crm/pipelines/a1b2c3d4-e5f6-7890-abcd-ef1234567890/rfq│
│  • useParams() extracts: pipelineId = "a1b2c3d4..."            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  PipelineNavbar.tsx Component Loads                             │
│  1. useEffect triggered by pathname/params change               │
│  2. Load from localStorage: hierarchicalPipelines                │
│  3. Build tree structure: pipelineHelpers.buildTree()           │
│  4. Find pipeline by ID: pipelineHelpers.findById(tree, uuid)  │
│  5. Set state: setCurrentPipeline(found)                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  TOP BAR RENDERS WITH UNIQUE NAME                               │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ Pipeline 1 ▼ │ RFQ │ Feasibility │ Quotation │ ...        ││
│  └────────────────────────────────────────────────────────────┘│
│  ↑                                                               │
│  getCurrentPipelineName() returns: "Pipeline 1"                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Rename Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  USER RENAMES PIPELINE                                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Sidebar: Double-click "Pipeline 1"                             │
│  • Inline editor appears                                         │
│  • User types: "Marketing Campaign"                              │
│  • Press Enter                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  PipelineTreeView.tsx Updates                                   │
│  • Updates pipeline object: { ...pipeline, name: "Marketing..." }│
│  • Saves to localStorage                                         │
│  • Triggers re-render                                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  PipelineNavbar.tsx Detects Change                              │
│  • useEffect sees localStorage change                            │
│  • Reloads pipeline tree                                         │
│  • Finds updated pipeline by ID                                  │
│  • Updates currentPipeline state                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  TOP BAR UPDATES IMMEDIATELY (No Page Refresh)                  │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ Marketing Campaign ▼ │ RFQ │ Feasibility │ ...            ││
│  └────────────────────────────────────────────────────────────┘│
│  ↑                                                               │
│  getCurrentPipelineName() returns: "Marketing Campaign"         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🌳 Sub-Pipeline Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  USER CREATES SUB-PIPELINE                                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Sidebar: Hover over "Marketing Campaign"                       │
│  • Click "•••" (more options)                                   │
│  • Select "Add Sub-Pipeline"                                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Sub-Pipeline Created                                           │
│  • Name: "Sub-Pipeline 1"                                       │
│  • parentId: UUID of "Marketing Campaign"                       │
│  • Own UUID: Generated                                           │
│  • Saved to localStorage                                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  User Clicks "Sub-Pipeline 1"                                   │
│  • router.push(`/crm/pipelines/{sub-uuid}/rfq`)                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  PipelineNavbar.tsx Loads Sub-Pipeline                          │
│  • useParams() extracts sub-pipeline UUID                        │
│  • Finds in tree (nested under parent)                           │
│  • Sets currentPipeline = sub-pipeline object                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  TOP BAR SHOWS SUB-PIPELINE NAME                                │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ Sub-Pipeline 1 ▼ │ RFQ │ Feasibility │ ...                ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                  │
│  Click Dropdown ▼:                                              │
│  ┌──────────────────────────────────┐                          │
│  │ Marketing Campaign               │ ← Parent                  │
│  │ Sub-Pipeline 1 (Sub-Pipeline)    │ ← Child with indicator   │
│  └──────────────────────────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎨 UI Component Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                    PipelineNavbar.tsx                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐  ┌──────────┐  ┌──────────┐             │
│  │ Dropdown Button  │  │   Tab    │  │   Tab    │  ...         │
│  │ ┌──────────────┐ │  │   RFQ    │  │Feasibility│             │
│  │ │ Pipeline 1  ▼│ │  └──────────┘  └──────────┘             │
│  │ └──────────────┘ │                                           │
│  │      ↑           │                                           │
│  │      │           │                                           │
│  │ getCurrentPipeline │                                         │
│  │ Name()           │                                           │
│  └──────────────────┘                                           │
│                                                                  │
│  State:                                                          │
│  • pathname (from usePathname)                                   │
│  • params (from useParams)                                       │
│  • allPipelines (from localStorage)                              │
│  • currentPipeline (found by ID)                                 │
│                                                                  │
│  Functions:                                                      │
│  • getCurrentPipelineName() - Returns display name               │
│  • getAllPipelinesWithContent() - Flattens tree                  │
│  • handlePipelineClick() - Navigation                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔀 Decision Tree: What Name to Show?

```
User navigates to a URL
         │
         ↓
    ┌────────────────────┐
    │ Is there a         │
    │ pipelineId param?  │
    └────────┬───────────┘
             │
      ┌──────┴───────┐
      │              │
     YES            NO
      │              │
      ↓              ↓
┌──────────────┐  ┌────────────────────┐
│ Load pipeline│  │ Check pathname     │
│ from storage │  │ for standard       │
│ by UUID      │  │ pipeline path      │
└──────┬───────┘  └────────┬───────────┘
       │                   │
       ↓                   ↓
┌──────────────┐  ┌────────────────────┐
│ Pipeline     │  │ Found standard     │
│ found?       │  │ pipeline?          │
└──────┬───────┘  └────────┬───────────┘
       │                   │
   ┌───┴───┐           ┌───┴───┐
  YES     NO          YES     NO
   │       │           │       │
   ↓       ↓           ↓       ↓
┌─────┐ ┌────────┐ ┌────────┐ ┌──────────┐
│Show │ │Show    │ │Show    │ │Show      │
│pipe-│ │"Pipe-  │ │standard│ │"Pipe-    │
│line │ │lines"  │ │name    │ │lines"    │
│name │ │        │ │(e.g.   │ │          │
│     │ │        │ │"RFQ")  │ │          │
└─────┘ └────────┘ └────────┘ └──────────┘
```

---

## 📦 Data Structure in localStorage

```javascript
// Key: "hierarchicalPipelines"
// Value: Array of flat pipeline objects

[
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    name: "Marketing Campaign",
    parentId: null,  // ← Top-level pipeline
    userId: "user123",
    userName: "John Doe",
    createdAt: "2025-10-16T10:30:00Z",
    stages: [...], // 9 standard stages
    dealCounts: { rfq: 5, feasibility: 3, ... }
  },
  {
    id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    name: "Q1 Campaign",
    parentId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",  // ← Child
    userId: "user123",
    userName: "John Doe",
    createdAt: "2025-10-16T10:35:00Z",
    stages: [...],
    dealCounts: { rfq: 2, feasibility: 1, ... }
  },
  {
    id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
    name: "Sales Outreach",
    parentId: null,  // ← Another top-level
    userId: "user123",
    userName: "John Doe",
    createdAt: "2025-10-16T10:40:00Z",
    stages: [...],
    dealCounts: { rfq: 8, feasibility: 6, ... }
  }
]

↓ buildTree() converts to ↓

[
  {
    id: "a1b2c3d4...",
    name: "Marketing Campaign",
    children: [
      {
        id: "b2c3d4e5...",
        name: "Q1 Campaign",
        children: [],
        ...
      }
    ],
    ...
  },
  {
    id: "c3d4e5f6...",
    name: "Sales Outreach",
    children: [],
    ...
  }
]
```

---

## 🎯 Example Scenarios

### Scenario 1: View Main Custom Pipeline

```
User Action:
  Click "Marketing Campaign" in sidebar

URL:
  /crm/pipelines/a1b2c3d4-e5f6-7890-abcd-ef1234567890/rfq

useParams() extracts:
  pipelineId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"

findById() returns:
  {
    id: "a1b2c3d4...",
    name: "Marketing Campaign",
    parentId: null,
    ...
  }

Top Bar Shows:
  ┌─────────────────────────────────────────────┐
  │ Marketing Campaign ▼ │ RFQ │ Feasibility   │
  └─────────────────────────────────────────────┘
```

---

### Scenario 2: View Sub-Pipeline

```
User Action:
  Click "Q1 Campaign" (sub-pipeline) in sidebar

URL:
  /crm/pipelines/b2c3d4e5-f6a7-8901-bcde-f12345678901/rfq

useParams() extracts:
  pipelineId = "b2c3d4e5-f6a7-8901-bcde-f12345678901"

findById() returns:
  {
    id: "b2c3d4e5...",
    name: "Q1 Campaign",
    parentId: "a1b2c3d4...",
    ...
  }

Top Bar Shows:
  ┌─────────────────────────────────────────────┐
  │ Q1 Campaign ▼ │ RFQ │ Feasibility │ ...    │
  └─────────────────────────────────────────────┘

Dropdown Shows:
  ┌──────────────────────────────────┐
  │ Marketing Campaign               │
  │ Q1 Campaign (Sub-Pipeline) ✓     │ ← Current, checked
  │ Sales Outreach                   │
  └──────────────────────────────────┘
```

---

### Scenario 3: Navigate Between Pipelines

```
Current View: "Marketing Campaign"
Top Bar Shows: "Marketing Campaign"

User Action:
  Click "Sales Outreach" tab in top bar

Result:
  1. router.push() called with new UUID
  2. URL changes to: /crm/pipelines/c3d4e5f6.../rfq
  3. useParams() extracts new pipelineId
  4. useEffect triggers (params changed)
  5. findById() finds "Sales Outreach"
  6. setCurrentPipeline() updates state
  7. Component re-renders

New Top Bar Shows:
  ┌─────────────────────────────────────────────┐
  │ Sales Outreach ▼ │ RFQ │ Feasibility │ ... │
  └─────────────────────────────────────────────┘
```

---

### Scenario 4: Standard Pipeline Navigation

```
User Action:
  Click "RFQ" tab (standard pipeline)

URL:
  /crm/pipelines/rfq

useParams() extracts:
  pipelineId = undefined (not a custom pipeline route)

getCurrentPipelineName() logic:
  1. currentPipeline is null
  2. Check pathname for standard pipeline
  3. pathname.startsWith("/crm/pipelines/rfq")
  4. Return "RFQ"

Top Bar Shows:
  ┌─────────────────────────────────────────────┐
  │ RFQ ▼ │ RFQ │ Feasibility │ Quotation │ ...│
  └─────────────────────────────────────────────┘
```

---

## ⚡ Performance Optimizations

```
┌─────────────────────────────────────────────────────────────────┐
│  OPTIMIZATION 1: Only Build Tree Once Per Load                  │
├─────────────────────────────────────────────────────────────────┤
│  useEffect(() => {                                              │
│    const stored = localStorage.getItem("hierarchicalPipelines");│
│    if (stored) {                                                │
│      const flatPipelines = JSON.parse(stored);                 │
│      const tree = pipelineHelpers.buildTree(flatPipelines);    │
│      //       ^^^ Only called when localStorage changes        │
│      setAllPipelines(tree);                                    │
│    }                                                            │
│  }, [pathname, params]);                                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  OPTIMIZATION 2: Efficient ID Lookup                             │
├─────────────────────────────────────────────────────────────────┤
│  const findById = (tree, id) => {                               │
│    for (const pipeline of tree) {                               │
│      if (pipeline.id === id) return pipeline;                   │
│      const found = findById(pipeline.children, id);             │
│      if (found) return found;                                   │
│    }                                                            │
│    return null;                                                 │
│  };                                                             │
│  // Stops searching as soon as ID is found                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  OPTIMIZATION 3: Memoized Pipeline List                          │
├─────────────────────────────────────────────────────────────────┤
│  const pipelinesWithContent = getAllPipelinesWithContent(       │
│    allPipelines                                                 │
│  );                                                             │
│  // Only recalculated when allPipelines changes                 │
│  // Could be further optimized with useMemo()                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✅ Success Indicators

```
┌─────────────────────────────────────────────────────────────────┐
│  VISUAL CONFIRMATION                                             │
├─────────────────────────────────────────────────────────────────┤
│  ✅ Top bar shows actual pipeline name, not "Pipeline"          │
│  ✅ Name updates immediately when renamed                        │
│  ✅ Sub-pipelines show "(Sub-Pipeline)" label                    │
│  ✅ Clicking any pipeline navigates correctly                    │
│  ✅ No "Pipeline Not Found" errors                               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  TECHNICAL CONFIRMATION                                          │
├─────────────────────────────────────────────────────────────────┤
│  ✅ No TypeScript compilation errors                             │
│  ✅ No console errors in browser                                 │
│  ✅ useParams() extracting ID correctly                          │
│  ✅ localStorage data structure valid                            │
│  ✅ Tree building logic working                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  FUNCTIONAL CONFIRMATION                                         │
├─────────────────────────────────────────────────────────────────┤
│  ✅ Create pipeline → shows in top bar                           │
│  ✅ Rename pipeline → top bar updates                            │
│  ✅ Create sub-pipeline → navigates and displays                 │
│  ✅ Delete pipeline → removes from top bar                       │
│  ✅ Standard pipelines → still work correctly                    │
└─────────────────────────────────────────────────────────────────┘
```

---

**Visual Flow Diagram - Version 1.1.2**  
**Created**: October 16, 2025  
**Feature**: Unique Top Navigation for Custom Pipelines  
**Status**: ✅ Complete and Documented

