(function () {
  "use strict";

  // Sticky header shadow state
  var header = document.getElementById("siteHeader");
  function updateHeaderState() {
    if (window.scrollY > 8) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }
  updateHeaderState();
  window.addEventListener("scroll", updateHeaderState, { passive: true });

  // Mobile nav toggle
  var navToggle = document.getElementById("navToggle");
  var mainNav = document.getElementById("mainNav");
  navToggle.addEventListener("click", function () {
    var isOpen = mainNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
  mainNav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      mainNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  // FAQ accordion
  document.querySelectorAll(".accordion-trigger").forEach(function (trigger) {
    var panel = trigger.nextElementSibling;
    trigger.addEventListener("click", function () {
      var isOpen = trigger.getAttribute("aria-expanded") === "true";

      document.querySelectorAll(".accordion-trigger").forEach(function (other) {
        if (other !== trigger) {
          other.setAttribute("aria-expanded", "false");
          other.nextElementSibling.style.maxHeight = null;
        }
      });

      trigger.setAttribute("aria-expanded", isOpen ? "false" : "true");
      panel.style.maxHeight = isOpen ? null : panel.scrollHeight + "px";
    });
  });

  // Calendly popup: open the scheduler in a modal from any "Book a call"
  // button, falling back to the normal #book-a-call anchor scroll if the
  // Calendly script hasn't loaded yet
  var calendlyUrl = "https://calendly.com/beech-agency/chat-with-chelsea?hide_gdpr_banner=1&primary_color=406dff";
  document.querySelectorAll(".calendly-popup-trigger").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      if (window.Calendly) {
        e.preventDefault();
        window.Calendly.initPopupWidget({ url: calendlyUrl });
      }
    });
  });

  // Calendly: resize the widget to its actual content height so the
  // page scrolls as one continuous flow instead of an inner iframe scroll
  window.addEventListener("message", function (e) {
    if (e.data && e.data.event === "calendly.page_height") {
      var widget = document.querySelector(".calendly-inline-widget");
      if (widget) {
        widget.style.height = e.data.payload.height + "px";
      }
    }
  });

  // "What you get" sticky steps: highlight whichever step's runway is
  // crossing the centre of the viewport, and nudge the scorecard's wedge
  // emphasis to match
  var getRunways = document.querySelectorAll(".get-step-runway");
  var radarCard = document.querySelector(".radar-card");
  if (getRunways.length && "IntersectionObserver" in window) {
    var runwayObserver = new IntersectionObserver(
      function (entries) {
        // A fast/large scroll can report several runways as intersecting
        // in the same batch; pick whichever is nearest the viewport centre
        var bestEntry = null;
        var bestDistance = Infinity;
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var entryCenter = entry.boundingClientRect.top + entry.boundingClientRect.height / 2;
            var rootCenter = entry.rootBounds
              ? (entry.rootBounds.top + entry.rootBounds.bottom) / 2
              : window.innerHeight / 2;
            var distance = Math.abs(entryCenter - rootCenter);
            if (distance < bestDistance) {
              bestDistance = distance;
              bestEntry = entry;
            }
          }
        });

        if (bestEntry) {
          var index = Array.prototype.indexOf.call(getRunways, bestEntry.target);
          getRunways.forEach(function (runway) {
            var step = runway.querySelector(".get-step");
            if (step) step.classList.remove("is-active");
          });
          var activeStep = bestEntry.target.querySelector(".get-step");
          if (activeStep) activeStep.classList.add("is-active");

          if (radarCard) {
            radarCard.classList.remove("emphasize-0", "emphasize-1", "emphasize-2", "emphasize-3");
            if (index >= 0 && index <= 3) {
              radarCard.classList.add("emphasize-" + index);
            }
          }
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    getRunways.forEach(function (runway) { runwayObserver.observe(runway); });
  }

  // Scroll reveal
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }
})();
