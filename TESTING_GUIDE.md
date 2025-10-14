# Testing Guide - Pipeline Management System

## 🚀 Quick Start

The development server is running on: **http://localhost:3001**

## ✅ Test Scenarios

### 1. Create a New Pipeline (Sidebar)

**Steps:**
1. Navigate to http://localhost:3001/crm/pipelines/rfq
2. Look at the left sidebar under "Custom Pipelines"
3. Click the green **"Add Pipeline"** button at the bottom of the sidebar
4. ✅ **Expected:** New pipeline appears at the TOP of the custom pipelines list
5. ✅ **Expected:** Automatically navigated to the new pipeline page
6. ✅ **Expected:** Pipeline has one default stage called "Stage 1"

**What to Verify:**
- [ ] Pipeline appears at top of sidebar list
- [ ] Pipeline has unique name (e.g., "Pipeline 1", "Pipeline 2")
- [ ] Navigation happens automatically
- [ ] Pipeline starts in "Pending" status (yellow badge)

---

### 2. Add Sub-Pipeline

**Steps:**
1. In the sidebar, hover over any custom pipeline
2. ✅ **Expected:** Three icons appear on hover: Plus (+), Edit (✏️), Delete (🗑️)
3. Click the **Plus (+)** icon
4. ✅ **Expected:** A sub-pipeline appears nested under the parent
5. ✅ **Expected:** Parent pipeline auto-expands to show child
6. ✅ **Expected:** Sub-pipeline appears at the TOP of children

**What to Verify:**
- [ ] Sub-pipeline is indented under parent
- [ ] Sub-pipeline has unique name (e.g., "Sub-Pipeline 1")
- [ ] Parent shows chevron icon (▶/▼) for expand/collapse
- [ ] Clicking chevron toggles children visibility

---

### 3. Add Items to Pipeline

**Steps:**
1. Navigate to any pipeline (click it in sidebar or navbar)
2. Click **"Add Item"** button (top right)
3. Fill in at least the "Company Name" field
4. Click **"Save Item"**
5. ✅ **Expected:** Item appears in the table
6. ✅ **Expected:** Pipeline now has content (not empty)

**What to Verify:**
- [ ] Item shows in table with green header
- [ ] Date is auto-filled with current date
- [ ] Priority badge shows correct color (High=Red, Medium=Yellow, Low=Blue)
- [ ] Delete button works for items

---

### 4. Rename Pipeline

**Steps:**
1. In sidebar, **double-click** on any pipeline name
2. ✅ **Expected:** Inline input field appears
3. Type a new name
4. Press **Enter** or click outside
5. ✅ **Expected:** Name updates immediately

**What to Verify:**
- [ ] Double-click triggers edit mode
- [ ] Input field appears with current name selected
- [ ] ESC key cancels edit
- [ ] Enter key saves edit
- [ ] Name updates in sidebar

---

### 5. Delete Pipeline

**Steps:**
1. In sidebar, hover over a pipeline
2. Click the **Delete (🗑️)** icon
3. ✅ **Expected:** Confirmation dialog appears
4. Click **OK** to confirm
5. ✅ **Expected:** Pipeline and all sub-pipelines removed
6. ✅ **Expected:** If viewing deleted pipeline, redirected to RFQ

**What to Verify:**
- [ ] Confirmation dialog shows warning
- [ ] Pipeline disappears from sidebar
- [ ] Sub-pipelines also deleted
- [ ] Navigation redirects if needed

---

### 6. Admin Dashboard Access

**Steps:**
1. Navigate to http://localhost:3001/crm/admin
2. ✅ **Expected:** Admin dashboard loads with stats cards
3. ✅ **Expected:** Four stat cards show: Total, Pending, Approved, Rejected counts

**What to Verify:**
- [ ] Stats cards display correct counts
- [ ] All pipelines shown in tree structure
- [ ] Search bar is present
- [ ] Filter buttons (All/Pending/Approved/Rejected) are visible

---

### 7. Admin Approve Pipeline

**Steps:**
1. On admin dashboard, find a pipeline with status = "Pending"
2. ✅ **Expected:** Green checkmark (✓) button visible
3. Click the **checkmark** button
4. ✅ **Expected:** Status immediately changes to "Approved"
5. ✅ **Expected:** Status badge turns green
6. Navigate to the pipeline page
7. ✅ **Expected:** Green banner shows "Approved" status

**What to Verify:**
- [ ] Status changes without page reload
- [ ] Badge color updates (yellow → green)
- [ ] Approve button disappears (only for Pending)
- [ ] Pipeline page shows approval banner

---

### 8. Admin Reject Pipeline

