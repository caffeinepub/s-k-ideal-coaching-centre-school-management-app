# Specification

## Summary
**Goal:** Overhaul the School Mitra dashboard and all management sections with high-quality solid graphics, fix transparency/background issues throughout, remove Quick Actions, replace "Mark as Paid" with a Paid/Unpaid toggle, and perform a comprehensive UI bug fix pass.

**Planned changes:**
- Remove the "Quick Actions" section entirely from the Dashboard Overview
- Fix transparent/semi-transparent backgrounds in the Add Student modal's Parent Details section
- Fix translucent/glass-effect backgrounds across all section modals and cards: Student Management, Fees Management, Teacher Management, and Report Card section
- Remove "Mark as Paid" button from Fees Management and replace with a Paid/Unpaid toggle on each fee record row, with bold green (Paid) and bold red/orange (Unpaid) visual states, persisted via backend
- Redesign the overall visual style: replace all glass/translucent surfaces with solid richly colored backgrounds, apply a bold color palette (deep navy, emerald green, amber, white), use high-quality solid SVG icons (Heroicons or Lucide) throughout, apply strong typographic hierarchy, and add rich gradient/texture accents to headers and stat cards
- Comprehensive UI bug fix across all components: fix misaligned forms, broken layouts, inconsistent spacing, unreadable text, modal overflow, missing empty/loading states in DashboardOverview, StudentsSection, FeesSection, TeachersSection, AttendanceSection, ReportCardsSection, ActivityLogSection, Header, and Footer

**User-visible outcome:** The app presents a polished, high-contrast, fully opaque UI with no transparency artifacts, a cleaner dashboard without Quick Actions, an intuitive Paid/Unpaid fee toggle, consistent bold iconography, and a comprehensive fix of all existing visual and layout bugs across every section.
