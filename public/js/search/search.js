// Image handler
console.log("image handler connected");
// grab all left arrow and right arrow (the length are equal)
const leftArrow = document.querySelectorAll(".leftArrow");
const rightArrow = document.querySelectorAll(".rightArrow");
// set up a counter that has max-lengh of left arrow
// reset all eachCounter to zero
const eachImageCounter = new Array(leftArrow.length).fill(0);

// add an event listener to all left and right arrows
// apply image left and right image handlers to each arrow
leftArrow.forEach((left, index) => {
  left.addEventListener("click", (event) => {
    leftArrowImageHandler(event.target, index);
  });
});

rightArrow.forEach((right, index) => {
  right.addEventListener("click", (event) => {
    rightArrowImageHandler(event.target, index);
  });
});

function leftArrowImageHandler(event, index) {
  if (eachImageCounter[index] <= 0) {
    eachImageCounter[index] = 4;
  } else {
    eachImageCounter[index]--;
  }
  // flag for finding image tag (previous sibling or next sibiling)
  // for false it is previous
  const flag = true;
  imageSlider(event, index, flag);
}

function rightArrowImageHandler(event, index) {
  if (eachImageCounter[index] >= 4) {
    eachImageCounter[index] = 0;
  } else {
    eachImageCounter[index]++;
  }
  // flag for finding image tag (previous sibling or next sibiling)
  // for false it is previous
  const flag = false;
  imageSlider(event, index, flag);
}

function imageSlider(event, index, flag) {
  const imageContainer = event.parentNode;
  const hotelId = imageContainer.getAttribute("image-id");
  const imageSource = `https://photo.hotellook.com/image_v2/limit/h${hotelId}_${eachImageCounter[index]}/280/180.jpg`;
  if (flag) {
    const imageDOM = event.nextElementSibling;
    imageDOM.src = imageSource;
  } else {
    const imageDOM = event.previousElementSibling;
    imageDOM.src = imageSource;
  }
}