**Steps:**
1. On admin dashboard, find a pipeline with status = "Pending"
2. Click the **red X** button
3. ✅ **Expected:** Modal opens asking for rejection reason
4. Type a reason (e.g., "Missing required information")
5. Click **"Reject Pipeline"**
6. ✅ **Expected:** Modal closes
7. ✅ **Expected:** Pipeline status changes to "Rejected" (red badge)

**What to Verify:**
- [ ] Modal requires rejection reason
- [ ] Cannot submit empty reason
- [ ] Status changes to "Rejected"
- [ ] Badge color updates (yellow → red)
- [ ] Rejection reason is saved

---

### 9. User Dashboard Rejection Notification

**Steps:**
1. Reject a pipeline as admin (follow step 8)
2. Navigate to http://localhost:3001/crm
3. ✅ **Expected:** Red alert box appears at top of dashboard
4. ✅ **Expected:** Shows pipeline name and rejection reason
5. Click **"Review"** button
6. ✅ **Expected:** Navigates to rejected pipeline page
7. ✅ **Expected:** Red banner shows rejection details

**What to Verify:**
- [ ] Alert box is prominent and red
- [ ] Shows count of rejected pipelines
- [ ] Shows rejection reason clearly
- [ ] Review button navigates to pipeline
- [ ] Pipeline page shows full rejection info with date

---

### 10. Filter Pipelines (Admin)

**Steps:**
1. On admin dashboard
2. Create multiple pipelines with different statuses:
   - Some Pending
   - Some Approved (click checkmark)
   - Some Rejected (click X)
3. Click **"Pending"** filter button
4. ✅ **Expected:** Only pending pipelines show
5. Click **"Approved"** filter button
6. ✅ **Expected:** Only approved pipelines show
7. Click **"Rejected"** filter button
8. ✅ **Expected:** Only rejected pipelines show
9. Click **"All"** filter button
10. ✅ **Expected:** All pipelines show again

**What to Verify:**
- [ ] Filter buttons highlight when active
- [ ] Correct pipelines show for each filter
- [ ] Stats cards remain accurate
- [ ] Search works with filters

---

### 11. Search Pipelines (Admin)

**Steps:**
1. On admin dashboard with multiple pipelines
2. Type pipeline name in search box
3. ✅ **Expected:** Results filter in real-time
4. ✅ **Expected:** Only matching pipelines show
5. Clear search
6. ✅ **Expected:** All pipelines show again

**What to Verify:**
- [ ] Search is case-insensitive
- [ ] Results update as you type
- [ ] Works with partial matches
- [ ] Works with filters enabled

---

### 12. Pipeline Tree Expand/Collapse

**Steps:**
1. Create a pipeline with sub-pipelines
2. In sidebar, click the **chevron (▶)** icon
3. ✅ **Expected:** Pipeline expands to show children
4. ✅ **Expected:** Chevron rotates to (▼)
5. Click chevron again
6. ✅ **Expected:** Pipeline collapses, hiding children
7. ✅ **Expected:** Chevron rotates back to (▶)

**What to Verify:**
- [ ] Chevron only shows if pipeline has children
- [ ] Expand/collapse animates smoothly
- [ ] Children indent properly (16px per level)
- [ ] State persists while on page (lost on reload)

---

### 13. Pipeline Settings Panel

**Steps:**
1. Navigate to any pipeline page
2. Click the **Settings (⚙️)** icon (top right)
3. ✅ **Expected:** Settings panel expands below navbar
4. ✅ **Expected:** Shows pipeline metadata:
   - Name
   - Created date/time
   - Last updated date/time
   - Type (Main or Sub-Pipeline)
   - Status (Pending/Approved/Rejected)
   - Stages count
   - Sub-Pipelines count

**What to Verify:**
- [ ] All metadata displays correctly
- [ ] Timestamps formatted nicely
- [ ] Can add new stages from settings
- [ ] Can delete stages (not last one)
- [ ] Close button works

---

### 14. Add/Manage Stages

**Steps:**
1. Open pipeline settings panel
2. In "Add New Stage" section, type a stage name
3. Click **"Add Stage"** or press Enter
4. ✅ **Expected:** New stage appears in tabs at top
5. ✅ **Expected:** Stage added to "Manage Stages" list
6. Try to delete the last remaining stage
7. ✅ **Expected:** Cannot delete (button disabled or alert)
8. Add another stage, then delete one
9. ✅ **Expected:** Stage removed successfully

**What to Verify:**
- [ ] New stages appear in tabs
- [ ] Stage tabs are clickable
- [ ] Active stage highlights (blue background)
- [ ] Cannot delete last stage
- [ ] Deleting stage asks for confirmation
- [ ] Deleted stage items are lost (warn user)

---

