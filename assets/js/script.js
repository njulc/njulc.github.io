'use strict';



// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }



// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
if (sidebar && sidebarBtn) {
  sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });
}



// testimonials (optional — removed from template when unused)
const testimonialsItem = document.querySelectorAll("[data-testimonials-item]");
const modalContainer = document.querySelector("[data-modal-container]");
const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
const overlay = document.querySelector("[data-overlay]");
const modalImg = document.querySelector("[data-modal-img]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalText = document.querySelector("[data-modal-text]");

if (
  testimonialsItem.length > 0 &&
  modalContainer &&
  modalCloseBtn &&
  overlay &&
  modalImg &&
  modalTitle &&
  modalText
) {
  const testimonialsModalFunc = function () {
    modalContainer.classList.toggle("active");
    overlay.classList.toggle("active");
  };

  for (let i = 0; i < testimonialsItem.length; i++) {
    testimonialsItem[i].addEventListener("click", function () {

      modalImg.src = this.querySelector("[data-testimonials-avatar]").src;
      modalImg.alt = this.querySelector("[data-testimonials-avatar]").alt;
      modalTitle.innerHTML = this.querySelector("[data-testimonials-title]").innerHTML;
      modalText.innerHTML = this.querySelector("[data-testimonials-text]").innerHTML;

      testimonialsModalFunc();

    });
  }

  modalCloseBtn.addEventListener("click", testimonialsModalFunc);
  overlay.addEventListener("click", testimonialsModalFunc);
}



// portfolio filter (optional — Portfolio page removed in academic layout)
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-selecct-value]");
const filterBtn = document.querySelectorAll("[data-filter-btn]");
const filterItems = document.querySelectorAll("[data-filter-item]");

const filterFunc = function (selectedValue) {

  for (let i = 0; i < filterItems.length; i++) {

    if (selectedValue === "all") {
      filterItems[i].classList.add("active");
    } else if (selectedValue === filterItems[i].dataset.category) {
      filterItems[i].classList.add("active");
    } else {
      filterItems[i].classList.remove("active");
    }

  }

};

if (select && selectValue) {
  select.addEventListener("click", function () { elementToggleFunc(this); });

  for (let i = 0; i < selectItems.length; i++) {
    selectItems[i].addEventListener("click", function () {

      const selectedValue = this.innerText.toLowerCase();
      selectValue.innerText = this.innerText;
      elementToggleFunc(select);
      filterFunc(selectedValue);

    });
  }
}

let lastClickedBtn = filterBtn[0];

if (filterBtn.length > 0) {
  lastClickedBtn = filterBtn[0];

  for (let i = 0; i < filterBtn.length; i++) {

    filterBtn[i].addEventListener("click", function () {

      const selectedValue = this.innerText.toLowerCase();
      if (selectValue) { selectValue.innerText = this.innerText; }
      filterFunc(selectedValue);

      lastClickedBtn.classList.remove("active");
      this.classList.add("active");
      lastClickedBtn = this;

    });

  }
}



// contact form variables
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");

if (form && formBtn) {

  for (let i = 0; i < formInputs.length; i++) {
    formInputs[i].addEventListener("input", function () {

      // check form validation
      if (form.checkValidity()) {
        formBtn.removeAttribute("disabled");
      } else {
        formBtn.setAttribute("disabled", "");
      }

    });
  }

}



// Single-page stacked nav: anchor scroll + active state + scroll sync
const stackedRoot = document.querySelector(".main-content--stacked");
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const sectionElements = stackedRoot
  ? stackedRoot.querySelectorAll("article.content-section[id]")
  : [];

const setActiveNavLink = function (sectionId) {
  for (let i = 0; i < navigationLinks.length; i++) {
    const link = navigationLinks[i];
    const href = link.getAttribute("href");
    const id = href && href.startsWith("#") ? href.slice(1) : "";
    if (id === sectionId) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  }
};

const sectionTopDocument = function (el) {
  const rect = el.getBoundingClientRect();
  return rect.top + window.scrollY;
};

const updateNavFromScroll = function () {
  if (sectionElements.length === 0) {
    return;
  }
  const offset = window.scrollY + Math.min(120, window.innerHeight * 0.18);
  let currentId = sectionElements[0].id;
  for (let i = 0; i < sectionElements.length; i++) {
    const section = sectionElements[i];
    if (sectionTopDocument(section) <= offset) {
      currentId = section.id;
    }
  }
  setActiveNavLink(currentId);
};

if (stackedRoot && navigationLinks.length > 0 && sectionElements.length > 0) {

  for (let i = 0; i < navigationLinks.length; i++) {
    navigationLinks[i].addEventListener("click", function (event) {
      const href = this.getAttribute("href");
      if (!href || !href.startsWith("#")) {
        return;
      }
      const targetId = href.slice(1);
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        event.preventDefault();
        const smoothScroll = window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth";
        targetEl.scrollIntoView({ behavior: smoothScroll, block: "start" });
        setActiveNavLink(targetId);
        history.replaceState(null, "", href);
      }
    });
  }

  let scrollTick = false;
  window.addEventListener("scroll", function () {
    if (!scrollTick) {
      window.requestAnimationFrame(function () {
        updateNavFromScroll();
        scrollTick = false;
      });
      scrollTick = true;
    }
  }, { passive: true });

  window.addEventListener("load", function () {
    const hash = window.location.hash.replace(/^#/, "");
    if (hash && document.getElementById(hash)) {
      setActiveNavLink(hash);
    } else {
      updateNavFromScroll();
    }
  });

  updateNavFromScroll();
}
