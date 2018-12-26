/**
 * Created by jxl on 2018/12/25.
 */
$(function(){
  $('#zhuanchu').on('click',function(){
    $('.msgSelect').css('display','block');
  })
  $('.selectUser').on('click',function(){
    $('.msgSelect').css('display','none');
    $('#zhuanchu').val($(this).data('num'));
    $('#name').text($(this).data('name'));
    $('#amt').text($(this).data('amt'));
  })
  // $('#zhuanchu').on('change',function(){
  // })
})