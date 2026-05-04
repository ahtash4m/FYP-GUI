# Acne Classification FYP — GUI Project Handoff

This document describes **everything that exists today** in the frontend and backend repositories: goals, tooling, folder layout, **all routes**, environment variables, the **mock-versus-real API strategy**, and **exact next steps** for integrating the final CNN and MySQL database. It is written so a **human programmer** or an **LLM** can onboard without prior chat context.

---

## 1. Project purpose (what this GUI is for)

This repository implements the **browser GUI** for a Final Year Project aligned with the university scope/SRS/SDD:

- **Working title:** Web application for **acne classification** and **OTC (over-the-counter) suggestion** from **facial images**.
- **Patient experience:** sign in → upload JPEG/PNG → see a “processing” state → view **classification + confidence + OTC routine** + disclaimers → browse **scan history**.
- **Admin experience:** overview metrics + chart + activity table → **user management** table → **treatment rules** CRUD (maps AI labels to OTC text) → **settings** (toggles, language, model version display, confidence threshold slider, backup button placeholder).
- **Explicit non-goals in the UI (per SRS):** no pharmacy checkout, no Rx-only drugs, no live video telemedicine. Copy should keep reinforcing **non-diagnostic / triage / educational** positioning.

---

## 2. What has been completed (explicit checklist)

The project has achieved a **60% "Vertical Slice" architecture**. The React frontend successfully communicates with a "hollow" Flask backend that stubs out the AI processing and database lookups with formatted JSON responses.

### 2.1 Frontend (`D:\FYP-GUI`)

| Area | Status | Notes |
|------|--------|--------|
| **Repository scaffold** | Done | Vite + React + TypeScript project at `D:\FYP-GUI`. |
| **Tailwind CSS v3** | Done | `tailwind.config.ts`, `postcss.config.js`, `src/index.css` with **CSS variables** for theming. |
| **Path alias `@/`** | Done | Resolves to `src/` via `vite.config.ts` and `tsconfig*.json`. |
| **shadcn/ui–compatible design system** | Done | `components.json` present; primitives live in `src/components/ui/*`. |
| **Radix UI primitives** | Done | Used under `components/ui`. |
| **Routing** | Done | `src/router.tsx` defines all routes; nested layouts for `/app` and `/admin`. |
| **Auth state (client-only)** | Done | `AuthProvider` + `useAuth()`; persists mock user JSON in **`localStorage`** key `acne_classification_auth_user_v1`. |
| **Route guards** | Done | `ProtectedRoute` (any logged-in user) and `AdminRoute` (role `admin` only). |
| **TanStack Query** | Done | `QueryProvider` wraps the app; list/overview pages use `useQuery`; mutations for scan upload, admin saves, deletes. |
| **HTTP client stub** | Done | `src/lib/api/client.ts` centralizes `fetch` for JSON and multipart. |
| **Real API integration** | Done | `import.meta.env.VITE_USE_MOCK_API` set to `false`. Frontend successfully posts to the Flask backend. |
| **Patient pages** | Done | Dashboard upload, processing animation (with live image preview + CSS filtering), results with Base64 image rendering, scans list, profile (read-only), help (static). |
| **Admin pages** | Done | Overview, users, treatments (dialog CRUD in mock mode), settings form. |
| **File upload UX** | Done | `react-dropzone` on patient dashboard; MIME filter JPEG/PNG. |

### 2.2 Backend (`D:\FYP-Backend`)

| Area | Status | Notes |
|------|--------|--------|
| **Environment Setup** | Done | Python `venv` created; Flask and Flask-CORS installed. |
| **Flask Server** | Done | `app.py` created and running on port 5000. |
| **Auth Routes** | Done | `/api/auth/login` and `/api/auth/register` endpoints stubbed out to accept POST requests and return mock `AuthUser` JSON. |
| **Scan Upload & Processing** | Done | `POST /api/scans` stubbed. Accepts multipart form data, simulates a 3-second delay, encodes the uploaded image to Base64, and returns a mock `ScanResult` JSON. |
| **Scan History** | Done | `GET /api/scans` stubbed to return a hardcoded list of `ScanListItem` JSON to populate the frontend history table. |

