const status_messageDOM = document.querySelector(".status_message");

if (status_messageDOM) {
  console.log("status DOM exist");
  setTimeout(() => {
    status_messageDOM.remove();
  }, 3000);
}
