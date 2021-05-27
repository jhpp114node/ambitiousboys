// DOM Elements
const onUserDeleteSubmitBtn = document.querySelector(".post_hotel");

// add event listener
onUserDeleteSubmitBtn.addEventListener("click", (event) => {
  event.preventDefault();
  let userDeleteConfirm = prompt(
    "All of your hotels will get delete as well. Type the word 'delete' to confirm"
  );
  const deleteForm = document.querySelector("#user_delete_form");
  if (userDeleteConfirm != null) {
    if (userDeleteConfirm === "delete") {
      deleteForm.submit();
    } else {
      userDeleteConfirm = prompt(
        "2/2, All of your hotels will get delete as well. Type the word 'delete' to confirm"
      );
    }
  }
});
