
function AJAXCall(messageSource) {
    var xmlhttp = new XMLHttpRequest();
    // var message = document.getElementById(messageSource).value;
    message = encodeURIComponent(message);
    var params = "request=addQuestion&message=" + message;

    document.getElementById(messageSource).value = "";

    xmlhttp.open("POST", "/cgi-bin/questionController.py", true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send(params);

    getResults()
}

function loadVideo(element, youTube) {
    element.innerHTML = "<iframe class=\"embed-responsive-item\" src=\"https://www.youtube.com/embed/" + youTube + "?autoplay=1\" allowfullscreen></iframe>";
}