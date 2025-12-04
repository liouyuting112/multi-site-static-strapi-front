document.addEventListener("DOMContentLoaded", function() {
  var menuToggle = document.querySelector(".menu-toggle-btn");
  var navMenu = document.querySelector(".nav-menu");
  var dropdownTriggers = document.querySelectorAll(".dropdown-trigger");

  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", function() {
      var isOpen = navMenu.classList.contains("open");
      if (isOpen) {
        navMenu.classList.remove("open");
      } else {
        navMenu.classList.add("open");
      }
    });

    document.addEventListener("click", function(event) {
      if (!navMenu.contains(event.target) && !menuToggle.contains(event.target)) {
        navMenu.classList.remove("open");
      }
    });
  }

  dropdownTriggers.forEach(function(trigger) {
    trigger.addEventListener("click", function(event) {
      event.preventDefault();
      event.stopPropagation();
      var dropdown = this.parentElement.querySelector(".dropdown-content");
      if (!dropdown) return;
      
      var isVisible = dropdown.style.display === "block";
      var allDropdowns = document.querySelectorAll(".dropdown-content");
      allDropdowns.forEach(function(d) {
        d.style.display = "none";
      });
      
      if (!isVisible) {
        dropdown.style.display = "block";
      }
    });
  });

  document.addEventListener("click", function() {
    var allDropdowns = document.querySelectorAll(".dropdown-content");
    allDropdowns.forEach(function(d) {
      d.style.display = "none";
    });
  });
});

