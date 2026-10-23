export function focusProjectForm() {
  window.dispatchEvent(new Event("pagiverse:focus-form"));
  window.setTimeout(() => document.getElementById("inquiry-name")?.focus({ preventScroll: true }), 0);
}
