Build a Gantt Chart Proof-of-Concept in React + TypeScript (Vite) styled with TailwindCSS. Everything in a single page (App.tsx).

Goal:
A 7-day week Gantt where tasks are created via modal, positioned by real dates, and can be dragged and resized by day snapping.

Requirements:

UI:

- Header showing Mon–Sun with actual dates for a fixed weekStart = "2026-02-02".
- 3 lanes: Backend, Frontend, QA.
- Grid background showing 7 equal columns (dayWidth = 120px).
- Clean Tailwind styling.

Task model:
{
id: string,
title: string,
laneId: "backend" | "frontend" | "qa",
start: "YYYY-MM-DD",
end: "YYYY-MM-DD"
}

Rendering math:

- startIndex = daysBetween(weekStart, task.start)
- endIndex = daysBetween(weekStart, task.end)
- left = startIndex \* dayWidth
- width = (endIndex - startIndex + 1) \* dayWidth

Interactions:

1. Drag bar horizontally:
   - Snap to dayWidth
   - Update both start and end dates
   - Clamp inside the visible week (0..6)

2. Resize bar from right edge handle:
   - Snap to dayWidth
   - Update end date only
   - end >= start
   - Clamp inside week

Add Task Modal:

- Button “+ Task”
- Modal with fields:
  - Title
  - Lane select
  - Start date picker
  - End date picker
- Validate start/end within weekStart..weekStart+6 and end >= start
- On submit, add task to state

Helpers to implement:

- parseDate
- formatDate
- addDays
- daysBetween

Tailwind styling:

- Lanes with light background
- Bars with rounded corners, colored per lane
- Cursor styles: grab, grabbing, ew-resize

No backend. No routing. No libraries for drag. Use pointer events.

Deliverable:
A fully working App.tsx and instructions to run.
