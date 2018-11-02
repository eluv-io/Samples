
angular.module("App",['main']);

angular.module("main",[]);

angular.module("main").controller("mainController",function($scope){
    var url = getParameterByName('source');
    var type =  getParameterByName('type');
    $scope.isEditing = false;
    $scope.edit = function() {
        $scope.isEditing = true;
    };
    $scope.cancel = function() {
        $scope.isEditing = false;
    };

    $scope.hideAd = hideAd;
    $scope.setAd = setAd;
    hideAd();
});


var ad = document.getElementById("ad");
var adContainer = document.getElementById("ad-container");

function setAd(imageUrl, clickUrl){
  ad.innerHTML = '<a href="' + clickUrl + '" target="_blank"><img id="adimg" src="' + imageUrl+ '"></a>';
  adContainer.style.display = "block";
}

function hideAd(){
  adContainer.style.display = "none";
}

function adClick(){
  logEvent(e, "ADCLICKED");
}
