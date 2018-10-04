// for Players page
function getPlayers (){
   $('#playerList').empty().append('empty');
	$.ajax({
		type: 'POST',
		url: '/api/getplayers',
      data: {
         'position': $('#positionList').val(),
      },
      success:function(retData){
			$.each(retData, function(i,player){
				$('#playerList').append('<option value="'+player+'">'+player+'</option>');
			});
		},
		error: function(retData){
			alert(retData.type,retData.message);
		}
	});
}
