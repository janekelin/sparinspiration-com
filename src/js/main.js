window.addEventListener("load", function(){
	var nodes = document.querySelectorAll("#mainNav a");
	for(var i=0; i<nodes.length; i++){
		nodes[i].addEventListener("click", function(){
			document.querySelector(".portrait").setAttribute("src", this.getAttribute("data-img-src-ref"));
		});
	}
});