### 15. Pipeline Status Display

**Steps:**
1. Create a new pipeline (status = Pending)
2. Navigate to pipeline page
3. ✅ **Expected:** Yellow banner: "Status: Pending Admin Approval"
4. Go to admin, approve the pipeline
5. Return to pipeline page (refresh if needed)
6. ✅ **Expected:** Green banner: "Status: Approved"
7. Go to admin, reject the pipeline
8. Return to pipeline page
9. ✅ **Expected:** Red banner with rejection reason and details

**What to Verify:**
- [ ] Pending = Yellow banner
- [ ] Approved = Green banner
- [ ] Rejected = Red banner with reason
- [ ] Banners appear above settings panel
- [ ] Rejection shows date and admin name

---

### 16. Empty Pipeline Indicator

**Steps:**
1. Create a new pipeline
2. Don't add any items
3. Go to admin dashboard
4. Find the pipeline in the list
5. ✅ **Expected:** Gray "Empty" badge next to status badge
6. Add an item to the pipeline
7. Refresh admin dashboard
8. ✅ **Expected:** "Empty" badge disappears

**What to Verify:**
- [ ] Empty badge shows for pipelines with no items
- [ ] Badge disappears when items added
- [ ] Works for both main and sub-pipelines
- [ ] Empty pipelines still saved (changed requirement)

---

### 17. Navbar Pipeline Dropdown

**Steps:**
1. Navigate to any pipeline page
2. Click the **dropdown button** (next to current pipeline name)
3. ✅ **Expected:** Dropdown menu opens
4. ✅ **Expected:** Two sections: "Standard Pipelines" and "Custom Pipelines"
5. Click a pipeline from the dropdown
6. ✅ **Expected:** Navigates to selected pipeline
7. ✅ **Expected:** Dropdown closes

**What to Verify:**
- [ ] Dropdown shows all standard pipelines (RFQ, Feasibility, etc.)
- [ ] Shows custom pipelines with content
- [ ] Empty pipelines NOT in dropdown
- [ ] Current pipeline name displayed in button
- [ ] Clicking outside closes dropdown

---

### 18. Horizontal Tab Navigation

**Steps:**
1. Navigate to http://localhost:3001/crm/pipelines/rfq
2. ✅ **Expected:** Horizontal tabs show: RFQ | Feasibility | Quotation | etc.
3. Click different tabs
4. ✅ **Expected:** Each tab navigates to that pipeline
5. Create a custom pipeline with items
6. ✅ **Expected:** Custom pipeline appears as additional tab
7. ✅ **Expected:** Active tab has blue background

**What to Verify:**
- [ ] All standard pipelines show as tabs
- [ ] Custom pipelines with content show as tabs
- [ ] Empty custom pipelines DON'T show as tabs
- [ ] Active tab highlighted (blue bg, green border)
- [ ] Tabs scroll horizontally if many pipelines

---

### 19. Multiple Sub-Pipeline Levels

**Steps:**
1. Create a main pipeline
2. Add a sub-pipeline to it
3. Hover over the sub-pipeline
4. Add another sub-pipeline to the sub-pipeline
5. ✅ **Expected:** 3 levels of nesting visible
6. ✅ **Expected:** Each level indented by 16px
7. ✅ **Expected:** Each level can expand/collapse

**What to Verify:**
- [ ] Can nest pipelines multiple levels deep
- [ ] Indentation increases per level
- [ ] All levels function independently
- [ ] Deleting parent deletes all children
- [ ] Navigation works at any level

---

### 20. Persistence Across Page Reloads

**Steps:**
1. Create several pipelines and sub-pipelines
2. Add items to them
3. Approve some, reject others (as admin)
4. **Hard refresh** the page (Ctrl+Shift+R / Cmd+Shift+R)
5. ✅ **Expected:** All pipelines still there
6. ✅ **Expected:** Tree structure maintained
7. ✅ **Expected:** Items still present
8. ✅ **Expected:** Status preserved
9. ✅ **Expected:** Rejection reasons intact

**What to Verify:**
- [ ] Pipelines persist in localStorage
- [ ] Hierarchy maintained
- [ ] All metadata saved
- [ ] Status and rejection info preserved
- [ ] Works across browser sessions

---

## 🐛 Common Issues & Solutions

### Issue: Pipeline not appearing in sidebar
**Solution:** Make sure to add at least one item to the pipeline. Empty pipelines (with no items) are not displayed.

### Issue: "Add Pipeline" button not working
**Solution:** Check browser console for errors. Ensure localStorage is enabled.

### Issue: Can't navigate to custom pipeline
**Solution:** Verify the pipeline has content (items). Only pipelines with items appear in navbar dropdown.

