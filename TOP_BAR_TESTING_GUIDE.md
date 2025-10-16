# Top Navigation Bar Testing Guide

## 🎯 Quick Test Plan

Follow these steps to verify that the top navigation bar correctly shows unique pipeline names for custom pipelines and sub-pipelines.

---

## ✅ Test 1: Create and View Custom Pipeline

### Steps:
1. **Open the app** at `http://localhost:3001/crm/pipelines`
2. **Click "Add Pipeline"** button in the sidebar (bottom left)
3. **Observe the sidebar**: A new pipeline appears (e.g., "Pipeline 1")
4. **Click the new pipeline** to view it

### Expected Results:
✅ **Top bar shows**: "Pipeline 1" (not "Pipeline")  
✅ **Dropdown button shows**: "Pipeline 1"  
✅ **URL is**: `/crm/pipelines/{some-uuid}/rfq`  
✅ **Pipeline loads**: No "Pipeline Not Found" error  

### Screenshot:
```
┌─────────────────────────────────────────────┐
│  Pipeline 1  ▼  │ RFQ │ Feasibility │ ...  │ ← Top bar shows actual name
└─────────────────────────────────────────────┘
```

---

## ✅ Test 2: Rename Custom Pipeline

### Steps:
1. **View the custom pipeline** from Test 1
2. **In the sidebar**, double-click "Pipeline 1"
3. **Type**: "Marketing Campaign"
4. **Press Enter** to save
5. **Look at the top navigation bar**

### Expected Results:
✅ **Top bar updates to**: "Marketing Campaign"  
✅ **Dropdown button shows**: "Marketing Campaign"  
✅ **Sidebar shows**: "Marketing Campaign"  
✅ **Change is immediate**: No page refresh needed  

### Screenshot:
```
┌─────────────────────────────────────────────┐
│ Marketing Campaign ▼ │ RFQ │ Feasibility   │ ← Name updated
└─────────────────────────────────────────────┘
```

---

## ✅ Test 3: Create and View Sub-Pipeline

### Steps:
1. **Hover over** "Marketing Campaign" in sidebar
2. **Click the "•••"** (more options) button
3. **Select "Add Sub-Pipeline"**
4. **Observe**: A nested pipeline appears (e.g., "Sub-Pipeline 1")
5. **Click "Sub-Pipeline 1"** to view it

### Expected Results:
✅ **Top bar shows**: "Sub-Pipeline 1" (not "Marketing Campaign")  
✅ **Dropdown button shows**: "Sub-Pipeline 1"  
✅ **In dropdown menu**: Shows "Sub-Pipeline 1 (Sub-Pipeline)" with label  
✅ **URL is**: `/crm/pipelines/{sub-uuid}/rfq`  
✅ **Sub-pipeline loads**: Shows its own stages  

### Screenshot:
```
┌─────────────────────────────────────────────┐
│ Sub-Pipeline 1 ▼ │ RFQ │ Feasibility │ ... │ ← Sub-pipeline name
└─────────────────────────────────────────────┘

Click dropdown ▼:
┌──────────────────────────────┐
│ Marketing Campaign           │
│ Sub-Pipeline 1 (Sub-Pipeline)│ ← Shows indicator
└──────────────────────────────┘
```

---

## ✅ Test 4: Navigate Between Pipelines

### Steps:
1. **Create two custom pipelines**:
   - "Marketing Campaign"
   - "Sales Outreach"
2. **Click "Marketing Campaign"** tab in top bar
3. **Observe the top bar**
4. **Click "Sales Outreach"** tab
5. **Observe the top bar** again

### Expected Results:
✅ **When on Marketing Campaign**:
   - Top bar shows: "Marketing Campaign"
   - URL: `/crm/pipelines/{uuid-1}/rfq`

✅ **When on Sales Outreach**:
   - Top bar shows: "Sales Outreach"
   - URL: `/crm/pipelines/{uuid-2}/rfq`

✅ **Active tab highlights**: Current pipeline tab is highlighted
✅ **Navigation is instant**: No page reload

---

## ✅ Test 5: Standard Pipeline Navigation

### Steps:
1. **From a custom pipeline**, click the **"RFQ"** tab (standard pipeline)
2. **Observe the top bar**
3. **Click "Feasibility"** tab
4. **Observe the top bar**

### Expected Results:
✅ **When on RFQ**:
   - Top bar shows: "RFQ"
   - URL: `/crm/pipelines/rfq`

✅ **When on Feasibility**:
   - Top bar shows: "Feasibility"
   - URL: `/crm/pipelines/feasibility`

✅ **Standard pipelines work**: Same behavior as before
✅ **No regression**: Custom pipeline feature doesn't break standard pipelines

---

## ✅ Test 6: Dropdown Menu Display

### Steps:
1. **Create the following structure**:
   ```
   📁 Marketing Campaign
      └─ 📁 Q1 Campaign
      └─ 📁 Q2 Campaign
   📁 Sales Outreach
      └─ 📁 Enterprise Deals
   ```
2. **Click the dropdown button** (▼) in top navigation bar
3. **Observe the menu items**

### Expected Results:
✅ **Dropdown shows**:
   ```
   Marketing Campaign
   Q1 Campaign (Sub-Pipeline)
   Q2 Campaign (Sub-Pipeline)
   Sales Outreach
   Enterprise Deals (Sub-Pipeline)
   ```

✅ **Sub-pipeline indicator**: "(Sub-Pipeline)" appears for nested pipelines  
✅ **All pipelines clickable**: Can navigate to any pipeline from dropdown  
✅ **Current pipeline highlighted**: Active pipeline has visual indicator  

