document.addEventListener("DOMContentLoaded", function() {
  var hamburger = document.querySelector(".hamburger");
  var navItems = document.querySelector(".nav-items");
  var dropdownBtns = document.querySelectorAll(".dropdown-btn");

  if (hamburger && navItems) {
    hamburger.addEventListener("click", function() {
      var isOpen = navItems.classList.contains("open");
      if (isOpen) {
        navItems.classList.remove("open");
      } else {
        navItems.classList.add("open");
      }
    });

    document.addEventListener("click", function(event) {
      if (!navItems.contains(event.target) && !hamburger.contains(event.target)) {
        navItems.classList.remove("open");
      }
    });
  }

  dropdownBtns.forEach(function(btn) {
    btn.addEventListener("click", function(event) {
      event.preventDefault();
      event.stopPropagation();
      var panel = this.parentElement.querySelector(".dropdown-panel");
      if (!panel) return;
      
      var isVisible = panel.style.display === "block";
      var allPanels = document.querySelectorAll(".dropdown-panel");
      allPanels.forEach(function(p) {
        p.style.display = "none";
      });
      
      if (!isVisible) {
        panel.style.display = "block";
      }
    });
  });

  document.addEventListener("click", function() {
    var allPanels = document.querySelectorAll(".dropdown-panel");
    allPanels.forEach(function(p) {
      p.style.display = "none";
    });
  });
});

