window.onclick = function (event) {
  if (!event.target.matches(".dropdown_link")) {
    const dropdowns = document.getElementsByClassName("dropdown_content");
    for (let i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains("show")) {
        openDropdown.classList.remove("show");
      }
    }
  }
};

const hambergerDropDown = document.querySelector(".dropdown_link");
hambergerDropDown.addEventListener("click", (event) => {
  showDropDown();
});

function showDropDown() {
  document.getElementById("dropdown_menu_loggedOut").classList.toggle("show");
}
