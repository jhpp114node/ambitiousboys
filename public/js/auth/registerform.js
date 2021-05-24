console.log("register js connected");
const checkPasswordMatching = () => {
  if (
    document.getElementById("password").value ===
    document.getElementById("confirmPassword").value
  ) {
    document.getElementById("confirm_password_message").style.color = "green";
    document.getElementById("confirm_password_message").textContent =
      "Password matching";
    document.getElementById("submit").disabled = false;
  } else {
    document.getElementById("confirm_password_message").style.color = "red";
    document.getElementById("confirm_password_message").textContent =
      "Password not matching";
    document.getElementById("submit").disabled = true;
  }
};
