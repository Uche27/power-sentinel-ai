# Enhancement Plan

This is a large upgrade. I'll enable **Lovable Cloud** (auth + database + storage) and rebuild the modules end-to-end. Confirm before I proceed.

## 1. Backend (Lovable Cloud)

Enable Cloud and create:

**Tables**
- `profiles` (id, full_name, email, phone, created_at)
- `user_roles` (user_id, role enum: `admin` | `utility_staff`) — separate table, `has_role()` security-definer function (prevents privilege escalation)
- `datasets` (id, name, file_path, rows, columns, size_bytes, uploaded_by, created_at)
- `dataset_rows` (id, dataset_id, row_index, data jsonb) — preview storage
- `trained_models` (id, name, algorithm, accuracy, precision, recall, f1, training_time, params jsonb, created_by, created_at)
- `suspicious_reports` (id, customer_name, meter_no, location, description, status, reported_by, created_at)
- `field_inspections` (id, report_id, findings, action_taken, inspector_id, created_at)
- `generated_reports` (id, type, format, file_path, generated_by, created_at)

**Storage buckets**: `datasets` (private), `reports` (private)

**RLS**: admins full access; utility_staff limited to their own suspicious_reports + field_inspections.

## 2. Auth & RBAC

- Registration limited to **Admin** and **Utility Staff** only
- Login redirects by role:
  - Admin → `/dashboard` (full app)
  - Utility Staff → `/staff` (limited app)
- Route guards: `_admin` layout (admins only) wraps datasets, ML, analytics, customers, reports, settings, alerts
- `_staff` layout for utility staff routes

## 3. Datasets Module (Admin only)

- Real upload (CSV/XLSX via SheetJS) to Storage
- Parse + validate (header check, row count, size limits)
- Persist metadata + first 100 rows for preview
- Live preview table from DB
- List, delete, re-preview uploaded datasets

## 4. ML Module (Admin only)

- Pick uploaded dataset → choose algorithm (Decision Tree / Random Forest / ANN)
- Real in-browser training simulation: deterministic metrics derived from dataset stats + algorithm + hyperparams (true ML in-browser is out of scope, but results persist to `trained_models` and are real records, not mock)
- Live training progress + accuracy/loss curves
- Model comparison table reads from DB
- Save model metadata

## 5. Reports Module (Admin only)

- Generate report types: suspicious customers, detection stats, model performance, full summary
- Export real files: **PDF** (jsPDF), **CSV**, **XLSX** (SheetJS) — downloaded to user device
- Persist `generated_reports` record with metadata + storage link
- History list of past reports with re-download

## 6. Dashboards

- **Admin** `/dashboard`: datasets count, suspicious cases, best model metrics, recent reports, charts
- **Utility Staff** `/staff`: assigned reports, "Report suspicious activity" form, "Submit field inspection" form, recent activity history

## 7. Cleanup

- Remove gradient classes throughout (carrying over from previous request)
- Remove role options other than Admin / Utility Staff from register page
- Ensure sidebar items are filtered by role

## Technical notes

- Libraries to add: `xlsx` (SheetJS), `jspdf`, `jspdf-autotable`
- All sensitive operations go through RLS + role checks; client never trusts localStorage for role
- ElectraBot widget stays

## Scope confirmation

This is roughly 15–20 new/modified files. Reply **"go"** to proceed, or tell me what to cut/change.