document.addEventListener("DOMContentLoaded", function () {
  var menuToggle = document.querySelector(".menu-toggle");
  var navLinks = document.querySelector(".nav-links");
  var dropdownToggles = document.querySelectorAll(".nav-dropdown-toggle");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", function () {
      var isOpen = navLinks.classList.contains("open");
      if (isOpen) {
        navLinks.classList.remove("open");
      } else {
        navLinks.classList.add("open");
      }
    });

    document.addEventListener("click", function (event) {
      if (!navLinks.contains(event.target) && !menuToggle.contains(event.target)) {
        navLinks.classList.remove("open");
      }
    });
  }

  dropdownToggles.forEach(function (toggle) {
    toggle.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      var menu = this.parentElement.querySelector(".nav-dropdown-menu");
      if (!menu) {
        return;
      }
      var isVisible = menu.style.display === "block";
      var allMenus = document.querySelectorAll(".nav-dropdown-menu");
      allMenus.forEach(function (m) {
        m.style.display = "none";
      });
      if (!isVisible) {
        menu.style.display = "block";
      }
    });
  });

  document.addEventListener("click", function () {
    var allMenus = document.querySelectorAll(".nav-dropdown-menu");
    allMenus.forEach(function (m) {
      m.style.display = "none";
    });
  });
});

// 導覽列與下拉選單的簡單控制，刻意寫得直覺一點

document.addEventListener("DOMContentLoaded", function () {
  var menuToggle = document.querySelector(".menu-toggle");
  var navLinks = document.querySelector(".nav-links");
  var subToggle = document.querySelector(".nav-sub-toggle");
  var submenu = document.querySelector(".nav-submenu");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", function (event) {
      event.stopPropagation();
      var isOpen = navLinks.style.display === "flex";
      navLinks.style.display = isOpen ? "none" : "flex";
      menuToggle.setAttribute("aria-expanded", String(!isOpen));
      if (submenu) {
        submenu.style.display = "none";
        if (subToggle) {
          subToggle.setAttribute("aria-expanded", "false");
        }
      }
    });
  }

  if (subToggle && submenu) {
    subToggle.addEventListener("click", function (event) {
      event.stopPropagation();
      var isOpen = submenu.style.display === "block";
      submenu.style.display = isOpen ? "none" : "block";
      subToggle.setAttribute("aria-expanded", String(!isOpen));
    });
  }

  document.addEventListener("click", function () {
    if (submenu && subToggle) {
      submenu.style.display = "none";
      subToggle.setAttribute("aria-expanded", "false");
    }
    if (navLinks && window.innerWidth <= 768) {
      navLinks.style.display = "none";
      if (menuToggle) {
        menuToggle.setAttribute("aria-expanded", "false");
      }
    }
  });

  if (navLinks) {
    navLinks.addEventListener("click", function (event) {
      event.stopPropagation();
    });
  }
});




