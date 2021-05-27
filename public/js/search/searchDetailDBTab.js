const allTabButtons = document.querySelectorAll(
  ".hotelSearched_detail_tab_btn"
);
const allTabPanels = document.querySelectorAll(
  ".hotelSearched_detail_tab_panel"
);

invokeInitialTabSelect();
// add event listeners to all buttons
allTabButtons.forEach((eachBtn, index) => {
  eachBtn.addEventListener("click", (event) => {
    displayPanels(event, index);
  });
});

function invokeInitialTabSelect() {
  for (let i = 0; i < allTabButtons.length; i++) {
    // initial select or the first button
    if (i == 0) {
      allTabButtons[i].style.backgroundColor = "#589fe6";
      allTabButtons[i].style.color = "white";
      allTabPanels[i].style.display = "block";
    } else {
      allTabButtons[i].style.backgroundColor = "";
      allTabButtons[i].style.color = "";
      allTabPanels[i].style.display = "none";
    }
  }
}

// display panel
function displayPanels(event, index) {
  for (let i = 0; i < allTabButtons.length; i++) {
    allTabButtons[i].style.backgroundColor = "";
    allTabButtons[i].style.color = "";
  }
  // select based on the index
  if (index == 1) {
    covidController();
  } else if (index == 2) {
    videoController();
  }
  // change color for button to indicate its selected
  event.target.style.backgroundColor = "#589fe6";
  event.target.style.color = "white";
  // set all
  for (let i = 0; i < allTabPanels.length; i++) {
    if (index == i) {
      allTabPanels[index].style.display = "block";
    } else {
      allTabPanels[i].style.display = "none";
    }
  }
}

// covid data fetch
async function covidController() {
  const covidCountryNameDom = document.querySelector(
    ".hotelSearched_detail_covid_countryName"
  );
  const covidLastUpdate = document.querySelector(
    ".hotelSearched_detail_covid_lastupdate"
  );
  const covidCountryCodeAttribute =
    covidLastUpdate.getAttribute("data-country-code");
  const covidCityAttribute = covidLastUpdate.getAttribute("data-cityname");
  const covidHotelIdAttribute = covidLastUpdate.getAttribute("data-hotel-id");
  // console.log(covidCountryCodeAttribute);
  // fetch the data
  try {
    // fetch it from my backend that connected to covid
    const covidDataFetch = await fetch(
      `/search/${covidCityAttribute}/${covidHotelIdAttribute}/covid/${covidCountryCodeAttribute}`
    );
    const covidDataResponse = await covidDataFetch.json();
    // use the response data to populate in html with graph
    covidCountryNameDom.textContent = `In country ${covidDataResponse.data.name}`;
    covidLastUpdate.textContent = `Latest update date: ${covidDataResponse.data.updated_at}`;
    const dataTimelineArray = [];
    for (let i = 25; i >= 0; i--) {
      dataTimelineArray.push(covidDataResponse.data.timeline[i]);
    }
    const covidDataDate = [];
    // const covidDataDeathRate = [];
    // const covidDataNewDeath = [];
    const covidDataConfirmRate = [];
    for (let i = 0; i < dataTimelineArray.length; i++) {
      covidDataDate.push(dataTimelineArray[i].date);
      //covidDataDeathRate.push(dataTimelineArray[i].deaths);
      //covidDataRecoverRate.push(dataTimelineArray[i].new_deaths);
      covidDataConfirmRate.push(dataTimelineArray[i].new_confirmed);
    }
    // @https://www.chartjs.org/docs/latest/getting-started/
    let ctx = document.getElementById("myChart").getContext("2d");
    let chart = new Chart(ctx, {
      // The type of chart we want to create
      type: "line",

      // The data for our dataset
      data: {
        labels: covidDataDate,
        datasets: [
          {
            label: "Covid Confirmed",
            // backgroundColor: 'rgb(255, 99, 132)',
            borderColor: "#48494B",
            data: covidDataConfirmRate,
          },
        ],
      },
      // Configuration options go here
      options: {},
    });
  } catch (error) {
    console.error(error);
  }
}

