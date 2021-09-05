//jshint esversion:6
function toEditMode(x) {

  $("#fn-input").prop("disabled", false);
  $("#ins-input").prop("disabled", false);
  $("#desc-input").prop("disabled", false);

  $("#editButtonDiv").prepend('<button type="button" name="cancel-btn" class="btn btn-danger hero-btn" onclick="location.reload()">Cancel</button>');
  $(x).html("Save");
  $(x).attr("onclick", "saveChange()");
}

function saveChange() {
  $("#profile-form").submit();

}
