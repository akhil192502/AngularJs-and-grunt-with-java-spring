angular.module('common-directives', ['common-services']);
angular.module('common-controllers', ['ngResource','common-services']);
angular.module('common-services', []);
angular.module('common-filters', []);
angular.module('common-app', ['ngResource',
                           'ngRoute',
                           'common-controllers',
                           'common-services',
                           'common-directives',
                           'common-filters',
                           'angularUtils.directives.dirPagination'
                                  ])
                              .config(['$routeProvider','$locationProvider', '$httpProvider', function($routeProvider,$locationProvider, $httpProvider) {
                              	 $routeProvider.
                              	  	when('/', {templateUrl: '/resources/angularjs/common/partials/index.html',   controller: 'ProductController'}).
                              	    when('/about', {templateUrl: '/resources/angularjs/common/partials/about.html',   controller: 'AboutController'}).
                              	    otherwise({redirectTo: '/'});
                              }])
                              .run(['$rootScope', '$location','AuthenticationSharedService','Account',
                                    function($rootScope, $location,AuthenticationSharedService,Account) {
                            	  
                            	    //Get Current Login User
	                    	  		Account.get({},function(data){
	                    	  			$rootScope.user=data;
	                    	  			$rootScope.authenticated = true;
	                    	  		});
                              }]);


'use strict';

var commonControllers = angular.module('common-controllers');


//Product page controller
commonControllers.controller('ProductController', function($scope, $location,$timeout, $window,ProductService) {
	
	//Init Method
	function init(){
		$scope.currentPage=1;
		$scope.product={};
		$scope.selectedCategoty={};
		$scope.categoryList=[{id:1,name:'Mobiles & Tablets'},{id:2,name:'Electronics & Computers'},{id:3,name:'Vehicles'},{id:4,name:'Home & Furniture'}];
		$scope.onClickValidation=false;
		$scope.categoryError=false;
		$scope.productList=[];
		ProductService.fetchAll(function(data){
			$scope.productList=data;
		});
	}
	//Call init Method
	init();
	
	//Method to Submit Form
	$scope.submitForm=function(bol){
		
		$scope.onClickValidation=!bol;
		var isError=false;
		if(!bol){
			isError=true;
		}
		//If Category not selected
		if(angular.equals({},$scope.selectedCategoty)){
			$scope.categoryError=true;
			isError=true;
		}
		
		if(isError){
			return;
		}
		//set category name
		$scope.product.categoryName=$scope.selectedCategoty;
		//save if new category
		if(!angular.isDefined($scope.product.id)){
			//Call api to Save
			ProductService.save($scope.product,function(data){
				init();
			});
		}
		//update if existing category
		else{
			//Call api to update
			ProductService.update($scope.product,function(data){
				init();
			});
		}
		
	}
	
	//remove Product function
	$scope.removeProduct=function(_product){
		//Open confirm popup
		bootbox.dialog({
		  message: "Are your sure to delete Product ?",
		  title: "Confirm Box",
		  buttons: {
		    success: {
		      label: "Yes",
		      className: "btn-success",
		      callback: function() {
		    	//Call remove service
	    		ProductService.remove({id:_product.id},function(data){
	    			init();
	    		});
		      }
		    },
		    danger: {
		      label: "No",
		      className: "btn-danger",
		    },
		  }
		}); 
	};
	
	//Method to edit product
	$scope.editProduct=function(_product){
		
		$scope.product=angular.copy(_product);
		angular.forEach($scope.categoryList,function(value,inde){
			if(value.name==_product.categoryName){
				$scope.selectedCategoty=value.name;
			}
		});
	};
});

//About page controller
commonControllers.controller('AboutController', function($scope, $location,$timeout, $window) {
	
});

'use strict';

var commonDirectives = angular.module('common-directives');

commonDirectives.directive('loginPageDirective',function() {
	return {
		restrict : 'EA',
		templateUrl : "/resources/angularjs/common/directives/templates/login-page-template.html",
		link : function(scope, element, attrs) {
		},
		scope : {},
		controller : function($scope, $timeout,$rootScope,$http) {
			
			$scope.onClickValidate=false;
			$scope.loginForm=false;
			$scope.username="user";
			$scope.password="user";
			
			//Login Submit function
			$scope.loginFunction=function(bol){
				$scope.isError=false;
				$scope.onClickValidate=!bol;
				if(!bol){
					return;
				}
				var data ="j_username=" + $scope.username.toLowerCase() +"&j_password=" + $scope.password +"&_spring_security_remember_me=false&submit=Login";
				$http.post('/app/authentication', data, {
                 // Set Header
                  headers: {
                     // Set Content-Type in header
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    // Set ignoreAuthModule
                    ignoreAuthModule: 'ignoreAuthModule'
                })
                // Success Function
                .success(function (data, status, headers, config) {
                	window.location.href="/user";
                })
                //Error Function 
                .error(function (data, status, headers, config) {
                	$scope.data="Please use user as username and password for testing.";
                	$scope.isError=true;
                	$timeout(function(){
                		$scope.isError=false;
                	},5000);
                });
			};
		}
	};
});
commonDirectives.directive('navBarDirective',function() {
	return {
		restrict : 'EA',
		templateUrl : "/resources/angularjs/common/directives/templates/nav-bar-template.html",
		link : function(scope, element, attrs) {
		},
		scope : {},
		controller : function($scope, $timeout,$rootScope,$http,AuthenticationSharedService) {
			//Method to logout
			$scope.logoutFunction=function(){
				AuthenticationSharedService.logout();
			};
		}
	};
});




'use strict';
var commonFilters = angular.module('common-filters');
'use strict';

var commonServices = angular.module('common-services');

commonServices.factory('AuthenticationSharedService', [ '$rootScope', '$http', function($rootScope, $http) {
		return {
			// GET:- Check authenticate Method
			authenticate : function() {
				// get Call to check authenticate
				$http.get('/api/user/authenticate')
				// Success function
				.success(function(data, status, headers, config) {
					$rootScope.data = data;
					// if Data is Empty
					if (data.username == '') {
						// call when authenticate Need
						$rootScope.$broadcast('event:auth-loginRequired');
					} else {
						// call when authenticate is Not Need
						$rootScope.$broadcast('event:auth-authConfirmed');
					}
				});
			},
			logout: function () {
                $http.get('/app/logout')
                .success(function(data, status, headers, config) {
                	window.location.href="/";
				});
            }
		};
	} ]);
commonServices.factory('Account',function($resource){		
	return $resource('/api/user/account', {},{
		'get': {method:'GET', params:{}, isArray:false},
	});
});

/*Product Service*/
commonServices.factory('ProductService',function($resource){		
	return $resource('/api/product/:id', {id:'@id'},{
		'fetchAll': {method:'GET', params:{}, isArray:true},
		'fetch': {method:'GET', params:{}, isArray:false},
		'save': {method:'POST', params:{}, isArray:false},
		'update': {method:'PUT', params:{}, isArray:false},
		'remove': {method:'DELETE', params:{}, isArray:false},
	});
});

