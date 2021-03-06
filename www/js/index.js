/**
 * Copyright 2014 Kinvey, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Common app functionality will be attached to the `app` namespace.
 */
var app = {
  /**
   * Application constructor.
   */
  initialize: function() {
    this.bindEvents();
  },

  /**
   * Bind event listeners.
   */
  bindEvents: function() {
    // Bind any events that are required on startup. Common events are: `load`,
    // `deviceready`, `offline`, and `online`.
    document.addEventListener('deviceready', app.onDeviceReady, false);   
    // On/offline hooks.
    document.addEventListener('offline', Kinvey.Sync.offline);
    document.addEventListener('online', function() {
    	  //var promise = Kinvey.Sync.execute();
    	  $("#statuslabel").html("loading");
      Kinvey.Sync.online().then(function() {
    	  $("#statuslabel").html("online");
      }, function(error) {
    	  $("#statuslabel").html("error");
      });
    });
  },

  /**
   * The deviceready event handler.
   */
  onDeviceReady: function() {
    // Initialize push.
    push.initialize();
    
    // Initialize Kinvey. Paste your app key and secret below.
    var promise = Kinvey.init({
      appKey    : 'kid_Z1jSBhbMP',
      appSecret : 'fd0dcfe909224249bc19a013b1dcf79f',
      sync      : {
          enable : true
//          online : navigator.onLine// The initial application state.
      }
    });
    
    promise.then(function(activeUser) {
      // The `Kinvey.init` function returns a promise which resolves to the
      // active user data. If there is no active user, create one.
      if(null === activeUser) {
        return Kinvey.User.signup();
      }
      return activeUser;
    }).then(null, function(error) {
    	$("#statuslabel").html("activeUsererror");
    });
    
    // Add propositions.
    function addpropositions(data){
	$("#statuslabel").html("adding propositions");
 	$.each(data, function( i, value ) {
 		var dat = { };
 		dat["_id"] = data[i].id;
 		dat["label"] = data[i].label;
 	    Kinvey.DataStore.save('propositions', dat, {offline : true, refresh : true}).then(function() {
 	    	$("#statuslabel").html("add propositions success");
 	    }, function(error) {
 	    	$("#statuslabel").html("add propositions error");
 	    });
 	});
 	getpropositions();
    }
    
    //Get propositions from local or network
    function getpropositions(){
    	$("#statuslabel").html("loading");
    	var query = new Kinvey.Query();
        Kinvey.DataStore.find('propositions',query,{offline : true, refresh : true}).then(function(propositions) {
        	$.each(propositions, function( i, value ) {
        		$("#datawithkinvey").append("<br>"+value.label);
        	});
            $("#statuslabel").html("get propositions success");
          }, function(error) {
        	$("#statuslabel").html("get propositions error");
          });
    }

	  $("#getdata").click(function(){
	    	//Clear the content of both 2 areas
			$("#datawithkinvey").empty();
			$("#datawithoutkinvey").empty();
			//Use normal ajax to load data
	        $.ajax({
	            dataType: "json",
	            url: "https://khajour-test.apigee.net/interactionpropose_vin_dev/propose?sessiontoken=fullsix%2Ffullsix&targetId=VF1JMSE0641295422%7CFRA&maxCount=3",
	            success: function(msg){
	                var data = msg.ProposeResponse.propositions.propositions.proposition;
	            	$.each(data, function( i, value ) {
	 	            	//Show proposition info
	            		$("#datawithoutkinvey").append("<br>"+data[i].label);
	            	});
	            	addpropositions(data);
	            },
	          error: function (XMLHttpRequest, textStatus, errorThrown) { 
	        	  //Call method to get data
	   	    	  getpropositions();
	   	    	  $("#statuslabel").html("Please check your network connection!");
	         	}
	      });
		  });
	  
	  
  },
};