**Not completed (by design — next phase):**

- No real **JWT/cookie session** contract, or **MySQL** connectivity.
- No **trained CNN**; inference is mocked.
- **Pagination** on admin tables is UI-placeholder only.
- **“View user”** on admin users is a disabled button placeholder.
- **Profile “Save changes”** is disabled.
- **Client-side image compression** before upload (currently sends raw, full-size file).

---

## 3. Prerequisites (what to install on the machine)

### 3.1 Frontend (`D:\FYP-GUI`)
*   **Node.js:** 20.x LTS
*   **npm:** 10+
*   **Code editor:** VS Code / Cursor / WebStorm

### 3.2 Backend (`D:\FYP-Backend`)
*   **Python:** 3.10+
*   **Libraries:** Flask, Flask-CORS

---

## 4. How to run the application

**Terminal 1 (Frontend):**
```powershell
cd D:\FYP-GUI
npm run dev
```

**Terminal 2 (Backend):**
```powershell
cd D:\FYP-Backend
.\venv\Scripts\activate
python app.py
```

Then open the URL Vite prints (default **`http://localhost:5173`**).

---

## 5. Environment variables

Defined in **`.env`** (Frontend):

```env
VITE_USE_MOCK_API=false
VITE_API_PROXY_TARGET=http://127.0.0.1:5000
```

---

## 6. Intended backend contracts (Implemented as Flask Stubs)

### 6.1 Auth

| Method | Path | Request body (JSON) | Expected JSON |
|--------|------|---------------------|---------------------------|
| `POST` | `/api/auth/login` | `{ email, password }` | `AuthUser` |
| `POST` | `/api/auth/register` | `{ email, password, display_name }` | `AuthUser` |

### 6.2 Scans

| Method | Path | Body | Expected JSON | Notes |
|--------|------|------|----------|---|
| `POST` | `/api/scans` | `multipart/form-data` field **`image`** | `ScanResult` | Backend converts image to Base64 and returns it in `imageUrl`. Ensure frontend key names (`predictedLabel`, `confidencePercent`, `otcSteps`) match exactly. |
| `GET` | `/api/scans` | — | `ScanListItem[]` | |

---

## 7. UI / design system notes

### 7.1 Image Processing UX
**File:** `src/pages/patient-processing-page.tsx`
*   Uses `URL.createObjectURL` to generate a synchronous, client-side preview of the uploaded file while the async Flask POST request processes.
*   Applies Tailwind utility classes (`grayscale`, `blur-[2px]`, `opacity-70`) and an `animate-pulse` teal overlay to simulate an "AI scanning" effect.
*   React Strict Mode behavior required placing the URL creation and revocation inside a `useEffect` to prevent broken image links during development.

---

## 8. How a programmer should take this to the next phase (recommended order)

1. **Implement Client-Side Compression:** Add a library like `browser-image-compression` to resize images (e.g., 512x512) before uploading to save bandwidth.
2. **Database Integration:** Connect the existing user authentication in the Flask backend to a MySQL database using SQLAlchemy.
3. **Session Management:** Replace `localStorage` auth with real session handling (cookies or JWT).
4. **AI Integration:** Swap the Flask stub functions in `app.py` with the trained PyTorch/TensorFlow CNN inference.
5. **Pagination:** Replace disabled buttons with query params (`?page=` / `?cursor=`) + TanStack Table if needed.

---

## 9. Document change log

| Date | Author | Change |
|------|--------|--------|
| *(initial)* | Project setup | Created repository structure, routes, mocks, and this handoff document. |
| **[2026-05-04]** | **Hamdan Jamil** | **Updated for 60% Evaluation: Documented the creation of the Flask backend stub (`app.py`), the transition from mock APIs to real HTTP requests (`VITE_USE_MOCK_API=false`), the implementation of Base64 image return, and the UI updates for the processing screen preview.** |

---

**End of document.**
