const $iptClassAssignTeacher = $("#ipt-class-assign-teacher");
const $classAssignTeacherModal = $("#class-assign-teacher-modal");
const $classAssignTeacherModalBtn = $(".assign_teacher_modal__button");

const showAssignTeacherModal = function () {
  const classId = $(this).attr("data-classId");
  $iptClassAssignTeacher.val(classId);
  $classAssignTeacherModal.modal("show");
};

$(function () {
  $classAssignTeacherModalBtn.on("click", showAssignTeacherModal);
});
