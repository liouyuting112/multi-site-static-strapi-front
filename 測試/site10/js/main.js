document.addEventListener("DOMContentLoaded", function() {
  var mobileToggle = document.querySelector(".mobile-toggle");
  var mainNav = document.querySelector(".main-nav");
  var ddTriggers = document.querySelectorAll(".dd-trigger");

  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener("click", function() {
      var isOpen = mainNav.classList.contains("open");
      if (isOpen) {
        mainNav.classList.remove("open");
      } else {
        mainNav.classList.add("open");
      }
    });

    document.addEventListener("click", function(event) {
      if (!mainNav.contains(event.target) && !mobileToggle.contains(event.target)) {
        mainNav.classList.remove("open");
      }
    });
  }

  ddTriggers.forEach(function(trigger) {
    trigger.addEventListener("click", function(event) {
      event.preventDefault();
      event.stopPropagation();
      var menu = this.parentElement.querySelector(".dd-menu");
      if (!menu) return;
      
      var isVisible = menu.style.display === "block";
      var allMenus = document.querySelectorAll(".dd-menu");
      allMenus.forEach(function(m) {
        m.style.display = "none";
      });
      
      if (!isVisible) {
        menu.style.display = "block";
      }
    });
  });

  document.addEventListener("click", function() {
    var allMenus = document.querySelectorAll(".dd-menu");
    allMenus.forEach(function(m) {
      m.style.display = "none";
    });
  });
});

