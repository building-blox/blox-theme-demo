import getUrlParam from "../../../assets/js/utils/get-url-param";

var space = getUrlParam("space");

let adminIframe = $("#adminIframe");
let message = $("#message");

if (space) {
  //let url = `http://localhost:4200`;
  let url = `https://studio.appyay.com`;
  let params = `?space=${space}`;
  var t = getUrlParam("t");
  var i = getUrlParam("i");
  if (t) {
    url += "/auth/login";
    params += `&t=${t}`;
  } else if (i) {
    url += "/auth/register";
    params += `&i=${i}`;
  }
  document.querySelector("body").classList.add("full-height");
  //Appyay will send a message when it's initializing
  window.addEventListener("message", function(e) {
    if (e.data.event === "appyayInit") message.hide();
  });
  adminIframe.attr("src", url + params);
} else {
  message.text("Appyay Space URL parameter not found");
}

console.log(adminIframe);
