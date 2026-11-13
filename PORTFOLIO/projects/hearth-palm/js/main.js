(function () {
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.querySelector(".site-nav");
  var reservationForm = document.querySelector("#reservation-form");
  var formMessage = document.querySelector("#form-message");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      toggle.setAttribute("aria-label", isOpen ? "Close pages" : "Open pages");
    });
  }

  if (reservationForm && formMessage) {
    reservationForm.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!reservationForm.checkValidity()) {
        reservationForm.reportValidity();
        return;
      }

      formMessage.textContent =
        "Thank you. Your reservation request has been noted. We will confirm by phone or email.";
      formMessage.classList.add("is-visible");
      reservationForm.reset();
    });
  }
})();
