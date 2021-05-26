module.exports = addSemiToEachImageData = (imageArray) => {
  let convertedImageData = [];
  // console.log(imageArray.length);
  if (typeof imageArray == "string") {
    console.log("here single data passed!");
    convertedImageData = `'${imageArray}'`;
    return convertedImageData;
  } else {
    for (let i = 0; i < imageArray.length; i++) {
      convertedImageData.push(`${imageArray[i]}`);
    }
    return convertedImageData;
  }
};
