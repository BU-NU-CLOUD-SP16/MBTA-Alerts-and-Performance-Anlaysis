/*
$(document).ready(function() {

	$(':checkbox').change(function() {
		if (this.checked) {
			var x = "";
			for (mark in markerList) {
				if (mark.direction === this.id) {
					mark.setVisible(true);
				}
				x += mark.title;
			}
			alert(x);
		} else {
			for (mark in markerList) {
				if (mark.direction === this.id) {
					mark.setVisible(false);
				}
			}
		}
	});
    $.ajax({
        url: "http://rest-service.guides.spring.io/greeting"
    }).then(function(data) {
       $('.greeting-id').append(data.id);
       $('.greeting-content').append(data.content);
    });
});
*/