---

## ✅ Test 7: Real-Time Updates

### Steps:
1. **View a custom pipeline** (e.g., "Pipeline 1")
2. **Keep the page open**
3. **In sidebar**, rename "Pipeline 1" to "Test Pipeline"
4. **Watch the top navigation bar**

### Expected Results:
✅ **Top bar updates immediately**: Shows "Test Pipeline"  
✅ **No page refresh needed**: Change is instant  
✅ **Dropdown also updates**: Button text changes  
✅ **URL stays the same**: UUID-based URL doesn't change  

---

## ✅ Test 8: Edge Cases

### Test 8A: Empty Pipeline Name
1. **Create a pipeline**
2. **Rename to empty string** (just spaces)
3. **Press Enter**

**Expected**: Top bar shows fallback name or prevents empty name

---

### Test 8B: Very Long Pipeline Name
1. **Create a pipeline**
2. **Rename to**: "This Is A Very Long Pipeline Name That Should Be Truncated Or Wrapped Properly In The UI"
3. **Press Enter**

**Expected**: 
- Top bar handles long name gracefully
- Text doesn't overflow
- Either truncates with "..." or wraps to fit

---

### Test 8C: Special Characters
1. **Create a pipeline**
2. **Rename to**: "Campaign #1 (2025) - Q1/Q2"
3. **Press Enter**

**Expected**: 
- Special characters display correctly
- No encoding issues
- Top bar shows: "Campaign #1 (2025) - Q1/Q2"

---

### Test 8D: Navigate to Invalid UUID
1. **Manually type URL**: `/crm/pipelines/invalid-uuid-12345/rfq`
2. **Press Enter**

**Expected**:
- Shows "Pipeline Not Found" error
- Top bar shows fallback: "Pipelines"
- No crash or blank screen

---

## 🔍 Visual Checklist

When viewing a **custom pipeline**, verify:

- [ ] Top bar dropdown button shows pipeline name (not "Pipeline")
- [ ] Active tab is highlighted
- [ ] Clicking dropdown shows all pipelines with content
- [ ] Sub-pipelines have "(Sub-Pipeline)" label
- [ ] Renaming updates top bar immediately
- [ ] Creating new pipeline adds it to top bar tabs
- [ ] Deleting pipeline removes it from top bar
- [ ] Standard pipelines still work (RFQ, Feasibility, etc.)

---

## 🐛 Common Issues to Watch For

### Issue 1: Top bar still shows "Pipeline"
**Cause**: `currentPipeline` state not updating  
**Check**: 
- Verify `useParams()` is imported
- Confirm `pipelineId` is being extracted from URL
- Check browser console for errors

---

### Issue 2: Sub-pipelines don't show indicator
**Cause**: `pipeline.parentId` is null or undefined  
**Check**:
- Verify sub-pipeline has `parentId` set
- Check localStorage data structure
- Confirm `getAllPipelinesWithContent()` is working

---

### Issue 3: Dropdown menu is empty
**Cause**: No pipelines with content  
**Check**:
- Verify pipelines have deals/stages
- Check `pipelineHelpers.hasContent()` logic
- Confirm `getAllPipelinesWithContent()` returns data

---

### Issue 4: Navigation doesn't work
**Cause**: Incorrect URL format  
**Check**:
- Verify URLs are `/{pipelineId}/rfq` not `/custom/${id}`
- Check `router.push()` calls in PipelineNavbar
- Confirm dynamic route exists: `[pipelineId]/page.tsx`

---

## 📊 Expected Behavior Summary

| Scenario | Top Bar Should Show |
|----------|---------------------|
| On standard pipeline (RFQ) | "RFQ" |
| On standard pipeline (Feasibility) | "Feasibility" |
| On custom pipeline "Marketing" | "Marketing" |
| On sub-pipeline "Q1 Campaign" | "Q1 Campaign" |
| On pipeline with very long name | Truncated or wrapped name |
| On invalid pipeline UUID | "Pipelines" (fallback) |
| After renaming pipeline | New name immediately |
| After creating new pipeline | New pipeline in tabs |
| After deleting pipeline | Pipeline removed from tabs |

---

## ✅ Success Criteria

All tests pass if:

1. ✅ **Unique Names**: Each custom pipeline shows its actual name in top bar
2. ✅ **Sub-Pipeline Indicators**: Nested pipelines show "(Sub-Pipeline)" label
3. ✅ **Real-Time Updates**: Name changes reflect immediately
4. ✅ **Correct Navigation**: All pipelines navigate to correct URLs
5. ✅ **No Regressions**: Standard pipelines still work as before
6. ✅ **No Errors**: No console errors or TypeScript compilation errors
7. ✅ **Consistent UI**: Visual consistency across all pipeline types
8. ✅ **Edge Cases Handled**: Empty names, long names, special characters work

---

## 🚀 Quick Start

```bash
# Start the development server (if not running)
npm run dev

# Open browser to
http://localhost:3001/crm/pipelines

# Run through Test 1-8 above
```

---

## 📝 Notes

- **localStorage**: All pipeline data stored in `hierarchicalPipelines` key
- **UUID Format**: Standard UUID v4 format (e.g., `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)
- **Naming Convention**: Pipelines can be renamed to any string (validation in component)
- **Hierarchical Structure**: Unlimited nesting depth supported

---

**Version**: 1.1.2  
**Feature**: Unique Top Navigation for Custom Pipelines  
**Status**: ✅ Ready for Testing  
**Last Updated**: October 16, 2025

