# Implementation Plan: Security Hardening & Branding Removal

## 1. Security: Block Admin Account Creation
- Modify `src/server/routes.ts` in the `/auth/register` endpoint to explicitly reject any registration request where `role` is not 'patient' or 'doctor'.

## 2. UI: Remove Supabase Branding
- Modify `src/components/common/Header.tsx`:
  - Remove `Database` icon import.
  - Remove `Database` icon component usage.
  - Remove `SupabaseStatusModal` component usage.
- Modify/Delete `src/components/common/SupabaseStatusModal.tsx`:
  - Remove the modal component entirely.
- Update any other component found to be using these branding elements during the search.

## 3. Verification
- Run `lint_applet` and `compile_applet` to ensure no broken imports after removing components.
- Verify registration endpoint security via curl.
