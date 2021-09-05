var dayOfWeek = {"Monday":1,"Tuesday":2,"Wednesday":3,"Thursday":4,"Friday":5,"Saturday":6,"Sunday":0};

$(".subject-select").click(function(){
  if ($("#dayForm").val() != "") {
    day = dayOfWeek[$("#dayForm").val()];
  } else {
    day = "";
  }

  name = $("#nameForm").val();
  location.href="/find?subject="+$(this).html()+"&day="+day+"&name="+name;
});

$(".day-select").click(function(){
  day = dayOfWeek[$(this).html()];
  subject = $("#subjectForm").val();
  name = $("#nameForm").val();
  location.href="/find?subject="+subject+"&day="+day+"&name="+name;
});

$("#button-addon2").click(function(){
  if ($("#dayForm").val() != "") {
    day = dayOfWeek[$("#dayForm").val()];
  } else {
    day = "";
  }
  subject = $("#subjectForm").val();
  name = $("#nameForm").val();
  location.href="/find?subject="+subject+"&day="+day+"&name="+name;
});
