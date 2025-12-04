document.addEventListener("DOMContentLoaded", function() {
  var burger = document.querySelector(".burger-btn");
  var navList = document.querySelector(".nav-list");
  var dropdownBtns = document.querySelectorAll(".dropdown-btn");

  if (burger && navList) {
    burger.addEventListener("click", function() {
      var isOpen = navList.classList.contains("open");
      if (isOpen) {
        navList.classList.remove("open");
      } else {
        navList.classList.add("open");
      }
    });

    document.addEventListener("click", function(event) {
      if (!navList.contains(event.target) && !burger.contains(event.target)) {
        navList.classList.remove("open");
      }
    });
  }

  dropdownBtns.forEach(function(btn) {
    btn.addEventListener("click", function(event) {
      event.preventDefault();
      event.stopPropagation();
      var menu = this.parentElement.querySelector(".dropdown-menu");
      if (!menu) return;
      
      var isVisible = menu.style.display === "block";
      var allMenus = document.querySelectorAll(".dropdown-menu");
      allMenus.forEach(function(m) {
        m.style.display = "none";
      });
      
      if (!isVisible) {
        menu.style.display = "block";
      }
    });
  });

  document.addEventListener("click", function() {
    var allMenus = document.querySelectorAll(".dropdown-menu");
    allMenus.forEach(function(m) {
      m.style.display = "none";
    });
  });
});