// video data fetch
async function videoController() {
  // its all about mp4 so there are no buffer action required
  const videoFrame = document.querySelector(
    ".hotelSearched_detail_cityVideo_frame"
  );
  const videoButton = document.querySelector("#hotelSearched_detail_tab_video");
  const cityForVideo = videoButton.getAttribute("data-hotel-city-fullname");
  const targetHotelId = videoButton.getAttribute("data-hotel-id");
  try {
    // fetch video data
    const videoFetchData = await fetch(
      `/search/${cityForVideo}/${targetHotelId}/video/${cityForVideo}`
    );
    const videoResponseData = await videoFetchData.json();
    // mp4 url
    const singleVideo = videoResponseData.hits[0].videos.tiny.url;
    videoFrame.src = `${singleVideo}`;
    // modal items
    const video_modal_btn = document.querySelector(".video_show_more_btn");
    const video_modal_panel = document.querySelector(".video_modal");
    const video_modal_close_btn = document.querySelector(
      ".close_video_modal_btn"
    );
    const video_tag_in_modal = document.querySelector(".modal_video");

    // add event listener to play the video on mouseover
    videoFrame.addEventListener("mouseover", (event) => {
      videoFrame.play();
    });
    // add event listener to pause the video on mouseout
    videoFrame.addEventListener("mouseout", (event) => {
      videoFrame.pause();
    });

    // for video modal
    video_modal_btn.addEventListener("click", (event) => {
      video_modal_panel.style.display = "block";
      const modal_video_navigation = document.querySelector(
        ".modal_video_navigation"
      );
      // if the response data is bigger or equla than 5
      if (videoResponseData.total >= 5) {
        while (modal_video_navigation.firstChild) {
          // remove all video before render the video
          modal_video_navigation.removeChild(modal_video_navigation.firstChild);
        }
        // place total 5 videos for rendering speed purpose
        for (let i = 0; i < 5; i++) {
          let imageDOM = document.createElement("video");
          imageDOM.src = videoResponseData.hits[i].videos.tiny.url;
          imageDOM.style.width = "180px";
          imageDOM.style.height = `120px`;
          modal_video_navigation.appendChild(imageDOM);
        }
        // default selection in modal
        video_tag_in_modal.src = videoResponseData.hits[0].videos.tiny.url;
        for (let i = 0; i < modal_video_navigation.childNodes.length; i++) {
          modal_video_navigation.childNodes[i].addEventListener(
            "click",
            (event) => {
              video_tag_in_modal.src =
                videoResponseData.hits[i].videos.tiny.url;
            }
          );
        }
      } else {
        while (modal_video_navigation.firstChild) {
          // remove all video before render the video
          modal_video_navigation.removeChild(modal_video_navigation.firstChild);
        }
        // place total 5 videos for rendering speed purpose
        for (let i = 0; i < videoResponseData.total; i++) {
          let imageDOM = document.createElement("video");
          imageDOM.src = videoResponseData.hits[i].videos.tiny.url;
          imageDOM.style.width = "180px";
          imageDOM.style.height = `120px`;
          modal_video_navigation.appendChild(imageDOM);
        }
        // default selection in modal
        video_tag_in_modal.src = videoResponseData.hits[0].videos.tiny.url;
        for (let i = 0; i < modal_video_navigation.childNodes.length; i++) {
          modal_video_navigation.childNodes[i].addEventListener(
            "click",
            (event) => {
              video_tag_in_modal.src =
                videoResponseData.hits[i].videos.tiny.url;
            }
          );
        }
      }
    });
    // close modal button
    video_modal_close_btn.addEventListener("click", (event) => {
      if (video_modal_panel.style.display == "block") {
        video_modal_panel.style.display = "none";
      }
    });
  } catch (error) {
    console.error(error);
  }
}
