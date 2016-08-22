$(document).ready(function(){
	var loggedInUser;
	var registerUser = function(user){
		return $.ajax({
			method:"POST",
			url:"/api/users",
			data: JSON.stringify(user),
			contentType: "application/json"
		})
	}
	
	var loginUser = function(user){
		return $.ajax({
			method:"POST",
			url:"/api/login",
			data: JSON.stringify(user),
			contentType: "application/json"
		})
	}
	
	var getStatus = function(){
		return $.ajax({
			method:"POST",
			url:"/api/status",
			contentType: "application/json"
		})
	}
	
	var loadlists = function(){
		return $.ajax({
			method:"GET",
			url:"/api/lists"
		})
	}
	
	var createlist = function(list){
		return $.ajax({
			method:"POST",
			url:"/api/lists",
			data: JSON.stringify(list),
			contentType: "application/json"
		})
	}
	
	var addtasktolist = function(data, task){
		data.items.push(task)
		var list = {
			_id:data._id,
			items:data.items
		}
		return $.ajax({
			method:"PUT",
			url:"/api/lists/"+list._id,
			data: JSON.stringify(list),
			contentType: "application/json"
		})
	}
	
	
	var updateItemInList = function(data, task){
		data.items = data.items.map(function(item){
		if(task.name===item.name){
				item = task
			}
			return item
		})
		var list = {
			_id:data._id,
			items:data.items
		}
		return $.ajax({
			method:"PUT",
			url:"/api/lists/"+list._id,
			data: JSON.stringify(list),
			contentType: "application/json"
		})
	}
	
		var removeItemFromList = function(data, task){
		data.items = data.items.filter(function(item){
		if(task.name===item.name){
				return false
			}
				return true
		})
		var list = {
			_id:data._id,
			items:data.items
		}
		return $.ajax({
			method:"PUT",
			url:"/api/lists/"+list._id,
			data: JSON.stringify(list),
			contentType: "application/json"
		})
	}
	
	
	
	var removelist = function(listId){
		return $.ajax({
			method:"DELETE",
			url:"/api/lists/"+listId,
			contentType: "application/json"
		})
	}
	
	
	$('.fa-bars').on('click',function() {
		if($('.list-menu').css('left')=='0px') {
			$('.list-menu').animate({left:'-100%'});
		}
		else {	
			$('.list-menu').animate({left:0});
		}
	});

		//prompting user for list name
	$('.fa-plus-square-o').on('click', function () {
			showCreateForm()
			
	});
	
	$('.newlist form').on('submit',function(event){
		event.preventDefault()
		var name = $(this).find('.input-text').val()
		if (name) {
				createlist({
					title: name,
					items: []
				}).then(function(response){
					hideCreateForm()
					addList(response, true)
				});
			}
	})
		
		//switching between list items in side bar
	$('.list-menu').on('click', 'a', function () {
			var listId = $(this).attr('data-list');
			$('.lists').find('[data-list]').hide();
			var $list = $('.lists').find('[data-list=' + listId + ']');
			$list.show();
			$('.list-menu').animate({left:'-100%'});

	});
	
		$('.lists').on('click', '.delete-list', function (event) {
			if(confirm("Are you sure you want to delete this list?")){
				var listId = $(event.target).parents(".item-list").attr('data-list');
				$('.lists').empty();
				$(".list-menu ul").empty()
				removelist(listId).then(function(){
					loadlists().then(function(response){
						response.forEach(function(list){
							addList(list)
						});
					});
				})
			}
		
	});

	$('.cancel-button').on('click', hideCreateForm)

	$.fn.todoList = function(options){
		return this.each(function(){

			var defaults = {
				title: 'To Do',
				template: '<form class="form-group">\
						<h2>{title} <i class="fa fa-trash-o delete-list" aria-hidden="true"></i></h2>\
							<hr>\
							<div class="submit-wrapper">\
							<input type="text" name="list-input" class="input-text" placeholder="Add something!">\
								<button class="submit-button">Add item to list</button>\
							</div>\
							</form>\
							<ul class="list">\
							<!-- check box and list items -->\
							</ul>'

			};

			var config = $.extend({}, defaults, options);

			var $el = $(this);
			$el.html(config.template.replace('{title}',config.title));
				config.items.forEach(rendertask)
				
			$el.find('.form-group').submit(function(event){
				event.preventDefault();
				var task = {
					name: $el.find('.input-text').val(),
					completed: false
				}
				// if user inputs nothing and hits enter, alert will pop up and nothing is appended
				if (task.name === "") {
				alert('Please enter an item!')
				}
				else {
					addtasktolist(config, task).then(function(list){
						updateList(list)
					});
				
					$el.find('.input-text').val("");
				}
			});

			$el.find('.list').on('click', 'li', function(event){
				var $target = $(event.target)
				if($target.hasClass("fa-trash-o")){
					$target.parents("li").remove();
					var task = {
						name: $.trim($target.parents("li").text())
					}
					removeItemFromList(config, task).then(function(list){
						updateList(list)
					});
					return
				}
				else if(event.target.nodeName === "INPUT"){
					console.log(event.target.checked)
					var task = {
						name: $.trim($target.parents("li").text()),
						completed: event.target.checked
					}
					updateItemInList(config, task).then(function(list){
						updateList(list)
					});
				}
				console.log(event)
			});
			
			function addtask(task){
				config.items.push(task)
				rendertask(task)
			}
			
			function rendertask(task){
				$el.find('.list').append("<li class ='currentItem'><label class='checkmark'><input type='checkbox' class='is-completed' "+ (task.completed ? "checked" : "") +"><span class='check-icon'></span><span class= 'item-name'>" + " " + task.name + " " +  "</span></label><i class='fa fa-trash-o' aria-hidden='true'></i></li>")

			}
		});	

	};

	function addList(list, showlist) {
		var listId = list._id;
		var $el = $('<div>', { class: 'item-list', 'data-list': listId });
		$el.todoList(list);
		var $menuItem = $('<li>').append(
			$('<a href="#">' + list.title + '</a>').attr('data-list', listId)
		);
		$('.list-menu ul').append($menuItem);
		$('.lists').append($el);
		if(showlist){
			$el.show()
		}
		
		return $el;
	}
	
	function updateList(list){
		var listId = list._id;
		var $oldel = $(".item-list[data-list="+listId+"]")
		var $el = $('<div>', { class: 'item-list', 'data-list': listId });
		$el.todoList(list);
		$oldel.replaceWith($el)
		$el.show()
	}

	//initialize
		//addList('Shopping List').show();
	var showCreateForm = function(){
		$('.item-list').hide()
		$('.newlist').show().find('.input-text').focus()
	}
	
	function hideCreateForm(){
		$('.newlist').hide().find('.input-text').val("")
	}
	
	function init(user){
		loggedInUser = user
		loadlists().then(function(response){
			showUserBar(user)
			showCreateButton()
			response.forEach(function(list){
				addList(list)
			});
		});
	}
	
	$(".register-link").on('click', function(event){
		event.preventDefault()
		hideLoginForm()
		showRegisterForm()
	})
	
	$(".login-link").on("click", function(event){
		event.preventDefault()
		hideRegisterForm()
		showLoginForm()
	})
	
	$('.register-form').on('submit', function(event) {
	    event.preventDefault()
	    var $form = $(this)
	    var user = {
	    	username: $form.find('[name = email]').val(),
	    	password: $form.find('[name = password]').val(),
	    	passwordconfirmation: $form.find('[name = passwordconfirmation]').val()
	    }
	    console.log(user)
	    if (user.password != user.passwordconfirmation){
	    	alert('Passwords do not match!')
			return
	    }
	    registerUser(user).then(function(){
	    	hideRegisterForm()
	    	init(user)
	    }, function(response){
	    	alert(response.responseJSON.message)
	    })
	})
	
	function showRegisterForm(){
		$('.register-form').show()
	}
	
	function hideRegisterForm(){
		$('.register-form').hide().get(0).reset()
	}
	
	function showLoginForm(){
		$('.login-form').show()
	}
	
	function hideLoginForm(){
		$('.login-form').hide().get(0).reset()
	}
	
	$('.login-form').on('submit', function(event) {
	    event.preventDefault()
	    var $form = $(this)
	    var user = {
	    	username: $form.find('[name = email]').val(),
	    	password: $form.find('[name = password]').val(),
	    }
	    loginUser(user).then(function(){
	    	hideLoginForm()
	    	init(user)
	    })
	})
	
	var showUserBar = function(user){
		$(".user-bar").show().find(".username").text(user.username)
	}
	
	var hideUserBar = function(){
		$(".user-bar").hide().find(".username").text("")
	}
	
	var showCreateButton = function(){
		$(".fa-plus-square-o").show()
	}
	
	var hideCreateButton = function(){
		$(".fa-plus-square-o").hide()
	}
	
	getStatus().then(function(user){
		if(user){
			loggedInUser = user
			init(user)
		}
		else{
			showLoginForm()
		}
	})
}); //doc.ready