### Issue: Admin dashboard not showing pipelines
**Solution:** 
1. Check that you've created pipelines from the sidebar
2. Verify localStorage has `hierarchicalPipelines` key
3. Open browser DevTools → Application → Local Storage → check data

### Issue: Rejection reason not showing
**Solution:** Ensure you filled in the rejection reason in the modal. Check pipeline page and user dashboard.

### Issue: Timestamps not updating
**Solution:** Timestamps update on:
- Pipeline creation
- Pipeline rename
- Adding sub-pipelines
- Status changes (approve/reject)
- Adding/deleting items

---

## 📊 Test Data Setup

### Quick Setup Script (Browser Console)

```javascript
// Clear existing data
localStorage.removeItem('hierarchicalPipelines');

// Create sample pipelines
const samplePipelines = [
  {
    id: 'test-pipeline-1',
    name: 'Marketing Campaign',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    parentId: null,
    status: 'Pending',
    stages: [
      {
        id: 'stage-1',
        name: 'Planning',
        items: [
          {
            id: 'item-1',
            date: new Date().toISOString(),
            company_name: 'Acme Corp',
            contact: 'John Doe',
            department: 'Marketing',
            description: 'Q1 campaign planning',
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            priority: 'High',
            state: 'Active',
            source: 'manual'
          }
        ]
      }
    ],
    children: [],
    childIds: []
  },
  {
    id: 'test-pipeline-2',
    name: 'Sales Outreach',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    parentId: null,
    status: 'Approved',
    stages: [
      {
        id: 'stage-2',
        name: 'Leads',
        items: []
      }
    ],
    children: [],
    childIds: []
  }
];

localStorage.setItem('hierarchicalPipelines', JSON.stringify(samplePipelines));
location.reload();
```

---

## ✅ Acceptance Criteria Checklist

### Core Functionality
- [ ] ✅ Add Pipeline button ONLY in sidebar (not navbar)
- [ ] ✅ New pipelines appear at TOP of list
- [ ] ✅ Add Sub-Pipeline creates nested structure
- [ ] ✅ Sub-pipelines appear at TOP of parent's children
- [ ] ✅ Pipelines only saved if they have content
- [ ] ✅ Each pipeline/sub-pipeline has unique ID

### Admin Features
- [ ] ✅ Admin dashboard accessible at `/crm/admin`
- [ ] ✅ View all pipelines in hierarchical structure
- [ ] ✅ Filter by status (All/Pending/Approved/Rejected)
- [ ] ✅ Search pipelines by name
- [ ] ✅ Approve pipelines (green checkmark)
- [ ] ✅ Reject pipelines with reason (red X)
- [ ] ✅ View pipeline details (eye icon)

### User Experience
- [ ] ✅ Rejected pipelines show on user dashboard
- [ ] ✅ Rejection reason displayed clearly
- [ ] ✅ Review button navigates to pipeline
- [ ] ✅ Pipeline page shows status banners
- [ ] ✅ Metadata tracked (created, updated, status)

### UI/UX
- [ ] ✅ Tree view with expand/collapse
- [ ] ✅ Hover actions on pipelines
- [ ] ✅ Double-click to rename
- [ ] ✅ Status badges (color-coded)
- [ ] ✅ Empty pipeline indicators
- [ ] ✅ Responsive design

### Data Persistence
- [ ] ✅ Data stored in localStorage
- [ ] ✅ Survives page reloads
- [ ] ✅ Hierarchical structure maintained
- [ ] ✅ All metadata preserved

---

## 🎉 Success Metrics

After testing, you should be able to:

1. ✅ Create unlimited pipelines from sidebar
2. ✅ Nest sub-pipelines infinitely
3. ✅ Manage all pipelines from admin dashboard
4. ✅ Approve/reject with full tracking
5. ✅ See rejection notifications on user dashboard
6. ✅ Filter and search pipelines efficiently
7. ✅ Edit pipeline names and structure
8. ✅ Track complete pipeline lifecycle
9. ✅ Maintain data across sessions
10. ✅ Navigate seamlessly between pipelines

---

## 📝 Notes

- **Current User:** The system uses localStorage without authentication. In production, integrate with your auth system.
- **Admin Access:** Currently open to all. Add role-based access control in production.
- **Data Storage:** Using localStorage (5-10MB limit). For production, migrate to PostgreSQL/MongoDB.
- **Real-time Updates:** Manual refresh needed. Consider WebSockets for real-time collaboration.

---

**Development Server:** http://localhost:3001

**Admin Dashboard:** http://localhost:3001/crm/admin

**User Dashboard:** http://localhost:3001/crm

**Pipelines:** http://localhost:3001/crm/pipelines/rfq
