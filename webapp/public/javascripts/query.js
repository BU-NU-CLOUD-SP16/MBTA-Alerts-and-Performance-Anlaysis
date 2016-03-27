$(document).ready(function() {

	$(':checkbox').change(function() {
		if (this.checked) {
			
		}
	});
	
	$(function() {
		$( "#slider" ).slider();
	});
    $.ajax({
        url: "http://rest-service.guides.spring.io/greeting"
    }).then(function(data) {
       $('.greeting-id').append(data.id);
       $('.greeting-content').append(data.content);
    });
});