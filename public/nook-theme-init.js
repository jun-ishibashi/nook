/* localStorage キーは src/lib/theme-storage.ts の NOOK_THEME_STORAGE_KEY と一致させる */
(function () {
  try {
    var k = "nook-theme";
    var t = localStorage.getItem(k);
    if (t !== "light" && t !== "dark") t = "dark";
    document.documentElement.setAttribute("data-theme", t);
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "dark");
  }
})();
