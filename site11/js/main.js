(function () {
  function setupMenuToggle() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".nav-links");
    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function (event) {
      event.stopPropagation();
      var isOpen = nav.classList.contains("open");
      if (isOpen) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      } else {
        nav.classList.add("open");
        toggle.setAttribute("aria-expanded", "true");
      }
    });

    document.addEventListener("click", function (event) {
      var navOpen = nav.classList.contains("open");
      if (!navOpen) {
        return;
      }
      var clickInsideNav = nav.contains(event.target);
      var clickOnToggle = toggle.contains(event.target);
      if (!clickInsideNav && !clickOnToggle) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  function setupSubmenu() {
    var submenuToggle = document.querySelector(".submenu-toggle");
    var submenu = document.querySelector(".submenu");
    if (!submenuToggle || !submenu) {
      return;
    }

    submenuToggle.addEventListener("click", function (event) {
      event.stopPropagation();
      var isShown = submenu.style.display === "block";
      if (isShown) {
        submenu.style.display = "none";
        submenuToggle.setAttribute("aria-expanded", "false");
      } else {
        submenu.style.display = "block";
        submenuToggle.setAttribute("aria-expanded", "true");
      }
    });

    document.addEventListener("click", function (event) {
      var clickInside = submenu.contains(event.target) || submenuToggle.contains(event.target);
      if (!clickInside) {
        if (submenu.style.display === "block") {
          submenu.style.display = "none";
          submenuToggle.setAttribute("aria-expanded", "false");
        }
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenuToggle();
    setupSubmenu();
  });
})();









