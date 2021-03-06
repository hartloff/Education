function after_load() {
	//prepare_all_deeper_dives();
	//prepare_all_references();
	prepare_all_collapsed_content(document);

	//var objDiv = document.getElementById("right-bar");
	//objDiv.scrollTop = objDiv.scrollHeight;

	highlight_code();

	setTimeout(function() {
		var leveled_up_elements = document.getElementsByClassName("leveled_up");
		for (var i = 0; i < leveled_up_elements.length; i++) {
			leveled_up_elements[i].style.background = "white";
		}
	},1000);

}

	function highlight_code() {
		hljs.initHighlighting.called = false;
		hljs.initHighlighting();
		$('span code').each(function (i, block) {
			hljs.highlightBlock(block);
		});
	}

	function prepare_all_collapsed_content(element) {
		var content_classes = ['deeper-dive', 'reference'];
		for (var j in content_classes) {
			var content_elements = element.getElementsByClassName(content_classes[j]);
			for (var i = 0; i < content_elements.length; i++) {
				prepare_collapsed_content(content_elements[i], content_classes[j]);
			}
		}
	}


	function prepare_collapsed_content(content_element, content_class) {
		content_element.setAttribute('data-activated', 'false');
		content_element.innerHTML = content_link(content_element, content_class);
	}

	function content_link(content_element, content_class, link_text) {
		var concept = content_element.getAttribute('data-concept');
		var topic = content_element.getAttribute('data-topic');

		// not pretty
		var link = "";
		link += "<span class=\"" + content_class + "-link\" ";
		link += "onclick=\"toggle_content(this.parentElement, '" + concept + "', '" + topic + "', '" + content_class + "')\">";

		if (link_text) {
			link += link_text;
		} else {
			// Capitalization: https://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
			link += topic.replace(/-/g, " ").replace(/\w\S*/g, function (txt) {
				return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
			});
		}

		link += "<sup><span class=\"glyphicon glyphicon-";
		link += content_element.getAttribute('data-activated') !== 'true' ? "plus-sign" : "minus-sign";
		link += "\" aria-hidden=\"true\"></span></sup>";
		link += "</span>";

		return link;
	}


	function toggle_content(element, concept, topic, content_class) {
		if (element.getAttribute('data-activated') === 'true') {
			element.setAttribute('data-activated', 'false');
			element.innerHTML = content_link(element, content_class);
		} else {
			var xhttp = new XMLHttpRequest();
			xhttp.onreadystatechange = function () {
				if (this.readyState == 4 && this.status == 200) {
					var response = JSON.parse(this.responseText);
					element.setAttribute('data-activated', 'true');
					element.innerHTML =
						content_link(element, content_class) +
						'<div class="well lecture-section-well ' + content_class + '-well">' +
						'<h4>' + response.title + '</h4>' +
						response.content + '</div>';
					prepare_all_collapsed_content(element);
					highlight_code();
				}
			};
			xhttp.open("GET", "/courses/" + course + "/" + content_class + "/" + concept + "/" + topic, true);
			xhttp.send();
		}
	}


	function loadVideo(element, youTube) {
		element.innerHTML = "<iframe class=\"embed-responsive-item\" src=\"https://www.youtube.com/embed/" + youTube + "?autoplay=1\" allowfullscreen></iframe>";
	}