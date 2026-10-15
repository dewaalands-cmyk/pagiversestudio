const menu = document.querySelector("#mobile-menu");
const toggle = document.querySelector("#menu-toggle");
function closeMenu() {
  menu.hidden = true;
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", "Buka menu");
}
toggle.addEventListener("click", () => {
  const open = menu.hidden;
  menu.hidden = !open;
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
});
menu.addEventListener("click", (e) => {
  if (e.target.closest("a,button")) closeMenu();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !menu.hidden) {
    closeMenu();
    toggle.focus();
  }
});
document.querySelectorAll("[data-open-search]").forEach((b) =>
  b.addEventListener("click", () => {
    document
      .querySelector("#katalog")
      .scrollIntoView({
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
    setTimeout(
      () =>
        document
          .querySelector("#catalog-search")
          .focus({ preventScroll: true }),
      300,
    );
  }),
);
const breakpoint = matchMedia("(min-width:768px)");
breakpoint.addEventListener("change", (e) => {
  if (e.matches) closeMenu();
});
